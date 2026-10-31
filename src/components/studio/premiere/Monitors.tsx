"use client";

import { useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Camera, ChevronDown, Film, Pause, Play, Plus, Volume2, Wrench } from "lucide-react";
import { setAt } from "@/lib/studio/anim";
import { isStill } from "@/lib/studio/media";
import { textCss } from "@/lib/studio/text";
import { MARKER_COLORS, clipEnd, isVideoTrack, playheadOf, seqDuration, seqOf, snapFrame, usePremiere, type Clip, type Sequence } from "@/lib/studio/premiere";
import { MediaContent, Stage, boxTransform } from "../render";
import { timecode, usePlayback } from "../chrome";
import { SequenceAudio, SequenceFrame, boxSize, motionAt } from "./compose";
import * as A from "./actions";

const ZOOMS = ["fit", 10, 25, 50, 75, 100, 150, 200, 400] as const;

function TransportButton({ title, onClick, children, active }: { title: string; onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick} className={clsx("grid h-7 w-8 place-items-center rounded hover:bg-white/10", active ? "text-[#3d9cf0]" : "text-[#d0d0d0]")}>
      {children}
    </button>
  );
}

const I = {
  marker: (
    <svg width="11" height="13" viewBox="0 0 11 13">
      <path d="M1 1h9v8l-4.5 3L1 9z" fill="currentColor" />
    </svg>
  ),
  in: <span className="text-[15px] leading-none">{"{"}</span>,
  out: <span className="text-[15px] leading-none">{"}"}</span>,
  goIn: (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <path d="M1 1h1.5v10H1zM5 1h2v1H5v8h2v1H5zM15 1v10L8 6z" />
    </svg>
  ),
  goOut: (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <path d="M13.5 1H15v10h-1.5zM11 1H9v1h2v8H9v1h2zM1 1v10l7-5z" />
    </svg>
  ),
  back: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M1 1h1.5v10H1zM11 1v10L3.5 6z" />
    </svg>
  ),
  fwd: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M9.5 1H11v10H9.5zM1 1v10l7.5-5z" />
    </svg>
  ),
  lift: (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 9v4h12V9M8 1v8M5 4l3-3 3 3" />
    </svg>
  ),
  extract: (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 9v4h12V9M5 11h6M8 1v6M5 4l3-3 3 3" />
    </svg>
  ),
  insert: (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 9v4h12V9M8 1v9M5 7l3 3 3-3" />
    </svg>
  ),
  overwrite: (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 9h12v4H2zM8 1v6M5 4l3 3 3-3" />
    </svg>
  ),
  compare: (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="14" height="10" rx="1" />
      <path d="M8 1v10" />
    </svg>
  ),
};

function TimeBar({ value, max, inP, outP, markers, onScrub, fps }: { value: number; max: number; inP: number | null; outP: number | null; markers?: { t: number; color: number }[]; onScrub: (t: number) => void; fps: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const at = (x: number) => {
    const r = ref.current!.getBoundingClientRect();
    onScrub(snapFrame(Math.max(0, Math.min(max, ((x - r.left) / r.width) * max)), fps));
  };
  const pct = (t: number) => `${(Math.min(max, t) / (max || 1)) * 100}%`;
  return (
    <div className="shrink-0 px-3">
      <div
        ref={ref}
        className="relative h-[26px] cursor-pointer touch-none"
        onPointerDown={(e) => {
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
          at(e.clientX);
        }}
        onPointerMove={(e) => e.buttons & 1 && at(e.clientX)}
      >
        {Array.from({ length: 41 }, (_, i) => (
          <div key={i} className="absolute bottom-[4px] border-l border-[#6a6a6a]" style={{ left: `${(i / 40) * 100}%`, height: i % 5 === 0 ? 8 : 4 }} />
        ))}
        {(inP !== null || outP !== null) && <div className="absolute bottom-0 h-[3px] bg-[#9a9a9a]" style={{ left: pct(inP ?? 0), right: `calc(100% - ${pct(outP ?? max)})` }} />}
        {markers?.map((m, i) => (
          <div key={i} className="absolute top-0 h-[9px] w-[8px] -translate-x-1/2" style={{ left: pct(m.t), background: MARKER_COLORS[m.color], clipPath: "polygon(0 0,100% 0,100% 60%,50% 100%,0 60%)" }} />
        ))}
        <div className="absolute top-[6px] h-[12px] w-[11px] -translate-x-1/2 bg-[#3d9cf0]" style={{ left: pct(value), clipPath: "polygon(0 0,100% 0,100% 55%,50% 100%,0 55%)" }} />
      </div>
      <div className="relative mb-1 h-[10px]">
        <div className="absolute inset-x-1 top-1/2 h-[2px] -translate-y-1/2 rounded bg-[#3a3a3a]" />
        <div className="absolute left-0 top-0 h-[10px] w-[10px] rounded-full border-2 border-[#d0d0d0] bg-[#1e1e1e]" />
        <div className="absolute right-0 top-0 h-[10px] w-[10px] rounded-full border-2 border-[#d0d0d0] bg-[#1e1e1e]" />
      </div>
    </div>
  );
}

function ZoomSelect({ value, onChange }: { value: "fit" | number; onChange: (v: "fit" | number) => void }) {
  return (
    <span className="relative inline-flex">
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value === "fit" ? "fit" : Number(e.target.value))}
        className="h-6 appearance-none rounded-[4px] border border-[#3a3a3a] bg-[#1b1b1b] pl-2 pr-6 text-[12px] text-[#d0d0d0] outline-none"
      >
        {ZOOMS.map((z) => (
          <option key={z} value={z}>
            {z === "fit" ? "Adatta" : `${z}%`}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1.5 text-[#9a9a9a]" />
    </span>
  );
}

function ResSelect() {
  const [v, setV] = useState("1/2");
  return (
    <span className="relative inline-flex">
      <select value={v} onChange={(e) => setV(e.target.value)} className="h-6 appearance-none rounded-[4px] border border-[#3a3a3a] bg-[#1b1b1b] pl-2 pr-6 text-[12px] text-[#d0d0d0] outline-none">
        {["Intera", "1/2", "1/4", "1/8"].map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1.5 text-[#9a9a9a]" />
    </span>
  );
}

export function SourceMonitor() {
  const st = usePremiere();
  const { source, project } = st;
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const m = source.mediaId ? project.media[source.mediaId] : null;
  usePlayback(source.playing && !!m, (dt) => {
    const s = usePremiere.getState();
    const mm = s.source.mediaId ? s.project.media[s.source.mediaId] : null;
    if (!mm) return;
    const t = s.source.t + dt;
    const end = s.source.out ?? mm.duration;
    s.set({ source: { ...s.source, t: t >= end ? end : t, playing: t < end } });
  });
  if (!m) return <div className="grid h-full place-items-center text-[12.5px] text-[#8a8a8a]">(nessuna clip)</div>;
  const fps = m.fps || 25;
  const dur = isStill(m) ? m.duration : m.duration;
  const set = (patch: Partial<typeof source>) => st.set({ source: { ...source, ...patch } });
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <Stage w={m.width || 1920} h={m.height || 1080} zoom={zoom}>
          {m.kind === "audio" ? (
            <div className="grid h-full w-full place-items-center bg-[#0f1f17]">
              <Volume2 size={200} className="text-[#3ecf8e]/50" />
            </div>
          ) : (
            <MediaContent media={m} t={source.t} playing={source.playing} />
          )}
        </Stage>
        <div className="pointer-events-none absolute left-3 top-2 text-[11px] text-white/70">{m.name}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-3 pt-1.5 text-[12px]">
        <span className="font-mono text-[13px] text-[#3d9cf0] sm:text-[16px]">{timecode(source.t, fps)}</span>
        <ZoomSelect value={zoom} onChange={setZoom} />
        <span className="ml-auto hidden sm:inline">
          <ResSelect />
        </span>
        <Wrench size={13} className="hidden text-[#9a9a9a] sm:block" />
        <span className="ml-auto font-mono text-[13px] text-[#d0d0d0] sm:ml-0 sm:text-[16px]">{timecode((source.out ?? dur) - (source.in ?? 0), fps)}</span>
      </div>
      <TimeBar value={source.t} max={dur} inP={source.in} outP={source.out} fps={fps} onScrub={(t) => set({ t, playing: false })} />
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-0.5 pb-1.5">
        <TransportButton title="Aggiungi marcatore (M)" onClick={A.addMarker}>
          {I.marker}
        </TransportButton>
        <TransportButton title="Contrassegna attacco (I)" onClick={() => set({ in: source.t })}>
          {I.in}
        </TransportButton>
        <TransportButton title="Contrassegna uscita (O)" onClick={() => set({ out: source.t })}>
          {I.out}
        </TransportButton>
        <TransportButton title="Vai ad attacco (Maiusc+I)" onClick={() => set({ t: source.in ?? 0 })}>
          {I.goIn}
        </TransportButton>
        <TransportButton title="Indietro di un fotogramma (Sinistra)" onClick={() => set({ t: Math.max(0, source.t - 1 / fps), playing: false })}>
          {I.back}
        </TransportButton>
        <TransportButton title="Riproduci/Interrompi (Spazio)" onClick={() => set({ playing: !source.playing, t: !source.playing && source.t >= (source.out ?? dur) - 0.01 ? source.in ?? 0 : source.t })} active={source.playing}>
          {source.playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </TransportButton>
        <TransportButton title="Avanti di un fotogramma (Destra)" onClick={() => set({ t: Math.min(dur, source.t + 1 / fps), playing: false })}>
          {I.fwd}
        </TransportButton>
        <TransportButton title="Vai a uscita (Maiusc+O)" onClick={() => set({ t: source.out ?? dur })}>
          {I.goOut}
        </TransportButton>
        <TransportButton title="Inserisci (,)" onClick={() => A.place("insert")}>
          {I.insert}
        </TransportButton>
        <TransportButton title="Sovrascrivi (.)" onClick={() => A.place("overwrite")}>
          {I.overwrite}
        </TransportButton>
        <TransportButton title="Esporta fotogramma" onClick={() => st.notify("Esporta fotogramma: l'esportazione non è disponibile nel simulatore")}>
          <Camera size={14} />
        </TransportButton>
        <span
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/x-source", "1")}
          title="Trascina nella timeline (o premi , / .)"
          className="ml-2 grid h-7 w-8 cursor-grab place-items-center rounded text-[#d0d0d0] hover:bg-white/10"
        >
          <Film size={14} />
        </span>
      </div>
    </div>
  );
}

function SelectionBox({ c, seq, toLocal, scale }: { c: Clip; seq: Sequence; toLocal: (x: number, y: number) => [number, number]; scale: number }) {
  const st = usePremiere();
  const T = playheadOf(st);
  const m = st.project.media[c.mediaId];
  const { bw, bh } = boxSize(m, seq);
  const mo = motionAt(c, T - c.start);
  const lt = T - c.start;
  const k = 1 / scale;
  const startMove = (e: React.PointerEvent, mode: "move" | "scale") => {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    try { el.setPointerCapture(e.pointerId); } catch {}
    const [x0, y0] = toLocal(e.clientX, e.clientY);
    const p0 = mo.position;
    const s0 = mo.scale[1];
    const d0 = Math.hypot(x0 - p0[0], y0 - p0[1]) || 1;
    const move = (ev: PointerEvent) => {
      const [x, y] = toLocal(ev.clientX, ev.clientY);
      A.updateClip(
        c.id,
        (cl) =>
          mode === "move"
            ? { ...cl, motion: { ...cl.motion, position: setAt(cl.motion.position, [Math.round(p0[0] + x - x0), Math.round(p0[1] + y - y0)], lt, seq.fps) } }
            : { ...cl, motion: { ...cl.motion, scale: setAt(cl.motion.scale, [+((s0 * Math.hypot(x - p0[0], y - p0[1])) / d0).toFixed(1)], lt, seq.fps) } },
        mode === "move" ? "Posizione" : "Scala",
        mode + c.id,
      );
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };
  return (
    <div className="pointer-events-auto absolute left-0 top-0" style={{ width: bw, height: bh, ...boxTransform(mo), outline: `${1.5 * k}px solid #fff`, cursor: "move" }} onPointerDown={(e) => startMove(e, "move")}>
      {[
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [0.5, 0],
        [0.5, 1],
        [0, 0.5],
        [1, 0.5],
      ].map(([fx, fy], i) => (
        <div
          key={i}
          onPointerDown={(e) => startMove(e, "scale")}
          className="absolute border bg-[#1e1e1e]"
          style={{ left: fx * bw - 5 * k / (mo.scale[0] / 100 || 1), top: fy * bh - 5 * k / (mo.scale[1] / 100 || 1), width: 10 * k / (mo.scale[0] / 100 || 1), height: 10 * k / (mo.scale[1] / 100 || 1), borderColor: "#fff", borderWidth: k / (mo.scale[0] / 100 || 1), cursor: "nwse-resize" }}
        />
      ))}
      <div className="absolute" style={{ left: mo.anchor[0] - 8 * k, top: mo.anchor[1] - 8 * k, width: 16 * k, height: 16 * k, border: `${k}px solid #fff`, borderRadius: "50%" }} />
    </div>
  );
}

export function ProgramMonitor() {
  const st = usePremiere();
  const seq = seqOf(st);
  const T = playheadOf(st);
  const [editing, setEditing] = useState<string | null>(null);
  usePlayback(st.playing && !!seq, (dt) => {
    const s = usePremiere.getState();
    const q = seqOf(s);
    if (!q) return;
    const end = q.outPoint ?? seqDuration(q);
    const t = playheadOf(s) + dt * s.rate;
    if (t >= end && s.rate > 0) {
      s.setPlayhead(end);
      s.set({ playing: false, rate: 1 });
    } else if (t <= 0 && s.rate < 0) {
      s.setPlayhead(0);
      s.set({ playing: false, rate: 1 });
    } else s.setPlayhead(t);
  });
  if (!seq) return <div className="grid h-full place-items-center text-[12.5px] text-[#8a8a8a]">(nessuna sequenza)</div>;
  const dur = Math.max(1, seqDuration(seq));
  const sel = seq.clips.find((c) => st.selection.includes(c.id) && isVideoTrack(seq, c.track) && T >= c.start && T < clipEnd(c));
  const editingClip = st.editingText ? seq.clips.find((c) => c.graphic?.some((g) => g.id === st.editingText)) : undefined;
  const editingLayer = editingClip?.graphic?.find((g) => g.id === st.editingText);

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1" onPointerDownCapture={() => st.set({ focus: "program" })}>
        <Stage
          w={seq.width}
          h={seq.height}
          zoom={st.programZoom}
          className={clsx((st.tool === "type" || st.tool === "rect" || st.tool === "ellipse") && "cursor-crosshair")}
          onPointerDown={(e, toLocal) => {
            const [x, y] = toLocal(e.clientX, e.clientY);
            if (st.tool === "type") return A.createGraphic("text", x, y);
            if (st.tool === "rect" || st.tool === "ellipse") return A.createGraphic(st.tool, x, y);
            if (e.target === e.currentTarget) st.set({ editingText: null });
          }}
          overlay={() => null}
        >
          <SequenceFrame seq={seq} project={st.project} t={T} playing={st.playing} />
          {sel && !st.playing && st.tool === "select" && <SelectionHost c={sel} seq={seq} />}
          {editingClip && editingLayer && !st.playing && (
            <div
              className="absolute left-0 top-0"
              style={{ transform: `translate(${editingLayer.x}px, ${editingLayer.y}px) translate(-50%, -50%) rotate(${editingLayer.rotation}deg) scale(${editingLayer.scale / 100})` }}
            >
              <div
                key={editingLayer.id}
                contentEditable
                suppressContentEditableWarning
                ref={(el) => {
                  if (el && editing !== editingLayer.id) {
                    el.focus();
                    document.getSelection()?.selectAllChildren(el);
                    setEditing(editingLayer.id);
                  }
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") (e.target as HTMLElement).blur();
                }}
                onBlur={(e) => {
                  A.updateGraphicLayer(editingClip.id, editingLayer.id, { text: e.currentTarget.innerText, name: e.currentTarget.innerText.slice(0, 30) });
                  st.set({ editingText: null, tool: st.tool === "type" ? "select" : st.tool });
                  setEditing(null);
                }}
                className="outline outline-2 outline-[#d64545]"
                style={{ ...textCss(editingLayer.style), color: editingLayer.style.color, minWidth: 20 }}
              >
                {editingLayer.text}
              </div>
            </div>
          )}
        </Stage>
        <SequenceAudio seq={seq} project={st.project} t={T} playing={st.playing} />
      </div>
      <div className="flex shrink-0 items-center gap-2 px-3 pt-1.5 text-[12px]">
        <span className="font-mono text-[13px] text-[#3d9cf0] sm:text-[16px]">{timecode(T, seq.fps)}</span>
        <ZoomSelect value={st.programZoom} onChange={(v) => st.set({ programZoom: v })} />
        <span className="ml-auto hidden sm:inline">
          <ResSelect />
        </span>
        <Wrench size={13} className="hidden text-[#9a9a9a] sm:block" />
        <span className="ml-auto font-mono text-[13px] text-[#d0d0d0] sm:ml-0 sm:text-[16px]">{timecode(seq.outPoint !== null && seq.inPoint !== null ? seq.outPoint - seq.inPoint : seqDuration(seq), seq.fps)}</span>
      </div>
      <TimeBar value={T} max={dur} inP={seq.inPoint} outP={seq.outPoint} markers={seq.markers} fps={seq.fps} onScrub={(t) => (st.set({ playing: false }), st.setPlayhead(t))} />
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-0.5 pb-1.5">
        <TransportButton title="Aggiungi marcatore (M)" onClick={A.addMarker}>
          {I.marker}
        </TransportButton>
        <TransportButton title="Contrassegna attacco (I)" onClick={() => (st.set({ focus: "program" }), A.markIn())}>
          {I.in}
        </TransportButton>
        <TransportButton title="Contrassegna uscita (O)" onClick={() => (st.set({ focus: "program" }), A.markOut())}>
          {I.out}
        </TransportButton>
        <TransportButton title="Vai ad attacco (Maiusc+I)" onClick={() => seq.inPoint !== null && st.setPlayhead(seq.inPoint)}>
          {I.goIn}
        </TransportButton>
        <TransportButton title="Indietro di un fotogramma (Sinistra)" onClick={() => (st.set({ focus: "program" }), A.stepFrames(-1))}>
          {I.back}
        </TransportButton>
        <TransportButton title="Riproduci/Interrompi (Spazio)" onClick={() => (st.set({ focus: "program" }), A.togglePlay())} active={st.playing}>
          {st.playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </TransportButton>
        <TransportButton title="Avanti di un fotogramma (Destra)" onClick={() => (st.set({ focus: "program" }), A.stepFrames(1))}>
          {I.fwd}
        </TransportButton>
        <TransportButton title="Vai a uscita (Maiusc+O)" onClick={() => seq.outPoint !== null && st.setPlayhead(seq.outPoint)}>
          {I.goOut}
        </TransportButton>
        <TransportButton title="Solleva (;)" onClick={() => A.liftOrExtract(false)}>
          {I.lift}
        </TransportButton>
        <TransportButton title="Estrai (')" onClick={() => A.liftOrExtract(true)}>
          {I.extract}
        </TransportButton>
        <TransportButton title="Esporta fotogramma" onClick={() => st.notify("Esporta fotogramma: l'esportazione non è disponibile nel simulatore")}>
          <Camera size={14} />
        </TransportButton>
        <TransportButton title="Vista confronto" onClick={() => st.notify("Vista confronto: scegli un fotogramma di riferimento nel pannello Lumetri")}>
          {I.compare}
        </TransportButton>
        <span className="ml-auto" />
        <TransportButton title="Editor pulsanti" onClick={() => st.set({ dialog: { type: "keys" } })}>
          <Plus size={14} />
        </TransportButton>
      </div>
    </div>
  );
}

function SelectionHost({ c, seq }: { c: Clip; seq: Sequence }) {
  const ref = useRef<HTMLDivElement>(null);
  const toLocal = (x: number, y: number): [number, number] => {
    const stage = ref.current?.parentElement;
    if (!stage) return [x, y];
    const r = stage.getBoundingClientRect();
    return [((x - r.left) / r.width) * seq.width, ((y - r.top) / r.height) * seq.height];
  };
  const scale = ref.current?.parentElement ? ref.current.parentElement.getBoundingClientRect().width / seq.width : 0.5;
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <SelectionBox c={c} seq={seq} toLocal={toLocal} scale={scale || 0.5} />
    </div>
  );
}
