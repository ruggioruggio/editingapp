"use client";

import dynamic from "next/dynamic";

// Le scene 3D si caricano solo nel browser e solo quando servono (three.js è pesante).
const placeholder = () => <div className="h-full w-full" />;

export const LoungeHero = dynamic(() => import("./scenes/LoungeHero"), { ssr: false, loading: placeholder });
export const SiteScene = dynamic(() => import("./scenes/SiteScenes"), { ssr: false, loading: placeholder });
export const ModSqueakScene = dynamic(() => import("./scenes/ModSqueak"), { ssr: false, loading: placeholder });

// i moduli delle scene si scaricano subito all apertura del sito, senza aspettare lo scroll
if (typeof window !== "undefined") {
  void import("./scenes/SiteScenes");
  void import("./scenes/LoungeHero");
}
