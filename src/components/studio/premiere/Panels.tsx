"use client";

import clsx from "clsx";
import { Film, Folder, Hand, Music, MousePointer2, RotateCcw, Scissors, Search, SplitSquareHorizontal, Type } from "lucide-react";
import { DEFAULT_FX, PR_MEDIA, clipEnd, getMedia, isVideo, usePremiere, type Fx, type PrTool } from "@/lib/studio/premiere";
import { Scrubby } from "@/components/premiere/controls";
import { MediaVisual } from "../MediaVisual";
import { timecode } from "../chrome";

export function ProjectPanel() {
  const st = usePremiere();
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 px-2 pb-1 text-[11px] text-[#8f8f8f]">
        <Folder size={13} className="text-[#d8b45a]" /> Progetto.prproj
        <span className="ml-auto">{PR_MEDIA.length} elementi</span>
      </div>
      <div className="mx-2 mb-2 flex shrink-0 items-center gap-1 rounded border border-[#3e3e3e] bg-[#1b1b1b] px-2 py-1 text-[11px] text-[#6f6f6f]">
        <Search size={12} /> Cerca
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2 overflow-y-auto px-2 pb-2">
        {PR_MEDIA.map((m) => {
          const Icon = m.kind === "audio" ? Music : m.kind === "graphic" ? Type : Film;
          return (
            <div
              key={m.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/x-media", m.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => st.set({ selectedMedia: m.id, source: { t: 0, in: null, out: null } })}
              onDoubleClick={() => st.set({ selectedMedia: m.id, source: { t: 0, in: null, out: null } })}
              title="Trascina nella timeline (Ctrl = inserisci) o fai clic per aprirla nel monitor sorgente"
              className={clsx("cursor-grab rounded p-1 active:cursor-grabbing", st.selectedMedia === m.id ? "bg-[#2680eb]/30 ring-1 ring-[#2680eb]" : "hover:bg-white/5")}
            >
              <div className="relative aspect-video overflow-hidden rounded-sm bg-black">
                <MediaVisual subject={m.subject} hue={m.hue} t={1.2} text={m.text} thumb />
                <span className="absolute bottom-0.5 right-1 rounded bg-black/60 px-1 font-mono text-[9px] text-white">{timecode(m.duration, 25).slice(3)}</span>
              </div>
              <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#cfcfcf]">
                <Icon size={11} className="shrink-0 text-[#9999ff]" />
                <span className="truncate">{m.name}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EffectsPanel() {
  const fx = [
    { id: "dissolve", label: "Dissolvenza incrociata", folder: "Transizioni video › Dissolvenza" },
    { id: "dip", label: "Tuffo nel nero", folder: "Transizioni video › Dissolvenza" },
  ];
  return (
    <div className="space-y-1 overflow-y-auto p-2 text-[12px]">
      <p className="mb-2 text-[11px] text-[#8f8f8f]">Trascina una transizione sull&apos;inizio o la fine di una clip, oppure seleziona la clip e premi Ctrl+D.</p>
      {fx.map((f) => (
        <div
          key={f.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/x-fx", f.id)}
          className="flex cursor-grab items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5"
        >
          <SplitSquareHorizontal size={14} className="text-[#9999ff]" />
          <div>
            <p className="text-[#e0e0e0]">{f.label}</p>
            <p className="text-[10px] text-[#7a7a7a]">{f.folder}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PropRow({ label, children, reset }: { label: string; children: React.ReactNode; reset?: () => void }) {
  return (
    <div className="flex items-center gap-2 py-1 pl-6 pr-2 text-[12px]">
      <span className="w-24 shrink-0 text-[#bdbdbd]">{label}</span>
      <div className="flex flex-1 items-center gap-3">{children}</div>
      {reset && (
        <button type="button" title="Ripristina parametro" onClick={reset} className="text-[#7a7a7a] hover:text-white">
          <RotateCcw size={12} />
        </button>
      )}
    </div>
  );
}

export function EffectControls() {
  const st = usePremiere();
  const { seq, selection } = st;
  const clip = seq.clips.find((c) => selection.includes(c.id) && isVideo(c.track)) ?? seq.clips.find((c) => selection.includes(c.id));
  if (!clip) return <p className="p-4 text-[12px] text-[#8f8f8f]">(nessuna clip selezionata)</p>;
  const audio = seq.clips.find((c) => selection.includes(c.id) && !isVideo(c.track));
  const m = getMedia(clip.mediaId);
  const upd = (id: string, patch: Partial<Fx>, key: string) =>
    st.commit({ ...seq, clips: seq.clips.map((c) => (c.id === id ? { ...c, fx: { ...c.fx, ...patch } } : c)) }, undefined, key + id);
  const fx = clip.fx;
  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-2 py-1 text-[11px] text-[#8f8f8f]">
        <span className="truncate">
          Sorgente · {m.name}
        </span>
        <span className="truncate">{seq.name} · {m.name}</span>
      </div>
      {isVideo(clip.track) && (
        <>
          <p className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#8f8f8f]">Effetti video</p>
          <p className="px-3 py-1 text-[12px] font-semibold text-[#e0e0e0]">ƒx Movimento</p>
          <PropRow label="Posizione" reset={() => upd(clip.id, { x: 0, y: 0 }, "x")}>
            <Scrubby value={seq.width / 2 + fx.x} decimals={1} onChange={(v) => upd(clip.id, { x: v - seq.width / 2 }, "x")} />
            <Scrubby value={seq.height / 2 + fx.y} decimals={1} onChange={(v) => upd(clip.id, { y: v - seq.height / 2 }, "y")} />
          </PropRow>
          <PropRow label="Scala" reset={() => upd(clip.id, { scale: 100 }, "s")}>
            <Scrubby value={fx.scale} min={0} max={1000} decimals={1} onChange={(v) => upd(clip.id, { scale: v }, "s")} />
          </PropRow>
          <PropRow label="Rotazione" reset={() => upd(clip.id, { rotation: 0 }, "r")}>
            <Scrubby value={fx.rotation} decimals={1} suffix="°" onChange={(v) => upd(clip.id, { rotation: v }, "r")} />
          </PropRow>
          <p className="px-3 py-1 text-[12px] font-semibold text-[#e0e0e0]">ƒx Opacità</p>
          <PropRow label="Opacità" reset={() => upd(clip.id, { opacity: 100 }, "o")}>
            <Scrubby value={fx.opacity} min={0} max={100} decimals={1} suffix=" %" onChange={(v) => upd(clip.id, { opacity: v }, "o")} />
          </PropRow>
          <PropRow label="Metodo fusione">
            <span className="text-[#bdbdbd]">Normale</span>
          </PropRow>
          {clip.transition && (
            <>
              <p className="px-3 py-1 text-[12px] font-semibold text-[#e0e0e0]">Transizione</p>
              <PropRow
                label={clip.transition === "dip" ? "Tuffo nel nero" : "Dissolvenza"}
                reset={() => st.commit({ ...seq, clips: seq.clips.map((c) => (c.id === clip.id ? { ...c, transition: undefined } : c)) })}
              >
                <span className="text-[#bdbdbd]">00:00:01:00</span>
              </PropRow>
            </>
          )}
        </>
      )}
      {audio && (
        <>
          <p className="px-2 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[#8f8f8f]">Effetti audio</p>
          <p className="px-3 py-1 text-[12px] font-semibold text-[#e0e0e0]">ƒx Volume</p>
          <PropRow label="Livello" reset={() => upd(audio.id, { volume: DEFAULT_FX.volume }, "v")}>
            <Scrubby value={audio.fx.volume} min={-60} max={15} decimals={1} step={0.2} suffix=" dB" onChange={(v) => upd(audio.id, { volume: v }, "v")} />
          </PropRow>
        </>
      )}
      <p className="px-3 pt-3 font-mono text-[11px] text-[#6f6f6f]">
        {timecode(clip.start, seq.fps)} → {timecode(clipEnd(clip), seq.fps)}
      </p>
    </div>
  );
}

const TOOLS: { id: PrTool; label: string; key: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Strumento Selezione", key: "V", icon: MousePointer2 },
  { id: "ripple", label: "Strumento Modifica con increspatura", key: "B", icon: SplitSquareHorizontal },
  { id: "razor", label: "Strumento Lama", key: "C", icon: Scissors },
  { id: "hand", label: "Strumento Mano", key: "H", icon: Hand },
];

export function ToolsPanel({ horizontal }: { horizontal?: boolean }) {
  const { tool, set } = usePremiere();
  return (
    <div className={clsx("flex gap-1 p-1", horizontal ? "flex-row" : "flex-col")}>
      {TOOLS.map(({ id, label, key, icon: Icon }) => (
        <button
          key={id}
          type="button"
          title={`${label} (${key})`}
          aria-label={label}
          onClick={() => set({ tool: id })}
          className={clsx("grid h-8 w-8 place-items-center rounded", tool === id ? "bg-[#2680eb] text-white" : "text-[#bdbdbd] hover:bg-white/10")}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
