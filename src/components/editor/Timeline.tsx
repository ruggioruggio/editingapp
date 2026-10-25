"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import clsx from "clsx";
import { clipDuration, clipEnd } from "@/lib/editor/ops";
import { useEditor } from "@/lib/editor/store";
import { formatTimecode, toFrame } from "@/lib/editor/timecode";
import type { Clip, TrackId } from "@/lib/editor/types";

const HEADER_W = 52;
const RULER_H = 28;
const TRACKS: { id: TrackId; height: number; kind: "video" | "audio" }[] = [
  { id: "V1", height: 56, kind: "video" },
  { id: "A1", height: 44, kind: "audio" },
];
const TICK_STEPS = [1, 2, 5, 10, 30];
const MARKER_SHAPE = "polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)";

export function Timeline() {
  const seq = useEditor((s) => s.seq);
  const viewDuration = useEditor((s) => s.viewDuration);
  const playhead = useEditor((s) => s.playhead);
  const tool = useEditor((s) => s.tool);
  const selection = useEditor((s) => s.selection);
  const { select, setPlayhead, setPlaying, razorAt } = useEditor.getState();

  const laneRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const [laneW, setLaneW] = useState(0);
  const [hoverT, setHoverT] = useState<number | null>(null);

  useEffect(() => {
    const el = laneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setLaneW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pps = laneW > 0 ? laneW / viewDuration : 0; // pixel per secondo
  const snapPoints = useMemo(
    () => [playhead, ...seq.markers.map((m) => m.time), ...seq.clips.flatMap((c) => [c.start, clipEnd(c)])],
    [seq, playhead],
  );

  /** Tempo sotto il puntatore, con snapping a marker/playhead/bordi come in Premiere (S). */
  function timeAt(e: PointerEvent, snap: boolean): number {
    if (!laneRef.current || pps === 0) return 0;
    const rect = laneRef.current.getBoundingClientRect();
    const raw = Math.max(0, Math.min(viewDuration, (e.clientX - rect.left) / pps));
    if (snap) {
      const radius = (e.pointerType === "touch" ? 16 : 8) / pps;
      let best: number | null = null;
      for (const p of snapPoints) {
        if (Math.abs(p - raw) <= radius && (best === null || Math.abs(p - raw) < Math.abs(best - raw))) best = p;
      }
      if (best !== null) return best;
    }
    return toFrame(raw, seq.fps);
  }

  const onRulerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubbing.current = true;
    setPlaying(false);
    setPlayhead(timeAt(e, false));
  };
  const onRulerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (scrubbing.current) setPlayhead(timeAt(e, false));
  };
  const stopScrub = () => {
    scrubbing.current = false;
  };

  const onClipDown = (e: PointerEvent<HTMLDivElement>, clip: Clip) => {
    e.stopPropagation();
    if (tool === "razor") razorAt(clip.id, timeAt(e, true));
    else select(clip.id);
  };

  const step = TICK_STEPS.find((s) => s * pps >= 84) ?? 30;
  const majorTicks: number[] = [];
  for (let t = 0; t <= viewDuration; t += step) majorTicks.push(t);
  const minorTicks: number[] = [];
  for (let t = 0; t <= viewDuration; t += step / 5) minorTicks.push(t);

  const mediaName = (id: string) => seq.media.find((m) => m.id === id)?.name ?? "Clip";
  const tracksHeight = TRACKS.reduce((sum, t) => sum + t.height, 0);

  return (
    <div className="flex select-none overflow-hidden rounded-md border border-line bg-panel">
      <div className="shrink-0 border-r border-line bg-panel-2" style={{ width: HEADER_W }}>
        <div className="flex items-center justify-center border-b border-line" style={{ height: RULER_H }}>
          <span className="font-mono text-[10px] text-ink-mute">{seq.fps} fps</span>
        </div>
        {TRACKS.map((t) => (
          <div key={t.id} className="flex items-center justify-center border-b border-line-soft" style={{ height: t.height }}>
            <span
              className={clsx(
                "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                t.kind === "video" ? "bg-vclip/30 text-pr" : "bg-aclip/30 text-success",
              )}
            >
              {t.id}
            </span>
          </div>
        ))}
      </div>

      <div
        ref={laneRef}
        className={clsx("relative min-w-0 flex-1 touch-none", tool === "razor" ? "cursor-crosshair" : "cursor-default")}
        onPointerMove={(e) => setHoverT(tool === "razor" && e.pointerType === "mouse" ? timeAt(e, true) : null)}
        onPointerLeave={() => setHoverT(null)}
      >
        {pps === 0 ? (
          <div style={{ height: RULER_H + tracksHeight }} />
        ) : (
          <>
            <div
              className="relative cursor-ew-resize border-b border-line bg-panel-2"
              style={{ height: RULER_H }}
              onPointerDown={onRulerDown}
              onPointerMove={onRulerMove}
              onPointerUp={stopScrub}
              onPointerCancel={stopScrub}
            >
              {minorTicks.map((t) => (
                <div key={`m${t}`} className="absolute bottom-0 h-1.5 w-px bg-line" style={{ left: t * pps }} />
              ))}
              {majorTicks.map((t) => (
                <div key={t} className="absolute inset-y-0" style={{ left: t * pps }}>
                  <div className="absolute bottom-0 h-3 w-px bg-ink-mute" />
                  <span className="absolute left-1 top-0.5 whitespace-nowrap font-mono text-[9px] text-ink-mute">
                    {formatTimecode(t, seq.fps)}
                  </span>
                </div>
              ))}
              {seq.markers.map((m) => (
                <div
                  key={m.id}
                  title={m.label}
                  className="absolute bottom-0 h-3 w-3 -translate-x-1/2 bg-marker"
                  style={{ left: m.time * pps, clipPath: MARKER_SHAPE }}
                />
              ))}
            </div>

            {TRACKS.map((track) => (
              <div
                key={track.id}
                className="relative border-b border-line-soft bg-[#191919]"
                style={{ height: track.height }}
                onPointerDown={() => select(null)}
              >
                {seq.clips
                  .filter((c) => c.track === track.id)
                  .map((clip) => (
                    <ClipBlock
                      key={clip.id}
                      clip={clip}
                      kind={track.kind}
                      name={mediaName(clip.mediaId)}
                      pps={pps}
                      selected={selection.includes(clip.id)}
                      onPointerDown={(e) => onClipDown(e, clip)}
                    />
                  ))}
              </div>
            ))}

            {seq.markers.map((m) => (
              <div
                key={m.id}
                className="pointer-events-none absolute bottom-0 w-px bg-marker/50"
                style={{ left: m.time * pps, top: RULER_H }}
              />
            ))}
            {hoverT !== null && (
              <div
                className="pointer-events-none absolute bottom-0 border-l border-dashed border-white/80"
                style={{ left: hoverT * pps, top: RULER_H }}
              />
            )}
            <div className="pointer-events-none absolute inset-y-0 z-20" style={{ left: playhead * pps }}>
              <div className="absolute -left-[5px] top-0 h-3 w-[11px] rounded-b-sm bg-accent" />
              <div className="absolute inset-y-0 left-0 w-px bg-accent" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClipBlock({
  clip,
  kind,
  name,
  pps,
  selected,
  onPointerDown,
}: {
  clip: Clip;
  kind: "video" | "audio";
  name: string;
  pps: number;
  selected: boolean;
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={clsx(
        "absolute inset-y-1 overflow-hidden rounded-[3px] border",
        kind === "video" ? "border-[#a49df7] bg-vclip" : "border-[#5ccf8d] bg-aclip",
        selected && "z-10 brightness-125 ring-2 ring-white",
      )}
      style={{ left: clip.start * pps, width: Math.max(2, clipDuration(clip) * pps) }}
    >
      {kind === "video" ? (
        <div className="truncate px-1.5 text-[11px] font-medium leading-5 text-white">{name}</div>
      ) : (
        <Waveform clip={clip} pps={pps} />
      )}
    </div>
  );
}

/** Forma d'onda finta ma deterministica sul tempo sorgente: resta coerente dopo i tagli. */
function Waveform({ clip, pps }: { clip: Clip; pps: number }) {
  const width = clipDuration(clip) * pps;
  const bars = Math.max(1, Math.floor(width / 3));
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${Math.max(1, width)} 100`}
      preserveAspectRatio="none"
      fill="rgba(255,255,255,0.55)"
    >
      {Array.from({ length: bars }, (_, i) => {
        const t = clip.in + (i * 3) / pps;
        const a = 0.2 + 0.75 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 1.7 + 1));
        return <rect key={i} x={i * 3} y={50 - a * 42} width={1.6} height={a * 84} />;
      })}
    </svg>
  );
}
