"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { LogOut, Megaphone, ShieldAlert, X } from "lucide-react";
import { brand } from "@/config/brand";
import { useAdmin, type Announcement } from "@/lib/admin/client";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useProgress } from "@/lib/progress/store";
import { getSupabase } from "@/lib/supabase/client";

const DISMISS_KEY = "squeak-announcement-dismissed";

export function AnnouncementBar() {
  const hydrated = useHydrated();
  const local = useAdmin((s) => s.localAnnouncement);
  const [remote, setRemote] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY));
    } catch {
    }
    const sb = getSupabase();
    if (!sb) return;
    void sb
      .from("app_settings")
      .select("value")
      .eq("key", "announcement")
      .maybeSingle<{ value: Announcement }>()
      .then(({ data }) => setRemote(data?.value ?? null));
  }, []);

  const a = remote ?? local;
  if (!hydrated || !a?.text || dismissed === a.text) return null;
  return (
    <div className={clsx("flex items-center gap-3 px-4 py-2 text-sm font-bold", a.tone === "warning" ? "bg-[#ffb02e] text-[#3a2500]" : a.tone === "success" ? "bg-success text-[#08311f]" : "bg-accent text-white")}>
      <Megaphone size={16} className="shrink-0" />
      <p className="flex-1">{a.text}</p>
      <button
        type="button"
        aria-label="Chiudi annuncio"
        onClick={() => {
          setDismissed(a.text);
          try {
            localStorage.setItem(DISMISS_KEY, a.text);
          } catch {
          }
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function BanGate() {
  const hydrated = useHydrated();
  const until = useProgress((s) => s.bannedUntil);
  const reason = useProgress((s) => s.banReason);
  if (!hydrated || !until || new Date(until).getTime() <= Date.now()) return null;
  const forever = until.startsWith("9999");
  return (
    <div className="fixed inset-0 z-[250] grid place-items-center bg-app/95 p-6 text-center backdrop-blur">
      <div className="max-w-md space-y-4">
        <ShieldAlert size={56} className="mx-auto text-danger" />
        <h1 className="text-2xl font-black">Account sospeso</h1>
        <p className="text-ink-dim">
          {forever ? "Il tuo account è stato sospeso." : `Il tuo account è sospeso fino al ${new Date(until).toLocaleString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.`}
          {reason && (
            <>
              <br />
              Motivo: <span className="font-bold text-ink">{reason}</span>
            </>
          )}
        </p>
        <p className="text-sm text-ink-mute">Pensi sia un errore? Scrivici sul server Discord di {brand.appName}.</p>
        <div className="flex justify-center gap-2">
          <a href={brand.discordUrl} target="_blank" rel="noreferrer" className="duo-btn duo-blue">
            Apri Discord
          </a>
          <button type="button" onClick={() => void getSupabase()?.auth.signOut()} className="duo-btn duo-ghost flex items-center gap-1.5">
            <LogOut size={16} /> Esci
          </button>
        </div>
      </div>
    </div>
  );
}
