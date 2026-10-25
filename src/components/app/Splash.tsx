"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { SCENES } from "@/components/brand/scenes";

const SESSION_KEY = "squeak-splash-shown";
const PLAY_MS = 2700;
const EXIT_MS = 550;

// Scelta presa una volta per caricamento pagina (evita il doppio effetto di StrictMode).
let sessionChoice: number | null | undefined;

function pickScene(): number | null {
  if (sessionChoice !== undefined) return sessionChoice;
  let seen = false;
  try {
    seen = sessionStorage.getItem(SESSION_KEY) === "1";
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // storage non disponibile: mostriamo comunque lo splash
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  sessionChoice = seen || reduceMotion ? null : Math.floor(Math.random() * SCENES.length);
  return sessionChoice;
}

/** Animazione d'apertura: una delle 5 scene di Squeak a caso, una volta per sessione. */
export function Splash() {
  const [phase, setPhase] = useState<"pending" | "play" | "exit" | "done">("pending");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const choice = pickScene();
    if (choice === null) {
      setPhase("done");
      return;
    }
    setIndex(choice);
    setPhase("play");
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
  const { Component, caption } = SCENES[index];

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
          <div className="splash-in w-full max-w-md">
            <Component loop={false} />
          </div>
          <p className="splash-in mt-6 text-4xl font-black tracking-tight">
            Squeak<span className="text-pr">Edit</span>
          </p>
          <p className="splash-in mt-2 text-sm font-semibold text-ink-mute">{caption}</p>
        </>
      )}
    </div>
  );
}
