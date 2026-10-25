"use client";

import dynamic from "next/dynamic";
import { Mascot } from "./Mascot";

/**
 * Squeak 3D caricato solo nel browser e solo quando serve (three.js pesa).
 * Durante il caricamento mostra la versione 2D.
 */
export const Squeak3D = dynamic(() => import("./Squeak3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <Mascot size={160} idle />
    </div>
  ),
});
