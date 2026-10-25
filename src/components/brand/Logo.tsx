import Link from "next/link";
import { brand } from "@/config/brand";
import { Mascot } from "./Mascot";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold tracking-tight">
      <Mascot size={30} />
      <span className="text-lg">
        {brand.mascotName}
        <span className="text-pr"> {brand.productSuffix}</span>
      </span>
    </Link>
  );
}
