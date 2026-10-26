"use client";

import { useEffect } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getLesson } from "@/content/lessons";
import { ACHIEVEMENTS, achievementInput, achievementLevel } from "@/lib/gamification/achievements";
import { mergeGameData, normalizeGameData } from "@/lib/progress/merge";
import { currentStreak, initialGameData, pickGameData, todayState, useProgress } from "@/lib/progress/store";
import { useAuth, type Profile } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { useSettings, type Avatar } from "@/lib/settings/store";
import { publishEvents, saveDailyActivity } from "@/lib/supabase/social";

const SAVE_DELAY_MS = 1500;
const ADMIN_POLL_MS = 60_000;

/** Pro regalato e sospensioni decisi dal pannello admin (colonne di 0003_admin.sql). */
async function loadAdminFlags(sb: SupabaseClient, userId: string) {
  const { data, error } = await sb.from("profiles").select("pro_until, banned_until, ban_reason").eq("id", userId).maybeSingle<{ pro_until: string | null; banned_until: string | null; ban_reason: string | null }>();
  if (error || !data) return; // migrazione non ancora eseguita: nessun effetto
  useProgress.setState({ proUntil: data.pro_until, bannedUntil: data.banned_until, banReason: data.ban_reason });
}

/** Avatar salvato nel profilo (colonna di 0004_avatar.sql): vale su tutti i dispositivi. */
async function loadAvatar(sb: SupabaseClient, userId: string) {
  const { data, error } = await sb.from("profiles").select("avatar").eq("id", userId).maybeSingle<{ avatar: Partial<Avatar> | null }>();
  if (error || !data?.avatar) return;
  useSettings.getState().setAvatar(data.avatar);
}

async function saveProgress(sb: SupabaseClient, userId: string) {
  const s = useProgress.getState();
  if (s.ownerId !== userId) return;
  const now = new Date().toISOString();
  await Promise.all([
    sb.from("progress").upsert({ user_id: userId, data: pickGameData(s), updated_at: now }),
    sb
      .from("profiles")
      .update({ xp: s.xp, streak_count: currentStreak(s.streak), streak_last_day: s.streak.lastDay, updated_at: now })
      .eq("id", userId),
  ]);
}

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 365];

type ProgressSnapshot = ReturnType<typeof useProgress.getState>;

/**
 * Condivide con gli amici ciò che è appena successo: lezioni completate,
 * obiettivi sbloccati e traguardi di serie. Alimenta anche le serie condivise.
 */
async function shareActivity(sb: SupabaseClient, userId: string, state: ProgressSnapshot, prev: ProgressSnapshot) {
  const events: Parameters<typeof publishEvents>[1] = [];

  if (state.stats.lessons > prev.stats.lessons) {
    const lessonId = Object.keys(state.completed).find((id) => (state.completed[id]?.times ?? 0) > (prev.completed[id]?.times ?? 0));
    events.push({ kind: "lesson_completed", data: { lessonId, lessonTitle: lessonId ? getLesson(lessonId)?.title : undefined } });
    const today = todayState(state.today);
    void saveDailyActivity(sb, userId, today.day, today.stats.lessons);
  }

  const now = achievementInput(state);
  const before = achievementInput(prev);
  for (const a of ACHIEVEMENTS) {
    const level = achievementLevel(a, now[a.metric]).level;
    if (level > achievementLevel(a, before[a.metric]).level) events.push({ kind: "achievement_unlocked", data: { achievementId: a.id, level } });
  }

  const streak = currentStreak(state.streak);
  const hit = STREAK_MILESTONES.find((m) => streak >= m && currentStreak(prev.streak) < m);
  if (hit) events.push({ kind: "streak_milestone", data: { days: hit } });

  await publishEvents(sb, events);
}

/**
 * Collega lo store locale all'account: al login fonde i progressi locali con
 * quelli del server (così chi ha giocato da ospite non perde nulla), poi salva
 * ogni modifica con un piccolo ritardo. Al logout pulisce i dati locali.
 */
export function SupabaseSync() {
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      useAuth.setState({ status: "disabled" });
      return;
    }

    let activeUser: string | null = null;
    let stopWatching: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let adminPoll: ReturnType<typeof setInterval> | undefined;

    const flush = () => {
      clearTimeout(timer);
      if (activeUser) void saveProgress(sb, activeUser);
    };

    const startSession = async (user: User) => {
      activeUser = user.id;
      useAuth.setState({ status: "user", userId: user.id, email: user.email ?? null });

      const [{ data: profile }, { data: row }] = await Promise.all([
        sb.from("profiles").select("id, username, display_name, plan, xp, streak_count, streak_last_day").eq("id", user.id).maybeSingle<Profile>(),
        sb.from("progress").select("data").eq("user_id", user.id).maybeSingle<{ data: unknown }>(),
      ]);
      if (activeUser !== user.id) return; // nel frattempo è cambiato account

      const local = useProgress.getState();
      // i dati locali si fondono solo se sono da ospite o già di questo account
      const localData = local.ownerId === null || local.ownerId === user.id ? pickGameData(local) : null;
      const remote = row ? normalizeGameData(row.data) : null;
      const merged = remote && localData ? mergeGameData(localData, remote) : (remote ?? localData ?? initialGameData());

      useProgress.setState({ ...merged, ownerId: user.id, plan: profile?.plan ?? "free", username: profile?.username ?? null });
      useAuth.setState({ profile: profile ?? null });
      void loadAdminFlags(sb, user.id);
      void loadAvatar(sb, user.id);
      clearInterval(adminPoll);
      adminPoll = setInterval(() => activeUser && void loadAdminFlags(sb, activeUser), ADMIN_POLL_MS);
      await saveProgress(sb, user.id);
      // recupera l'attività di oggi fatta da ospite, per le serie condivise
      const today = todayState(merged.today);
      if (today.stats.lessons > 0) void saveDailyActivity(sb, user.id, today.day, today.stats.lessons);

      stopWatching?.();
      stopWatching = useProgress.subscribe((state, prev) => {
        clearTimeout(timer);
        timer = setTimeout(flush, SAVE_DELAY_MS);
        void shareActivity(sb, user.id, state, prev);
      });
    };

    const endSession = () => {
      flush();
      stopWatching?.();
      stopWatching = null;
      activeUser = null;
      clearInterval(adminPoll);
      useProgress.setState({ proUntil: null, bannedUntil: null, banReason: null });
      useAuth.setState({ status: "guest", userId: null, email: null, profile: null });
      // i dati di un account non devono restare a chi usa il dispositivo dopo
      if (useProgress.getState().ownerId !== null) useProgress.getState().reset();
    };

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      // fuori dal callback: Supabase sconsiglia chiamate async dentro onAuthStateChange
      setTimeout(() => {
        if (user && user.id !== activeUser) void startSession(user);
        else if (!user && (activeUser || useAuth.getState().status === "loading")) endSession();
      }, 0);
    });

    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onHide);
      flush();
      stopWatching?.();
    };
  }, []);

  return null;
}
