"use client";

import { useRef } from "react";
import clsx from "clsx";
import { ArrowDownToLine, Bookmark, Braces, ChevronFirst, ChevronLast, Pause, Play, Replace, SkipBack, SkipForward, StepBack, StepForward } from "lucide-react";
import {
  VIDEO_TRACKS,
  clipAt,
  clipEnd,
  getMedia,
  placeMedia,
  seqDuration,
  usePremiere,
  type PrClip,
  type PrSequence,
  type TrackId,
} from "@/lib/studio/premiere";
import { MediaVisual } from "../MediaVisual";
import { timecode } from "../chrome";

/** Disegna un livello della sequenza con i suoi effetti di Movimento e Opacità. */
function Layer({ c, seq, t, opacity = 1 }: { c: PrClip; seq: PrSequence; t: number; opacity?: number }) {
  const m = getMedia(c.mediaId);
  const local = Math.min(c.out - 0.001, c.in + (t - c.start));
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translate(${(c.fx.x / seq.width) * 100}%, ${(c.fx.y / seq.height) * 100}%) rotate(${c.fx.rotation}deg) scale(${c.fx.scale / 100})`,
        opacity: (c.fx.opacity / 100) * opacity,
      }}
    >
      <MediaVisual subject={m.subject} hue={m.hue} t={local} text={m.text} />
    </div>
  );
}

const TRANS = 1; // durata delle transizioni in secondi

export function Composite({ seq, t, off }: { seq: PrSequence; t: number; off: TrackId[] }) {
  const layers: React.ReactNode[] = [];
  let black = 0;
  for (const track of [...VIDEO_TRACKS].reverse()) {
    if (off.includes(track)) continue;
    const c = clipAt(seq, track, t);
    if (!c) continue;
    const into = t - c.start;
    if (c.transition && into < TRANS) {
      const p = into / TRANS;
      const prev = seq.clips.find((k) => k.track === track && Math.abs(clipEnd(k) - c.start) < 0.02);
      if (c.transition === "dip") {
        // tuffo nel nero: la clip compare dal nero
        black = Math.max(black, 1 - p);
      } else {
        if (prev) layers.push(<Layer key={prev.id + "p"} c={prev} seq={seq} t={c.start - 0.001} opacity={1 - p} />);
        layers.push(<Layer key={c.id} c={c} seq={seq} t={t} opacity={p} />);
        continue;
      }
    }
    const end = clipEnd(c);
    const next = seq.clips.find((k) => k.track === track && k.transition === "dip" && Math.abs(k.start - end) < 0.02);
    if (next && end - t < TRANS / 2) black = Math.max(black, 1 - (end - t) / (TRANS / 2));
    layers.push(<Layer key={c.id} c={c} seq={seq} t={t} />);
  }
  return (
    <>
      {layers}
      {black > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: black }} />}
    </>
  );
}

function Screen({ ratio, children, onPointerDown }: { ratio: number; children: React.ReactNode; onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void }) {
  return (
    <div className="grid min-h-0 flex-1 place-items-center overflow-hidden bg-[#141414] p-2">
      <div
        className="relative max-h-full max-w-full overflow-hidden bg-black"
        style={{ aspectRatio: String(ratio), height: ratio >= 1 ? undefined : "100%", width: ratio >= 1 ? "100%" : undefined }}
        onPointerDown={onPointerDown}
      >
        {children}
      </div>
    </div>
  );
}

function Btn({ title, onClick, children, active }: { title: string; onClick: () => void; children: React.ReactNode; active?: boolean }) {
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick} className={clsx("grid h-7 w-7 place-items-center rounded hover:bg-white/10", active ? "text-[#2d8ceb]" : "text-[#bdbdbd]")}>
      {children}
    </button>
  );
}

function Bar({ value, max, inP, outP, onScrub }: { value: number; max: number; inP?: number | null; outP?: number | null; onScrub: (t: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const at = (x: number) => {
    const r = ref.current!.getBoundingClientRect();
    onScrub(Math.max(0, Math.min(max, ((x - r.left) / r.width) * max)));
  };
  return (
    <div
      ref={ref}
      className="relative mx-2 h-4 shrink-0 cursor-pointer"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        at(e.clientX);
      }}
      onPointerMove={(e) => e.buttons & 1 && at(e.clientX)}
    >
      <div className="absolute inset-x-0 top-1.5 h-1 rounded bg-[#3a3a3a]" />
      {(inP != null || outP != null) && (
        <div className="absolute top-1.5 h-1 bg-[#6c6c6c]" style={{ left: `${((inP ?? 0) / max) * 100}%`, right: `${100 - ((outP ?? max) / max) * 100}%` }} />
      )}
      <div className="absolute top-0 h-4 w-[3px] -translate-x-1/2 bg-[#2d8ceb]" style={{ left: `${(value / max) * 100}%` }} />
    </div>
  );
}

export function ProgramMonitor() {
  const st = usePremiere();
  const { seq, playhead, playing, off, selection } = st;
  const dur = Math.max(1, seqDuration(seq));
  const frame = 1 / seq.fps;
  const edits = [...new Set(seq.clips.flatMap((c) => [c.start, clipEnd(c)]))].sort((a, b) => a - b);

  // trascinare nell'immagine sposta la clip selezionata (Posizione)
  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    const c = seq.clips.find((k) => selection.includes(k.id) && k.track.startsWith("V") && playhead >= k.start && playhead < clipEnd(k));
    if (!c) return;
    const box = e.currentTarget.getBoundingClientRect();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const y0 = e.clientY;
    const fx0 = c.fx;
    const move = (ev: PointerEvent) => {
      const s = usePremiere.getState();
      const dx = ((ev.clientX - x0) / box.width) * seq.width;
      const dy = ((ev.clientY - y0) / box.height) * seq.height;
      s.commit({ ...s.seq, clips: s.seq.clips.map((k) => (k.id === c.id ? { ...k, fx: { ...fx0, x: Math.round(fx0.x + dx), y: Math.round(fx0.y + dy) } } : k)) }, undefined, "pos" + c.id);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  return (
    <div className="flex h-full flex-col">
      <Screen ratio={seq.width / seq.height} onPointerDown={drag}>
        <Composite seq={seq} t={playhead} off={off} />
      </Screen>
      <div className="flex shrink-0 items-center justify-between px-2 font-mono text-[12px]">
        <span className="text-[#2d8ceb]">{timecode(playhead, seq.fps)}</span>
        <span className="text-[11px] text-[#8f8f8f]">Adatta</span>
        <span className="text-[#cfcfcf]">{timecode(seqDuration(seq), seq.fps)}</span>
      </div>
      <Bar value={Math.min(playhead, dur)} max={dur} onScrub={(t) => st.setPlayhead(Math.round(t * seq.fps) / seq.fps)} />
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-0.5 pb-1">
        <Btn title="Aggiungi marcatore (M)" onClick={() => st.commit({ ...seq, markers: [...seq.markers, playhead] })}>
          <Bookmark size={14} />
        </Btn>
        <Btn title="Vai al punto di modifica precedente (Su)" onClick={() => st.setPlayhead([...edits].reverse().find((x) => x < playhead - 0.001) ?? 0)}>
          <SkipBack size={14} />
        </Btn>
        <Btn title="Indietro di 1 fotogramma (Sinistra)" onClick={() => st.setPlayhead(playhead - frame)}>
          <StepBack size={14} />
        </Btn>
        <Btn title="Riproduci/Interrompi (Spazio)" onClick={st.togglePlay} active={playing}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </Btn>
        <Btn title="Avanti di 1 fotogramma (Destra)" onClick={() => st.setPlayhead(playhead + frame)}>
          <StepForward size={14} />
        </Btn>
        <Btn title="Vai al punto di modifica successivo (Giù)" onClick={() => st.setPlayhead(edits.find((x) => x > playhead + 0.001) ?? playhead)}>
          <SkipForward size={14} />
        </Btn>
      </div>
    </div>
  );
}

export function SourceMonitor() {
  const st = usePremiere();
  const { selectedMedia, source, seq } = st;
  if (!selectedMedia) {
    return <p className="p-4 text-[12px] text-[#8f8f8f]">Fai doppio clic su una clip nel pannello Progetto per aprirla qui.</p>;
  }
  const m = getMedia(selectedMedia);
  const setSrc = (patch: Partial<typeof source>) => st.set({ source: { ...source, ...patch } });
  const frame = 1 / seq.fps;
  const place = (mode: "insert" | "overwrite") => {
    const a = source.in ?? 0;
    const b = source.out ?? m.duration;
    if (b - a < frame) return st.notify("Il punto di uscita deve venire dopo l'attacco");
    const r = placeMedia(seq, m, st.playhead, a, b, mode, st.targetV, st.targetA);
    st.commit(r.seq, r.ids);
    st.setPlayhead(st.playhead + (b - a));
    st.notify(mode === "insert" ? "Inserito nella sequenza" : "Sovrascritto nella sequenza");
  };
  return (
    <div className="flex h-full flex-col">
      <Screen ratio={16 / 9}>
        <MediaVisual subject={m.subject} hue={m.hue} t={source.t} text={m.text} thumb />
        <span className="absolute left-2 top-1 text-[11px] text-white/70 drop-shadow">{m.name}</span>
      </Screen>
      <div className="flex shrink-0 justify-between px-2 font-mono text-[12px]">
        <span className="text-[#2d8ceb]">{timecode(source.t, seq.fps)}</span>
        <span className="text-[#cfcfcf]">{timecode((source.out ?? m.duration) - (source.in ?? 0), seq.fps)}</span>
      </div>
      <Bar value={source.t} max={m.duration} inP={source.in} outP={source.out} onScrub={(t) => setSrc({ t })} />
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-0.5 pb-1">
        <Btn title="Contrassegna attacco (I)" onClick={() => setSrc({ in: source.t })}>
          <ChevronFirst size={15} />
        </Btn>
        <Btn title="Contrassegna uscita (O)" onClick={() => setSrc({ out: source.t })}>
          <ChevronLast size={15} />
        </Btn>
        <Btn title="Cancella attacco e uscita" onClick={() => setSrc({ in: null, out: null })}>
          <Braces size={14} />
        </Btn>
        <Btn title="Indietro di 1 fotogramma" onClick={() => setSrc({ t: Math.max(0, source.t - frame) })}>
          <StepBack size={14} />
        </Btn>
        <Btn title="Avanti di 1 fotogramma" onClick={() => setSrc({ t: Math.min(m.duration, source.t + frame) })}>
          <StepForward size={14} />
        </Btn>
        <Btn title="Inserisci (,)" onClick={() => place("insert")}>
          <ArrowDownToLine size={15} />
        </Btn>
        <Btn title="Sovrascrivi (.)" onClick={() => place("overwrite")}>
          <Replace size={15} />
        </Btn>
      </div>
    </div>
  );
}

/** Indicatori di livello audio: seguono le clip audio sotto l'indicatore e il loro volume. */
export function AudioMeters() {
  const { seq, playhead, playing, off } = usePremiere();
  const active = seq.clips.filter((c) => c.track.startsWith("A") && !off.includes(c.track) && playhead >= c.start && playhead < clipEnd(c));
  const db = active.length ? Math.max(...active.map((c) => c.fx.volume)) - 12 : -60;
  const jitter = playing ? Math.sin(playhead * 23) * 4 + Math.sin(playhead * 7) * 3 : 0;
  const level = (ch: number) => (active.length ? Math.max(0, Math.min(1, (db + jitter + ch * 1.5 + 60) / 60)) : 0);
  return (
    <div className="flex h-full w-full justify-center gap-1 px-1 py-2">
      {[0, 1].map((ch) => (
        <div key={ch} className="relative w-2.5 overflow-hidden rounded-sm bg-[#151515]">
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#2fbf5a_0%,#2fbf5a_70%,#e6d33a_85%,#e64a3a_100%)]" />
          <div className="absolute inset-x-0 top-0 bg-[#151515] transition-[height] duration-75" style={{ height: `${(1 - level(ch)) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}
