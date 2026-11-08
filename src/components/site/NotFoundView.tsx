"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/lib/settings/cookieConsent";
import { useT } from "@/lib/settings/i18n";
import { SqueakRunner } from "./SqueakRunner";

export function NotFoundView() {
  const t = useT();

  useEffect(() => {
    useCookieConsent.setState({ suppressed: true });
    return () => useCookieConsent.setState({ suppressed: false });
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-app px-4 py-10 text-center">
      <SqueakRunner />
      <p className="mt-6 max-w-md text-lg font-black">{t("notFoundHeading")}</p>
      <p className="mt-1 max-w-md text-ink-dim">{t("notFoundBody")}</p>
      <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <Link href="/learn" className="btn-3d flex-1 rounded-2xl bg-success py-3 font-black uppercase text-[#08311f]">
          {t("notFoundLearn")}
        </Link>
        <Link href="/" className="btn-3d flex-1 rounded-2xl border-2 border-line bg-panel py-3 font-black uppercase text-pr">
          {t("notFoundHome")}
        </Link>
      </div>
    </main>
  );
}
