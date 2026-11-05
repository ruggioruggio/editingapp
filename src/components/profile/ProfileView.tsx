"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Camera, Flame, MessageCircle, Settings, UserRound, Zap } from "lucide-react";
import { DmInbox } from "@/components/friends/DmInbox";
import { FriendsPanel } from "@/components/friends/FriendsPanel";
import { badgeLabel, useNotificationCounts } from "@/lib/hooks/useNotificationCount";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useAuth } from "@/lib/supabase/auth";
import { currentStreak, useProgress } from "@/lib/progress/store";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { getSupabase } from "@/lib/supabase/client";
import { useT } from "@/lib/settings/i18n";
import { useSettings } from "@/lib/settings/store";

const BG_COLORS = ["#6b5cff", "#2d8ceb", "#3ecf8e", "#ff8a3d", "#ff5f5f", "#c080ee", "#ffc93c"];

function letterColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return BG_COLORS[h % BG_COLORS.length];
}

function LetterAvatar({ name, size, url }: { name: string; size: number; url?: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const letter = (name || "?")[0].toUpperCase();
  return (
    <div
      className="grid place-items-center rounded-full font-black text-white"
      style={{ width: size, height: size, background: letterColor(name), fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  );
}

const LOCALE_MAP: Record<string, string> = { it: "it-IT", en: "en-US", fr: "fr-FR", es: "es-ES", zh: "zh-CN" };

export function ProfileView() {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const locale = LOCALE_MAP[lang] ?? "en-US";
  const status = useAuth((s) => s.status);
  const profile = useAuth((s) => s.profile);
  const userId = useAuth((s) => s.userId);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => currentStreak(s.streak));
  const lessons = useProgress((s) => Object.keys(s.completed).length);
  const hydrated = useHydrated();
  const [showSettings, setShowSettings] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [editingBio, setEditingBio] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [tab, setTab] = useState<"profile" | "dm">("profile");
  const [chatWith, setChatWith] = useState<string | null>(null);
  const unreadMessages = useNotificationCounts((s) => s.unreadMessages);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("tab") === "dm") setTab("dm");
    if (q.get("chat")) { setTab("dm"); setChatWith(q.get("chat")); }
  }, []);

  useEffect(() => {
    setBio(profile?.bio ?? "");
    setAvatarUrl(profile?.avatar_url ?? null);
  }, [profile]);

  const loadCounts = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !userId) return;
    try {
      const [r1, r2] = await Promise.all([
        sb.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
        sb.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
      ]);
      if (!r1.error) setFollowerCount(r1.count ?? 0);
      if (!r2.error) setFollowingCount(r2.count ?? 0);
    } catch {}
  }, [userId]);

  useEffect(() => { void loadCounts(); }, [loadCounts]);

  const saveBio = async () => {
    setEditingBio(false);
    const sb = getSupabase();
    if (sb && userId) {
      try { await sb.from("profiles").update({ bio }).eq("id", userId); } catch {}
    }
  };

  const uploadAvatar = async (file: File) => {
    const sb = getSupabase();
    if (!sb || !userId) return;
    if (file.size > 2 * 1024 * 1024) { alert(t("maxFileSize")); return; }
    if (!file.type.startsWith("image/")) { alert(t("imagesOnly")); return; }
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}.${ext}`;
      const { error } = await sb.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (error) { alert(`${t("uploadFailed")}: ${error.message}`); return; }
      const { data } = sb.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: updErr } = await sb.from("profiles").update({ avatar_url: url }).eq("id", userId);
      if (updErr) { alert(`${t("uploadFailed")}: ${updErr.message}`); return; }
      setAvatarUrl(url);
      try { await sb.from("avatar_reviews").upsert({ user_id: userId, avatar_url: url, status: "pending" }).select(); } catch {}
    } catch {
      alert(t("uploadFailed"));
    }
  };

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale, { month: "long", year: "numeric" })
    : null;

  if (status !== "user") {
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <FriendsPanel />
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black">{profile?.username ?? t("profile")}</h1>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-panel-3"
            aria-label={t("settings")}
          >
            <Settings size={22} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <LetterAvatar name={profile?.username ?? "?"} size={80} url={avatarUrl} />
            {status === "user" && (
              <label className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-accent text-white shadow-lg">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f); }} />
              </label>
            )}
          </div>

          {hydrated && (
            <div className="flex flex-1 justify-around text-center">
              <div>
                <p className="text-lg font-black">{lessons}</p>
                <p className="text-[11px] text-ink-dim">{t("lessons")}</p>
              </div>
              <div>
                <p className="text-lg font-black">{followerCount}</p>
                <p className="text-[11px] text-ink-dim">{t("follower")}</p>
              </div>
              <div>
                <p className="text-lg font-black">{followingCount}</p>
                <p className="text-[11px] text-ink-dim">{t("following")}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3">
          <p className="text-sm font-bold text-ink-dim">@{profile?.username ?? "..."}</p>
          {joinDate && <p className="text-xs text-ink-mute">{t("joinedSince")} {joinDate}</p>}
          {editingBio ? (
            <div className="mt-2 flex gap-2">
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                placeholder={t("writeBio")}
                className="min-w-0 flex-1 rounded-xl border-2 border-line bg-panel-2 px-3 py-1.5 text-sm outline-none focus:border-accent"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && void saveBio()}
              />
              <button type="button" onClick={() => void saveBio()} className="rounded-xl bg-accent px-3 py-1.5 text-sm font-bold text-white">OK</button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditingBio(true)} className="mt-1 text-left text-sm text-ink-dim hover:text-ink">
              {bio || t("addBio")}
            </button>
          )}
        </div>

        {hydrated && (
          <div className="mt-4 flex gap-3">
            <span className="flex items-center gap-1 rounded-xl bg-panel-2 px-3 py-1.5 text-sm font-bold text-[#ffc93c]">
              <Zap size={16} /> {xp} XP
            </span>
            <span className="flex items-center gap-1 rounded-xl bg-panel-2 px-3 py-1.5 text-sm font-bold text-[#ff8a3d]">
              <Flame size={16} /> {streak} {t("days")}
            </span>
          </div>
        )}
      </div>

      <div className="sticky top-14 z-20 border-b border-line bg-app/90 backdrop-blur-xl lg:top-0">
        <div className="mx-auto grid max-w-xl grid-cols-2">
          {(["profile", "dm"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={clsx(
                "relative flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wide",
                tab === k ? "text-ink" : "text-ink-mute hover:text-ink-dim",
              )}
            >
              {k === "profile" ? <UserRound size={17} /> : <MessageCircle size={17} />}
              {k === "profile" ? t("profile") : t("messagesTab")}
              {k === "dm" && unreadMessages > 0 && (
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-black text-white">{badgeLabel(unreadMessages)}</span>
              )}
              {tab === k && <span className="absolute inset-x-6 bottom-0 h-[3px] rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-6">
        {tab === "profile" ? <FriendsPanel /> : <DmInbox initialOpen={chatWith} />}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
