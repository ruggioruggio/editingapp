import type { PracticeScenarioId } from "@/content/practice";

/** Eventi NDJSON che /api/ai manda al browser, una riga ciascuno. */
export type AiStreamEvent =
  | { type: "text"; text: string }
  | { type: "practice"; scenario: PracticeScenarioId; task: string }
  | { type: "error"; message: string }
  | { type: "done" };

/** Storico inviato al server: solo testo (gli allegati vengono mandati una volta). */
export interface AiHistoryItem {
  role: "user" | "assistant";
  text: string;
}
