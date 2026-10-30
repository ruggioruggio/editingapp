"use client";

import { useState } from "react";
import { BookOpen, Flame, Settings, Zap } from "lucide-react";
import { AvatarArt } from "@/components/profile/Avatar";
import { FriendsPanel } from "@/components/friends/FriendsPanel";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useAuth } from "@/lib/supabase/auth";
import { useSettings } from "@/lib/settings/store";
import { currentStreak, useProgress } from "@/lib/progress/store";
import { useHydrated } from "@/lib/hooks/useHydrated";

export function ProfileView() {
  const profile = useAuth((s) => s.profile);
  const avatar = useSettings((s) => s.avatar);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => currentStreak(s.streak));
  const lessons = useProgress((s) => Object.keys(s.completed).length);
  const hydrated = useHydrated();
  const [modal, setModal] = useState<"profile" | "settings" | null>(null);

  return (
    <div>
      {/* Profile header */}
      <div className="relative bg-gradient-to-b from-accent/25 to-transparent pb-6">
        <div className="flex items-center justify-between px-4 pt-4">
          <h1 className="text-2xl font-black">{profile?.username ?? "Profilo"}</h1>
          <button
            type="button"
            onClick={() => setModal("settings")}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
            aria-label="Impostazioni"
          >
            <Settings size={22} />
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setModal("profile")}
            className="rounded-[28px] shadow-[0_6px_0_rgb(0_0_0/0.2)] transition-transform hover:scale-105"
          >
            <AvatarArt avatar={avatar} size={160} round={false} />
          </button>
        </div>

        <div className="mt-3 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-dim">
            @{profile?.username ?? "..."}
          </p>
        </div>

        {hydrated && (
          <div className="mx-auto mt-4 flex max-w-xs justify-center gap-8">
            <div className="flex flex-col items-center">
              <p className="flex items-center gap-1 text-xl font-black text-[#ffc93c]">
                <Zap size={18} /> {xp}
              </p>
              <p className="text-[11px] font-bold text-ink-mute">XP</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="flex items-center gap-1 text-xl font-black text-[#ff9600]">
                <Flame size={18} /> {streak}
              </p>
              <p className="text-[11px] font-bold text-ink-mute">Serie</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="flex items-center gap-1 text-xl font-black text-[#9999ff]">
                <BookOpen size={18} /> {lessons}
              </p>
              <p className="text-[11px] font-bold text-ink-mute">Lezioni</p>
            </div>
          </div>
        )}
      </div>

      {/* Friends section below */}
      <div className="mx-auto max-w-xl px-4 py-6">
        <FriendsPanel />
      </div>

      {modal === "profile" && <ProfileModal onClose={() => setModal(null)} />}
      {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
    </div>
  );
}
