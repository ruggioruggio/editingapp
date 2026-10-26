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

/** Contatori che alimentano obiettivi (totali) e quest (giornalieri). */
export type StatKey = "lessons" | "perfect" | "cuts" | "ripples" | "lessonXp" | "friendRequests";
export type Stats = Record<StatKey, number>;

export interface TodayState {
  day: string;
  stats: Stats;
  claimedQuests: string[];
}

/** Lo stato di gioco che viene sincronizzato con il database. */
export interface GameData {
  xp: number;
  completed: Record<string, { completedAt: string; times: number }>;
  streak: Streak;
  bestStreak: number;
  daily: DailyUsage;
  stats: Stats;
  today: TodayState;
  questsClaimed: number;
}

interface ProgressData extends GameData {
  /** arriva dal profilo sul server; in locale solo come simulazione */
  plan: PlanId;
  username: string | null;
  /** a quale account appartengono i dati locali (null = ospite) */
  ownerId: string | null;
  /** Pro regalato da un admin (dal profilo sul server) */
  proUntil: string | null;
  /** Pro attivato dal pannello admin su questo dispositivo */
  adminPro: boolean;
  bannedUntil: string | null;
  banReason: string | null;
}

interface ProgressState extends ProgressData {
  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, xp: number, perfect: boolean) => void;
  recordStat: (key: StatKey, amount?: number) => void;
  claimQuest: (questId: string, xp: number) => void;
  /** Test di salto superato: le lezioni saltate contano come completate. */
  completeLessons: (lessonIds: string[], xp: number) => void;
  /** Solo per sviluppo finché non c'è Stripe: simula il cambio piano. */
  setPlan: (plan: PlanId) => void;
  setAdminPro: (on: boolean) => void;
  reset: () => void;
}

export const emptyStats = (): Stats => ({ lessons: 0, perfect: 0, cuts: 0, ripples: 0, lessonXp: 0, friendRequests: 0 });

export const initialGameData = (): GameData => ({
  xp: 0,
  completed: {},
  streak: { count: 0, lastDay: null },
  bestStreak: 0,
  daily: { day: "", lessonIds: [] },
  stats: emptyStats(),
  today: { day: "", stats: emptyStats(), claimedQuests: [] },
  questsClaimed: 0,
});

const initial = (): ProgressData => ({ ...initialGameData(), plan: "free", username: null, ownerId: null, proUntil: null, adminPro: false, bannedUntil: null, banReason: null });

/** Statistiche di oggi, azzerate se il giorno salvato non è oggi. */
export function todayState(today: TodayState): TodayState {
  return today.day === todayKey() ? today : { day: todayKey(), stats: emptyStats(), claimedQuests: [] };
}

function bump(stats: Stats, delta: Partial<Stats>): Stats {
  const next = { ...emptyStats(), ...stats };
  for (const [k, v] of Object.entries(delta) as [StatKey, number][]) next[k] += v;
  return next;
}

export function pickGameData(s: GameData): GameData {
  const { xp, completed, streak, bestStreak, daily, stats, today, questsClaimed } = s;
  return { xp, completed, streak, bestStreak, daily, stats, today, questsClaimed };
}

/**
 * Progressi dell'utente. In locale con zustand/persist; quando l'utente
 * è loggato SupabaseSync li fonde con il database e li tiene allineati.
 */
export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      const addStats = (delta: Partial<Stats>) => {
        const { stats, today } = get();
        const t = todayState(today);
        set({ stats: bump(stats, delta), today: { ...t, stats: bump(t.stats, delta) } });
      };

      return {
        ...initial(),

        startLesson: (lessonId) => {
          const today = todayKey();
          const { daily } = get();
          const ids = daily.day === today ? daily.lessonIds : [];
          if (!ids.includes(lessonId)) set({ daily: { day: today, lessonIds: [...ids, lessonId] } });
        },

        completeLesson: (lessonId, xp, perfect) => {
          const today = todayKey();
          const { streak, completed, bestStreak } = get();
          const count =
            streak.lastDay === today ? streak.count : streak.lastDay === yesterdayKey() ? streak.count + 1 : 1;
          set((s) => ({
            xp: s.xp + xp,
            streak: { count, lastDay: today },
            bestStreak: Math.max(bestStreak, count),
            completed: {
              ...completed,
              [lessonId]: { completedAt: new Date().toISOString(), times: (completed[lessonId]?.times ?? 0) + 1 },
            },
          }));
          addStats({ lessons: 1, lessonXp: xp, perfect: perfect ? 1 : 0 });
        },

        completeLessons: (lessonIds, xp) => {
          const today = todayKey();
          const { streak, completed, bestStreak } = get();
          const count =
            streak.lastDay === today ? streak.count : streak.lastDay === yesterdayKey() ? streak.count + 1 : 1;
          const now = new Date().toISOString();
          const next = { ...completed };
          for (const id of lessonIds) next[id] = { completedAt: now, times: (completed[id]?.times ?? 0) + 1 };
          set((s) => ({ xp: s.xp + xp, streak: { count, lastDay: today }, bestStreak: Math.max(bestStreak, count), completed: next }));
          addStats({ lessons: 1, lessonXp: xp });
        },

        recordStat: (key, amount = 1) => addStats({ [key]: amount }),

        claimQuest: (questId, xp) => {
          const t = todayState(get().today);
          if (t.claimedQuests.includes(questId)) return;
          set((s) => ({
            xp: s.xp + xp,
            questsClaimed: s.questsClaimed + 1,
            today: { ...t, claimedQuests: [...t.claimedQuests, questId] },
          }));
        },

        setPlan: (plan) => set({ plan }),
        setAdminPro: (adminPro) => set({ adminPro }),
        // il Pro attivato dall'admin su questo dispositivo sopravvive al reset dei progressi
        reset: () => set({ ...initial(), adminPro: get().adminPro }),
      };
    },
    { name: "progress-v1", version: 1 },
  ),
);

/** La serie è "viva" solo se l'ultima lezione è di oggi o di ieri. */
export function currentStreak(streak: Streak): number {
  return streak.lastDay === todayKey() || streak.lastDay === yesterdayKey() ? streak.count : 0;
}
