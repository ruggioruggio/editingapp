"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronUp, X } from "lucide-react";
import { useT } from "@/lib/settings/i18n";
import { getTier, getNextTier, LEAGUE_TIERS, type LeagueTier } from "@/lib/gamification/leagues";
import { useProgress } from "@/lib/progress/store";
import { LeagueEmblem } from "@/components/gamification/LeagueEmblem";

const SHOW_EVERY_N = 3;
const STORAGE_KEY = "squeak-league-shown";

function getShownCount(): number {
  try { return Number(localStorage.getItem(STORAGE_KEY) ?? 0); } catch { return 0; }
}
function setShownCount(n: number) {
  try { localStorage.setItem(STORAGE_KEY, String(n)); } catch {}
}

export function useLeaguePromotion() {
  const lessonsCompleted = useProgress((s) => Object.keys(s.completed).length);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lessonsCompleted < SHOW_EVERY_N) return;
    const lastShown = getShownCount();
    if (lessonsCompleted - lastShown >= SHOW_EVERY_N) {
      setVisible(true);
      setShownCount(lessonsCompleted);
    }
  }, [lessonsCompleted]);

  return { visible, dismiss: () => setVisible(false) };
}

function TierBar({ tier, current, xp }: { tier: LeagueTier; current: boolean; xp: number }) {
  const t = useT();
  const next = LEAGUE_TIERS[LEAGUE_TIERS.indexOf(tier) + 1];
  const progress = next ? Math.min(1, (xp - tier.minXp) / (next.minXp - tier.minXp)) : 1;

  return (
    <div className={clsx("flex items-center gap-3 rounded-xl p-2 transition-all", current ? "bg-white/10" : "opacity-50")}>
      <LeagueEmblem tier={tier} size={32} />
      <div className="flex-1">
        <p className="text-xs font-black text-white">{t(tier.nameKey)}</p>
        {current && (
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold text-white/60">{tier.minXp}+</span>
    </div>
  );
}

export function LeaguePromotionModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const xp = useProgress((s) => s.xp);
  const tier = getTier(xp);
  const next = getNextTier(xp);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="animate-pop relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 p-6 text-center"
        style={{ background: `radial-gradient(120% 70% at 50% 0%, ${tier.tones[1]}cc, ${tier.tones[2]} 60%, #14121f)` }}
      >
        <button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white/80 hover:bg-black/40">
          <X size={18} />
        </button>

        <div className="mb-4 flex justify-center">
          <LeagueEmblem tier={tier} size={80} />
        </div>

        <h2 className="mb-1 text-xl font-black text-white">{t(tier.nameKey)}</h2>
        <p className="mb-1 text-sm font-bold text-white/80">{t("strengthening")}</p>
        {next && (
          <p className="text-xs text-white/60">
            <ChevronUp size={12} className="mr-1 inline" />
            {t("stayInTop").replace("{n}", String(next.minXp))} XP → {t(next.nameKey)}
          </p>
        )}

        <div className="mt-5 space-y-1">
          {LEAGUE_TIERS.map((lt) => (
            <TierBar key={lt.id} tier={lt} current={lt.id === tier.id} xp={xp} />
          ))}
        </div>

        <p className="mt-4 text-xs font-bold text-white/60">{t("keepPlaying")}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-white/20 px-6 py-3 text-sm font-black text-white hover:bg-white/30"
        >
          OK
        </button>
      </div>
    </div>
  );
}
