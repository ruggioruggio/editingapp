"use client";

import clsx from "clsx";
import { Check, Crown } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useProgress } from "@/lib/progress/store";
import { useAuth } from "@/lib/supabase/auth";

const eur = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export function PricingTable() {
  const hydrated = useHydrated();
  const plan = useProgress((s) => s.plan);
  const setPlan = useProgress((s) => s.setPlan);
  // con un account il piano arriva dal server: la simulazione vale solo da ospite
  const signedIn = useAuth((s) => s.status === "user");

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {(Object.keys(PLANS) as PlanId[]).map((id) => {
        const p = PLANS[id];
        const isPro = id === "pro";
        const isCurrent = hydrated && plan === id;
        return (
          <div
            key={id}
            className={clsx(
              "flex flex-col rounded-2xl border p-6",
              isPro ? "border-pr/60 bg-linear-to-b from-pr/15 to-panel" : "border-line bg-panel",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-extrabold">
                {isPro && <Crown size={20} className="text-cheese" />}
                {p.name}
              </h2>
              {isCurrent && (
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">Piano attuale</span>
              )}
            </div>
            <p className="mb-1 text-3xl font-extrabold">
              {p.priceMonthlyEur === 0 ? "Gratis" : eur(p.priceMonthlyEur)}
              {p.priceMonthlyEur > 0 && <span className="text-sm font-medium text-ink-mute"> /mese</span>}
            </p>
            <p className="mb-6 text-sm text-ink-mute">
              {p.priceYearlyEur > 0 ? `oppure ${eur(p.priceYearlyEur)} all'anno` : "Per sempre"}
            </p>
            <ul className="mb-8 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={16} className={clsx("mt-0.5 shrink-0", isPro ? "text-pr" : "text-success")} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={!hydrated || isCurrent || signedIn}
              onClick={() => setPlan(id)}
              className={clsx(
                "btn-3d mt-auto rounded-xl py-3 font-bold uppercase tracking-wide disabled:opacity-50",
                isPro ? "bg-pr text-pr-deep" : "bg-panel-3 text-ink",
              )}
            >
              {isCurrent ? "Attivo" : signedIn ? "Pagamenti in arrivo" : isPro ? "Attiva Pro (demo)" : "Torna a Free"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
