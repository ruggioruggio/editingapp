"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, Clapperboard, ScrollText, Sparkles, Users, type LucideIcon } from "lucide-react";
import { AppIcon } from "@/components/brand/Mascot";
import { features } from "@/config/features";
import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { todayState, useProgress } from "@/lib/progress/store";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { useT, type TKey } from "@/lib/settings/i18n";

type Item = { href: string; label: TKey; icon: LucideIcon; color: string; activeColor: string };

const ITEMS: Item[] = [
  { href: "/learn", label: "learn", icon: BookOpen, color: "#7c7cff", activeColor: "#9999ff" },
  { href: "/practice", label: "practice", icon: Clapperboard, color: "#2385d6", activeColor: "#2d8ceb" },
  { href: "/quests", label: "quests", icon: ScrollText, color: "#c080ee", activeColor: "#d291ff" },
  { href: "/friends", label: "friends", icon: Users, color: "#4cc8cc", activeColor: "#5ce1e6" },
];

function usePendingRequests() {
  const status = useAuth((s) => s.status);
  const me = useAuth((s) => s.userId);
  const [count, setCount] = useState(0);
  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !me) return;
    const { count: n } = await sb
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("addressee_id", me)
      .eq("status", "pending");
    setCount(n ?? 0);
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
      <span
        className={clsx(
          "relative grid h-12 w-12 place-items-center rounded-2xl transition-all duration-200",
          active && "bg-white/10",
        )}
      >
        <Icon
          size={26}
          strokeWidth={2.4}
          style={{ color: active ? item.activeColor : item.color }}
          className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
        />
        {!!badge && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-black text-white ring-2 ring-[#1a1a24]">
            {badge}
          </span>
        )}
      </span>
      {active && (
        <span className="mt-0.5 h-1 w-5 rounded-full" style={{ background: item.activeColor }} />
      )}
    </Link>
  );
}

export function Dock() {
  const pathname = usePathname();
  const claimable = useClaimableQuests();
  const pendingFriends = usePendingRequests();
  const aiActive = pathname.startsWith("/ai");

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-white/8 bg-[#1a1a24] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {ITEMS.slice(0, 2).map((item) => (
        <DockItem
          key={item.href}
          item={item}
          active={pathname.startsWith(item.href)}
          badge={item.href === "/quests" ? claimable : 0}
        />
      ))}

      <Link
        href="/ai"
        aria-current={aiActive ? "page" : undefined}
        className="group relative flex flex-1 flex-col items-center justify-center py-2"
      >
        <span
          className={clsx(
            "relative -mt-7 grid h-[60px] w-[60px] place-items-center rounded-[18px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
            aiActive && "ring-2 ring-white/30",
          )}
          style={{ borderRadius: 60 * 0.24 }}
        >
          <AppIcon size={60} />
          {features.squeakAi ? (
            <Sparkles size={14} className="absolute -right-1 -top-1 text-cheese drop-shadow" fill="currentColor" />
          ) : (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#1a1a24] bg-cheese px-2 py-0.5 text-[9px] font-black uppercase leading-none text-[#3a2500]">
              presto
            </span>
          )}
        </span>
        {aiActive && (
          <span className="mt-0.5 h-1 w-5 rounded-full bg-cheese" />
        )}
      </Link>

      {ITEMS.slice(2).map((item) => (
        <DockItem
          key={item.href}
          item={item}
          active={pathname.startsWith(item.href)}
          badge={item.href === "/quests" ? claimable : item.href === "/friends" ? pendingFriends : 0}
        />
      ))}
    </nav>
  );
}
