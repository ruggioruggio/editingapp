"use client";

import Link from "next/link";
import { Mascot } from "@/components/brand/Mascot";
import { useT } from "@/lib/settings/i18n";

const CLIPS = [
  { left: "0%", width: "24%" },
  { left: "24%", width: "16%" },
  { left: "68%", width: "32%" },
];

export function NotFoundView() {
  const t = useT();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-app px-4 py-10 text-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-md border border-[#151515] bg-ppro-panel font-ppro shadow-2xl">
        <div className="flex h-[26px] items-center justify-between border-b border-[#151515] bg-ppro-header px-3 text-[11px] text-ppro-tab">
          <span className="font-semibold text-ppro-tab-active">{t("notFoundMonitor")}</span>
          <span>1920 × 1080</span>
        </div>
        <div className="relative grid aspect-video place-items-center bg-[#c91f1f] p-4">
          <div>
            <p className="text-[clamp(1.7rem,7vw,3.25rem)] font-bold leading-none tracking-wide text-white">{t("notFoundTitle")}</p>
            <p className="mt-3 text-[clamp(0.75rem,2.2vw,1rem)] font-semibold text-white/85">404</p>
          </div>
          <Mascot size={92} mood="dizzy" idle className="absolute bottom-2 right-3 max-sm:hidden" />
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 font-mono text-[13px]">
          <span className="text-ppro-timecode">00:00:04:04</span>
          <span className="text-[#d0d0d0]">00:00:04:04</span>
        </div>
        <div className="relative mx-3 mb-3 h-11 overflow-hidden border border-ppro-track-line bg-ppro-track">
          {CLIPS.map((c) => (
            <span key={c.left} className="absolute inset-y-1 rounded-[1px] border border-black/50 bg-ppro-vclip" style={{ left: c.left, width: c.width }}>
              <span className="block h-2.5 bg-ppro-vclip-head" />
            </span>
          ))}
          <span className="absolute inset-y-1 left-[40%] w-[28%] border border-dashed border-[#ff5f5f]/70 bg-[#ff5f5f]/10" />
          <span className="nf-playhead absolute inset-y-0 w-px bg-ppro-playhead" />
        </div>
      </div>
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
