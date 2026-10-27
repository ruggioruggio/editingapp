"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { MyAvatar } from "@/components/profile/Avatar";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useT } from "@/lib/settings/i18n";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

/** Avatar con menu (profilo, impostazioni, esci) oppure "Accedi" per gli ospiti. */
export function AccountMenu() {
  const router = useRouter();
  const t = useT();
  const status = useAuth((s) => s.status);
  const profile = useAuth((s) => s.profile);
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<"settings" | "profile" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  if (status === "loading") return null;

  const modals = (
    <>
      {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
      {modal === "profile" && <ProfileModal onClose={() => setModal(null)} />}
    </>
  );
  const item = "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-dim hover:bg-panel-3 hover:text-ink";
  const pick = (m: "settings" | "profile") => {
    setOpen(false);
    setModal(m);
  };

  // ospite: solo "Accedi" (avatar e impostazioni arrivano con l'account)
  if (status === "guest") {
    return (
      <Link href="/login?next=/learn" className="rounded-xl border-2 border-line px-3 py-1.5 text-xs font-black uppercase text-pr hover:bg-panel-2">
        {t("signIn")}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Il tuo account" className="overflow-hidden rounded-full ring-2 ring-white/10">
        <MyAvatar size={36} />
      </button>
      {open && (
        <div className="animate-pop absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-line bg-panel-2 p-2 shadow-2xl">
          {status === "user" && (
            <div className="px-3 py-2">
              <p className="truncate font-black">@{profile?.username ?? "…"}</p>
            </div>
          )}
          <button type="button" onClick={() => pick("profile")} className={item}>
            <UserRound size={16} /> {t("profile")}
          </button>
          <button type="button" onClick={() => pick("settings")} className={item}>
            <Settings size={16} /> {t("settings")}
          </button>
          {status === "user" && (
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await getSupabase()?.auth.signOut();
              router.push("/login");
            }}
            className={item}
          >
            <LogOut size={16} /> {t("signOut")}
          </button>
          )}
        </div>
      )}
      {modals}
    </div>
  );
}
