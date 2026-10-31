import type { Clip, Sequence, TrackId } from "./types";

const EPS = 1e-6;
let counter = 0;
export const uid = (prefix = "c") => `${prefix}${++counter}${Math.random().toString(36).slice(2, 6)}`;

export const clipDuration = (c: Clip) => c.out - c.in;
export const clipEnd = (c: Clip) => c.start + clipDuration(c);
const frame = (seq: Sequence) => 1 / seq.fps;

export function sequenceDuration(seq: Sequence): number {
  return seq.clips.reduce((max, c) => Math.max(max, clipEnd(c)), 0);
}

export function trackClips(seq: Sequence, track: TrackId): Clip[] {
  return seq.clips.filter((c) => c.track === track).sort((a, b) => a.start - b.start);
}

export function clipAt(seq: Sequence, track: TrackId, t: number): Clip | undefined {
  return seq.clips.find((c) => c.track === track && t >= c.start - EPS && t < clipEnd(c) - EPS);
}

export function linkedGroup(seq: Sequence, clipId: string): Clip[] {
  const clip = seq.clips.find((c) => c.id === clipId);
  if (!clip) return [];
  return clip.linkId ? seq.clips.filter((c) => c.linkId === clip.linkId) : [clip];
}

export function razor(seq: Sequence, clipId: string, t: number): Sequence {
  const minLen = frame(seq);
  const cuttable = linkedGroup(seq, clipId).filter(
    (c) => t > c.start + minLen - EPS && t < clipEnd(c) - minLen + EPS,
  );
  if (cuttable.length === 0) return seq;

  const ids = new Set(cuttable.map((c) => c.id));
  const rightLink = uid("l");
  const clips = seq.clips.flatMap((c): Clip[] => {
    if (!ids.has(c.id)) return [c];
    const offset = t - c.start;
    return [
      { ...c, out: c.in + offset },
      { ...c, id: uid(), start: t, in: c.in + offset, linkId: c.linkId ? rightLink : undefined },
    ];
  });
  return { ...seq, clips };
}

export function deleteClips(seq: Sequence, clipIds: string[], ripple: boolean): Sequence {
  const ids = new Set(clipIds.flatMap((id) => linkedGroup(seq, id).map((c) => c.id)));
  const removed = seq.clips.filter((c) => ids.has(c.id));
  if (removed.length === 0) return seq;

  let clips = seq.clips.filter((c) => !ids.has(c.id));
  if (ripple) {
    const from = Math.min(...removed.map((c) => c.start));
    const to = Math.max(...removed.map(clipEnd));
    clips = clips.map((c) => (c.start >= to - EPS ? { ...c, start: c.start - (to - from) } : c));
  }
  return { ...seq, clips };
}

export function editPoints(seq: Sequence, track: TrackId): number[] {
  const clips = trackClips(seq, track);
  const points: number[] = [];
  for (let i = 1; i < clips.length; i++) {
    if (Math.abs(clips[i].start - clipEnd(clips[i - 1])) < frame(seq) / 2) points.push(clips[i].start);
  }
  return points;
}

export function hasGaps(seq: Sequence, track: TrackId): boolean {
  const clips = trackClips(seq, track);
  const half = frame(seq) / 2;
  if (clips.length === 0) return false;
  if (clips[0].start > half) return true;
  return clips.some((c, i) => i > 0 && c.start - clipEnd(clips[i - 1]) > half);
}

export function sourceCoverage(seq: Sequence, track: TrackId, mediaId: string, from: number, to: number): number {
  return seq.clips
    .filter((c) => c.track === track && c.mediaId === mediaId)
    .reduce((sum, c) => sum + Math.max(0, Math.min(c.out, to) - Math.max(c.in, from)), 0);
}
