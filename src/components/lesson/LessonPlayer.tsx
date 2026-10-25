"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Flame, Heart, Target, X, Zap } from "lucide-react";
import { AiAssistantButton } from "@/components/ai/AiAssistantButton";
import { Mascot } from "@/components/brand/Mascot";
import { SqueakReaction } from "@/components/brand/Reactions";
import { features } from "@/config/features";
import { getLesson } from "@/content/lessons";
import { canStartLesson, PLANS } from "@/lib/billing/plans";
import { todayKey } from "@/lib/date";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { buildUnitTest, isLessonUnlocked, skippedLessons, UNIT_TEST_HEARTS } from "@/lib/lessons/progression";
import type { EditorTaskResult, Lesson } from "@/lib/lessons/types";
import { PremiereTaskView } from "./PremiereTaskView";
import { currentStreak, useProgress } from "@/lib/progress/store";
import { EditorTaskView, MatchView, QuizView, TheoryView } from "./StepViews";

const PRAISE = ["Fantastico!", "Ottimo lavoro!", "Perfetto!", "Grande!", "Da montatore vero!"];
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

type Feedback = { outcome: "win" | "lose"; title: string; text?: string; id: number } | null;

type Access = "ok" | "limit" | "locked" | "missing" | null;

/**
 * Player di una lezione. Con `unitTestId` diventa il test per saltare
 * all'unità indicata: domande sulle lezioni saltate e solo 3 vite.
 */
export function LessonPlayer({ lessonId, unitTestId }: { lessonId?: string; unitTestId?: string }) {
  const hydrated = useHydrated();
  const completeLesson = useProgress((s) => s.completeLesson);
  const completeLessons = useProgress((s) => s.completeLessons);

  const [test, setTest] = useState<{ lesson: Lesson; skipped: string[] } | null>(null);
  const lesson = unitTestId ? test?.lesson : lessonId ? getLesson(lessonId) : undefined;
  const [access, setAccess] = useState<Access>(null);
  const [hearts, setHearts] = useState<number | null>(unitTestId ? UNIT_TEST_HEARTS : null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [editorResult, setEditorResult] = useState<EditorTaskResult>({ done: false });
  const [matchDone, setMatchDone] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState<{ xp: number; accuracy: number; seconds: number; streakBefore: number } | null>(null);

  // Controlli all'apertura: ordine delle lezioni, limite giornaliero, test di salto.
  useEffect(() => {
    if (!hydrated) return;
    const s = useProgress.getState();
    if (unitTestId) {
      const built = buildUnitTest(unitTestId, s.completed);
      if (!built) return setAccess("missing");
      setTest({ lesson: built, skipped: skippedLessons(unitTestId, s.completed) });
      return setAccess("ok");
    }
    if (!lessonId || !getLesson(lessonId)) return setAccess("missing");
    if (!isLessonUnlocked(lessonId, s.completed)) return setAccess("locked");
    const ok = canStartLesson(s.plan, s.daily, lessonId);
    setAccess(ok ? "ok" : "limit");
    if (ok) s.startLesson(lessonId);
  }, [hydrated, lessonId, unitTestId]);

  const step = lesson?.steps[stepIndex];
  const isLast = lesson ? stepIndex === lesson.steps.length - 1 : false;
  const [outOfHearts, setOutOfHearts] = useState(false);

  /** Un errore: conta per la precisione e, nei test, costa una vita. */
  const miss = useCallback(() => {
    setMistakes((m) => m + 1);
    setHearts((h) => (h === null ? null : Math.max(0, h - 1)));
  }, []);

  const next = useCallback(() => {
    if (!lesson) return;
    if (hearts === 0) return setOutOfHearts(true);
    if (isLast) {
      const accuracy = answered ? Math.max(0, Math.round((100 * (answered - mistakes)) / answered)) : 100;
      const streakBefore = currentStreak(useProgress.getState().streak);
      if (test) completeLessons(test.skipped, lesson.xp);
      else completeLesson(lesson.id, lesson.xp, mistakes === 0);
      setFinished({ xp: lesson.xp, accuracy, seconds: Math.round((Date.now() - startedAt) / 1000), streakBefore });
      return;
    }
    setStepIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
    setEditorResult({ done: false });
    setMatchDone(false);
  }, [lesson, isLast, answered, mistakes, completeLesson, completeLessons, test, hearts, startedAt]);

  const check = useCallback(() => {
    if (!step || step.kind !== "quiz" || selected === null) return;
    const right = selected === step.correctIndex;
    setAnswered((n) => n + 1);
    if (!right) miss();
    setFeedback(
      right
        ? { outcome: "win", title: pick(PRAISE), text: step.explanation, id: Date.now() }
        : { outcome: "lose", title: "Soluzione corretta:", text: `${step.options[step.correctIndex]} — ${step.explanation}`, id: Date.now() },
    );
  }, [step, selected, miss]);

  const skip = () => {
    if (!step || step.kind !== "quiz") return;
    setAnswered((n) => n + 1);
    miss();
    setFeedback({ outcome: "lose", title: "Soluzione corretta:", text: step.options[step.correctIndex], id: Date.now() });
  };

  // esercizio nell'editor, finestra di Premiere o coppie completate: festeggia
  const practical = step?.kind === "editor" || step?.kind === "premiere";
  useEffect(() => {
    if ((practical && editorResult.done) || (step?.kind === "match" && matchDone)) {
      setFeedback((f) => f ?? { outcome: "win", title: pick(PRAISE), text: practical ? "Esattamente come lo faresti in Premiere." : undefined, id: Date.now() });
    }
  }, [step, practical, editorResult.done, matchDone]);

  // Invio = verifica / continua, come in Duolingo
  const primary = feedback ? next : step?.kind === "quiz" ? check : step?.kind === "theory" ? next : undefined;
  const primaryDisabled = !feedback && ((step?.kind === "quiz" && selected === null) || practical || step?.kind === "match");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && primary && !primaryDisabled) {
        e.preventDefault();
        primary();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [primary, primaryDisabled]);

  if (access === null) return <div className="min-h-dvh bg-app" />;
  if (access === "limit") return <Paywall />;
  if (access === "locked") return <Blocked text="Completa prima la lezione precedente per sbloccare questa." />;
  if (access === "missing" || !lesson || !step) return <Blocked text="Qui non c'è niente da saltare: hai già sbloccato questa unità." />;
  if (outOfHearts) return <OutOfHearts />;
  if (finished) return <LessonComplete {...finished} />;

  const primaryLabel = feedback
    ? "Continua"
    : step.kind === "quiz"
      ? "Controlla"
      : step.kind === "theory"
        ? "Continua"
        : step.kind === "match"
          ? "Abbina tutte le coppie"
          : "Completa l'esercizio";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-20 w-full max-w-5xl items-center gap-4 px-4">
        <Link href="/learn" aria-label="Esci dalla lezione" className="text-ink-mute hover:text-ink">
          <X size={26} strokeWidth={2.6} />
        </Link>
        <div className="duo-progress flex-1">
          <div style={{ width: `${Math.max(4, (stepIndex / lesson.steps.length) * 100)}%` }} />
        </div>
        {hearts !== null ? (
          <span className="flex items-center gap-1.5 text-lg font-black text-danger" aria-label={`${hearts} vite`}>
            <Heart size={26} fill="currentColor" /> {hearts}
          </span>
        ) : (
          <AiAssistantButton lessonId={lesson.id} />
        )}
      </header>

      <main className={clsx("mx-auto w-full flex-1 px-4 pb-48 pt-4 sm:pt-10", step.kind === "editor" ? "max-w-5xl" : "max-w-2xl")}>
        {step.kind === "theory" && <TheoryView key={stepIndex} step={step} />}
        {step.kind === "quiz" && (
          <QuizView key={stepIndex} step={step} selected={selected} checked={!!feedback} onSelect={(i) => !feedback && setSelected(i)} />
        )}
        {step.kind === "match" && (
          <MatchView
            key={stepIndex}
            step={step}
            onMistake={miss}
            onDone={() => {
              setAnswered((n) => n + 1);
              setMatchDone(true);
            }}
          />
        )}
        {step.kind === "editor" && <EditorTaskView key={stepIndex} step={step} onResult={setEditorResult} />}
        {step.kind === "premiere" && (
          <PremiereTaskView key={stepIndex} step={step} onDone={() => setEditorResult({ done: true })} onMistake={miss} />
        )}
      </main>

      <footer
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 border-t-2",
          feedback?.outcome === "win" && "border-transparent bg-[#14271d]",
          feedback?.outcome === "lose" && "border-transparent bg-[#2a1718]",
          !feedback && "border-line bg-app",
        )}
      >
        <div className="mx-auto flex min-h-36 max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          {feedback ? (
            <div key={feedback.id} className="animate-pop flex min-w-0 items-center gap-4">
              {/* reazione casuale di Squeak: ogni risposta ne sceglie una diversa */}
              <div className={clsx("grid h-24 w-24 shrink-0 place-items-center rounded-full", feedback.outcome === "win" ? "bg-success/15" : "bg-danger/15")}>
                <SqueakReaction outcome={feedback.outcome} size={92} />
              </div>
              <div className="min-w-0">
                <p className={clsx("text-2xl font-black", feedback.outcome === "win" ? "text-success" : "text-danger")}>{feedback.title}</p>
                {feedback.text && <p className={clsx("mt-1", feedback.outcome === "win" ? "text-[#a7e9c9]" : "text-[#ffb3b3]")}>{feedback.text}</p>}
              </div>
            </div>
          ) : step.kind === "quiz" ? (
            <button type="button" onClick={skip} className="duo-btn duo-ghost hidden sm:inline-flex">
              Salta
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <button
            type="button"
            disabled={primaryDisabled}
            onClick={primary}
            className={clsx("duo-btn w-full shrink-0 sm:w-auto sm:min-w-40", feedback?.outcome === "lose" && "duo-red")}
          >
            {primaryLabel}
          </button>
        </div>
      </footer>
    </div>
  );
}

/** Schermata finale: reazione di vittoria a caso e le statistiche a schede. */
function LessonComplete({ xp, accuracy, seconds, streakBefore }: { xp: number; accuracy: number; seconds: number; streakBefore: number }) {
  const router = useRouter();
  const streak = useProgress((s) => currentStreak(s.streak));
  const [showStreak, setShowStreak] = useState(false);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  if (showStreak) return <StreakScreen streak={streak} onContinue={() => router.push("/learn")} />;

  const stats = [
    { label: "Totale XP", value: `${xp}`, icon: Zap, color: "#ffc93c" },
    { label: accuracy >= 90 ? "Perfetto!" : accuracy >= 70 ? "Bene!" : "Precisione", value: `${accuracy}%`, icon: Target, color: "#3ecf8e" },
    { label: "Veloce!", value: time, icon: Flame, color: "#2d8ceb" },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="animate-pop mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
        <SqueakReaction outcome="win" size={240} />
        <h1 className="text-3xl font-black text-cheese sm:text-4xl">Lezione completata!</h1>
        <div className="grid w-full grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="overflow-hidden rounded-2xl border-2" style={{ borderColor: color, background: color }}>
              <p className="py-1 text-[11px] font-black uppercase tracking-wide text-[#121212]">{label}</p>
              <p className="flex items-center justify-center gap-1.5 rounded-xl bg-app py-4 text-lg font-black" style={{ color }}>
                <Icon size={20} /> {value}
              </p>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-5xl justify-end px-4 py-6">
          <button
            type="button"
            onClick={() => (streak > streakBefore ? setShowStreak(true) : router.push("/learn"))}
            className="duo-btn w-full sm:w-auto sm:min-w-40"
          >
            Continua
          </button>
        </div>
      </footer>
    </div>
  );
}

const DAY_LETTERS = ["D", "L", "M", "M", "G", "V", "S"];

/** Schermata della serie: fiamma, numero di giorni e settimana con i giorni fatti. */
function StreakScreen({ streak, onContinue }: { streak: number; onContinue: () => void }) {
  // 5 giorni: quelli già fatti della serie (fino a oggi) e poi i prossimi
  const today = new Date();
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i - Math.min(streak - 1, 4));
    return d;
  });
  const todayStr = todayKey();
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="animate-pop mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 text-center">
        <Flame size={130} className="text-[#ff9600] drop-shadow-[0_10px_0_rgb(120_60_0/0.35)]" fill="#ff9600" strokeWidth={1.5} />
        <p className="mt-2 text-8xl font-black leading-none text-[#ff9600]">{streak}</p>
        <p className="mt-1 text-2xl font-black text-[#ff9600]">{streak === 1 ? "giorno di serie!" : "giorni di serie!"}</p>
        <div className="duo-card mt-8 w-full overflow-hidden">
          <div className="flex justify-center gap-3 p-5">
            {days.map((d) => {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              const done = key <= todayStr && (Date.parse(todayStr) - Date.parse(key)) / 86400000 < streak;
              return (
                <div key={key} className="flex flex-col items-center gap-2">
                  <span className={clsx("text-sm font-black", key === todayStr ? "text-[#ff9600]" : "text-ink-mute")}>{DAY_LETTERS[d.getDay()]}</span>
                  <span className={clsx("grid h-10 w-10 place-items-center rounded-full", done ? "bg-[#ff9600] text-[#121212]" : "bg-panel-3")}>
                    {done && <Check size={20} strokeWidth={3.5} />}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="border-t-2 border-line px-4 py-3 text-ink-dim">Fai una lezione ogni giorno per non azzerare la serie!</p>
        </div>
      </main>
      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-5xl justify-end px-4 py-6">
          <button type="button" onClick={onContinue} className="duo-btn duo-blue w-full sm:w-auto sm:min-w-40">
            Continua
          </button>
        </div>
      </footer>
    </div>
  );
}

function Blocked({ text }: { text: string }) {
  return (
    <div className="animate-pop mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <Mascot size={140} mood="sleepy" idle />
      <h1 className="text-2xl font-black">Non ancora!</h1>
      <p className="text-ink-dim">{text}</p>
      <Link href="/learn" className="duo-btn w-full">
        Torna al percorso
      </Link>
    </div>
  );
}

/** Test di salto: finite le 3 vite si torna al percorso (e si può riprovare). */
function OutOfHearts() {
  return (
    <div className="animate-pop mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <SqueakReaction outcome="lose" size={220} />
      <h1 className="text-2xl font-black text-danger">Hai finito le vite</h1>
      <p className="text-ink-dim">
        Nessun problema: ripassa le lezioni oppure riprova il test quando vuoi. Le lezioni restano lì ad aspettarti.
      </p>
      <Link href="/learn" className="duo-btn w-full">
        Torna al percorso
      </Link>
    </div>
  );
}

function Paywall() {
  return (
    <div className="animate-pop mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <Mascot size={140} mood="sleepy" idle />
      <h1 className="text-2xl font-black">Per oggi hai finito le lezioni</h1>
      {features.payments ? (
        <>
          <p className="text-ink-dim">
            Il piano Free include {PLANS.free.dailyLessonLimit} lezioni al giorno. Torna domani, oppure passa a Pro per
            lezioni illimitate e l&apos;assistente AI.
          </p>
          <Link href="/pricing" className="duo-btn duo-violet w-full">
            Passa a Pro
          </Link>
          <Link href="/learn" className="text-sm font-bold text-ink-mute hover:text-ink">
            Torna al percorso
          </Link>
        </>
      ) : (
        <>
          <p className="text-ink-dim">
            Puoi fare {PLANS.free.dailyLessonLimit} lezioni al giorno: torna domani per continuare la serie! Il piano Pro
            con lezioni illimitate è in arrivo.
          </p>
          <Link href="/learn" className="duo-btn w-full">
            Torna al percorso
          </Link>
        </>
      )}
    </div>
  );
}
