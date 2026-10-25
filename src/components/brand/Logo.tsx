import Link from "next/link";
import clsx from "clsx";
import { AppIcon } from "./Mascot";

/** `compact` nasconde la scritta sui telefoni, dove serve spazio per le statistiche. */
export function Logo({ href = "/", size = 30, compact = false }: { href?: string; size?: number; compact?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-extrabold tracking-tight" aria-label="SqueakEdit">
      <AppIcon size={size} />
      <span className={clsx("text-xl", compact && "hidden sm:inline")}>
        Squeak<span className="text-pr">Edit</span>
      </span>
    </Link>
  );
}
