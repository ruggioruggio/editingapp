import Link from "next/link";
import clsx from "clsx";
import { AppIcon } from "./Mascot";

export function Logo({ href = "/", size = 30, compact = false }: { href?: string; size?: number; compact?: boolean }) {
  return (
    <Link href={href} data-admin-tap className="flex touch-manipulation select-none items-center gap-2 font-extrabold tracking-tight" aria-label="SqueakEdit">
      <AppIcon size={size} />
      <span className={clsx("text-xl", compact && "hidden sm:inline")}>
        Squeak<span className="text-pr">Edit</span>
      </span>
    </Link>
  );
}
