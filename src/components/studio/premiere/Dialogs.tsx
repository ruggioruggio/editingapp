"use client";

import { useState } from "react";
import { getTransition } from "@/lib/studio/effects";
import { MARKER_COLORS, clipDur, seqDuration, seqOf, setSpeed, usePremiere } from "@/lib/studio/premiere";
import { SequenceDialog } from "@/components/premiere/SequenceDialog";
import { ExportDialog } from "@/components/premiere/ExportDialog";
import { Dialog, KeysHelp, Modal, field, timecode } from "../chrome";
import * as A from "./actions";
import { PR_KEYS } from "./keys";

// Tutte le finestre di dialogo del simulatore di Premiere.

function Num({ label, value, onChange, min = 0, max = 100000, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span>{label}</span>
      <span className="flex items-center gap-1.5">
        <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className={field + " w-24"} />
        {suffix}
      </span>
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 py-1">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 accent-[#2680eb]" />
      {label}
    </label>
  );
}

export function PremiereDialogs() {
  const st = usePremiere();
  const d = st.dialog;
  const close = () => st.set({ dialog: null });
  const seq = seqOf(st);
  if (!d) return null;

  switch (d.type) {
    case "sequence":
      return (
        <Modal onClose={close} width={860}>
          <SequenceDialog
            initialName={`Sequenza ${String(Object.keys(st.project.sequences).length + 1).padStart(2, "0")}`}
            onCancel={close}
            onConfirm={(s) => {
              A.createSequence(s.name, s.width, s.height, s.fps);
              close();
            }}
          />
        </Modal>
      );
    case "export":
      return seq ? (
        <Modal onClose={close} width={1100}>
          <ExportDialog
            fileName={seq.name}
            source={{ width: seq.width, height: seq.height, fps: seq.fps, seconds: Math.max(1, seqDuration(seq)) }}
            onCancel={close}
            onExport={(s) => {
              usePremiere.getState().set({ lastExport: s });
              setTimeout(() => {
                usePremiere.getState().set({ dialog: null });
                usePremiere.getState().notify("L'esportazione vera non è disponibile nel simulatore: le impostazioni sono state verificate");
              }, 1600);
              return true;
            }}
          />
        </Modal>
      ) : null;
    case "keys":
      return <KeysHelp title="Scorciatoie da tastiera — Premiere Pro" rows={PR_KEYS} onClose={close} />;
    case "speed":
      return <SpeedDialog ids={d.ids} />;
    case "matte":
      return <MatteDialog />;
    case "rename":
      return <RenameDialog title={d.title} value={d.value} onOk={d.onOk} />;
    case "marker":
      return <MarkerDialog id={d.id} />;
    case "tracks":
      return <TracksDialog />;
    case "seqSettings":
      return <SeqSettings />;
    case "pasteAttr":
      return <PasteAttr />;
    case "transDur":
      return <TransDur clipId={d.clipId} side={d.side} />;
    case "confirm":
      return (
        <Dialog
          title={d.title}
          onCancel={close}
          onOk={() => {
            close();
            d.onOk();
          }}
        >
          <p className="py-2 leading-relaxed">{d.text}</p>
        </Dialog>
      );
  }
}

function SpeedDialog({ ids }: { ids: string[] }) {
  const st = usePremiere();
  const seq = seqOf(st);
  const c = seq?.clips.find((x) => ids.includes(x.id));
  const [speed, setS] = useState(Math.round((c?.speed ?? 1) * 100));
  const [rev, setRev] = useState(c?.reverse ?? false);
  const [pitch, setPitch] = useState(true);
  const [ripple, setRipple] = useState(false);
  if (!seq || !c) return null;
  const dur = (c.out - c.in) / (speed / 100);
  return (
    <Dialog
      title="Velocità/Durata clip"
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        const all = ids.flatMap((id) => {
          const k = seq.clips.find((x) => x.id === id);
          return k?.linkId ? seq.clips.filter((x) => x.linkId === k.linkId).map((x) => x.id) : [id];
        });
        st.commitSeq((q) => setSpeed(q, [...new Set(all)], Math.max(1, speed) / 100, rev, ripple), "Velocità/Durata");
        st.set({ dialog: null });
      }}
    >
      <Num label="Velocità" value={speed} min={1} max={10000} onChange={setS} suffix="%" />
      <label className="flex items-center justify-between gap-3 py-1.5">
        <span>Durata</span>
        <input
          defaultValue={timecode(dur, seq.fps)}
          key={speed}
          onBlur={(e) => {
            const p = e.target.value.split(/[:;.]/).map(Number);
            const secs = (p[0] ?? 0) * 3600 + (p[1] ?? 0) * 60 + (p[2] ?? 0) + (p[3] ?? 0) / seq.fps;
            if (secs > 0) setS(Math.round(((c.out - c.in) / secs) * 100));
          }}
          className={field + " w-32 font-mono"}
        />
      </label>
      <Check label="Inverti velocità" checked={rev} onChange={setRev} />
      <Check label="Mantieni intonazione audio" checked={pitch} onChange={setPitch} />
      <Check label="Modifica con increspatura, spostando le clip finali" checked={ripple} onChange={setRipple} />
      <p className="pt-1 text-[11px] text-[#8a8a8a]">Durata originale: {timecode(clipDur({ ...c, speed: 1 }), seq.fps)}</p>
    </Dialog>
  );
}

function MatteDialog() {
  const st = usePremiere();
  const [color, setColor] = useState("#2b2b6e");
  const [name, setName] = useState("Mascherino colore");
  return (
    <Dialog
      title="Selettore colore"
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        A.newSyntheticItem("matte", color, name);
        st.set({ dialog: null });
      }}
    >
      <div className="flex items-center gap-4 py-2">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-24 w-24 cursor-pointer rounded border border-[#4a4a4a] bg-transparent" />
        <div className="space-y-2">
          <p className="font-mono text-[#d0d0d0]"># {color.slice(1).toUpperCase()}</p>
          <label className="block">
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} className={field + " mt-1 block w-56"} />
          </label>
        </div>
      </div>
    </Dialog>
  );
}

function RenameDialog({ title, value, onOk }: { title: string; value: string; onOk: (v: string) => void }) {
  const st = usePremiere();
  const [v, setV] = useState(value);
  return (
    <Dialog
      title={title}
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        st.set({ dialog: null });
        onOk(v);
      }}
    >
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onFocus={(e) => e.target.select()} className={field + " my-2 w-full"} />
    </Dialog>
  );
}

function MarkerDialog({ id }: { id: string }) {
  const st = usePremiere();
  const seq = seqOf(st);
  const m = seq?.markers.find((x) => x.id === id);
  const [name, setName] = useState(m?.name ?? "");
  const [comment, setComment] = useState(m?.comment ?? "");
  const [color, setColor] = useState(m?.color ?? 0);
  if (!seq || !m) return null;
  return (
    <Dialog
      title="Marcatore"
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        st.commitSeq((q) => ({ ...q, markers: q.markers.map((x) => (x.id === id ? { ...x, name, comment, color } : x)) }), "Modifica marcatore");
        st.set({ dialog: null });
      }}
    >
      <label className="block py-1">
        Nome
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={field + " mt-1 block w-full"} />
      </label>
      <p className="py-1 font-mono text-[#9a9a9a]">In: {timecode(m.t, seq.fps)}</p>
      <label className="block py-1">
        Commenti
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1 block w-full rounded border border-[#3e3e3e] bg-[#151515] p-2 text-[12px] text-white outline-none focus:border-[#2680eb]" />
      </label>
      <div className="flex items-center gap-2 py-2">
        Colore marcatore
        {MARKER_COLORS.map((c, i) => (
          <button key={c} type="button" onClick={() => setColor(i)} className="h-5 w-5 rounded-sm" style={{ background: c, outline: color === i ? "2px solid #fff" : "none", outlineOffset: 1 }} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          st.commitSeq((q) => ({ ...q, markers: q.markers.filter((x) => x.id !== id) }), "Elimina marcatore");
          st.set({ dialog: null });
        }}
        className="text-[12px] text-[#ff7b7b] hover:underline"
      >
        Elimina marcatore
      </button>
    </Dialog>
  );
}

function TracksDialog() {
  const st = usePremiere();
  const [v, setV] = useState(1);
  const [a, setA] = useState(0);
  return (
    <Dialog
      title="Aggiungi tracce"
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        A.addTracks(Math.max(0, v), Math.max(0, a));
        st.set({ dialog: null });
      }}
    >
      <Num label="Aggiungi tracce video" value={v} max={20} onChange={setV} />
      <Num label="Aggiungi tracce audio" value={a} max={20} onChange={setA} />
      <p className="text-[11px] text-[#8a8a8a]">Le nuove tracce vengono aggiunte dopo l&apos;ultima traccia esistente.</p>
    </Dialog>
  );
}

function SeqSettings() {
  const st = usePremiere();
  const seq = seqOf(st);
  const [w, setW] = useState(seq?.width ?? 1920);
  const [h, setH] = useState(seq?.height ?? 1080);
  const [fps, setFps] = useState(seq?.fps ?? 25);
  const [name, setName] = useState(seq?.name ?? "");
  if (!seq) return null;
  return (
    <Dialog
      title="Impostazioni sequenza"
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        st.commit(
          (p) => ({
            ...p,
            sequences: { ...p.sequences, [seq.id]: { ...p.sequences[seq.id], width: w, height: h, fps, name } },
            items: p.items.map((i) => (i.ref === seq.id ? { ...i, name } : i)),
          }),
          "Impostazioni sequenza",
        );
        st.set({ dialog: null });
      }}
    >
      <label className="flex items-center justify-between gap-3 py-1.5">
        Nome sequenza
        <input value={name} onChange={(e) => setName(e.target.value)} className={field + " w-56"} />
      </label>
      <label className="flex items-center justify-between gap-3 py-1.5">
        Base temporale
        <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className={field + " w-56"}>
          {[23.976, 24, 25, 29.97, 30, 50, 59.94, 60].map((f) => (
            <option key={f} value={f}>
              {String(f).replace(".", ",")} fotogrammi/secondo
            </option>
          ))}
        </select>
      </label>
      <Num label="Dimensione fotogramma: orizzontale" value={w} min={16} max={8192} onChange={setW} />
      <Num label="verticale" value={h} min={16} max={8192} onChange={setH} />
      <div className="flex flex-wrap gap-1 py-1">
        {[
          [1920, 1080],
          [3840, 2160],
          [1080, 1920],
          [1080, 1080],
          [1280, 720],
        ].map(([a, b]) => (
          <button key={a + "x" + b} type="button" onClick={() => (setW(a), setH(b))} className="rounded bg-[#333] px-2 py-0.5 text-[11px] hover:bg-[#444]">
            {a}×{b}
          </button>
        ))}
      </div>
    </Dialog>
  );
}

function PasteAttr() {
  const st = usePremiere();
  const [o, setO] = useState({ motion: true, opacity: true, volume: true, effects: true, speed: false });
  const src = st.clipboard?.[0];
  return (
    <Dialog
      title="Incolla attributi"
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        A.pasteAttributes(o);
        st.set({ dialog: null });
      }}
    >
      <p className="pb-2 text-[#9a9a9a]">Da: {src?.name ?? "—"}</p>
      <p className="pb-1 font-semibold text-white">Attributi video</p>
      <Check label="Movimento" checked={o.motion} onChange={(v) => setO({ ...o, motion: v })} />
      <Check label="Opacità" checked={o.opacity} onChange={(v) => setO({ ...o, opacity: v })} />
      <Check label="Rimappatura temporale (velocità)" checked={o.speed} onChange={(v) => setO({ ...o, speed: v })} />
      <Check label="Effetti" checked={o.effects} onChange={(v) => setO({ ...o, effects: v })} />
      <p className="pb-1 pt-2 font-semibold text-white">Attributi audio</p>
      <Check label="Volume" checked={o.volume} onChange={(v) => setO({ ...o, volume: v })} />
    </Dialog>
  );
}

function TransDur({ clipId, side }: { clipId: string; side: "in" | "out" }) {
  const st = usePremiere();
  const seq = seqOf(st);
  const c = seq?.clips.find((x) => x.id === clipId);
  const tr = side === "in" ? c?.tIn : c?.tOut;
  const [frames, setFrames] = useState(Math.round((tr?.dur ?? 1) * (seq?.fps ?? 25)));
  if (!seq || !c || !tr) return null;
  return (
    <Dialog
      title={`Imposta durata: ${getTransition(tr.defId)?.name}`}
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        A.updateClip(c.id, (k) => ({ ...k, [side === "in" ? "tIn" : "tOut"]: { ...tr, dur: Math.max(1, frames) / seq.fps } }), "Durata transizione");
        st.set({ dialog: null });
      }}
    >
      <Num label="Durata (fotogrammi)" value={frames} min={1} max={10000} onChange={setFrames} />
      <p className="font-mono text-[#9a9a9a]">{timecode(frames / seq.fps, seq.fps)}</p>
    </Dialog>
  );
}
