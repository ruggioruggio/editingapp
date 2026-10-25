"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

/** Avatar con menu (utente loggato) oppure pulsante "Accedi" (ospite). */
export function AccountMenu() {
  const router = useRouter();
  const status = useAuth((s) => s.status);
  const profile = useAuth((s) => s.profile);
  const email = useAuth((s) => s.email);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  if (status === "loading" || status === "disabled") return null;

  if (status === "guest") {
    return (
      <Link href="/login?next=/learn" className="rounded-xl border-2 border-line px-3 py-1.5 text-xs font-black uppercase text-pr hover:bg-panel-2">
        Accedi
      </Link>
    );
  }

  const name = profile?.username ?? email ?? "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Il tuo account"
        className="grid h-9 w-9 place-items-center rounded-full bg-pr font-black uppercase text-pr-deep ring-2 ring-white/10"
      >
        {name[0]}
      </button>
      {open && (
        <div className="animate-pop absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-line bg-panel-2 p-2 shadow-2xl">
          <div className="px-3 py-2">
            <p className="truncate font-black">@{profile?.username ?? "…"}</p>
            <p className="truncate text-xs text-ink-mute">{email}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await getSupabase()?.auth.signOut();
              router.push("/");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-dim hover:bg-panel-3 hover:text-ink"
          >
            <LogOut size={16} /> Esci
          </button>
        </div>
      )}
    </div>
  );
}
