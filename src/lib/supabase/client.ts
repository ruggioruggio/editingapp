import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

const IS_ELECTRON = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);
const IS_CAPACITOR = !IS_ELECTRON && !!process.env.SQUEAK_DESKTOP;
const IS_NATIVE = IS_ELECTRON || IS_CAPACITOR;

let client: SupabaseClient | null = null;

/** Importa lo storage Capacitor solo nella build mobile (tree-shaking elimina il resto). */
function getNativeStorage() {
  if (IS_CAPACITOR) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { capacitorStorage } = require("./capacitorStorage") as typeof import("./capacitorStorage");
    return capacitorStorage;
  }
  return globalThis.localStorage;
}

/** Client Supabase del browser. Su Electron usa localStorage, su Capacitor usa Preferences native. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = IS_NATIVE
      ? createClient(supabaseUrl, supabaseKey, {
          auth: {
            flowType: "pkce",
            storage: getNativeStorage(),
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
