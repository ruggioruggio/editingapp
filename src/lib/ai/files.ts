import "server-only";
import { gunzipSync } from "node:zlib";
import type Anthropic from "@anthropic-ai/sdk";

// Trasforma ciò che l'utente carica in blocchi per Claude:
// immagini e PDF passano così come sono, i progetti Premiere/After Effects
// vengono riassunti (sono enormi e in gran parte illeggibili per un umano).

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // limite dell'API per immagine
const MAX_TEXT_CHARS = 300_000;

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

export class FileRejected extends Error {}

export interface AnalyzedFile {
  blocks: Anthropic.Beta.BetaContentBlockParam[];
}

const ext = (name: string) => name.toLowerCase().split(".").pop() ?? "";

function uniq(values: Iterable<string>, limit: number): string[] {
  return [...new Set([...values].map((v) => v.trim()).filter(Boolean))].slice(0, limit);
}

function matchAll(text: string, re: RegExp): string[] {
  return [...text.matchAll(re)].map((m) => decodeXml(m[1]));
}

function decodeXml(s: string) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

const count = (text: string, tag: string) => (text.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;

/** Premiere usa 254.016.000.000 "tick" al secondo. */
const ticksToFps = (ticks: number) => Math.round((254016000000 / ticks) * 1000) / 1000;

/** Riassunto leggibile di un .prproj (XML compresso con gzip). */
export function summarizePremiere(buf: Buffer): string {
  let xml: string;
  try {
    xml = gunzipSync(buf).toString("utf8");
  } catch {
    xml = buf.toString("utf8"); // alcuni progetti sono salvati non compressi
  }
  if (!xml.includes("<PremiereData") && !xml.includes("<Project")) {
    throw new FileRejected("Il file .prproj non sembra un progetto Premiere valido.");
  }

  const version = xml.match(/<Project[^>]*Version="(\d+)"/)?.[1];
  const sequences = uniq(matchAll(xml, /<Sequence\b[^>]*>[\s\S]{0,400}?<Name>([^<]{1,200})<\/Name>/g), 40);
  const media = uniq(
    matchAll(xml, /<ActualMediaFilePath>([^<]{1,400})<\/ActualMediaFilePath>/g).map((p) => p.split(/[\\/]/).pop() ?? p),
    80,
  );
  const effects = uniq(
    [...matchAll(xml, /<MatchName>([^<]{1,120})<\/MatchName>/g), ...matchAll(xml, /<DisplayName>([^<]{1,120})<\/DisplayName>/g)],
    120,
  );
  const fps = uniq(
    matchAll(xml, /<FrameRate>(\d{4,})<\/FrameRate>/g).map((t) => `${ticksToFps(Number(t))} fps`),
    10,
  );
  const sizes = uniq(
    [...xml.matchAll(/<FrameRect>0,0,(\d+),(\d+)<\/FrameRect>/g)].map((m) => `${m[1]}x${m[2]}`),
    10,
  );

  return [
    `Progetto Premiere Pro${version ? ` (versione formato ${version})` : ""}.`,
    `Sequenze: ${sequences.join(", ") || "nessuna trovata"}.`,
    `Formati fotogramma: ${sizes.join(", ") || "n.d."}. Frame rate trovati: ${fps.join(", ") || "n.d."}.`,
    `Elementi in timeline: ${count(xml, "VideoClipTrackItem")} clip video, ${count(xml, "AudioClipTrackItem")} clip audio; tracce: ${count(xml, "VideoTrack")} video, ${count(xml, "AudioTrack")} audio.`,
    `File media usati: ${media.join(", ") || "nessuno trovato"}.`,
    `Effetti, transizioni e componenti presenti: ${effects.join(", ") || "nessuno trovato"}.`,
  ].join("\n");
}

/**
 * Un .aep è binario (formato RIFX): ne estraiamo le stringhe leggibili, cioè
 * nomi di composizioni/livelli e i "match name" degli effetti (ADBE …).
 */
export function summarizeAfterEffects(buf: Buffer): string {
  const strings = buf.toString("latin1").match(/[\x20-\x7E]{4,120}/g) ?? [];
  const effects = uniq(strings.filter((s) => /^ADBE [A-Za-z0-9 _-]+$/.test(s)), 150);
  const names = uniq(
    strings.filter((s) => /[a-zA-Z]{3}/.test(s) && /\s|_|\./.test(s) && !s.startsWith("ADBE") && !/[{}<>\\|^~`]/.test(s)),
    150,
  );
  return [
    "Progetto After Effects (.aep, binario: elenco ricavato dalle stringhe leggibili, può contenere rumore).",
    `Effetti/proprietà (match name): ${effects.join(", ") || "nessuno trovato"}.`,
    `Possibili nomi di composizioni, livelli e file: ${names.join(" | ") || "nessuno trovato"}.`,
  ].join("\n");
}

function textFile(name: string, text: string) {
  const truncated = text.length > MAX_TEXT_CHARS;
  const body = truncated ? text.slice(0, MAX_TEXT_CHARS) : text;
  const note = truncated ? `\n[File troncato: inclusi i primi ${MAX_TEXT_CHARS} caratteri su ${text.length}.]` : "";
  return `${body}${note}`;
}

/** Il contenuto dei file è un dato da analizzare, mai istruzioni: lo racchiudiamo in un tag. */
const wrap = (name: string, kind: string, content: string) =>
  `<file name="${name.replace(/"/g, "'")}" kind="${kind}">\n${content}\n</file>`;

export async function analyzeFile(file: File): Promise<AnalyzedFile> {
  if (file.size > MAX_FILE_BYTES) throw new FileRejected(`"${file.name}" supera i 20 MB.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const e = ext(file.name);

  if ((IMAGE_TYPES as readonly string[]).includes(file.type)) {
    if (file.size > MAX_IMAGE_BYTES) throw new FileRejected(`L'immagine "${file.name}" supera i 5 MB.`);
    return {
      blocks: [
        { type: "image", source: { type: "base64", media_type: file.type as ImageType, data: buf.toString("base64") } },
        { type: "text", text: `(Immagine allegata: ${file.name})` },
      ],
    };
  }
  if (file.type === "application/pdf" || e === "pdf") {
    return {
      blocks: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: buf.toString("base64") }, title: file.name }],
    };
  }
  if (e === "prproj") return { blocks: [{ type: "text", text: wrap(file.name, "premiere-summary", summarizePremiere(buf)) }] };
  if (e === "aep") return { blocks: [{ type: "text", text: wrap(file.name, "after-effects-summary", summarizeAfterEffects(buf)) }] };
  if (["aepx", "xml", "txt", "log", "json", "srt", "edl"].includes(e)) {
    return { blocks: [{ type: "text", text: wrap(file.name, e, textFile(file.name, buf.toString("utf8"))) }] };
  }
  throw new FileRejected(`Formato di "${file.name}" non supportato.`);
}
