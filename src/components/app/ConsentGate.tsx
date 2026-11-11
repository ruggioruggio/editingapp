"use client";

import { useEffect, type ReactNode } from "react";
import { useCookieConsent, type ConsentCategory } from "@/lib/settings/cookieConsent";

/**
 * The only allowed way to add third-party scripts, embeds or pixels: nothing inside renders (so nothing loads)
 * until the visitor has opted in, and it disappears again as soon as they withdraw.
 * Remember to also allow the provider's domain in the CSP in next.config.ts.
 */
export function ConsentGate({ category, children, fallback = null }: { category: Exclude<ConsentCategory, "necessary">; children: ReactNode; fallback?: ReactNode }) {
  const { choice, loaded, load } = useCookieConsent();
  useEffect(load, [load]);
  void category;
  return <>{loaded && choice === "accepted" ? children : fallback}</>;
}
