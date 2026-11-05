"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, Clapperboard, ScrollText, Trophy, UserRound, type LucideIcon } from "lucide-react";

import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { badgeLabel, useNotificationPolling, useNotificationTotal } from "@/lib/hooks/useNotificationCount";
import { todayState, useProgress } from "@/lib/progress/store";

type Item = { href: string; icon: LucideIcon; color: string; activeColor: string };

const LEFT_ITEMS: Item[] = [
  { href: "/learn", icon: BookOpen, color: "#7c7cff", activeColor: "#9999ff" },
  { href: "/practice", icon: Clapperboard, color: "#2385d6", activeColor: "#2d8ceb" },
];

const RIGHT_ITEMS: Item[] = [
  { href: "/quests", icon: ScrollText, color: "#c080ee", activeColor: "#d291ff" },
  { href: "/leaderboard", icon: Trophy, color: "#d4a017", activeColor: "#ffc93c" },
];

function useClaimableQuests() {
  const hydrated = useHydrated();
  const today = useProgress((s) => s.today);
  if (!hydrated) return 0;
  const t = todayState(today);
  return questsForDay(t.day).filter((q) => questProgress(q, t.stats) >= q.target && !t.claimedQuests.includes(q.id)).length;
}

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-danger px-1 text-[10px] font-black leading-none text-white ring-2 ring-[var(--color-app)]">
      {badgeLabel(n)}
    </span>
  );
}

function DockItem({ item, active, badge }: { item: Item; active: boolean; badge?: number }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className="group relative flex flex-1 flex-col items-center justify-center py-2">
      <span className="relative grid h-11 w-11 place-items-center transition-transform group-active:scale-90">
        <Icon size={25} strokeWidth={2.4} style={{ color: active ? item.activeColor : item.color }} className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
        <Badge n={badge ?? 0} />
      </span>
      {active && <span className="h-1 w-5 rounded-full" style={{ background: item.activeColor }} />}
    </Link>
  );
}

export function Dock() {
  const pathname = usePathname();
  const claimable = useClaimableQuests();
  useNotificationPolling();
  const notifications = useNotificationTotal();
  const profileActive = pathname.startsWith("/profile");
  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-line bg-app pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {LEFT_ITEMS.map((item) => (
        <DockItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
      ))}

      <Link href="/profile" aria-current={profileActive ? "page" : undefined} className="group relative flex flex-1 flex-col items-center justify-center py-2">
        <span
          className={clsx(
            "relative grid h-12 w-12 place-items-center rounded-2xl transition-transform group-active:scale-90",
            profileActive ? "bg-[#f09a6a] text-[#3b1a08]" : "bg-panel-2 text-[#f09a6a]",
          )}
        >
          <UserRound size={26} strokeWidth={2.4} />
          <Badge n={notifications} />
        </span>
      </Link>

      {RIGHT_ITEMS.map((item) => (
        <DockItem key={item.href} item={item} active={pathname.startsWith(item.href)} badge={item.href === "/quests" ? claimable : 0} />
      ))}
    </nav>
  );
}
