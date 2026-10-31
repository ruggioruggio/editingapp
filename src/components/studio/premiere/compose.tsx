"use client";

import type { CSSProperties, ReactNode } from "react";
import { valueAt } from "@/lib/studio/anim";
import { BLEND_MODES, audioGainDb, getEffect, getTransition, runEffects } from "@/lib/studio/effects";
import { fileUrl, isStill, type Media } from "@/lib/studio/media";
import { textCss } from "@/lib/studio/text";
import { clipAt, mediaTime, transRange, videoTracks, audioTracks, type Clip, type GraphicLayer, type Project, type Sequence } from "@/lib/studio/premiere";
import { FxWrap, MediaContent, SyncedAudio, boxTransform } from "../render";
import { timecode } from "../chrome";

export function GraphicLayers({ layers }: { layers: GraphicLayer[] }) {
  return (
    <>
      {layers.map((g) => (
        <div
          key={g.id}
          className="absolute left-0 top-0"
          style={{ transform: `translate(${g.x}px, ${g.y}px) translate(-50%, -50%) rotate(${g.rotation}deg) scale(${g.scale / 100})`, opacity: g.opacity / 100 }}
        >
          {g.kind === "text" ? (
            <div style={textCss(g.style)}>{g.text || " "}</div>
          ) : (
            <div style={{ width: g.w, height: g.h, background: g.fill, borderRadius: g.kind === "ellipse" ? "50%" : 0 }} />
          )}
        </div>
      ))}
    </>
  );
}

export function boxSize(m: Media | undefined, s: Sequence) {
  if (!m || m.kind === "graphic" || m.kind === "adjustment" || !m.width) return { bw: s.width, bh: s.height };
  return { bw: m.width, bh: m.height };
}

export function motionAt(c: Clip, lt: number) {
  const s = valueAt(c.motion.scale, lt)[0];
  const sw = c.motion.uniform ? s : valueAt(c.motion.scaleW, lt)[0];
  return { position: valueAt(c.motion.position, lt), scale: [sw, s], rotation: valueAt(c.motion.rotation, lt)[0], anchor: valueAt(c.motion.anchor, lt) };
}

export function ClipLayer({ c, seq, project, T, playing, style }: { c: Clip; seq: Sequence; project: Project; T: number; playing: boolean; style?: CSSProperties }) {
  const m = project.media[c.mediaId];
  if (!m) return null;
  const lt = T - c.start;
  const limit = isStill(m) ? Infinity : m.duration;
  const mt = Math.max(0, Math.min(limit - 0.001, mediaTime(c, T)));
  const { bw, bh } = boxSize(m, seq);
  const mo = motionAt(c, lt);
  const op = valueAt(c.opacity, lt)[0] / 100;
  const out = runEffects(c.effects.filter((e) => !getEffect(e.defId)?.audio), { w: bw, h: bh, t: lt, fps: seq.fps, id: c.id, name: c.name, timecode: timecode(T, seq.fps) });
  return (
    <div className="absolute left-0 top-0" style={{ width: bw, height: bh, ...boxTransform({ ...mo }), opacity: op * (style?.opacity === undefined ? 1 : Number(style.opacity)), mixBlendMode: BLEND_MODES[c.blend]?.[1], ...style, ...(style?.opacity !== undefined ? { opacity: op * Number(style.opacity) } : {}) }}>
      <FxWrap
        out={out}
        w={bw}
        h={bh}
        t={mt}
        render={(tt) => (c.graphic ? <GraphicLayers layers={c.graphic} /> : <MediaContent media={m} t={tt} playing={playing} rate={c.reverse ? -c.speed : c.speed} />)}
      />
    </div>
  );
}

export function SequenceFrame({ seq, project, t, playing = false }: { seq: Sequence; project: Project; t: number; playing?: boolean }) {
  let below: ReactNode[] = [];
  for (const track of videoTracks(seq)) {
    if (track.off) continue;
    const onTrack = seq.clips.filter((c) => c.track === track.id && c.enabled);
    let done = false;
    for (const c of onTrack) {
      for (const side of ["in", "out"] as const) {
        const r = transRange(seq, c, side);
        if (!r || t < r.from || t >= r.to) continue;
        const tr = getTransition((side === "in" ? c.tIn : c.tOut)!.defId);
        const p = (t - r.from) / (r.to - r.from);
        const fx = tr?.render?.(p) ?? { b: { opacity: p } };
        const A = side === "in" ? r.prev : c;
        const B = side === "in" ? c : undefined;
        const a = A && <ClipLayer key={A.id + "a"} c={A} seq={seq} project={project} T={t} playing={playing} />;
        const b = B && <ClipLayer key={B.id + "b"} c={B} seq={seq} project={project} T={Math.max(B.start, t)} playing={playing} />;
        const aStyle: CSSProperties = { ...(fx.a ?? {}), ...(side === "out" ? { opacity: 1 - p } : {}) };
        const bStyle: CSSProperties = { ...(fx.b ?? {}), ...(side === "in" && !r.prev && !fx.b?.opacity && !fx.b?.clipPath && !fx.b?.transform && !fx.b?.maskImage ? { opacity: p } : {}) };
        const aEl = a && (
          <div key="ta" className="absolute inset-0" style={aStyle}>
            {a}
          </div>
        );
        const bEl = b && (
          <div key="tb" className="absolute inset-0" style={bStyle}>
            {b}
          </div>
        );
        below.push(
          <div key={c.id + side + "tr"} className="absolute inset-0" style={fx.wrap}>
            {fx.bOnTop === false ? [bEl, aEl] : [aEl, bEl]}
            {fx.over && <div className="absolute inset-0" style={fx.over} />}
          </div>,
        );
        done = true;
        break;
      }
      if (done) break;
    }
    if (done) continue;
    const c = clipAt(seq, track.id, t);
    if (!c || !c.enabled) continue;
    const m = project.media[c.mediaId];
    if (m?.kind === "adjustment") {
      const lt = t - c.start;
      const out = runEffects(c.effects.filter((e) => !getEffect(e.defId)?.audio), { w: seq.width, h: seq.height, t: lt, fps: seq.fps, id: c.id, name: c.name, timecode: timecode(t, seq.fps) });
      const op = valueAt(c.opacity, lt)[0] / 100;
      const content = below;
      below = [
        <div key={c.id + "adj"} className="absolute inset-0">
          {op < 1 && <div className="absolute inset-0">{content}</div>}
          <FxWrap out={out} w={seq.width} h={seq.height} t={lt} style={{ opacity: op }} render={() => content} />
        </div>,
      ];
      continue;
    }
    below.push(<ClipLayer key={c.id} c={c} seq={seq} project={project} T={t} playing={playing} />);
  }
  return <>{below}</>;
}

export function SequenceAudio({ seq, project, t, playing }: { seq: Sequence; project: Project; t: number; playing: boolean }) {
  if (!playing) return null;
  const solo = audioTracks(seq).some((a) => a.solo);
  const els: ReactNode[] = [];
  for (const track of audioTracks(seq)) {
    if (track.off || (solo && !track.solo)) continue;
    const c = clipAt(seq, track.id, t);
    if (!c || !c.enabled) continue;
    const m = project.media[c.mediaId];
    const url = m?.file ? fileUrl(m.id) : undefined;
    if (!url) continue;
    const db = valueAt(c.volume, t - c.start)[0] + audioGainDb(c.effects, t - c.start) + seq.master;
    els.push(<SyncedAudio key={c.id} src={url} t={mediaTime(c, t)} playing={playing} volume={Math.pow(10, db / 20)} rate={c.speed} />);
  }
  return <>{els}</>;
}

export function meterLevels(seq: Sequence, project: Project, t: number, playing: boolean): [number, number] {
  const solo = audioTracks(seq).some((a) => a.solo);
  let sum = 0;
  for (const track of audioTracks(seq)) {
    if (track.off || (solo && !track.solo)) continue;
    const c = clipAt(seq, track.id, t);
    if (!c || !c.enabled) continue;
    const m = project.media[c.mediaId];
    const db = valueAt(c.volume, t - c.start)[0] + audioGainDb(c.effects, t - c.start) + seq.master;
    const mt = mediaTime(c, t);
    const env = m?.subject === "music" ? 0.7 + 0.3 * Math.abs(Math.sin(mt * 7.3)) : m?.subject === "person" ? 0.4 + 0.6 * Math.abs(Math.sin(mt * 9) * Math.sin(mt * 2.1)) : 0.5 + 0.5 * Math.abs(Math.sin(mt * 5));
    sum += Math.pow(10, (db - 9) / 20) * env;
  }
  if (!sum) return [-Infinity, -Infinity];
  const jitter = playing ? Math.sin(t * 31) * 0.08 : 0;
  const l = 20 * Math.log10(sum * (1 + jitter));
  return [l, 20 * Math.log10(sum * (1 - jitter * 0.7))];
}

