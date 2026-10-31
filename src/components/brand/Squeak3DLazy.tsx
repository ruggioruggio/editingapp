"use client";

import dynamic from "next/dynamic";
import { Mascot } from "./Mascot";

export const Squeak3D = dynamic(() => import("./Squeak3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <Mascot size={160} idle />
    </div>
  ),
});
