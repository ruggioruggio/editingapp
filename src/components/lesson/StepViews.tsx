"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Lightbulb } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { MiniEditor } from "@/components/editor/MiniEditor";
import { useEditor } from "@/lib/editor/store";
import type { EditorStep, EditorTaskResult, QuizStep, TheoryStep } from "@/lib/lessons/types";
import { RichText } from "./RichText";

export function TheoryView({ step }: { step: TheoryStep }) {
  return (
    <div className="animate-pop space-y-5">
      <h2 className="text-2xl font-bold">{step.title}</h2>
      {step.body.map((p, i) => (
        <RichText key={i} text={p} className="leading-relaxed text-ink-dim" />
      ))}
      {step.terms && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {step.terms.map((t) => (
            <div key={t.term} className="rounded-lg border border-line bg-panel p-3">
              <dt className="font-mono text-sm text-accent">{t.term}</dt>
              <dd className="mt-1 text-sm text-ink-dim">{t.def}</dd>
            </div>
          ))}
        </dl>
      )}
      {step.tip && (
        <div className="flex items-start gap-3 rounded-xl border border-cheese/30 bg-cheese/5 p-3">
          <Mascot size={40} className="shrink-0" />
          <p className="text-sm text-ink-dim">{step.tip}</p>
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
  return (
    <div className="animate-pop space-y-6">
      <h2 className="text-2xl font-bold">{step.question}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {step.options.map((option, i) => {
          const isCorrect = i === step.correctIndex;
          return (
            <button
              key={option}
              type="button"
              disabled={checked}
              onClick={() => onSelect(i)}
              className={clsx(
                "btn-3d flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left font-medium transition-colors",
                checked && isCorrect && "border-success bg-success/10",
                checked && !isCorrect && i === selected && "border-danger bg-danger/10",
                checked && !isCorrect && i !== selected && "border-line bg-panel opacity-60",
                !checked && i === selected && "border-accent bg-accent/10",
                !checked && i !== selected && "border-line bg-panel hover:bg-panel-2",
              )}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line font-mono text-xs text-ink-mute">
                {i + 1}
              </span>
              {option}
            </button>
          );
        })}
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
    <div className="animate-pop space-y-3">
      <div className="flex items-start gap-3">
        <Mascot size={44} className="shrink-0" mood={result.done ? "wow" : "happy"} />
        <div className="min-w-0">
          <h2 className="text-xl font-bold">{step.title}</h2>
          <RichText text={step.instructions} className="text-sm leading-relaxed text-ink-dim" />
        </div>
      </div>

      <MiniEditor tools={step.tools} />

      {!result.done && result.hint && (
        <div className="flex items-start gap-2 text-sm">
          {showHint ? (
            <p className="flex items-start gap-2 rounded-lg border border-cheese/30 bg-cheese/5 px-3 py-2 text-ink-dim">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-cheese" />
              {result.hint}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 text-cheese hover:underline"
            >
              <Lightbulb size={16} /> Mostra un suggerimento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
