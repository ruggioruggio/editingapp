"use client";

import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { subscribeIncoming } from "@/lib/supabase/social";

type Counts = { friendRequests: number; unreadMessages: number };
export const useNotificationCounts = create<Counts & { refresh: () => Promise<void> }>((set) => ({
  friendRequests: 0,
  unreadMessages: 0,
  refresh: async () => {
    const sb = getSupabase();
    const me = useAuth.getState().userId;
    if (!sb || !me) return set({ friendRequests: 0, unreadMessages: 0 });
    try {
      const [fr, msg] = await Promise.all([
        sb.from("friendships").select("id", { count: "exact", head: true }).eq("addressee_id", me).eq("status", "pending"),
        sb.from("messages").select("id", { count: "exact", head: true }).eq("recipient_id", me).is("read_at", null),
      ]);
      set({ friendRequests: fr.count ?? 0, unreadMessages: msg.count ?? 0 });
    } catch {}
  },
}));

export const badgeLabel = (n: number) => (n > 9 ? "9+" : String(n));

export function useNotificationPolling() {
  const status = useAuth((s) => s.status);
  const me = useAuth((s) => s.userId);
  const refresh = useNotificationCounts((s) => s.refresh);
  const run = useCallback(() => void refresh(), [refresh]);
  useEffect(() => {
    if (status !== "user" || !me) return;
    run();
    const h = setInterval(run, 20_000);
    window.addEventListener("focus", run);
    const sb = getSupabase();
    const stop = sb ? subscribeIncoming(sb, me, run) : undefined;
    return () => { clearInterval(h); window.removeEventListener("focus", run); stop?.(); };
  }, [status, me, run]);
}

export function useNotificationTotal() {
  return useNotificationCounts((s) => s.friendRequests + s.unreadMessages);
}
