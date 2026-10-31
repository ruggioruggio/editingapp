import type { EditorStep } from "@/lib/lessons/types";
import { primoTaglio } from "./lessons/primo-taglio";

const editorSteps = primoTaglio.steps.filter((s): s is EditorStep => s.kind === "editor");

export const PRACTICE_SCENARIOS = {
  "cut-at-markers": {
    description: "Tagliare una clip in punti precisi con lo strumento Lama (C), aiutandosi con marker e snapping.",
    step: editorSteps[0],
  },
  "ripple-delete": {
    description:
      "Eliminare un pezzo di clip senza lasciare buchi neri in timeline (Elimina con increspatura, Shift+Canc), e capire la differenza con Canc.",
    step: editorSteps[1],
  },
} satisfies Record<string, { description: string; step: EditorStep }>;

export type PracticeScenarioId = keyof typeof PRACTICE_SCENARIOS;
export const PRACTICE_IDS = Object.keys(PRACTICE_SCENARIOS) as PracticeScenarioId[];

export const isPracticeId = (id: unknown): id is PracticeScenarioId =>
  typeof id === "string" && id in PRACTICE_SCENARIOS;
