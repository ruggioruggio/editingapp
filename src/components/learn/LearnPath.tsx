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
  const wood1 = unlocked ? "#c47a29" : "#5a5a64";
  const wood2 = unlocked ? "#a0621e" : "#44444e";
  const wood3 = unlocked ? "#8b5218" : "#3a3a44";
  const woodLight = unlocked ? "#dea04a" : "#6e6e7a";
  const metal = unlocked ? "#f5d67b" : "#9e9eaa";
  const metalDark = unlocked ? "#c9a23c" : "#6e6e7a";
  const shadow = unlocked ? "rgba(139,82,24,0.5)" : "rgba(0,0,0,0.4)";

  return (
    <div className="flex flex-col items-center py-2">
      <svg viewBox="0 0 80 72" className="h-[72px] w-[80px] drop-shadow-lg transition-transform hover:scale-105" fill="none">
        {/* shadow on ground */}
        <ellipse cx="40" cy="68" rx="32" ry="4" fill={shadow} />

        {/* chest body - bottom half */}
        <rect x="8" y="36" width="64" height="28" rx="4" fill={wood2} />
        {/* wood planks on body */}
        <rect x="8" y="36" width="64" height="7" rx="4" fill={wood1} />
        <rect x="8" y="43" width="64" height="7" fill={wood2} />
        <rect x="8" y="50" width="64" height="7" fill={wood3} />
        <rect x="8" y="57" width="64" height="7" rx="4" fill={wood2} />
        {/* body highlight (left edge) */}
        <rect x="8" y="36" width="4" height="28" rx="2" fill={woodLight} opacity="0.3" />

        {/* metal bands on body */}
        <rect x="6" y="44" width="68" height="4" rx="2" fill={metalDark} />
        <rect x="6" y="44" width="68" height="2" rx="1" fill={metal} />

        {/* lid - top half (rounded/domed) */}
        <path d={`M8 36 Q8 16, 40 14 Q72 16, 72 36 Z`} fill={wood1} />
        {/* lid highlight */}
        <path d={`M12 34 Q12 20, 40 18 Q68 20, 68 34 Z`} fill={woodLight} opacity="0.25" />
        {/* lid plank line */}
        <path d={`M10 30 Q10 22, 40 20 Q70 22, 70 30`} stroke={wood3} strokeWidth="1" fill="none" opacity="0.5" />

        {/* metal band on lid */}
        <path d={`M6 36 Q6 18, 40 16 Q74 18, 74 36`} stroke={metalDark} strokeWidth="3.5" fill="none" />
        <path d={`M6 35 Q6 17, 40 15 Q74 17, 74 35`} stroke={metal} strokeWidth="1.5" fill="none" />

        {/* side metal brackets */}
        <rect x="6" y="32" width="5" height="12" rx="2" fill={metalDark} />
        <rect x="6" y="32" width="3" height="12" rx="1.5" fill={metal} opacity="0.7" />
        <rect x="69" y="32" width="5" height="12" rx="2" fill={metalDark} />
        <rect x="71" y="32" width="3" height="12" rx="1.5" fill={metal} opacity="0.7" />

        {/* center clasp / lock */}
        <rect x="33" y="32" width="14" height="16" rx="3" fill={metalDark} />
        <rect x="34" y="33" width="12" height="14" rx="2.5" fill={metal} />
        <circle cx="40" cy="42" r="3.5" fill={metalDark} />
        <circle cx="40" cy="42" r="2" fill={unlocked ? "#f59e0b" : "#52525b"} />
        {unlocked && <circle cx="40" cy="42" r="1" fill="#fef3c7" />}
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
  const currentSection = sections.find((s) => s.units.some((u) => u.lessons.some((l) => l.id === nextUp))) ?? sections[0];

  const [open, setOpen] = useState<string>(currentSection.id);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-lesson-node]")) setSelected(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [selected]);

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <SectionBlock
          key={section.id}
          section={section}
          index={i}
          open={open === section.id}
          onToggle={() => setOpen(open === section.id ? "" : section.id)}
          isDone={isDone}
          unlocked={unlocked}
          canSkip={(unitId) => hydrated && !unlockAll && canSkipTo(unitId, completed)}
          nextUp={nextUp}
          selected={selected}
          onSelect={(id) => setSelected(selected === id ? null : id)}
        />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  index,
  open,
  onToggle,
  isDone,
  unlocked,
  canSkip,
  nextUp,
  selected,
  onSelect,
}: {
  section: Section;
  index: number;
  open: boolean;
  onToggle: () => void;
  isDone: (id: string) => boolean;
  unlocked: (id: string) => boolean;
  canSkip: (unitId: string) => boolean;
  nextUp?: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const lessons = section.units.flatMap((u) => u.lessons);
  const done = lessons.filter((l) => isDone(l.id)).length;

  return (
    <section className="rounded-3xl border border-line bg-panel/60 md:border-0 md:bg-transparent">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 p-5 text-left">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: section.color }}>
            Sezione {index + 1} · {section.level}
          </p>
          <h2 className="text-xl font-black">{section.title}</h2>
          <p className="text-sm text-ink-dim">{section.description}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-3">
              <div className="h-full rounded-full" style={{ width: `${(done / lessons.length) * 100}%`, background: section.color }} />
            </div>
            <span className="text-xs font-bold text-ink-mute">
              {done}/{lessons.length}
            </span>
          </div>
        </div>
        <ChevronDown size={22} className={clsx("shrink-0 text-ink-mute transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-10 px-4 pb-10">
          {section.units.map((unit, u) => {
            const unitLessons = unit.lessons;
            return (
              <div key={unit.id}>
                <div className="mb-8 rounded-2xl p-4 text-[#121212]" style={{ background: section.color }}>
                  <p className="text-xs font-black uppercase tracking-widest opacity-70">Unità {unit.id.slice(1)}</p>
                  <h3 className="text-lg font-black">{unit.title}</h3>
                  <p className="text-sm font-semibold opacity-80">{unit.description}</p>
                  {canSkip(unit.id) && (
                    <Link href={`/unit-test/${unit.id}`} className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-[#121212]/30 bg-[#121212]/15 px-3 py-1.5 text-xs font-black uppercase hover:bg-[#121212]/25">
                      <KeyRound size={14} /> Salta qui
                    </Link>
                  )}
                </div>
                <ol className="flex flex-col items-center gap-7">
                  {unitLessons.map((lesson, i) => {
                    const showChest = i > 0 && i % 3 === 0;
                    const chestUnlocked = unitLessons.slice(Math.max(0, i - 3), i).every((l) => isDone(l.id));
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
                          onSelect={() => onSelect(lesson.id)}
                        />
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </section>
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
          background: locked ? undefined : done ? "linear-gradient(180deg, #fbbf24 0%, #d97706 100%)" : `linear-gradient(180deg, color-mix(in srgb, ${color} 85%, white) 0%, ${color} 100%)`,
          boxShadow: locked
            ? "0 8px 0 #1f1f1f"
            : done
              ? "0 8px 0 #92400e, 0 12px 24px rgba(245,158,11,0.25)"
              : `0 8px 0 color-mix(in srgb, ${color} 45%, black), 0 12px 24px color-mix(in srgb, ${color} 20%, transparent)`,
        }}
      >
        {/* glossy highlight */}
        {!locked && (
          <div className="pointer-events-none absolute inset-x-[6px] top-[4px] h-[40%] rounded-full bg-gradient-to-b from-white/40 to-transparent" />
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
