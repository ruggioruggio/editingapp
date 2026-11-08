"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, TrendingUp, TrendingDown, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { useT } from "@/lib/settings/i18n";

interface Notification {
  id: string;
  type: "friend_request" | "friend_accepted" | "rank_up" | "rank_down";
  username?: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationsDropdown() {
  const t = useT();
  const status = useAuth((s) => s.status);
  const me = useAuth((s) => s.userId);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadNotifs = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !me) return;
    try {
      const { data } = await sb
        .from("friendships")
        .select("id, requester_id, status, created_at, profiles!friendships_requester_id_fkey(username)")
        .eq("addressee_id", me)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);
      const items: Notification[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: `fr-${row.id}`,
        type: "friend_request" as const,
        username: ((row.profiles as Record<string, unknown> | null)?.username as string) ?? "?",
        message: `@${((row.profiles as Record<string, unknown> | null)?.username as string) ?? "?"} ${t("newFriendRequest")}`,
        time: row.created_at as string,
        read: false,
      }));
      setNotifs(items);
    } catch {}
  }, [me, t]);

  useEffect(() => {
    if (status !== "user") return;
    void loadNotifs();
    const h = setInterval(() => void loadNotifs(), 15_000);
    const onFocus = () => void loadNotifs();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(h);
      window.removeEventListener("focus", onFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, me]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  if (status !== "user") return null;

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("notifications")}
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink-dim hover:bg-panel-3 hover:text-ink"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-black text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-pop absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-panel-2 shadow-2xl">
          <div className="border-b border-line px-4 py-3">
            <h3 className="text-sm font-black">{t("notifications")}</h3>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-mute">{t("noNotifications")}</p>
            ) : (
              notifs.map((n) => (
                <div key={n.id} className="flex items-start gap-3 border-b border-line/50 px-4 py-3 last:border-0">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-panel-3">
                    {n.type === "friend_request" ? <UserPlus size={14} className="text-accent" /> :
                     n.type === "friend_accepted" ? <UserCheck size={14} className="text-success" /> :
                     n.type === "rank_up" ? <TrendingUp size={14} className="text-cheese" /> :
                     <TrendingDown size={14} className="text-danger" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-ink-mute">
                      {new Date(n.time).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
