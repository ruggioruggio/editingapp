import type { Lesson } from "@/lib/lessons/types";
import type { Lang } from "@/lib/settings/store";
import { primoTaglio } from "./primo-taglio";
import { withPractice } from "./s1-practice";
import { getLessonTranslationsSync } from "./i18n";
import { translateLesson } from "./i18n/types";
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

export function getLesson(id: string, lang?: Lang): Lesson | undefined {
  const lesson = lessons[id];
  if (!lesson || !lang || lang === "it") return lesson;
  const translations = getLessonTranslationsSync(lang);
  return translations ? translateLesson(lesson, translations) : lesson;
}
