"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronRight, Film, Sparkles, Wand2, Clapperboard, MonitorPlay, Scissors, Video, Tv, Star } from "lucide-react";
import { useSettings, type EditingLevel, type OnboardingData } from "@/lib/settings/store";

const LEVELS: { id: EditingLevel; emoji: string; label: string; desc: string }[] = [
  { id: "zero", emoji: "🐣", label: "Non ho mai montato", desc: "Parti da zero: ti guidiamo passo passo!" },
  { id: "base", emoji: "🎬", label: "So le basi", desc: "Tagli, transizioni, esportazione: il minimo." },
  { id: "intermedio", emoji: "🎞️", label: "Livello intermedio", desc: "Sai usare keyframe, color grading, audio mix." },
  { id: "avanzato", emoji: "🚀", label: "Avanzato / pro", desc: "Compositing, VFX, motion graphics, workflow complessi." },
];

const SOFTWARE: { id: string; icon: typeof Film; label: string }[] = [
  { id: "premiere", icon: Film, label: "Premiere Pro" },
  { id: "davinci", icon: MonitorPlay, label: "DaVinci Resolve" },
  { id: "finalcut", icon: Scissors, label: "Final Cut Pro" },
  { id: "aftereffects", icon: Sparkles, label: "After Effects" },
  { id: "capcut", icon: Video, label: "CapCut" },
  { id: "other", icon: Tv, label: "Altro" },
  { id: "none", icon: Star, label: "Nessuno" },
];

const GOALS: { id: string; emoji: string; label: string }[] = [
  { id: "youtube", emoji: "🎥", label: "Creare video per YouTube" },
  { id: "social", emoji: "📱", label: "Content per i social" },
  { id: "cinema", emoji: "🎬", label: "Cortometraggi / cinema" },
  { id: "work", emoji: "💼", label: "Lavoro / freelance" },
  { id: "fun", emoji: "🎮", label: "Per divertimento" },
  { id: "school", emoji: "📚", label: "Studio / università" },
];

const btn = "rounded-2xl border-2 p-4 text-left transition-all duration-200";
const btnActive = "border-[#58cc02] bg-[#58cc02]/10 shadow-[0_0_0_2px_#58cc02]";
const btnInactive = "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10";

export function Onboarding() {
  const done = useSettings((s) => s.onboardingDone);
  const complete = useSettings((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<EditingLevel | null>(null);
  const [software, setSoftware] = useState<Set<string>>(new Set());
  const [goal, setGoal] = useState<string | null>(null);

  if (done) return null;

  const toggleSw = (id: string) => {
    const next = new Set(software);
    if (id === "none") return setSoftware(new Set(["none"]));
    next.delete("none");
    next.has(id) ? next.delete(id) : next.add(id);
    setSoftware(next);
  };

  const canNext = step === 0 ? !!level : step === 1 ? software.size > 0 : !!goal;

  const finish = () => {
    if (!level || !goal) return;
    complete({ level, software: [...software], goal });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#131f24] text-white">
      <div className="w-full max-w-lg px-6">
        {/* progress */}
        <div className="mb-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={clsx("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-[#58cc02]" : "bg-white/10")} />
          ))}
        </div>

        {/* Squeak mascot */}
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#58cc02]/20 text-3xl">
            🐭
          </div>
          <div className="rounded-2xl rounded-bl-sm bg-white/10 px-4 py-2.5 text-sm font-bold leading-snug">
            {step === 0 && "Ciao! Quanto ne sai di montaggio video?"}
            {step === 1 && "Quali software hai usato? (anche nessuno va bene!)"}
            {step === 2 && "Qual è il tuo obiettivo principale?"}
          </div>
        </div>

        {/* Step 0: Level */}
        {step === 0 && (
          <div className="mt-6 grid gap-2.5">
            {LEVELS.map((l) => (
              <button key={l.id} type="button" onClick={() => setLevel(l.id)} className={clsx(btn, level === l.id ? btnActive : btnInactive)}>
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{l.emoji}</span>
                  <span>
                    <span className="block text-sm font-black">{l.label}</span>
                    <span className="block text-xs text-white/60">{l.desc}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Software */}
        {step === 1 && (
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {SOFTWARE.map((s) => {
              const sel = software.has(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggleSw(s.id)} className={clsx(btn, "flex items-center gap-3", sel ? btnActive : btnInactive)}>
                  <s.icon size={20} className={sel ? "text-[#58cc02]" : "text-white/40"} />
                  <span className="text-sm font-bold">{s.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="mt-6 grid gap-2.5">
            {GOALS.map((g) => (
              <button key={g.id} type="button" onClick={() => setGoal(g.id)} className={clsx(btn, goal === g.id ? btnActive : btnInactive)}>
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-sm font-black">{g.label}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-2xl border-2 border-white/10 px-6 py-3 text-sm font-black text-white/60 transition-colors hover:bg-white/5">
              Indietro
            </button>
          )}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => (step < 2 ? setStep(step + 1) : finish())}
            className={clsx(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all",
              canNext ? "bg-[#58cc02] text-[#131f24] shadow-[0_4px_0_#46a302] active:translate-y-0.5 active:shadow-[0_2px_0_#46a302]" : "bg-white/10 text-white/30",
            )}
          >
            {step < 2 ? "Avanti" : "Iniziamo!"} <ChevronRight size={18} />
          </button>
        </div>

        {/* Skip */}
        <button type="button" onClick={() => complete({ level: "zero", software: [], goal: "fun" })} className="mt-4 block w-full text-center text-xs font-bold text-white/30 transition-colors hover:text-white/50">
          Salta il questionario
        </button>
      </div>
    </div>
  );
}
