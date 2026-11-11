// Shared-streak flame: its colour levels up at each milestone, so the badge itself shows how long you've lasted.
export type FlameTier = { min: number; color: string; glow: string };

export const FLAME_TIERS: FlameTier[] = [
  { min: 0, color: "#ff8a3d", glow: "#ffb27a" },
  { min: 10, color: "#ff4d4d", glow: "#ff8f8f" },
  { min: 30, color: "#ff4fa3", glow: "#ff9ccb" },
  { min: 50, color: "#b26bff", glow: "#d3a8ff" },
  { min: 100, color: "#3d9cf0", glow: "#8cc8ff" },
  { min: 200, color: "#2fd4c9", glow: "#8ff0ea" },
  { min: 365, color: "#ffc93c", glow: "#fff0a8" },
];

export function flameTier(days: number) {
  let tier = FLAME_TIERS[0];
  for (const t of FLAME_TIERS) if (days >= t.min) tier = t;
  const next = FLAME_TIERS[FLAME_TIERS.indexOf(tier) + 1] ?? null;
  return { ...tier, next };
}

export function messagePreview(kind: string | undefined, body: string, labels: { photo: string; voice: string; invite: string }) {
  if (kind === "image") return labels.photo;
  if (kind === "audio") return labels.voice;
  if (kind === "streak_invite") return labels.invite;
  return body;
}
