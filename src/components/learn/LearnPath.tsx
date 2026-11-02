"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  BookOpen,
  Check,
  ChevronDown,
  Clapperboard,
  KeyRound,
  Lock,
  Palette,
  Scissors,
  Sparkles,
  Star,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react";
import { getTranslatedSections } from "@/content/course";
import { useSettings } from "@/lib/settings/store";
import { getLesson } from "@/content/lessons";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useT } from "@/lib/settings/i18n";
import type { LessonKind, LessonMeta, Section } from "@/lib/lessons/types";
import { canSkipTo, isLessonUnlocked } from "@/lib/lessons/progression";
import { useAdmin } from "@/lib/admin/client";
import { useProgress } from "@/lib/progress/store";

const OFFSETS = [0, 46, 70, 46, 0, -46, -70, -46];

const KIND_ICON: Record<LessonKind, LucideIcon> = {
  editor: Scissors,
  theory: BookOpen,
  audio: Volume2,
  color: Palette,
  motion: Sparkles,
  project: Clapperboard,
};

function TreasureChest({ unlocked }: { unlocked: boolean }) {
  const t = useT();
  const [opened, setOpened] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const claimQuest = useProgress((s) => s.claimQuest);
  const chestXp = 25;

  const handleOpen = () => {
    if (!unlocked || opened) return;
    setOpened(true);
    try {
      const key = `chest-${Date.now()}`;
      claimQuest(key, chestXp);
    } catch {}
  };

  useEffect(() => {
    if (opened) {
      const timer = setTimeout(() => setClaimed(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [opened]);

  const body = unlocked ? "#d4a55a" : "#5a5a64";
  const bodyDk = unlocked ? "#b8863a" : "#45454f";
  const lid = unlocked ? "#e6c47a" : "#6e6e78";
  const lidHi = unlocked ? "#f2dda0" : "#82828c";
  const clasp = unlocked ? "#fff8e8" : "#a0a0aa";
  const glow = unlocked && !opened;

  return (
    <div className="flex flex-col items-center py-2">
      <button
        type="button"
        onClick={handleOpen}
        disabled={!unlocked || opened}
        className={clsx("group relative transition-transform", unlocked && !opened && "cursor-pointer hover:scale-110 active:scale-95")}
      >
        {glow && (
          <span className="absolute inset-0 -m-3 animate-pulse rounded-full bg-cheese/20 blur-xl" />
        )}
        <svg viewBox="0 0 100 85" className="relative h-[85px] w-[100px] drop-shadow-lg" fill="none">
          <ellipse cx="50" cy="80" rx="30" ry="4" fill="rgba(0,0,0,0.15)" />
          {/* Coins on ground */}
          {unlocked && (
            <>
              <circle cx="18" cy="76" r="5" fill="#fbbf24" stroke="#d4950a" strokeWidth="0.8" />
              <circle cx="82" cy="77" r="4.5" fill="#fbbf24" stroke="#d4950a" strokeWidth="0.8" />
              <circle cx="26" cy="79" r="3.5" fill="#fcd34d" stroke="#d4950a" strokeWidth="0.6" />
              <circle cx="76" cy="80" r="3" fill="#fcd34d" stroke="#d4950a" strokeWidth="0.6" />
              <text x="18" y="78" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#92600a">XP</text>
              <text x="82" y="79" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#92600a">XP</text>
            </>
          )}
          {/* Legs */}
          <rect x="22" y="66" width="7" height="10" rx="2" fill={bodyDk} />
          <rect x="71" y="66" width="7" height="10" rx="2" fill={bodyDk} />
          {/* Body */}
          <rect x="18" y="38" width="64" height="34" rx="5" fill={body} />
          <rect x="18" y="52" width="64" height="8" fill={bodyDk} opacity="0.4" />
          <rect x="18" y="64" width="64" height="8" rx="5" fill={bodyDk} />
          {/* Metal bands */}
          <rect x="16" y="38" width="68" height="4" rx="2" fill={lid} />
          <rect x="16" y="55" width="68" height="3" rx="1.5" fill={lid} opacity="0.5" />
          {/* Lid */}
          <g style={{ transformOrigin: "50px 28px", transition: "transform 0.5s cubic-bezier(.34,1.56,.64,1)", transform: opened ? "rotate(-35deg)" : "rotate(0deg)" }}>
            <rect x="14" y="22" width="72" height="18" rx="6" fill={lid} />
            <rect x="18" y="24" width="64" height="7" rx="3" fill={lidHi} opacity="0.4" />
            {/* Clasp */}
            <rect x="44" y="34" width="12" height="8" rx="3" fill={clasp} />
            <circle cx="50" cy="38" r="2.5" fill={unlocked ? "#fbbf24" : "#888"} />
          </g>
          {/* Glow from inside when opened */}
          {opened && (
            <ellipse cx="50" cy="38" rx="20" ry="8" fill="#fbbf24" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1.5s" repeatCount="indefinite" />
            </ellipse>
          )}
        </svg>
        {opened && !claimed && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce rounded-full bg-cheese px-3 py-1 text-xs font-black text-[#3a2500] shadow-lg">
            +{chestXp} XP
          </span>
        )}
      </button>
    </div>
  );
}

export function LearnPath() {
  const t = useT();
  const hydrated = useHydrated();
  const completed = useProgress((s) => s.completed);
  const isDone = (id: string) => hydrated && Boolean(completed[id]);
  const lang = useSettings((s) => s.lang);
  const sections = getTranslatedSections(lang);

  const all = sections.flatMap((s) => s.units.flatMap((u) => u.lessons));
  const unlockAll = useAdmin((s) => s.unlockAll);
  const unlocked = (id: string) => hydrated && (unlockAll || isLessonUnlocked(id, completed));
  const nextUp = all.find((l) => l.status === "available" && !isDone(l.id) && unlocked(l.id))?.id;

  const defaultIdx = Math.max(0, sections.findIndex((s) => s.units.some((u) => u.lessons.some((l) => l.id === nextUp))));
  const [sectionIdx, setSectionIdx] = useState(defaultIdx);
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-lesson-node]")) setSelected(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [selected]);

  const section = sections[sectionIdx] ?? sections[0];
  const sectionLessons = section.units.flatMap((u) => u.lessons);
  const sectionDone = sectionLessons.filter((l) => isDone(l.id)).length;

  return (
    <div>
      {/* Section banner — clickable to change section */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="group mb-4 flex w-full items-center gap-3 rounded-2xl p-4 text-left text-[#121212] transition-transform active:scale-[0.98]"
        style={{ background: section.color, WebkitBackfaceVisibility: "hidden" }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-70">
            {t("section")} {sectionIdx + 1}
          </p>
          <h2 className="text-lg font-black leading-tight">{section.title}</h2>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#121212]/15 transition-transform group-hover:scale-105">
          <ChevronDown size={22} className="text-[#121212]" />
        </div>
      </button>

      {/* Section picker */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowPicker(false)}>
          <div className="w-full max-w-md rounded-3xl border border-line bg-panel-2 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">{t("chooseSection")}</h3>
              <button type="button" onClick={() => setShowPicker(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-panel-3">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[56vh] space-y-2 overflow-y-auto">
              {sections.map((s, i) => {
                const lessons = s.units.flatMap((u) => u.lessons);
                const done = lessons.filter((l) => isDone(l.id)).length;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setSectionIdx(i); setShowPicker(false); }}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors",
                      i === sectionIdx ? "bg-panel-3" : "hover:bg-panel-3",
                    )}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black text-[#121212]" style={{ background: s.color }}>
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black">{s.title}</p>
                      <p className="text-xs text-ink-dim">{s.level} · {done}/{lessons.length}</p>
                    </div>
                    {done === lessons.length && lessons.length > 0 && <Check size={20} className="text-success" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-panel-3">
          <div className="h-full rounded-full transition-all" style={{ width: `${sectionLessons.length ? (sectionDone / sectionLessons.length) * 100 : 0}%`, background: section.color }} />
        </div>
        <span className="text-xs font-bold text-ink-mute">{sectionDone}/{sectionLessons.length}</span>
      </div>

      {/* Units for current section */}
      <div className="space-y-10 px-2">
        {section.units.map((unit, u) => (
          <div key={unit.id}>
            <div className="mb-8 rounded-2xl p-4 text-[#121212]" style={{ background: section.color }}>
              <p className="text-xs font-black uppercase tracking-widest opacity-70">Unità {unit.id.slice(1)}</p>
              <h3 className="text-lg font-black">{unit.title}</h3>
              <p className="text-sm font-semibold opacity-80">{unit.description}</p>
              {hydrated && !unlockAll && canSkipTo(unit.id, completed) && (
                <Link href={`/unit-test/${unit.id}`} className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-[#121212]/30 bg-[#121212]/15 px-3 py-1.5 text-xs font-black uppercase hover:bg-[#121212]/25">
                  <KeyRound size={14} /> Salta qui
                </Link>
              )}
            </div>
            <ol className="flex flex-col items-center gap-7">
              {unit.lessons.map((lesson, i) => {
                const showChest = i > 0 && i % 3 === 0;
                const chestUnlocked = unit.lessons.slice(Math.max(0, i - 3), i).every((l) => isDone(l.id));
                return (
                  <li
                    key={lesson.id}
                    className={clsx("relative", selected === lesson.id && "z-30")}
                    style={{ transform: `translateX(${OFFSETS[(i + u * 2) % OFFSETS.length]}px)` }}
                  >
                    {showChest && (
                      <div className="mb-6 flex justify-center" style={{ transform: `translateX(${-OFFSETS[(i + u * 2) % OFFSETS.length]}px)` }}>
                        <TreasureChest unlocked={chestUnlocked} />
                      </div>
                    )}
                    <LessonNode
                      lesson={lesson}
                      color={section.color}
                      done={isDone(lesson.id)}
                      unlocked={unlocked(lesson.id)}
                      current={lesson.id === nextUp}
                      selected={selected === lesson.id}
                      onSelect={() => setSelected(selected === lesson.id ? null : lesson.id)}
                    />
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonNode({
  lesson,
  color,
  done,
  unlocked,
  current,
  selected,
  onSelect,
}: {
  lesson: LessonMeta;
  color: string;
  done: boolean;
  unlocked: boolean;
  current: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const soon = lesson.status === "soon";
  const locked = soon || (!unlocked && !done);
  const COMING_SOON_LABEL = t("comingSoon");
  const COMPLETE_PREV_LABEL = t("completePrev");
  const Icon = locked ? Lock : done ? Star : KIND_ICON[lesson.kind];

  return (
    <div data-lesson-node className="flex flex-col items-center">
      <button
        type="button"
        onClick={onSelect}
        aria-label={lesson.title}
        className={clsx(
          "relative grid h-[72px] w-[72px] place-items-center rounded-full transition-transform active:translate-y-1",
          locked ? "bg-panel-3 text-ink-mute" : "hover:scale-105",
          done && "text-[#4a3500]",
          !locked && !done && "text-[#121212]",
          current && "ring-4 ring-white/20 ring-offset-4 ring-offset-app",
        )}
        style={{
          background: locked
            ? undefined
            : done
              ? "linear-gradient(180deg, #fbbf24 0%, #d97706 100%)"
              : `linear-gradient(180deg, color-mix(in srgb, ${color} 85%, white) 0%, ${color} 100%)`,
          boxShadow: locked
            ? "0 6px 0 0 var(--color-line)"
            : done
              ? "0 6px 0 0 #92400e"
              : `0 6px 0 0 color-mix(in srgb, ${color} 40%, black)`,
        }}
      >
        <Icon size={done ? 30 : 28} strokeWidth={2.4} fill={done ? "currentColor" : "none"} />
      </button>

      {selected && (
        <div className="animate-pop absolute top-full z-20 mt-3 w-64 rounded-2xl border border-line bg-panel-2 p-4 shadow-2xl">
          <p className="font-black">{lesson.title}</p>
          <p className="mb-3 text-sm text-ink-dim">{lesson.goal}</p>
          {locked ? (
            <p className="rounded-xl bg-panel-3 px-2 py-2.5 text-center text-sm font-bold text-ink-mute">
              {soon ? COMING_SOON_LABEL : COMPLETE_PREV_LABEL}
            </p>
          ) : (
            <Link
              href={`/lesson/${lesson.id}`}
              className="duo-btn w-full"
              style={{ ["--face" as string]: color, ["--shade" as string]: `color-mix(in srgb, ${color} 55%, black)`, ["--ink" as string]: "#121212" }}
            >
              {done ? t("repeat") : t("start")} +{getLesson(lesson.id, lang)?.xp ?? 0} XP
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
