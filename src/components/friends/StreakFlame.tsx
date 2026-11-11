"use client";

import clsx from "clsx";
import { useId, type CSSProperties } from "react";
import { FLAME_TIERS, flameTier } from "@/lib/gamification/streakFlame";

/**
 * Upright, symmetric streak flame: a pointed flame with two side tongues, a gradient and a bright inner core.
 * Drawn on its own centre line so it never looks tilted next to text.
 */
export function FlameIcon({ size = 18, color = FLAME_TIERS[0].color, glow = FLAME_TIERS[0].glow, muted = false, className, style }: { size?: number; color?: string; glow?: string; muted?: boolean; className?: string; style?: CSSProperties }) {
  const id = useId().replace(/:/g, "");
  const top = muted ? "#9a9aa8" : glow;
  const bottom = muted ? "#6b6b78" : color;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={clsx("shrink-0", className)} style={{ display: "block", ...style }}>
      <defs>
        <linearGradient id={`${id}o`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={bottom} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${id}i`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={muted ? 0.35 : 0.75} />
          <stop offset="1" stopColor="#fff" stopOpacity={muted ? 0.55 : 0.98} />
        </linearGradient>
      </defs>
      <path d="M12 1.4C12.9 4.2 15.2 5.6 15.6 8.6C16.6 7.9 17.3 6.9 17.5 5.8C19.2 8 19.6 11.4 19.4 14.2C19.2 18.6 16 21.9 12 21.9C8 21.9 4.8 18.6 4.6 14.2C4.4 11.4 4.8 8 6.5 5.8C6.7 6.9 7.4 7.9 8.4 8.6C8.8 5.6 11.1 4.2 12 1.4Z" fill={`url(#${id}o)`} />
      <path d="M12 10.4C12.6 12.4 15.2 13.6 15.2 16.8C15.2 18.8 13.8 20.4 12 20.4C10.2 20.4 8.8 18.8 8.8 16.8C8.8 13.6 11.4 12.4 12 10.4Z" fill={`url(#${id}i)`} />
    </svg>
  );
}

export function StreakFlame({ days, size = 18, withCount = true, className }: { days: number; size?: number; withCount?: boolean; className?: string }) {
  const tier = flameTier(days);
  const active = days > 0;
  return (
    <span className={clsx("inline-flex items-center gap-1 font-black tabular-nums leading-none", className)} style={{ color: active ? tier.color : undefined }} title={`${days}`}>
      <FlameIcon size={size} color={tier.color} glow={tier.glow} muted={!active} style={active ? { filter: `drop-shadow(0 0 ${size / 5}px ${tier.glow}88)` } : undefined} />
      {withCount && days}
    </span>
  );
}
