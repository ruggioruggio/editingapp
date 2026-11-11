import type { SupabaseClient, User } from "@supabase/supabase-js";
import { LEGAL_UPDATED } from "@/content/legal";

// Proof of consent (GDPR art. 7.1): what was accepted, when, and which version of the documents.
export type Consents = {
  version: string;
  terms_at: string;
  privacy_at: string;
  cookies_at: string;
  marketing: boolean;
  marketing_at: string | null;
};

const PENDING_KEY = "squeak-pending-consents";

export function buildConsents(marketing: boolean): Consents {
  const now = new Date().toISOString();
  return { version: LEGAL_UPDATED, terms_at: now, privacy_at: now, cookies_at: now, marketing, marketing_at: marketing ? now : null };
}

/** OAuth sign-ups leave the page before an account exists: keep the consents until the session starts. */
export function savePendingConsents(c: Consents) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(c));
  } catch {}
}

export async function applyPendingConsents(sb: SupabaseClient, user: User) {
  let pending: Consents | null = null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    pending = raw ? (JSON.parse(raw) as Consents) : null;
  } catch {}
  if (!pending) return;
  // an existing account keeps its own record; only fill it in when missing
  if (!(user.user_metadata as { consents?: unknown } | undefined)?.consents) {
    const { error } = await sb.auth.updateUser({ data: { consents: pending } });
    if (error) return;
  }
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {}
}

export async function setMarketingConsent(sb: SupabaseClient, user: User, on: boolean) {
  const current = ((user.user_metadata as { consents?: Consents } | undefined)?.consents ?? buildConsents(false)) as Consents;
  return sb.auth.updateUser({ data: { consents: { ...current, marketing: on, marketing_at: new Date().toISOString() } } });
}
