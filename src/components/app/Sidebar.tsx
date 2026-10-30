"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, Clapperboard, Sparkles, Target, Users, type LucideIcon } from "lucide-react";
import { AppIcon } from "@/components/brand/Mascot";
import { Logo } from "@/components/brand/Logo";
import { features } from "@/config/features";
import { questProgress, questsForDay } from "@/lib/gamification/quests";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { todayState, useProgress } from "@/lib/progress/store";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { useT, type TKey } from "@/lib/settings/i18n";
import { useCallback, useEffect, useState } from "react";

type NavItem = { href: string; label: TKey; icon: LucideIcon; color: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/learn", label: "learn", icon: BookOpen, color: "#9999ff" },
  { href: "/practice", label: "practice", icon: Clapperboard, color: "#2d8ceb" },
  { href: "/goals", label: "goals", icon: Target, color: "#d291ff" },
  { href: "/friends", label: "friends", icon: Users, color: "#5ce1e6" },
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

function SidebarItem({ item, active, badge }: { item: NavItem; active: boolean; badge?: number }) {
  const t = useT();
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-black uppercase tracking-wide transition-colors",
        active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <span className="relative">
        <Icon size={22} strokeWidth={2.3} style={{ color: active ? item.color : undefined }} />
        {!!badge && (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-black text-white">
            {badge}
          </span>
        )}
      </span>
      <span>{t(item.label)}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const claimable = useClaimableQuests();
  const pendingFriends = usePendingRequests();
  const aiActive = pathname.startsWith("/ai");

  return (
    <nav
      aria-label="Navigazione principale"
      className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-white/5 bg-app px-3 py-5 lg:flex"
    >
      <div className="mb-8 px-4">
        <Logo href="/learn" size={32} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            active={pathname.startsWith(item.href) || (item.href === "/goals" && pathname.startsWith("/quests"))}
            badge={item.href === "/goals" ? claimable : item.href === "/friends" ? pendingFriends : 0}
          />
        ))}

        <Link
          href="/ai"
          aria-current={aiActive ? "page" : undefined}
          className={clsx(
            "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-black uppercase tracking-wide transition-colors",
            aiActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white",
          )}
        >
          <span className="relative h-[22px] w-[22px]">
            <AppIcon size={22} />
            {features.squeakAi && <Sparkles size={10} className="absolute -right-1 -top-1 text-cheese" fill="currentColor" />}
          </span>
          <span>Squeak AI</span>
        </Link>
      </div>
    </nav>
  );
}
