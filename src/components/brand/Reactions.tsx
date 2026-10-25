"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import { MouseFigure, type MascotMood } from "./Mascot";

// Le reazioni di Squeak a risposte giuste e sbagliate: 5 per tipo, scelte a
// caso ogni volta. Animazioni in CSS (classi rx-* in globals.css).

const CONFETTI = ["#ffc93c", "#9999ff", "#3ecf8e", "#ff6f9a", "#2d8ceb", "#ff9a5c"];

function Stage({ children, className, size }: { children: ReactNode; className?: string; size: number }) {
  return (
    <svg viewBox="0 0 160 140" width={size} height={(size * 140) / 160} className={clsx("rx sq-anim sq-idle overflow-visible", className)} aria-hidden>
      {children}
    </svg>
  );
}

const Squeak = ({ mood, className }: { mood: MascotMood; className?: string }) => (
  <g transform="translate(20 30)">
    <g className={className}>
      <MouseFigure mood={mood} />
    </g>
  </g>
);

const vars = (o: Record<string, string | number>) => o as CSSProperties;

// --- vittorie ---

function WinJump() {
  return (
    <>
      {CONFETTI.concat(CONFETTI).map((c, i) => (
        <rect
          key={i}
          className="rx-confetti"
          x={78}
          y={40}
          width={5}
          height={8}
          rx={1}
          fill={c}
          style={vars({ "--dx": `${Math.cos(i * 0.52) * 60}px`, "--dy": `${-20 - Math.abs(Math.sin(i * 0.9)) * 40}px`, animationDelay: `${(i % 4) * 0.08}s` })}
        />
      ))}
      <Squeak mood="wow" className="rx-jump" />
    </>
  );
}

function WinSpin() {
  return (
    <>
      {[
        [20, 30],
        [140, 40],
        [30, 110],
        [140, 105],
      ].map(([x, y], i) => (
        <path key={i} className="rx-twinkle" style={{ animationDelay: `${i * 0.25}s` }} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#ffc93c" />
      ))}
      <Squeak mood="happy" className="rx-spin" />
    </>
  );
}

function WinCheese() {
  return (
    <>
      <Squeak mood="wow" className="rx-hug" />
      <g className="rx-drop-cheese">
        <polygon points="96,98 124,98 124,80" fill="#ffc93c" />
        <circle cx="117" cy="92" r="2.5" fill="#e0a800" />
      </g>
      {[0, 1].map((i) => (
        <path key={i} className="rx-heart" style={{ animationDelay: `${0.75 + i * 0.25}s` }} transform={`translate(${108 + i * 16} 46) scale(0.7)`} d="M0 4 C0 -2 8 -2 8 4 C8 -2 16 -2 16 4 C16 10 8 14 8 16 C8 14 0 10 0 4Z" fill="#ff6f9a" />
      ))}
    </>
  );
}

function WinDance() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <text key={i} className="rx-note" style={{ animationDelay: `${i * 0.4}s` }} x={30 + i * 45} y={45} fontSize="18" fill={i === 1 ? "#ffc93c" : "#9999ff"}>
          ♪
        </text>
      ))}
      <Squeak mood="happy" className="rx-dance" />
    </>
  );
}

function WinTrophy() {
  return (
    <>
      <g className="rx-shine">
        <circle cx="105" cy="30" r="20" fill="#ffc93c" opacity="0.25" />
      </g>
      <Squeak mood="wow" />
      <g className="rx-raise">
        <path d="M95 18 H115 V28 C115 36 108 40 105 40 C102 40 95 36 95 28 Z" fill="#ffc93c" />
        <path d="M95 22 C88 22 88 31 96 31 M115 22 C122 22 122 31 114 31" stroke="#ffc93c" strokeWidth="2.5" fill="none" />
        <rect x="102" y="40" width="6" height="7" fill="#e0a800" />
        <rect x="97" y="47" width="16" height="4" rx="1" fill="#e0a800" />
        <ellipse cx="100" cy="74" rx="6" ry="5" fill="#f5a3b8" />
      </g>
    </>
  );
}

// --- sconfitte ---

function LoseRain() {
  return (
    <>
      <g>
        <ellipse cx="102" cy="22" rx="24" ry="11" fill="#6b7286" />
        <ellipse cx="88" cy="26" rx="14" ry="9" fill="#6b7286" />
        <ellipse cx="116" cy="27" rx="13" ry="8" fill="#6b7286" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className="rx-rain" style={{ animationDelay: `${i * 0.22}s` }} x={88 + i * 9} y={34} width={2} height={7} rx={1} fill="#5ccfff" />
      ))}
      <Squeak mood="sad" className="rx-droop" />
    </>
  );
}

function LoseDizzy() {
  return (
    <>
      <Squeak mood="dizzy" className="rx-wobble" />
      <g className="rx-orbit">
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          const x = 105 + Math.cos(a) * 16;
          const y = 44 + Math.sin(a) * 5;
          return <path key={i} d={`M${x} ${y - 5} L${x + 1.5} ${y - 1.5} L${x + 5} ${y} L${x + 1.5} ${y + 1.5} L${x} ${y + 5} L${x - 1.5} ${y + 1.5} L${x - 5} ${y} L${x - 1.5} ${y - 1.5} Z`} fill="#ffc93c" />;
        })}
      </g>
    </>
  );
}

function LoseTear() {
  return (
    <>
      <Squeak mood="sad" className="rx-sniff" />
      <path className="rx-tear" d="M109 84 C109 84 105 90 105 93 C105 96 113 96 113 93 C113 90 109 84 109 84Z" fill="#5ccfff" />
    </>
  );
}

function LoseShake() {
  return (
    <>
      <Squeak mood="sad" className="rx-shake" />
      <path className="rx-tear" style={{ animationDelay: "0.2s" }} d="M78 62 C78 62 74 68 74 71 C74 74 82 74 82 71 C82 68 78 62 78 62Z" fill="#9be3ff" />
      <text className="rx-question" x={118} y={50} fontSize="22" fontWeight="900" fill="#ff6f9a">
        !
      </text>
    </>
  );
}

function LoseDeflate() {
  return (
    <>
      <Squeak mood="sleepy" className="rx-deflate" />
      <text className="rx-question" x={120} y={52} fontSize="22" fontWeight="900" fill="#9999ff">
        ?
      </text>
      <text className="rx-question" style={{ animationDelay: "0.35s" }} x={134} y={40} fontSize="16" fontWeight="900" fill="#9999ff">
        ?
      </text>
    </>
  );
}

const WINS = [WinJump, WinSpin, WinCheese, WinDance, WinTrophy];
const LOSSES = [LoseRain, LoseDizzy, LoseTear, LoseShake, LoseDeflate];

/** Reazione casuale di Squeak: ogni volta che il componente appare ne sceglie una. */
export function SqueakReaction({ outcome, size = 96, className }: { outcome: "win" | "lose"; size?: number; className?: string }) {
  const list = outcome === "win" ? WINS : LOSSES;
  const [index] = useState(() => Math.floor(Math.random() * list.length));
  const Variant = list[index];
  return (
    <Stage size={size} className={className}>
      <Variant />
    </Stage>
  );
}
