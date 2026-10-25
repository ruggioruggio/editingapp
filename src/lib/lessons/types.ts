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

/** "Tocca le coppie" stile Duolingo: si abbinano termini e significati. */
export interface MatchStep {
  kind: "match";
  title: string;
  pairs: [left: string, right: string][];
}

/** Impostazioni di una sequenza (finestra "Nuova sequenza" di Premiere). */
export interface SequenceSettings {
  name: string;
  width: number;
  height: number;
  fps: number;
}

/** Impostazioni di esportazione (finestra "Esporta" di Premiere). */
export interface ExportSettings {
  format: string;
  width: number;
  height: number;
  fps: number;
  bitrateMbps: number;
  audioKbps: number;
}

/**
 * Tutorial dentro una finestra identica a quella di Premiere: l'utente può
 * cambiare tutto, ma si controllano solo i valori dell'obiettivo.
 */
export type PremiereStep = { kind: "premiere"; title: string; instructions: string } & (
  | { dialog: "sequence"; goal: Omit<SequenceSettings, "name"> & { name?: string } }
  | { dialog: "export"; goal: { format: string; width: number; height: number; fps: number; minMbps: number; maxMbps: number; audioKbps?: number } }
);

export type LessonStep = TheoryStep | QuizStep | MatchStep | EditorStep | PremiereStep;

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  steps: LessonStep[];
}

/** Che tipo di pratica prevede la lezione: decide icona e (in futuro) il tipo di esercizio. */
export type LessonKind = "editor" | "theory" | "audio" | "color" | "motion" | "project";

export interface LessonMeta {
  id: string;
  title: string;
  /** obiettivo didattico in una riga: la scaletta da cui scrivere la lezione */
  goal: string;
  kind: LessonKind;
  status: "available" | "soon";
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: LessonMeta[];
}

export interface Section {
  id: string;
  title: string;
  level: string;
  description: string;
  color: string;
  units: Unit[];
}
