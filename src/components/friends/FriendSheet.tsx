"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import clsx from "clsx";
import { ArrowUp, Flame, Star, X, Zap } from "lucide-react";
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
  type ChatMessage,
} from "@/lib/supabase/social";

const time = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

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
  const [tab, setTab] = useState<"chat" | "goals">("chat");

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
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pr text-lg font-black uppercase text-pr-deep">
              {friend.username[0]}
            </span>
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
                  <Flame size={13} /> {streak} gg
                </span>
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Chiudi" className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute hover:bg-panel-2 hover:text-ink">
              <X size={20} />
            </button>
          </div>
          {/* serie condivisa: giorni consecutivi in cui avete fatto lezione entrambi */}
          <div className={clsx("mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold", sharedStreak > 0 ? "bg-[#ff8a3d]/15 text-[#ffb27a]" : "bg-panel text-ink-mute")}>
            <Flame size={18} className={sharedStreak > 0 ? "text-[#ff8a3d]" : ""} />
            {sharedStreak > 0
              ? `Serie insieme: ${sharedStreak} ${sharedStreak === 1 ? "giorno" : "giorni"}. Fate una lezione entrambi oggi per allungarla!`
              : "Nessuna serie insieme: fate una lezione entrambi oggi per iniziarne una."}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-panel p-1 text-sm font-black">
            {(["chat", "goals"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={clsx("rounded-lg py-1.5", tab === t ? "bg-panel-3 text-ink" : "text-ink-mute hover:text-ink")}
              >
                {t === "chat" ? "Chat" : "Obiettivi"}
              </button>
            ))}
          </div>
        </header>
        {tab === "chat" ? <Chat me={me} friend={friend} onRead={onRead} /> : <FriendGoals friend={friend} />}
      </div>
    </div>
  );
}

function Chat({ me, friend, onRead }: { me: string; friend: FriendProfile; onRead: () => void }) {
  const sb = getSupabase()!;
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    loadConversation(sb, me, friend.id)
      .then((list) => alive && setMessages(list))
      .catch(() => alive && setError("Non riesco a caricare la chat."));
    void markRead(sb, me, friend.id).then(onRead).catch(() => {});

    const stop = subscribeIncoming(sb, me, (m) => {
      if (m.sender_id !== friend.id) return;
      setMessages((list) => (list && !list.some((x) => x.id === m.id) ? [...list, m] : list));
      void markRead(sb, me, friend.id).catch(() => {});
    });
    return () => {
      alive = false;
      stop();
    };
  }, [sb, me, friend.id, onRead]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      const sent = await sendMessage(sb, friend.id, body);
      setMessages((list) => [...(list ?? []), sent]);
      setError(null);
    } catch {
      setText(body);
      setError("Messaggio non inviato. Siete ancora amici?");
    }
  };

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages === null && !error && <div className="h-20 animate-pulse rounded-2xl bg-panel" />}
        {messages?.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-mute">Rompi il ghiaccio: chiedi a @{friend.username} che lezione sta facendo!</p>
        )}
        {messages?.map((m) => {
          const mine = m.sender_id === me;
          return (
            <div key={m.id} className={clsx("flex", mine && "justify-end")}>
              <div className={clsx("max-w-[80%] rounded-2xl px-3.5 py-2", mine ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-panel-2 text-ink")}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={clsx("mt-0.5 text-right text-[10px]", mine ? "text-white/70" : "text-ink-mute")}>{time(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      {error && <p className="px-4 pb-1 text-sm font-semibold text-danger">{error}</p>}
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_MESSAGE}
          placeholder={`Scrivi a @${friend.username}…`}
          className="min-w-0 flex-1 rounded-full border-2 border-line bg-panel-2 px-4 py-2.5 font-semibold outline-none focus:border-accent"
        />
        <button type="submit" aria-label="Invia" disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white disabled:opacity-40">
          <ArrowUp size={20} strokeWidth={3} />
        </button>
      </form>
    </>
  );
}

function FriendGoals({ friend }: { friend: FriendProfile }) {
  const sb = getSupabase()!;
  const [levels, setLevels] = useState<Record<string, number> | null>(null);

  useEffect(() => {
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
        @{friend.username} ha sbloccato <span className="text-cheese">{unlocked}</span> livelli di obiettivi.
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
