"use client";

import { useEffect, useMemo, useRef } from "react";

// Animazione di apertura/chiusura del simulatore: una timeline Premiere complessa
// che scorre da sinistra verso destra, come una sequenza che carica.

const RAIL_W = 2600;
const HEAD_W = 54;
const ROW_H = 34;

type Clip = { x: number; w: number; color: string; label?: string; kf?: boolean; xfade?: boolean };
type Track = { name: string; audio: boolean; clips: Clip[] };

// RNG deterministico: layout stabile, nessun mismatch e nessun ricalcolo a ogni frame.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VIDEO_COLORS = ["#6a5acd", "#4a90d9", "#3fa7a0", "#8e6fc9", "#c06c84", "#5b8def"];
const VIDEO_LABELS = ["C0023.MP4", "A007_cut", "drone_4k", "intro.mov", "B-roll_12", "take_07", "GOPR081", "titolo", "logo_anim"];
const AUDIO_LABELS = ["music_mix.wav", "dialogo_01", "ambience", "sfx_whoosh", "vo_takeA"];

function buildTracks(): Track[] {
  const defs: { name: string; audio: boolean }[] = [
    { name: "V3", audio: false },
    { name: "V2", audio: false },
    { name: "V1", audio: false },
    { name: "A1", audio: true },
    { name: "A2", audio: true },
    { name: "A3", audio: true },
  ];
  return defs.map((d, ti) => {
    const rnd = mulberry32(1000 + ti * 97);
    const clips: Clip[] = [];
    let x = Math.floor(rnd() * 90);
    let i = 0;
    while (x < RAIL_W - 40) {
      const w = 110 + Math.floor(rnd() * (d.audio ? 300 : 230));
      const color = d.audio ? "#2f6b45" : VIDEO_COLORS[Math.floor(rnd() * VIDEO_COLORS.length)];
      const labels = d.audio ? AUDIO_LABELS : VIDEO_LABELS;
      clips.push({
        x,
        w: Math.min(w, RAIL_W - x - 8),
        color,
        label: w > 150 ? labels[Math.floor(rnd() * labels.length)] : undefined,
        kf: !d.audio && rnd() > 0.6,
        xfade: !d.audio && rnd() > 0.72,
      });
      x += w + 16 + Math.floor(rnd() * (d.audio ? 50 : 80));
      i += 1;
      if (i > 40) break;
    }
    return { name: d.name, audio: d.audio, clips };
  });
}

// Barre della forma d'onda per le clip audio (deterministiche, altezza variabile).
function waveBars(seed: number, width: number) {
  const rnd = mulberry32(seed);
  const n = Math.max(6, Math.floor(width / 5));
  return Array.from({ length: n }, () => 0.25 + rnd() * 0.75);
}

function Reel() {
  const tracks = useMemo(buildTracks, []);
  const ticks = useMemo(() => Array.from({ length: Math.floor(RAIL_W / 80) }, (_, i) => i * 80), []);
  return (
    <div className="studio-reel__rail" style={{ width: RAIL_W + HEAD_W }}>
      {/* righello temporale */}
      <div className="flex" style={{ height: 22 }}>
        <div style={{ width: HEAD_W }} className="shrink-0 border-r border-[#0b0b0b] bg-[#2b2b2b]" />
        <div className="relative flex-1 bg-[#2b2b2b]">
          {ticks.map((t) => (
            <div key={t} className="absolute top-0 bottom-0" style={{ left: t }}>
              <div className={t % 400 === 0 ? "h-3 w-px bg-[#7a7a7a]" : "h-1.5 w-px bg-[#555]"} />
              {t % 400 === 0 && (
                <span className="absolute left-1 top-1.5 text-[9px] font-medium tabular-nums text-[#8a8a8a]">
                  {`00:00:${String(Math.floor(t / 400) * 2).padStart(2, "0")}:00`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* tracce */}
      {tracks.map((tr, ti) => (
        <div key={tr.name} className="flex" style={{ height: ROW_H }}>
          <div
            style={{ width: HEAD_W }}
            className="flex shrink-0 items-center justify-center border-r border-t border-[#0b0b0b] bg-[#232323] text-[10px] font-bold text-[#9a9a9a]"
          >
            {tr.name}
          </div>
          <div className={`relative flex-1 border-t border-[#0b0b0b] ${ti % 2 ? "bg-[#1d1d1d]" : "bg-[#212121]"}`}>
            {tr.clips.map((c, ci) => (
              <div
                key={ci}
                className="absolute top-[3px] overflow-hidden rounded-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.4)]"
                style={{ left: c.x, width: c.w, height: ROW_H - 6, background: c.color }}
              >
                {/* testata colorata della clip */}
                <div className="h-[6px] w-full" style={{ background: "rgb(255 255 255 / 0.22)" }} />
                {tr.audio ? (
                  <div className="flex h-[calc(100%-6px)] items-center gap-[1px] px-1">
                    {waveBars(ti * 1000 + ci, c.w).map((h, k) => (
                      <div key={k} className="w-px shrink-0 rounded-full bg-[#9ff0b8]" style={{ height: `${h * 70}%`, opacity: 0.8 }} />
                    ))}
                  </div>
                ) : (
                  <>
                    {c.label && (
                      <span className="absolute left-1.5 top-[8px] truncate text-[9px] font-semibold text-white/90" style={{ maxWidth: c.w - 10 }}>
                        {c.label}
                      </span>
                    )}
                    {c.kf && (
                      <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between">
                        {Array.from({ length: Math.max(2, Math.floor(c.w / 60)) }).map((_, k) => (
                          <span key={k} className="h-2 w-2 rotate-45 rounded-[1px] bg-[#ffd24a] shadow-[0_0_3px_rgb(255_210_74/0.8)]" />
                        ))}
                        <span className="absolute left-0 right-0 top-1/2 -z-0 h-px bg-[#ffd24a]/40" />
                      </div>
                    )}
                  </>
                )}
                {c.xfade && <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-black/55 to-transparent" />}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* playhead */}
      <div className="pointer-events-none absolute top-0 bottom-0" style={{ left: HEAD_W + RAIL_W * 0.36 }}>
        <div className="absolute top-0 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-[#e5484d]" />
        <div className="h-full w-px bg-[#e5484d]" />
      </div>
    </div>
  );
}

export function StudioTransition({ onCover, onDone, label }: { onCover?: () => void; onDone: () => void; label?: string }) {
  const coverFired = useRef(false);
  const doneFired = useRef(false);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dur = reduce ? 340 : 900;
    const el = document.documentElement;
    el.style.setProperty("--reel-dur", `${dur}ms`);
    const tCover = window.setTimeout(() => {
      if (!coverFired.current) { coverFired.current = true; onCover?.(); }
    }, dur * 0.42);
    const tDone = window.setTimeout(() => {
      if (!doneFired.current) { doneFired.current = true; onDone(); }
    }, dur);
    return () => { window.clearTimeout(tCover); window.clearTimeout(tDone); };
    // onCover/onDone sono stabili per la durata della transizione
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="studio-reel fixed inset-0 z-[80] overflow-hidden bg-[#141414]" aria-hidden>
      <div className="absolute inset-0 flex flex-col justify-center">
        <Reel />
      </div>
      {/* vignetta + badge Premiere */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgb(10 10 10 / 0.7) 100%)" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border-[1.5px] border-[#9999ff] bg-[#00005b] text-base font-black text-[#9999ff]">Pr</span>
        <span className="text-sm font-black tracking-wide text-white/90">{label ?? "Premiere Pro"}</span>
      </div>
    </div>
  );
}
