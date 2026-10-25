"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import { MouseFigure } from "./Mascot";
import { Squeak3D } from "./Squeak3DLazy";

// Cinque scenette di Squeak (viewBox 400x240). Le animazioni sono in globals.css:
// con loop=false durano una volta (splash), con loop=true girano all'infinito (sito).

function Scene({ loop, className, children }: { loop: boolean; className?: string; children: ReactNode }) {
  const vars = { "--iter": loop ? "infinite" : "1", "--iter3": loop ? "infinite" : "3" } as CSSProperties;
  return (
    <svg viewBox="0 0 400 240" className={clsx("scene sq-anim h-auto w-full overflow-visible", className)} style={vars} aria-hidden>
      {children}
    </svg>
  );
}

/** Topo con le animazioni idle sempre attive (ciglia, coda, orecchio). */
function Squeak({ x, y, scale = 1, mood }: { x: number; y: number; scale?: number; mood?: "happy" | "wow" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="sq-idle">
        <MouseFigure mood={mood} />
      </g>
    </g>
  );
}

function FilmStrip({ x, w }: { x: number; w: number }) {
  const holes = Math.floor(w / 16);
  return (
    <g>
      <rect x={x} y={150} width={w} height={46} rx={3} fill="#262626" />
      {Array.from({ length: holes }, (_, i) => (
        <g key={i}>
          <rect x={x + 5 + i * 16} y={153} width={7} height={5} rx={1} fill="#0b0b0b" />
          <rect x={x + 5 + i * 16} y={188} width={7} height={5} rx={1} fill="#0b0b0b" />
        </g>
      ))}
      {Array.from({ length: Math.floor(w / 40) }, (_, i) => (
        <rect key={i} x={x + 4 + i * 40} y={161} width={34} height={24} rx={2} fill={i % 2 ? "#6f66e0" : "#2d8ceb"} opacity={0.85} />
      ))}
    </g>
  );
}

const Word = ({ x, y, children, color = "#ffc93c" }: { x: number; y: number; children: string; color?: string }) => (
  <text x={x} y={y} textAnchor="middle" fontSize="34" fontWeight="900" fill={color} className="a word-pop">
    {children}
  </text>
);

export function CutScene({ loop = true }: { loop?: boolean }) {
  return (
    <Scene loop={loop}>
      <g className="a cut-left">
        <FilmStrip x={40} w={160} />
      </g>
      <g className="a cut-right">
        <FilmStrip x={200} w={160} />
      </g>
      <g className="a jump">
        <Squeak x={92} y={42} scale={1.05} />
        <g transform="translate(180 112)">
          <circle cx="0" cy="0" r="6" fill="none" stroke="#ff5f5f" strokeWidth="3" />
          <path d="M4 5 L22 42" stroke="#e8e8e8" strokeWidth="3.5" strokeLinecap="round" />
          <g className="a snip">
            <circle cx="13" cy="-3" r="6" fill="none" stroke="#ff5f5f" strokeWidth="3" />
            <path d="M12 3 L21 42" stroke="#cfcfcf" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </g>
      </g>
      <Word x={310} y={84}>CUT!</Word>
    </Scene>
  );
}

export function CheeseScene({ loop = true }: { loop?: boolean }) {
  const maskId = useId();
  return (
    <Scene loop={loop}>
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="400" height="240" fill="#fff" />
          <circle className="a bite1" cx="232" cy="192" r="12" fill="#000" />
          <circle className="a bite2" cx="254" cy="186" r="13" fill="#000" />
          <circle className="a bite3" cx="276" cy="178" r="14" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <polygon points="222,200 346,200 346,124" fill="#ffc93c" />
        <polygon points="222,200 346,200 346,190" fill="#e0a800" />
        <circle cx="318" cy="168" r="8" fill="#e0a800" />
        <circle cx="300" cy="186" r="5" fill="#e0a800" />
        <circle cx="334" cy="146" r="5" fill="#e0a800" />
      </g>
      {[0, 1, 2].map((i) => (
        <rect key={i} className="a crumb" x={226 + i * 8} y={190} width="4" height="4" fill="#ffc93c" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
      <g className="a nibble">
        <Squeak x={92} y={100} scale={1.15} />
      </g>
      <Word x={150} y={70}>Gnam!</Word>
    </Scene>
  );
}

export function ClapScene({ loop = true }: { loop?: boolean }) {
  return (
    <Scene loop={loop}>
      <circle className="a flash" cx="282" cy="136" r="46" fill="none" stroke="#ffc93c" strokeWidth="4" />
      <rect x="226" y="142" width="112" height="70" rx="4" fill="#1f1f1f" stroke="#e8e8e8" strokeWidth="2" />
      <text x="236" y="172" fontSize="12" fontWeight="800" fill="#e8e8e8">SCENA 1</text>
      <text x="236" y="192" fontSize="12" fontWeight="800" fill="#e8e8e8">CIAK 1</text>
      <text x="300" y="172" fontSize="10" fill="#9999ff">EDIT</text>
      <g className="a clap">
        <rect x="226" y="124" width="112" height="16" rx="2" fill="#1f1f1f" stroke="#e8e8e8" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <polygon key={i} points={`${232 + i * 22},126 ${244 + i * 22},126 ${236 + i * 22},138 ${224 + i * 22},138`} fill="#e8e8e8" />
        ))}
      </g>
      <Squeak x={86} y={110} scale={1.1} />
      <Word x={282} y={78}>CIAK!</Word>
    </Scene>
  );
}

export function RunScene({ loop = true }: { loop?: boolean }) {
  return (
    <Scene loop={loop}>
      <rect x="0" y="194" width="400" height="30" rx="4" fill="#1b1b1b" />
      {[10, 120, 190, 300].map((x, i) => (
        <rect key={x} x={x} y="198" width={[100, 60, 100, 90][i]} height="22" rx="3" fill={i % 2 ? "#2f8a57" : "#6f66e0"} />
      ))}
      {Array.from({ length: 21 }, (_, i) => (
        <rect key={i} x={i * 20} y="186" width="1" height={i % 5 ? 4 : 8} fill="#555" />
      ))}
      <g className="a run-x">
        <line x1="96" y1="16" x2="96" y2="224" stroke="#2d8ceb" strokeWidth="2" />
        <rect x="90" y="10" width="12" height="10" rx="2" fill="#2d8ceb" />
        <g className="run-bob">
          {[0, 1, 2].map((i) => (
            <line key={i} className="speed" x1={-6 - i * 4} y1={140 + i * 14} x2={-36 - i * 4} y2={140 + i * 14} stroke="#9999ff" strokeWidth="3" strokeLinecap="round" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
          <Squeak x={0} y={104} scale={0.92} />
        </g>
      </g>
    </Scene>
  );
}

export function KeyframeScene({ loop = true }: { loop?: boolean }) {
  const xs = [80, 160, 240, 320];
  return (
    <Scene loop={loop}>
      <path d="M80 200 Q120 140 160 200 Q200 140 240 200 Q280 140 320 200" fill="none" stroke="#555" strokeWidth="2" strokeDasharray="4 6" />
      <rect x="40" y="214" width="320" height="2" fill="#333" />
      {xs.map((x, i) => (
        <polygon
          key={x}
          className="a kf"
          points={`${x},188 ${x + 12},200 ${x},212 ${x - 12},200`}
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}
      <g className="a hop-x">
        <g className="hop-y">
          <Squeak x={38} y={110} scale={0.82} mood="wow" />
        </g>
      </g>
    </Scene>
  );
}

// Scene 3D: Squeak vero e proprio, che ruota nello spazio
function Scene3D({ mode }: { mode: "flip" | "spin" }) {
  return (
    <div className="aspect-[5/3] w-full">
      <Squeak3D mode={mode} className="h-full w-full" />
    </div>
  );
}
export const FlipScene3D = () => <Scene3D mode="flip" />;
export const SpinScene3D = () => <Scene3D mode="spin" />;

/** Le 5 aperture dell'app, una scelta a caso a ogni sessione (3 in 2D, 2 in 3D). */
export const SCENES = [
  { id: "cut", caption: "Squeak sta tagliando il girato…", Component: CutScene },
  { id: "cheese", caption: "Squeak fa merenda prima del montaggio…", Component: CheeseScene },
  { id: "clap", caption: "Ciak, si gira!", Component: ClapScene },
  { id: "flip3d", caption: "Squeak si scalda con una capriola…", Component: FlipScene3D },
  { id: "spin3d", caption: "Squeak fa una piroetta e ti saluta!", Component: SpinScene3D },
] as const;
