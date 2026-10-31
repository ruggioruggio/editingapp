import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cloneProp, keyedValue, prop, shiftKeys, uid, type Prop } from "./anim";
import { newEffect, type EffectInstance } from "./effects";
import { SAMPLE_LIBRARY, isStill, type Media } from "./media";
import { defaultTextStyle, type TextStyle } from "./text";

export const EPS = 1e-6;

export const LABELS: [string, string][] = [
  ["Viola", "#a59ee6"],
  ["Iris", "#6f7fd8"],
  ["Caraibi", "#1f6b86"],
  ["Lavanda", "#a774c9"],
  ["Ceruleo", "#2f9bc9"],
  ["Foresta", "#4c8f55"],
  ["Rosa", "#c45d9b"],
  ["Mango", "#d48a2c"],
  ["Rosso", "#c74646"],
  ["Giallo", "#c9b33f"],
];

export const MARKER_COLORS = ["#4fbf5a", "#e04646", "#e8862a", "#e8d43a", "#ffffff", "#3d8cf0", "#2fc1c1", "#d966d6"];

export interface Track {
  id: string;
  kind: "video" | "audio";
  name: string;
  locked: boolean;
  off: boolean;
  solo: boolean;
  sync: boolean;
  target: boolean;
  height: number;
}

export interface Marker {
  id: string;
  t: number;
  name: string;
  color: number;
  comment: string;
}

export interface Trans {
  defId: string;
  dur: number;
}

export interface GraphicLayer {
  id: string;
  name: string;
  kind: "text" | "rect" | "ellipse";
  text: string;
  style: TextStyle;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  rotation: number;
  scale: number;
  opacity: number;
}

export interface Motion {
  position: Prop;
  scale: Prop;
  scaleW: Prop;
  uniform: boolean;
  rotation: Prop;
  anchor: Prop;
  flicker: Prop;
}

export interface Clip {
  id: string;
  mediaId: string;
  track: string;
  start: number;
  in: number;
  out: number;
  speed: number;
  reverse: boolean;
  enabled: boolean;
  linkId?: string;
  name: string;
  label: number;
  motion: Motion;
  opacity: Prop;
  blend: number;
  volume: Prop;
  pan: Prop;
  effects: EffectInstance[];
  tIn?: Trans;
  tOut?: Trans;
  graphic?: GraphicLayer[];
  freeze?: number;
}

export interface Sequence {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  tracks: Track[];
  clips: Clip[];
  markers: Marker[];
  inPoint: number | null;
  outPoint: number | null;
  patchV: string | null;
  patchA: string | null;
  master: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  type: "bin" | "media" | "sequence";
  parent: string | null;
  ref?: string;
  label: number;
}

export interface Project {
  name: string;
  items: ProjectItem[];
  media: Record<string, Media>;
  sequences: Record<string, Sequence>;
}

export const clipDur = (c: Clip) => (c.out - c.in) / c.speed;
export const clipEnd = (c: Clip) => c.start + clipDur(c);
export const seqDuration = (s: Sequence) => s.clips.reduce((m, c) => Math.max(m, clipEnd(c)), 0);
export const snapFrame = (t: number, fps: number) => Math.round(t * fps) / fps;
export const videoTracks = (s: Sequence) => s.tracks.filter((t) => t.kind === "video");
export const audioTracks = (s: Sequence) => s.tracks.filter((t) => t.kind === "audio");
export const trackOf = (s: Sequence, id: string) => s.tracks.find((t) => t.id === id)!;
export const isVideoTrack = (s: Sequence, id: string) => trackOf(s, id)?.kind === "video";
export const trackLabel = (s: Sequence, id: string) => {
  const t = trackOf(s, id);
  if (!t) return "?";
  const list = t.kind === "video" ? videoTracks(s) : audioTracks(s);
  return (t.kind === "video" ? "V" : "A") + (list.indexOf(t) + 1);
};

export function mediaTime(c: Clip, T: number) {
  if (c.freeze !== undefined) return c.freeze;
  const d = (T - c.start) * c.speed;
  return c.reverse ? c.out - d : c.in + d;
}

export function linked(s: Sequence, id: string, linkedSel = true): Clip[] {
  const c = s.clips.find((x) => x.id === id);
  if (!c) return [];
  return c.linkId && linkedSel ? s.clips.filter((x) => x.linkId === c.linkId) : [c];
}

export function clipAt(s: Sequence, track: string, t: number) {
  return s.clips.find((c) => c.track === track && t >= c.start - EPS && t < clipEnd(c) - EPS);
}

const unlocked = (s: Sequence, trackId: string) => !trackOf(s, trackId)?.locked;
const limitOf = (m: Media | undefined) => (!m || isStill(m) ? Infinity : m.duration);
const syncOf = (s: Sequence, trackId: string) => !!trackOf(s, trackId)?.sync;

function mkTrack(kind: "video" | "audio", n: number): Track {
  return { id: uid(kind === "video" ? "v" : "a"), kind, name: kind === "video" ? `Video ${n}` : `Audio ${n}`, locked: false, off: false, solo: false, sync: true, target: n === 1, height: 44 };
}
export const makeTrack = mkTrack;

export function newSequence(name: string, width: number, height: number, fps: number, nv = 3, na = 3): Sequence {
  const tracks = [...Array.from({ length: nv }, (_, i) => mkTrack("video", i + 1)), ...Array.from({ length: na }, (_, i) => mkTrack("audio", i + 1))];
  return { id: uid("seq"), name, width, height, fps, tracks, clips: [], markers: [], inPoint: null, outPoint: null, patchV: tracks[0].id, patchA: tracks[nv].id, master: 0 };
}

export function newClip(m: Media, s: Sequence, track: string, start: number, a: number, b: number, linkId?: string): Clip {
  const mw = m.width || s.width;
  const mh = m.height || s.height;
  const synthetic = m.kind === "matte" || m.kind === "black" || m.kind === "bars" || m.kind === "countdown";
  return {
    id: uid("c"),
    mediaId: m.id,
    track,
    start,
    in: a,
    out: b,
    speed: 1,
    reverse: false,
    enabled: true,
    linkId,
    name: m.name,
    label: m.kind === "adjustment" ? 3 : m.kind === "graphic" ? 6 : synthetic ? 4 : m.kind === "image" ? 6 : 2,
    motion: { position: prop(s.width / 2, s.height / 2), scale: prop(100), scaleW: prop(100), uniform: true, rotation: prop(0), anchor: prop(mw / 2, mh / 2), flicker: prop(0) },
    opacity: prop(100),
    blend: 0,
    volume: prop(0),
    pan: prop(0),
    effects: [],
  };
}

export function cloneClip(c: Clip, patch: Partial<Clip> = {}): Clip {
  return {
    ...c,
    id: uid("c"),
    motion: { ...c.motion, position: cloneProp(c.motion.position), scale: cloneProp(c.motion.scale), scaleW: cloneProp(c.motion.scaleW), rotation: cloneProp(c.motion.rotation), anchor: cloneProp(c.motion.anchor), flicker: cloneProp(c.motion.flicker) },
    opacity: cloneProp(c.opacity),
    volume: cloneProp(c.volume),
    pan: cloneProp(c.pan),
    effects: c.effects.map((e) => ({ ...e, id: uid("fx"), params: Object.fromEntries(Object.entries(e.params).map(([k, v]) => [k, cloneProp(v)])) })),
    graphic: c.graphic?.map((g) => ({ ...g, id: uid("g"), style: { ...g.style } })),
    ...patch,
  };
}

export function shiftClipKeys(c: Clip, dt: number): Clip {
  if (!dt) return c;
  return {
    ...c,
    motion: { ...c.motion, position: shiftKeys(c.motion.position, dt), scale: shiftKeys(c.motion.scale, dt), scaleW: shiftKeys(c.motion.scaleW, dt), rotation: shiftKeys(c.motion.rotation, dt), anchor: shiftKeys(c.motion.anchor, dt) },
    opacity: shiftKeys(c.opacity, dt),
    volume: shiftKeys(c.volume, dt),
    pan: shiftKeys(c.pan, dt),
    effects: c.effects.map((e) => ({ ...e, params: Object.fromEntries(Object.entries(e.params).map(([k, v]) => [k, shiftKeys(v, dt)])) })),
  };
}

function clearRange(clips: Clip[], track: string, from: number, to: number, keep: Set<string>): Clip[] {
  return clips.flatMap((c): Clip[] => {
    if (c.track !== track || keep.has(c.id)) return [c];
    const end = clipEnd(c);
    if (end <= from + EPS || c.start >= to - EPS) return [c];
    const parts: Clip[] = [];
    if (c.start < from - EPS) parts.push({ ...c, out: c.in + (from - c.start) * c.speed, tOut: undefined });
    if (end > to + EPS) {
      const cut = (to - c.start) * c.speed;
      const right = shiftClipKeys({ ...c, start: to, in: c.in + cut, tIn: undefined }, -(to - c.start));
      parts.push(parts.length ? cloneClip(right, { linkId: undefined }) : right);
    }
    return parts;
  });
}

export function razor(s: Sequence, ids: string[], t: number): Sequence {
  const minLen = 1 / s.fps;
  const targets = new Set(ids);
  const links = new Map<string, string>();
  let changed = false;
  const clips = s.clips.flatMap((c): Clip[] => {
    if (!targets.has(c.id) || !unlocked(s, c.track) || t <= c.start + minLen / 2 || t >= clipEnd(c) - minLen / 2) return [c];
    changed = true;
    const off = (t - c.start) * c.speed;
    let nl: string | undefined;
    if (c.linkId) {
      nl = links.get(c.linkId) ?? uid("l");
      links.set(c.linkId, nl);
    }
    const right = shiftClipKeys(cloneClip(c, { start: t, in: c.reverse ? c.in : c.in + off, out: c.reverse ? c.out - off : c.out, linkId: nl, tIn: undefined }), -(t - c.start));
    return [{ ...c, ...(c.reverse ? { in: c.out - off } : { out: c.in + off }), tOut: undefined }, right];
  });
  return changed ? { ...s, clips } : s;
}

export function deleteClips(s: Sequence, ids: string[], ripple: boolean, linkedSel = true): Sequence {
  const all = new Set(ids.flatMap((id) => linked(s, id, linkedSel).map((c) => c.id)));
  const removed = s.clips.filter((c) => all.has(c.id) && unlocked(s, c.track));
  if (!removed.length) return s;
  const gone = new Set(removed.map((c) => c.id));
  let clips = s.clips.filter((c) => !gone.has(c.id));
  if (ripple) {
    const from = Math.min(...removed.map((c) => c.start));
    const to = Math.max(...removed.map(clipEnd));
    const len = to - from;
    const blocked = clips.some((c) => c.start < to - EPS && clipEnd(c) > from + EPS && syncOf(s, c.track));
    if (!blocked) clips = clips.map((c) => (c.start >= to - EPS && syncOf(s, c.track) && unlocked(s, c.track) ? { ...c, start: c.start - len } : c));
  }
  return { ...s, clips };
}

export function closeGap(s: Sequence, from: number, to: number): Sequence | null {
  if (s.clips.some((c) => c.start < to - EPS && clipEnd(c) > from + EPS && syncOf(s, c.track))) return null;
  return { ...s, clips: s.clips.map((c) => (c.start >= to - EPS && syncOf(s, c.track) && unlocked(s, c.track) ? { ...c, start: c.start - (to - from) } : c)) };
}

export function gapAt(s: Sequence, track: string, t: number): { from: number; to: number } | null {
  const on = s.clips.filter((c) => c.track === track);
  if (on.some((c) => t >= c.start && t < clipEnd(c))) return null;
  const from = Math.max(0, ...on.filter((c) => clipEnd(c) <= t + EPS).map(clipEnd));
  const nexts = on.filter((c) => c.start >= t - EPS).map((c) => c.start);
  if (!nexts.length) return null;
  return { from, to: Math.min(...nexts) };
}

function makeRoom(s: Sequence, at: number, len: number): Clip[] {
  const crossing = s.clips.filter((c) => at > c.start + EPS && at < clipEnd(c) - EPS && syncOf(s, c.track) && unlocked(s, c.track)).map((c) => c.id);
  const cut = razor(s, crossing, at).clips;
  return cut.map((c) => (c.start >= at - EPS && syncOf(s, c.track) && unlocked(s, c.track) ? { ...c, start: c.start + len } : c));
}

export function placeMedia(s: Sequence, m: Media, at: number, a: number, b: number, mode: "insert" | "overwrite", vTrack: string | null, aTrack: string | null): { seq: Sequence; ids: string[] } {
  const dur = b - a;
  const wantsVideo = m.hasVideo && !!vTrack && unlocked(s, vTrack);
  const wantsAudio = m.hasAudio && !!aTrack && unlocked(s, aTrack);
  if (!wantsVideo && !wantsAudio) return { seq: s, ids: [] };
  let clips = mode === "insert" ? makeRoom(s, at, dur) : s.clips;
  if (mode === "overwrite") {
    if (wantsVideo) clips = clearRange(clips, vTrack!, at, at + dur, new Set());
    if (wantsAudio) clips = clearRange(clips, aTrack!, at, at + dur, new Set());
  }
  const linkId = wantsVideo && wantsAudio ? uid("l") : undefined;
  const added: Clip[] = [];
  if (wantsVideo) added.push(newClip(m, s, vTrack!, at, a, b, linkId));
  if (wantsAudio) added.push(newClip(m, s, aTrack!, at, a, b, linkId));
  return { seq: { ...s, clips: [...clips, ...added] }, ids: added.map((c) => c.id) };
}

export function shiftTrack(s: Sequence, trackId: string, delta: number): string {
  const t = trackOf(s, trackId);
  const list = t.kind === "video" ? videoTracks(s) : audioTracks(s);
  const i = Math.max(0, Math.min(list.length - 1, list.indexOf(t) + delta));
  return list[i].id;
}

export function moveClips(s: Sequence, ids: string[], dt: number, trackDelta: number, opts: { insert?: boolean; duplicate?: boolean; anchorVideo: boolean }): Sequence {
  const group = s.clips.filter((c) => ids.includes(c.id) && unlocked(s, c.track));
  if (!group.length) return s;
  const minStart = Math.min(...group.map((c) => c.start));
  const d = Math.max(dt, -minStart);
  const links = new Map<string, string>();
  const moved = group.map((c) => {
    const tr = isVideoTrack(s, c.track) === opts.anchorVideo ? shiftTrack(s, c.track, opts.anchorVideo ? trackDelta : -trackDelta) : c.track;
    if (!opts.duplicate) return { ...c, start: c.start + d, track: tr };
    const nl = c.linkId ? links.get(c.linkId) ?? (links.set(c.linkId, uid("l")), links.get(c.linkId)!) : undefined;
    return cloneClip(c, { start: c.start + d, track: tr, linkId: nl });
  });
  const keep = new Set(opts.duplicate ? [] : group.map((c) => c.id));
  let base: Sequence = { ...s, clips: s.clips.filter((c) => !keep.has(c.id)) };
  if (opts.insert) {
    const at = Math.min(...moved.map((c) => c.start));
    const len = Math.max(...moved.map(clipEnd)) - at;
    base = { ...base, clips: makeRoom(base, at, len) };
  } else {
    let clips = base.clips;
    for (const m of moved) clips = clearRange(clips, m.track, m.start, clipEnd(m), new Set());
    base = { ...base, clips };
  }
  return { ...base, clips: [...base.clips, ...moved] };
}

export function trimEdge(s: Sequence, project: Project, id: string, edge: "in" | "out", time: number, ripple: boolean, linkedSel = true): Sequence {
  const group = linked(s, id, linkedSel).filter((c) => unlocked(s, c.track));
  const ref = group.find((c) => c.id === id);
  if (!ref) return s;
  const limit = limitOf(project.media[ref.mediaId]);
  const minLen = 1 / s.fps;
  const ids = new Set(group.map((c) => c.id));
  const others = s.clips.filter((c) => !ids.has(c.id));

  if (edge === "out") {
    let newDur = Math.max(minLen, time - ref.start);
    newDur = Math.min(newDur, (limit - ref.in) / ref.speed);
    if (!ripple) {
      const next = Math.min(...others.filter((c) => group.some((g) => g.track === c.track) && c.start >= clipEnd(ref) - EPS).map((c) => c.start), Infinity);
      newDur = Math.min(newDur, next - ref.start);
    }
    const delta = newDur - clipDur(ref);
    const oldEnd = clipEnd(ref);
    return {
      ...s,
      clips: s.clips.map((c) => {
        if (ids.has(c.id)) return { ...c, out: c.in + (clipDur(c) + delta) * c.speed };
        if (ripple && c.start >= oldEnd - EPS && syncOf(s, c.track) && unlocked(s, c.track)) return { ...c, start: c.start + delta };
        return c;
      }),
    };
  }

  let d = time - ref.start;
  d = Math.min(d, clipDur(ref) - minLen);
  d = Math.max(d, -ref.in / ref.speed);
  if (!ripple) {
    const prev = Math.max(...others.filter((c) => group.some((g) => g.track === c.track) && clipEnd(c) <= ref.start + EPS).map(clipEnd), 0);
    d = Math.max(d, prev - ref.start);
  }
  const oldEnd = clipEnd(ref);
  return {
    ...s,
    clips: s.clips.map((c) => {
      if (ids.has(c.id)) {
        const nc = shiftClipKeys({ ...c, in: c.in + d * c.speed }, -d);
        return ripple ? nc : { ...nc, start: c.start + d };
      }
      if (ripple && c.start >= oldEnd - EPS && syncOf(s, c.track) && unlocked(s, c.track)) return { ...c, start: c.start - d };
      return c;
    }),
  };
}

export function rollEdit(s: Sequence, project: Project, leftId: string | null, rightId: string | null, delta: number): Sequence {
  const L = leftId ? s.clips.find((c) => c.id === leftId) : undefined;
  const R = rightId ? s.clips.find((c) => c.id === rightId) : undefined;
  const minLen = 1 / s.fps;
  let d = delta;
  if (L) {
    d = Math.max(d, -(clipDur(L) - minLen));
    d = Math.min(d, (limitOf(project.media[L.mediaId]) - L.out) / L.speed);
  }
  if (R) {
    d = Math.min(d, clipDur(R) - minLen);
    d = Math.max(d, -R.in / R.speed);
  }
  return {
    ...s,
    clips: s.clips.map((c) => {
      if (L && (c.id === L.id || (L.linkId && c.linkId === L.linkId))) return { ...c, out: c.out + d * c.speed };
      if (R && (c.id === R.id || (R.linkId && c.linkId === R.linkId))) return shiftClipKeys({ ...c, start: c.start + d, in: c.in + d * c.speed }, -d);
      return c;
    }),
  };
}

export function slipClip(s: Sequence, project: Project, id: string, delta: number): Sequence {
  const c = s.clips.find((x) => x.id === id);
  if (!c) return s;
  const limit = limitOf(project.media[c.mediaId]);
  let d = -delta * c.speed;
  d = Math.max(d, -c.in);
  d = Math.min(d, limit - c.out);
  const ids = new Set(linked(s, id).map((x) => x.id));
  return { ...s, clips: s.clips.map((x) => (ids.has(x.id) ? { ...x, in: x.in + d, out: x.out + d } : x)) };
}

export function slideClip(s: Sequence, project: Project, id: string, delta: number): Sequence {
  const c = s.clips.find((x) => x.id === id);
  if (!c) return s;
  const L = s.clips.find((x) => x.track === c.track && Math.abs(clipEnd(x) - c.start) < 1e-3);
  const R = s.clips.find((x) => x.track === c.track && Math.abs(x.start - clipEnd(c)) < 1e-3);
  let d = delta;
  const minLen = 1 / s.fps;
  if (L) {
    d = Math.max(d, -(clipDur(L) - minLen));
    d = Math.min(d, (limitOf(project.media[L.mediaId]) - L.out) / L.speed);
  } else d = Math.max(d, -c.start);
  if (R) {
    d = Math.min(d, clipDur(R) - minLen);
    d = Math.max(d, -R.in / R.speed);
  }
  return {
    ...s,
    clips: s.clips.map((x) => {
      if (x.id === c.id) return { ...x, start: x.start + d };
      if (L && x.id === L.id) return { ...x, out: x.out + d * x.speed };
      if (R && x.id === R.id) return shiftClipKeys({ ...x, start: x.start + d, in: x.in + d * x.speed }, -d);
      return x;
    }),
  };
}

export function rateStretch(s: Sequence, id: string, edge: "in" | "out", time: number): Sequence {
  const c = s.clips.find((x) => x.id === id);
  if (!c) return s;
  const content = c.out - c.in;
  const minLen = 1 / s.fps;
  const newDur = edge === "out" ? Math.max(minLen, time - c.start) : Math.max(minLen, clipEnd(c) - time);
  const speed = Math.max(0.01, Math.min(100, content / newDur));
  const ids = new Set(linked(s, id).map((x) => x.id));
  return { ...s, clips: s.clips.map((x) => (ids.has(x.id) ? { ...x, speed, start: edge === "in" ? clipEnd(c) - newDur : x.start } : x)) };
}

export function setSpeed(s: Sequence, ids: string[], speed: number, reverse: boolean, ripple: boolean): Sequence {
  let out = s;
  for (const id of ids) {
    const c = out.clips.find((x) => x.id === id);
    if (!c) continue;
    const oldEnd = clipEnd(c);
    let newDur = (c.out - c.in) / speed;
    if (!ripple) {
      const next = Math.min(...out.clips.filter((x) => x.track === c.track && x.id !== c.id && x.start >= oldEnd - EPS).map((x) => x.start), Infinity);
      newDur = Math.min(newDur, next - c.start);
    }
    const delta = c.start + newDur - oldEnd;
    out = {
      ...out,
      clips: out.clips.map((x) => {
        if (x.id === id) return { ...x, speed, reverse, out: x.in + newDur * speed };
        if (ripple && !ids.includes(x.id) && x.start >= oldEnd - EPS && syncOf(out, x.track)) return { ...x, start: x.start + delta };
        return x;
      }),
    };
  }
  return out;
}

export function liftExtract(s: Sequence, extract: boolean): Sequence {
  if (s.inPoint === null || s.outPoint === null || s.outPoint <= s.inPoint) return s;
  const from = s.inPoint;
  const to = s.outPoint;
  let clips = s.clips;
  for (const t of s.tracks.filter((t) => t.target && !t.locked)) clips = clearRange(clips, t.id, from, to, new Set());
  if (extract) {
    const shifting = new Set(s.tracks.filter((t) => (t.target || t.sync) && !t.locked).map((t) => t.id));
    for (const t of s.tracks) if (shifting.has(t.id) && !t.target) clips = clearRange(clips, t.id, from, to, new Set());
    clips = clips.map((c) => (shifting.has(c.track) && c.start >= to - EPS ? { ...c, start: c.start - (to - from) } : c));
  }
  return { ...s, clips, ...(extract ? { outPoint: null } : {}) };
}

export function pasteClips(s: Sequence, clips: Clip[], at: number, insert: boolean): { seq: Sequence; ids: string[]; end: number } {
  if (!clips.length) return { seq: s, ids: [], end: at };
  const base = Math.min(...clips.map((c) => c.start));
  const len = Math.max(...clips.map(clipEnd)) - base;
  const vt = videoTracks(s);
  const at_ = audioTracks(s);
  const lowV = Math.max(0, vt.findIndex((t) => t.target));
  const lowA = Math.max(0, at_.findIndex((t) => t.target));
  const vIdx = clips.map((c) => vt.findIndex((t) => t.id === c.track)).filter((i) => i >= 0);
  const aIdx = clips.map((c) => at_.findIndex((t) => t.id === c.track)).filter((i) => i >= 0);
  const srcV = vIdx.length ? Math.min(...vIdx) : 0;
  const srcA = aIdx.length ? Math.min(...aIdx) : 0;
  const mapTrack = (c: Clip, wasVideo: boolean) => {
    const vi = vt.findIndex((t) => t.id === c.track);
    if (vi >= 0) return vt[Math.min(vt.length - 1, vi - srcV + lowV)].id;
    const ai = at_.findIndex((t) => t.id === c.track);
    if (ai >= 0) return at_[Math.min(at_.length - 1, ai - srcA + lowA)].id;
    return wasVideo ? vt[lowV].id : at_[lowA].id;
  };
  const links = new Map<string, string>();
  const placed = clips.map((c) => {
    const nl = c.linkId ? links.get(c.linkId) ?? (links.set(c.linkId, uid("l")), links.get(c.linkId)!) : undefined;
    return cloneClip(c, { start: at + (c.start - base), track: mapTrack(c, c.track.startsWith("v")), linkId: nl });
  });
  let cl = insert ? makeRoom(s, at, len) : s.clips;
  if (!insert) for (const p of placed) cl = clearRange(cl, p.track, p.start, clipEnd(p), new Set());
  return { seq: { ...s, clips: [...cl, ...placed] }, ids: placed.map((c) => c.id), end: at + len };
}

export function setTransition(s: Sequence, clipId: string, side: "in" | "out", defId: string, dur: number): Sequence {
  const c = s.clips.find((x) => x.id === clipId);
  if (!c) return s;
  if (side === "out") {
    const next = s.clips.find((x) => x.track === c.track && Math.abs(x.start - clipEnd(c)) < 1e-3);
    if (next) return setTransition(s, next.id, "in", defId, dur);
  }
  const d = Math.min(dur, clipDur(c));
  return { ...s, clips: s.clips.map((x) => (x.id === clipId ? { ...x, [side === "in" ? "tIn" : "tOut"]: { defId, dur: d } } : x)) };
}

export function transRange(s: Sequence, c: Clip, side: "in" | "out"): { from: number; to: number; prev?: Clip } | null {
  const tr = side === "in" ? c.tIn : c.tOut;
  if (!tr) return null;
  if (side === "out") return { from: clipEnd(c) - tr.dur, to: clipEnd(c) };
  const prev = s.clips.find((x) => x.track === c.track && Math.abs(clipEnd(x) - c.start) < 1e-3);
  return prev ? { from: c.start - tr.dur / 2, to: c.start + tr.dur / 2, prev } : { from: c.start, to: c.start + tr.dur };
}

function sampleProject(): Project {
  const media: Record<string, Media> = {};
  const items: ProjectItem[] = [];
  const bins: Record<string, string> = {};
  for (const [folder, name] of [
    ["Video", "Footage"],
    ["Audio", "Audio"],
    ["Grafica", "Graphics"],
  ]) {
    const id = uid("bin");
    bins[folder] = id;
    items.push({ id, name, type: "bin", parent: null, label: 7 });
  }
  const seqBin = uid("bin");
  items.push({ id: seqBin, name: "Sequences", type: "bin", parent: null, label: 7 });
  for (const m of SAMPLE_LIBRARY.filter((x) => x.id !== "s-whoosh" && x.id !== "s-applausi")) {
    const { folder, ...rest } = m;
    media[m.id] = rest;
    items.push({ id: uid("it"), name: m.name, type: "media", parent: bins[folder], ref: m.id, label: m.kind === "audio" ? 5 : m.kind === "image" ? 6 : 2 });
  }
  const matte: Media = { id: uid("m"), name: "Mascherino colore", kind: "matte", duration: 5, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: false, color: "#2b2b6e", still: true };
  media[matte.id] = matte;
  items.push({ id: uid("it"), name: matte.name, type: "media", parent: bins.Grafica, ref: matte.id, label: 4 });

  let main = newSequence("Main Edit", 1920, 1080, 25);
  const [v1, v2] = videoTracks(main);
  const [a1, a2] = audioTracks(main);
  const add = (id: string, at: number, a: number, b: number, vt: string | null, at_: string | null) => {
    const r = placeMedia(main, media[id], at, a, b, "overwrite", vt, at_);
    main = r.seq;
    return r.ids;
  };
  add("s-tramonto", 0, 0, 5, v1.id, a1.id);
  add("s-intervista", 5, 1, 13, v1.id, a1.id);
  const drone = add("s-drone", 13, 2, 8, v1.id, null);
  add("s-titolo", 0.5, 0, 4, v2.id, null);
  const mus = add("s-musica", 0, 0, 19, null, a2.id);
  main = setTransition(main, drone[0], "in", "cross", 1);
  main = { ...main, clips: main.clips.map((c) => (mus.includes(c.id) ? { ...c, volume: prop(-14) } : c)) };
  main.markers = [
    { id: uid("mk"), t: 0, name: "Inizio", color: 0, comment: "" },
    { id: uid("mk"), t: 10, name: "Intervista", color: 1, comment: "" },
    { id: uid("mk"), t: 18, name: "Finale", color: 2, comment: "" },
  ];
  const s2 = newSequence("Sequenza 01", 1920, 1080, 25);
  items.push({ id: uid("it"), name: main.name, type: "sequence", parent: seqBin, ref: main.id, label: 0 });
  items.push({ id: uid("it"), name: s2.name, type: "sequence", parent: seqBin, ref: s2.id, label: 0 });
  return { name: "Progetto senza titolo", items, media, sequences: { [main.id]: main, [s2.id]: s2 } };
}

export type PrTool = "select" | "trackFwd" | "trackBack" | "ripple" | "roll" | "rate" | "razor" | "slip" | "slide" | "pen" | "rect" | "ellipse" | "hand" | "zoom" | "type";
export type PanelId = "source" | "effectControls" | "mixer" | "metadata" | "program" | "properties" | "graphics" | "text" | "project" | "media" | "libraries" | "info" | "effects" | "history" | "tools" | "timeline" | "meters";

export interface MenuEntry {
  label: string;
  keys?: string;
  action?: () => void;
  disabled?: boolean;
  checked?: boolean;
  sub?: MenuItemLike[];
}
export type MenuItemLike = MenuEntry | "-";

export type Dialog =
  | { type: "sequence" }
  | { type: "export" }
  | { type: "keys" }
  | { type: "speed"; ids: string[] }
  | { type: "matte" }
  | { type: "rename"; title: string; value: string; onOk: (v: string) => void }
  | { type: "marker"; id: string }
  | { type: "tracks" }
  | { type: "seqSettings" }
  | { type: "pasteAttr" }
  | { type: "transDur"; clipId: string; side: "in" | "out" }
  | { type: "confirm"; title: string; text: string; onOk: () => void };

export interface PrState {
  project: Project;
  past: { project: Project; label: string }[];
  future: { project: Project; label: string }[];
  lastKey: string | null;
  lastAt: number;
  gesture: Project | null;
  saved: boolean;

  openSeqs: string[];
  activeSeq: string | null;
  playheads: Record<string, number>;
  zooms: Record<string, number>;
  selection: string[];
  selTrans: { clip: string; side: "in" | "out" } | null;
  gap: { track: string; from: number; to: number } | null;
  tool: PrTool;
  snapping: boolean;
  linkedSel: boolean;
  playing: boolean;
  rate: number;

  source: { mediaId: string | null; t: number; in: number | null; out: number | null; playing: boolean };
  bin: string | null;
  projectView: "list" | "icon";
  projectSel: string[];
  projectZoom: number;
  search: string;

  focus: PanelId;
  maximized: PanelId | null;
  mode: "import" | "edit" | "export";
  clipboard: Clip[] | null;
  dialog: Dialog | null;
  menu: { x: number; y: number; items: MenuItemLike[] } | null;
  toast: string | null;
  programZoom: "fit" | number;
  editingText: string | null;
  lastExport: { format: string; width: number; height: number; fps: number; bitrateMbps: number; audioKbps: number } | null;

  commit: (fn: (p: Project) => Project, label: string, key?: string) => void;
  commitSeq: (fn: (s: Sequence) => Sequence, label: string, key?: string) => void;
  beginGesture: () => void;
  updateGesture: (fn: (s: Sequence, p: Project) => Sequence) => void;
  endGesture: (label: string) => void;
  undo: () => void;
  redo: () => void;
  jumpHistory: (index: number) => void;
  set: (patch: Partial<PrState>) => void;
  notify: (msg: string) => void;
  openSequence: (id: string) => void;
  closeSequence: (id: string) => void;
  setPlayhead: (t: number) => void;
  select: (id: string | null, additive?: boolean) => void;
  reset: () => void;
}

export const seqOf = (st: Pick<PrState, "project" | "activeSeq">) => (st.activeSeq ? st.project.sequences[st.activeSeq] ?? null : null);

const initial = sampleProject();
const firstSeq = Object.keys(initial.sequences)[0];

export const usePremiere = create<PrState>()(
  persist(
    (set, get) => ({
      project: initial,
      past: [],
      future: [],
      lastKey: null,
      lastAt: 0,
      gesture: null,
      saved: true,

      openSeqs: [firstSeq],
      activeSeq: firstSeq,
      playheads: { [firstSeq]: 1.64 },
      zooms: {},
      selection: [],
      selTrans: null,
      gap: null,
      tool: "select",
      snapping: true,
      linkedSel: true,
      playing: false,
      rate: 1,

      source: { mediaId: null, t: 0, in: null, out: null, playing: false },
      bin: null,
      projectView: "icon",
      projectSel: [],
      projectZoom: 1,
      search: "",

      focus: "timeline",
      maximized: null,
      mode: "edit",
      clipboard: null,
      dialog: null,
      menu: null,
      toast: null,
      programZoom: "fit",
      editingText: null,
      lastExport: null,

      commit: (fn, label, key) => {
        const { project, past, lastKey, lastAt } = get();
        const next = fn(project);
        if (next === project) return;
        const now = Date.now();
        const merge = !!key && key === lastKey && now - lastAt < 1000 && past.length > 0;
        const seq = seqOf({ project: next, activeSeq: get().activeSeq });
        const alive = new Set(seq?.clips.map((c) => c.id) ?? []);
        set({
          project: next,
          past: merge ? past : [...past, { project, label }].slice(-100),
          future: [],
          lastKey: key ?? null,
          lastAt: now,
          saved: false,
          gap: null,
          selection: get().selection.filter((id) => alive.has(id)),
        });
      },
      commitSeq: (fn, label, key) => {
        const id = get().activeSeq;
        if (!id) return;
        get().commit(
          (p) => {
            const s = p.sequences[id];
            const n = fn(s);
            return n === s ? p : { ...p, sequences: { ...p.sequences, [id]: n } };
          },
          label,
          key,
        );
      },
      beginGesture: () => set({ gesture: get().project }),
      updateGesture: (fn) => {
        const { gesture, activeSeq } = get();
        if (!gesture || !activeSeq) return;
        set({ project: { ...gesture, sequences: { ...gesture.sequences, [activeSeq]: fn(gesture.sequences[activeSeq], gesture) } } });
      },
      endGesture: (label) => {
        const { gesture, project, past } = get();
        if (!gesture) return;
        set({ gesture: null, ...(gesture !== project ? { past: [...past, { project: gesture, label }].slice(-100), future: [], saved: false, lastKey: null } : {}) });
      },
      undo: () => {
        const { past, project, future } = get();
        const prev = past.at(-1);
        if (!prev) return;
        set({ project: prev.project, past: past.slice(0, -1), future: [{ project, label: prev.label }, ...future], selection: [], selTrans: null, lastKey: null });
        get().notify(`Annulla ${prev.label}`);
      },
      redo: () => {
        const { past, project, future } = get();
        const [next, ...rest] = future;
        if (!next) return;
        set({ project: next.project, past: [...past, { project, label: next.label }], future: rest, selection: [], lastKey: null });
        get().notify(`Ripeti ${next.label}`);
      },
      jumpHistory: (index) => {
        const { past, future, project } = get();
        const states = [...past.map((p) => p.project), project, ...future.map((f) => f.project)];
        const labels = [...past.map((p) => p.label), ...future.map((f) => f.label)];
        set({
          project: states[index],
          past: states.slice(0, index).map((p, i) => ({ project: p, label: labels[i] })),
          future: states.slice(index + 1).map((p, i) => ({ project: p, label: labels[index + i] })),
          selection: [],
        });
      },
      set: (patch) => set(patch),
      notify: (msg) => {
        set({ toast: msg });
        setTimeout(() => get().toast === msg && set({ toast: null }), 2400);
      },
      openSequence: (id) => {
        const { openSeqs } = get();
        set({ openSeqs: openSeqs.includes(id) ? openSeqs : [...openSeqs, id], activeSeq: id, selection: [], playing: false });
      },
      closeSequence: (id) => {
        const rest = get().openSeqs.filter((x) => x !== id);
        set({ openSeqs: rest, activeSeq: get().activeSeq === id ? rest.at(-1) ?? null : get().activeSeq, selection: [] });
      },
      setPlayhead: (t) => {
        const id = get().activeSeq;
        if (id) set({ playheads: { ...get().playheads, [id]: Math.max(0, t) } });
      },
      select: (id, additive) => {
        const s = seqOf(get());
        if (!id || !s) return set({ selection: [], gap: null, selTrans: null });
        const ids = linked(s, id, get().linkedSel).map((c) => c.id);
        const cur = get().selection;
        if (additive && cur.includes(id)) return set({ selection: cur.filter((x) => !ids.includes(x)), gap: null, selTrans: null });
        set({ gap: null, selTrans: null, selection: additive ? [...new Set([...cur, ...ids])] : ids });
      },
      reset: () => {
        const p = sampleProject();
        const f = Object.keys(p.sequences)[0];
        set({ project: p, past: [], future: [], openSeqs: [f], activeSeq: f, playheads: { [f]: 0 }, selection: [], playing: false, bin: null, saved: true });
      },
    }),
    {
      name: "studio-premiere-v2",
      partialize: (s) => ({ project: s.project, openSeqs: s.openSeqs, activeSeq: s.activeSeq, playheads: s.playheads, zooms: s.zooms, projectView: s.projectView, snapping: s.snapping, linkedSel: s.linkedSel }),
    },
  ),
);

export const playheadOf = (st: Pick<PrState, "playheads" | "activeSeq">) => (st.activeSeq ? st.playheads[st.activeSeq] ?? 0 : 0);

export const clipVolumeAt = (c: Clip, T: number) => keyedValue(c.volume, T - c.start)[0];

export function newGraphicLayer(kind: GraphicLayer["kind"], x: number, y: number, s: Sequence, text = "Nuovo testo"): GraphicLayer {
  return {
    id: uid("g"),
    name: kind === "text" ? text : kind === "rect" ? "Rettangolo" : "Ellisse",
    kind,
    text,
    style: defaultTextStyle(Math.round(s.height / 10)),
    x,
    y,
    w: s.width / 4,
    h: s.height / 4,
    fill: kind === "text" ? "#ffffff" : "#d64545",
    rotation: 0,
    scale: 100,
    opacity: 100,
  };
}

export const addEffectTo = (c: Clip, defId: string, s: Sequence): Clip => ({ ...c, effects: [...c.effects, newEffect(defId, s.width, s.height)] });
