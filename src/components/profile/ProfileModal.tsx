"use client";

import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { BookOpen, Flame, Shuffle, Trophy, Zap } from "lucide-react";
import { useAuth, ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { currentStreak, useProgress } from "@/lib/progress/store";
import { useT } from "@/lib/settings/i18n";
import { sfx } from "@/lib/settings/sfx";
import { useSettings, type Avatar } from "@/lib/settings/store";
import { Modal } from "@/components/settings/SettingsModal";
import { ACCESSORIES, AvatarArt, BACKGROUNDS, EYES, FURS, MUSCLES, SHIRT_COLORS, SHIRTS } from "./Avatar";

type Part = "fur" | "eyes" | "shirt" | "muscles" | "accessory" | "bg";

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const avatar = useSettings((s) => s.avatar);
  const setAvatar = useSettings((s) => s.setAvatar);
  const profile = useAuth((s) => s.profile);
  const userId = useAuth((s) => s.userId);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => currentStreak(s.streak));
  const best = useProgress((s) => s.bestStreak);
  const lessons = useProgress((s) => Object.keys(s.completed).length);
  const [part, setPart] = useState<Part>("shirt");
  const [start] = useState(avatar);

  const close = () => {
    const sb = getSupabase();
    const cur = useSettings.getState().avatar;
    if (sb && userId && JSON.stringify(cur) !== JSON.stringify(start)) void sb.from("profiles").update({ avatar: cur }).eq("id", userId);
    onClose();
  };
  useEffect(() => {
    const onHide = () => {
      const sb = getSupabase();
      if (sb && userId) void sb.from("profiles").update({ avatar: useSettings.getState().avatar }).eq("id", userId);
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [userId]);

  const change = (patch: Partial<Avatar>) => {
    sfx("ui");
    setAvatar(patch);
  };
  const tabs: { id: Part; label: string }[] = [
    { id: "shirt", label: t("shirt") },
    { id: "muscles", label: t("muscles") },
    { id: "accessory", label: t("accessory") },
    { id: "fur", label: t("fur") },
    { id: "eyes", label: t("eyes") },
    { id: "bg", label: t("background") },
  ];

  const stats = [
    { label: t("totalXp"), value: xp, icon: Zap, color: "#ffc93c" },
    { label: t("streak"), value: streak, icon: Flame, color: "#ff9600" },
    { label: t("bestStreak"), value: best, icon: Trophy, color: "#3ecf8e" },
    { label: t("lessonsDone"), value: lessons, icon: BookOpen, color: "#9999ff" },
  ];

  return (
    <Modal onClose={close} title={t("profile")} wide>
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-[28px] shadow-[0_8px_0_rgb(0_0_0/0.25)]">
            <AvatarArt avatar={avatar} size={220} round={false} />
          </div>
          <p className="text-xl font-black">{profile ? `@${profile.username}` : "Squeak"}</p>
          {profile?.role && (
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ backgroundColor: `${ROLE_COLORS[profile.role]}25`, color: ROLE_COLORS[profile.role] }}>
              {ROLE_LABELS[profile.role]}
            </span>
          )}
          <button
            type="button"
            className="duo-btn duo-ghost w-full"
            onClick={() =>
              change({
                fur: rnd(FURS.length),
                eyes: rnd(EYES.length),
                shirt: rnd(SHIRTS.length),
                shirtColor: rnd(SHIRT_COLORS.length),
                muscles: rnd(MUSCLES.length),
                accessory: rnd(ACCESSORIES.length),
                bg: rnd(BACKGROUNDS.length),
              })
            }
          >
            <Shuffle size={16} /> {t("random")}
          </button>
          <div className="grid w-full grid-cols-2 gap-2">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border-2 border-line p-2">
                <p className="flex items-center gap-1 text-lg font-black" style={{ color }}>
                  <Icon size={16} /> {value}
                </p>
                <p className="text-[11px] font-bold leading-tight text-ink-mute">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="mb-3 text-lg font-black">{t("editAvatar")}</h3>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                type="button"
                onClick={() => setPart(tb.id)}
                className={clsx("rounded-xl px-3 py-1.5 text-sm font-black", part === tb.id ? "bg-accent text-white" : "bg-panel-2 text-ink-dim hover:text-ink")}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {part === "shirt" && (
            <>
              <Grid>
                {SHIRTS.map((n, i) => (
                  <Choice key={n} label={n} on={avatar.shirt === i} onClick={() => change({ shirt: i })}>
                    <AvatarArt avatar={{ ...avatar, shirt: i }} size={76} />
                  </Choice>
                ))}
              </Grid>
              <p className="mb-2 mt-4 text-xs font-black uppercase tracking-wider text-ink-mute">{t("shirtColor")}</p>
              <div className="flex flex-wrap gap-2">
                {SHIRT_COLORS.map((c, i) => (
                  <Swatch key={c} on={avatar.shirtColor === i} style={{ background: c }} onClick={() => change({ shirtColor: i })} />
                ))}
              </div>
            </>
          )}
          {part === "muscles" && (
            <Grid>
              {MUSCLES.map((n, i) => (
                <Choice key={n} label={n} on={avatar.muscles === i} onClick={() => change({ muscles: i })}>
                  <AvatarArt avatar={{ ...avatar, muscles: i }} size={76} />
                </Choice>
              ))}
            </Grid>
          )}
          {part === "accessory" && (
            <Grid>
              {ACCESSORIES.map((n, i) => (
                <Choice key={n} label={n} on={avatar.accessory === i} onClick={() => change({ accessory: i })}>
                  <AvatarArt avatar={{ ...avatar, accessory: i }} size={76} />
                </Choice>
              ))}
            </Grid>
          )}
          {part === "eyes" && (
            <Grid>
              {EYES.map((n, i) => (
                <Choice key={n} label={n} on={avatar.eyes === i} onClick={() => change({ eyes: i })}>
                  <AvatarArt avatar={{ ...avatar, eyes: i }} size={76} />
                </Choice>
              ))}
            </Grid>
          )}
          {part === "fur" && (
            <Grid>
              {FURS.map((f, i) => (
                <Choice key={f.name} label={f.name} on={avatar.fur === i} onClick={() => change({ fur: i })}>
                  <AvatarArt avatar={{ ...avatar, fur: i }} size={76} />
                </Choice>
              ))}
            </Grid>
          )}
          {part === "bg" && (
            <Grid>
              {BACKGROUNDS.map((b, i) => (
                <Choice key={b.name} label={b.name} on={avatar.bg === i} onClick={() => change({ bg: i })}>
                  <AvatarArt avatar={{ ...avatar, bg: i }} size={76} />
                </Choice>
              ))}
            </Grid>
          )}
        </div>
      </div>
    </Modal>
  );
}

const rnd = (n: number) => Math.floor(Math.random() * n);

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{children}</div>;
}

function Choice({ label, on, onClick, children }: { label: string; on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="duo-card flex flex-col items-center gap-1 p-2 text-[11px] font-bold" data-state={on ? "selected" : undefined}>
      {children}
      <span className="truncate">{label}</span>
    </button>
  );
}

function Swatch({ on, style, onClick, big }: { on: boolean; style: React.CSSProperties; onClick: () => void; big?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      aria-pressed={on}
      className={clsx("rounded-2xl border-4 transition-transform hover:scale-105", big ? "aspect-square w-full" : "h-10 w-10", on ? "border-white ring-2 ring-accent" : "border-transparent")}
    />
  );
}
