"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Squeak3D } from "@/components/brand/Squeak3DLazy";

const SESSION_KEY = "squeak-splash-shown";
const PLAY_MS = 2400;
const EXIT_MS = 550;

let played = false;

function shouldPlay(): boolean {
  if (played) return false;
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage non disponibile */
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

/** Animazione d'apertura: Squeak fa una piroetta e saluta, una volta per sessione. */
export function Splash() {
  const [phase, setPhase] = useState<"pending" | "play" | "exit" | "done">("pending");

  useEffect(() => {
    if (!shouldPlay()) {
      setPhase("done");
      return;
    }
    setPhase("play");
    played = true;
  }, []);

  useEffect(() => {
    if (phase === "play") {
      const t = setTimeout(() => setPhase("exit"), PLAY_MS);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(() => setPhase("done"), EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      role="presentation"
      onClick={() => phase === "play" && setPhase("exit")}
      className={clsx(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0b0b] px-6",
        phase === "exit" && "splash-out",
      )}
    >
      {phase !== "pending" && (
        <>
          <div className="splash-in h-56 w-56">
            <Squeak3D mode="spin" className="h-full w-full" />
          </div>
          <p className="splash-in mt-4 text-4xl font-black tracking-tight">
            Squeak<span className="text-pr">Edit</span>
          </p>
        </>
      )}
    </div>
  );
}
