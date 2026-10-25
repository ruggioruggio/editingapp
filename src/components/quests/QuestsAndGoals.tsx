"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { ScrollText, Trophy } from "lucide-react";
import { GoalsGrid } from "@/components/goals/GoalsGrid";
import { QuestBoard } from "./QuestBoard";

type Tab = "quest" | "obiettivi";

/** Quest giornaliere e obiettivi in un'unica pagina, con un selettore in alto. */
export function QuestsAndGoals() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "obiettivi" ? "obiettivi" : "quest");

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border-2 border-line bg-panel p-1">
        {(
          [
            { id: "quest", label: "Quest", icon: ScrollText },
            { id: "obiettivi", label: "Obiettivi", icon: Trophy },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black uppercase tracking-wide transition-colors",
              tab === id ? "bg-panel-3 text-ink" : "text-ink-mute hover:text-ink",
            )}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>
      {tab === "quest" ? <QuestBoard /> : <GoalsGrid />}
    </div>
  );
}
