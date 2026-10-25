import type { Lesson } from "@/lib/lessons/types";
import { primoTaglio } from "./primo-taglio";

export const lessons: Record<string, Lesson> = {
  [primoTaglio.id]: primoTaglio,
};

export const getLesson = (id: string): Lesson | undefined => lessons[id];
