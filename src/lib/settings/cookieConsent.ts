"use client";

import { create } from "zustand";

const KEY = "squeak-cookie-consent";

export type CookieChoice = "accepted" | "rejected";

export const useCookieConsent = create<{
  choice: CookieChoice | null;
  loaded: boolean;
  suppressed: boolean;
  load: () => void;
  choose: (c: CookieChoice) => void;
}>((set) => ({
  choice: null,
  loaded: false,
  suppressed: false,
  load: () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    set({ loaded: true, choice: saved === "accepted" || saved === "rejected" ? saved : null });
  },
  choose: (choice) => {
    try {
      localStorage.setItem(KEY, choice);
    } catch {}
    set({ choice, loaded: true });
  },
}));
