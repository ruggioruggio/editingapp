"use client";

import dynamic from "next/dynamic";

// Le scene 3D si caricano solo nel browser e solo quando servono (three.js è pesante).
const placeholder = () => <div className="h-full w-full" />;

export const LoungeHero = dynamic(() => import("./scenes/LoungeHero"), { ssr: false, loading: placeholder });
export const SiteScene = dynamic(() => import("./scenes/SiteScenes"), { ssr: false, loading: placeholder });
export const ModSqueakScene = dynamic(() => import("./scenes/ModSqueak"), { ssr: false, loading: placeholder });
