"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, MessageCirclePlus } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { loadFriends, type FriendProfile } from "@/lib/supabase/friends";
import { loadInbox, subscribeIncoming, type InboxThread } from "@/lib/supabase/social";
import { useNotificationCounts } from "@/lib/hooks/useNotificationCount";
import { useT } from "@/lib/settings/i18n";
import { Chat } from "./FriendSheet";

function Avatar({ name, url, size = 52, ring }: { name: string; url?: string | null; size?: number; ring?: boolean }) {
  return (
    <span className={clsx("relative shrink-0 rounded-full", ring && "bg-gradient-to-tr from-[#ffc93c] via-[#ff5f8a] to-[#9b5de5] p-[2.5px]")}>
      {url ? (
        <img src={url} alt={name} className="rounded-full border-2 border-app object-cover" style={{ width: size, height: size }} />
      ) : (
        <span className="grid place-items-center rounded-full border-2 border-app bg-panel-3 font-black uppercase" style={{ width: size, height: size, fontSize: size * 0.38 }}>
          {name[0]}
        </span>
      )}
    </span>
  );
}

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  if (mins < 10080) return `${Math.round(mins / 1440)}g`;
  return `${Math.round(mins / 10080)}s`;
}

export function DmInbox({ initialOpen }: { initialOpen?: string | null }) {
  const t = useT();
  const me = useAuth((s) => s.userId);
  const refreshCounts = useNotificationCounts((s) => s.refresh);
  const [threads, setThreads] = useState<InboxThread[] | null>(null);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [open, setOpen] = useState<FriendProfile | null>(null);

  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !me) return;
    try {
      const [inbox, fr] = await Promise.all([loadInbox(sb, me), loadFriends(sb, me)]);
      setThreads(inbox);
      setFriends(fr.friends.map((f) => f.other));
    } catch {
      setThreads((x) => x ?? []);
    }
  }, [me]);

  useEffect(() => {
    void refresh();
    const sb = getSupabase();
    if (!sb || !me) return;
    const stop = subscribeIncoming(sb, me, () => void refresh());
    const poll = setInterval(() => void refresh(), 10_000);
    return () => { stop(); clearInterval(poll); };
  }, [me, refresh]);

  useEffect(() => {
    if (!initialOpen || open) return;
    const p = threads?.find((x) => x.other.id === initialOpen)?.other ?? friends.find((f) => f.id === initialOpen);
    if (p) setOpen(p as FriendProfile);
  }, [initialOpen, threads, friends, open]);

  if (!me) return null;

  const withThread = new Set(threads?.map((x) => x.other.id));
  const newChats = friends.filter((f) => !withThread.has(f.id));

  return (
    <div>
      {threads === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-panel" />)}
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Mascot size={90} idle />
          <p className="text-sm text-ink-dim">{t("noMessagesYet")}</p>
          {newChats[0] && (
            <button type="button" onClick={() => setOpen(newChats[0])} className="btn-3d flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-black text-white">
              <MessageCirclePlus size={16} /> {t("startConversation")}
            </button>
          )}
        </div>
      ) : (
        <ul className="-mx-2">
          {threads.map((th) => {
            const mine = th.last.sender_id === me;
            return (
              <li key={th.other.id}>
                <button type="button" onClick={() => setOpen(th.other as FriendProfile)} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-panel">
                  <Avatar name={th.other.username} url={th.other.avatar_url} />
                  <span className="min-w-0 flex-1">
                    <span className={clsx("block truncate", th.unread ? "font-black" : "font-semibold")}>{th.other.username}</span>
                    <span className={clsx("flex min-w-0 gap-1 text-sm", th.unread ? "font-bold text-ink" : "text-ink-mute")}>
                      <span className="truncate">{mine && `${t("youPrefix")} `}{th.last.body}</span>
                      <span className="shrink-0">· {ago(th.last.created_at)}</span>
                    </span>
                  </span>
                  {th.unread > 0 && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] flex flex-col bg-app lg:left-56 lg:right-80 lg:z-40 lg:border-x lg:border-white/5">
          <header className="flex items-center gap-3 border-b border-line px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
            <button type="button" onClick={() => { setOpen(null); void refresh(); void refreshCounts(); }} aria-label={t("close")} className="grid h-10 w-10 place-items-center rounded-full hover:bg-panel-2">
              <ChevronLeft size={26} />
            </button>
            <Avatar name={open.username} url={open.avatar_url} size={36} />
            <p className="min-w-0 flex-1 truncate font-black">{open.username}</p>
          </header>
          <Chat me={me} friend={open} onRead={() => { void refreshCounts(); }} />
        </div>
      )}
    </div>
  );
}
