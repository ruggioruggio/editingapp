import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";
import { capacitorStorage } from "./capacitorStorage";

const IS_ELECTRON = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);
const IS_CAPACITOR = !IS_ELECTRON && !!process.env.SQUEAK_DESKTOP;
const IS_NATIVE = IS_ELECTRON || IS_CAPACITOR;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = IS_NATIVE
      ? createClient(supabaseUrl, supabaseKey, {
          auth: {
            flowType: "pkce",
            storage: IS_CAPACITOR ? capacitorStorage : globalThis.localStorage,
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
