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
import { Mascot } from "@/components/brand/Mascot";
import { getTranslatedSections } from "@/content/course";
import { useSettings } from "@/lib/settings/store";
import { getLesson } from "@/content/lessons";
import { useHydrated } from "@/lib/hooks/useHydrated";
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
  const body = unlocked ? "#d4a55a" : "#5a5a64";
  const bodyDk = unlocked ? "#b8863a" : "#45454f";
  const lid = unlocked ? "#e6c47a" : "#6e6e78";
  const lidHi = unlocked ? "#f2dda0" : "#82828c";
  const clasp = unlocked ? "#fff8e8" : "#a0a0aa";

  return (
    <div className="flex flex-col items-center py-2">
      <svg viewBox="0 0 80 68" className="h-[68px] w-[80px] drop-shadow-md transition-transform hover:scale-105" fill="none">
        <ellipse cx="40" cy="65" rx="24" ry="3" fill="rgba(0,0,0,0.12)" />
        <rect x="18" y="56" width="6" height="8" rx="1.5" fill={bodyDk} />
        <rect x="56" y="56" width="6" height="8" rx="1.5" fill={bodyDk} />
        <rect x="14" y="30" width="52" height="30" rx="3" fill={body} />
        <rect x="14" y="30" width="52" height="10" rx="3" fill={lid} />
        <rect x="14" y="44" width="52" height="6" fill={bodyDk} />
        <rect x="14" y="54" width="52" height="6" rx="3" fill={bodyDk} />
        <rect x="10" y="20" width="60" height="14" rx="5" fill={lid} />
        <rect x="14" y="22" width="52" height="5" rx="2.5" fill={lidHi} opacity="0.4" />
        <circle cx="40" cy="34" r="5" fill={clasp} />
        {unlocked && <circle cx="40" cy="34" r="2" fill="#fbbf24" />}
      </svg>
    </div>
  );
}

export function LearnPath() {
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
        className="group mb-4 flex w-full items-center gap-3 rounded-2xl p-4 text-left text-[#121212] transition-all hover:brightness-105 active:scale-[0.98]"
        style={{ background: section.color }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-70">
            Sezione {sectionIdx + 1}
          </p>
          <h2 className="text-lg font-black leading-tight">{section.title}</h2>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#121212]/15 transition-transform group-hover:scale-105">
          <ChevronDown size={22} className="text-[#121212]" />
        </div>
      </button>

      {/* Section picker */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={() => setShowPicker(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-panel-2 p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Scegli una sezione</h3>
              <button type="button" onClick={() => setShowPicker(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-panel-3">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto">
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
                      i === sectionIdx ? "ring-2 ring-white/30" : "hover:bg-panel-3",
                    )}
                    style={i === sectionIdx ? { background: `${s.color}20` } : undefined}
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
  const soon = lesson.status === "soon";
  const locked = soon || (!unlocked && !done);
  const Icon = locked ? Lock : done ? Star : KIND_ICON[lesson.kind];

  return (
    <div data-lesson-node className="flex flex-col items-center">
      {current && !selected && (
        <div className="animate-pop mb-2 flex items-center gap-1 rounded-xl border border-line bg-panel-2 px-3 py-1 text-xs font-black">
          <Mascot size={30} idle /> INIZIA
        </div>
      )}
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
            ? "0 6px 0 var(--color-line)"
            : done
              ? "0 6px 0 #92400e"
              : `0 6px 0 color-mix(in srgb, ${color} 40%, black)`,
        }}
      >
        {!locked && (
          <div className="pointer-events-none absolute inset-x-[6px] top-[4px] h-[38%] rounded-full bg-gradient-to-b from-white/35 to-transparent" />
        )}
        <Icon size={done ? 30 : 28} strokeWidth={2.4} fill={done ? "currentColor" : "none"} />
      </button>

      {selected && (
        <div className="animate-pop absolute top-full z-20 mt-3 w-64 rounded-2xl border border-line bg-panel-2 p-4 shadow-2xl">
          <p className="font-black">{lesson.title}</p>
          <p className="mb-3 text-sm text-ink-dim">{lesson.goal}</p>
          {locked ? (
            <p className="rounded-xl bg-panel-3 px-2 py-2.5 text-center text-sm font-bold text-ink-mute">
              {soon ? "In arrivo" : "Completa prima la lezione precedente"}
            </p>
          ) : (
            <Link
              href={`/lesson/${lesson.id}`}
              className="duo-btn w-full"
              style={{ ["--face" as string]: color, ["--shade" as string]: `color-mix(in srgb, ${color} 55%, black)`, ["--ink" as string]: "#121212" }}
            >
              {done ? "Ripeti" : "Inizia"} +{getLesson(lesson.id)?.xp ?? 0} XP
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
