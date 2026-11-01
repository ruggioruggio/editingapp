"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Crown, Flame, Medal, Trophy, Zap } from "lucide-react";
import { useT } from "@/lib/settings/i18n";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { getTier, LEAGUE_TIERS, type LeagueTier } from "@/lib/gamification/leagues";
import { useProgress } from "@/lib/progress/store";
import { LeagueEmblem } from "@/components/gamification/LeagueEmblem";
import { FriendSheet } from "@/components/friends/FriendSheet";
import type { FriendProfile } from "@/lib/supabase/friends";

interface LeaderboardRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  streak_count: number;
}

function TierBadge({ tier }: { tier: LeagueTier }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-black text-ink-mute">
      <LeagueEmblem tier={tier} size={18} />
      {t(tier.nameKey)}
    </span>
  );
}

function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  if (url) return <img src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  const letter = (name || "?")[0].toUpperCase();
  return (
    <div className="grid place-items-center rounded-full bg-pr font-black text-pr-deep" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {letter}
    </div>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={20} className="text-[#ffc93c]" fill="currentColor" />;
  if (rank === 2) return <Medal size={20} className="text-[#c0c0c0]" fill="currentColor" />;
  if (rank === 3) return <Medal size={20} className="text-[#cd7f32]" fill="currentColor" />;
  return <span className="text-sm font-black text-ink-mute">{rank}</span>;
}

export function WorldLeaderboard() {
  const t = useT();
  const me = useAuth((s) => s.userId);
  const myXp = useProgress((s) => s.xp);
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [openProfile, setOpenProfile] = useState<FriendProfile | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { data, error: err } = await sb
        .from("profiles")
        .select("id, username, display_name, avatar_url, xp, streak_count")
        .order("xp", { ascending: false })
        .limit(50);
      if (err) throw err;
      setRows(data ?? []);
      if (me && data) {
        const idx = data.findIndex((r) => r.id === me);
        if (idx >= 0) setMyRank(idx + 1);
        else {
          const { count } = await sb.from("profiles").select("id", { count: "exact", head: true }).gt("xp", myXp);
          setMyRank((count ?? 0) + 1);
        }
      }
    } catch {
      setError(true);
    }
  }, [me, myXp]);

  useEffect(() => { void load(); }, [load]);

  const myTier = getTier(myXp);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Trophy size={28} className="text-cheese" />
        <h1 className="text-xl font-black">{t("worldLeaderboard")}</h1>
      </div>

      <div className="mb-6 rounded-2xl border border-line bg-panel p-5">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-dim">{t("yourLeague")}</p>
          <div className="my-3">
            <LeagueEmblem tier={myTier} size={80} />
          </div>
          <p className="text-lg font-black">{t(myTier.nameKey)}</p>
          {myRank && (
            <p className="mt-1 text-sm font-bold text-ink-mute">#{myRank} · {myXp} XP</p>
          )}
        </div>
        <div className="mt-4">
          <div className="flex gap-1.5 justify-center flex-wrap">
            {LEAGUE_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={clsx(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all",
                  tier.id === myTier.id ? "bg-panel-2" : "opacity-50",
                )}
              >
                <LeagueEmblem tier={tier} size={24} />
                <span className="text-[9px] font-bold text-ink-mute">{t(tier.nameKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-ink-dim">{t("topPlayers")}</h2>

      {error && <p className="py-10 text-center text-sm text-danger">{t("loadLeaderboardFailed")}</p>}
      {!error && !rows && <div className="h-40 animate-pulse rounded-2xl bg-panel" />}
      {rows?.length === 0 && <p className="py-10 text-center text-sm text-ink-mute">{t("noPlayersYet")}</p>}

      <ul className="space-y-2">
        {rows?.map((row, i) => {
          const rank = i + 1;
          const tier = getTier(row.xp);
          const isMe = row.id === me;
          return (
            <li
              key={row.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (isMe) return;
                setOpenProfile({
                  id: row.id,
                  username: row.username,
                  display_name: row.display_name,
                  bio: null,
                  avatar_url: row.avatar_url,
                  xp: row.xp,
                  streak_count: row.streak_count,
                  streak_last_day: null,
                  role: null,
                  created_at: null,
                });
              }}
              className={clsx(
                "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
                isMe ? "border-accent/40 bg-accent/10" : "border-line bg-panel cursor-pointer hover:bg-panel-2",
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center">{<RankIcon rank={rank} />}</span>
              <Avatar name={row.username} url={row.avatar_url} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  @{row.username}
                  {isMe && <span className="ml-1 text-xs text-accent">({t("you")})</span>}
                </p>
                <div className="flex items-center gap-2 text-xs text-ink-mute">
                  <TierBadge tier={tier} />
                  <span className="flex items-center gap-0.5">
                    <Flame size={11} className="text-[#ff8a3d]" /> {row.streak_count}
                  </span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-sm font-black text-cheese">
                <Zap size={14} /> {row.xp}
              </span>
            </li>
          );
        })}
      </ul>

      {openProfile && me && (
        <FriendSheet
          me={me}
          friend={openProfile}
          sharedStreak={0}
          streak={openProfile.streak_count}
          onClose={() => setOpenProfile(null)}
          onRead={() => {}}
        />
      )}
    </div>
  );
}
