"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, Clock, Crown, Flame, MessageCircle, Share2, Star, Trophy, UserPlus, X, Zap } from "lucide-react";
import { USERNAME_RE } from "@/components/auth/SignupForm";
import { Mascot } from "@/components/brand/Mascot";
import { brand } from "@/config/brand";
import { todayKey, yesterdayKey } from "@/lib/date";
import { currentStreak, useProgress } from "@/lib/progress/store";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import {
  acceptFriendRequest,
  loadFriends,
  removeFriendship,
  sendFriendRequest,
  type FriendProfile,
  type FriendsData,
  type SendResult,
} from "@/lib/supabase/friends";
import { getAchievement } from "@/lib/gamification/achievements";
import { loadFeed, loadSharedStreaks, loadUnread, subscribeIncoming, type ActivityEvent } from "@/lib/supabase/social";
import { FriendSheet } from "./FriendSheet";

const SEND_MESSAGES: Record<SendResult, { tone: "ok" | "error"; text: string }> = {
  sent: { tone: "ok", text: "Richiesta inviata!" },
  accepted: { tone: "ok", text: "Ti aveva già scritto: ora siete amici!" },
  not_found: { tone: "error", text: "Nessun utente con questo nome." },
  self: { tone: "error", text: "Non puoi aggiungere te stesso." },
  exists: { tone: "error", text: "Siete già amici o c'è già una richiesta in corso." },
};

const liveStreak = (p: FriendProfile) =>
  p.streak_last_day === todayKey() || p.streak_last_day === yesterdayKey() ? p.streak_count : 0;

export function FriendsPanel() {
  const status = useAuth((s) => s.status);

  if (status === "loading") return <div className="h-96" />;
  if (status !== "user") return <GuestFriends disabled={status === "disabled"} />;
  return <SignedInFriends />;
}

function GuestFriends({ disabled }: { disabled: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-panel p-8 text-center">
      <Mascot size={110} idle />
      <h2 className="text-xl font-black">Montare insieme è più divertente</h2>
      <p className="text-ink-dim">
        {disabled
          ? "Gli account non sono ancora attivi su questa installazione."
          : "Crea un profilo per aggiungere amici, vedere i loro progressi e sfidarli in classifica."}
      </p>
      {!disabled && (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link href="/signup" className="btn-3d rounded-2xl bg-success py-3 font-black uppercase text-[#08311f]">
            Crea un profilo
          </Link>
          <Link href="/login?next=/friends" className="btn-3d rounded-2xl border-2 border-line bg-panel-2 py-3 font-black uppercase text-pr">
            Accedi
          </Link>
        </div>
      )}
    </div>
  );
}

function SignedInFriends() {
  const sb = getSupabase()!;
  const me = useAuth((s) => s.userId)!;
  const profile = useAuth((s) => s.profile);
  const myXp = useProgress((s) => s.xp);
  const myStreak = useProgress((s) => currentStreak(s.streak));
  const recordStat = useProgress((s) => s.recordStat);

  const [data, setData] = useState<FriendsData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState<Record<string, number>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [feed, setFeed] = useState<ActivityEvent[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [friends, streaks, unreadCounts, events] = await Promise.all([
        loadFriends(sb, me),
        loadSharedStreaks(sb, todayKey()),
        loadUnread(sb, me),
        loadFeed(sb, me),
      ]);
      setData(friends);
      setShared(streaks);
      setUnread(unreadCounts);
      setFeed(events);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [sb, me]);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  // nuovi messaggi in arrivo mentre sei sulla pagina: aggiorna i contatori
  useEffect(
    () =>
      subscribeIncoming(sb, me, (m) => {
        if (m.sender_id !== openId) setUnread((u) => ({ ...u, [m.sender_id]: (u[m.sender_id] ?? 0) + 1 }));
      }),
    [sb, me, openId],
  );

  const clearUnread = useCallback(() => {
    if (openId) setUnread((u) => ({ ...u, [openId]: 0 }));
  }, [openId]);

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch {
      setMessage({ tone: "error", text: "Operazione non riuscita. Riprova." });
    }
    await refresh();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = input.trim().replace(/^@/, "").toLowerCase();
    if (!USERNAME_RE.test(name)) return setMessage({ tone: "error", text: "Nome utente non valido." });
    setBusy(true);
    try {
      const result = await sendFriendRequest(sb, me, name);
      setMessage(SEND_MESSAGES[result]);
      if (result === "sent" || result === "accepted") {
        recordStat("friendRequests");
        setInput("");
      }
    } catch {
      setMessage({ tone: "error", text: "Invio non riuscito. Riprova." });
    }
    setBusy(false);
    await refresh();
  };

  const share = async () => {
    const text = `Impara il montaggio video con me su ${brand.appName}! Aggiungimi: @${profile?.username ?? ""}`;
    try {
      if (navigator.share) await navigator.share({ title: brand.appName, text, url: window.location.origin });
      else {
        await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // condivisione annullata
    }
  };

  const leaderboard = [
    { id: me, username: profile?.username ?? "tu", xp: myXp, streak: myStreak, isMe: true },
    ...(data?.friends ?? []).map((f) => ({ id: f.other.id, username: f.other.username, xp: f.other.xp, streak: liveStreak(f.other), isMe: false })),
  ].sort((a, b) => b.xp - a.xp);
  const openFriend = data?.friends.find((f) => f.other.id === openId)?.other ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-3xl border border-[#5ce1e6]/40 bg-linear-to-br from-[#5ce1e6]/15 to-panel p-5">
        <Mascot size={84} idle />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-dim">Il tuo nome utente</p>
          <p className="truncate text-2xl font-black">@{profile?.username ?? "…"}</p>
          <button
            type="button"
            onClick={share}
            className="btn-3d mt-3 flex items-center gap-2 rounded-xl bg-[#5ce1e6] px-4 py-2 text-sm font-black text-[#063b3d]"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Invito copiato!" : "Invita un amico"}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-panel p-4">
        <label htmlFor="friend" className="mb-2 block font-black">
          Aggiungi un amico
        </label>
        <div className="flex gap-2">
          <input
            id="friend"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@nomeutente"
            autoComplete="off"
            autoCapitalize="none"
            className="min-w-0 flex-1 rounded-xl border-2 border-line bg-panel-2 px-4 py-2.5 font-semibold outline-none focus:border-[#5ce1e6]"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-3d flex items-center gap-1.5 rounded-xl bg-accent px-4 font-black text-white disabled:opacity-60"
          >
            <UserPlus size={18} /> <span className="hidden sm:inline">Invia</span>
          </button>
        </div>
        {message && (
          <p className={clsx("mt-2 text-sm font-semibold", message.tone === "ok" ? "text-success" : "text-danger")}>
            {message.text}
          </p>
        )}
      </form>

      {loadError && <p className="text-sm font-semibold text-danger">Non riesco a caricare gli amici. Controlla la connessione.</p>}

      {data && data.incoming.length > 0 && (
        <section>
          <h2 className="mb-3 font-black">Richieste ricevute</h2>
          <ul className="space-y-2">
            {data.incoming.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-[#5ce1e6]/40 bg-panel p-3">
                <Avatar name={r.other.username} />
                <p className="min-w-0 flex-1 truncate font-bold">@{r.other.username}</p>
                <button
                  type="button"
                  onClick={() => act(() => acceptFriendRequest(sb, r.id))}
                  className="btn-3d rounded-xl bg-success px-3 py-2 text-sm font-black text-[#08311f]"
                >
                  Accetta
                </button>
                <IconButton label={`Rifiuta ${r.other.username}`} onClick={() => act(() => removeFriendship(sb, r.id))} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-black">Classifica amici</h2>
        {!data ? (
          <div className="h-24 animate-pulse rounded-2xl bg-panel" />
        ) : data.friends.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-8 text-center">
            <Mascot size={70} mood="sleepy" />
            <p className="text-sm text-ink-dim">Ancora nessun amico. Aggiungine uno per sfidarlo in classifica!</p>
          </div>
        ) : (
          <ol className="space-y-2">
            {leaderboard.map((row, i) => (
              <li
                key={row.id}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl border p-3",
                  row.isMe ? "border-pr/50 bg-pr/10" : "border-line bg-panel",
                )}
              >
                <span className="w-6 text-center font-black text-ink-mute">{i === 0 ? <Crown size={18} className="mx-auto text-cheese" /> : i + 1}</span>
                {/* tocca un amico per aprire chat, serie condivisa e obiettivi */}
                <button
                  type="button"
                  disabled={row.isMe}
                  onClick={() => setOpenId(row.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left enabled:hover:opacity-90"
                >
                  <span className="relative">
                    <Avatar name={row.username} />
                    {!!unread[row.id] && (
                      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-black text-white">
                        {unread[row.id]}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">
                      @{row.username} {row.isMe && <span className="text-xs text-ink-mute">(tu)</span>}
                    </span>
                    {!row.isMe && (
                      <span className="flex items-center gap-1 text-xs font-bold text-ink-mute">
                        <MessageCircle size={12} />
                        {shared[row.id] ? <span className="text-[#ffb27a]">Serie insieme: {shared[row.id]} gg</span> : "Chat e obiettivi"}
                      </span>
                    )}
                  </span>
                </button>
                <span className="flex items-center gap-1 text-sm font-black text-[#ff8a3d]">
                  <Flame size={15} /> {row.streak}
                </span>
                <span className="flex w-16 items-center justify-end gap-1 text-sm font-black text-cheese">
                  <Zap size={15} /> {row.xp}
                </span>
                {!row.isMe && (
                  <IconButton
                    label={`Rimuovi ${row.username}`}
                    onClick={() => {
                      const link = data.friends.find((f) => f.other.id === row.id);
                      if (link && window.confirm(`Rimuovere @${row.username} dagli amici?`)) void act(() => removeFriendship(sb, link.id));
                    }}
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {feed.length > 0 && (
        <section>
          <h2 className="mb-3 font-black">Cosa fanno i tuoi amici</h2>
          <ul className="space-y-2">
            {feed.map((e) => (
              <FeedItem key={e.id} event={e} />
            ))}
          </ul>
        </section>
      )}

      {openFriend && (
        <FriendSheet
          me={me}
          friend={openFriend}
          sharedStreak={shared[openFriend.id] ?? 0}
          streak={liveStreak(openFriend)}
          onClose={() => setOpenId(null)}
          onRead={clearUnread}
        />
      )}

      {data && data.outgoing.length > 0 && (
        <section>
          <h2 className="mb-3 font-black">Richieste inviate</h2>
          <ul className="space-y-2">
            {data.outgoing.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-line bg-panel p-3">
                <Avatar name={r.other.username} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">@{r.other.username}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-mute">
                    <Clock size={12} /> In attesa di risposta
                  </p>
                </div>
                <IconButton label={`Annulla richiesta a ${r.other.username}`} onClick={() => act(() => removeFriendship(sb, r.id))} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min fa`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h fa`;
  return `${Math.round(mins / 1440)} g fa`;
};

function FeedItem({ event }: { event: ActivityEvent }) {
  const name = event.user?.username ?? "un amico";
  const achievement = event.data.achievementId ? getAchievement(event.data.achievementId) : undefined;
  let icon = <Zap size={18} className="text-cheese" />;
  let text = `ha completato una lezione`;
  if (event.kind === "lesson_completed" && event.data.lessonTitle) text = `ha completato "${event.data.lessonTitle}"`;
  if (event.kind === "achievement_unlocked" && achievement) {
    icon = <Trophy size={18} style={{ color: achievement.color }} />;
    text = `ha sbloccato "${achievement.title}" livello ${event.data.level}`;
  }
  if (event.kind === "streak_milestone") {
    icon = <Flame size={18} className="text-[#ff8a3d]" />;
    text = `ha raggiunto una serie di ${event.data.days} giorni`;
  }
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-panel p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-panel-2">{icon}</span>
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-black">@{name}</span> <span className="text-ink-dim">{text}</span>
      </p>
      <span className="flex shrink-0 items-center gap-1 text-xs text-ink-mute">
        {event.kind === "achievement_unlocked" && <Star size={12} className="text-cheese" fill="currentColor" />}
        {ago(event.created_at)}
      </span>
    </li>
  );
}

function Avatar({ name }: { name: string }) {
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-panel-3 font-black uppercase">{name[0]}</span>;
}

function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-mute hover:bg-panel-3 hover:text-ink"
    >
      <X size={18} />
    </button>
  );
}
