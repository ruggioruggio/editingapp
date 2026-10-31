"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Camera, Flame, Settings, Zap } from "lucide-react";
import { FriendsPanel } from "@/components/friends/FriendsPanel";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useAuth } from "@/lib/supabase/auth";
import { currentStreak, useProgress } from "@/lib/progress/store";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { getSupabase } from "@/lib/supabase/client";

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

export function ProfileView() {
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

  useEffect(() => {
    setBio(profile?.bio ?? "");
    setAvatarUrl(profile?.avatar_url ?? null);
  }, [profile]);

  const loadCounts = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !userId) return;
    const [{ count: followers }, { count: following }] = await Promise.all([
      sb.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
      sb.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
    ]);
    setFollowerCount(followers ?? 0);
    setFollowingCount(following ?? 0);
  }, [userId]);

  useEffect(() => { void loadCounts(); }, [loadCounts]);

  const saveBio = async () => {
    setEditingBio(false);
    const sb = getSupabase();
    if (sb && userId) await sb.from("profiles").update({ bio }).eq("id", userId);
  };

  const uploadAvatar = async (file: File) => {
    const sb = getSupabase();
    if (!sb || !userId) return;
    if (file.size > 2 * 1024 * 1024) { alert("Max 2 MB"); return; }
    if (!file.type.startsWith("image/")) { alert("Solo immagini"); return; }
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `avatars/${userId}.${ext}`;
    const { error } = await sb.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { alert("Upload non riuscito"); return; }
    const { data } = sb.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await sb.from("profiles").update({ avatar_url: url }).eq("id", userId);
    setAvatarUrl(url);
    // flag for admin review
    await sb.from("avatar_reviews").upsert({ user_id: userId, avatar_url: url, status: "pending" }).select();
  };

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("it-IT", { month: "long", year: "numeric" })
    : null;

  return (
    <div>
      {/* Profile header — Instagram style */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black">{profile?.username ?? "Profilo"}</h1>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-panel-3"
            aria-label="Impostazioni"
          >
            <Settings size={22} />
          </button>
        </div>

        {/* Avatar + stats row (Instagram layout) */}
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
                <p className="text-[11px] text-ink-dim">Lezioni</p>
              </div>
              <div>
                <p className="text-lg font-black">{followerCount}</p>
                <p className="text-[11px] text-ink-dim">Follower</p>
              </div>
              <div>
                <p className="text-lg font-black">{followingCount}</p>
                <p className="text-[11px] text-ink-dim">Seguiti</p>
              </div>
            </div>
          )}
        </div>

        {/* Username + bio */}
        <div className="mt-3">
          <p className="text-sm font-bold text-ink-dim">@{profile?.username ?? "..."}</p>
          {joinDate && <p className="text-xs text-ink-mute">Iscritto da {joinDate}</p>}
          {editingBio ? (
            <div className="mt-2 flex gap-2">
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                placeholder="Scrivi una bio..."
                className="min-w-0 flex-1 rounded-xl border-2 border-line bg-panel-2 px-3 py-1.5 text-sm outline-none focus:border-accent"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && void saveBio()}
              />
              <button type="button" onClick={() => void saveBio()} className="rounded-xl bg-accent px-3 py-1.5 text-sm font-bold text-white">OK</button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditingBio(true)} className="mt-1 text-left text-sm text-ink-dim hover:text-ink">
              {bio || "Tocca per aggiungere una bio..."}
            </button>
          )}
        </div>

        {/* XP + Streak compact stats */}
        {hydrated && (
          <div className="mt-4 flex gap-3">
            <span className="flex items-center gap-1 rounded-xl bg-panel-2 px-3 py-1.5 text-sm font-bold text-[#ffc93c]">
              <Zap size={16} /> {xp} XP
            </span>
            <span className="flex items-center gap-1 rounded-xl bg-panel-2 px-3 py-1.5 text-sm font-bold text-[#ff8a3d]">
              <Flame size={16} /> {streak} giorni
            </span>
          </div>
        )}
      </div>

      {/* Friends section below */}
      <div className="border-t border-line mx-auto max-w-xl px-4 py-6">
        <FriendsPanel />
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
