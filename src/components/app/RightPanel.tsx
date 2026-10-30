"use client";

import Link from "next/link";
import { Check, Clock, Zap } from "lucide-react";
import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { todayState, useProgress } from "@/lib/progress/store";
import { sfx } from "@/lib/settings/sfx";
import { StatsBar } from "./StatsBar";
import { AccountMenu } from "./AccountMenu";
import { useEffect, useState } from "react";

function useTimeToMidnight() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const mins = Math.floor((midnight.getTime() - now.getTime()) / 60000);
      const h = Math.floor(mins / 60);
      setLabel(`${h} ORE`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);
  return label;
}

function DailyQuestsWidget() {
  const hydrated = useHydrated();
  const today = useProgress((s) => s.today);
  const claimQuest = useProgress((s) => s.claimQuest);
  const resetIn = useTimeToMidnight();

  if (!hydrated) return <div className="h-48 animate-pulse rounded-2xl bg-panel" />;

  const t = todayState(today);
  const quests = questsForDay(t.day);

  return (
    <div className="rounded-2xl border-2 border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-black">Missioni giornaliere</h3>
        <span className="flex items-center gap-1 text-xs font-bold text-ink-mute">
          <Clock size={13} /> {resetIn}
        </span>
      </div>
      <ul className="divide-y divide-line">
        {quests.map((q) => {
          const progress = questProgress(q, t.stats);
          const complete = progress >= q.target;
          const claimed = t.claimedQuests.includes(q.id);
          return (
            <li key={q.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${claimed ? "bg-success/20 text-success" : "bg-cheese/15 text-cheese"}`}>
                {claimed ? <Check size={18} strokeWidth={3} /> : <Zap size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{q.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-3">
                    <div
                      className="h-full rounded-full bg-cheese transition-[width] duration-500"
                      style={{ width: `${Math.min(100, (progress / q.target) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-ink-mute">{Math.min(progress, q.target)}/{q.target}</span>
                </div>
              </div>
              {complete && !claimed && (
                <button
                  type="button"
                  onClick={() => { claimQuest(q.id); sfx("quest"); }}
                  className="shrink-0 rounded-xl bg-cheese px-3 py-1.5 text-xs font-black text-[#3a2500]"
                >
                  +{q.reward} XP
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <Link href="/quests" className="block border-t border-line px-4 py-2.5 text-center text-xs font-black uppercase text-pr hover:underline">
        Vedi tutto
      </Link>
    </div>
  );
}

export function RightPanel() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-80 shrink-0 overflow-y-auto border-l border-white/5 p-5 lg:block">
      <div className="mb-5 flex items-center justify-between">
        <StatsBar />
        <AccountMenu />
      </div>
      <DailyQuestsWidget />
    </aside>
  );
}
