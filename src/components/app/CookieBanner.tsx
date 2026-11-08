"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/lib/settings/cookieConsent";
import { useT } from "@/lib/settings/i18n";

const isInstalledApp = () => /Electron/i.test(navigator.userAgent) || !!process.env.SQUEAK_DESKTOP;

export function CookieBanner() {
  const t = useT();
  const { choice, loaded, load, choose } = useCookieConsent();

  useEffect(load, [load]);

  if (!loaded || choice || isInstalledApp()) return null;

  return (
    <div role="dialog" aria-label={t("cookieTitle")} className="animate-pop fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-lg rounded-2xl border border-line bg-panel-2 p-4 shadow-2xl sm:bottom-5">
      <div className="flex items-start gap-3">
        <Cookie size={24} className="mt-0.5 shrink-0 text-cheese" />
        <div className="min-w-0">
          <p className="font-black">{t("cookieTitle")}</p>
          <p className="mt-1 text-sm text-ink-dim">
            {t("cookieBody")}{" "}
            <Link href="/legal/cookie" className="font-bold text-pr underline">
              {t("cookieLearn")}
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => choose("rejected")} className="rounded-xl border-2 border-line py-2.5 text-sm font-black text-ink-dim hover:text-ink">
          {t("cookieReject")}
        </button>
        <button type="button" onClick={() => choose("accepted")} className="btn-3d rounded-xl bg-success py-2.5 text-sm font-black text-[#08311f]">
          {t("cookieAccept")}
        </button>
      </div>
    </div>
  );
}
