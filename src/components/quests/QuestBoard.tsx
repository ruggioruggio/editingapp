"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, Clock, Gift, Zap } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { todayState, useProgress } from "@/lib/progress/store";
import { sfx } from "@/lib/settings/sfx";

function useTimeToMidnight() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const mins = Math.floor((midnight.getTime() - now.getTime()) / 60000);
      setLabel(`${Math.floor(mins / 60)} h ${mins % 60} min`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export function QuestBoard() {
  const hydrated = useHydrated();
  const today = useProgress((s) => s.today);
  const claimQuest = useProgress((s) => s.claimQuest);
  const resetIn = useTimeToMidnight();

  if (!hydrated) return <div className="h-72" />;

  const t = todayState(today);
  const quests = questsForDay(t.day);
  const doneCount = quests.filter((q) => t.claimedQuests.includes(q.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-3xl border border-[#d291ff]/40 bg-linear-to-br from-[#d291ff]/20 to-panel p-5">
        <Mascot size={84} idle mood={doneCount === quests.length ? "wow" : "happy"} />
        <div>
          <h2 className="text-xl font-black">
            {doneCount === quests.length ? "Tutte completate!" : "Quest del giorno"}
          </h2>
          <p className="text-sm text-ink-dim">Completa le quest per guadagnare XP extra.</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-ink-mute">
            <Clock size={13} /> Nuove quest tra {resetIn}
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {quests.map((q) => {
          const progress = questProgress(q, t.stats);
          const complete = progress >= q.target;
          const claimed = t.claimedQuests.includes(q.id);
          return (
            <li key={q.id} className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4">
              <div
                className={clsx(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
                  claimed ? "bg-success/20 text-success" : "bg-cheese/15 text-cheese",
                )}
              >
                {claimed ? <Check size={24} strokeWidth={3} /> : <Zap size={24} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{q.title}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-panel-3">
                    <div
                      className="h-full rounded-full bg-cheese transition-[width] duration-500"
                      style={{ width: `${(progress / q.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-ink-mute">
                    {progress}/{q.target}
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={!complete || claimed}
                onClick={() => {
                  sfx("quest");
                  claimQuest(q.id, q.xp);
                }}
                className={clsx(
                  "btn-3d flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-sm font-black",
                  complete && !claimed ? "bg-cheese text-[#4a3500]" : "bg-panel-3 text-ink-mute",
                )}
              >
                {claimed ? "Preso" : <><Gift size={15} /> +{q.xp} XP</>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
