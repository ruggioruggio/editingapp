"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Film, Monitor, Share2 } from "lucide-react";
import type { ExportSettings } from "@/lib/lessons/types";
import { P, PButton, PNumber, PSelect, Row } from "./controls";

const FORMATS = ["H.264", "HEVC (H.265)", "QuickTime", "MPEG2", "AAC Audio", "GIF animata", "Sequenza PNG"] as const;
const FPS = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60] as const;
const ENCODINGS = ["CBR", "VBR, 1 passaggio", "VBR, 2 passaggi"] as const;
const AUDIO_KBPS = [128, 160, 192, 256, 320] as const;

interface Preset {
  name: string;
  format: (typeof FORMATS)[number];
  width?: number;
  height?: number;
  fps?: number;
  bitrateMbps: number;
  audioKbps: number;
}

const PRESETS: Preset[] = [
  { name: "Corrispondenza sorgente - Bitrate elevato", format: "H.264", bitrateMbps: 10, audioKbps: 320 },
  { name: "Corrispondenza sorgente - Bitrate adattivo alto", format: "H.264", bitrateMbps: 8, audioKbps: 320 },
  { name: "Alta qualità 1080p HD", format: "H.264", width: 1920, height: 1080, bitrateMbps: 20, audioKbps: 320 },
  { name: "YouTube 1080p Full HD", format: "H.264", width: 1920, height: 1080, bitrateMbps: 16, audioKbps: 320 },
  { name: "YouTube 2160p 4K Ultra HD", format: "H.264", width: 3840, height: 2160, bitrateMbps: 40, audioKbps: 320 },
  { name: "Social verticale 1080×1920", format: "H.264", width: 1080, height: 1920, bitrateMbps: 12, audioKbps: 256 },
];

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#3a3a3a]">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-1 py-2 text-left text-[13px] font-semibold text-[#e6e6e6]">
        <ChevronDown size={14} className={clsx("transition-transform", !open && "-rotate-90")} />
        {title}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function ExportDialog({
  source,
  onExport,
  onCancel,
  error,
  fileName = "Sequenza 01",
}: {
  source: { width: number; height: number; fps: number; seconds: number };
  onExport: (s: ExportSettings) => boolean;
  onCancel?: () => void;
  error?: string | null;
  fileName?: string;
}) {
  const [presetName, setPresetName] = useState(PRESETS[0].name);
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("H.264");
  const [matchSource, setMatchSource] = useState(true);
  const [width, setWidth] = useState(source.width);
  const [height, setHeight] = useState(source.height);
  const [fps, setFps] = useState<number>(source.fps);
  const [encoding, setEncoding] = useState<(typeof ENCODINGS)[number]>("VBR, 1 passaggio");
  const [bitrate, setBitrate] = useState(10);
  const [audioKbps, setAudioKbps] = useState<number>(320);
  const [name, setName] = useState(fileName);
  const [progress, setProgress] = useState<number | null>(null);

  const applyPreset = (n: string) => {
    const p = PRESETS.find((x) => x.name === n);
    setPresetName(n);
    if (!p) return;
    setFormat(p.format);
    setBitrate(p.bitrateMbps);
    setAudioKbps(p.audioKbps);
    setMatchSource(!p.width);
    setWidth(p.width ?? source.width);
    setHeight(p.height ?? source.height);
    setFps(p.fps ?? source.fps);
  };
  const customize = () => setPresetName("Personalizzato");

  const outW = matchSource ? source.width : width;
  const outH = matchSource ? source.height : height;
  const outFps = matchSource ? source.fps : fps;
  const sizeMb = ((bitrate + audioKbps / 1000) * source.seconds) / 8;

  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const id = setTimeout(() => setProgress((p) => Math.min(100, (p ?? 0) + 7)), 70);
    return () => clearTimeout(id);
  }, [progress]);

  const start = () => {
    const ok = onExport({ format, width: outW, height: outH, fps: outFps, bitrateMbps: bitrate, audioKbps });
    if (ok) setProgress(0);
  };

  return (
    <div className={clsx(P.panel, "flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-lg border border-[#111] shadow-[0_20px_60px_rgb(0_0_0/0.6)]")}>
      {/* barra superiore delle modalità di Premiere */}
      <div className="flex h-10 items-center gap-6 border-b border-[#111] bg-[#1d1d1d] px-4 text-[13px]">
        <span className="text-[#9a9a9a]">Importa</span>
        <span className="text-[#9a9a9a]">Modifica</span>
        <span className="border-b-2 border-[#2680eb] pb-2 pt-2.5 font-semibold text-white">Esporta</span>
        <span className="ml-auto truncate text-[12px] text-[#9a9a9a]">{name}</span>
      </div>

      <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[180px_1fr_280px]">
        <aside className="border-b border-r border-[#3a3a3a] p-3 md:border-b-0">
          <p className={clsx(P.label, "mb-2")}>Destinazioni</p>
          <div className="flex items-center gap-2 rounded bg-[#2680eb]/20 px-2 py-1.5 text-[12px] text-white">
            <Film size={14} /> File multimediale
          </div>
          {["YouTube", "Vimeo", "TikTok", "Behance"].map((d) => (
            <div key={d} className="mt-1 flex items-center gap-2 px-2 py-1.5 text-[12px] text-[#9a9a9a]">
              <Share2 size={14} /> {d}
            </div>
          ))}
        </aside>

        <section className="min-w-0 border-b border-r border-[#3a3a3a] px-4 py-3 md:border-b-0">
          <p className="mb-2 text-[13px] font-semibold text-white">File multimediale</p>
          <Row label="Predefinito:">
            <PSelect value={presetName} options={[...PRESETS.map((p) => p.name), "Personalizzato"]} onChange={applyPreset} className="w-full max-w-xs" />
          </Row>
          <Row label="Formato:">
            <PSelect value={format} options={FORMATS} onChange={(f) => (setFormat(f), customize())} className="w-48" />
          </Row>
          <Row label="Nome file:">
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className={clsx(P.field, "w-full max-w-xs")} />
          </Row>
          <Row label="Posizione:">
            <span className="truncate text-[12px] text-[#2d8ceb]">Documenti/SqueakEdit/Export</span>
          </Row>

          <Section title="Video">
            <div className="mb-2">
              <button
                type="button"
                onClick={() => (setMatchSource(true), customize())}
                className={clsx("rounded-full border px-3 py-1 text-[12px]", matchSource ? "border-[#2680eb] bg-[#2680eb]/20 text-white" : "border-[#5a5a5a] text-[#c8c8c8]")}
              >
                Corrispondenza sorgente
              </button>
            </div>
            <Row label="Dimensione fotogramma:">
              <PNumber value={outW} onChange={(v) => (setMatchSource(false), setWidth(v), customize())} min={16} max={8192} />
              <span className={P.label}>×</span>
              <PNumber value={outH} onChange={(v) => (setMatchSource(false), setHeight(v), customize())} min={16} max={8192} />
            </Row>
            <Row label="Frequenza fotogrammi:">
              <PSelect value={outFps} options={FPS} format={(f) => String(f).replace(".", ",")} onChange={(f) => (setMatchSource(false), setFps(f), customize())} className="w-28" />
            </Row>
            <Row label="Ordine campi:">
              <span className="text-[12px] text-[#e0e0e0]">Progressivo</span>
            </Row>
            <Row label="Profilo:">
              <span className="text-[12px] text-[#e0e0e0]">Alto</span>
            </Row>
          </Section>

          <Section title="Impostazioni bitrate">
            <Row label="Codifica bitrate:">
              <PSelect value={encoding} options={ENCODINGS} onChange={(v) => (setEncoding(v), customize())} className="w-48" />
            </Row>
            <Row label="Bitrate target [Mbps]:">
              <input
                type="range"
                min={1}
                max={80}
                value={bitrate}
                onChange={(e) => (setBitrate(Number(e.target.value)), customize())}
                className="w-40 accent-[#2680eb]"
              />
              <span className="w-10 text-[12px] tabular-nums text-[#2d8ceb]">{bitrate}</span>
            </Row>
          </Section>

          <Section title="Audio">
            <Row label="Formato audio:">
              <span className="text-[12px] text-[#e0e0e0]">AAC</span>
            </Row>
            <Row label="Frequenza campionamento:">
              <span className="text-[12px] text-[#e0e0e0]">48000 Hz</span>
            </Row>
            <Row label="Canali:">
              <span className="text-[12px] text-[#e0e0e0]">Stereo</span>
            </Row>
            <Row label="Bitrate audio:">
              <PSelect value={audioKbps} options={AUDIO_KBPS} format={(k) => `${k} kbps`} onChange={(v) => (setAudioKbps(v), customize())} className="w-28" />
            </Row>
          </Section>
        </section>

        <aside className="space-y-3 p-3">
          <div className="grid aspect-video place-items-center rounded bg-black">
            <Monitor size={28} className="text-[#3a3a3a]" />
          </div>
          <Row label="Intervallo:">
            <span className="text-[12px] text-[#e0e0e0]">Sequenza completa</span>
          </Row>
          <div className="rounded-[4px] border border-[#3a3a3a] p-2 text-[12px] leading-relaxed">
            <p className="font-semibold text-white">Riepilogo</p>
            <p>
              Output: {outW}×{outH} ({(outW / outH).toFixed(2).replace(".", ",")}), {String(outFps).replace(".", ",")} fps
            </p>
            <p>
              {format}, {encoding}, {bitrate} Mbps
            </p>
            <p>AAC, {audioKbps} kbps, 48 kHz, Stereo</p>
            <p className="mt-1 text-[#9a9a9a]">
              Origine: {source.width}×{source.height}, {String(source.fps).replace(".", ",")} fps
            </p>
            <p className="mt-1">Dimensione file stimata: {sizeMb.toFixed(0)} MB</p>
          </div>
        </aside>
      </div>

      <div className="space-y-2 border-t border-[#111] bg-[#2b2b2b] px-4 py-3">
        {error && <p className="rounded-[4px] border border-[#d7373f]/60 bg-[#d7373f]/15 px-2 py-1.5 text-[12px] text-[#ff9a9a]">{error}</p>}
        {progress !== null && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1b1b1b]">
              <div className="h-full bg-[#2680eb] transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[12px] text-[#c8c8c8]">{progress >= 100 ? "Esportazione completata." : `Codifica in corso… ${progress}%`}</p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {onCancel && <PButton onClick={onCancel}>Chiudi</PButton>}
          <PButton primary onClick={start} disabled={progress !== null && progress < 100}>
            Esporta
          </PButton>
        </div>
      </div>
    </div>
  );
}
