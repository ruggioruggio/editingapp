import type { TKey } from "@/lib/settings/i18n";

export interface LeagueTier {
  id: string;
  nameKey: TKey;
  minXp: number;
  color: string;
  gradient: string;
}

export const LEAGUE_TIERS: LeagueTier[] = [
  { id: "malachite",      nameKey: "tierMalachite",      minXp: 0,     color: "#3ecf8e", gradient: "from-[#3ecf8e] to-[#2a9d6a]" },
  { id: "larimar",         nameKey: "tierLarimar",         minXp: 500,   color: "#7ec8e3", gradient: "from-[#7ec8e3] to-[#5ba3c4]" },
  { id: "labradorite",     nameKey: "tierLabradorite",     minXp: 1500,  color: "#6b5cff", gradient: "from-[#6b5cff] to-[#4a3fcc]" },
  { id: "tanzanite",       nameKey: "tierTanzanite",       minXp: 3000,  color: "#9b59b6", gradient: "from-[#9b59b6] to-[#7d3c98]" },
  { id: "alexandrite",     nameKey: "tierAlexandrite",     minXp: 6000,  color: "#1abc9c", gradient: "from-[#1abc9c] to-[#16a085]" },
  { id: "moldavite",       nameKey: "tierMoldavite",       minXp: 12000, color: "#2ecc71", gradient: "from-[#2ecc71] to-[#1a9850]" },
  { id: "painite",         nameKey: "tierPainite",         minXp: 25000, color: "#e74c3c", gradient: "from-[#e74c3c] to-[#c0392b]" },
  { id: "grandidierite",   nameKey: "tierGrandidierite",   minXp: 50000, color: "#00bcd4", gradient: "from-[#00bcd4] to-[#00838f]" },
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
