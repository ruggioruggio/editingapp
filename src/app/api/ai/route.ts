import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { getLesson } from "@/content/lessons";
import { isPracticeId } from "@/content/practice";
import { analyzeFile, FileRejected, MAX_FILES } from "@/lib/ai/files";
import { PRACTICE_TOOL, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import type { AiStreamEvent, AiHistoryItem } from "@/lib/ai/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = "claude-opus-5-5";
const MAX_QUESTION_CHARS = 4000;
const MAX_HISTORY = 30;

// Limite semplice per istanza: 20 richieste ogni 10 minuti per utente.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const hits = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > RATE_MAX;
}

const fail = (status: number, message: string) => NextResponse.json({ error: message }, { status });

/** Squeak AI è una funzione Pro: il piano si legge dal database, mai dal client. */
async function checkAccess(): Promise<{ key: string } | NextResponse> {
  if (process.env.SQUEAK_AI_DEV_UNLOCK === "true") return { key: "dev" };
  if (!isSupabaseConfigured) return fail(403, "Squeak AI richiede un account Pro.");

  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return fail(401, "Accedi per usare Squeak AI.");
  const { data: profile } = await sb.from("profiles").select("plan").eq("id", user.id).maybeSingle<{ plan: string }>();
  if (profile?.plan !== "pro") return fail(402, "Squeak AI è incluso nel piano Pro.");
  return { key: user.id };
}

function parseHistory(raw: FormDataEntryValue | null): Anthropic.Beta.BetaMessageParam[] {
  if (typeof raw !== "string") return [];
  let items: AiHistoryItem[];
  try {
    items = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(items)) return [];
  const messages = items
    .slice(-MAX_HISTORY)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.role, content: m.text.slice(0, 8000) }));
  // la conversazione deve iniziare con l'utente
  while (messages[0]?.role === "assistant") messages.shift();
  return messages;
}

function errorMessage(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "Squeak AI non è configurato: manca una chiave API valida.";
  if (err instanceof Anthropic.RateLimitError) return "Squeak AI è molto richiesto in questo momento: riprova tra poco.";
  if (err instanceof Anthropic.BadRequestError) return "Non riesco a leggere questa richiesta. Prova con file più piccoli o meno allegati.";
  if (err instanceof Anthropic.APIError) return "Squeak AI non risponde, riprova tra qualche secondo.";
  // errori dell'SDK prima della chiamata, tipicamente credenziali assenti
  if (err instanceof Anthropic.AnthropicError) return "Squeak AI non è configurato: manca la chiave API sul server.";
  return "Qualcosa è andato storto. Riprova.";
}

export async function POST(request: NextRequest) {
  const access = await checkAccess();
  if (access instanceof NextResponse) return access;
  if (rateLimited(access.key)) return fail(429, "Hai fatto molte domande di fila: riprova tra qualche minuto.");

  const form = await request.formData();
  const question = String(form.get("question") ?? "").trim().slice(0, MAX_QUESTION_CHARS);
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!question && files.length === 0) return fail(400, "Scrivi una domanda o allega un file.");
  if (files.length > MAX_FILES) return fail(400, `Puoi allegare al massimo ${MAX_FILES} file.`);

  const fileBlocks: Anthropic.Beta.BetaContentBlockParam[] = [];
  try {
    for (const file of files) fileBlocks.push(...(await analyzeFile(file)).blocks);
  } catch (err) {
    if (err instanceof FileRejected) return fail(400, err.message);
    throw err;
  }

  const lesson = getLesson(String(form.get("lesson") ?? ""));
  const context = lesson ? `(Contesto: l'utente sta facendo la lezione "${lesson.title}" di SqueakEdit.)\n\n` : "";

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...parseHistory(form.get("history")),
    { role: "user", content: [...fileBlocks, { type: "text", text: `${context}${question || "Guarda i file che ti ho mandato: cosa c'è che non va?"}` }] },
  ];

  let client: Anthropic;
  try {
    // le chiavi di organizzazione (non legate a un workspace) richiedono di indicarlo
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
    client = new Anthropic(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : undefined);
  } catch {
    return fail(503, "Squeak AI non è configurato: manca la chiave API sul server.");
  }

  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 16000,
      // se il modello rifiuta, l'API riprova da sola su un modello di riserva
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: [PRACTICE_TOOL],
      messages,
    },
    { signal: request.signal },
  );

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AiStreamEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        stream.on("text", (text) => send({ type: "text", text }));
        const final = await stream.finalMessage();

        if (final.stop_reason === "refusal") {
          send({ type: "error", message: "Su questa richiesta non posso aiutarti. Prova a riformularla." });
        } else if (final.stop_reason !== "max_tokens") {
          // l'input dello strumento arriva in streaming: va validato prima di usarlo
          const call = final.content.find((b) => b.type === "tool_use" && b.name === PRACTICE_TOOL.name);
          if (call?.type === "tool_use") {
            const input = call.input as { scenario?: unknown; task?: unknown };
            if (isPracticeId(input.scenario) && typeof input.task === "string" && input.task.trim()) {
              send({ type: "practice", scenario: input.scenario, task: input.task.trim().slice(0, 300) });
            }
          }
        }
        send({ type: "done" });
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("[squeak-ai]", err);
          send({ type: "error", message: errorMessage(err) });
        }
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
