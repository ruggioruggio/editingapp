"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import clsx from "clsx";
import { BookOpen, HelpCircle, Lightbulb, Link2, Scissors } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { MiniEditor } from "@/components/editor/MiniEditor";
import { useEditor } from "@/lib/editor/store";
import type { EditorStep, EditorTaskResult, MatchStep, QuizStep, TheoryStep } from "@/lib/lessons/types";
import { RichText } from "./RichText";

function StepLabel({ icon, children, color }: { icon: ReactNode; children: ReactNode; color: string }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide" style={{ color }}>
      <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: color, color: "#121212" }}>
        {icon}
      </span>
      {children}
    </p>
  );
}

export function MascotSays({ children, mood = "happy" }: { children: ReactNode; mood?: "happy" | "wow" }) {
  return (
    <div className="flex items-center gap-4">
      <Mascot size={96} idle mood={mood} className="shrink-0" />
      <div className="duo-bubble text-lg font-bold">{children}</div>
    </div>
  );
}

export function TheoryView({ step }: { step: TheoryStep }) {
  return (
    <div className="animate-pop space-y-6">
      <StepLabel icon={<BookOpen size={15} />} color="#9999ff">
        Teoria
      </StepLabel>
      <MascotSays>{step.title}</MascotSays>
      <div className="space-y-4">
        {step.body.map((p, i) => (
          <RichText key={i} text={p} className="text-lg leading-relaxed text-ink-dim" />
        ))}
      </div>
      {step.terms && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {step.terms.map((t) => (
            <div key={t.term} className="duo-card p-4">
              <dt className="font-mono text-sm font-bold text-accent">{t.term}</dt>
              <dd className="mt-1 text-sm text-ink-dim">{t.def}</dd>
            </div>
          ))}
        </dl>
      )}
      {step.tip && (
        <div className="duo-card flex items-start gap-3 border-cheese/40 p-4">
          <Lightbulb size={22} className="mt-0.5 shrink-0 text-cheese" />
          <p className="text-ink-dim">{step.tip}</p>
        </div>
      )}
    </div>
  );
}

export function QuizView({
  step,
  selected,
  checked,
  onSelect,
}: {
  step: QuizStep;
  selected: number | null;
  checked: boolean;
  onSelect: (index: number) => void;
}) {
  useEffect(() => {
    if (checked) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= step.options.length) onSelect(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [checked, step.options.length, onSelect]);

  return (
    <div className="animate-pop">
      <StepLabel icon={<HelpCircle size={15} />} color="#d291ff">
        Domanda
      </StepLabel>
      <h2 className="mb-8 text-2xl font-black leading-snug sm:text-3xl">{step.question}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {step.options.map((option, i) => {
          const isCorrect = i === step.correctIndex;
          const state = checked
            ? isCorrect
              ? "correct"
              : i === selected
                ? "wrong"
                : "done"
            : i === selected
              ? "selected"
              : undefined;
          return (
            <button
              key={option}
              type="button"
              disabled={checked}
              data-state={state}
              onClick={() => onSelect(i)}
              className="duo-card flex items-center gap-3 px-4 py-4 text-left text-lg font-bold enabled:hover:bg-panel-2"
            >
              <span className="min-w-0 flex-1">{option}</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-current/40 font-mono text-sm opacity-70">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MatchView({ step, onMistake, onDone }: { step: MatchStep; onMistake: () => void; onDone: () => void }) {
  const right = useMemo(() => {
    const items = step.pairs.map((p, i) => ({ text: p[1], pair: i }));
    return items.sort((a, b) => ((a.pair * 7 + 3) % 5) - ((b.pair * 7 + 3) % 5) || a.pair - b.pair);
  }, [step]);
  const [pickedLeft, setPickedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  const pickRight = (pair: number) => {
    if (pickedLeft === null) return;
    if (pair === pickedLeft) {
      const next = [...matched, pair];
      setMatched(next);
      setPickedLeft(null);
      if (next.length === step.pairs.length) onDone();
    } else {
      setWrong(pair);
      onMistake();
      setTimeout(() => setWrong(null), 500);
      setPickedLeft(null);
    }
  };

  return (
    <div className="animate-pop">
      <StepLabel icon={<Link2 size={15} />} color="#3ecf8e">
        Abbina le coppie
      </StepLabel>
      <h2 className="mb-8 text-2xl font-black sm:text-3xl">{step.title}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {step.pairs.map(([left], i) => (
            <button
              key={left}
              type="button"
              disabled={matched.includes(i)}
              data-state={matched.includes(i) ? "done" : pickedLeft === i ? "selected" : undefined}
              onClick={() => setPickedLeft(i)}
              className="duo-card w-full px-3 py-3.5 text-center font-bold enabled:hover:bg-panel-2"
            >
              {left}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {right.map((item) => (
            <button
              key={item.text}
              type="button"
              disabled={matched.includes(item.pair)}
              data-state={matched.includes(item.pair) ? "done" : wrong === item.pair ? "wrong" : undefined}
              onClick={() => pickRight(item.pair)}
              className="duo-card w-full px-3 py-3.5 text-center text-sm font-bold enabled:hover:bg-panel-2"
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EditorTaskView({
  step,
  onResult,
}: {
  step: EditorStep;
  onResult: (result: EditorTaskResult) => void;
}) {
  const load = useEditor((s) => s.load);
  const seq = useEditor((s) => s.seq);
  const [loaded, setLoaded] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    load(step.initial);
    setLoaded(true);
  }, [step, load]);

  const result = useMemo<EditorTaskResult>(() => (loaded ? step.check(seq) : { done: false }), [loaded, step, seq]);

  useEffect(() => {
    onResult(result);
  }, [result, onResult]);

  return (
    <div className="animate-pop space-y-4">
      <StepLabel icon={<Scissors size={15} />} color="#2d8ceb">
        Esercizio nell&apos;editor
      </StepLabel>
      <div className="flex items-center gap-4">
        <Mascot size={72} idle mood={result.done ? "wow" : "happy"} className="shrink-0" />
        <div className="duo-bubble min-w-0">
          <p className="font-black">{step.title}</p>
          <RichText text={step.instructions} className="text-sm leading-relaxed text-ink-dim" />
        </div>
      </div>

      <MiniEditor tools={step.tools} />

      {!result.done && result.hint && (
        <div className="flex items-start gap-2 text-sm">
          {showHint ? (
            <p className="duo-card flex items-start gap-2 px-3 py-2 text-ink-dim">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-cheese" />
              {result.hint}
            </p>
          ) : (
            <button type="button" onClick={() => setShowHint(true)} className="flex items-center gap-1.5 font-bold text-cheese hover:underline">
              <Lightbulb size={16} /> Mostra un suggerimento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
