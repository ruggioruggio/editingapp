"use client";

import { Clapperboard, Flame, Zap } from "lucide-react";
import { lessonsUsedToday, planOf, PLANS } from "@/lib/billing/plans";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { currentStreak, useProgress } from "@/lib/progress/store";

export function StatsBar() {
  const hydrated = useHydrated();
  const plan = useProgress((s) => planOf(s));
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => currentStreak(s.streak));
  const daily = useProgress((s) => s.daily);

  const limit = PLANS[plan].dailyLessonLimit;
  const left = limit === null ? "∞" : `${Math.max(0, limit - lessonsUsedToday(daily))}`;

  const items = [
    { title: "Giorni di serie", icon: Flame, value: streak, color: "text-[#ff8a3d]" },
    { title: "Punti esperienza", icon: Zap, value: xp, color: "text-cheese" },
    { title: "Lezioni rimaste oggi", icon: Clapperboard, value: left, color: "text-pr" },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map(({ title, icon: Icon, value, color }) => (
        <span key={title} title={title} className={`flex items-center gap-1 text-sm font-bold ${color}`}>
          <Icon size={18} />
          {hydrated ? value : "–"}
        </span>
      ))}
    </div>
  );
}
