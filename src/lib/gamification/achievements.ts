import type { LucideIcon } from "lucide-react";
import { ArrowLeftToLine, BookOpen, Flame, Scissors, ScrollText, Target, UserPlus, Zap } from "lucide-react";

export interface AchievementInput {
  lessons: number;
  bestStreak: number;
  xp: number;
  cuts: number;
  ripples: number;
  perfect: number;
  quests: number;
  friendRequests: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: (target: number) => string;
  icon: LucideIcon;
  color: string;
  metric: keyof AchievementInput;
  tiers: number[];
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "studente", title: "Studente", description: (n) => `Completa ${n} lezioni`, icon: BookOpen, color: "#9999ff", metric: "lessons", tiers: [1, 5, 25, 50, 100] },
  { id: "fiamme", title: "In fiamme", description: (n) => `Raggiungi una serie di ${n} giorni`, icon: Flame, color: "#ff8a3d", metric: "bestStreak", tiers: [3, 7, 14, 30, 100] },
  { id: "accumulatore", title: "Accumulatore", description: (n) => `Guadagna ${n} XP`, icon: Zap, color: "#ffc93c", metric: "xp", tiers: [50, 250, 1000, 5000, 10000] },
  { id: "lama", title: "Lama affilata", description: (n) => `Fai ${n} tagli con la Lama`, icon: Scissors, color: "#ff5f5f", metric: "cuts", tiers: [10, 50, 200, 1000] },
  { id: "niente-buchi", title: "Niente buchi", description: (n) => `Usa ${n} volte l'eliminazione con increspatura`, icon: ArrowLeftToLine, color: "#2d8ceb", metric: "ripples", tiers: [5, 25, 100] },
  { id: "perfezionista", title: "Perfezionista", description: (n) => `Completa ${n} lezioni senza errori`, icon: Target, color: "#3ecf8e", metric: "perfect", tiers: [1, 5, 20, 50] },
  { id: "cacciatore", title: "Cacciatore di quest", description: (n) => `Completa ${n} quest`, icon: ScrollText, color: "#d291ff", metric: "quests", tiers: [1, 10, 50, 150] },
  { id: "socievole", title: "Socievole", description: (n) => `Invia ${n} richieste di amicizia`, icon: UserPlus, color: "#5ce1e6", metric: "friendRequests", tiers: [1, 5, 10] },
];

export function achievementLevel(a: Achievement, value: number) {
  const level = a.tiers.filter((t) => value >= t).length;
  const next = a.tiers[level] ?? null;
  return { level, next, max: a.tiers.length };
}

export const totalTiers = ACHIEVEMENTS.reduce((sum, a) => sum + a.tiers.length, 0);

export function achievementInput(s: {
  xp: number;
  bestStreak: number;
  questsClaimed: number;
  stats: { lessons: number; cuts: number; ripples: number; perfect: number; friendRequests?: number };
}): AchievementInput {
  return {
    lessons: s.stats.lessons,
    bestStreak: s.bestStreak,
    xp: s.xp,
    cuts: s.stats.cuts,
    ripples: s.stats.ripples,
    perfect: s.stats.perfect,
    quests: s.questsClaimed,
    friendRequests: s.stats.friendRequests ?? 0,
  };
}

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
