import { brand } from "@/config/brand";
import { features } from "@/config/features";
import { todayKey } from "@/lib/date";
import type { DailyUsage } from "@/lib/progress/store";

export type PlanId = "free" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthlyEur: number;
  priceYearlyEur: number;
  /** null = illimitate */
  dailyLessonLimit: number | null;
  aiAssistant: boolean;
  features: string[];
}

// Prezzi segnaposto: si decidono lato marketing, qui cambia solo il numero.
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthlyEur: 0,
    priceYearlyEur: 0,
    dailyLessonLimit: 5,
    aiAssistant: false,
    features: ["5 lezioni al giorno", "Esercizi nell'editor del browser", "Serie, XP e progressi", "Community Discord"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthlyEur: 7.99,
    priceYearlyEur: 59.99,
    dailyLessonLimit: null,
    aiAssistant: true,
    features: [
      "Lezioni illimitate",
      `${brand.aiName}: il tuo assistente di montaggio`,
      "Corsi avanzati: color e motion",
      "Ripasso mirato degli errori",
    ],
  },
};

export function lessonsUsedToday(daily: DailyUsage): number {
  return daily.day === todayKey() ? daily.lessonIds.length : 0;
}

/** Finché i pagamenti sono spenti, tutti sono sul piano gratuito. */
export const effectivePlan = (plan: PlanId): PlanId => (features.payments ? plan : "free");

/** Rifare una lezione già iniziata oggi non consuma un altro slot. */
export function canStartLesson(plan: PlanId, daily: DailyUsage, lessonId: string): boolean {
  const limit = PLANS[effectivePlan(plan)].dailyLessonLimit;
  if (limit === null) return true;
  if (daily.day === todayKey() && daily.lessonIds.includes(lessonId)) return true;
  return lessonsUsedToday(daily) < limit;
}

export const hasAiAssistant = (plan: PlanId) => features.squeakAi && PLANS[effectivePlan(plan)].aiAssistant;
