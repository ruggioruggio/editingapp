"use client";

import { useCallback, useState } from "react";
import clsx from "clsx";
import { Camera, ChevronRight, Clapperboard, Film, Globe, MonitorPlay, Moon, Scissors, Sparkles, Star, Sun, Tv, Video } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { useSettings, resolvedTheme, type EditingLevel, type Lang, type Theme } from "@/lib/settings/store";
import { useProgress } from "@/lib/progress/store";
import { useHydrated } from "@/lib/hooks/useHydrated";

const LANGS: { id: Lang; flag: string; label: string }[] = [
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "it", flag: "🇮🇹", label: "Italiano" },
  { id: "fr", flag: "🇫🇷", label: "Français" },
  { id: "es", flag: "🇪🇸", label: "Español" },
  { id: "zh", flag: "🇨🇳", label: "中文" },
];

const THEMES: { id: Theme; icon: typeof Sun; label: string }[] = [
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "light", icon: Sun, label: "Light" },
  { id: "system", icon: Globe, label: "System" },
];

const LEVELS: { id: EditingLevel; emoji: string; label: string; desc: string }[] = [
  { id: "zero", emoji: "🐣", label: "I've never edited", desc: "Starting from scratch — we'll guide you step by step!" },
  { id: "base", emoji: "🎬", label: "I know the basics", desc: "Cuts, transitions, export: the essentials." },
  { id: "intermedio", emoji: "🎞️", label: "Intermediate", desc: "You can use keyframes, color grading, audio mix." },
  { id: "avanzato", emoji: "🚀", label: "Advanced / pro", desc: "Compositing, VFX, motion graphics, complex workflows." },
];

const SOFTWARE: { id: string; icon: typeof Film; label: string }[] = [
  { id: "premiere", icon: Film, label: "Premiere Pro" },
  { id: "davinci", icon: MonitorPlay, label: "DaVinci Resolve" },
  { id: "finalcut", icon: Scissors, label: "Final Cut Pro" },
  { id: "aftereffects", icon: Sparkles, label: "After Effects" },
  { id: "capcut", icon: Video, label: "CapCut" },
  { id: "other", icon: Tv, label: "Other" },
  { id: "none", icon: Star, label: "None" },
];

const GOALS: { id: string; emoji: string; label: string }[] = [
  { id: "youtube", emoji: "🎥", label: "Create YouTube videos" },
  { id: "social", emoji: "📱", label: "Social media content" },
  { id: "cinema", emoji: "🎬", label: "Short films / cinema" },
  { id: "work", emoji: "💼", label: "Work / freelance" },
  { id: "fun", emoji: "🎮", label: "Just for fun" },
  { id: "school", emoji: "📚", label: "School / university" },
];

const REFERRALS: { id: string; emoji: string; label: string }[] = [
  { id: "youtube", emoji: "🎥", label: "YouTube" },
  { id: "tiktok", emoji: "📱", label: "TikTok" },
  { id: "instagram", emoji: "📸", label: "Instagram" },
  { id: "friend", emoji: "👋", label: "A friend" },
  { id: "search", emoji: "🔎", label: "Google search" },
  { id: "other", emoji: "💡", label: "Other" },
];

const btn = "rounded-2xl border-2 p-4 text-left transition-all duration-200";
const btnActive = "border-[#58cc02] bg-[#58cc02]/10 shadow-[0_0_0_2px_#58cc02]";
const btnInactive = "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10";

const TOTAL_STEPS = 5;

const MASCOT_LINES = [
  "Hey! Let's set up your experience.",
  "How much do you know about video editing?",
  "Which software have you used? (none is fine!)",
  "What's your main goal?",
  "Last step — add a profile photo and bio!",
];

export function Onboarding() {
  const done = useSettings((s) => s.onboardingDone);
  const complete = useSettings((s) => s.completeOnboarding);
  const setSettings = useSettings((s) => s.set);
  const hydrated = useHydrated();
  const status = useAuth((s) => s.status);
  const profile = useAuth((s) => s.profile);
  const userId = useAuth((s) => s.userId);
  const hasProgress = useProgress((s) => Object.keys(s.completed).length > 0);

  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [level, setLevel] = useState<EditingLevel | null>(null);
  const [software, setSoftware] = useState<Set<string>>(new Set());
  const [goal, setGoal] = useState<string | null>(null);
  const [referral, setReferral] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  if (!hydrated || done) return null;
  if (status !== "user") return null;
  if (hasProgress) {
    setSettings({ onboardingDone: true });
    return null;
  }

  const toggleSw = (id: string) => {
    const next = new Set(software);
    if (id === "none") return setSoftware(new Set(["none"]));
    next.delete("none");
    next.has(id) ? next.delete(id) : next.add(id);
    setSoftware(next);
  };

  const canNext =
    step === 0 ? true :
    step === 1 ? !!level :
    step === 2 ? software.size > 0 :
    step === 3 ? !!goal :
    true;

  const handleAvatar = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return;
    if (!file.type.startsWith("image/")) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const finish = async () => {
    if (!level || !goal) return;
    setSettings({ lang, theme });
    complete({ level, software: [...software], goal, referral: referral ?? undefined });

    const sb = getSupabase();
    if (sb && userId) {
      const updates: Record<string, unknown> = {};
      if (bio.trim()) updates.bio = bio.trim();
      if (Object.keys(updates).length) {
        try { await sb.from("profiles").update(updates).eq("id", userId); } catch {}
      }
      if (avatarFile) {
        try {
          const ext = avatarFile.name.split(".").pop() ?? "jpg";
          const path = `${userId}.${ext}`;
          await sb.storage.from("avatars").upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
          const { data } = sb.storage.from("avatars").getPublicUrl(path);
          const url = `${data.publicUrl}?t=${Date.now()}`;
          await sb.from("profiles").update({ avatar_url: url }).eq("id", userId);
        } catch {}
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#131f24] text-white overflow-y-auto">
      <div className="w-full max-w-lg px-6 py-8">
        {/* progress */}
        <div className="mb-8 flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={clsx("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-[#58cc02]" : "bg-white/10")} />
          ))}
        </div>

        {/* Squeak mascot */}
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#58cc02]/20 text-3xl">
            🐭
          </div>
          <div className="rounded-2xl rounded-bl-sm bg-white/10 px-4 py-2.5 text-sm font-bold leading-snug">
            {MASCOT_LINES[step]}
          </div>
        </div>

        {/* Step 0: Language + Theme */}
        {step === 0 && (
          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-2 text-xs font-black uppercase text-white/40">Language</p>
              <div className="grid grid-cols-2 gap-2">
                {LANGS.map((l) => (
                  <button key={l.id} type="button" onClick={() => setLang(l.id)} className={clsx(btn, "flex items-center gap-3 !p-3", lang === l.id ? btnActive : btnInactive)}>
                    <span className="text-xl">{l.flag}</span>
                    <span className="text-sm font-bold">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase text-white/40">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)} className={clsx(btn, "flex flex-col items-center gap-1 !p-3", theme === t.id ? btnActive : btnInactive)}>
                    <t.icon size={20} className={theme === t.id ? "text-[#58cc02]" : "text-white/40"} />
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
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

        {/* Step 2: Software */}
        {step === 2 && (
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

        {/* Step 3: Goal + Referral */}
        {step === 3 && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-2.5">
              {GOALS.map((g) => (
                <button key={g.id} type="button" onClick={() => setGoal(g.id)} className={clsx(btn, goal === g.id ? btnActive : btnInactive)}>
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-sm font-black">{g.label}</span>
                  </span>
                </button>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase text-white/40">How did you hear about us?</p>
              <div className="grid grid-cols-3 gap-2">
                {REFERRALS.map((r) => (
                  <button key={r.id} type="button" onClick={() => setReferral(r.id)} className={clsx(btn, "flex flex-col items-center gap-1 !p-3", referral === r.id ? btnActive : btnInactive)}>
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-[11px] font-bold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Profile photo + bio */}
        {step === 4 && (
          <div className="mt-6 flex flex-col items-center gap-6">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-white/10 text-4xl font-black text-white/30">
                  {(profile?.username ?? "?")[0].toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[#58cc02] text-[#131f24] shadow-lg">
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); }} />
              </label>
            </div>
            <p className="text-lg font-black">@{profile?.username ?? "..."}</p>
            <div className="w-full">
              <p className="mb-2 text-xs font-black uppercase text-white/40">Bio</p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full rounded-2xl border-2 border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors focus:border-[#58cc02]"
              />
              <p className="mt-1 text-right text-xs text-white/30">{bio.length}/150</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-2xl border-2 border-white/10 px-6 py-3 text-sm font-black text-white/60 transition-colors hover:bg-white/5">
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => (step < TOTAL_STEPS - 1 ? setStep(step + 1) : void finish())}
            className={clsx(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all",
              canNext ? "bg-[#58cc02] text-[#131f24] shadow-[0_4px_0_#46a302] active:translate-y-0.5 active:shadow-[0_2px_0_#46a302]" : "bg-white/10 text-white/30",
            )}
          >
            {step < TOTAL_STEPS - 1 ? "Next" : "Let's go!"} <ChevronRight size={18} />
          </button>
        </div>

        {/* Skip */}
        <button type="button" onClick={() => complete({ level: "zero", software: [], goal: "fun" })} className="mt-4 block w-full text-center text-xs font-bold text-white/30 transition-colors hover:text-white/50">
          Skip for now
        </button>
      </div>
    </div>
  );
}
