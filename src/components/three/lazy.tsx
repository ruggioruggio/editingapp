"use client";

import dynamic from "next/dynamic";

const placeholder = () => <div className="h-full w-full" />;

export const LoungeHero = dynamic(() => import("./scenes/LoungeHero"), { ssr: false, loading: placeholder });
export const SiteScene = dynamic(() => import("./scenes/SiteScenes"), { ssr: false, loading: placeholder });
export const ModSqueakScene = dynamic(() => import("./scenes/ModSqueak"), { ssr: false, loading: placeholder });

if (typeof window !== "undefined") {
  void import("./scenes/SiteScenes");
  void import("./scenes/LoungeHero");
}
