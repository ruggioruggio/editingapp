"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, ScrollText, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import { AppIcon } from "@/components/brand/Mascot";
import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { todayState, useProgress } from "@/lib/progress/store";

type Item = { href: string; label: string; icon: LucideIcon; color: string };

const LEFT: Item[] = [
  { href: "/learn", label: "Impara", icon: BookOpen, color: "#9999ff" },
  { href: "/quests", label: "Quest", icon: ScrollText, color: "#d291ff" },
];
const RIGHT: Item[] = [
  { href: "/goals", label: "Obiettivi", icon: Trophy, color: "#ffc93c" },
  { href: "/friends", label: "Amici", icon: Users, color: "#5ce1e6" },
];

/** Quante quest di oggi sono completate ma non ancora riscattate. */
function useClaimableQuests() {
  const hydrated = useHydrated();
  const today = useProgress((s) => s.today);
  if (!hydrated) return 0;
  const t = todayState(today);
  return questsForDay(t.day).filter((q) => questProgress(q, t.stats) >= q.target && !t.claimedQuests.includes(q.id)).length;
}

function DockItem({ item, active, badge }: { item: Item; active: boolean; badge?: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group relative flex w-14 flex-col items-center gap-1 sm:w-16"
    >
      <span
        className={clsx(
          "relative grid h-11 w-11 place-items-center rounded-2xl transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:scale-110",
          active ? "bg-white/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]" : "group-hover:bg-white/10",
        )}
      >
        <Icon size={22} strokeWidth={2.3} style={{ color: active ? item.color : "#d4d4d8" }} />
        {!!badge && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-black text-white ring-2 ring-[#18181f]">
            {badge}
          </span>
        )}
      </span>
      <span className={clsx("text-[11px] font-extrabold leading-none", active ? "text-white" : "text-zinc-300")}>
        {item.label}
      </span>
    </Link>
  );
}

/** Dock flottante in liquid glass, stile Apple, con Squeak AI al centro. */
export function Dock() {
  const pathname = usePathname();
  const claimable = useClaimableQuests();
  const aiActive = pathname.startsWith("/ai");

  return (
    <nav
      aria-label="Navigazione principale"
      className="glass fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-end gap-0.5 rounded-[30px] px-2 pb-2 pt-2 sm:gap-1.5 sm:px-3"
    >
      {LEFT.map((item) => (
        <DockItem key={item.href} item={item} active={pathname.startsWith(item.href)} badge={item.href === "/quests" ? claimable : 0} />
      ))}

      <Link href="/ai" aria-current={aiActive ? "page" : undefined} className="group mx-1 flex w-16 flex-col items-center gap-1">
        <span
          className={clsx(
            "relative -mt-6 grid h-16 w-16 place-items-center rounded-[22px] transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105",
            "shadow-[0_10px_30px_rgb(123_108_255/0.55)] ring-2",
            aiActive ? "ring-white/70" : "ring-white/20",
          )}
        >
          <AppIcon size={64} />
          <Sparkles size={16} className="absolute -right-1 -top-1 text-cheese drop-shadow" fill="currentColor" />
        </span>
        <span className={clsx("text-[11px] font-black leading-none", aiActive ? "text-white" : "text-pr")}>Squeak AI</span>
      </Link>

      {RIGHT.map((item) => (
        <DockItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
      ))}
    </nav>
  );
}
