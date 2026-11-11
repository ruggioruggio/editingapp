"use client";

import { create } from "zustand";

const KEY = "squeak-cookie-consent";
// bump when the cookie policy changes in a way that needs a fresh choice
export const CONSENT_VERSION = 2;

export type CookieChoice = "accepted" | "rejected";
// "necessary" cookies are always on; every other category needs an explicit opt-in
export type ConsentCategory = "necessary" | "analytics" | "marketing";

type Stored = { choice: CookieChoice; at: string; version: number };

export const useCookieConsent = create<{
  choice: CookieChoice | null;
  at: string | null;
  loaded: boolean;
  suppressed: boolean;
  load: () => void;
  choose: (c: CookieChoice) => void;
  reopen: () => void;
}>((set) => ({
  choice: null,
  at: null,
  loaded: false,
  suppressed: false,
  load: () => {
    let saved: Stored | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw?.startsWith("{") ? (JSON.parse(raw) as Stored) : null;
      if (parsed && parsed.version === CONSENT_VERSION) saved = parsed;
    } catch {}
    set({ loaded: true, choice: saved?.choice ?? null, at: saved?.at ?? null });
  },
  choose: (choice) => {
    const record: Stored = { choice, at: new Date().toISOString(), version: CONSENT_VERSION };
    try {
      localStorage.setItem(KEY, JSON.stringify(record));
    } catch {}
    set({ choice, at: record.at, loaded: true });
  },
  // withdrawal must be as easy as giving consent: this shows the banner again
  reopen: () => set({ choice: null, loaded: true, suppressed: false }),
}));

export function hasConsent(category: ConsentCategory) {
  if (category === "necessary") return true;
  return useCookieConsent.getState().choice === "accepted";
}
