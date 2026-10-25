"use client";

import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import clsx from "clsx";
import { Eye, EyeOff, Lock, Magnet, Volume2, VolumeX } from "lucide-react";
import {
  AUDIO_TRACKS,
  VIDEO_TRACKS,
  clipEnd,
  gapAt,
  getMedia,
  isVideo,
  linked,
  moveGroup,
  placeMedia,
  razor,
  trimEdge,
  usePremiere,
  type PrClip,
  type TrackId,
} from "@/lib/studio/premiere";
import { timecode } from "../chrome";

const TRACKS: TrackId[] = [...VIDEO_TRACKS, ...AUDIO_TRACKS];
const RULER = 26;
const TH = (t: TrackId) => (isVideo(t) ? 46 : 40);
const DIVIDER = 6;
const HEAD = 92;

function trackTop(t: TrackId) {
  let y = RULER;
  for (const k of TRACKS) {
    if (k === t) return y;
    y += TH(k) + (k === "V1" ? DIVIDER : 0);
  }
  return y;
}
const totalHeight = trackTop("A3") + TH("A3") + 8;

function trackAtY(y: number): TrackId | null {
  for (const k of TRACKS) {
    const top = trackTop(k);
    if (y >= top && y < top + TH(k)) return k;
  }
  return null;
}

const CLIP_COLORS = { video: "#6f66e0", audio: "#2f8a57", graphic: "#c0549a" };

export function Timeline() {
  const st = usePremiere();
  const { seq, pxPerSec: pps, playhead, tool, selection, snapping, off, gap } = st;
  const scroller = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const frame = 1 / seq.fps;
  const dur = Math.max(30, ...seq.clips.map(clipEnd)) + 15;
  const width = dur * pps;

  const xToTime = (clientX: number) => {
    const el = scroller.current!;
    const r = el.getBoundingClientRect();
    return Math.max(0, (clientX - r.left - HEAD + el.scrollLeft) / pps);
  };
  const yInContent = (clientY: number) => {
    const el = scroller.current!;
    return clientY - el.getBoundingClientRect().top + el.scrollTop;
  };
  const toFrame = (t: number) => Math.round(t / frame) * frame;

  /** Calamita (S): avvicinandosi a bordi, indicatore o marcatori il tempo si aggancia. */
  const snap = (t: number, exclude: Set<string> = new Set()) => {
    if (!snapping) return toFrame(t);
    const pts = [0, playhead, ...seq.markers, ...seq.clips.filter((c) => !exclude.has(c.id)).flatMap((c) => [c.start, clipEnd(c)])];
    const lim = 8 / pps;
    let best = t;
    let d = lim;
    for (const p of pts) if (Math.abs(p - t) < d) (d = Math.abs(p - t)), (best = p);
    return toFrame(best);
  };

  const scrub = (e: RPointerEvent) => {
    st.set({ playing: false });
    st.setPlayhead(snapping && e.shiftKey ? snap(xToTime(e.clientX)) : toFrame(xToTime(e.clientX)));
  };

  // ---- interazioni con le clip ----
  const onClipDown = (e: RPointerEvent<HTMLDivElement>, c: PrClip, edge: "in" | "out" | null) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (tool === "hand") return;
    if (tool === "razor") {
      const t = snap(xToTime(e.clientX));
      const ids = e.shiftKey ? seq.clips.filter((k) => t > k.start && t < clipEnd(k)).map((k) => k.id) : linked(seq, c.id).map((k) => k.id);
      st.commit(razor(seq, ids, t));
      return;
    }
    if (!selection.includes(c.id) || e.shiftKey) st.select(c.id, e.shiftKey);
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const y0 = e.clientY;
    const group = new Set(linked(seq, c.id).map((k) => k.id));
    let moved = false;
    st.beginGesture();
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      if (!moved && Math.abs(dx) < 3 && Math.abs(ev.clientY - y0) < 6) return;
      moved = true;
      const dt = dx / pps;
      if (edge) {
        const edgeT = edge === "in" ? c.start : clipEnd(c);
        const t = snap(edgeT + dt, group);
        st.updateGesture((base) => trimEdge(base, c.id, edge, t, tool === "ripple"));
      } else if (tool === "select") {
        // aggancia l'inizio o la fine della clip, quello che è più vicino a un punto
        const s0 = snap(c.start + dt, group);
        const e0 = snap(clipEnd(c) + dt, group);
        const start = Math.abs(s0 - (c.start + dt)) <= Math.abs(e0 - (clipEnd(c) + dt)) ? s0 : e0 - (clipEnd(c) - c.start);
        const steps = Math.round((ev.clientY - y0) / TH(c.track));
        const delta = isVideo(c.track) ? -steps : steps;
        st.updateGesture((base) => moveGroup(base, c.id, Math.max(0, toFrame(start)), delta));
      }
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      st.endGesture();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const onBackgroundDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (tool === "hand") {
      const el = scroller.current!;
      const x0 = e.clientX;
      const s0 = el.scrollLeft;
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      const move = (ev: PointerEvent) => (el.scrollLeft = s0 - (ev.clientX - x0));
      const up = () => {
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
      };
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
      return;
    }
    const track = trackAtY(yInContent(e.clientY));
    const t = xToTime(e.clientX);
    const g = track ? gapAt(seq, track, t) : null;
    if (g && track) st.set({ selection: [], gap: { track, ...g } });
    else st.select(null);
  };

  // ---- trascinare dal pannello Progetto o dagli Effetti ----
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const mediaId = e.dataTransfer.getData("text/x-media");
    const fx = e.dataTransfer.getData("text/x-fx");
    const track = trackAtY(yInContent(e.clientY));
    const t = snap(xToTime(e.clientX));
    if (fx) {
      const c = track ? seq.clips.find((k) => k.track === track && t >= k.start - 1 && t <= clipEnd(k) + 1) : null;
      if (!c) return st.notify("Trascina la transizione su una clip");
      if (fx === "vol") return;
      const near = Math.abs(t - c.start) <= Math.abs(t - clipEnd(c)) ? c : seq.clips.find((k) => k.track === c.track && Math.abs(k.start - clipEnd(c)) < 0.01) ?? c;
      st.commit({ ...seq, clips: seq.clips.map((k) => (k.id === near.id ? { ...k, transition: fx as "dissolve" | "dip" } : k)) }, [near.id]);
      return st.notify(fx === "dip" ? "Tuffo nel nero applicato" : "Dissolvenza incrociata applicata");
    }
    if (!mediaId) return;
    const media = getMedia(mediaId);
    const v = track && isVideo(track) ? track : st.targetV;
    const a = track && !isVideo(track) ? track : st.targetA;
    if (media.kind === "audio" && track && isVideo(track)) return st.notify("L'audio va su una traccia audio (A1-A3)");
    if (media.kind !== "audio" && !media.hasAudio && track && !isVideo(track)) return st.notify("Questa clip non ha audio: usa una traccia video");
    const len = Math.min(media.duration, media.kind === "audio" ? 20 : media.duration);
    const r = placeMedia(seq, media, t, 0, len, e.ctrlKey || e.metaKey ? "insert" : "overwrite", v, a);
    st.commit(r.seq, r.ids);
  };

  // ---- righello ----
  const step = pps >= 80 ? 1 : pps >= 30 ? 2 : pps >= 12 ? 5 : 10;
  const ticks = Array.from({ length: Math.ceil(dur / step) + 1 }, (_, i) => i * step);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-7 shrink-0 items-center gap-3 border-b border-[#151515] px-2 text-[12px]">
        <span className="font-mono text-[15px] text-[#2d8ceb]">{timecode(playhead, seq.fps)}</span>
        <button
          type="button"
          title="Aggancia (S)"
          onClick={() => st.set({ snapping: !snapping })}
          className={clsx("rounded p-1", snapping ? "bg-[#2680eb]/25 text-[#5aa9ff]" : "text-[#8f8f8f] hover:bg-white/5")}
        >
          <Magnet size={14} />
        </button>
        <span className="truncate text-[#8f8f8f]">
          {seq.width}×{seq.height} · {String(seq.fps).replace(".", ",")} fps
        </span>
        <input
          type="range"
          min={6}
          max={200}
          value={pps}
          onChange={(e) => st.set({ pxPerSec: Number(e.target.value) })}
          className="ml-auto w-24 accent-[#9a9a9a]"
          aria-label="Zoom timeline"
        />
      </div>
      <div
        ref={scroller}
        className={clsx("relative min-h-0 flex-1 overflow-auto", tool === "razor" && "cursor-crosshair", tool === "hand" && "cursor-grab")}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onPointerMove={(e) => tool === "razor" && setHoverX(xToTime(e.clientX))}
        onPointerLeave={() => setHoverX(null)}
      >
        <div className="relative" style={{ width: width + HEAD, height: totalHeight }}>
          {/* intestazioni delle tracce, fisse a sinistra */}
          <div className="sticky left-0 z-20 h-full w-[92px] border-r border-black bg-[#232323]">
            <div style={{ height: RULER }} className="border-b border-black" />
            {TRACKS.map((t) => {
              const isOff = off.includes(t);
              const target = t === st.targetV || t === st.targetA;
              return (
                <div
                  key={t}
                  className="absolute left-0 flex w-full items-center gap-1 border-b border-[#1a1a1a] bg-[#262626] px-1 text-[11px]"
                  style={{ top: trackTop(t), height: TH(t) }}
                >
                  <button
                    type="button"
                    title="Traccia di destinazione"
                    onClick={() => st.set(isVideo(t) ? { targetV: t } : { targetA: t })}
                    className={clsx("w-7 rounded-[3px] py-0.5 font-bold", target ? "bg-[#2680eb] text-white" : "bg-[#333] text-[#9a9a9a]")}
                  >
                    {t}
                  </button>
                  <Lock size={12} className="text-[#6a6a6a]" />
                  <button
                    type="button"
                    title={isVideo(t) ? "Attiva/disattiva output traccia" : "Disattiva audio traccia"}
                    onClick={() => st.set({ off: isOff ? off.filter((k) => k !== t) : [...off, t] })}
                    className={clsx("rounded p-0.5", isOff ? "text-[#ff8a3d]" : "text-[#9a9a9a] hover:text-white")}
                  >
                    {isVideo(t) ? isOff ? <EyeOff size={13} /> : <Eye size={13} /> : isOff ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="absolute top-0" style={{ left: HEAD, width, height: totalHeight }} onPointerDown={onBackgroundDown}>
            {/* righello */}
            <div
              className="sticky top-0 z-10 cursor-pointer border-b border-black bg-[#1f1f1f]"
              style={{ height: RULER }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                scrub(e);
              }}
              onPointerMove={(e) => e.buttons & 1 && scrub(e)}
            >
              {ticks.map((t) => (
                <div key={t} className="absolute top-0 h-full border-l border-[#4a4a4a]" style={{ left: t * pps }}>
                  <span className="absolute left-1 top-0.5 whitespace-nowrap font-mono text-[9px] text-[#8a8a8a]">{timecode(t, seq.fps).slice(3)}</span>
                </div>
              ))}
              {seq.markers.map((m, i) => (
                <div key={i} className="absolute bottom-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[8px] border-x-transparent border-t-[#ffc93c]" style={{ left: m * pps }} />
              ))}
            </div>

            {/* sfondo delle tracce */}
            {TRACKS.map((t) => (
              <div key={t} className="absolute left-0 w-full border-b border-[#1a1a1a]" style={{ top: trackTop(t), height: TH(t), background: t === "V1" || t === "A1" ? "#1d1d1d" : "#1a1a1a" }} />
            ))}
            <div className="absolute left-0 w-full bg-[#111]" style={{ top: trackTop("V1") + TH("V1"), height: DIVIDER }} />

            {gap && (
              <div className="absolute bg-white/15 outline outline-1 outline-white/60" style={{ top: trackTop(gap.track), height: TH(gap.track), left: gap.from * pps, width: (gap.to - gap.from) * pps }} />
            )}

            {seq.clips.map((c) => {
              const m = getMedia(c.mediaId);
              const sel = selection.includes(c.id);
              const w = Math.max(2, (c.out - c.in) * pps);
              const color = isVideo(c.track) ? (m.kind === "graphic" ? CLIP_COLORS.graphic : CLIP_COLORS.video) : CLIP_COLORS.audio;
              const edgeCursor = tool === "ripple" ? "cursor-[col-resize]" : "cursor-ew-resize";
              return (
                <div
                  key={c.id}
                  onPointerDown={(e) => onClipDown(e, c, null)}
                  className={clsx(
                    "absolute overflow-hidden rounded-[3px] border text-[10px] leading-tight text-white/95 select-none",
                    sel ? "border-white brightness-125" : "border-black/40",
                    off.includes(c.track) && "opacity-40",
                  )}
                  style={{
                    left: c.start * pps,
                    width: w,
                    top: trackTop(c.track) + 2,
                    height: TH(c.track) - 4,
                    background: isVideo(c.track)
                      ? color
                      : `${color} repeating-linear-gradient(90deg, transparent 0 2px, rgb(255 255 255 / .18) 2px 3px)`,
                    backgroundBlendMode: "normal",
                  }}
                >
                  <div className="truncate px-1 pt-0.5 font-semibold">
                    {c.fx.opacity < 100 || c.fx.scale !== 100 || c.fx.x || c.fx.y || c.fx.rotation ? <span className="mr-0.5 text-[#ffc93c]">fx</span> : null}
                    {m.name}
                  </div>
                  {!isVideo(c.track) && (
                    <svg className="absolute inset-x-0 bottom-0 h-1/2 w-full" preserveAspectRatio="none" viewBox="0 0 100 10">
                      <path
                        d={`M0 5 ${Array.from({ length: 50 }, (_, i) => `L${i * 2} ${5 - Math.abs(Math.sin((i + c.in * 7) * 1.3)) * 4} L${i * 2 + 1} ${5 + Math.abs(Math.sin((i + c.in * 7) * 0.9)) * 4}`).join(" ")}`}
                        stroke="rgb(255 255 255 / .55)"
                        strokeWidth=".6"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}
                  {c.transition && (
                    <div
                      className="absolute left-0 top-0 h-full bg-[linear-gradient(135deg,rgb(160_160_255/.85),rgb(90_90_200/.85))] text-[8px]"
                      style={{ width: Math.min(w / 2, pps * 1) }}
                      title={c.transition === "dip" ? "Tuffo nel nero" : "Dissolvenza incrociata"}
                    />
                  )}
                  {tool !== "razor" && (
                    <>
                      <div onPointerDown={(e) => onClipDown(e, c, "in")} className={clsx("absolute inset-y-0 left-0 w-2 hover:bg-[#ff4040]/70", edgeCursor)} />
                      <div onPointerDown={(e) => onClipDown(e, c, "out")} className={clsx("absolute inset-y-0 right-0 w-2 hover:bg-[#ff4040]/70", edgeCursor)} />
                    </>
                  )}
                </div>
              );
            })}

            {hoverX !== null && tool === "razor" && <div className="pointer-events-none absolute w-px bg-white/70" style={{ left: hoverX * pps, top: RULER, height: totalHeight - RULER }} />}

            {/* indicatore di riproduzione */}
            <div className="pointer-events-none absolute top-0 z-10" style={{ left: playhead * pps, height: totalHeight }}>
              <div className="absolute -left-[6px] top-[12px] h-3 w-3 rounded-b-sm bg-[#2d8ceb]" />
              <div className="absolute left-0 top-0 h-full w-px bg-[#2d8ceb]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
