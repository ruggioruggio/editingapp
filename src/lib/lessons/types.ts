import type { Sequence, Tool } from "@/lib/editor/types";

export interface TheoryStep {
  kind: "theory";
  title: string;
  /** paragrafi; **grassetto** supportato */
  body: string[];
  terms?: { term: string; def: string }[];
  tip?: string;
}

export interface QuizStep {
  kind: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EditorTaskResult {
  done: boolean;
  hint?: string;
}

export interface EditorStep {
  kind: "editor";
  title: string;
  instructions: string;
  initial: Sequence;
  tools: Tool[];
  /** Valida lo stato della timeline a ogni modifica dell'utente. */
  check: (seq: Sequence) => EditorTaskResult;
}

export type LessonStep = TheoryStep | QuizStep | EditorStep;

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  steps: LessonStep[];
}

export interface LessonMeta {
  id: string;
  title: string;
  status: "available" | "soon";
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: LessonMeta[];
}
