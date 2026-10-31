import { allLessons, sections } from "@/content/course";
import { getLesson } from "@/content/lessons";
import type { Lesson, QuizStep, Unit } from "./types";

// Regole di avanzamento: le lezioni si sbloccano in ordine, e un test
// permette di saltare avanti di unità rispondendo sugli argomenti saltati.

type Completed = Record<string, unknown>;

const order = allLessons.map((l) => l.id);

/** Una lezione è sbloccata se è la prima o se quella prima è completata. */
export function isLessonUnlocked(lessonId: string, completed: Completed): boolean {
  const i = order.indexOf(lessonId);
  return i <= 0 || Boolean(completed[order[i - 1]]);
}

const units = sections.flatMap((s) => s.units);

export const findUnit = (unitId: string): Unit | undefined => units.find((u) => u.id === unitId);

/** Si può saltare a un'unità solo all'interno della stessa sezione (non tra sezioni). */
export function canSkipTo(unitId: string, completed: Completed): boolean {
  const unit = findUnit(unitId);
  if (!unit || unit.lessons.some((l) => l.status !== "available")) return false;
  if (isLessonUnlocked(unit.lessons[0].id, completed)) return false;
  const section = sections.find((s) => s.units.some((u) => u.id === unitId));
  if (!section) return false;
  const firstLesson = section.units[0]?.lessons[0];
  if (!firstLesson) return false;
  return isLessonUnlocked(firstLesson.id, completed) || Boolean(completed[firstLesson.id]);
}

/** Lezioni che il test di salto copre: tutte quelle non completate prima dell'unità. */
export function skippedLessons(unitId: string, completed: Completed): string[] {
  const unit = findUnit(unitId);
  if (!unit) return [];
  const end = order.indexOf(unit.lessons[0].id);
  return order.slice(0, end).filter((id) => !completed[id]);
}

export const UNIT_TEST_MAX_QUESTIONS = 15;
export const UNIT_TEST_HEARTS = 3;

/**
 * Il test: domande prese a giro da tutte le lezioni saltate (prima una per
 * lezione, poi le altre), così copre la maggior parte degli argomenti.
 */
export function buildUnitTest(unitId: string, completed: Completed): Lesson | null {
  const unit = findUnit(unitId);
  const lessonIds = skippedLessons(unitId, completed);
  if (!unit || lessonIds.length === 0) return null;
  const pools = lessonIds.map((id) => (getLesson(id)?.steps.filter((s): s is QuizStep => s.kind === "quiz") ?? []).slice());
  const steps: QuizStep[] = [];
  for (let round = 0; steps.length < UNIT_TEST_MAX_QUESTIONS && pools.some((p) => p.length); round++) {
    for (const pool of pools) {
      const q = pool.shift();
      if (q) steps.push(q);
      if (steps.length >= UNIT_TEST_MAX_QUESTIONS) break;
    }
  }
  return {
    id: `test-${unitId}`,
    title: `Salta a: ${unit.title}`,
    summary: "Test di salto",
    minutes: 5,
    xp: 30,
    steps,
  };
}
