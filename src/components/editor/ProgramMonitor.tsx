"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, SkipBack } from "lucide-react";
import { clipAt, sequenceDuration } from "@/lib/editor/ops";
import { useEditor } from "@/lib/editor/store";
import { formatTimecode } from "@/lib/editor/timecode";
import type { Sequence } from "@/lib/editor/types";

const W = 640;
const H = 360;

function drawFrame(ctx: CanvasRenderingContext2D, seq: Sequence, t: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const clip = clipAt(seq, "V1", t);
  const media = clip && seq.media.find((m) => m.id === clip.mediaId);
  if (!clip || !media) return;

  const src = clip.in + (t - clip.start);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, `hsl(${media.hue} 35% 30%)`);
  bg.addColorStop(1, `hsl(${(media.hue + 40) % 360} 45% 10%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2 + Math.sin(src * 1.6) * 6;
  const cy = H * 0.48;
  ctx.fillStyle = `hsl(${media.hue} 20% 75%)`;
  ctx.beginPath();
  ctx.ellipse(cx, H + 20, 120, 110, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  for (const dx of [-18, 18]) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy - 8, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#2a1d1d";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 22, 14, 2 + Math.abs(Math.sin(src * 11)) * 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const event = media.events?.find((e) => src >= e.from && src < e.to);
  if (event) {
    ctx.fillStyle = "rgba(255, 60, 60, 0.28)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "bold 42px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(event.label, W / 2, 78);
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(24, H - 64, 250, 36);
  ctx.font = "600 16px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.fillText(media.name, 36, H - 40);

  ctx.font = "12px monospace";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText(`SRC ${formatTimecode(src, seq.fps)}`, W - 16, 24);
}

export function ProgramMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seq = useEditor((s) => s.seq);
  const playhead = useEditor((s) => s.playhead);
  const playing = useEditor((s) => s.playing);
  const { togglePlay, setPlayhead, setPlaying } = useEditor.getState();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawFrame(ctx, seq, playhead);
  }, [seq, playhead]);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-line bg-panel">
      <div className="flex h-7 items-center border-b border-line px-3 text-[11px] text-ink-dim">
        <span className="border-b-2 border-accent pb-0.5 text-ink">Programma: {seq.name}</span>
      </div>
      <div className="flex items-center justify-center bg-black p-1.5">
        <canvas ref={canvasRef} width={W} height={H} className="aspect-video max-h-[38vh] w-full object-contain" />
      </div>
      <div className="flex items-center justify-between border-t border-line px-3 py-1 text-xs">
        <span className="font-mono text-accent">{formatTimecode(playhead, seq.fps)}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Vai all'inizio (Home)"
            onClick={(e) => {
              setPlaying(false);
              setPlayhead(0);
              e.currentTarget.blur();
            }}
            className="grid h-7 w-7 place-items-center rounded text-ink-dim hover:bg-panel-3 hover:text-ink"
          >
            <SkipBack size={14} />
          </button>
          <button
            type="button"
            title="Riproduci / Pausa (Spazio)"
            onClick={(e) => {
              togglePlay();
              e.currentTarget.blur();
            }}
            className="grid h-7 w-7 place-items-center rounded text-ink hover:bg-panel-3"
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
        <span className="font-mono text-ink-mute">{formatTimecode(sequenceDuration(seq), seq.fps)}</span>
      </div>
    </div>
  );
}
