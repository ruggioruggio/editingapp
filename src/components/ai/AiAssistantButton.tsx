"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { brand } from "@/config/brand";
import { hasAiAssistant } from "@/lib/billing/plans";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useProgress } from "@/lib/progress/store";

/**
 * Punto d'ingresso dell'assistente AI (solo Pro).
 * Il backend arriverà come route handler /api/ai che chiama Claude
 * con il contesto della lezione e lo stato della timeline.
 */
export function AiAssistantButton() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const plan = useProgress((s) => s.plan);
  const unlocked = hydrated && hasAiAssistant(plan);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-pr/40 bg-pr/10 px-3 py-1.5 text-xs font-semibold text-pr hover:bg-pr/20"
      >
        <Sparkles size={14} />
        <span className="hidden sm:inline">{brand.aiName}</span>
        {!unlocked && <Lock size={12} />}
      </button>

      {open && (
        <div className="animate-pop absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-line bg-panel-2 p-4 shadow-2xl">
          <div className="mb-3 flex items-center gap-2">
            <Mascot size={36} />
            <p className="font-semibold">{brand.aiName}</p>
          </div>
          {unlocked ? (
            <>
              <p className="mb-3 text-sm text-ink-dim">
                Presto potrai chiedermi aiuto sull&apos;esercizio che stai facendo: guardo la tua timeline e ti spiego
                cosa non va.
              </p>
              <input
                disabled
                placeholder="In arrivo…"
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm placeholder:text-ink-mute"
              />
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-ink-dim">
                Chiedimi perché un taglio non funziona, come si fa un J-cut o cosa significa Rec.709. Sono incluso nel
                piano Pro.
              </p>
              <Link
                href="/pricing"
                className="btn-3d block rounded-lg bg-pr px-3 py-2 text-center text-sm font-bold text-pr-deep"
              >
                Scopri Pro
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
