"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  BookOpen,
  Check,
  ChevronDown,
  Clapperboard,
  Lock,
  Palette,
  Scissors,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { sections } from "@/content/course";
import { getLesson } from "@/content/lessons";
import { useHydrated } from "@/lib/hooks/useHydrated";
import type { LessonKind, LessonMeta, Section } from "@/lib/lessons/types";
import { useProgress } from "@/lib/progress/store";

// Percorso a zig-zag stile Duolingo
const OFFSETS = [0, 46, 70, 46, 0, -46, -70, -46];

const KIND_ICON: Record<LessonKind, LucideIcon> = {
  editor: Scissors,
  theory: BookOpen,
  audio: Volume2,
  color: Palette,
  motion: Sparkles,
  project: Clapperboard,
};

export function LearnPath() {
  const hydrated = useHydrated();
  const completed = useProgress((s) => s.completed);
  const isDone = (id: string) => hydrated && Boolean(completed[id]);

  const all = sections.flatMap((s) => s.units.flatMap((u) => u.lessons));
  const nextUp = all.find((l) => l.status === "available" && !isDone(l.id))?.id;
  const currentSection = sections.find((s) => s.units.some((u) => u.lessons.some((l) => l.id === nextUp))) ?? sections[0];

  const [open, setOpen] = useState<string>(currentSection.id);
  const [selected, setSelected] = useState<string | null>(null);

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
  nextUp,
  selected,
  onSelect,
}: {
  section: Section;
  index: number;
  open: boolean;
  onToggle: () => void;
  isDone: (id: string) => boolean;
  nextUp?: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const lessons = section.units.flatMap((u) => u.lessons);
  const done = lessons.filter((l) => isDone(l.id)).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-panel/60">
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
          {section.units.map((unit, u) => (
            <div key={unit.id}>
              <div className="mb-8 rounded-2xl p-4 text-[#121212]" style={{ background: section.color }}>
                <p className="text-xs font-black uppercase tracking-widest opacity-70">Unità {unit.id.slice(1)}</p>
                <h3 className="text-lg font-black">{unit.title}</h3>
                <p className="text-sm font-semibold opacity-80">{unit.description}</p>
              </div>
              <ol className="flex flex-col items-center gap-7">
                {unit.lessons.map((lesson, i) => (
                  <li
                    key={lesson.id}
                    className={clsx("relative", selected === lesson.id && "z-30")}
                    style={{ transform: `translateX(${OFFSETS[(i + u * 2) % OFFSETS.length]}px)` }}
                  >
                    <LessonNode
                      lesson={lesson}
                      color={section.color}
                      done={isDone(lesson.id)}
                      current={lesson.id === nextUp}
                      selected={selected === lesson.id}
                      onSelect={() => onSelect(lesson.id)}
                    />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LessonNode({
  lesson,
  color,
  done,
  current,
  selected,
  onSelect,
}: {
  lesson: LessonMeta;
  color: string;
  done: boolean;
  current: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const locked = lesson.status === "soon";
  const Icon = locked ? Lock : done ? Check : KIND_ICON[lesson.kind];

  return (
    <div className="flex flex-col items-center">
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
          "grid h-[70px] w-[70px] place-items-center rounded-full transition-transform active:translate-y-1",
          locked ? "bg-panel-3 text-ink-mute" : "hover:scale-105",
          done && "bg-cheese text-[#4a3500]",
          !locked && !done && "text-[#121212]",
          current && "ring-4 ring-white/15 ring-offset-4 ring-offset-app",
        )}
        style={{ background: !locked && !done ? color : undefined, boxShadow: "0 6px 0 rgb(0 0 0 / 0.45)" }}
      >
        <Icon size={28} strokeWidth={2.6} />
      </button>

      {selected && (
        <div className="animate-pop absolute top-full z-20 mt-3 w-64 rounded-2xl border border-line bg-panel-2 p-4 shadow-2xl">
          <p className="font-black">{lesson.title}</p>
          <p className="mb-3 text-sm text-ink-dim">{lesson.goal}</p>
          {locked ? (
            <p className="rounded-xl bg-panel-3 py-2.5 text-center text-sm font-bold text-ink-mute">In arrivo</p>
          ) : (
            <Link
              href={`/lesson/${lesson.id}`}
              className="btn-3d block rounded-xl py-2.5 text-center font-black uppercase text-[#121212]"
              style={{ background: color }}
            >
              {done ? "Ripeti" : "Inizia"} +{getLesson(lesson.id)?.xp ?? 0} XP
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
