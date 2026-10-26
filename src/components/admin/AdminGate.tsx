"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Gavel, X } from "lucide-react";
import { adminAction, checkSession, useAdmin } from "@/lib/admin/client";
import { AdminPanel } from "./AdminPanel";

// Apre il pannello admin con AltGr + Maiusc + ù + à (tastiera italiana) o
// toccando 7 volte il logo dal telefono. Gestisce anche il ban rapido.

const openPanel = () => {
  useAdmin.setState({ open: true });
  void checkSession();
};

export function AdminGate() {
  const { open, quickBan } = useAdmin();

  useEffect(() => {
    const down = new Set<string>();
    const onKey = (e: KeyboardEvent) => {
      down.add(e.code);
      const altGr = e.getModifierState?.("AltGraph") || (e.ctrlKey && e.altKey) || e.altKey;
      // sulla tastiera italiana "ù" è il tasto Backslash e "à" il tasto Quote
      const u = down.has("Backslash") || e.key === "ù" || e.key === "§";
      const a = down.has("Quote") || e.key === "à" || e.key === "°" || e.key === "#";
      if (altGr && e.shiftKey && u && a) {
        e.preventDefault();
        openPanel();
        return;
      }
      const s = useAdmin.getState();
      if (s.modShortcuts && (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (s.unlocked) s.set({ quickBan: true });
        else openPanel();
      }
    };
    const onUp = (e: KeyboardEvent) => down.delete(e.code);
    const clear = () => down.clear();
    // 7 tocchi veloci sul logo
    let taps: number[] = [];
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement | null)?.closest?.("[data-admin-tap]")) return;
      const now = Date.now();
      taps = [...taps.filter((t) => now - t < 3000), now];
      if (taps.length >= 7) {
        taps = [];
        e.preventDefault();
        openPanel();
      }
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onUp, true);
    window.addEventListener("blur", clear);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onUp, true);
      window.removeEventListener("blur", clear);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <>
      {open && <AdminPanel />}
      {quickBan && <QuickBan key="qb" />}
    </>
  );
}

function QuickBan({ username: initial = "" }: { username?: string }) {
  const st = useAdmin();
  const [username, setUsername] = useState(st.quickBanUser ?? initial);
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("Spam");
  const [msg, setMsg] = useState<string | null>(null);
  const close = () => st.set({ quickBan: false, quickBanUser: null });
  return (
    <div className="fixed inset-0 z-[310] grid place-items-center bg-black/60 p-4" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <form
        className="w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-[#1e1f22] p-5 text-white"
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Escape") close();
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await adminAction("banByName", { username, days: days || undefined, reason });
            setMsg(`@${username.replace(/^@/, "")} sospeso`);
            setTimeout(close, 900);
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Errore");
          }
        }}
      >
        <p className="flex items-center gap-2 font-black">
          <Gavel size={16} className="text-[#ed4245]" /> Ban rapido
          <button type="button" onClick={close} className="ml-auto" aria-label="Chiudi">
            <X size={16} />
          </button>
        </p>
        <input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@nomeutente" className="h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-[#ed4245]" />
        <div className="flex gap-1.5">
          {[1, 7, 30, 0].map((d) => (
            <button key={d} type="button" onClick={() => setDays(d)} className={clsx("flex-1 rounded-lg py-1.5 text-xs font-bold", days === d ? "bg-[#ed4245] text-white" : "bg-white/10")}>
              {d ? `${d} g` : "Sempre"}
            </button>
          ))}
        </div>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo" className="h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-[#ed4245]" />
        {msg && <p className="text-sm font-bold text-[#ff7b7e]">{msg}</p>}
        <button type="submit" disabled={!username} className="h-9 w-full rounded-lg bg-[#ed4245] text-sm font-black disabled:opacity-40">
          Sospendi
        </button>
      </form>
    </div>
  );
}

/** Martello accanto a un utente (solo con le scorciatoie di moderazione attive). */
export function ModHammer({ username }: { username: string }) {
  const { modShortcuts } = useAdmin();
  if (!modShortcuts) return null;
  return (
    <button
      type="button"
      title={`Sospendi @${username}`}
      onClick={() => {
        const s = useAdmin.getState();
        if (!s.unlocked) return openPanel();
        s.set({ quickBan: true, quickBanUser: username });
      }}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ed4245]/15 text-[#ff7b7e] hover:bg-[#ed4245]/30"
    >
      <Gavel size={14} />
    </button>
  );
}
