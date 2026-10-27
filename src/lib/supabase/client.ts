import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

const IS_ELECTRON = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);

let client: SupabaseClient | null = null;

/** Client Supabase del browser. Su Electron usa localStorage (i cookie non funzionano su file://). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = IS_ELECTRON
      ? createClient(supabaseUrl, supabaseKey, { auth: { flowType: "pkce", storage: globalThis.localStorage, detectSessionInUrl: false } })
      : createBrowserClient(supabaseUrl, supabaseKey);
  }
  return client;
}
