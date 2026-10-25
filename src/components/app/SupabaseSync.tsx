"use client";

import { useEffect } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { mergeGameData, normalizeGameData } from "@/lib/progress/merge";
import { currentStreak, initialGameData, pickGameData, useProgress } from "@/lib/progress/store";
import { useAuth, type Profile } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

const SAVE_DELAY_MS = 1500;

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
      await saveProgress(sb, user.id);

      stopWatching?.();
      stopWatching = useProgress.subscribe(() => {
        clearTimeout(timer);
        timer = setTimeout(flush, SAVE_DELAY_MS);
      });
    };

    const endSession = () => {
      flush();
      stopWatching?.();
      stopWatching = null;
      activeUser = null;
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
