"use client";

import clsx from "clsx";
import { Star } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { ACHIEVEMENTS, achievementLevel, totalTiers, type AchievementInput } from "@/lib/gamification/achievements";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useProgress } from "@/lib/progress/store";

export function GoalsGrid() {
  const hydrated = useHydrated();
  const s = useProgress();

  if (!hydrated) return <div className="h-96" />;

  const input: AchievementInput = {
    lessons: s.stats.lessons,
    bestStreak: s.bestStreak,
    xp: s.xp,
    cuts: s.stats.cuts,
    ripples: s.stats.ripples,
    perfect: s.stats.perfect,
    quests: s.questsClaimed,
    friendRequests: s.stats.friendRequests ?? 0,
  };
  const unlocked = ACHIEVEMENTS.reduce((sum, a) => sum + achievementLevel(a, input[a.metric]).level, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-3xl border border-cheese/40 bg-linear-to-br from-cheese/15 to-panel p-5">
        <Mascot size={84} idle mood="wow" />
        <div className="flex-1">
          <p className="text-sm font-bold text-ink-dim">Traguardi sbloccati</p>
          <p className="text-4xl font-black text-cheese">
            {unlocked}
            <span className="text-xl text-ink-mute"> / {totalTiers}</span>
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-panel-3">
            <div className="h-full rounded-full bg-cheese" style={{ width: `${(unlocked / totalTiers) * 100}%` }} />
          </div>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const value = input[a.metric];
          const { level, next, max } = achievementLevel(a, value);
          const prev = level > 0 ? a.tiers[level - 1] : 0;
          const pct = next === null ? 100 : ((value - prev) / (next - prev)) * 100;
          const Icon = a.icon;
          return (
            <li key={a.id} className="flex gap-4 rounded-2xl border border-line bg-panel p-4">
              <div
                className={clsx("grid h-16 w-16 shrink-0 place-items-center rounded-2xl", level === 0 && "grayscale")}
                style={{ background: `${a.color}22`, color: a.color, boxShadow: level > 0 ? `0 0 0 2px ${a.color}66` : undefined }}
              >
                <Icon size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">{a.title}</p>
                  <span className="flex">
                    {Array.from({ length: max }, (_, i) => (
                      <Star key={i} size={13} className={i < level ? "text-cheese" : "text-panel-3"} fill="currentColor" />
                    ))}
                  </span>
                </div>
                <p className="text-sm text-ink-dim">{next === null ? "Completato al massimo livello!" : a.description(next)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-3">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: a.color }} />
                  </div>
                  <span className="text-xs font-bold text-ink-mute">
                    {value}/{next ?? a.tiers[max - 1]}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
