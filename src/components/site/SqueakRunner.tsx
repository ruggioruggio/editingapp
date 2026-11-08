"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/settings/i18n";

const W = 256;
const H = 96;
const GROUND = 80;
const GRAVITY = 900;
const JUMP = 245;
const SHORT_HOP = 170;
const MOUSE_X = 24;
const HI_KEY = "squeak-runner-hi";

const PALETTE: Record<string, string> = {
  g: "#c3cad8",
  d: "#8e97ab",
  p: "#f5a3b8",
  k: "#15151b",
  w: "#eceff4",
  n: "#ff6f9a",
  c: "#3f9b4f",
  e: "#2a6e3a",
  r: "#8a7a66",
  s: "#6b5c4b",
  v: "#3b2f3f",
  y: "#e8a33a",
};

const MOUSE_TOP = [
  "...........dd.....",
  "..........dppd....",
  "..........dppdgg..",
  ".........ggddgggg.",
  ".....ggggggggggkgg",
  "...gggggggggggggnn",
  "..ggggggggggggggg.",
  "p.ggwwwwwwwggggg..",
  ".pggwwwwwwwgggg...",
  "..pgggggggggg.....",
];
const MOUSE_DEAD_EYE = [".....ggggggggggdgg"];
const LEGS = {
  a: ["....pp.....pp.....", "....ppp.....ppp..."],
  b: [".....pp..pp.......", ".....pp..ppp......"],
  air: ["...pp.......pp....", "..pp.........pp..."],
};

const SPRITES = {
  cactusS: ["...ce..", ".c.ce..", ".c.ce.e", ".c.ce.e", ".ccce.e", "...ceee", "...ce..", "...ce..", "...ce..", "...ce.."],
  cactusL: ["....ce...", "....ce...", ".c..ce...", ".c..ce..e", ".c..ce..e", ".c..ce..e", ".cc.ce..e", "..ccce.ee", "....ceee.", "....ce...", "....ce...", "....ce...", "....ce...", "....ce...", "....ce..."],
  rock: ["...rrrr...", ".rrrrrrss.", "rrrrrrrrss", "rrrrrrrrss"],
  vultureA: ["...v.......v...", "...vv.....vv...", "....vv...vv....", ".yy..vvvvv.....", ".yyvvvvvvv.....", ".....vvv......."],
  vultureB: ["...............", "...............", ".yy..vvvvv.....", ".yyvvvvvvv.....", "....vv.vvv.vv..", "...vv......vv.."],
};

const FONT: Record<string, string[]> = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
};

const SKY = ["#4d3f7f", "#7a4f8c", "#b4627f", "#e47d62", "#f6ad5b"];

type Kind = keyof typeof SPRITES;
type Obstacle = { kind: Kind; x: number; y: number; w: number; h: number };
type Phase = "ready" | "running" | "over";

function sprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number) {
  const px = Math.round(x);
  const py = Math.round(y);
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = PALETTE[row[rx]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(px + rx, py + ry, 1, 1);
    }
  });
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, color: string, scale = 1) {
  ctx.fillStyle = color;
  [...s].forEach((ch, i) => {
    FONT[ch]?.forEach((row, ry) => {
      for (let rx = 0; rx < 3; rx++) if (row[rx] === "1") ctx.fillRect(x + i * 4 * scale + rx * scale, y + ry * scale, scale, scale);
    });
  });
}

function acacia(ctx: CanvasRenderingContext2D, x: number, base: number, s: number) {
  ctx.fillStyle = "#3a2a4a";
  ctx.fillRect(x + 9 * s, base - 11 * s, 2 * s, 11 * s);
  ctx.fillRect(x + 6 * s, base - 12 * s, 3 * s, s);
  ctx.fillRect(x + 11 * s, base - 13 * s, 3 * s, s);
  ctx.fillRect(x + 2 * s, base - 15 * s, 16 * s, 2 * s);
  ctx.fillRect(x, base - 14 * s, 20 * s, s);
  ctx.fillRect(x + 5 * s, base - 16 * s, 10 * s, s);
}

function background(ctx: CanvasRenderingContext2D, scroll: number) {
  const band = Math.ceil(GROUND / SKY.length);
  SKY.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * band, W, band);
    if (i === 0) return;
    ctx.fillStyle = SKY[i - 1];
    for (let x = i % 2; x < W; x += 2) ctx.fillRect(x, i * band, 1, 1);
  });
  ctx.fillStyle = "#ffe08a";
  for (let dy = -16; dy <= 16; dy++) {
    const half = Math.round(Math.sqrt(256 - dy * dy));
    if (dy > 4 && dy % 3 === 0) continue;
    ctx.fillRect(W - 62 - half, 54 + dy, half * 2, 1);
  }
  ctx.fillStyle = "#6a4a6b";
  for (let x = 0; x < W; x++) {
    const p = x + scroll * 0.08;
    const h = Math.round(6 + Math.sin(p * 0.03) * 4 + Math.sin(p * 0.011) * 3);
    ctx.fillRect(x, GROUND - h, 1, h);
  }
  const offset = scroll * 0.25;
  [20, 130, 215, 300].forEach((tx, i) => {
    const x = ((tx - offset) % 400 + 400) % 400 - 60;
    acacia(ctx, Math.round(x), GROUND, i % 2 ? 1 : 2);
  });
  ctx.fillStyle = "#d9a95a";
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = "#8a6a3a";
  ctx.fillRect(0, GROUND, W, 1);
  for (let i = 0; i < 46; i++) {
    const x = Math.round((((i * 97 - scroll) % 640) + 640) % 640) - 160;
    const y = GROUND + 3 + ((i * 53) % 14);
    ctx.fillStyle = i % 3 ? "#b98a45" : "#ecc77f";
    ctx.fillRect(x, y, i % 4 === 0 ? 3 : 1, 1);
    if (i % 7 === 0) {
      ctx.fillStyle = "#7f8f3a";
      ctx.fillRect(x, GROUND - 2, 1, 2);
      ctx.fillRect(x + 2, GROUND - 3, 1, 3);
      ctx.fillRect(x + 4, GROUND - 1, 1, 1);
    }
  }
}

export function SqueakRunner() {
  const t = useT();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let hi = 0;
    try {
      hi = Number(localStorage.getItem(HI_KEY)) || 0;
    } catch {}

    const s = { phase: "ready" as Phase, y: 0, vy: 0, held: false, scroll: 0, speed: 105, score: 0, gap: 120, since: 0, overAt: 0, obstacles: [] as Obstacle[] };

    const setP = (p: Phase) => {
      s.phase = p;
      el.dataset.phase = p;
      setPhase(p);
    };

    const reset = () => {
      Object.assign(s, { y: 0, vy: 0, speed: 105, score: 0, gap: 120, since: 0, obstacles: [] });
      setP("running");
    };

    const press = () => {
      s.held = true;
      if (s.phase === "over") {
        if (performance.now() - s.overAt > 400) reset();
        return;
      }
      if (s.phase === "ready") reset();
      if (s.y === 0) s.vy = -JUMP;
    };
    const release = () => {
      s.held = false;
      if (s.vy < -SHORT_HOP) s.vy = -SHORT_HOP;
    };

    const spawn = () => {
      const roll = Math.random();
      const add = (kind: Kind, x: number, y?: number) => {
        const rows = SPRITES[kind];
        const h = rows.length;
        s.obstacles.push({ kind, x, y: y ?? GROUND - h, w: rows[0].length, h });
      };
      if (s.score > 150 && roll < 0.2) add("vultureA", W + 4, GROUND - (Math.random() < 0.5 ? 10 : 28));
      else if (roll < 0.45) add("cactusS", W + 4);
      else if (roll < 0.7) add("cactusL", W + 4);
      else if (roll < 0.85) add("rock", W + 4);
      else {
        add("cactusS", W + 4);
        add("cactusL", W + 13);
      }
      s.gap = s.speed * (0.8 + Math.random() * 0.9) + 30;
      s.since = 0;
    };

    const update = (dt: number) => {
      s.speed = Math.min(230, s.speed + dt * 2.8);
      const move = s.speed * dt;
      s.scroll += move;
      s.score += dt * 10 * (s.speed / 105);
      s.since += move;
      if (s.since >= s.gap) spawn();
      s.vy += GRAVITY * dt;
      s.y += s.vy * dt;
      if (s.y >= 0) {
        s.y = 0;
        s.vy = 0;
      }
      const top = GROUND - 12 + s.y;
      for (const o of s.obstacles) {
        o.x -= move * (o.kind === "vultureA" ? 1.12 : 1);
        const hit = MOUSE_X + 15 > o.x + 1 && MOUSE_X + 5 < o.x + o.w - 1 && top + 3 < o.y + o.h - 1 && top + 12 > o.y + 1;
        if (hit) {
          s.overAt = performance.now();
          if (s.score > hi) {
            hi = Math.floor(s.score);
            try {
              localStorage.setItem(HI_KEY, String(hi));
            } catch {}
          }
          setP("over");
          break;
        }
      }
      s.obstacles = s.obstacles.filter((o) => o.x + o.w > -4);
    };

    const draw = () => {
      background(ctx, s.scroll);
      for (const o of s.obstacles) {
        const flap = Math.floor(s.scroll / 18) % 2 === 0;
        sprite(ctx, o.kind === "vultureA" && flap ? SPRITES.vultureB : SPRITES[o.kind], o.x, o.y);
      }
      const moving = s.phase !== "over";
      const legs = s.y < 0 ? LEGS.air : !moving ? LEGS.b : Math.floor(s.scroll / 9) % 2 ? LEGS.a : LEGS.b;
      const top = GROUND - 12 + s.y;
      sprite(ctx, s.phase === "over" ? [...MOUSE_TOP.slice(0, 4), ...MOUSE_DEAD_EYE, ...MOUSE_TOP.slice(5)] : MOUSE_TOP, MOUSE_X, top);
      sprite(ctx, legs, MOUSE_X, top + 10);
      const score = String(Math.floor(s.score)).padStart(5, "0");
      text(ctx, score, W - 24, 5, "#fff3d6");
      if (hi > 0) text(ctx, `HI${String(hi).padStart(5, "0")}`, W - 64, 5, "#ffd9a8");
      if (s.phase !== "running") text(ctx, "404", W / 2 - 22, 12, "#fff3d6", 4);
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (s.phase === "running") update(dt);
      else if (s.phase === "ready" && !reduced) s.scroll += 22 * dt;
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "ArrowUp") return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") release();
    };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      press();
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", release);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="relative w-full max-w-3xl overflow-hidden rounded-lg border-4 border-[#2b2846] shadow-2xl">
      <canvas
        ref={canvas}
        width={W}
        height={H}
        role="img"
        aria-label={t("notFoundTap")}
        className="block w-full cursor-pointer touch-manipulation select-none"
        style={{ imageRendering: "pixelated", aspectRatio: `${W} / ${H}` }}
      />
      {phase !== "running" && (
        <p className="pointer-events-none absolute inset-x-0 top-[58%] px-3 text-center font-mono text-[clamp(0.65rem,2.3vw,0.95rem)] font-bold uppercase tracking-wider text-[#fff3d6] [text-shadow:2px_2px_0_#3a2a4a]">
          {phase === "over" ? t("notFoundOver") : t("notFoundTap")}
        </p>
      )}
    </div>
  );
}
