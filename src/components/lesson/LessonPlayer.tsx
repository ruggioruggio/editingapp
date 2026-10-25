"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Flame, Target, X, Zap } from "lucide-react";
import { AiAssistantButton } from "@/components/ai/AiAssistantButton";
import { Mascot } from "@/components/brand/Mascot";
import { getLesson } from "@/content/lessons";
import { canStartLesson, PLANS } from "@/lib/billing/plans";
import { useHydrated } from "@/lib/hooks/useHydrated";
import type { EditorTaskResult } from "@/lib/lessons/types";
import { currentStreak, useProgress } from "@/lib/progress/store";
import { EditorTaskView, QuizView, TheoryView } from "./StepViews";

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const hydrated = useHydrated();
  const completeLesson = useProgress((s) => s.completeLesson);

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [quiz, setQuiz] = useState<{ selected: number | null; checked: boolean }>({ selected: null, checked: false });
  const [editorResult, setEditorResult] = useState<EditorTaskResult>({ done: false });
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState<{ xp: number; accuracy: number } | null>(null);

  // Gate freemium: si controlla una sola volta all'apertura della lezione.
  useEffect(() => {
    if (!hydrated) return;
    const s = useProgress.getState();
    const ok = canStartLesson(s.plan, s.daily, lessonId);
    setAllowed(ok);
    if (ok) s.startLesson(lessonId);
  }, [hydrated, lessonId]);

  if (!lesson) return null;
  if (allowed === null) return <div className="min-h-dvh bg-app" />;
  if (!allowed) return <Paywall />;
  if (finished) return <LessonComplete xp={finished.xp} accuracy={finished.accuracy} />;

  const step = lesson.steps[stepIndex];
  const isLast = stepIndex === lesson.steps.length - 1;

  const next = () => {
    if (isLast) {
      const quizCount = lesson.steps.filter((s) => s.kind === "quiz").length;
      const accuracy = quizCount ? Math.round((100 * (quizCount - mistakes)) / quizCount) : 100;
      completeLesson(lesson.id, lesson.xp);
      setFinished({ xp: lesson.xp, accuracy });
      return;
    }
    setStepIndex((i) => i + 1);
    setQuiz({ selected: null, checked: false });
    setEditorResult({ done: false });
  };

  const checkQuiz = () => {
    if (step.kind !== "quiz" || quiz.selected === null) return;
    if (quiz.selected !== step.correctIndex) setMistakes((m) => m + 1);
    setQuiz((q) => ({ ...q, checked: true }));
  };

  // Stato del footer in base al tipo di step
  let footer: { tone: "neutral" | "success" | "error"; title?: string; text?: string; label: string; disabled: boolean; action: () => void };
  if (step.kind === "theory") {
    footer = { tone: "neutral", label: "Continua", disabled: false, action: next };
  } else if (step.kind === "quiz") {
    if (!quiz.checked) {
      footer = { tone: "neutral", label: "Verifica", disabled: quiz.selected === null, action: checkQuiz };
    } else {
      const correct = quiz.selected === step.correctIndex;
      footer = {
        tone: correct ? "success" : "error",
        title: correct ? "Corretto!" : `Risposta giusta: ${step.options[step.correctIndex]}`,
        text: step.explanation,
        label: "Continua",
        disabled: false,
        action: next,
      };
    }
  } else {
    footer = editorResult.done
      ? { tone: "success", title: "Ottimo lavoro!", text: "Esattamente come lo faresti in Premiere.", label: "Continua", disabled: false, action: next }
      : { tone: "neutral", label: "Completa l'esercizio", disabled: true, action: next };
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-app/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/learn" aria-label="Esci dalla lezione" className="text-ink-mute hover:text-ink">
            <X size={22} />
          </Link>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-panel-3">
            <div
              className="h-full rounded-full bg-success transition-[width] duration-300"
              style={{ width: `${(stepIndex / lesson.steps.length) * 100}%` }}
            />
          </div>
          <AiAssistantButton />
        </div>
      </header>

      <main
        className={clsx(
          "mx-auto w-full flex-1 px-4 pb-40 pt-6",
          step.kind === "editor" ? "max-w-6xl" : "max-w-2xl sm:pt-12",
        )}
      >
        {step.kind === "theory" && <TheoryView key={stepIndex} step={step} />}
        {step.kind === "quiz" && (
          <QuizView
            key={stepIndex}
            step={step}
            selected={quiz.selected}
            checked={quiz.checked}
            onSelect={(i) => setQuiz({ selected: i, checked: false })}
          />
        )}
        {step.kind === "editor" && <EditorTaskView key={stepIndex} step={step} onResult={setEditorResult} />}
      </main>

      <footer
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 border-t",
          footer.tone === "success" && "border-success/40 bg-[#12251c]",
          footer.tone === "error" && "border-danger/40 bg-[#2a1515]",
          footer.tone === "neutral" && "border-line bg-app",
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-6">
            {footer.title && (
              <p className={clsx("font-bold", footer.tone === "success" ? "text-success" : "text-danger")}>{footer.title}</p>
            )}
            {footer.text && <p className="text-sm text-ink-dim">{footer.text}</p>}
          </div>
          <button
            type="button"
            disabled={footer.disabled}
            onClick={footer.action}
            className={clsx(
              "btn-3d w-full rounded-xl px-8 py-3 font-bold uppercase tracking-wide sm:w-auto",
              footer.disabled && "cursor-not-allowed bg-panel-3 text-ink-mute",
              !footer.disabled && footer.tone === "error" && "bg-danger text-white",
              !footer.disabled && footer.tone !== "error" && "bg-success text-[#08311f]",
            )}
          >
            {footer.label}
          </button>
        </div>
      </footer>
    </div>
  );
}

function LessonComplete({ xp, accuracy }: { xp: number; accuracy: number }) {
  const streak = useProgress((s) => currentStreak(s.streak));
  const stats = [
    { label: "XP", value: `+${xp}`, icon: Zap, color: "text-cheese" },
    { label: "Precisione", value: `${accuracy}%`, icon: Target, color: "text-success" },
    { label: "Serie", value: `${streak} gg`, icon: Flame, color: "text-[#ff8a3d]" },
  ];
  return (
    <div className="animate-pop mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <Mascot size={120} mood="wow" />
      <h1 className="text-3xl font-extrabold">Lezione completata!</h1>
      <div className="grid w-full grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-line bg-panel p-3">
            <Icon size={20} className={clsx("mx-auto mb-1", color)} />
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-ink-mute">{label}</p>
          </div>
        ))}
      </div>
      <Link href="/learn" className="btn-3d w-full rounded-xl bg-success py-3 font-bold uppercase text-[#08311f]">
        Continua
      </Link>
    </div>
  );
}

function Paywall() {
  return (
    <div className="animate-pop mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <Mascot size={120} mood="sleepy" />
      <h1 className="text-2xl font-extrabold">Per oggi hai finito le lezioni gratuite</h1>
      <p className="text-ink-dim">
        Il piano Free include {PLANS.free.dailyLessonLimit} lezioni al giorno. Torna domani, oppure passa a Pro per
        lezioni illimitate e l&apos;assistente AI.
      </p>
      <Link href="/pricing" className="btn-3d w-full rounded-xl bg-pr py-3 font-bold uppercase text-pr-deep">
        Passa a Pro
      </Link>
      <Link href="/learn" className="text-sm text-ink-mute hover:text-ink">
        Torna al percorso
      </Link>
    </div>
  );
}
