import Link from "next/link";
import { AppIcon } from "./Mascot";

export function Logo({ href = "/", size = 30 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-extrabold tracking-tight">
      <AppIcon size={size} />
      <span className="text-xl">
        Squeak<span className="text-pr">Edit</span>
      </span>
    </Link>
  );
}
