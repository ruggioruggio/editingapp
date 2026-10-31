import type { PracticeScenarioId } from "@/content/practice";

export type AiStreamEvent =
  | { type: "text"; text: string }
  | { type: "practice"; scenario: PracticeScenarioId; task: string }
  | { type: "error"; message: string }
  | { type: "done" };

export interface AiHistoryItem {
  role: "user" | "assistant";
  text: string;
}
