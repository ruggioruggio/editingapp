"use client";

import { Suspense, useEffect, useState } from "react";
import { Construction } from "lucide-react";
import { brand } from "@/config/brand";
import { graceActive, useAdmin } from "@/lib/admin/client";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { getSupabase } from "@/lib/supabase/client";
import { SiteScene } from "@/components/three/lazy";

export interface MaintenanceState {
  on: boolean;
  message?: string;
}

export function MaintenanceGate() {
  const hydrated = useHydrated();
  const local = useAdmin((s) => s.localMaintenance);
  const unlocked = useAdmin((s) => s.unlocked);
  const [remote, setRemote] = useState<MaintenanceState | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const load = () =>
      void sb
        .from("app_settings")
        .select("value")
        .eq("key", "maintenance")
        .maybeSingle<{ value: MaintenanceState }>()
        .then(({ data }) => setRemote(data?.value ?? null));
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const m = remote?.on ? remote : local?.on ? local : null;
  if (!hydrated || !m) return null;
  if (unlocked || graceActive()) return (
    <div className="fixed bottom-24 left-1/2 z-[280] -translate-x-1/2 animate-pop rounded-2xl border border-danger/40 bg-danger/15 px-5 py-3 text-center text-sm font-bold text-danger shadow-lg backdrop-blur">
      Manutenzione attiva — gli utenti vedono il cantiere
    </div>
  );
  return (
    <div className="fixed inset-0 z-[280] flex flex-col items-center justify-center gap-4 overflow-y-auto bg-app p-6 text-center">
      {/* toccando 7 volte il cantiere si apre il pannello admin */}
      <div data-admin-tap className="w-full max-w-md touch-manipulation select-none">
        <Suspense fallback={<Construction size={80} className="mx-auto text-cheese" />}>
          <SiteScene name="maintenance" className="aspect-[4/3] w-full" />
        </Suspense>
      </div>
      <h1 className="text-3xl font-black">Siamo in manutenzione</h1>
      <p className="max-w-md text-ink-dim">{m.message || `${brand.appName} torna tra poco più bello di prima. Grazie della pazienza!`}</p>
      <a href={brand.discordUrl} target="_blank" rel="noreferrer" className="duo-btn duo-blue">
        Aggiornamenti su Discord
      </a>
    </div>
  );
}
