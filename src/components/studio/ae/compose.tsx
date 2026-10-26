"use client";

import type { CSSProperties, ReactNode } from "react";
import { valueAt } from "@/lib/studio/anim";
import { BLEND_MODES, getEffect, runEffects } from "@/lib/studio/effects";
import { fileUrl } from "@/lib/studio/media";
import { textCss } from "@/lib/studio/text";
import { useAe, type AeProject, type Comp, type Layer, type Mask } from "@/lib/studio/ae";
import "@/lib/studio/expressions";
import { FxWrap, MediaContent, SyncedAudio } from "../render";
import { timecode } from "../chrome";

// Disegno di una composizione di After Effects: livelli dal basso verso
// l'alto, genitori, 3D, maschere, effetti, livelli di regolazione e
// composizioni nidificate.

export function layerTransform(l: Layer, t: number, comp: Comp, index: number): { css: CSSProperties; opacity: number; pos: number[]; scale: number[]; rot: number; anchor: number[] } {
  const project = useAe.getState().project;
  // ogni proprietà sa chi è (per thisProperty, value, key()… nelle espressioni)
  const ctx = (path: string) => ({ index, fps: comp.fps, width: comp.width, height: comp.height, host: { project, comp, layerId: l.id, path } });
  const T = l.transform;
  const anchor = valueAt(T.anchor, t, ctx("t.anchor"));
  const pos = valueAt(T.position, t, ctx("t.position"));
  const scale = valueAt(T.scale, t, ctx("t.scale"));
  const rot = valueAt(T.rotation, t, ctx("t.rotation"))[0];
  const opacity = valueAt(T.opacity, t, ctx("t.opacity"))[0] / 100;
  let tr = `translate(${pos[0] - anchor[0]}px, ${pos[1] - anchor[1]}px)`;
  if (l.threeD) {
    const z = pos[2] ?? 0;
    tr = `translate3d(${pos[0] - anchor[0]}px, ${pos[1] - anchor[1]}px, ${-z}px) rotateX(${valueAt(T.rotX, t, ctx("t.rotX"))[0]}deg) rotateY(${valueAt(T.rotY, t, ctx("t.rotY"))[0]}deg)`;
  }
  tr += ` rotate(${rot}deg) scale(${(scale[0] ?? 100) / 100}, ${(scale[1] ?? scale[0] ?? 100) / 100})`;
  return { css: { transformOrigin: `${anchor[0]}px ${anchor[1]}px`, transform: tr, transformStyle: l.threeD ? "preserve-3d" : undefined }, opacity, pos, scale, rot, anchor };
}

/** Maschere come immagine SVG (canale alfa) da usare con mask-image. */
export function maskImage(masks: Mask[], w: number, h: number, t: number): string | undefined {
  const act = masks.filter((m) => m.mode !== "none");
  if (!act.length || !w || !h) return undefined;
  const firstAdd = act[0].mode === "add" || act[0].mode === "intersect";
  const shapes = act
    .map((m, i) => {
      const f = valueAt(m.feather, t)[0];
      const o = valueAt(m.opacity, t)[0] / 100;
      const e = valueAt(m.expansion, t)[0];
      let d: string;
      if (m.kind === "poly") {
        const p = m.path;
        d = p.length >= 4 ? `M${p[0]} ${p[1]}` + Array.from({ length: p.length / 2 - 1 }, (_, k) => `L${p[2 * k + 2]} ${p[2 * k + 3]}`).join("") + "Z" : "";
      } else {
        const [x, y, ww, hh] = [m.path[0] - e, m.path[1] - e, m.path[2] + 2 * e, m.path[3] + 2 * e];
        d = m.kind === "rect" ? `M${x} ${y}h${ww}v${hh}h${-ww}Z` : `M${x} ${y + hh / 2}a${ww / 2} ${hh / 2} 0 1 0 ${ww} 0a${ww / 2} ${hh / 2} 0 1 0 ${-ww} 0Z`;
      }
      if (m.inverted) d = `M-10 -10H${w + 10}V${h + 10}H-10Z` + d;
      const color = m.mode === "subtract" ? "black" : "white";
      return `<path d="${d}" fill="${color}" fill-opacity="${o}" fill-rule="evenodd"${f > 0 ? ` filter="url(#f${i})"` : ""}/>` + (f > 0 ? `<filter id="f${i}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f / 2}"/></filter>` : "");
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${firstAdd ? "black" : "white"}"/>${shapes}</mask></defs><rect width="${w}" height="${h}" fill="black" mask="url(#m)"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function star(points: number, r: number, inner: number) {
  return (
    Array.from({ length: points * 2 }, (_, i) => {
      const a = (Math.PI / points) * i - Math.PI / 2;
      const rr = i % 2 ? inner : r;
      return `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
    }).join("") + "Z"
  );
}

function LayerContent({ l, t, project, playing, depth, comp }: { l: Layer; t: number; project: AeProject; playing: boolean; depth: number; comp: Comp }) {
  switch (l.type) {
    case "solid":
      return <div className="absolute inset-0" style={{ background: l.color }} />;
    case "text": {
      // animatore di testo: lettere visibili fino alla fine dell'intervallo, spaziatura animabile
      const full = l.text || " ";
      const ctx = (path: string) => ({ index: comp.layers.indexOf(l) + 1, fps: comp.fps, width: comp.width, height: comp.height, host: { project, comp, layerId: l.id, path } });
      const range = l.textRange ? Math.max(0, Math.min(100, valueAt(l.textRange, t, ctx("x.range"))[0])) : 100;
      const shown = full.slice(0, Math.round((full.length * range) / 100));
      const tracking = l.tracking ? valueAt(l.tracking, t, ctx("x.tracking"))[0] : 0;
      return (
        <div className="absolute left-0 top-0" style={{ transform: "translate(-50%, -50%)" }}>
          <div style={{ ...textCss(l.textStyle!), letterSpacing: tracking ? `${tracking / 10}px` : undefined }}>
            <span>{shown}</span>
            <span style={{ visibility: "hidden" }}>{full.slice(shown.length)}</span>
          </div>
        </div>
      );
    }
    case "shape": {
      const s = l.shape!;
      const [w, h] = valueAt(s.size, t);
      const r = valueAt(s.roundness, t)[0];
      const sw = valueAt(s.strokeWidth, t)[0];
      const fill = s.fillOn ? s.fill : "none";
      const stroke = s.strokeOn ? s.stroke : "none";
      const pad = sw + 4;
      return (
        <svg className="absolute overflow-visible" style={{ left: -w / 2 - pad, top: -h / 2 - pad, width: w + pad * 2, height: h + pad * 2 }} viewBox={`${-w / 2 - pad} ${-h / 2 - pad} ${w + pad * 2} ${h + pad * 2}`}>
          {s.kind === "rect" ? (
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(r, w / 2, h / 2)} fill={fill} stroke={stroke} strokeWidth={sw} />
          ) : s.kind === "ellipse" ? (
            <ellipse rx={w / 2} ry={h / 2} fill={fill} stroke={stroke} strokeWidth={sw} />
          ) : (
            <path d={star(s.points, Math.min(w, h) / 2, s.kind === "star" ? Math.min(w, h) / 4.4 : (Math.min(w, h) / 2) * Math.cos(Math.PI / s.points))} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          )}
        </svg>
      );
    }
    case "precomp": {
      const sub = l.source ? project.comps[l.source] : undefined;
      if (!sub || depth > 4) return null;
      return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: "transparent" }}>
          <CompFrame comp={sub} project={project} t={t - l.startTime} playing={playing} depth={depth + 1} transparent />
        </div>
      );
    }
    case "footage": {
      const m = l.source ? project.media[l.source] : undefined;
      if (!m || m.kind === "audio") return null;
      const lt = l.reversed ? Math.max(0, m.duration - (t - l.startTime)) : t - l.startTime;
      return (
        <div className="absolute inset-0">
          <MediaContent media={m} t={Math.max(0, Math.min(m.duration - 0.001, lt))} playing={playing} />
        </div>
      );
    }
    default:
      return null;
  }
}

/** Fotogramma di una composizione al tempo t. */
export function CompFrame({ comp, project, t, playing = false, depth = 0, transparent, hideLayers }: { comp: Comp; project: AeProject; t: number; playing?: boolean; depth?: number; transparent?: boolean; hideLayers?: Set<string> }) {
  const solo = comp.layers.some((l) => l.solo);
  const byId = new Map(comp.layers.map((l) => [l.id, l]));
  let below: ReactNode[] = [];
  const order = [...comp.layers].reverse();
  for (const l of order) {
    const index = comp.layers.indexOf(l) + 1;
    if (!l.visible || (solo && !l.solo) || t < l.inPoint || t >= l.outPoint || l.type === "null" || hideLayers?.has(l.id)) continue;
    if (l.type === "footage" && l.source && project.media[l.source]?.kind === "audio") continue;
    const tf = layerTransform(l, t, comp, index);
    const fxList = l.fxOn ? l.effects.filter((e) => !getEffect(e.defId)?.audio) : [];
    const out = runEffects(fxList, { w: l.w || comp.width, h: l.h || comp.height, t, fps: comp.fps, id: `${comp.id}-${l.id}`, name: l.name, timecode: timecode(t, comp.fps), host: { project, comp, layerId: l.id } });
    const mask = maskImage(l.masks, l.w, l.h, t);
    if (l.type === "adjustment") {
      const content = below;
      const masked = mask ? { maskImage: mask, WebkitMaskImage: mask } : {};
      below = [
        <div key={l.id} className="absolute inset-0">
          {content}
          <div className="absolute inset-0" style={{ opacity: tf.opacity, ...masked }}>
            <FxWrap out={out} w={comp.width} h={comp.height} t={t} render={() => content} />
          </div>
        </div>,
      ];
      continue;
    }
    // catena dei genitori: le trasformazioni dei genitori avvolgono il livello
    const chain: Layer[] = [];
    let p = l.parent ? byId.get(l.parent) : undefined;
    let guard = 0;
    while (p && guard++ < 20) {
      chain.unshift(p);
      p = p.parent ? byId.get(p.parent) : undefined;
    }
    let node: ReactNode = (
      <div
        className="absolute left-0 top-0"
        style={{ width: l.w, height: l.h, ...tf.css, opacity: tf.opacity, mixBlendMode: BLEND_MODES[l.blend]?.[1], ...(mask ? { maskImage: mask, WebkitMaskImage: mask } : {}) }}
      >
        <FxWrap out={out} w={l.w || 1} h={l.h || 1} t={t} style={{ overflow: "visible" }} render={(tt) => <LayerContent l={l} t={tt} project={project} playing={playing} depth={depth} comp={comp} />} />
      </div>
    );
    for (let i = chain.length - 1; i >= 0; i--) {
      const pc = layerTransform(chain[i], t, comp, comp.layers.indexOf(chain[i]) + 1);
      node = (
        <div className="absolute left-0 top-0" style={{ width: 0, height: 0, ...pc.css }}>
          {node}
        </div>
      );
    }
    below.push(<div key={l.id}>{node}</div>);
  }
  const any3d = comp.layers.some((l) => l.threeD);
  return (
    <div className="absolute inset-0" style={{ background: transparent ? undefined : comp.bg, perspective: any3d ? 2400 : undefined, transformStyle: any3d ? "preserve-3d" : undefined }}>
      {below}
    </div>
  );
}

/** Audio dei livelli di file importati durante la riproduzione. */
export function CompAudio({ comp, project, t, playing }: { comp: Comp; project: AeProject; t: number; playing: boolean }) {
  if (!playing) return null;
  return (
    <>
      {comp.layers.map((l) => {
        const m = l.source ? project.media[l.source] : undefined;
        const url = m?.file ? fileUrl(m.id) : undefined;
        if (!url || !l.audio || t < l.inPoint || t >= l.outPoint) return null;
        return <SyncedAudio key={l.id} src={url} t={t - l.startTime} playing={playing} volume={Math.pow(10, valueAt(l.audioLevel, t)[0] / 20)} />;
      })}
    </>
  );
}
