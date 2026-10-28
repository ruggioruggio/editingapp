import { Preferences } from "@capacitor/preferences";

/**
 * Storage adapter per Supabase che usa @capacitor/preferences (SharedPreferences
 * su Android) — persiste anche quando il WebView svuota localStorage.
 *
 * Supabase vuole getItem sincrono, quindi teniamo una cache in memoria
 * idratata al boot (prima di creare il client) e scriviamo in background.
 */

const cache = new Map<string, string>();
let ready = false;

const AUTH_KEYS_PREFIX = "sb-";

export async function hydrateCapStorage() {
  const { keys } = await Preferences.keys();
  for (const key of keys.filter((k) => k.startsWith(AUTH_KEYS_PREFIX))) {
    const { value } = await Preferences.get({ key });
    if (value !== null) cache.set(key, value);
  }
  ready = true;
}

export const capacitorStorage = {
  getItem(key: string): string | null {
    return cache.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    cache.set(key, value);
    void Preferences.set({ key, value });
  },
  removeItem(key: string): void {
    cache.delete(key);
    void Preferences.remove({ key });
  },
};

export function isCapStorageReady() {
  return ready;
}
