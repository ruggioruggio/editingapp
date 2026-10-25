// Le variabili NEXT_PUBLIC_ vanno lette per nome esatto: Next le sostituisce in build.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Senza credenziali l'app funziona in modalità ospite (progressi solo sul dispositivo). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Accetta solo percorsi interni come destinazione dopo il login. */
export function safeNext(next: string | null | undefined, fallback = "/learn"): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
