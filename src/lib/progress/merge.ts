import { emptyStats, initialGameData, type GameData, type Stats, type TodayState } from "./store";

const maxStats = (a: Stats, b: Stats): Stats => {
  const out = emptyStats();
  for (const k of Object.keys(out) as (keyof Stats)[]) out[k] = Math.max(a[k] ?? 0, b[k] ?? 0);
  return out;
};

const later = (a: string | null, b: string | null) => ((a ?? "") >= (b ?? "") ? a : b);

function mergeToday(a: TodayState, b: TodayState): TodayState {
  if (a.day !== b.day) return later(a.day, b.day) === a.day ? a : b;
  return {
    day: a.day,
    stats: maxStats(a.stats, b.stats),
    claimedQuests: [...new Set([...a.claimedQuests, ...b.claimedQuests])],
  };
}

export function normalizeGameData(raw: unknown): GameData {
  const base = initialGameData();
  if (!raw || typeof raw !== "object") return base;
  const d = raw as Partial<GameData>;
  return {
    ...base,
    ...d,
    stats: { ...base.stats, ...d.stats },
    today: { ...base.today, ...d.today, stats: { ...base.today.stats, ...d.today?.stats } },
  };
}

export function mergeGameData(a: GameData, b: GameData): GameData {
  const completed = { ...b.completed };
  for (const [id, entry] of Object.entries(a.completed)) {
    const other = completed[id];
    completed[id] = other
      ? { completedAt: later(entry.completedAt, other.completedAt) ?? entry.completedAt, times: Math.max(entry.times, other.times) }
      : entry;
  }

  const streak =
    a.streak.lastDay === b.streak.lastDay
      ? { lastDay: a.streak.lastDay, count: Math.max(a.streak.count, b.streak.count) }
      : later(a.streak.lastDay, b.streak.lastDay) === a.streak.lastDay
        ? a.streak
        : b.streak;

  const daily =
    a.daily.day === b.daily.day
      ? { day: a.daily.day, lessonIds: [...new Set([...a.daily.lessonIds, ...b.daily.lessonIds])] }
      : later(a.daily.day, b.daily.day) === a.daily.day
        ? a.daily
        : b.daily;

  return {
    xp: Math.max(a.xp, b.xp),
    completed,
    streak,
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    daily,
    stats: maxStats(a.stats, b.stats),
    today: mergeToday(a.today, b.today),
    questsClaimed: Math.max(a.questsClaimed, b.questsClaimed),
  };
}
