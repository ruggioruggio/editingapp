"use client";

import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

const C = {
  fur: "#c7cdda",
  furDark: "#aab2c3",
  face: "#dde1ea",
  belly: "#eceff4",
  pink: "#f7a8c0",
  nose: "#ff6f9a",
  ink: "#1d1c2b",
  purple: "#9999ff",
  purpleDeep: "#5b4fd6",
  teal: "#3fd0c9",
  yellow: "#ffc93c",
  coral: "#ff8a6b",
  card: "#2b2846",
  cardTop: "#363259",
  cardEdge: "#1d1a33",
};

type Mood = "happy" | "wow" | "angry" | "sleepy";
type Pose = "idle" | "wave" | "hammer" | "run" | "nibble";

export function FlatSqueak({ mood = "happy", pose = "idle", ban }: { mood?: Mood; pose?: Pose; ban?: boolean }) {
  const eyeRy = mood === "wow" ? 8.5 : mood === "angry" ? 5 : 7;
  const body = (
    <>
      <g className="fs-ear-l">
        <circle cx="22" cy="30" r="20" fill={C.furDark} />
        <circle cx="22" cy="31" r="12" fill={C.pink} />
      </g>
      <g className="fs-ear-r">
        <circle cx="98" cy="30" r="20" fill={C.furDark} />
        <circle cx="98" cy="31" r="12" fill={C.pink} />
      </g>
      {pose === "run" ? (
        <>
          <g className="fs-leg-a"><rect x="42" y="114" width="9" height="16" rx="4.5" fill={C.pink} /></g>
          <g className="fs-leg-b"><rect x="69" y="114" width="9" height="16" rx="4.5" fill={C.pink} /></g>
        </>
      ) : (
        <>
          <ellipse cx="46" cy="126" rx="10" ry="5" fill={C.pink} />
          <ellipse cx="74" cy="126" rx="10" ry="5" fill={C.pink} />
        </>
      )}
      <ellipse cx="60" cy="100" rx="31" ry="27" fill={C.fur} />
      <ellipse cx="60" cy="107" rx="19" ry="15" fill={C.belly} />
      <ellipse cx="29" cy="99" rx="7" ry="11" fill={C.furDark} transform="rotate(14 29 99)" />
      {pose === "wave" ? (
        <g className="fs-wave">
          <ellipse cx="96" cy="80" rx="7" ry="13" fill={C.furDark} transform="rotate(38 96 80)" />
          <circle cx="103" cy="70" r="6" fill={C.pink} />
        </g>
      ) : pose === "hammer" ? (
        <g className="fs-hammer">
          <rect x="86" y="58" width="6" height="40" rx="3" fill={ban ? "#6b4a2b" : "#8a6a48"} transform="rotate(20 89 96)" />
          <rect x="88" y="44" width="30" height="17" rx="4" fill={ban ? "#e04646" : "#9aa3b5"} transform="rotate(20 89 96)" />
          {ban && <rect x="88" y="50" width="30" height="4" fill={C.yellow} transform="rotate(20 89 96)" />}
          <circle cx="90" cy="96" r="7" fill={C.pink} />
        </g>
      ) : (
        <ellipse cx="91" cy="99" rx="7" ry="11" fill={C.furDark} transform="rotate(-14 91 99)" />
      )}
      <circle cx="60" cy="56" r="35" fill={C.face} />
      <ellipse cx="46" cy="38" rx="15" ry="8" fill="#fff" opacity="0.35" />
      {mood === "angry" && <circle cx="60" cy="56" r="35" fill="#ff5f5f" opacity="0.14" />}
      {mood === "sleepy" ? (
        <g stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round">
          <path d="M42 60 q6 5 12 0" />
          <path d="M66 60 q6 5 12 0" />
        </g>
      ) : (
        <g className="fs-blink">
          <ellipse cx="48" cy="58" rx="6" ry={eyeRy} fill={C.ink} />
          <ellipse cx="72" cy="58" rx="6" ry={eyeRy} fill={C.ink} />
          <circle cx="46" cy={58 - eyeRy / 2.6} r="2.2" fill="#fff" />
          <circle cx="70" cy={58 - eyeRy / 2.6} r="2.2" fill="#fff" />
        </g>
      )}
      {mood === "angry" && (
        <g stroke={C.ink} strokeWidth="3" strokeLinecap="round">
          <path d="M40 46 L54 51" />
          <path d="M80 46 L66 51" />
        </g>
      )}
      <ellipse cx="37" cy="70" rx="6" ry="3.5" fill={C.pink} opacity="0.75" />
      <ellipse cx="83" cy="70" rx="6" ry="3.5" fill={C.pink} opacity="0.75" />
      <ellipse cx="60" cy="68" rx="4.6" ry="3.4" fill={C.nose} />
      {mood === "wow" ? (
        <ellipse cx="60" cy="78" rx="4" ry="5" fill="#4a2333" />
      ) : mood === "angry" ? (
        <path d="M53 79 q7 -5 14 0" stroke="#4a4a5e" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M53 74 q3.5 4 7 0 q3.5 4 7 0" stroke="#4a4a5e" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      <g stroke="#9aa1b2" strokeWidth="1.4" strokeLinecap="round">
        <path d="M40 68 L21 64" />
        <path d="M40 72 L20 73" />
        <path d="M80 68 L99 64" />
        <path d="M80 72 L100 73" />
      </g>
    </>
  );
  const motion = pose === "run" ? "fs-run" : pose === "nibble" ? "fs-nibble" : "fs-bob";
  return <g className={motion}>{body}</g>;
}

function Squeak({ x, y, s = 1, shadow = true, intro, ...p }: { x: number; y: number; s?: number; shadow?: boolean; intro?: boolean } & Parameters<typeof FlatSqueak>[0]) {
  return (
    <g>
      {shadow && <ellipse className="fs-shadow" cx={x + 60 * s} cy={y + 131 * s} rx={34 * s} ry={6 * s} fill="#000" />}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <g className={intro ? "fs-pop" : undefined} style={intro ? { animationDelay: "0.15s" } : undefined}>
          <FlatSqueak {...p} />
        </g>
      </g>
    </g>
  );
}

const BAR_COLORS = [C.purple, C.teal, C.yellow, C.coral];

function IsoCard({ x, y, w, h, rows = 4, delay = 0, wave }: { x: number; y: number; w: number; h: number; rows?: number; delay?: number; wave?: boolean }) {
  const pad = 10;
  const rowH = (h - 24 - pad) / rows;
  return (
    <g transform={`translate(${x} ${y}) matrix(0.94 0.34 0 1 0 0)`}>
      <rect x="0" y="6" width={w} height={h} rx="10" fill={C.cardEdge} />
      <rect x="0" y="0" width={w} height={h} rx="10" fill={C.card} />
      <rect x="0" y="0" width={w} height="18" rx="10" fill={C.cardTop} />
      <rect x="0" y="10" width={w} height="8" fill={C.cardTop} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={11 + i * 9} cy="9" r="2.6" fill={["#ff6f6f", C.yellow, C.teal][i]} />
      ))}
      {Array.from({ length: rows }, (_, i) =>
        wave ? (
          <g key={i}>
            {Array.from({ length: Math.floor((w - pad * 2) / 7) }, (_, k) => {
              const amp = Math.round((Math.abs(Math.sin(k * 0.9 + i * 2)) * 0.8 + 0.2) * (rowH - 6));
              return <rect key={k} className="fs-bar" style={{ animationDelay: `${(delay + k * 0.03).toFixed(2)}s` }} x={pad + k * 7} y={Math.round(24 + i * rowH + (rowH - amp) / 2)} width="4" height={amp} rx="2" fill={C.teal} opacity={0.85} />;
            })}
          </g>
        ) : (
          <rect
            key={i}
            className="fs-bar"
            style={{ animationDelay: `${(delay + i * 0.35).toFixed(2)}s` }}
            x={pad + ((i * 37) % 40)}
            y={Math.round(24 + i * rowH + 2)}
            width={w - pad * 2 - ((i * 37) % 40) - ((i * 23) % 30)}
            height={Math.round(rowH - 5)}
            rx="4"
            fill={BAR_COLORS[i % BAR_COLORS.length]}
          />
        ),
      )}
    </g>
  );
}

const ICONS: Record<string, ReactNode> = {
  play: <path d="M-5 -8 L9 0 L-5 8 Z" fill="#fff" />,
  scissors: (
    <g stroke="#3a2500" strokeWidth="2.4" fill="none" strokeLinecap="round">
      <circle cx="-5" cy="5" r="3.6" />
      <circle cx="5" cy="5" r="3.6" />
      <path d="M-3 2 L7 -9 M3 2 L-7 -9" />
    </g>
  ),
  film: (
    <g fill="#0f3d3b">
      <rect x="-9" y="-7" width="18" height="14" rx="2" fill="none" stroke="#0f3d3b" strokeWidth="2.2" />
      <rect x="-7" y="-5" width="3" height="2.5" />
      <rect x="-7" y="2.5" width="3" height="2.5" />
      <rect x="4" y="-5" width="3" height="2.5" />
      <rect x="4" y="2.5" width="3" height="2.5" />
    </g>
  ),
  fx: <text x="0" y="5" textAnchor="middle" fontSize="15" fontWeight="900" fontStyle="italic" fill="#fff">fx</text>,
  key: <path d="M0 -9 L9 0 L0 9 L-9 0 Z" fill="#3a2500" />,
  note: <path d="M-3 6 a3.5 3 0 1 1 0 -0.1 V-8 L7 -10 V3 a3.5 3 0 1 1 0 -0.1 V-5 L-3 -3" fill="#fff" />,
  heart: <path d="M0 8 C-10 0 -9 -8 -3 -8 C-1 -8 0 -6 0 -5 C0 -6 1 -8 3 -8 C9 -8 10 0 0 8Z" fill="#fff" />,
};

function Badge({ x, y, kind, color, size = 30, delay = 0, tilt = 8, round }: { x: number; y: number; kind: keyof typeof ICONS; color: string; size?: number; delay?: number; tilt?: number; round?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="fs-float" style={{ animationDelay: `${delay}s`, "--r": `${tilt}deg` } as CSSProperties}>
        <rect x={-size / 2} y={-size / 2 + 4} width={size} height={size} rx={round ? size / 2 : size * 0.28} fill="#000" opacity="0.25" />
        <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={round ? size / 2 : size * 0.28} fill={color} />
        <g transform={`scale(${size / 30})`}>{ICONS[kind]}</g>
      </g>
    </g>
  );
}

function Sparkle({ x, y, s = 1, delay = 0, color = "#fff" }: { x: number; y: number; s?: number; delay?: number; color?: string }) {
  return <path className="gem-twinkle" style={{ animationDelay: `${delay}s` }} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill={color} />;
}

function Frame({ children, className, viewBox = "0 0 400 320" }: { children: ReactNode; className?: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} className={clsx("fs overflow-visible", className)} role="img" aria-label="Squeak">
      {children}
    </svg>
  );
}

function Blob({ cx = 200, cy = 175, r = 130, color = C.purple }: { cx?: number; cy?: number; r?: number; color?: string }) {
  return <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.09" />;
}

export function HeroScene({ className, intro }: { className?: string; intro?: boolean }) {
  const pop = (d: number) => (intro ? { className: "fs-pop", style: { animationDelay: `${d}s` } } : {});
  return (
    <Frame className={className}>
      <Blob />
      <g {...pop(0.25)}><IsoCard x={28} y={70} w={150} h={112} /></g>
      <g {...pop(0.4)}><IsoCard x={240} y={36} w={118} h={74} rows={2} wave delay={0.6} /></g>
      <Squeak x={131} y={118} s={1.15} intro={intro} />
      <g {...pop(0.55)}>
        <Badge x={330} y={168} kind="play" color={C.purpleDeep} round delay={0.2} />
        <Badge x={62} y={238} kind="scissors" color={C.yellow} delay={0.9} tilt={-10} />
        <Badge x={318} y={250} kind="film" color={C.teal} delay={1.5} />
        <Badge x={214} y={44} kind="fx" color={C.nose} size={26} delay={0.5} tilt={-6} />
        <Badge x={112} y={34} kind="key" color={C.yellow} size={24} delay={2} />
      </g>
      <Sparkle x={262} y={150} delay={0.3} />
      <Sparkle x={96} y={196} s={0.7} delay={1.4} color={C.yellow} />
      <Sparkle x={360} y={110} s={0.8} delay={2.2} color={C.teal} />
    </Frame>
  );
}

export function WaveScene({ className, bubble }: { className?: string; bubble?: string }) {
  return (
    <Frame className={className} viewBox="0 0 300 280">
      <Blob cx={150} cy={160} r={115} color={bubble ?? C.purple} />
      <Squeak x={84} y={100} s={1.1} pose="wave" mood="wow" />
      <g transform="translate(206 70)">
        <g className="fs-float" style={{ "--r": "-4deg" } as CSSProperties}>
          <rect x="-34" y="-24" width="68" height="44" rx="16" fill={bubble ?? C.purpleDeep} />
          <path d="M-18 18 L-26 32 L-6 20Z" fill={bubble ?? C.purpleDeep} />
          {[-14, 0, 14].map((dx, i) => <circle key={dx} className="gem-twinkle" style={{ animationDelay: `${i * 0.25}s`, animationDuration: "1.4s" }} cx={dx} cy="-2" r="4.5" fill="#fff" />)}
        </g>
      </g>
      <Badge x={52} y={70} kind="heart" color={C.nose} size={26} delay={0.4} round />
      <Sparkle x={250} y={190} delay={0.8} color={C.yellow} />
    </Frame>
  );
}

function SlideScene() {
  return (
    <Frame>
      <Blob />
      <IsoCard x={40} y={60} w={210} h={150} rows={5} />
      <Squeak x={246} y={128} s={1} pose="wave" />
      <Badge x={330} y={70} kind="scissors" color={C.yellow} delay={0.6} />
      <Sparkle x={70} y={250} delay={1} color={C.teal} />
    </Frame>
  );
}

function ClapScene() {
  return (
    <Frame>
      <Blob color={C.yellow} />
      <g transform="translate(46 128)">
        <rect x="0" y="34" width="150" height="104" rx="10" fill="#26243a" />
        <rect x="0" y="34" width="150" height="26" fill="#f2f2f7" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${8 + i * 30} 34 l16 0 l-10 26 l-16 0z`} fill="#26243a" />)}
        <rect x="16" y="78" width="70" height="8" rx="4" fill={C.purple} />
        <rect x="16" y="96" width="110" height="8" rx="4" fill="#4a4870" />
        <rect x="16" y="114" width="90" height="8" rx="4" fill="#4a4870" />
        <g className="fs-clap">
          <rect x="0" y="6" width="150" height="24" rx="4" fill="#f2f2f7" />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${8 + i * 30} 6 l16 0 l-10 24 l-16 0z`} fill="#26243a" />)}
        </g>
      </g>
      <Squeak x={222} y={130} s={1.05} mood="wow" />
      <Sparkle x={210} y={110} delay={0.9} color={C.yellow} s={1.2} />
      <Badge x={330} y={70} kind="play" color={C.purpleDeep} round delay={0.3} />
    </Frame>
  );
}

function CheeseScene() {
  return (
    <Frame>
      <Blob color={C.yellow} />
      <g transform="translate(60 170)">
        <path d="M0 90 L150 90 L150 40 Z" fill="#e8a91e" />
        <path d="M0 90 L150 40 L150 20 L10 78 Z" fill={C.yellow} />
        <path d="M150 20 L150 90 L160 84 L160 26 Z" fill="#c98c10" />
        <circle cx="98" cy="70" r="8" fill="#c98c10" />
        <circle cx="128" cy="58" r="5" fill="#c98c10" />
        <circle cx="60" cy="80" r="4" fill="#c98c10" />
        <circle className="fs-crumb" cx="150" cy="24" r="3" fill={C.yellow} />
        <circle className="fs-crumb" style={{ animationDelay: "0.5s" }} cx="152" cy="30" r="2.4" fill={C.yellow} />
      </g>
      <Squeak x={208} y={120} s={1.05} pose="nibble" />
      <Badge x={330} y={64} kind="heart" color={C.nose} round delay={0.5} size={26} />
      <Sparkle x={86} y={140} delay={1.2} color={C.yellow} />
    </Frame>
  );
}

function KeyframeScene() {
  const xs = [80, 150, 220, 290];
  return (
    <Frame>
      <Blob color={C.teal} />
      <rect x="60" y="236" width="250" height="34" rx="10" fill={C.card} />
      <rect x="70" y="251" width="230" height="4" rx="2" fill="#4a4870" />
      {xs.map((x, i) => (
        <path key={x} className="fs-kf" style={{ animationDelay: `${i * 0.8}s` }} d={`M${x} 243 l10 10 l-10 10 l-10 -10z`} />
      ))}
      <path d="M80 200 C120 120 250 120 290 200" fill="none" stroke="#4a4870" strokeWidth="3" strokeDasharray="5 8" />
      <g transform="translate(80 196)">
        <circle className="fs-ease" r="13" fill={C.purple} />
      </g>
      <Squeak x={150} y={38} s={0.8} mood="wow" shadow={false} />
      <Sparkle x={330} y={120} delay={0.4} color={C.teal} />
    </Frame>
  );
}

function RunScene() {
  return (
    <Frame>
      <Blob />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className="fs-dash" style={{ animationDelay: `${i * 0.22}s` }} x={70 + (i % 2) * 20} y={150 + i * 26} width={40 + i * 8} height="6" rx="3" fill={i % 2 ? C.teal : C.purple} opacity="0.7" />
      ))}
      <Squeak x={150} y={108} s={1.15} pose="run" />
      <Badge x={330} y={84} kind="play" color={C.purpleDeep} round delay={0.2} />
      <Badge x={74} y={70} kind="note" color={C.coral} delay={0.9} size={26} />
    </Frame>
  );
}

function BuildScene({ angry }: { angry?: boolean }) {
  return (
    <Frame>
      <Blob color={C.coral} />
      <g transform="translate(300 186)">
        <path d="M0 -70 L30 30 L-30 30 Z" fill={C.coral} />
        <path d="M-12 -30 L12 -30 L18 -10 L-18 -10Z" fill="#fff" />
        <path d="M-22 4 L22 4 L26 18 L-26 18Z" fill="#fff" />
        <rect x="-40" y="30" width="80" height="10" rx="4" fill="#d9603f" />
      </g>
      <g transform="translate(78 92)">
        <g className="fs-spin">
          <path d="M0 -34 l7 0 l3 9 l8 4 l9 -4 l5 5 l-4 9 l4 8 l9 3 l0 7 l-9 3 l-4 8 l4 9 l-5 5 l-9 -4 l-8 4 l-3 9 l-7 0 l-3 -9 l-8 -4 l-9 4 l-5 -5 l4 -9 l-4 -8 l-9 -3 l0 -7 l9 -3 l4 -8 l-4 -9 l5 -5 l9 4 l8 -4z" transform="translate(-3.5 0)" fill="#4a4870" />
          <circle r="11" fill={C.card} />
        </g>
      </g>
      <Squeak x={128} y={122} s={1.1} pose="hammer" mood={angry ? "angry" : "happy"} />
      <path className="fs-impact" transform="translate(262 238)" d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4Z" fill={C.yellow} />
    </Frame>
  );
}

function AngryScene() {
  return (
    <Frame>
      <Blob color="#ff5f5f" />
      <g transform="translate(286 140)">
        <rect x="-26" y="-46" width="52" height="92" rx="10" fill={C.card} stroke="#4a4870" strokeWidth="4" />
        <rect x="-8" y="-38" width="16" height="4" rx="2" fill="#4a4870" />
        <path d="M-34 -54 L34 54" stroke="#ff5f5f" strokeWidth="8" strokeLinecap="round" />
      </g>
      <Squeak x={96} y={118} s={1.15} mood="angry" />
      {[0, 1, 2].map((i) => (
        <circle key={i} className="fs-rise" style={{ animationDelay: `${i * 0.6}s` }} cx={128 + i * 34} cy="112" r={9 - i} fill="#d6d9e2" />
      ))}
      <Badge x={70} y={70} kind="film" color={C.teal} delay={0.7} size={26} />
    </Frame>
  );
}

function ModScene() {
  return (
    <Frame viewBox="0 0 320 280">
      <Blob cx={160} cy={160} r={115} color="#ff5f5f" />
      <Squeak x={90} y={104} s={1.1} pose="hammer" ban mood="angry" />
      <path className="fs-impact" transform="translate(230 222)" d="M0 -16 L5 -5 L16 0 L5 5 L0 16 L-5 5 L-16 0 L-5 -5Z" fill={C.yellow} />
    </Frame>
  );
}

export type SiteSceneName = "slide" | "clap" | "cheese" | "keyframe" | "run" | "construction" | "maintenance" | "discord" | "angry";

export function SiteScene({ name, className }: { name: SiteSceneName; className?: string }) {
  const scene = {
    slide: <SlideScene />,
    clap: <ClapScene />,
    cheese: <CheeseScene />,
    keyframe: <KeyframeScene />,
    run: <RunScene />,
    construction: <BuildScene />,
    maintenance: <BuildScene />,
    discord: <WaveScene bubble="#5865F2" className="h-full w-full" />,
    angry: <AngryScene />,
  }[name];
  return <div className={clsx("[&>svg]:h-full [&>svg]:w-full", className)}>{scene}</div>;
}

export function LoungeHero({ className }: { className?: string }) {
  return (
    <div className={clsx("grid place-items-center", className)}>
      <HeroScene className="h-full max-h-full w-full" />
    </div>
  );
}

export function ModSqueakScene({ className }: { className?: string }) {
  return (
    <div className={clsx("[&>svg]:h-full [&>svg]:w-full", className)}>
      <ModScene />
    </div>
  );
}

export function Squeak3D({ mode = "turntable", className }: { mode?: "turntable" | "flip" | "spin"; className?: string }) {
  if (mode === "flip") return <WaveScene className={className} />;
  return <HeroScene className={className} intro={mode === "spin"} />;
}
