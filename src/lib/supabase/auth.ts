import { create } from "zustand";
import type { AuthError } from "@supabase/supabase-js";
import type { PlanId } from "@/lib/billing/plans";
import { translate, type TKey } from "@/lib/settings/i18n";
import { useSettings, type Lang } from "@/lib/settings/store";

export type UserRole = "owner" | "moderatore" | "amico" | "founder";

export const ROLE_LABELS: Record<UserRole, string> = {
  founder: "Founder",
  owner: "Owner",
  moderatore: "Moderatore",
  amico: "Amico",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  founder: "#ff6b6b",
  owner: "#ffc93c",
  moderatore: "#5865f2",
  amico: "#3ecf8e",
};

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  plan: PlanId;
  xp: number;
  streak_count: number;
  streak_last_day: string | null;
  role: UserRole | null;
  created_at: string | null;
}

interface AuthState {
  status: "loading" | "guest" | "user" | "disabled";
  userId: string | null;
  email: string | null;
  profile: Profile | null;
}

export const useAuth = create<AuthState>()(() => ({ status: "loading", userId: null, email: null, profile: null }));

const ERROR_KEYS: Record<string, TKey> = {
  invalid_credentials: "loginError",
  email_not_confirmed: "emailNotConfirmed",
  user_already_exists: "accountExists",
  email_exists: "accountExists",
  weak_password: "weakPassword",
  over_email_send_rate_limit: "tooManyEmails",
  over_request_rate_limit: "tooManyAttempts",
  validation_failed: "checkData",
  provider_disabled: "providerDisabled",
};

export function authErrorMessage(error: AuthError | Error | null | undefined): string {
  if (!error) return "";
  const lang: Lang = useSettings.getState().lang;
  const code = "code" in error ? (error.code as string | undefined) : undefined;
  const key = code ? ERROR_KEYS[code] : undefined;
  return key ? translate(lang, key) : translate(lang, "genericError");
}
