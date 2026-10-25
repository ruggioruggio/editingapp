import { create } from "zustand";
import type { AuthError } from "@supabase/supabase-js";
import type { PlanId } from "@/lib/billing/plans";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  plan: PlanId;
  xp: number;
  streak_count: number;
  streak_last_day: string | null;
}

interface AuthState {
  /** disabled = Supabase non configurato, si gioca solo come ospite */
  status: "loading" | "guest" | "user" | "disabled";
  userId: string | null;
  email: string | null;
  profile: Profile | null;
}

export const useAuth = create<AuthState>()(() => ({ status: "loading", userId: null, email: null, profile: null }));

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email o password errati.",
  email_not_confirmed: "Conferma prima la tua email: controlla la posta in arrivo.",
  user_already_exists: "Esiste già un account con questa email.",
  email_exists: "Esiste già un account con questa email.",
  weak_password: "Password troppo debole: usa almeno 8 caratteri.",
  over_email_send_rate_limit: "Troppe email inviate: riprova tra qualche minuto.",
  over_request_rate_limit: "Troppi tentativi: riprova tra qualche minuto.",
  validation_failed: "Controlla i dati inseriti.",
  provider_disabled: "Questo metodo di accesso non è ancora attivo.",
};

/** Messaggio d'errore in italiano per l'utente. */
export function authErrorMessage(error: AuthError | Error | null | undefined): string {
  if (!error) return "";
  const code = "code" in error ? (error.code as string | undefined) : undefined;
  return (code && MESSAGES[code]) || "Qualcosa è andato storto. Riprova.";
}
