import Link from "next/link";
import clsx from "clsx";
import { Monitor } from "lucide-react";
import { brand } from "@/config/brand";

const AppleGlyph = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
    <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-1-2.4-4.2zM14 5.3c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
  </svg>
);

const PlayGlyph = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <path d="M4 2.5 14 12 4 21.5c-.4-.2-.6-.6-.6-1.1V3.6c0-.5.2-.9.6-1.1Z" fill="#3ecf8e" />
    <path d="M17.3 8.8 14 12 4 2.5l.3-.1c.4-.1.8 0 1.1.2l11.9 6.2Z" fill="#2d8ceb" />
    <path d="M17.3 15.2 5.4 21.4c-.3.2-.7.3-1.1.2L4 21.5 14 12l3.3 3.2Z" fill="#ff5f5f" />
    <path d="m17.3 8.8 3 1.6c.6.3.9.9.9 1.6s-.3 1.3-.9 1.6l-3 1.6L14 12l3.3-3.2Z" fill="#ffc93c" />
  </svg>
);

function StoreButton({ href, top, bottom, icon }: { href: string | null; top: string; bottom: string; icon: React.ReactNode }) {
  const body = (
    <>
      {icon}
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-semibold opacity-75">{href ? top : "Presto su"}</span>
        <span className="block text-base font-black">{bottom}</span>
      </span>
    </>
  );
  const cls = clsx(
    "btn-3d flex min-w-44 items-center gap-3 rounded-2xl border border-white/15 bg-black px-4 py-2.5 text-white",
    !href && "cursor-default opacity-80",
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <span className={cls} title="In arrivo">
      {body}
    </span>
  );
}

export function StoreButtons({ className }: { className?: string }) {
  return (
    <div className={clsx("flex flex-wrap gap-3", className)}>
      <StoreButton href={brand.appStoreUrl} top="Scarica su" bottom="App Store" icon={<AppleGlyph />} />
      <StoreButton href={brand.playStoreUrl} top="Disponibile su" bottom="Google Play" icon={<PlayGlyph />} />
      <Link
        href="/download"
        className="btn-3d flex min-w-44 items-center gap-3 rounded-2xl border border-white/15 bg-black px-4 py-2.5 text-white"
      >
        <Monitor size={22} />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-semibold opacity-75">Scarica per</span>
          <span className="block text-base font-black">Windows e Mac</span>
        </span>
      </Link>
    </div>
  );
}
