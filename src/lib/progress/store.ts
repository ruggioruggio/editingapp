import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlanId } from "@/lib/billing/plans";
import { todayKey, yesterdayKey } from "@/lib/date";

export interface DailyUsage {
  day: string;
  lessonIds: string[];
}

export interface Streak {
  count: number;
  lastDay: string | null;
}

interface ProgressData {
  plan: PlanId;
  xp: number;
  completed: Record<string, { completedAt: string; times: number }>;
  streak: Streak;
  daily: DailyUsage;
}

interface ProgressState extends ProgressData {
  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, xp: number) => void;
  /** Solo per sviluppo finché non c'è Stripe: simula il cambio piano. */
  setPlan: (plan: PlanId) => void;
  reset: () => void;
}

const initial: ProgressData = {
  plan: "free",
  xp: 0,
  completed: {},
  streak: { count: 0, lastDay: null },
  daily: { day: "", lessonIds: [] },
};

/**
 * Progressi dell'utente. Per ora in localStorage; quando arriva l'auth
 * (Supabase) questo store diventa una cache sincronizzata col database.
 */
export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      startLesson: (lessonId) => {
        const today = todayKey();
        const { daily } = get();
        const ids = daily.day === today ? daily.lessonIds : [];
        if (!ids.includes(lessonId)) set({ daily: { day: today, lessonIds: [...ids, lessonId] } });
      },

      completeLesson: (lessonId, xp) => {
        const today = todayKey();
        const { streak, completed } = get();
        const count =
          streak.lastDay === today ? streak.count : streak.lastDay === yesterdayKey() ? streak.count + 1 : 1;
        set((s) => ({
          xp: s.xp + xp,
          streak: { count, lastDay: today },
          completed: {
            ...completed,
            [lessonId]: { completedAt: new Date().toISOString(), times: (completed[lessonId]?.times ?? 0) + 1 },
          },
        }));
      },

      setPlan: (plan) => set({ plan }),
      reset: () => set({ ...initial }),
    }),
    { name: "progress-v1", version: 1 },
  ),
);

/** La serie è "viva" solo se l'ultima lezione è di oggi o di ieri. */
export function currentStreak(streak: Streak): number {
  return streak.lastDay === todayKey() || streak.lastDay === yesterdayKey() ? streak.count : 0;
}
