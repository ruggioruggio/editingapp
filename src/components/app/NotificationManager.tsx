"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { todayKey } from "@/lib/date";
import { messagePreview } from "@/lib/gamification/streakFlame";
import { useChatTarget } from "@/lib/hooks/useNotificationCount";
import { currentStreak, todayState, useProgress } from "@/lib/progress/store";
import { translate, type TKey } from "@/lib/settings/i18n";
import { useSettings } from "@/lib/settings/store";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { subscribeIncoming, type ChatMessage } from "@/lib/supabase/social";

type LocalNotif = { id: number; title: string; body: string; schedule?: { at: Date; allowWhileIdle?: boolean }; extra?: Record<string, string> };
type LocalNotificationsPlugin = {
  checkPermissions(): Promise<{ display: string }>;
  requestPermissions(): Promise<{ display: string }>;
  schedule(o: { notifications: LocalNotif[] }): Promise<unknown>;
  cancel(o: { notifications: { id: number }[] }): Promise<unknown>;
  addListener(ev: "localNotificationActionPerformed", cb: (a: { notification: { extra?: Record<string, string> } }) => void): Promise<{ remove: () => void }>;
};

const ID_STREAK = 1001;
const ID_NUDGES = [2001, 2002, 2003];
const ID_BAN = 3001;
const NUDGE_KEYS: TKey[] = ["pushNudge1", "pushNudge2", "pushNudge3", "pushNudge4"];
const BAN_KEY = "squeak-ban-notified";

function nativeNotifications(): LocalNotificationsPlugin | null {
  const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, unknown> } }).Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  return (cap.Plugins?.LocalNotifications as LocalNotificationsPlugin | undefined) ?? null;
}

const isElectron = () => typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);

const at = (daysFromNow: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
};

function fill(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

async function scheduleReminders(ln: LocalNotificationsPlugin) {
  const lang = useSettings.getState().lang;
  const tr = (k: TKey) => translate(lang, k);
  const s = useProgress.getState();
  const streak = currentStreak(s.streak);
  const playedToday = todayState(s.today).stats.lessons > 0 || s.streak.lastDay === todayKey();

  await ln.cancel({ notifications: [ID_STREAK, ...ID_NUDGES].map((id) => ({ id })) }).catch(() => {});

  const out: LocalNotif[] = [];
  // Streak at risk: tonight if not yet played, otherwise tomorrow evening.
  if (streak > 0) {
    const when = playedToday ? at(1, 20) : at(0, 20);
    const fireAt = when.getTime() > Date.now() ? when : new Date(Date.now() + 15 * 60_000);
    out.push({ id: ID_STREAK, title: tr("pushStreakTitle"), body: fill(tr("pushStreakBody"), { days: streak }), schedule: { at: fireAt, allowWhileIdle: true }, extra: { url: "/learn" } });
  }
  // Gentle nudges if the app isn't opened again: rescheduled every time it is.
  [1, 2, 4].forEach((day, i) => {
    const key = NUDGE_KEYS[(new Date().getDate() + i) % NUDGE_KEYS.length];
    out.push({ id: ID_NUDGES[i], title: tr("pushNudgeTitle"), body: tr(key), schedule: { at: at(day, 18), allowWhileIdle: true }, extra: { url: "/learn" } });
  });
  await ln.schedule({ notifications: out }).catch(() => {});
}

async function senderName(id: string) {
  const sb = getSupabase();
  if (!sb) return "";
  const { data } = await sb.from("profiles").select("username").eq("id", id).maybeSingle<{ username: string }>();
  return data?.username ?? "";
}

export function NotificationManager() {
  const status = useAuth((s) => s.status);
  const me = useAuth((s) => s.userId);
  const bannedUntil = useProgress((s) => s.bannedUntil);
  const lastLessons = useProgress((s) => s.stats.lessons);
  const permitted = useRef(false);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  // installed apps are a single page: a real navigation would land on a missing file (grey screen)
  const openTarget = useRef((extra?: Record<string, string>) => {
    if (extra?.chat) useChatTarget.setState({ chat: extra.chat });
    if (extra?.url) routerRef.current.push(extra.url);
  }).current;

  // Native: permissions, tap handling, reminders.
  useEffect(() => {
    const ln = nativeNotifications();
    if (!ln || status !== "user") return;
    let removeListener: (() => void) | undefined;
    void (async () => {
      let p = await ln.checkPermissions().catch(() => ({ display: "denied" }));
      if (p.display === "prompt" || p.display === "prompt-with-rationale") p = await ln.requestPermissions().catch(() => ({ display: "denied" }));
      permitted.current = p.display === "granted";
      if (!permitted.current) return;
      const h = await ln.addListener("localNotificationActionPerformed", (a) => {
        openTarget(a.notification.extra);
      });
      removeListener = h.remove;
      await scheduleReminders(ln);
    })();
    return () => removeListener?.();
  }, [status]);

  // Reschedule after each completed lesson (moves the streak reminder to tomorrow).
  useEffect(() => {
    const ln = nativeNotifications();
    if (ln && permitted.current) void scheduleReminders(ln);
  }, [lastLessons]);

  // Ban notice (phone only), once per ban.
  useEffect(() => {
    const ln = nativeNotifications();
    if (!ln || !bannedUntil || new Date(bannedUntil).getTime() < Date.now()) return;
    try {
      if (localStorage.getItem(BAN_KEY) === bannedUntil) return;
      localStorage.setItem(BAN_KEY, bannedUntil);
    } catch {}
    const lang = useSettings.getState().lang;
    void ln.schedule({ notifications: [{ id: ID_BAN, title: translate(lang, "pushBannedTitle"), body: translate(lang, "pushBannedBody") }] }).catch(() => {});
  }, [bannedUntil]);

  // New messages: phone and PC, only when the app isn't in front.
  useEffect(() => {
    const ln = nativeNotifications();
    const desktop = isElectron();
    if ((!ln && !desktop) || status !== "user" || !me) return;
    const sb = getSupabase();
    if (!sb) return;
    if (desktop && typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();

    const onMessage = async (m: ChatMessage) => {
      const inForeground = document.visibilityState === "visible" && document.hasFocus();
      if (inForeground) return;
      const lang = useSettings.getState().lang;
      const title = fill(translate(lang, "pushMsgTitle"), { user: await senderName(m.sender_id) });
      const text = messagePreview(m.kind, m.body, { photo: translate(lang, "chatPhoto"), voice: translate(lang, "chatVoice"), invite: translate(lang, "chatInviteLabel") });
      const body = text.length > 120 ? `${text.slice(0, 117)}…` : text;
      const extra = { url: "/profile", chat: m.sender_id };
      if (ln) {
        void ln.schedule({ notifications: [{ id: 4000 + (m.id % 100000), title, body, extra }] }).catch(() => {});
      } else if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const n = new Notification(title, { body, tag: `dm-${m.sender_id}` });
        n.onclick = () => {
          window.focus();
          openTarget(extra);
        };
      }
    };
    return subscribeIncoming(sb, me, (m) => void onMessage(m));
  }, [status, me]);

  return null;
}
