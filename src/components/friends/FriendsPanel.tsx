"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, Clock, Crown, Flame, Share2, UserPlus, X, Zap } from "lucide-react";
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

  const refresh = useCallback(async () => {
    try {
      setData(await loadFriends(sb, me));
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
                <Avatar name={row.username} />
                <p className="min-w-0 flex-1 truncate font-bold">
                  @{row.username} {row.isMe && <span className="text-xs text-ink-mute">(tu)</span>}
                </p>
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
