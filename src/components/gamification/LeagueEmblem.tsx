"use client";

import type { LeagueTier } from "@/lib/gamification/leagues";

const TIER_ICONS: Record<string, string> = {
  malachite: "M50 22L62 34L74 46L62 58L50 70L38 58L26 46L38 34Z",
  larimar: "M50 18C56 18 68 28 68 42C68 56 50 74 50 74C50 74 32 56 32 42C32 28 44 18 50 18Z",
  labradorite: "M50 16L58 36L80 36L62 50L70 72L50 56L30 72L38 50L20 36L42 36Z",
  tanzanite: "M50 14L64 30H78L70 48L78 66H64L50 82L36 66H22L30 48L22 30H36Z",
  alexandrite: "M50 12L66 28L82 50L66 72L50 88L34 72L18 50L34 28Z",
  moldavite: "M50 10L62 22L78 18L72 34L86 46L74 56L80 72L66 68L50 82L34 68L20 72L26 56L14 46L28 34L22 18L38 22Z",
  painite: "M50 8L60 20L76 14L74 32L90 42L78 54L84 72L68 70L56 84L50 86L44 84L32 70L16 72L22 54L10 42L26 32L24 14L40 20Z",
  grandidierite: "M50 6L64 18L82 12L80 32L96 44L84 58L90 78L72 74L58 90L50 92L42 90L28 74L10 78L16 58L4 44L20 32L18 12L36 18Z",
};

export function LeagueEmblem({ tier, size = 40 }: { tier: LeagueTier; size?: number }) {
  const colors = tier.gradient.match(/#[0-9a-fA-F]{6}/g) ?? [tier.color, tier.color];
  const c1 = colors[0];
  const c2 = colors[1] ?? colors[0];
  const id = `emblem-${tier.id}`;
  const iconPath = TIER_ICONS[tier.id] ?? TIER_ICONS.malachite;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0.15" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={c2} floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Shield shape */}
      <path
        d="M50 6C50 6 18 10 18 10C18 10 14 50 14 50C14 68 30 84 50 96C70 84 86 68 86 50C86 50 82 10 82 10C82 10 50 6 50 6Z"
        fill={`url(#${id}-bg)`}
        filter={`url(#${id}-shadow)`}
      />
      <path
        d="M50 6C50 6 18 10 18 10C18 10 14 50 14 50C14 68 30 84 50 96C70 84 86 68 86 50C86 50 82 10 82 10C82 10 50 6 50 6Z"
        fill={`url(#${id}-shine)`}
      />
      {/* Border */}
      <path
        d="M50 6C50 6 18 10 18 10C18 10 14 50 14 50C14 68 30 84 50 96C70 84 86 68 86 50C86 50 82 10 82 10C82 10 50 6 50 6Z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      {/* Inner icon */}
      <g transform="translate(0, 2) scale(0.58)" style={{ transformOrigin: "50px 46px" }}>
        <path d={iconPath} fill="#fff" fillOpacity="0.9" />
      </g>
    </svg>
  );
}
