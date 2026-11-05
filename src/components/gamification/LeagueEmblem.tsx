"use client";

import { useId } from "react";
import type { GemCut, LeagueTier } from "@/lib/gamification/leagues";

type Facet = { d: string; tone: 0 | 1 | 2; o?: number };

// Each cut: outline + facets drawn in light (0), base (1) or dark (2) tones, in a 100x100 box.
const CUTS: Record<GemCut, { outline: string; facets: Facet[] }> = {
  cabochon: {
    outline: "M50 18C72 18 84 36 84 52C84 70 70 82 50 82C30 82 16 70 16 52C16 36 28 18 50 18Z",
    facets: [
      { d: "M50 18C72 18 84 36 84 52C84 70 70 82 50 82C30 82 16 70 16 52C16 36 28 18 50 18Z", tone: 1 },
      { d: "M50 52C66 52 84 56 84 52C84 70 70 82 50 82C30 82 16 70 16 52C16 56 34 52 50 52Z", tone: 2 },
      { d: "M34 30C40 24 50 23 56 25C48 28 40 34 36 42C32 40 31 34 34 30Z", tone: 0, o: 0.9 },
    ],
  },
  oval: {
    outline: "M50 14C70 14 82 32 82 50C82 68 70 86 50 86C30 86 18 68 18 50C18 32 30 14 50 14Z",
    facets: [
      { d: "M50 14C70 14 82 32 82 50C82 68 70 86 50 86C30 86 18 68 18 50C18 32 30 14 50 14Z", tone: 1 },
      { d: "M50 30L64 42L64 58L50 70L36 58L36 42Z", tone: 0, o: 0.55 },
      { d: "M50 14C30 14 18 32 18 50L36 42L50 30Z", tone: 0, o: 0.8 },
      { d: "M82 50C82 68 70 86 50 86L50 70L64 58Z", tone: 2 },
      { d: "M18 50C18 68 30 86 50 86L50 70L36 58Z", tone: 2, o: 0.6 },
    ],
  },
  pear: {
    outline: "M50 10C58 24 80 42 80 60C80 76 66 88 50 88C34 88 20 76 20 60C20 42 42 24 50 10Z",
    facets: [
      { d: "M50 10C58 24 80 42 80 60C80 76 66 88 50 88C34 88 20 76 20 60C20 42 42 24 50 10Z", tone: 1 },
      { d: "M50 34L64 54L58 72L42 72L36 54Z", tone: 0, o: 0.5 },
      { d: "M50 10C42 24 20 42 20 60L36 54L50 34Z", tone: 0, o: 0.85 },
      { d: "M80 60C80 76 66 88 50 88L58 72L64 54Z", tone: 2 },
      { d: "M50 88C34 88 20 76 20 60L36 54L42 72Z", tone: 2, o: 0.55 },
    ],
  },
  emerald: {
    outline: "M30 14H70L84 28V72L70 86H30L16 72V28Z",
    facets: [
      { d: "M30 14H70L84 28V72L70 86H30L16 72V28Z", tone: 1 },
      { d: "M36 26H64L72 34V66L64 74H36L28 66V34Z", tone: 0, o: 0.45 },
      { d: "M30 14H70L64 26H36Z", tone: 0, o: 0.9 },
      { d: "M16 28L28 34V66L16 72Z", tone: 0, o: 0.6 },
      { d: "M84 28V72L72 66V34Z", tone: 2 },
      { d: "M30 86H70L64 74H36Z", tone: 2, o: 0.85 },
    ],
  },
  trillion: {
    outline: "M50 12L88 78C88 82 86 84 82 84H18C14 84 12 82 12 78Z",
    facets: [
      { d: "M50 12L88 78C88 82 86 84 82 84H18C14 84 12 82 12 78Z", tone: 1 },
      { d: "M50 36L68 70H32Z", tone: 0, o: 0.5 },
      { d: "M50 12L12 78L32 70L50 36Z", tone: 0, o: 0.85 },
      { d: "M50 12L88 78L68 70L50 36Z", tone: 2, o: 0.7 },
      { d: "M12 78C12 82 14 84 18 84H82C86 84 88 82 88 78L68 70H32Z", tone: 2 },
    ],
  },
  marquise: {
    outline: "M50 8C70 26 80 40 80 50C80 60 70 74 50 92C30 74 20 60 20 50C20 40 30 26 50 8Z",
    facets: [
      { d: "M50 8C70 26 80 40 80 50C80 60 70 74 50 92C30 74 20 60 20 50C20 40 30 26 50 8Z", tone: 1 },
      { d: "M50 28L62 50L50 72L38 50Z", tone: 0, o: 0.55 },
      { d: "M50 8C30 26 20 40 20 50H38L50 28Z", tone: 0, o: 0.9 },
      { d: "M80 50C80 60 70 74 50 92V72L62 50Z", tone: 2 },
      { d: "M20 50C20 60 30 74 50 92V72L38 50Z", tone: 2, o: 0.5 },
    ],
  },
  round: {
    outline: "M50 12L77 23L88 50L77 77L50 88L23 77L12 50L23 23Z",
    facets: [
      { d: "M50 12L77 23L88 50L77 77L50 88L23 77L12 50L23 23Z", tone: 1 },
      { d: "M50 30L64 36L70 50L64 64L50 70L36 64L30 50L36 36Z", tone: 0, o: 0.5 },
      { d: "M50 12L23 23L36 36L50 30Z", tone: 0, o: 0.95 },
      { d: "M23 23L12 50L30 50L36 36Z", tone: 0, o: 0.7 },
      { d: "M77 23L88 50L70 50L64 36Z", tone: 1, o: 0.9 },
      { d: "M88 50L77 77L64 64L70 50Z", tone: 2 },
      { d: "M77 77L50 88L50 70L64 64Z", tone: 2, o: 0.8 },
      { d: "M50 88L23 77L36 64L50 70Z", tone: 2, o: 0.55 },
    ],
  },
  heart: {
    outline: "M50 86C30 72 12 58 12 38C12 24 22 14 34 14C42 14 47 18 50 24C53 18 58 14 66 14C78 14 88 24 88 38C88 58 70 72 50 86Z",
    facets: [
      { d: "M50 86C30 72 12 58 12 38C12 24 22 14 34 14C42 14 47 18 50 24C53 18 58 14 66 14C78 14 88 24 88 38C88 58 70 72 50 86Z", tone: 1 },
      { d: "M50 34L64 44L58 62L50 70L42 62L36 44Z", tone: 0, o: 0.5 },
      { d: "M34 14C22 14 12 24 12 38L36 44L50 24C47 18 42 14 34 14Z", tone: 0, o: 0.9 },
      { d: "M88 38C88 58 70 72 50 86L58 62L64 44Z", tone: 2 },
      { d: "M66 14C58 14 53 18 50 24L64 44L88 38C88 24 78 14 66 14Z", tone: 1, o: 0.7 },
    ],
  },
};

export function LeagueEmblem({ tier, size = 40, sparkle = size >= 40 }: { tier: LeagueTier; size?: number; sparkle?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const cut = CUTS[tier.cut] ?? CUTS.round;
  const [light, base, dark] = tier.tones;
  const tones = [light, base, dark];
  const opal = tier.id === "opal";

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0 overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="55%" r="50%">
          <stop offset="0" stopColor={base} stopOpacity="0.45" />
          <stop offset="1" stopColor={base} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-iris`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7cf7ff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#ffe27a" stopOpacity="0.35" />
          <stop offset="0.65" stopColor="#ff8ad8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#8a7cff" stopOpacity="0.55" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={cut.outline} />
        </clipPath>
      </defs>
      {size >= 32 && <circle cx="50" cy="54" r="48" fill={`url(#${uid}-glow)`} />}
      <path d={cut.outline} transform="translate(0 4)" fill="#000" opacity="0.25" />
      <g clipPath={`url(#${uid}-clip)`}>
        {cut.facets.map((f, i) => (
          <path key={i} d={f.d} fill={tones[f.tone]} fillOpacity={f.o ?? 1} />
        ))}
        {opal && <path d={cut.outline} fill={`url(#${uid}-iris)`} style={{ mixBlendMode: "screen" }} />}
        <rect x="-60" y="0" width="30" height="100" fill="#fff" opacity="0.35" transform="skewX(-20)" className={sparkle ? "gem-shine" : undefined} style={sparkle ? undefined : { display: "none" }} />
      </g>
      <path d={cut.outline} fill="none" stroke={light} strokeOpacity="0.9" strokeWidth="2" strokeLinejoin="round" />
      {sparkle && (
        <path className="gem-twinkle" d="M74 16l2.2 5.8L82 24l-5.8 2.2L74 32l-2.2-5.8L66 24l5.8-2.2Z" fill="#fff" />
      )}
    </svg>
  );
}
