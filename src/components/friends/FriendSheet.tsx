"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import clsx from "clsx";
import { ArrowUp, BookOpen, Flame, Heart, Star, UserCheck, UserPlus, Users, X, Zap } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/supabase/auth";
import { ACHIEVEMENTS } from "@/lib/gamification/achievements";
import { getSupabase } from "@/lib/supabase/client";
import type { FriendProfile } from "@/lib/supabase/friends";
import {
  loadConversation,
  loadFriendAchievements,
  markRead,
  MAX_MESSAGE,
  sendMessage,
  subscribeIncoming,
  subscribeReadReceipts,
  subscribeTyping,
  type ChatMessage,
} from "@/lib/supabase/social";
import { useT } from "@/lib/settings/i18n";
import { useSettings } from "@/lib/settings/store";
import { getTier } from "@/lib/gamification/leagues";

const LOCALE_MAP: Record<string, string> = { it: "it-IT", en: "en-US", fr: "fr-FR", es: "es-ES", zh: "zh-CN" };

export function FriendSheet({
  me,
  friend,
  sharedStreak,
  streak,
  onClose,
  onRead,
}: {
  me: string;
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

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void Promise.resolve(sb.from("follows").select("id", { count: "exact", head: true }).eq("following_id", friend.id)).then(({ count }) => setFollowerCount(count ?? 0)).catch(() => {});
    void Promise.resolve(sb.from("follows").select("id").eq("follower_id", me).eq("following_id", friend.id).maybeSingle()).then(({ data }) => setIsFollowing(!!data)).catch(() => {});
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
                <span className={clsx("inline-block h-2 w-2 rounded-full bg-gradient-to-r", friendTier.gradient)} />
                {t(friendTier.nameKey)}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label={t("close")} className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute hover:bg-panel-2 hover:text-ink">
              <X size={20} />
            </button>
          </div>
          <div className={clsx("mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold", sharedStreak > 0 ? "bg-[#ff8a3d]/15 text-[#ffb27a]" : "bg-panel text-ink-mute")}>
            <Flame size={18} className={sharedStreak > 0 ? "text-[#ff8a3d]" : ""} />
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
          </div>
        </header>
        {tab === "profile" ? (
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

function Chat({ me, friend, onRead }: { me: string; friend: FriendProfile; onRead: () => void }) {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const locale = LOCALE_MAP[lang] ?? "en-US";
  const sb = getSupabase();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [friendTyping, setFriendTyping] = useState(false);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const typingRef = useRef<{ sendTyping: () => void } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sb) return;
    let alive = true;
    loadConversation(sb, me, friend.id)
      .then((list) => alive && setMessages(list))
      .catch(() => alive && setError(t("loadChatFailed")));
    void markRead(sb, me, friend.id).then(onRead).catch(() => {});

    const stopIncoming = subscribeIncoming(sb, me, (m) => {
      if (m.sender_id !== friend.id) return;
      setMessages((list) => (list && !list.some((x) => x.id === m.id) ? [...list, m] : list));
      setNewIds((s) => new Set(s).add(m.id));
      void markRead(sb, me, friend.id).catch(() => {});
    });

    const stopRead = subscribeReadReceipts(sb, me, friend.id, (id) => {
      setMessages((list) => list?.map((m) => m.id === id ? { ...m, read_at: new Date().toISOString() } : m) ?? null);
    });

    const { stop: stopTyping, sendTyping } = subscribeTyping(sb, me, friend.id, setFriendTyping);
    typingRef.current = { sendTyping };

    return () => {
      alive = false;
      stopIncoming();
      stopRead();
      stopTyping();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb, me, friend.id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, friendTyping]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !sb) return;
    setText("");
    try {
      const sent = await sendMessage(sb, friend.id, body);
      setMessages((list) => [...(list ?? []), sent]);
      setNewIds((s) => new Set(s).add(sent.id));
      setError(null);
    } catch {
      setText(body);
      setError(t("messageFailed"));
    }
  };

  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  const lastMine = messages ? [...messages].reverse().find((m) => m.sender_id === me) : null;
  const showSeen = lastMine?.read_at != null;

  return (
    <>
      <style>{`
        @keyframes msgPop { 0%{transform:scale(0.6);opacity:0} 50%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        .msg-pop { animation: msgPop .3s cubic-bezier(.34,1.56,.64,1) both }
        @keyframes dots { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
        .dot1{animation:dots 1.2s infinite} .dot2{animation:dots 1.2s .2s infinite} .dot3{animation:dots 1.2s .4s infinite}
      `}</style>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages === null && !error && <div className="h-20 animate-pulse rounded-2xl bg-panel" />}
        {messages?.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-mute">{t("breakIce")} @{friend.username}</p>
        )}
        {messages?.map((m) => {
          const mine = m.sender_id === me;
          const isNew = newIds.has(m.id);
          return (
            <div key={m.id} className={clsx("flex", mine && "justify-end")}>
              <div className={clsx("max-w-[80%] rounded-2xl px-3.5 py-2", mine ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-panel-2 text-ink", isNew && "msg-pop")}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={clsx("mt-0.5 text-right text-[10px]", mine ? "text-white/70" : "text-ink-mute")}>{time(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        {showSeen && (
          <p className="text-right text-[10px] font-semibold text-accent/70">{t("seen")}</p>
        )}
        {friendTyping && (
          <div className="flex">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-panel-2 px-4 py-2.5">
              <span className="dot1 inline-block h-2 w-2 rounded-full bg-ink-mute" />
              <span className="dot2 inline-block h-2 w-2 rounded-full bg-ink-mute" />
              <span className="dot3 inline-block h-2 w-2 rounded-full bg-ink-mute" />
            </div>
          </div>
        )}
        <div ref={bottom} />
      </div>
      {error && <p className="px-4 pb-1 text-sm font-semibold text-danger">{error}</p>}
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); typingRef.current?.sendTyping(); }}
          maxLength={MAX_MESSAGE}
          placeholder={`${t("writeTo")} @${friend.username}…`}
          className="min-w-0 flex-1 rounded-full border-2 border-line bg-panel-2 px-4 py-2.5 font-semibold outline-none focus:border-accent"
        />
        <button type="submit" aria-label={t("send")} disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white disabled:opacity-40">
          <ArrowUp size={20} strokeWidth={3} />
        </button>
      </form>
    </>
  );
}

function FriendProfileTab({ friend, me, isFollowing, followerCount, followBusy, onToggleFollow }: { friend: FriendProfile; me: string; isFollowing: boolean; followerCount: number; followBusy: boolean; onToggleFollow: () => void }) {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const locale = LOCALE_MAP[lang] ?? "en-US";
  const tier = getTier(friend.xp);
  const joinDate = friend.created_at ? new Date(friend.created_at).toLocaleDateString(locale, { month: "long", year: "numeric" }) : null;
  const [lessonsCount, setLessonsCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void Promise.resolve(sb.from("progress").select("completed", { count: "exact", head: true }).eq("user_id", friend.id)).then(({ count }) => setLessonsCount(count ?? 0)).catch(() => {});
    void Promise.resolve(sb.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", friend.id)).then(({ count }) => setFollowingCount(count ?? 0)).catch(() => {});
  }, [friend.id]);

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
          <span className={clsx("inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r", tier.gradient)} />
          <span className="text-xs font-bold text-ink-mute">{t(tier.nameKey)}</span>
        </div>
        <button
          type="button"
          disabled={followBusy}
          onClick={onToggleFollow}
          className={clsx(
            "mt-3 flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black transition-colors disabled:opacity-50",
            isFollowing ? "bg-panel-2 text-ink-dim hover:bg-panel-3" : "bg-accent text-white hover:bg-accent/80",
          )}
        >
          {isFollowing ? <><UserCheck size={16} /> {t("following")}</> : <><UserPlus size={16} /> {t("follow")}</>}
        </button>
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
        <span className="flex items-center gap-1 rounded-xl bg-panel-2 px-3 py-1.5 text-sm font-bold text-ink-dim">
          <BookOpen size={16} /> {lessonsCount} {t("lessons")}
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
