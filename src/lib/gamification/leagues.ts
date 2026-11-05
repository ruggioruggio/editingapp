import type { TKey } from "@/lib/settings/i18n";

export type GemCut = "cabochon" | "emerald" | "oval" | "trillion" | "round" | "pear" | "marquise" | "heart";

export interface LeagueTier {
  id: string;
  nameKey: TKey;
  minXp: number;
  color: string;
  gradient: string;
  /** light, base, dark facet tones */
  tones: [string, string, string];
  cut: GemCut;
}

const tier = (id: string, nameKey: TKey, minXp: number, cut: GemCut, tones: [string, string, string]): LeagueTier => ({
  id,
  nameKey,
  minXp,
  cut,
  tones,
  color: tones[1],
  gradient: `from-[${tones[0]}] to-[${tones[2]}]`,
});

export const LEAGUE_TIERS: LeagueTier[] = [
  tier("obsidian", "tierObsidian", 0, "cabochon", ["#8a8fa8", "#3d4058", "#1b1c2a"]),
  tier("jade", "tierJade", 500, "oval", ["#a8f0c6", "#3fbf7f", "#1d7a4c"]),
  tier("turquoise", "tierTurquoise", 1500, "pear", ["#b5f6f2", "#3fd0c9", "#1a8a8a"]),
  tier("amethyst", "tierAmethyst", 3000, "emerald", ["#e2c6ff", "#9b5de5", "#5b2a9e"]),
  tier("lapis", "tierLapis", 6000, "trillion", ["#a9c4ff", "#3557d4", "#16257a"]),
  tier("topaz", "tierTopaz", 12000, "marquise", ["#ffe6a8", "#ffb43c", "#c06a00"]),
  tier("aquamarine", "tierAquamarine", 25000, "round", ["#d9fbff", "#6fd8f2", "#2a8fb8"]),
  tier("opal", "tierOpal", 50000, "heart", ["#fff3fb", "#f7a8e0", "#7c7cff"]),
];

export function getTier(xp: number): LeagueTier {
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEAGUE_TIERS[i].minXp) return LEAGUE_TIERS[i];
  }
  return LEAGUE_TIERS[0];
}

export function getNextTier(xp: number): LeagueTier | null {
  const current = getTier(xp);
  const idx = LEAGUE_TIERS.indexOf(current);
  return idx < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[idx + 1] : null;
}
