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
export type StatKey = "lessons" | "perfect" | "cuts" | "ripples" | "lessonXp";
export type Stats = Record<StatKey, number>;

export interface FriendRequest {
  username: string;
  sentAt: string;
}

interface ProgressData {
  plan: PlanId;
  xp: number;
  completed: Record<string, { completedAt: string; times: number }>;
  streak: Streak;
  bestStreak: number;
  daily: DailyUsage;
  stats: Stats;
  today: { day: string; stats: Stats; claimedQuests: string[] };
  questsClaimed: number;
  username: string | null;
  friendRequests: FriendRequest[];
}

interface ProgressState extends ProgressData {
  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, xp: number, perfect: boolean) => void;
  recordStat: (key: StatKey, amount?: number) => void;
  claimQuest: (questId: string, xp: number) => void;
  ensureUsername: () => void;
  sendFriendRequest: (username: string) => void;
  cancelFriendRequest: (username: string) => void;
  /** Solo per sviluppo finché non c'è Stripe: simula il cambio piano. */
  setPlan: (plan: PlanId) => void;
  reset: () => void;
}

const emptyStats = (): Stats => ({ lessons: 0, perfect: 0, cuts: 0, ripples: 0, lessonXp: 0 });

const initial: ProgressData = {
  plan: "free",
  xp: 0,
  completed: {},
  streak: { count: 0, lastDay: null },
  bestStreak: 0,
  daily: { day: "", lessonIds: [] },
  stats: emptyStats(),
  today: { day: "", stats: emptyStats(), claimedQuests: [] },
  questsClaimed: 0,
  username: null,
  friendRequests: [],
};

/** Statistiche di oggi, azzerate se il giorno salvato non è oggi. */
export function todayState(today: ProgressData["today"]) {
  return today.day === todayKey() ? today : { day: todayKey(), stats: emptyStats(), claimedQuests: [] };
}

function bump(stats: Stats, delta: Partial<Stats>): Stats {
  const next = { ...stats };
  for (const [k, v] of Object.entries(delta) as [StatKey, number][]) next[k] += v;
  return next;
}

/**
 * Progressi dell'utente. Per ora in localStorage; quando arriva l'auth
 * (Supabase) questo store diventa una cache sincronizzata col database.
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
        ...initial,

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

        ensureUsername: () => {
          if (!get().username) set({ username: `squeaker${Math.floor(1000 + Math.random() * 9000)}` });
        },

        sendFriendRequest: (username) => {
          const name = username.trim().toLowerCase();
          if (get().friendRequests.some((r) => r.username === name)) return;
          set((s) => ({ friendRequests: [{ username: name, sentAt: new Date().toISOString() }, ...s.friendRequests] }));
        },

        cancelFriendRequest: (username) =>
          set((s) => ({ friendRequests: s.friendRequests.filter((r) => r.username !== username) })),

        setPlan: (plan) => set({ plan }),
        reset: () => set({ ...initial }),
      };
    },
    { name: "progress-v1", version: 1 },
  ),
);

/** La serie è "viva" solo se l'ultima lezione è di oggi o di ieri. */
export function currentStreak(streak: Streak): number {
  return streak.lastDay === todayKey() || streak.lastDay === yesterdayKey() ? streak.count : 0;
}
