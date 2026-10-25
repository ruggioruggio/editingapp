import type { Lesson } from "@/lib/lessons/types";
import { primoTaglio } from "./primo-taglio";
import { section1Lessons } from "./section1";

export const lessons: Record<string, Lesson> = Object.fromEntries(
  [primoTaglio, ...section1Lessons].map((lesson) => [lesson.id, lesson]),
);

export const getLesson = (id: string): Lesson | undefined => lessons[id];
