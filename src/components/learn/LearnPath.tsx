"use client";

import Link from "next/link";
import clsx from "clsx";
import { Check, Lock, Play } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { course } from "@/content/course";
import { useHydrated } from "@/lib/hooks/useHydrated";
import type { LessonMeta } from "@/lib/lessons/types";
import { useProgress } from "@/lib/progress/store";

// Percorso a zig-zag stile Duolingo
const OFFSETS = [0, 44, 66, 44, 0, -44, -66, -44];

export function LearnPath() {
  const hydrated = useHydrated();
  const completed = useProgress((s) => s.completed);
  const isDone = (id: string) => hydrated && Boolean(completed[id]);

  const nextUp = course.flatMap((u) => u.lessons).find((l) => l.status === "available" && !isDone(l.id))?.id;

  return (
    <div className="space-y-14">
      {course.map((unit, unitIndex) => (
        <section key={unit.id}>
          <div
            className="mb-10 rounded-2xl border p-5"
            style={{ background: `linear-gradient(135deg, ${unit.color}26, transparent 70%)`, borderColor: `${unit.color}55` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: unit.color }}>
              Unità {unitIndex + 1}
            </p>
            <h2 className="text-xl font-bold">{unit.title}</h2>
            <p className="text-sm text-ink-dim">{unit.description}</p>
          </div>

          <ol className="flex flex-col items-center gap-8">
            {unit.lessons.map((lesson, i) => (
              <li key={lesson.id} style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }}>
                <LessonNode lesson={lesson} color={unit.color} done={isDone(lesson.id)} current={lesson.id === nextUp} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function LessonNode({ lesson, color, done, current }: { lesson: LessonMeta; color: string; done: boolean; current: boolean }) {
  const locked = lesson.status === "soon";
  const circle = (
    <span
      className={clsx(
        "relative grid h-[72px] w-[72px] place-items-center rounded-full transition-transform",
        !locked && "hover:scale-105 active:translate-y-1",
        locked && "bg-panel-3 text-ink-mute",
        done && "bg-cheese text-[#4a3500]",
      )}
      style={{
        background: !locked && !done ? color : undefined,
        boxShadow: "0 6px 0 rgb(0 0 0 / 0.45)",
      }}
    >
      {locked ? <Lock size={24} /> : done ? <Check size={30} strokeWidth={3} /> : <Play size={28} fill="currentColor" className="text-[#141414]" />}
    </span>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {current && (
        <div className="animate-pop mb-1 flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold">
          <Mascot size={24} /> Inizia da qui!
        </div>
      )}
      {locked ? (
        <span title="Presto disponibile">{circle}</span>
      ) : (
        <Link href={`/lesson/${lesson.id}`} aria-label={lesson.title}>
          {circle}
        </Link>
      )}
      <span className={clsx("max-w-40 text-center text-xs font-semibold", locked ? "text-ink-mute" : "text-ink")}>
        {lesson.title}
        {locked && <span className="block font-normal">Presto</span>}
      </span>
    </div>
  );
}
