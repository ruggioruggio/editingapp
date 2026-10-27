import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

const IS_ELECTRON = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);
const IS_NATIVE = IS_ELECTRON || !!process.env.SQUEAK_DESKTOP;

let client: SupabaseClient | null = null;

/** Client Supabase del browser. Su Electron/Capacitor usa localStorage (cookie non persistono). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = IS_NATIVE
      ? createClient(supabaseUrl, supabaseKey, {
          auth: {
            flowType: "pkce",
            storage: globalThis.localStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            storageKey: "sb-squeakedit-auth",
          },
        })
      : createBrowserClient(supabaseUrl, supabaseKey);
  }
  return client;
}
