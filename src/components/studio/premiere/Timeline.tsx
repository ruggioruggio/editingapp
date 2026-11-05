"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Captions, Diamond, Eye, EyeOff, Link2, Lock, LockOpen, Magnet, Mic, Plus, SquareStack, Wrench } from "lucide-react";
import { keyedValue, setAt, toggleKeyAt, type Prop } from "@/lib/studio/anim";
import { getEffect, getTransition } from "@/lib/studio/effects";
import {
  LABELS,
  MARKER_COLORS,
  audioTracks,
  clipEnd,
  gapAt,
  isVideoTrack,
  linked,
  moveClips,
  placeMedia,
  playheadOf,
  rateStretch,
  razor,
  rollEdit,
  seqDuration,
  seqOf,
  slideClip,
  slipClip,
  snapFrame,
  transRange,
  trimEdge,
  usePremiere,
  videoTracks,
  type Clip,
  type MenuItemLike,
  type Sequence,
  type Track,
} from "@/lib/studio/premiere";
import { isStill } from "@/lib/studio/media";
import { Scrub, timecode, useWide } from "../chrome";
import { Thumb } from "../render";
import * as A from "./actions";

const HEAD_WIDE = 168;
const HEAD_PHONE = 100;
const TOP = 52;
const DIV = 4;
const MIX = 26;
const CLIP_HEAD = 14;

const DEFAULT_LABEL = 2;
function clipColors(label: number, isV: boolean) {
  if (label === DEFAULT_LABEL) return isV ? { body: "#9368aa", head: "#5d4b75" } : { body: "#3b8d8e", head: "#2d6a68" };
  const c = LABELS[label]?.[1] ?? "#9368aa";
  return { body: c, head: `color-mix(in srgb, ${c} 62%, #000)` };
}

function PlayheadHead() {
  return (
    <svg width="15" height="17" viewBox="0 0 15 17" className="absolute -left-[7px] bottom-0" aria-hidden>
      <path d="M0.5 0.5H14.5V10L7.5 16.5L0.5 10Z" fill="#00aaff" stroke="#7fd4ff" strokeWidth="1" />
    </svg>
  );
}

type Row = { track: Track; y: number; h: number };

function layout(s: Sequence): { rows: Row[]; total: number; audioTop: number } {
  const rows: Row[] = [];
  let y = TOP;
  for (const t of [...videoTracks(s)].reverse()) {
    rows.push({ track: t, y, h: t.height });
    y += t.height;
  }
  y += DIV;
  const audioTop = y;
  for (const t of audioTracks(s)) {
    rows.push({ track: t, y, h: t.height });
    y += t.height;
  }
  return { rows, total: y + MIX + 20, audioTop };
}

function Waveform({ seed, from, to, dense }: { seed: number; from: number; to: number; dense: boolean }) {
  const n = 80;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = from + ((to - from) * i) / n;
    const v = dense ? 0.55 + 0.45 * Math.abs(Math.sin(t * 7.3 + seed)) : Math.abs(Math.sin(t * 9 + seed) * Math.sin(t * 2.1 + seed * 2));
    return v;
  });
  const d = pts.map((v, i) => `M${(i / n) * 100} ${50 - v * 45}V${50 + v * 45}`).join("");
  return (
    <svg className="absolute inset-x-0 bottom-0 h-[calc(100%-14px)] w-full" style={{ top: CLIP_HEAD }} preserveAspectRatio="none" viewBox="0 0 100 100">
      <path d={d} stroke="rgb(205 250 245 / .8)" strokeWidth=".8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Timeline() {
  const st = usePremiere();
  const seq = seqOf(st);
  if (!seq) {
    return (
      <div className="grid h-full place-items-center text-center text-[12px] text-[#8a8a8a]">
        <div>
          Nessuna sequenza aperta.
          <br />
          Trascina qui una clip o fai doppio clic su una sequenza nel pannello Progetto.
        </div>
      </div>
    );
  }
  return <TimelineBody seq={seq} />;
}

function TimelineBody({ seq }: { seq: Sequence }) {
  const st = usePremiere();
  const { selection, tool, snapping, linkedSel, gap, selTrans, project } = st;
  const playhead = playheadOf(st);
  const pps = st.zooms[seq.id] ?? 60;
  const scroller = useRef<HTMLDivElement>(null);
  const wide = useWide();
  const HEAD = wide ? HEAD_WIDE : HEAD_PHONE;
  const [snapLine, setSnapLine] = useState<number | null>(null);
  const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [editTc, setEditTc] = useState(false);
  const { rows, total, audioTop } = useMemo(() => layout(seq), [seq]);
  const fps = seq.fps;
  const dur = Math.max(30, seqDuration(seq) + 20, (scroller.current?.clientWidth ?? 1000) / pps);
  const width = dur * pps;
  const rowOf = (id: string) => rows.find((r) => r.track.id === id)!;

  useEffect(() => {
    const el = scroller.current;
    if (!el || !st.playing) return;
    const x = playhead * pps;
    if (x > el.scrollLeft + el.clientWidth - HEAD - 40) el.scrollLeft = x - 40;
  }, [playhead, pps, st.playing]);

  const xToTime = (clientX: number) => {
    const el = scroller.current!;
    return Math.max(0, (clientX - el.getBoundingClientRect().left - HEAD + el.scrollLeft) / pps);
  };
  const yIn = (clientY: number) => {
    const el = scroller.current!;
    return clientY - el.getBoundingClientRect().top + el.scrollTop;
  };
  const rowAtY = (y: number) => rows.find((r) => y >= r.y && y < r.y + r.h);
  const toFrame = (t: number) => snapFrame(t, fps);

  const snapPoints = (exclude: Set<string>) => [0, playhead, ...seq.markers.map((m) => m.t), ...(seq.inPoint !== null ? [seq.inPoint] : []), ...(seq.outPoint !== null ? [seq.outPoint] : []), ...seq.clips.filter((c) => !exclude.has(c.id)).flatMap((c) => [c.start, clipEnd(c)])];
  const snap = (t: number, exclude: Set<string> = new Set(), force?: boolean) => {
    if (!(snapping || force)) {
      setSnapLine(null);
      return toFrame(t);
    }
    const lim = 9 / pps;
    let best = t;
    let d = lim;
    for (const p of snapPoints(exclude)) if (Math.abs(p - t) < d) (d = Math.abs(p - t)), (best = p);
    setSnapLine(best !== t ? best : null);
    return toFrame(best);
  };

  const drag = (e: React.PointerEvent, onMove: (ev: PointerEvent, dx: number, dy: number) => void, onUp?: (moved: boolean) => void) => {
    const el = e.currentTarget as HTMLElement;
    const x0 = e.clientX;
    const y0 = e.clientY;
    let moved = false;
    const touch = e.pointerType === "touch";
    let armed = !touch;
    const block = (ev: TouchEvent) => ev.preventDefault();
    const pid = e.pointerId;
    const timer = touch
      ? setTimeout(() => {
          armed = true;
          try { el.setPointerCapture(pid); } catch {}
          document.addEventListener("touchmove", block, { passive: false });
          navigator.vibrate?.(12);
        }, 280)
      : undefined;
    if (!touch) try { el.setPointerCapture(pid); } catch {}
    const move = (ev: PointerEvent) => {
      if (!armed) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) clearTimeout(timer);
        return;
      }
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      onMove(ev, dx, dy);
    };
    const up = () => {
      clearTimeout(timer);
      document.removeEventListener("touchmove", block);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      setSnapLine(null);
      onUp?.(moved);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const scrub = (clientX: number, shift: boolean) => {
    st.set({ playing: false });
    st.setPlayhead(shift ? snap(xToTime(clientX), new Set(), true) : toFrame(xToTime(clientX)));
  };

  const neighbours = (c: Clip) => ({
    L: seq.clips.find((x) => x.track === c.track && Math.abs(clipEnd(x) - c.start) < 1e-3),
    R: seq.clips.find((x) => x.track === c.track && Math.abs(x.start - clipEnd(c)) < 1e-3),
  });

  const onClipDown = (e: React.PointerEvent, c: Clip, edge: "in" | "out" | null) => {
    if (e.button === 2) return;
    e.stopPropagation();
    st.set({ focus: "timeline" });
    const track = rowOf(c.track).track;
    if (tool === "hand" || tool === "zoom") return onBackgroundDown(e as React.PointerEvent<HTMLDivElement>);
    if (tool === "razor") {
      if (track.locked) return;
      const t = snap(xToTime(e.clientX));
      const ids = e.shiftKey ? seq.clips.filter((k) => t > k.start && t < clipEnd(k)).map((k) => k.id) : linked(seq, c.id, linkedSel && !e.altKey).map((k) => k.id);
      st.commitSeq((q) => razor(q, ids, t), "Lama");
      setSnapLine(null);
      return;
    }
    if (tool === "trackFwd" || tool === "trackBack") {
      const t = xToTime(e.clientX);
      const fwd = tool === "trackFwd";
      const ids = seq.clips.filter((k) => (e.shiftKey ? k.track === c.track : true) && (fwd ? clipEnd(k) > t : k.start < t)).map((k) => k.id);
      st.set({ selection: ids, gap: null, selTrans: null });
      const anchorVideo = isVideoTrack(seq, c.track);
      st.beginGesture();
      drag(
        e,
        (ev) => {
          const dt = xToTime(ev.clientX) - t;
          st.updateGesture((q) => moveClips(q, ids, toFrame(dt), 0, { anchorVideo }));
        },
        () => st.endGesture("Sposta"),
      );
      return;
    }
    if (track.locked) return;

    const sel = selection.includes(c.id);
    if (!edge) {
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        if (!(tool === "select" && sel && !e.shiftKey)) st.select(c.id, true);
      } else if (!sel) {
        if (e.altKey) st.set({ selection: [c.id], gap: null, selTrans: null });
        else st.select(c.id);
      }
    }
    const ids = edge ? [c.id] : [...new Set([...(sel ? selection : linked(seq, c.id, linkedSel && !e.altKey).map((k) => k.id)), c.id])];
    const group = new Set(linked(seq, c.id).map((k) => k.id));
    const t0 = xToTime(e.clientX);

    if (!edge && (tool === "pen" || ((e.ctrlKey || e.metaKey) && tool === "select"))) {
      const r = rowOf(c.track);
      const y = yIn(e.clientY) - r.y;
      if (r.h >= 56 && y > 16) {
        const lt = t0 - c.start;
        const isV = isVideoTrack(seq, c.track);
        A.updateClip(c.id, (k) => (isV ? { ...k, opacity: toggleKeyAt(k.opacity.keys ? k.opacity : { ...k.opacity, keys: [] }, lt, fps) } : { ...k, volume: toggleKeyAt(k.volume.keys ? k.volume : { ...k.volume, keys: [] }, lt, fps) }), "Aggiungi fotogramma chiave");
        return;
      }
    }

    st.beginGesture();
    const label = { select: "Sposta", ripple: "Modifica con increspatura", roll: "Modifica rotazione", rate: "Allunga velocità", slip: "Scorrimento", slide: "Scivolamento", pen: "Sposta" }[tool as string] ?? "Modifica";
    drag(
      e,
      (ev, dx, dy) => {
        const t = xToTime(ev.clientX);
        if (edge) {
          const { L, R } = neighbours(c);
          if (tool === "roll") {
            const at = snap(edge === "in" ? c.start + (t - t0) : clipEnd(c) + (t - t0), group);
            const left = edge === "in" ? L?.id ?? null : c.id;
            const right = edge === "in" ? c.id : R?.id ?? null;
            const base = edge === "in" ? c.start : clipEnd(c);
            st.updateGesture((q, p) => rollEdit(q, p, left, right, at - base));
          } else if (tool === "rate") {
            const at = snap(edge === "in" ? c.start + (t - t0) : clipEnd(c) + (t - t0), group);
            st.updateGesture((q) => rateStretch(q, c.id, edge, at));
          } else {
            const at = snap(edge === "in" ? c.start + (t - t0) : clipEnd(c) + (t - t0), group);
            const ripple = tool === "ripple" || ev.ctrlKey || ev.metaKey;
            st.updateGesture((q, p) => trimEdge(q, p, c.id, edge, at, ripple, linkedSel && !ev.altKey));
          }
          return;
        }
        if (tool === "slip") return st.updateGesture((q, p) => slipClip(q, p, c.id, toFrame(t - t0)));
        if (tool === "slide") return st.updateGesture((q, p) => slideClip(q, p, c.id, toFrame(t - t0)));
        const ex = new Set(ids);
        const s0 = snap(c.start + (t - t0), ex);
        const sStart = snapLine;
        const e0 = snap(clipEnd(c) + (t - t0), ex);
        const useEnd = Math.abs(e0 - (clipEnd(c) + (t - t0))) < Math.abs(s0 - (c.start + (t - t0))) - 1e-9;
        if (!useEnd) setSnapLine(sStart);
        const dt = (useEnd ? e0 - clipEnd(c) : s0 - c.start) || 0;
        const steps = Math.round(dy / rowOf(c.track).h);
        st.updateGesture((q) => moveClips(q, ids, toFrame(dt), isVideoTrack(q, c.track) ? -steps : steps, { insert: ev.ctrlKey || ev.metaKey, duplicate: ev.altKey, anchorVideo: isVideoTrack(q, c.track) }));
      },
      (moved) => {
        st.endGesture(edge ? (tool === "select" ? "Rifila" : label) : label);
        if (!moved && !edge && tool === "select" && sel && !e.shiftKey && !e.ctrlKey) st.select(c.id);
      },
    );
  };

  const onBackgroundDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 2) return;
    st.set({ focus: "timeline" });
    const el = scroller.current!;
    if (tool === "hand") {
      const sx = el.scrollLeft;
      const sy = el.scrollTop;
      drag(e, (_ev, dx, dy) => {
        el.scrollLeft = sx - dx;
        el.scrollTop = sy - dy;
      });
      return;
    }
    if (tool === "zoom") return A.zoom(e.altKey ? 1 / 1.6 : 1.6);
    const y = yIn(e.clientY);
    const r = rowAtY(y);
    const t = xToTime(e.clientX);
    if (tool === "trackFwd" || tool === "trackBack") {
      const ids = seq.clips.filter((k) => (e.shiftKey && r ? k.track === r.track.id : true) && (tool === "trackFwd" ? clipEnd(k) > t : k.start < t)).map((k) => k.id);
      return st.set({ selection: ids });
    }
    const g = r ? gapAt(seq, r.track.id, t) : null;
    if (!e.shiftKey) st.set({ selection: [], selTrans: null, gap: g && r ? { track: r.track.id, ...g } : null });
    if (e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const sx = e.clientX - rect.left + el.scrollLeft;
    const sy = y;
    drag(
      e,
      (ev) => {
        const x1 = ev.clientX - rect.left + el.scrollLeft;
        const y1 = ev.clientY - rect.top + el.scrollTop;
        setMarquee({ x0: sx, y0: sy, x1, y1 });
        const ta = (Math.min(sx, x1) - HEAD) / pps;
        const tb = (Math.max(sx, x1) - HEAD) / pps;
        const ya = Math.min(sy, y1);
        const yb = Math.max(sy, y1);
        const ids = seq.clips
          .filter((c) => {
            const rr = rowOf(c.track);
            return clipEnd(c) > ta && c.start < tb && rr.y + rr.h > ya && rr.y < yb;
          })
          .flatMap((c) => linked(seq, c.id, linkedSel).map((k) => k.id));
        st.set({ selection: [...new Set([...(e.shiftKey ? selection : []), ...ids])], gap: null });
      },
      () => setMarquee(null),
    );
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const r = rowAtY(yIn(e.clientY));
    const t = snap(xToTime(e.clientX));
    setSnapLine(null);
    const itemId = e.dataTransfer.getData("text/x-item");
    const fx = e.dataTransfer.getData("text/x-fx");
    const trans = e.dataTransfer.getData("text/x-trans");
    const source = e.dataTransfer.getData("text/x-source");
    if (fx || trans) {
      const c = r ? seq.clips.find((k) => k.track === r.track.id && t >= k.start - 0.5 && t <= clipEnd(k) + 0.5) : undefined;
      if (!c) return st.notify("Rilascia sopra una clip");
      if (fx) return A.applyEffect(fx, [c.id]);
      const side = Math.abs(t - c.start) <= Math.abs(t - clipEnd(c)) ? "in" : "out";
      return A.applyTransitionAt(trans, c.id, side);
    }
    const it = itemId ? project.items.find((i) => i.id === itemId) : null;
    if (it?.type === "sequence") return st.notify("Le sequenze nidificate non sono disponibili nel simulatore");
    const mediaId = it?.ref ?? (source ? st.source.mediaId : null);
    if (!mediaId) return;
    const m = project.media[mediaId];
    if (!m) return;
    const a = source ? st.source.in ?? 0 : 0;
    const b = source ? st.source.out ?? (isStill(m) ? a + m.duration : m.duration) : isStill(m) ? m.duration : m.duration;
    const vt = videoTracks(seq);
    const at = audioTracks(seq);
    let v = seq.patchV ?? vt[0].id;
    let au = seq.patchA ?? at[0].id;
    if (r) {
      if (r.track.kind === "video") {
        v = r.track.id;
        au = at[Math.min(at.length - 1, vt.findIndex((x) => x.id === r.track.id))]?.id ?? au;
      } else {
        au = r.track.id;
        if (!m.hasVideo) v = vt[0].id;
      }
    }
    if (r && r.track.kind === "audio" && !m.hasAudio) return st.notify("Questa clip non ha audio: rilasciala su una traccia video");
    if (r && r.track.kind === "video" && !m.hasVideo) au = at[0].id;
    const res = placeMedia(seq, m, t, a, b, e.ctrlKey || e.metaKey ? "insert" : "overwrite", m.hasVideo ? v : null, m.hasAudio ? au : null);
    st.commitSeq(() => res.seq, e.ctrlKey ? "Inserisci" : "Sovrascrivi");
    st.set({ selection: res.ids });
  };

  const clipMenu = (e: React.MouseEvent, c: Clip) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selection.includes(c.id)) st.select(c.id);
    const isV = isVideoTrack(seq, c.track);
    const items: MenuItemLike[] = [
      { label: "Taglia", keys: "Ctrl+X", action: () => A.copy(true) },
      { label: "Copia", keys: "Ctrl+C", action: () => A.copy(false) },
      { label: "Incolla attributi…", keys: "Ctrl+Alt+V", action: () => st.set({ dialog: { type: "pasteAttr" } }), disabled: !st.clipboard?.length },
      { label: "Rimuovi attributi…", action: A.removeAttributes },
      "-",
      { label: "Cancella", keys: "Canc", action: () => A.deleteSelection(false) },
      { label: "Elimina con increspatura", keys: "Maiusc+Canc", action: () => A.deleteSelection(true) },
      "-",
      { label: "Abilita", checked: c.enabled, keys: "Maiusc+E", action: A.toggleEnable },
      { label: c.linkId ? "Scollega" : "Collega", keys: "Ctrl+L", action: A.linkUnlink },
      "-",
      { label: "Velocità/Durata…", keys: "Ctrl+R", action: () => st.set({ dialog: { type: "speed", ids: selection.length ? selection : [c.id] } }) },
      ...(isV
        ? ([
            "-",
            { label: "Aggiungi fermo immagine", action: () => (st.select(c.id), A.addFrameHold()) },
            { label: "Ridimensiona alla dimensione fotogramma", action: () => A.scaleToFrame(true) },
            { label: "Imposta alla dimensione fotogramma", action: () => A.scaleToFrame(false) },
          ] as MenuItemLike[])
        : []),
      "-",
      { label: "Etichetta", sub: LABELS.map(([name], i) => ({ label: name, checked: c.label === i, action: () => st.commitSeq((q) => ({ ...q, clips: q.clips.map((k) => (selection.includes(k.id) || k.id === c.id ? { ...k, label: i } : k)) }), "Etichetta") })) },
      { label: "Rinomina…", action: () => st.set({ dialog: { type: "rename", title: "Rinomina clip", value: c.name, onOk: (v) => A.updateClip(c.id, (k) => ({ ...k, name: v }), "Rinomina") } }) },
      { label: "Mostra nel progetto", action: () => {
          const it = project.items.find((i) => i.ref === c.mediaId);
          if (it) st.set({ bin: it.parent, projectSel: [it.id], focus: "project" });
        } },
      { label: "Corrispondenza fotogramma", keys: "F", action: A.matchFrame },
    ];
    st.set({ menu: { x: e.clientX, y: e.clientY, items } });
  };

  const trackMenu = (e: React.MouseEvent, t: Track) => {
    e.preventDefault();
    st.set({
      menu: {
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: "Rinomina", action: () => st.set({ dialog: { type: "rename", title: "Rinomina traccia", value: t.name, onOk: (v) => A.updateTrack(t.id, { name: v }, "Rinomina traccia") } }) },
          "-",
          { label: "Aggiungi traccia", action: () => A.addTracks(t.kind === "video" ? 1 : 0, t.kind === "audio" ? 1 : 0) },
          { label: "Aggiungi tracce…", action: () => st.set({ dialog: { type: "tracks" } }) },
          { label: "Elimina traccia", action: () => A.deleteTrack(t.id) },
        ],
      },
    });
  };

  const bgMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const r = rowAtY(yIn(e.clientY));
    const g = r ? gapAt(seq, r.track.id, xToTime(e.clientX)) : null;
    if (g && r) st.set({ gap: { track: r.track.id, ...g }, selection: [] });
    st.set({
      menu: {
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: "Elimina con increspatura", disabled: !g, action: () => A.deleteSelection(true) },
          "-",
          { label: "Incolla", keys: "Ctrl+V", disabled: !st.clipboard?.length, action: () => A.paste(false) },
          { label: "Aggiungi tracce…", action: () => st.set({ dialog: { type: "tracks" } }) },
        ],
      },
    });
  };

  const secStep = [0.04, 0.2, 0.4, 1, 2, 5, 10, 30, 60, 300].find((s) => s * pps >= 80) ?? 600;
  const minor = secStep / 10;
  const ticks = Array.from({ length: Math.ceil(dur / minor) + 1 }, (_, i) => i * minor);

  const edgeCursor = tool === "ripple" ? "cursor-[w-resize]" : tool === "roll" ? "cursor-col-resize" : tool === "rate" ? "cursor-ew-resize" : "cursor-ew-resize";

  const transitionBoxes: ReactNode[] = [];
  for (const c of seq.clips) {
    for (const side of ["in", "out"] as const) {
      const tr = side === "in" ? c.tIn : c.tOut;
      const range = transRange(seq, c, side);
      if (!tr || !range) continue;
      const r = rowOf(c.track);
      const isSel = selTrans?.clip === c.id && selTrans.side === side;
      transitionBoxes.push(
        <div
          key={c.id + side}
          title={getTransition(tr.defId)?.name}
          onPointerDown={(e) => {
            e.stopPropagation();
            st.set({ selTrans: { clip: c.id, side }, selection: [], gap: null, focus: "timeline" });
            const x0 = e.clientX;
            const d0 = tr.dur;
            const rightHalf = e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left > (e.currentTarget as HTMLElement).clientWidth * 0.75;
            const leftHalf = e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left < (e.currentTarget as HTMLElement).clientWidth * 0.25;
            if (!rightHalf && !leftHalf) return;
            st.beginGesture();
            drag(
              e,
              (ev) => {
                const dd = ((ev.clientX - x0) / pps) * (range.prev && side === "in" ? 2 : 1) * (leftHalf ? -1 : 1);
                const nd = Math.max(1 / fps, toFrame(d0 + dd));
                st.updateGesture((q) => ({ ...q, clips: q.clips.map((k) => (k.id === c.id ? { ...k, [side === "in" ? "tIn" : "tOut"]: { ...tr, dur: nd } } : k)) }));
              },
              () => st.endGesture("Durata transizione"),
            );
          }}
          onDoubleClick={() => st.set({ dialog: { type: "transDur", clipId: c.id, side } })}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            st.set({
              selTrans: { clip: c.id, side },
              menu: {
                x: e.clientX,
                y: e.clientY,
                items: [
                  { label: "Imposta durata transizione…", action: () => st.set({ dialog: { type: "transDur", clipId: c.id, side } }) },
                  { label: "Cancella", action: () => A.deleteSelection(false) },
                ],
              },
            });
          }}
          className={clsx(
            "absolute z-[5] flex items-center overflow-hidden rounded-[3px] border px-1 text-[10px] leading-none text-white",
            isSel ? "border-white bg-[#6d63b8]" : "border-black/50 bg-[linear-gradient(135deg,#4c4692,#2f2b66)]",
          )}
          style={{ left: HEAD + range.from * pps, width: Math.max(6, (range.to - range.from) * pps), top: r.y + 3, height: Math.min(24, r.h - 6) }}
        >
          <span className="truncate">{getTransition(tr.defId)?.name}</span>
        </div>,
      );
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scroller}
        data-timeline-area
        className={clsx("relative min-h-0 flex-1 overflow-auto bg-[#1d1d1d] [scrollbar-color:#4a4a4a_transparent]",tool === "razor" && "cursor-crosshair", tool === "hand" && "cursor-grab", tool === "zoom" && "cursor-zoom-in")}
        onDragOver={(e) => {
          e.preventDefault();
          if (snapping) snap(xToTime(e.clientX));
        }}
        onDragLeave={() => setSnapLine(null)}
        onDrop={onDrop}
        onPointerMove={(e) => setHover(xToTime(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onWheel={(e) => {
          if (e.altKey || e.ctrlKey) {
            e.preventDefault();
            A.zoom(e.deltaY < 0 ? 1.25 : 0.8);
          }
        }}
      >
        <div className="relative" style={{ width: width + HEAD, height: total }}>
          {/* intestazione: codice di tempo, pulsanti e righello */}
          <div className="sticky top-0 z-30 flex" style={{ height: TOP }}>
            <div className="sticky left-0 z-10 flex shrink-0 flex-col justify-between overflow-hidden border-b border-r border-ppro-track-line bg-ppro-panel px-2 pb-1 pt-0.5" style={{ width: HEAD }}>
              {editTc ? (
                <input
                  autoFocus
                  defaultValue={timecode(playhead, fps)}
                  className="w-32 rounded-[2px] border border-ppro-blue bg-[#111] px-1 font-mono text-[16px] text-ppro-timecode outline-none"
                  onBlur={() => setEditTc(false)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      const parts = (e.target as HTMLInputElement).value.split(/[:;.]/).map(Number);
                      const [h, m, s2, f] = [0, 0, 0, 0].map((_, i) => parts[parts.length - 4 + i] ?? 0);
                      st.setPlayhead(h * 3600 + m * 60 + s2 + f / fps);
                      setEditTc(false);
                    }
                    if (e.key === "Escape") setEditTc(false);
                  }}
                />
              ) : (
                <button type="button" onClick={() => setEditTc(true)} className="text-left font-mono text-[13px] leading-tight tracking-tight text-ppro-timecode sm:text-[16px]" title="Clic per scrivere un tempo">
                  {timecode(playhead, fps)}
                </button>
              )}
              <div className="flex items-center gap-0.5 text-[#bdbdbd]">
                {(
                  [
                    [SquareStack, "Inserisci o sovrascrivi sequenze come nidificazioni o clip singole", false, () => st.notify("Le sequenze vengono inserite come clip singole")],
                    [Magnet, "Aggancia nella timeline (S)", snapping, () => st.set({ snapping: !snapping })],
                    [Link2, "Selezione collegata", linkedSel, () => st.set({ linkedSel: !linkedSel })],
                    [Captions, "Mostra tracce sottotitoli", false, () => st.notify("Nessuna traccia sottotitoli in questa sequenza")],
                  ] as const
                ).map(([Icon, title, on, fn]) => (
                  <button key={title} type="button" title={title} onClick={fn} className={clsx("grid h-[20px] w-[22px] place-items-center rounded-[2px]", on ? "text-ppro-blue" : "text-[#a8a8a8] hover:bg-white/10 hover:text-white")}>
                    <Icon size={13} />
                  </button>
                ))}
                <button type="button" title="Aggiungi marcatore (M)" onClick={A.addMarker} className="grid h-[20px] w-[22px] place-items-center rounded-[2px] text-[#a8a8a8] hover:bg-white/10">
                  <svg width="11" height="13" viewBox="0 0 11 13">
                    <path d="M1 1h9v8l-4.5 3L1 9z" fill="currentColor" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Impostazioni visualizzazione timeline"
                  onClick={(e) =>
                    st.set({
                      menu: {
                        x: e.clientX,
                        y: e.clientY + 10,
                        items: [
                          { label: "Ingrandisci tutte le tracce", action: () => st.commitSeq((q) => ({ ...q, tracks: q.tracks.map((t) => ({ ...t, height: 80 })) }), "Altezza tracce") },
                          { label: "Riduci tutte le tracce", action: () => st.commitSeq((q) => ({ ...q, tracks: q.tracks.map((t) => ({ ...t, height: 44 })) }), "Altezza tracce") },
                          "-",
                          { label: "Adatta sequenza alla finestra", keys: "\\", action: A.zoomToFit },
                        ],
                      },
                    })
                  }
                  className="grid h-[20px] w-[22px] place-items-center rounded-[2px] text-[#a8a8a8] hover:bg-white/10"
                >
                  <Wrench size={12} />
                </button>
              </div>
            </div>
            <div
              className="relative shrink-0 cursor-default touch-none border-b border-ppro-track-line bg-ppro-ruler"
              style={{ width }}
              onPointerDown={(e) => {
                e.stopPropagation();
                st.set({ focus: "timeline" });
                try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
                scrub(e.clientX, e.shiftKey);
              }}
              onPointerMove={(e) => e.buttons & 1 && scrub(e.clientX, e.shiftKey)}
              onPointerUp={() => setSnapLine(null)}
            >
              {/* attacco/uscita della sequenza */}
              {(seq.inPoint !== null || seq.outPoint !== null) && (
                <div className="absolute top-[24px] h-[6px] bg-[#7a7a7a]/70" style={{ left: (seq.inPoint ?? 0) * pps, width: ((seq.outPoint ?? dur) - (seq.inPoint ?? 0)) * pps }} />
              )}
              {ticks.map((t, i) => {
                const major = i % 10 === 0;
                const half = i % 5 === 0;
                return (
                  <div key={i} className={clsx("absolute bottom-0 border-l", major ? "border-[#8a8a8a]" : "border-[#4e4e4e]")} style={{ left: t * pps, height: major ? 14 : half ? 7 : 4 }}>
                    {major && <span className="absolute -top-[3px] left-[3px] whitespace-nowrap font-mono text-[9.5px] leading-none text-[#a8a8a8]">{timecode(t, fps)}</span>}
                  </div>
                );
              })}
              {seq.markers.map((mk) => (
                <div
                  key={mk.id}
                  title={mk.name || "Marcatore"}
                  className="absolute top-[12px] h-[11px] w-[9px] -translate-x-1/2 cursor-pointer"
                  style={{ left: mk.t * pps, background: MARKER_COLORS[mk.color], clipPath: "polygon(0 0,100% 0,100% 65%,50% 100%,0 65%)" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const t0 = mk.t;
                    const x0 = e.clientX;
                    st.beginGesture();
                    drag(
                      e,
                      (ev) => {
                        const nt = Math.max(0, snap(t0 + (ev.clientX - x0) / pps));
                        st.updateGesture((q) => ({ ...q, markers: q.markers.map((k) => (k.id === mk.id ? { ...k, t: nt } : k)) }));
                      },
                      (moved) => (moved ? st.endGesture("Sposta marcatore") : (st.endGesture("Sposta marcatore"), st.setPlayhead(mk.t))),
                    );
                  }}
                  onDoubleClick={() => st.set({ dialog: { type: "marker", id: mk.id } })}
                />
              ))}
              {/* testa dell'indicatore */}
              <div className="pointer-events-none absolute bottom-0 z-10" style={{ left: playhead * pps }}>
                <PlayheadHead />
              </div>
            </div>
          </div>

          {/* intestazioni delle tracce */}
          <div className="sticky left-0 z-20 border-r border-ppro-track-line bg-ppro-track-head" style={{ width: HEAD, height: total - TOP }}>
            {rows.map(({ track: t, y, h }) => {
              const isV = t.kind === "video";
              const label = (isV ? "V" : "A") + ((isV ? videoTracks(seq) : audioTracks(seq)).indexOf(t) + 1);
              const patched = isV ? seq.patchV === t.id : seq.patchA === t.id;
              const sq = "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[2px] border text-[9.5px] font-bold leading-none";
              const off = "border-[#3a3a3a] bg-[#2b2b2b] text-[#a8a8a8] hover:border-[#555] hover:text-white";
              return (
                <div
                  key={t.id}
                  className="absolute left-0 flex w-full items-center gap-[3px] overflow-hidden border-b border-ppro-track-line pl-1 pr-1.5 text-[11px]"
                  style={{ top: y - TOP, height: h }}
                  onContextMenu={(e) => trackMenu(e, t)}
                  onDoubleClick={() => A.updateTrack(t.id, { height: t.height > 60 ? 44 : 90 }, "Altezza traccia")}
                >
                  <button
                    type="button"
                    title="Patch sorgente: dove vanno le clip del monitor sorgente"
                    onClick={() => st.commitSeq((q) => (isV ? { ...q, patchV: patched ? null : t.id } : { ...q, patchA: patched ? null : t.id }), "Patch sorgente")}
                    className={clsx("grid h-[18px] w-[20px] shrink-0 place-items-center rounded-[2px] text-[9.5px] font-bold", patched ? "bg-ppro-blue text-white" : "text-transparent hover:bg-white/5")}
                  >
                    {label}
                  </button>
                  <button type="button" title="Attiva/disattiva blocco traccia" onClick={() => A.updateTrack(t.id, { locked: !t.locked }, "Blocca traccia")} className={clsx(sq, t.locked ? "border-[#666] bg-[#4a4a4a] text-white" : off)}>
                    {t.locked ? <Lock size={10} /> : <LockOpen size={10} />}
                  </button>
                  <button
                    type="button"
                    title="Indirizzamento traccia (destinazione)"
                    onClick={() => A.updateTrack(t.id, { target: !t.target }, "Destinazione traccia")}
                    className={clsx("grid h-[18px] w-[24px] shrink-0 place-items-center rounded-[2px] border text-[9.5px] font-bold", t.target ? "border-ppro-blue bg-ppro-blue text-white" : off)}
                  >
                    {label}
                  </button>
                  <button type="button" title="Blocco sincronizzazione" onClick={() => A.updateTrack(t.id, { sync: !t.sync }, "Blocco sincronizzazione")} className={clsx(sq, off, !t.sync && "opacity-50")}>
                    <svg width="10" height="10" viewBox="0 0 12 12">
                      <path d="M3 5V3.5a3 3 0 0 1 6 0V5M2 5h8v6H2z" fill="none" stroke="currentColor" strokeWidth="1.3" />
                      {t.sync && <path d="M4.5 8l1 1 2-2" stroke="currentColor" strokeWidth="1.3" fill="none" />}
                    </svg>
                  </button>
                  {isV ? (
                    <button type="button" title="Attiva/disattiva output traccia" onClick={() => A.updateTrack(t.id, { off: !t.off }, "Output traccia")} className={clsx(sq, t.off ? "border-[#e8862a] bg-[#3a2a1a] text-[#e8862a]" : off)}>
                      {t.off ? <EyeOff size={10} /> : <Eye size={10} />}
                    </button>
                  ) : (
                    <>
                      <button type="button" title="Disattiva audio traccia (M)" onClick={() => A.updateTrack(t.id, { off: !t.off }, "Disattiva audio")} className={clsx(sq, t.off ? "border-[#3eaa52] bg-[#3eaa52] text-black" : off)}>
                        M
                      </button>
                      <button type="button" title="Traccia solo (S)" onClick={() => A.updateTrack(t.id, { solo: !t.solo }, "Traccia solo")} className={clsx(sq, t.solo ? "border-[#e8d43a] bg-[#e8d43a] text-black" : off)}>
                        S
                      </button>
                      {wide && (
                        <button type="button" title="Registrazione voce fuori campo" onClick={() => st.notify("La registrazione dal microfono non è disponibile nel simulatore")} className={clsx(sq, off)}>
                          <Mic size={10} />
                        </button>
                      )}
                    </>
                  )}
                  <span className="min-w-0 flex-1 truncate pl-1 text-[10.5px] text-[#9a9a9a]">{wide && h >= 30 ? t.name : ""}</span>
                  {!isV && wide && <Diamond size={9} className="shrink-0 text-[#6a6a6a]" />}
                  {/* ridimensiona altezza */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1 cursor-row-resize"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const h0 = t.height;
                      st.beginGesture();
                      drag(
                        e,
                        (_ev, _dx, dy) => st.updateGesture((q) => ({ ...q, tracks: q.tracks.map((k) => (k.id === t.id ? { ...k, height: Math.max(26, Math.min(220, h0 + (isV ? -dy : dy))) } : k)) })),
                        () => st.endGesture("Altezza traccia"),
                      );
                    }}
                  />
                </div>
              );
            })}
            <div className="absolute left-0 w-full bg-ppro-track-line" style={{ top: audioTop - DIV - TOP, height: DIV }} />
            <div className="absolute left-0 flex w-full items-center justify-between border-b border-ppro-track-line px-3 text-[11px] text-[#b0b0b0]" style={{ top: total - MIX - 20 - TOP, height: MIX }}>
              <span>Mix</span>
              <Scrub value={seq.master} min={-60} max={15} step={0.2} decimals={1} onChange={(v) => st.commitSeq((q) => ({ ...q, master: v }), "Volume master", "master")} />
            </div>
          </div>

          {/* area delle clip */}
          <div className="absolute top-0" style={{ left: HEAD, width, height: total }} onPointerDown={onBackgroundDown} onContextMenu={bgMenu}>
            {rows.map(({ track: t, y, h }) => (
              <div key={t.id} className={clsx("absolute left-0 w-full border-b border-ppro-track-line bg-ppro-track", t.locked && "bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(255_255_255/.035)_6px_8px)]")} style={{ top: y, height: h }} />
            ))}
            <div className="absolute left-0 w-full bg-ppro-track-line" style={{ top: audioTop - DIV, height: DIV }} />
            {gap && (
              <div className="absolute bg-white/15 outline outline-1 outline-white/60" style={{ top: rowOf(gap.track).y, height: rowOf(gap.track).h, left: gap.from * pps, width: (gap.to - gap.from) * pps }} />
            )}

            {seq.clips.map((c) => {
              const r = rowOf(c.track);
              if (!r) return null;
              const m = project.media[c.mediaId];
              const sel = selection.includes(c.id);
              const w = Math.max(2, ((c.out - c.in) / c.speed) * pps);
              const isV = r.track.kind === "video";
              const col = clipColors(c.label, isV);
              const hasFx = c.effects.length > 0;
              const tall = r.h >= 56;
              const bandProp: Prop = isV ? c.opacity : c.volume;
              const bandY = (v: number) => (isV ? 1 - v / 100 : 1 - (Math.max(-60, Math.min(15, v)) + 60) / 75);
              return (
                <div
                  key={c.id}
                  onPointerDown={(e) => onClipDown(e, c, null)}
                  onContextMenu={(e) => clipMenu(e, c)}
                  onDoubleClick={() => {
                    if (c.graphic) return st.set({ editingText: c.graphic[0]?.id ?? null, focus: "program" });
                    st.set({ source: { mediaId: c.mediaId, t: c.in, in: c.in, out: c.out, playing: false }, focus: "source" });
                  }}
                  className={clsx("absolute overflow-hidden rounded-[1px] text-[10.5px] leading-none text-white select-none", !c.enabled && "opacity-50 grayscale", r.track.off && "opacity-60")}
                  style={{
                    left: c.start * pps,
                    width: w,
                    top: r.y + 1,
                    height: r.h - 2,
                    background: m ? (sel ? `color-mix(in srgb, ${col.body} 78%, #fff)` : col.body) : "#7a1d1d",
                    boxShadow: sel ? "inset 0 0 0 1px #ffffff" : "inset 0 0 0 1px rgb(0 0 0 / .55)",
                  }}
                >
                  <div className="relative flex items-center gap-1 truncate px-1 font-semibold [text-shadow:0_1px_0_rgb(0_0_0/.45)]" style={{ height: CLIP_HEAD, background: sel ? `color-mix(in srgb, ${col.head} 70%, #fff)` : col.head }}>
                    {hasFx && <span className="font-bold text-[#f4d03f]">fx</span>}
                    <span className="truncate">{c.name}</span>
                    {c.speed !== 1 && <span className="text-white/80">[{Math.round(c.speed * 100)}%]</span>}
                    {c.reverse && <span className="text-white/80">(inv.)</span>}
                  </div>
                  {isV && m && w > 30 && r.h >= 40 && (
                    <div className="absolute bottom-[1px] left-[1px] overflow-hidden opacity-90" style={{ top: CLIP_HEAD, width: Math.min(w - 2, (r.h - CLIP_HEAD - 3) * 1.78) }}>
                      <div className="relative h-full w-full">{c.graphic ? <div className="h-full w-full bg-[#5a2b4d]" /> : <Thumb media={m} t={c.in + 0.5} />}</div>
                    </div>
                  )}
                  {!isV && m && <Waveform seed={c.mediaId.length + (m.subject?.length ?? 3)} from={c.in} to={c.out} dense={m.subject === "music"} />}
                  {tall && (
                    <svg className="pointer-events-none absolute inset-x-0 bottom-0 w-full overflow-visible" style={{ top: CLIP_HEAD, height: `calc(100% - ${CLIP_HEAD}px)` }} preserveAspectRatio="none">
                      {bandProp.keys && bandProp.keys.length > 0 ? (
                        <>
                          <polyline
                            points={[[0, keyedValue(bandProp, 0)[0]], ...bandProp.keys.map((k) => [k.t, k.v[0]]), [(c.out - c.in) / c.speed, keyedValue(bandProp, 1e9)[0]]].map(([t, v]) => `${(t * pps).toFixed(1)},${(bandY(v) * (r.h - CLIP_HEAD - 2)).toFixed(1)}`).join(" ")}
                            fill="none"
                            stroke="#f4d03f"
                            strokeWidth="1.2"
                          />
                          {bandProp.keys.map((k) => (
                            <circle key={k.id} cx={k.t * pps} cy={bandY(k.v[0]) * (r.h - CLIP_HEAD - 2)} r="3" fill="#f4d03f" />
                          ))}
                        </>
                      ) : (
                        <line x1="0" x2="100%" y1={bandY(bandProp.value[0]) * (r.h - CLIP_HEAD - 2)} y2={bandY(bandProp.value[0]) * (r.h - CLIP_HEAD - 2)} stroke="#f4d03f" strokeWidth="1.2" />
                      )}
                    </svg>
                  )}
                  {tall && (tool === "select" || tool === "pen") && (
                    <div
                      className="absolute inset-x-2 h-2 -translate-y-1/2 cursor-ns-resize"
                      style={{ top: CLIP_HEAD + bandY(keyedValue(bandProp, (hover ?? c.start) - c.start)[0]) * (r.h - CLIP_HEAD - 2) }}
                      onPointerDown={(e) => {
                        if (e.ctrlKey || e.metaKey || tool === "pen") return;
                        e.stopPropagation();
                        st.select(c.id);
                        const v0 = keyedValue(bandProp, xToTime(e.clientX) - c.start)[0];
                        const hh = r.h - CLIP_HEAD - 2;
                        st.beginGesture();
                        drag(
                          e,
                          (_ev, _dx, dy) => {
                            const dv = isV ? (-dy / hh) * 100 : (-dy / hh) * 75;
                            st.updateGesture((q) => ({
                              ...q,
                              clips: q.clips.map((k) => {
                                if (k.id !== c.id) return k;
                                const p = isV ? k.opacity : k.volume;
                                const clampV = (v: number) => (isV ? Math.max(0, Math.min(100, v)) : Math.max(-60, Math.min(15, v)));
                                const np: Prop = p.keys ? { ...p, keys: p.keys.map((kk) => ({ ...kk, v: [clampV(kk.v[0] + dv)] })) } : setAt(p, [clampV(v0 + dv)], 0, fps);
                                return isV ? { ...k, opacity: np } : { ...k, volume: np };
                              }),
                            }));
                          },
                          () => st.endGesture(isV ? "Opacità" : "Volume"),
                        );
                      }}
                    />
                  )}
                  {tool !== "razor" && tool !== "slip" && tool !== "slide" && tool !== "hand" && tool !== "zoom" && !r.track.locked && (
                    <>
                      <div onPointerDown={(e) => onClipDown(e, c, "in")} className={clsx("absolute inset-y-0 left-0 z-[3] w-[7px] hover:bg-[#ff3d3d]/80", edgeCursor)} />
                      <div onPointerDown={(e) => onClipDown(e, c, "out")} className={clsx("absolute inset-y-0 right-0 z-[3] w-[7px] hover:bg-[#ff3d3d]/80", edgeCursor)} />
                    </>
                  )}
                </div>
              );
            })}

            {transitionBoxes.map((b) => b)}

            {marquee && (
              <div
                className="pointer-events-none absolute z-30 border border-white/80 bg-white/10"
                style={{ left: Math.min(marquee.x0, marquee.x1) - HEAD, top: Math.min(marquee.y0, marquee.y1), width: Math.abs(marquee.x1 - marquee.x0), height: Math.abs(marquee.y1 - marquee.y0) }}
              />
            )}
            {snapLine !== null && (
              <div className="pointer-events-none absolute z-20 w-px bg-white" style={{ left: snapLine * pps, top: TOP, height: total - TOP }}>
                <div className="absolute -left-[4px] top-0 border-x-[4px] border-t-[6px] border-x-transparent border-t-white" />
              </div>
            )}
            {hover !== null && tool === "razor" && <div className="pointer-events-none absolute z-20 w-px bg-white/80" style={{ left: hover * pps, top: TOP, height: total - TOP }} />}
            {/* indicatore */}
            <div className="pointer-events-none absolute z-20 w-px bg-ppro-playhead" style={{ left: playhead * pps, top: TOP, height: total - TOP }} />
          </div>
          {/* tratto che oscura le tracce prima dell'area: nessuno */}
        </div>
      </div>
      {/* barra di zoom/scorrimento */}
      <div className="flex h-5 shrink-0 items-center gap-2 px-2" style={{ paddingLeft: HEAD }}>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((Math.log(pps / 2) / Math.log(750)) * 100)}
          onChange={(e) => st.set({ zooms: { ...st.zooms, [seq.id]: 2 * Math.pow(750, Number(e.target.value) / 100) } })}
          className="h-1 w-full accent-[#bdbdbd]"
          aria-label="Zoom timeline"
        />
        <button type="button" title="Aggiungi tracce" onClick={() => st.set({ dialog: { type: "tracks" } })} className="text-[#9a9a9a] hover:text-white">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
