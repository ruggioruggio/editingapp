import type { Lesson } from "@/lib/lessons/types";
import { primoTaglio } from "./primo-taglio";
import { withPractice } from "./s1-practice";
import { section1Lessons } from "./section1";
import { section2Lessons } from "./section2";
import { section3Lessons } from "./section3";
import { section4Lessons } from "./section4";
import { section5Lessons } from "./section5";

export const lessons: Record<string, Lesson> = Object.fromEntries(
  [
    { ...primoTaglio, steps: withPractice(primoTaglio.id, primoTaglio.steps) },
    ...section1Lessons,
    ...section2Lessons,
    ...section3Lessons,
    ...section4Lessons,
    ...section5Lessons,
  ].map((lesson) => [lesson.id, lesson]),
);

export const getLesson = (id: string): Lesson | undefined => lessons[id];
