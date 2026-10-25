"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { ArrowUp, Crown, FileVideo, ImageIcon, Lock, Paperclip, Play, Square, X } from "lucide-react";
import { AppIcon } from "@/components/brand/Mascot";
import { Squeak3D } from "@/components/brand/Squeak3DLazy";
import { brand } from "@/config/brand";
import { getLesson } from "@/content/lessons";
import type { PracticeScenarioId } from "@/content/practice";
import type { AiHistoryItem, AiStreamEvent } from "@/lib/ai/types";
import { hasAiAssistant } from "@/lib/billing/plans";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useProgress } from "@/lib/progress/store";
import { Markdown } from "./Markdown";
import { PracticeModal } from "./PracticeModal";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,.pdf,.prproj,.aep,.aepx,.xml,.txt,.log,.json,.srt,.edl";
const MAX_FILES = 5;
const MAX_MB = 20;

const SUGGESTIONS = [
  "Perché dopo un taglio mi resta un buco nero in timeline?",
  "Il mio video esportato è sgranato, che impostazioni uso per YouTube?",
  "Come faccio un J-cut in Premiere?",
  "Cosa vuol dire Rec.709 e perché il mio girato Log è grigio?",
];

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  files?: string[];
  practice?: { scenario: PracticeScenarioId; task: string };
  error?: string;
  pending?: boolean;
}

let nextId = 1;

const fileIcon = (name: string) => (/\.(png|jpe?g|webp|gif)$/i.test(name) ? ImageIcon : FileVideo);

export function AiChat() {
  const hydrated = useHydrated();
  const plan = useProgress((s) => s.plan);
  const params = useSearchParams();
  const lesson = getLesson(params.get("lesson") ?? "");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [practice, setPractice] = useState<ChatMessage["practice"] | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!hydrated) return <div className="h-96" />;
  // il server controlla comunque il piano: questo è solo per mostrare l'invito
  if (!hasAiAssistant(plan)) return <LockedState />;

  const addFiles = (list: FileList | File[]) => {
    const incoming = [...list];
    const tooBig = incoming.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) setNotice(`"${tooBig.name}" supera i ${MAX_MB} MB.`);
    const ok = incoming.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    setFiles((prev) => {
      const merged = [...prev, ...ok].slice(0, MAX_FILES);
      if (prev.length + ok.length > MAX_FILES) setNotice(`Puoi allegare al massimo ${MAX_FILES} file.`);
      return merged;
    });
  };

  const patch = (id: number, update: (m: ChatMessage) => ChatMessage) =>
    setMessages((list) => list.map((m) => (m.id === id ? update(m) : m)));

  const send = async (text: string) => {
    const question = text.trim();
    if ((!question && files.length === 0) || busy) return;

    const history: AiHistoryItem[] = messages
      .filter((m) => !m.error && m.text)
      .map((m) => ({ role: m.role, text: m.files?.length ? `${m.text}\n[allegati: ${m.files.join(", ")}]` : m.text }));

    const userMsg: ChatMessage = { id: nextId++, role: "user", text: question, files: files.map((f) => f.name) };
    const reply: ChatMessage = { id: nextId++, role: "assistant", text: "", pending: true };
    setMessages((list) => [...list, userMsg, reply]);

    const form = new FormData();
    form.set("question", question);
    form.set("history", JSON.stringify(history));
    if (lesson) form.set("lesson", lesson.id);
    for (const f of files) form.append("files", f);

    setInput("");
    setFiles([]);
    setNotice(null);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai", { method: "POST", body: form, signal: controller.signal });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Squeak AI non risponde, riprova.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as AiStreamEvent;
          if (event.type === "text") patch(reply.id, (m) => ({ ...m, text: m.text + event.text }));
          else if (event.type === "practice") patch(reply.id, (m) => ({ ...m, practice: { scenario: event.scenario, task: event.task } }));
          else if (event.type === "error") patch(reply.id, (m) => ({ ...m, error: event.message }));
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        patch(reply.id, (m) => ({ ...m, error: err instanceof Error ? err.message : "Qualcosa è andato storto." }));
      }
    } finally {
      patch(reply.id, (m) => ({ ...m, pending: false }));
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="relative"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center pt-2 text-center">
          <Squeak3D mode="turntable" className="h-52 w-52" />
          <h1 className="mt-1 text-3xl font-black">
            Chiedi a <span className="text-pr">{brand.aiName}</span>
          </h1>
          <p className="mt-2 max-w-md text-ink-dim">
            Descrivi il problema e allega uno screenshot o il progetto Premiere (.prproj) o After Effects (.aep): Squeak lo
            esamina e ti dice come risolverlo, poi te lo fa provare nell&apos;editor.
          </p>
          {lesson && (
            <p className="mt-3 rounded-full bg-pr/15 px-3 py-1 text-xs font-bold text-pr">Stai facendo: {lesson.title}</p>
          )}
          <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-2xl border border-line bg-panel px-4 py-3 text-left text-sm font-semibold text-ink-dim transition-colors hover:border-pr/50 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ol className="space-y-5">
          {messages.map((m) => (
            <li key={m.id} className={clsx("flex gap-3", m.role === "user" && "justify-end")}>
              {m.role === "assistant" && <AppIcon size={34} className="mt-1" />}
              <div
                className={clsx(
                  "max-w-[85%] rounded-3xl px-4 py-3",
                  m.role === "user" ? "rounded-br-lg bg-accent text-white" : "rounded-tl-lg border border-line bg-panel text-ink-dim",
                )}
              >
                {m.files && m.files.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {m.files.map((name) => {
                      const Icon = fileIcon(name);
                      return (
                        <span key={name} className="flex items-center gap-1 rounded-lg bg-black/20 px-2 py-1 text-xs font-bold">
                          <Icon size={13} /> {name}
                        </span>
                      );
                    })}
                  </div>
                )}
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                ) : m.text ? (
                  <Markdown text={m.text} />
                ) : m.pending ? (
                  <Thinking />
                ) : null}
                {m.error && <p className="mt-2 text-sm font-bold text-danger">{m.error}</p>}
                {m.practice && (
                  <button
                    type="button"
                    onClick={() => setPractice(m.practice)}
                    className="btn-3d mt-4 flex w-full items-center gap-3 rounded-2xl bg-pr px-4 py-3 text-left text-pr-deep"
                  >
                    <Play size={20} fill="currentColor" className="shrink-0" />
                    <span>
                      <span className="block text-xs font-black uppercase tracking-wider opacity-70">Prova nell&apos;editor</span>
                      <span className="block font-bold">{m.practice.task}</span>
                    </span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {/* margine di scorrimento: l'ultimo messaggio resta sopra barra di scrittura e dock */}
      <div ref={bottom} className="scroll-mb-[200px]" />

      {/* barra di scrittura sopra il dock */}
      <form onSubmit={onSubmit} className="fixed inset-x-0 bottom-[104px] z-40 px-3">
        <div className="glass mx-auto max-w-3xl rounded-[26px] p-2">
          {(files.length > 0 || notice) && (
            <div className="flex flex-wrap gap-1.5 px-2 pb-2 pt-1">
              {files.map((f, i) => {
                const Icon = fileIcon(f.name);
                return (
                  <span key={`${f.name}${i}`} className="flex items-center gap-1.5 rounded-xl bg-white/10 py-1 pl-2.5 pr-1 text-xs font-bold text-ink">
                    <Icon size={14} /> {f.name}
                    <button
                      type="button"
                      aria-label={`Rimuovi ${f.name}`}
                      onClick={() => setFiles((list) => list.filter((_, k) => k !== i))}
                      className="grid h-5 w-5 place-items-center rounded-md hover:bg-white/15"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
              {notice && <span className="py-1 text-xs font-bold text-cheese">{notice}</span>}
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-label="Allega immagini o progetti"
              title="Allega screenshot, .prproj, .aep…"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <Paperclip size={20} />
            </button>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Descrivi il problema…"
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-1 py-2.5 font-semibold text-white outline-none placeholder:text-zinc-400"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                aria-label="Interrompi"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Invia"
                disabled={!input.trim() && files.length === 0}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pr text-pr-deep transition-opacity disabled:opacity-40"
              >
                <ArrowUp size={20} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </form>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-pr/15 backdrop-blur-sm">
          <p className="rounded-3xl border-2 border-dashed border-pr bg-app/90 px-8 py-6 text-lg font-black text-pr">
            Lascia qui screenshot o progetti
          </p>
        </div>
      )}

      {practice && <PracticeModal scenario={practice.scenario} task={practice.task} onClose={() => setPractice(null)} />}
    </div>
  );
}

function Thinking() {
  return (
    <span className="flex items-center gap-2 py-1 text-sm font-bold text-ink-mute">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-pr" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      Squeak sta esaminando…
    </span>
  );
}

function LockedState() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <Squeak3D mode="turntable" className="h-56 w-56" />
        <span className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-cheese text-[#3a2500] shadow-lg">
          <Lock size={18} />
        </span>
      </div>
      <h1 className="text-3xl font-black">
        {brand.aiName} è incluso in <span className="text-cheese">Pro</span>
      </h1>
      <ul className="mt-5 max-w-md space-y-2 text-left text-ink-dim">
        <li>• Fai qualsiasi domanda su Premiere Pro e After Effects</li>
        <li>• Allega screenshot e progetti .prproj o .aep: Squeak li esamina</li>
        <li>• Ricevi la soluzione passo passo e provala subito nell&apos;editor di SqueakEdit</li>
      </ul>
      <Link
        href="/pricing"
        className="btn-3d mt-7 flex items-center gap-2 rounded-2xl bg-linear-to-r from-cheese to-[#ff9a5c] px-8 py-3.5 font-black uppercase text-[#3a2500]"
      >
        <Crown size={18} /> Passa a Pro
      </Link>
    </div>
  );
}
