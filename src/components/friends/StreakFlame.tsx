"use client";

import clsx from "clsx";
import { Flame } from "lucide-react";
import { flameTier } from "@/lib/gamification/streakFlame";

export function StreakFlame({ days, size = 18, withCount = true, className }: { days: number; size?: number; withCount?: boolean; className?: string }) {
  const tier = flameTier(days);
  const active = days > 0;
  return (
    <span className={clsx("inline-flex items-center gap-1 font-black tabular-nums", className)} style={{ color: active ? tier.color : undefined }} title={`${days}`}>
      <Flame size={size} fill={active ? tier.color : "none"} style={active ? { filter: `drop-shadow(0 0 ${size / 4}px ${tier.glow})` } : undefined} className={clsx(!active && "text-ink-mute")} />
      {withCount && days}
    </span>
  );
}
