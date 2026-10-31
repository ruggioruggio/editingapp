"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, Clapperboard, CircleUserRound, ScrollText, Sparkles, Wand2, type LucideIcon } from "lucide-react";
import { features } from "@/config/features";
import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { todayState, useProgress } from "@/lib/progress/store";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

type Item = { href: string; icon: LucideIcon; color: string; activeColor: string };

const LEFT_ITEMS: Item[] = [
  { href: "/learn", icon: BookOpen, color: "#7c7cff", activeColor: "#9999ff" },
  { href: "/practice", icon: Clapperboard, color: "#2385d6", activeColor: "#2d8ceb" },
];

const RIGHT_ITEMS: Item[] = [
  { href: "/quests", icon: ScrollText, color: "#c080ee", activeColor: "#d291ff" },
  { href: "/profile", icon: CircleUserRound, color: "#e88a5a", activeColor: "#f09a6a" },
];

function usePendingRequests() {
  const status = useAuth((s) => s.status);
  const me = useAuth((s) => s.userId);
  const [count, setCount] = useState(0);
  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !me) return;
    try {
      const { count: n } = await sb
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("addressee_id", me)
        .eq("status", "pending");
      setCount(n ?? 0);
    } catch {}
  }, [me]);
  useEffect(() => {
    if (status !== "user") return;
    void refresh();
    const h = setInterval(() => void refresh(), 30_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(h); window.removeEventListener("focus", onFocus); };
  }, [status, refresh]);
  return count;
}

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
      className="group relative flex flex-1 flex-col items-center justify-center py-2"
    >
      <span className="relative grid h-11 w-11 place-items-center">
        <Icon
          size={25}
          strokeWidth={2.4}
          style={{ color: active ? item.activeColor : item.color }}
          className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
        />
        {!!badge && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-black text-white ring-2 ring-[var(--color-panel)]">
            {badge}
          </span>
        )}
      </span>
      {active && (
        <span className="h-1 w-5 rounded-full" style={{ background: item.activeColor }} />
      )}
    </Link>
  );
}

export function Dock() {
  const pathname = usePathname();
  const claimable = useClaimableQuests();
  const pendingFriends = usePendingRequests();
  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-line bg-app pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {LEFT_ITEMS.map((item) => (
        <DockItem
          key={item.href}
          item={item}
          active={pathname.startsWith(item.href)}
          badge={0}
        />
      ))}

      <Link
        href="/ai"
        aria-current={pathname.startsWith("/ai") ? "page" : undefined}
        className="group relative flex flex-1 flex-col items-center justify-center py-2"
      >
        <span className="relative grid h-11 w-11 place-items-center">
          <Wand2
            size={25}
            strokeWidth={2.4}
            className={clsx("drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]", pathname.startsWith("/ai") ? "text-cheese" : "text-[#ffc93c]")}
          />
          {features.squeakAi ? (
            <Sparkles size={10} className="absolute -right-0.5 -top-0.5 text-cheese" fill="currentColor" />
          ) : (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cheese px-1.5 py-0.5 text-[7px] font-black uppercase leading-none text-[#3a2500]">
              presto
            </span>
          )}
        </span>
        {pathname.startsWith("/ai") && (
          <span className="h-1 w-5 rounded-full bg-cheese" />
        )}
      </Link>

      {RIGHT_ITEMS.map((item) => (
        <DockItem
          key={item.href}
          item={item}
          active={pathname.startsWith(item.href)}
          badge={item.href === "/quests" ? claimable : item.href === "/profile" ? pendingFriends : 0}
        />
      ))}
    </nav>
  );
}
