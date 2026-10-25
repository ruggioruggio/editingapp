import { create } from "zustand";

// Motore del simulatore di Premiere Pro: una sequenza con 3 tracce video e 3
// audio, clip collegate, inserisci/sovrascrivi, sposta, rifila, lama,
// increspatura, effetti di movimento e opacità, transizioni, annulla/ripeti.

export type VideoTrack = "V1" | "V2" | "V3";
export type AudioTrack = "A1" | "A2" | "A3";
export type TrackId = VideoTrack | AudioTrack;
export const VIDEO_TRACKS: VideoTrack[] = ["V3", "V2", "V1"]; // dall'alto, come in timeline
export const AUDIO_TRACKS: AudioTrack[] = ["A1", "A2", "A3"];
export const isVideo = (t: TrackId): t is VideoTrack => t.startsWith("V");

export type Subject = "person" | "city" | "cup" | "sea" | "title" | "logo" | "music";

export interface PrMedia {
  id: string;
  name: string;
  kind: "video" | "audio" | "graphic";
  duration: number;
  hue: number;
  subject: Subject;
  hasAudio: boolean;
  text?: string;
}

export interface Fx {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  volume: number;
}

export interface PrClip {
  id: string;
  mediaId: string;
  track: TrackId;
  start: number;
  in: number;
  out: number;
  linkId?: string;
  fx: Fx;
  transition?: "dissolve" | "dip";
}

export interface PrSequence {
  name: string;
  width: number;
  height: number;
  fps: number;
  clips: PrClip[];
  markers: number[];
}

export type PrTool = "select" | "ripple" | "razor" | "hand";

export const DEFAULT_FX: Fx = { x: 0, y: 0, scale: 100, rotation: 0, opacity: 100, volume: 0 };

export const PR_MEDIA: PrMedia[] = [
  { id: "intervista", name: "A001_Intervista.mp4", kind: "video", duration: 14, hue: 215, subject: "person", hasAudio: true },
  { id: "citta", name: "B-roll_Citta.mp4", kind: "video", duration: 8, hue: 28, subject: "city", hasAudio: true },
  { id: "caffe", name: "B-roll_Caffe.mp4", kind: "video", duration: 6, hue: 20, subject: "cup", hasAudio: false },
  { id: "drone", name: "Drone_Mare.mp4", kind: "video", duration: 10, hue: 195, subject: "sea", hasAudio: false },
  { id: "musica", name: "Musica_Lofi.wav", kind: "audio", duration: 40, hue: 140, subject: "music", hasAudio: true },
  { id: "titolo", name: "Titolo.mogrt", kind: "graphic", duration: 5, hue: 260, subject: "title", hasAudio: false, text: "Il mio video" },
  { id: "logo", name: "Logo_Squeak.png", kind: "graphic", duration: 5, hue: 45, subject: "logo", hasAudio: false, text: "SqueakEdit" },
];

export const getMedia = (id: string) => PR_MEDIA.find((m) => m.id === id)!;

const EPS = 1e-6;
let counter = 0;
const uid = (p = "pc") => `${p}${++counter}${Math.random().toString(36).slice(2, 6)}`;

export const clipDur = (c: PrClip) => c.out - c.in;
export const clipEnd = (c: PrClip) => c.start + clipDur(c);
export const seqDuration = (s: PrSequence) => s.clips.reduce((m, c) => Math.max(m, clipEnd(c)), 0);
export const toFrame = (t: number, fps: number) => Math.round(t * fps) / fps;

export function linked(s: PrSequence, id: string): PrClip[] {
  const c = s.clips.find((x) => x.id === id);
  if (!c) return [];
  return c.linkId ? s.clips.filter((x) => x.linkId === c.linkId) : [c];
}

export function clipAt(s: PrSequence, track: TrackId, t: number) {
  return s.clips.find((c) => c.track === track && t >= c.start - EPS && t < clipEnd(c) - EPS);
}

/** Toglie da una traccia tutto ciò che sta tra from e to (accorciando o dividendo le clip). */
function clearRange(clips: PrClip[], track: TrackId, from: number, to: number, keep: Set<string>): PrClip[] {
  return clips.flatMap((c): PrClip[] => {
    if (c.track !== track || keep.has(c.id)) return [c];
    const end = clipEnd(c);
    if (end <= from + EPS || c.start >= to - EPS) return [c];
    const parts: PrClip[] = [];
    if (c.start < from - EPS) parts.push({ ...c, out: c.in + (from - c.start) });
    if (end > to + EPS) parts.push({ ...c, id: parts.length ? uid() : c.id, start: to, in: c.in + (to - c.start), linkId: parts.length ? undefined : c.linkId });
    return parts;
  });
}

/** Lama su un gruppo di clip collegate. */
export function razor(s: PrSequence, ids: string[], t: number): PrSequence {
  const minLen = 1 / s.fps;
  const targets = new Set(ids);
  const newLink = uid("l");
  let changed = false;
  const clips = s.clips.flatMap((c): PrClip[] => {
    if (!targets.has(c.id) || t <= c.start + minLen || t >= clipEnd(c) - minLen) return [c];
    changed = true;
    const off = t - c.start;
    return [
      { ...c, out: c.in + off },
      { ...c, id: uid(), start: t, in: c.in + off, linkId: c.linkId ? newLink : undefined, transition: undefined },
    ];
  });
  return changed ? { ...s, clips } : s;
}

/** Aggiungi modifica (Ctrl+K): taglia tutte le tracce sotto l'indicatore. */
export function addEditAll(s: PrSequence, t: number): PrSequence {
  const ids = s.clips.filter((c) => t > c.start && t < clipEnd(c)).map((c) => c.id);
  return ids.length ? razor(s, ids, t) : s;
}

export function deleteClips(s: PrSequence, ids: string[], ripple: boolean): PrSequence {
  const all = new Set(ids.flatMap((id) => linked(s, id).map((c) => c.id)));
  const removed = s.clips.filter((c) => all.has(c.id));
  if (!removed.length) return s;
  let clips = s.clips.filter((c) => !all.has(c.id));
  if (ripple) {
    const from = Math.min(...removed.map((c) => c.start));
    const to = Math.max(...removed.map(clipEnd));
    clips = clips.map((c) => (c.start >= to - EPS ? { ...c, start: c.start - (to - from) } : c));
  }
  return { ...s, clips };
}

/** Inserisci (,) o Sovrascrivi (.) una clip dal monitor sorgente. */
export function placeMedia(
  s: PrSequence,
  media: PrMedia,
  at: number,
  srcIn: number,
  srcOut: number,
  mode: "insert" | "overwrite",
  vTrack: VideoTrack,
  aTrack: AudioTrack,
): { seq: PrSequence; ids: string[] } {
  const dur = srcOut - srcIn;
  let clips = s.clips;
  const wantsVideo = media.kind !== "audio";
  const wantsAudio = media.hasAudio;
  if (mode === "insert") {
    // con il blocco sincronia attivo l'inserimento sposta tutte le tracce
    const crossing = clips.filter((c) => at > c.start + EPS && at < clipEnd(c) - EPS).map((c) => c.id);
    clips = razor({ ...s, clips }, crossing, at).clips;
    clips = clips.map((c) => (c.start >= at - EPS ? { ...c, start: c.start + dur } : c));
  } else {
    if (wantsVideo) clips = clearRange(clips, vTrack, at, at + dur, new Set());
    if (wantsAudio) clips = clearRange(clips, aTrack, at, at + dur, new Set());
  }
  const linkId = wantsVideo && wantsAudio ? uid("l") : undefined;
  const added: PrClip[] = [];
  if (wantsVideo) added.push({ id: uid(), mediaId: media.id, track: vTrack, start: at, in: srcIn, out: srcOut, linkId, fx: { ...DEFAULT_FX } });
  if (wantsAudio) added.push({ id: uid(), mediaId: media.id, track: aTrack, start: at, in: srcIn, out: srcOut, linkId, fx: { ...DEFAULT_FX } });
  return { seq: { ...s, clips: [...clips, ...added] }, ids: added.map((c) => c.id) };
}

const shiftTrack = (t: TrackId, delta: number): TrackId => {
  const list: TrackId[] = isVideo(t) ? ["V1", "V2", "V3"] : ["A1", "A2", "A3"];
  const i = Math.max(0, Math.min(2, list.indexOf(t) + delta));
  return list[i];
};

/** Trascina una clip (con le collegate): sovrascrive ciò che trova nella nuova posizione. */
export function moveGroup(s: PrSequence, id: string, newStart: number, trackDelta: number): PrSequence {
  const group = linked(s, id);
  const anchor = group.find((c) => c.id === id)!;
  const minStart = Math.min(...group.map((c) => c.start));
  const delta = Math.max(newStart - anchor.start, -minStart);
  const kindVideo = isVideo(anchor.track);
  const ids = new Set(group.map((c) => c.id));
  const moved = group.map((c) => ({
    ...c,
    start: c.start + delta,
    track: isVideo(c.track) === kindVideo ? shiftTrack(c.track, trackDelta) : c.track,
  }));
  let clips = s.clips.filter((c) => !ids.has(c.id));
  for (const m of moved) clips = clearRange(clips, m.track, m.start, clipEnd(m), ids);
  return { ...s, clips: [...clips, ...moved] };
}

/**
 * Rifila un bordo (con le collegate). Con la Selezione resta un buco o si
 * ferma contro la clip vicina; con l'Increspatura (B) sposta tutto ciò che segue.
 */
export function trimEdge(s: PrSequence, id: string, edge: "in" | "out", time: number, ripple: boolean): PrSequence {
  const group = linked(s, id);
  const ref = group.find((c) => c.id === id)!;
  const media = getMedia(ref.mediaId);
  const minLen = 1 / s.fps;
  const ids = new Set(group.map((c) => c.id));
  const others = s.clips.filter((c) => !ids.has(c.id));

  if (edge === "out") {
    let newOut = Math.min(media.duration, Math.max(ref.in + minLen, ref.in + (time - ref.start)));
    const oldEnd = clipEnd(ref);
    if (!ripple) {
      // non si sovrappone alla clip successiva sulla stessa traccia
      const next = Math.min(...others.filter((c) => group.some((g) => g.track === c.track) && c.start >= oldEnd - EPS).map((c) => c.start), Infinity);
      newOut = Math.min(newOut, ref.in + (next - ref.start));
    }
    const delta = newOut - ref.out;
    const clips = s.clips.map((c) => {
      if (ids.has(c.id)) return { ...c, out: c.out + delta };
      if (ripple && c.start >= oldEnd - EPS) return { ...c, start: c.start + delta };
      return c;
    });
    return { ...s, clips };
  }

  let newIn = Math.max(0, Math.min(ref.out - minLen, ref.in + (time - ref.start)));
  if (!ripple) {
    const prev = Math.max(...others.filter((c) => group.some((g) => g.track === c.track) && clipEnd(c) <= ref.start + EPS).map(clipEnd), 0);
    newIn = Math.max(newIn, ref.in - (ref.start - prev));
  }
  const delta = newIn - ref.in;
  const oldEnd = clipEnd(ref);
  const clips = s.clips.map((c) => {
    if (ids.has(c.id)) return ripple ? { ...c, in: c.in + delta } : { ...c, in: c.in + delta, start: c.start + delta };
    if (ripple && c.start >= oldEnd - EPS) return { ...c, start: c.start - delta };
    return c;
  });
  return { ...s, clips };
}

/** Elimina con increspatura uno spazio vuoto: riesce solo se nessuna traccia ha clip in quel tratto. */
export function closeGap(s: PrSequence, from: number, to: number): PrSequence | null {
  if (s.clips.some((c) => c.start < to - EPS && clipEnd(c) > from + EPS)) return null;
  return { ...s, clips: s.clips.map((c) => (c.start >= to - EPS ? { ...c, start: c.start - (to - from) } : c)) };
}

/** Lo spazio vuoto di una traccia attorno al tempo t (tra due clip). */
export function gapAt(s: PrSequence, track: TrackId, t: number): { from: number; to: number } | null {
  const on = s.clips.filter((c) => c.track === track);
  if (on.some((c) => t >= c.start && t < clipEnd(c))) return null;
  const from = Math.max(0, ...on.filter((c) => clipEnd(c) <= t + EPS).map(clipEnd));
  const nexts = on.filter((c) => c.start >= t - EPS).map((c) => c.start);
  if (!nexts.length) return null;
  return { from, to: Math.min(...nexts) };
}

export function emptySequence(name: string, width: number, height: number, fps: number): PrSequence {
  return { name, width, height, fps, clips: [], markers: [] };
}

// ---------------------------------------------------------------------------

const starter = (): PrSequence => {
  const iv = getMedia("intervista");
  const l1 = uid("l");
  return {
    name: "Sequenza 01",
    width: 1920,
    height: 1080,
    fps: 25,
    markers: [4],
    clips: [
      { id: uid(), mediaId: iv.id, track: "V1", start: 0, in: 1, out: 9, linkId: l1, fx: { ...DEFAULT_FX } },
      { id: uid(), mediaId: iv.id, track: "A1", start: 0, in: 1, out: 9, linkId: l1, fx: { ...DEFAULT_FX } },
      { id: uid(), mediaId: "titolo", track: "V2", start: 0.5, in: 0, out: 3, fx: { ...DEFAULT_FX } },
      { id: uid(), mediaId: "drone", track: "V1", start: 9, in: 2, out: 7, fx: { ...DEFAULT_FX }, transition: "dissolve" },
      { id: uid(), mediaId: "musica", track: "A2", start: 0, in: 0, out: 14, fx: { ...DEFAULT_FX, volume: -14 } },
    ],
  };
};

interface PrState {
  seq: PrSequence;
  past: PrSequence[];
  future: PrSequence[];
  gesture: PrSequence | null;
  selection: string[];
  playhead: number;
  playing: boolean;
  tool: PrTool;
  snapping: boolean;
  pxPerSec: number;
  selectedMedia: string | null;
  source: { t: number; in: number | null; out: number | null };
  dialog: null | "sequence" | "export" | "keys";
  toast: string | null;
  targetV: VideoTrack;
  targetA: AudioTrack;
  /** tracce video nascoste (occhio) e audio disattivate (M) */
  off: TrackId[];
  gap: { track: TrackId; from: number; to: number } | null;
  lastKey: string | null;
  lastAt: number;

  /** key: modifiche ripetute con la stessa chiave (es. trascinare un valore) diventano un solo passo di annullamento */
  commit: (next: PrSequence, selection?: string[], key?: string) => void;
  beginGesture: () => void;
  updateGesture: (fn: (base: PrSequence) => PrSequence) => void;
  endGesture: () => void;
  undo: () => void;
  redo: () => void;
  select: (id: string | null, additive?: boolean) => void;
  setPlayhead: (t: number) => void;
  togglePlay: () => void;
  set: (patch: Partial<Omit<PrState, "commit">>) => void;
  notify: (msg: string) => void;
  reset: () => void;
}

export const usePremiere = create<PrState>()((set, get) => ({
  seq: starter(),
  past: [],
  future: [],
  gesture: null,
  selection: [],
  playhead: 0,
  playing: false,
  tool: "select",
  snapping: true,
  pxPerSec: 40,
  selectedMedia: "intervista",
  source: { t: 0, in: null, out: null },
  dialog: null,
  toast: null,
  targetV: "V1",
  targetA: "A1",
  off: [],
  gap: null,
  lastKey: null,
  lastAt: 0,

  commit: (next, selection, key) => {
    const { seq, past, lastKey, lastAt } = get();
    if (next === seq) return;
    const alive = new Set(next.clips.map((c) => c.id));
    const now = Date.now();
    const merge = !!key && key === lastKey && now - lastAt < 1000 && past.length > 0;
    set({
      seq: next,
      past: merge ? past : [...past, seq].slice(-80),
      future: [],
      gap: null,
      lastKey: key ?? null,
      lastAt: now,
      selection: (selection ?? get().selection).filter((id) => alive.has(id)),
    });
  },
  beginGesture: () => set({ gesture: get().seq }),
  updateGesture: (fn) => {
    const base = get().gesture;
    if (base) set({ seq: fn(base) });
  },
  endGesture: () => {
    const { gesture, seq, past } = get();
    if (!gesture) return;
    set({ gesture: null, ...(gesture !== seq ? { past: [...past, gesture].slice(-80), future: [] } : {}) });
  },
  undo: () => {
    const { past, seq, future } = get();
    const prev = past.at(-1);
    if (prev) set({ seq: prev, past: past.slice(0, -1), future: [seq, ...future], selection: [] });
  },
  redo: () => {
    const { past, seq, future } = get();
    const [next, ...rest] = future;
    if (next) set({ seq: next, past: [...past, seq], future: rest, selection: [] });
  },
  select: (id, additive) => {
    if (!id) return set({ selection: [], gap: null });
    const ids = linked(get().seq, id).map((c) => c.id);
    set({ gap: null, selection: additive ? [...new Set([...get().selection, ...ids])] : ids });
  },
  setPlayhead: (t) => set({ playhead: Math.max(0, t) }),
  togglePlay: () => {
    const { playing, playhead, seq } = get();
    if (!playing && playhead >= seqDuration(seq) - 0.01) set({ playhead: 0 });
    set({ playing: !playing });
  },
  set: (patch) => set(patch),
  notify: (msg) => {
    set({ toast: msg });
    setTimeout(() => get().toast === msg && set({ toast: null }), 2200);
  },
  reset: () => set({ seq: starter(), past: [], future: [], selection: [], gap: null, playhead: 0, playing: false }),
}));
