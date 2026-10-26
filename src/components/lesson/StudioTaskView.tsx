"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Check, ChevronDown, ChevronUp, Circle, Lightbulb, MonitorPlay, RotateCcw, Undo2 } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { AeStudioEmbedded } from "@/components/studio/ae/AfterEffectsStudio";
import { setStudioExit } from "@/components/studio/embed";
import { PremiereStudioEmbedded } from "@/components/studio/premiere/PremiereStudio";
import { enterSandbox, exitSandbox } from "@/lib/lessons/sandbox";
import type { Goal, StudioStep } from "@/lib/lessons/types";
import { useAe } from "@/lib/studio/ae";
import { usePremiere } from "@/lib/studio/premiere";
import { RichText } from "./RichText";

const APP = {
  premiere: { name: "Premiere Pro", short: "Pr", fg: "#9999ff", bg: "#00005b" },
  ae: { name: "After Effects", short: "Ae", fg: "#d291ff", bg: "#1f0040" },
} as const;

/** Stato degli obiettivi, ricalcolato a ogni modifica del progetto nel simulatore. */
function useGoals(step: StudioStep, ready: boolean): boolean[] {
  // l'app di un esercizio non cambia mai, quindi l'hook usato resta sempre lo stesso
  const state = (step.app === "premiere" ? usePremiere : useAe)() as never;
  if (!ready) return step.goals.map(() => false);
  return (step.goals as Goal<never>[]).map((g) => {
    try {
      return g.test(state);
    } catch {
      return false;
    }
  });
}

/**
 * Esercizio nel simulatore vero. Il progetto dell'utente viene messo da
 * parte finché la lezione resta su questo passo, poi torna com'era.
 */
export function StudioTaskView({ step, onDone }: { step: StudioStep; onDone: () => void }) {
  const app = APP[step.app];
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const goals = useGoals(step, ready);
  const done = ready && goals.every(Boolean);
  const notified = useRef(false);

  useEffect(() => {
    enterSandbox(step.app, step.setup());
    setReady(true);
    return () => exitSandbox(step.app);
  }, [step]);

  useEffect(() => {
    if (done && !notified.current) {
      notified.current = true;
      onDone();
    }
  }, [done, onDone]);

  useEffect(() => {
    if (!open) return;
    setStudioExit(() => setOpen(false));
    document.body.dataset.studioOpen = "1";
    return () => {
      setStudioExit(null);
      delete document.body.dataset.studioOpen;
    };
  }, [open]);

  const restart = () => {
    enterSandbox(step.app, step.setup());
  };

  return (
    <div className="animate-pop space-y-4">
      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide" style={{ color: app.fg }}>
        <span className="grid h-7 w-7 place-items-center rounded-md text-[11px] font-black" style={{ background: app.bg, color: app.fg, border: `1.5px solid ${app.fg}` }}>
          {app.short}
        </span>
        Esercizio in {app.name}
      </p>
      <div className="flex items-center gap-4">
        <Mascot size={72} idle mood={done ? "wow" : "happy"} className="shrink-0" />
        <div className="duo-bubble min-w-0">
          <p className="font-black">{step.title}</p>
          <RichText text={step.instructions} className="text-sm leading-relaxed text-ink-dim" />
        </div>
      </div>
      <GoalList step={step} goals={goals} />
      <button type="button" onClick={() => setOpen(true)} className={clsx("duo-btn w-full", done ? "duo-ghost" : "duo-violet")}>
        <MonitorPlay size={18} /> {done ? `Riapri ${app.name}` : `Apri ${app.name}`}
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70]">
            {step.app === "premiere" ? <PremiereStudioEmbedded /> : <AeStudioEmbedded />}
            <TaskPanel step={step} goals={goals} done={done} onClose={() => setOpen(false)} onRestart={restart} />
          </div>,
          document.body,
        )}
    </div>
  );
}

function GoalList({ step, goals, compact }: { step: StudioStep; goals: boolean[]; compact?: boolean }) {
  return (
    <ul className={clsx("space-y-1.5", !compact && "rounded-2xl border-2 border-line p-3")}>
      {step.goals.map((g, i) => (
        <li key={g.label} className={clsx("flex items-start gap-2", compact ? "text-[12px]" : "text-sm font-bold", goals[i] ? "text-success" : compact ? "text-[#c8c8c8]" : "text-ink-dim")}>
          {goals[i] ? <Check size={compact ? 14 : 18} strokeWidth={3} className="mt-0.5 shrink-0" /> : <Circle size={compact ? 14 : 18} className="mt-0.5 shrink-0 opacity-50" />}
          <RichText text={g.label} className={goals[i] ? "line-through decoration-2 opacity-80" : undefined} />
        </li>
      ))}
    </ul>
  );
}

/** Scheda dell'esercizio sopra al simulatore: obiettivi, aiuto, ricomincia, torna alla lezione. */
function TaskPanel({ step, goals, done, onClose, onRestart }: { step: StudioStep; goals: boolean[]; done: boolean; onClose: () => void; onRestart: () => void }) {
  // sul telefono parte ridotta, per non coprire la timeline
  const [min, setMin] = useState(() => typeof window !== "undefined" && window.innerWidth < 700);
  const [hint, setHint] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const count = goals.filter(Boolean).length;

  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const box = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const dx = e.clientX - box.left;
    const dy = e.clientY - box.top;
    const move = (ev: PointerEvent) => setPos({ x: Math.max(0, Math.min(window.innerWidth - 80, ev.clientX - dx)), y: Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy)) });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      className={clsx("force-dark fixed z-[75] w-[min(330px,calc(100vw-16px))] overflow-hidden rounded-2xl border-2 shadow-[0_12px_40px_rgb(0_0_0/0.6)]", done ? "border-success bg-[#10241a]" : "border-[#4a4a7a] bg-[#1c1c2a]")}
      style={pos ? { left: pos.x, top: pos.y } : { right: 8, bottom: 8 }}
    >
      <div onPointerDown={drag} className="flex cursor-move touch-none items-center gap-2 px-3 py-2">
        <Mascot size={30} mood={done ? "wow" : "happy"} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-black text-white">{done ? "Fatto! Esercizio completato" : step.title}</p>
          <p className={clsx("text-[11px] font-bold", done ? "text-success" : "text-[#9a9ac8]")}>
            Obiettivi {count}/{goals.length}
          </p>
        </div>
        <button type="button" onClick={() => setMin((m) => !m)} aria-label={min ? "Espandi" : "Riduci"} className="rounded-lg p-1 text-[#c8c8c8] hover:bg-white/10">
          {min ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      {!min && (
        <div className="space-y-3 border-t border-white/10 px-3 pb-3 pt-2">
          {!done && <RichText text={step.instructions} className="max-h-28 overflow-y-auto text-[12px] leading-relaxed text-[#bdbdd6]" />}
          <GoalList step={step} goals={goals} compact />
          {step.hint && !done && (
            <div>
              <button type="button" onClick={() => setHint((h) => !h)} className="flex items-center gap-1 text-[12px] font-bold text-cheese">
                <Lightbulb size={14} /> {hint ? "Nascondi aiuto" : "Aiutino"}
              </button>
              {hint && <RichText text={step.hint} className="mt-1 text-[12px] leading-relaxed text-[#e9dcae]" />}
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onRestart} title="Ricomincia l'esercizio da capo" className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-[12px] font-bold text-[#d0d0d0] hover:bg-white/15">
              <RotateCcw size={14} /> Ricomincia
            </button>
            <button type="button" onClick={onClose} className={clsx("flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 text-[12px] font-black", done ? "bg-success text-[#0b2a1b]" : "bg-white/10 text-[#d0d0d0] hover:bg-white/15")}>
              <Undo2 size={14} /> Torna alla lezione
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
