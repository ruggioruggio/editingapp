import type { StatKey, Stats } from "@/lib/progress/store";

export interface Quest {
  id: string;
  title: string;
  stat: StatKey;
  target: number;
  xp: number;
}

const POOL: Quest[] = [
  { id: "lessons-1", title: "Completa 1 lezione", stat: "lessons", target: 1, xp: 10 },
  { id: "lessons-2", title: "Completa 2 lezioni", stat: "lessons", target: 2, xp: 20 },
  { id: "lessons-3", title: "Completa 3 lezioni", stat: "lessons", target: 3, xp: 30 },
  { id: "xp-15", title: "Guadagna 15 XP con le lezioni", stat: "lessonXp", target: 15, xp: 10 },
  { id: "xp-40", title: "Guadagna 40 XP con le lezioni", stat: "lessonXp", target: 40, xp: 25 },
  { id: "cuts-5", title: "Fai 5 tagli con la Lama", stat: "cuts", target: 5, xp: 10 },
  { id: "cuts-15", title: "Fai 15 tagli con la Lama", stat: "cuts", target: 15, xp: 20 },
  { id: "ripples-2", title: "Elimina con increspatura 2 volte", stat: "ripples", target: 2, xp: 10 },
  { id: "perfect-1", title: "Completa una lezione senza errori", stat: "perfect", target: 1, xp: 20 },
];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function questsForDay(day: string): Quest[] {
  const rest = POOL.filter((q) => !q.id.startsWith("lessons-"));
  const lesson = POOL.filter((q) => q.id.startsWith("lessons-"))[hash(day) % 3];
  const picked: Quest[] = [lesson];
  let seed = hash(day + "q");
  for (let i = 0; picked.length < 3 && i < 200; i++) {
    const q = rest[seed % rest.length];
    if (!picked.some((p) => p.stat === q.stat)) picked.push(q);
    seed = (seed * 1103515245 + 12345) >>> 0;
  }
  return picked;
}

export const questProgress = (q: Quest, stats: Stats) => Math.min(stats[q.stat], q.target);
