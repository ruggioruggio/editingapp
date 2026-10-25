"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, Crown, ScrollText, Trophy, Users, type LucideIcon } from "lucide-react";
import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { todayState, useProgress } from "@/lib/progress/store";

const ITEMS: { href: string; label: string; icon: LucideIcon; color: string }[] = [
  { href: "/learn", label: "Impara", icon: BookOpen, color: "#9999ff" },
  { href: "/quests", label: "Quest", icon: ScrollText, color: "#d291ff" },
  { href: "/goals", label: "Obiettivi", icon: Trophy, color: "#ffc93c" },
  { href: "/friends", label: "Amici", icon: Users, color: "#5ce1e6" },
  { href: "/pricing", label: "Pro", icon: Crown, color: "#ff9a5c" },
];

/** Quante quest di oggi sono completate ma non ancora riscattate. */
function useClaimableQuests() {
  const hydrated = useHydrated();
  const today = useProgress((s) => s.today);
  if (!hydrated) return 0;
  const t = todayState(today);
  return questsForDay(t.day).filter((q) => questProgress(q, t.stats) >= q.target && !t.claimedQuests.includes(q.id)).length;
}

/** Dock flottante in liquid glass, stile Apple. Uguale su telefono e desktop. */
export function Dock() {
  const pathname = usePathname();
  const claimable = useClaimableQuests();

  return (
    <nav
      aria-label="Navigazione principale"
      className="glass fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-end gap-1 rounded-[30px] px-2 py-2 sm:gap-2 sm:px-3"
    >
      {ITEMS.map(({ href, label, icon: Icon, color }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="group relative flex w-14 flex-col items-center gap-0.5 sm:w-16"
          >
            <span
              className={clsx(
                "relative grid h-11 w-11 place-items-center rounded-2xl transition-all duration-200 ease-out group-hover:-translate-y-1.5 group-hover:scale-115 sm:h-12 sm:w-12",
                active ? "bg-white/18 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]" : "group-hover:bg-white/8",
              )}
            >
              <Icon size={22} strokeWidth={2.2} style={{ color: active ? color : undefined }} className={active ? "" : "text-ink-dim group-hover:text-ink"} />
              {href === "/quests" && claimable > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-black text-white">
                  {claimable}
                </span>
              )}
            </span>
            <span className={clsx("text-[10px] font-bold", active ? "text-ink" : "text-ink-mute")}>{label}</span>
            <span className={clsx("h-1 w-1 rounded-full bg-white transition-opacity", active ? "opacity-80" : "opacity-0")} />
          </Link>
        );
      })}
    </nav>
  );
}
