"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Flame, Star, UserCheck, UserPlus, UserRoundPlus, Users, X, Zap } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/supabase/auth";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";
import { getSupabase } from "@/lib/supabase/client";
import { loadFriendRelation, sendFriendRequest, type FriendProfile, type FriendRelation } from "@/lib/supabase/friends";
import { loadFriendAchievements } from "@/lib/supabase/social";
import { ChatView } from "./ChatView";
import { StreakFlame } from "./StreakFlame";
import { useT } from "@/lib/settings/i18n";
import { useSettings } from "@/lib/settings/store";
import { getTier } from "@/lib/gamification/leagues";
import { LeagueEmblem } from "@/components/gamification/LeagueEmblem";

const LOCALE_MAP: Record<string, string> = { it: "it-IT", en: "en-US", fr: "fr-FR", es: "es-ES", zh: "zh-CN" };

export function FriendSheet({
  me,
  friend,
  sharedStreak,
  streak,
  onClose,
  onRead,
}: {
  me: string | null;
  friend: FriendProfile;
  sharedStreak: number;
  streak: number;
  onClose: () => void;
  onRead: () => void;
}) {
  const t = useT();
  const [tab, setTab] = useState<"profile" | "chat" | "goals">("profile");
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const friendTier = getTier(friend.xp);

  const isGuest = !me;

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void Promise.resolve(sb.from("follows").select("id", { count: "exact", head: true }).eq("following_id", friend.id)).then(({ count }) => setFollowerCount(count ?? 0)).catch(() => {});
    if (me) void Promise.resolve(sb.from("follows").select("id").eq("follower_id", me).eq("following_id", friend.id).maybeSingle()).then(({ data }) => setIsFollowing(!!data)).catch(() => {});
  }, [friend.id, me]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`@${friend.username}`} className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="animate-pop flex h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-app sm:h-[80dvh] sm:rounded-3xl">
        <header className="border-b border-line p-4">
          <div className="flex items-center gap-3">
            {friend.avatar_url ? (
              <img src={friend.avatar_url} alt={friend.username} className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pr text-lg font-black uppercase text-pr-deep">
                {friend.username[0]}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black">
                @{friend.username}
                {friend.role && (
                  <span className="ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[11px] font-bold" style={{ backgroundColor: `${ROLE_COLORS[friend.role as UserRole]}25`, color: ROLE_COLORS[friend.role as UserRole] }}>
                    {ROLE_LABELS[friend.role as UserRole]}
                  </span>
                )}
              </p>
              <p className="flex items-center gap-3 text-xs font-bold text-ink-mute">
                <span className="flex items-center gap-1 text-cheese">
                  <Zap size={13} /> {friend.xp} XP
                </span>
                <span className="flex items-center gap-1 text-[#ff8a3d]">
                  <Flame size={13} /> {streak} {t("days")}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={13} /> {followerCount} {t("follower")}
                </span>
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-ink-mute">
                <LeagueEmblem tier={friendTier} size={14} />
                {t(friendTier.nameKey)}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label={t("close")} className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute hover:bg-panel-2 hover:text-ink">
              <X size={20} />
            </button>
          </div>
          {!isGuest && <><div className={clsx("mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold", sharedStreak > 0 ? "bg-[#ff8a3d]/15 text-[#ffb27a]" : "bg-panel text-ink-mute")}>
            <StreakFlame days={sharedStreak} size={18} withCount={false} />
            {sharedStreak > 0
              ? `${t("sharedStreakLabel")}: ${sharedStreak} ${sharedStreak === 1 ? t("day") : t("days")}. ${t("sharedStreakActive")}`
              : t("noSharedStreak")}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-panel p-1 text-sm font-black">
            {(["profile", "chat", "goals"] as const).map((tb) => (
              <button
                key={tb}
                type="button"
                onClick={() => setTab(tb)}
                className={clsx("rounded-lg py-1.5", tab === tb ? "bg-panel-3 text-ink" : "text-ink-mute hover:text-ink")}
              >
                {tb === "profile" ? t("profile") : tb === "chat" ? t("chat") : t("goalsTab")}
              </button>
            ))}
          </div></>}
        </header>
        {isGuest || !me ? (
          <FriendProfileTab friend={friend} me={null} isFollowing={false} followerCount={followerCount} followBusy={false} onToggleFollow={() => {}} />
        ) : tab === "profile" ? (
          <FriendProfileTab friend={friend} me={me} isFollowing={isFollowing} followerCount={followerCount} followBusy={followBusy} onToggleFollow={async () => {
            const sb = getSupabase();
            if (!sb) return;
            setFollowBusy(true);
            try {
              if (isFollowing) {
                await sb.from("follows").delete().eq("follower_id", me).eq("following_id", friend.id);
                setIsFollowing(false);
                setFollowerCount((c) => Math.max(0, c - 1));
              } else {
                await sb.from("follows").insert({ follower_id: me, following_id: friend.id });
                setIsFollowing(true);
                setFollowerCount((c) => c + 1);
              }
            } catch {}
            setFollowBusy(false);
          }} />
        ) : tab === "chat" ? <Chat me={me} friend={friend} onRead={onRead} /> : <FriendGoals friend={friend} />}
      </div>
    </div>
  );
}

export function Chat(props: { me: string; friend: FriendProfile; onRead: () => void }) {
  return <ChatView {...props} />;
}

function FriendProfileTab({ friend, me, isFollowing, followerCount, followBusy, onToggleFollow }: { friend: FriendProfile; me: string | null; isFollowing: boolean; followerCount: number; followBusy: boolean; onToggleFollow: () => void }) {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const locale = LOCALE_MAP[lang] ?? "en-US";
  const tier = getTier(friend.xp);
  const joinDate = friend.created_at ? new Date(friend.created_at).toLocaleDateString(locale, { month: "long", year: "numeric" }) : null;
  const [followingCount, setFollowingCount] = useState(0);
  const [relation, setRelation] = useState<FriendRelation | null>(null);
  const [friendBusy, setFriendBusy] = useState(false);
  const [friendError, setFriendError] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void Promise.resolve(sb.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", friend.id)).then(({ count }) => setFollowingCount(count ?? 0)).catch(() => {});
    setRelation(null);
    if (me) loadFriendRelation(sb, me, friend.id).then(setRelation).catch(() => setRelation("none"));
  }, [friend.id, me]);

  const friendAction = async () => {
    const sb = getSupabase();
    if (!sb || !me) return;
    setFriendBusy(true);
    setFriendError(false);
    try {
      await sendFriendRequest(sb, me, friend.username);
      // show what the database now holds, not what we hope happened
      setRelation(await loadFriendRelation(sb, me, friend.id));
    } catch {
      setFriendError(true);
    }
    setFriendBusy(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex flex-col items-center text-center">
        {friend.avatar_url ? (
          <img src={friend.avatar_url} alt={friend.username} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="grid h-20 w-20 place-items-center rounded-full bg-pr text-2xl font-black uppercase text-pr-deep">
            {friend.username[0]}
          </span>
        )}
        <p className="mt-2 text-lg font-black">@{friend.username}</p>
        {friend.bio && <p className="mt-1 text-sm text-ink-dim">{friend.bio}</p>}
        {joinDate && <p className="text-xs text-ink-mute">{t("joinedSince")} {joinDate}</p>}
        <div className="mt-1 flex items-center gap-1">
          <LeagueEmblem tier={tier} size={18} />
          <span className="text-xs font-bold text-ink-mute">{t(tier.nameKey)}</span>
        </div>
        {me && <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={followBusy}
            onClick={onToggleFollow}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black transition-colors disabled:opacity-50",
              isFollowing ? "bg-panel-2 text-ink-dim hover:bg-panel-3" : "bg-accent text-white hover:bg-accent/80",
            )}
          >
            {isFollowing ? <><UserCheck size={16} /> {t("following")}</> : <><UserPlus size={16} /> {t("follow")}</>}
          </button>
          <button
            type="button"
            disabled={friendBusy || relation === null || relation === "sent" || relation === "friends"}
            onClick={friendAction}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors disabled:opacity-60",
              relation === "sent" || relation === "friends" ? "bg-success/20 text-success" : relation === "incoming" ? "bg-success text-[#08311f]" : "bg-panel-2 text-ink hover:bg-panel-3",
            )}
          >
            {relation === "friends" ? <UserCheck size={16} /> : <UserRoundPlus size={16} />}
            {relation === "sent" ? t("friendRequestSent") : relation === "friends" ? t("friendsBadge") : relation === "incoming" ? t("accept") : t("sendFriendRequest")}
          </button>
        </div>}
        {friendError && <p className="mt-2 text-sm font-semibold text-danger">{t("sendFailed")}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-panel-2 p-3">
          <p className="text-lg font-black text-cheese">{friend.xp}</p>
          <p className="text-[11px] font-bold text-ink-mute">XP</p>
        </div>
        <div className="rounded-xl bg-panel-2 p-3">
          <p className="text-lg font-black">{followerCount}</p>
          <p className="text-[11px] font-bold text-ink-mute">{t("follower")}</p>
        </div>
        <div className="rounded-xl bg-panel-2 p-3">
          <p className="text-lg font-black">{followingCount}</p>
          <p className="text-[11px] font-bold text-ink-mute">{t("following")}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <span className="flex items-center gap-1 rounded-xl bg-panel-2 px-3 py-1.5 text-sm font-bold text-[#ff8a3d]">
          <Flame size={16} /> {friend.streak_count} {t("days")}
        </span>
      </div>
    </div>
  );
}

function FriendGoals({ friend }: { friend: FriendProfile }) {
  const t = useT();
  const sb = getSupabase();
  const [levels, setLevels] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!sb) { setLevels({}); return; }
    let alive = true;
    loadFriendAchievements(sb, friend.id).then((l) => alive && setLevels(l)).catch(() => alive && setLevels({}));
    return () => {
      alive = false;
    };
  }, [sb, friend.id]);

  if (!levels) return <div className="m-4 h-40 animate-pulse rounded-2xl bg-panel" />;
  const unlocked = Object.values(levels).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="mb-3 text-sm font-bold text-ink-dim">
        @{friend.username} — <span className="text-cheese">{unlocked}</span> {t("unlockedGoalLevels")}
      </p>
      <ul className="grid gap-2">
        {ACHIEVEMENTS.map((a) => {
          const level = levels[a.id] ?? 0;
          const Icon = a.icon;
          return (
            <li key={a.id} className={clsx("flex items-center gap-3 rounded-2xl border border-line bg-panel p-3", level === 0 && "opacity-50")}>
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${a.color}22`, color: a.color }}>
                <Icon size={20} />
              </span>
              <p className="flex-1 font-bold">{a.title}</p>
              <span className="flex">
                {a.tiers.map((_, i) => (
                  <Star key={i} size={13} className={i < level ? "text-cheese" : "text-panel-3"} fill="currentColor" />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
