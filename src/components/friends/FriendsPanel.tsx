"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Clock, Copy, Share2, UserPlus, X } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { brand } from "@/config/brand";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useProgress } from "@/lib/progress/store";

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/i;

export function FriendsPanel() {
  const hydrated = useHydrated();
  const username = useProgress((s) => s.username);
  const requests = useProgress((s) => s.friendRequests);
  const { ensureUsername, sendFriendRequest, cancelFriendRequest } = useProgress.getState();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hydrated) ensureUsername();
  }, [hydrated, ensureUsername]);

  if (!hydrated || !username) return <div className="h-96" />;

  const inviteText = `Impara il montaggio video con me su ${brand.appName}! Aggiungimi: @${username}`;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = input.trim().replace(/^@/, "");
    if (!USERNAME_RE.test(name)) return setError("Usa 3–20 caratteri: lettere, numeri, punto o trattino basso.");
    if (name.toLowerCase() === username) return setError("Non puoi aggiungere te stesso.");
    if (requests.some((r) => r.username === name.toLowerCase())) return setError("Richiesta già inviata.");
    sendFriendRequest(name);
    setInput("");
    setError(null);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: brand.appName, text: inviteText });
      else {
        await navigator.clipboard.writeText(inviteText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // condivisione annullata dall'utente
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-3xl border border-[#5ce1e6]/40 bg-linear-to-br from-[#5ce1e6]/15 to-panel p-5">
        <Mascot size={84} idle />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-dim">Il tuo nome utente</p>
          <p className="truncate text-2xl font-black">@{username}</p>
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
            className="min-w-0 flex-1 rounded-xl border-2 border-line bg-panel-2 px-4 py-2.5 font-semibold outline-none focus:border-[#5ce1e6]"
          />
          <button type="submit" className="btn-3d flex items-center gap-1.5 rounded-xl bg-accent px-4 font-black text-white">
            <UserPlus size={18} /> <span className="hidden sm:inline">Invia</span>
          </button>
        </div>
        {error && <p className="mt-2 text-sm font-semibold text-danger">{error}</p>}
      </form>

      <div>
        <h2 className="mb-3 font-black">Richieste inviate</h2>
        {requests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-8 text-center">
            <Mascot size={70} mood="sleepy" />
            <p className="text-sm text-ink-dim">Ancora nessun amico. Montare insieme è più divertente!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.username} className="flex items-center gap-3 rounded-2xl border border-line bg-panel p-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-panel-3 font-black uppercase">
                  {r.username[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">@{r.username}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-mute">
                    <Clock size={12} /> In attesa di risposta
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cancelFriendRequest(r.username)}
                  aria-label={`Annulla richiesta a ${r.username}`}
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute hover:bg-panel-3 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs text-ink-mute">
        <Copy size={13} className="mt-0.5 shrink-0" />
        Versione di sviluppo: le richieste restano su questo dispositivo finché non colleghiamo gli account.
      </p>
    </div>
  );
}
