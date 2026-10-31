import type { Lesson, LessonStep } from "@/lib/lessons/types";

export type StepI18n =
  | { kind: "theory"; title: string; body: string[]; terms?: { term: string; def: string }[]; tip?: string }
  | { kind: "quiz"; question: string; options: string[]; explanation: string }
  | { kind: "match"; title: string; pairs: [string, string][] }
  | { kind: "editor"; title: string; instructions: string }
  | { kind: "premiere"; title: string; instructions: string }
  | { kind: "studio"; title: string; instructions: string; hint?: string; goals?: string[] };

export interface LessonI18n {
  title: string;
  summary: string;
  steps: StepI18n[];
}

export type LessonTranslations = Record<string, LessonI18n>;

function applyStep(original: LessonStep, t: StepI18n): LessonStep {
  if (original.kind !== t.kind) return original;
  switch (original.kind) {
    case "theory":
      return { ...original, title: (t as StepI18n & { kind: "theory" }).title, body: (t as StepI18n & { kind: "theory" }).body, terms: (t as StepI18n & { kind: "theory" }).terms ?? original.terms, tip: (t as StepI18n & { kind: "theory" }).tip ?? original.tip };
    case "quiz": {
      const q = t as StepI18n & { kind: "quiz" };
      return { ...original, question: q.question, options: q.options, explanation: q.explanation };
    }
    case "match": {
      const m = t as StepI18n & { kind: "match" };
      return { ...original, title: m.title, pairs: m.pairs };
    }
    case "editor": {
      const e = t as StepI18n & { kind: "editor" };
      return { ...original, title: e.title, instructions: e.instructions };
    }
    case "premiere": {
      const p = t as StepI18n & { kind: "premiere" };
      return { ...original, title: p.title, instructions: p.instructions };
    }
    case "studio": {
      const s = t as StepI18n & { kind: "studio" };
      const patched = { ...original, title: s.title, instructions: s.instructions };
      if (s.hint !== undefined) (patched as typeof original).hint = s.hint;
      if (s.goals && original.goals) {
        (patched as typeof original).goals = original.goals.map((g, i) => s.goals![i] ? { ...g, label: s.goals![i] } : g) as typeof original.goals;
      }
      return patched;
    }
    default:
      return original;
  }
}

export function translateLesson(lesson: Lesson, translations: LessonTranslations): Lesson {
  const t = translations[lesson.id];
  if (!t) return lesson;
  return {
    ...lesson,
    title: t.title,
    summary: t.summary,
    steps: lesson.steps.map((step, i) => (t.steps[i] ? applyStep(step, t.steps[i]) : step)),
  };
}
