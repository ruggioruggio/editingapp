import { create } from "zustand";
import { persist } from "zustand/middleware";

// Preferenze dell'utente su questo dispositivo: lingua, tema, volumi degli
// effetti sonori e l'avatar personalizzato (che si salva anche nel profilo).

export type Lang = "it" | "en" | "fr" | "es" | "zh";
export type Theme = "dark" | "light" | "system";

/** Categorie di suoni, ognuna col suo volume. */
export const SFX_CATEGORIES = ["correct", "wrong", "victory", "defeat", "streak", "levelUp", "quest", "ui"] as const;
export type SfxCategory = (typeof SFX_CATEGORIES)[number];

export interface Avatar {
  fur: number;
  shirt: number;
  shirtColor: number;
  muscles: number;
  accessory: number;
  eyes: number;
  bg: number;
}

export const DEFAULT_AVATAR: Avatar = { fur: 0, shirt: 0, shirtColor: 0, muscles: 1, accessory: 0, eyes: 0, bg: 0 };

interface SettingsState {
  lang: Lang;
  theme: Theme;
  master: number;
  volumes: Record<SfxCategory, number>;
  avatar: Avatar;
  set: (patch: Partial<Omit<SettingsState, "set" | "setVolume" | "setAvatar">>) => void;
  setVolume: (cat: SfxCategory, v: number) => void;
  setAvatar: (patch: Partial<Avatar>) => void;
}

const fullVolumes = () => Object.fromEntries(SFX_CATEGORIES.map((c) => [c, 0.8])) as Record<SfxCategory, number>;

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: "it",
      theme: "dark",
      master: 0.8,
      volumes: fullVolumes(),
      avatar: DEFAULT_AVATAR,
      set: (patch) => set(patch),
      setVolume: (cat, v) => set((s) => ({ volumes: { ...s.volumes, [cat]: v } })),
      setAvatar: (patch) => set((s) => ({ avatar: { ...s.avatar, ...patch } })),
    }),
    {
      name: "squeak-settings",
      version: 1,
      merge: (saved, cur) => {
        const s = (saved ?? {}) as Partial<SettingsState>;
        return { ...cur, ...s, volumes: { ...fullVolumes(), ...s.volumes }, avatar: { ...DEFAULT_AVATAR, ...s.avatar } };
      },
    },
  ),
);

/** Tema effettivo (risolve "sistema"). */
export function resolvedTheme(theme: Theme): "dark" | "light" {
  if (theme !== "system") return theme;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Script eseguito prima del disegno della pagina: applica subito il tema
 * salvato, così non c'è il lampo scuro→chiaro all'apertura.
 */
export const THEME_BOOT = `try{var s=JSON.parse(localStorage.getItem("squeak-settings")||"{}").state||{};var t=s.theme||"dark";if(t==="system")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;if(s.lang)document.documentElement.lang=s.lang}catch(e){}`;
