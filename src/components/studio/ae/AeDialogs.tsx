"use client";

import { useState } from "react";
import { compOf, useAe } from "@/lib/studio/ae";
import { Dialog, KeysHelp, field } from "../chrome";
import * as A from "./actions";
import { AE_KEYS } from "./aeKeys";

const PRESETS: [string, number, number, number][] = [
  ["HDTV 1080 25", 1920, 1080, 25],
  ["HDTV 1080 29,97", 1920, 1080, 29.97],
  ["HD 1080 60", 1920, 1080, 60],
  ["UHD 4K 25", 3840, 2160, 25],
  ["Social 4:5 1080×1350 30", 1080, 1350, 30],
  ["Social 9:16 1080×1920 30", 1080, 1920, 30],
  ["Quadrato 1080×1080 30", 1080, 1080, 30],
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span>{label}</span>
      <span className="flex items-center gap-1.5">{children}</span>
    </label>
  );
}

function CompSettings({ id }: { id?: string }) {
  const st = useAe();
  const existing = id ? st.project.comps[id] : undefined;
  const n = Object.keys(st.project.comps).length + 1;
  const [name, setName] = useState(existing?.name ?? `Composizione ${n}`);
  const [w, setW] = useState(existing?.width ?? 1920);
  const [h, setH] = useState(existing?.height ?? 1080);
  const [fps, setFps] = useState(existing?.fps ?? 30);
  const [dur, setDur] = useState(existing?.duration ?? 10);
  const [bg, setBg] = useState(existing?.bg ?? "#000000");
  return (
    <Dialog
      title="Impostazioni composizione"
      width={520}
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        if (existing)
          st.commit(
            (p) => ({
              ...p,
              comps: { ...p.comps, [existing.id]: { ...existing, name, width: w, height: h, fps, duration: dur, bg, workOut: Math.min(existing.workOut, dur), layers: existing.layers.map((l) => ({ ...l, outPoint: Math.min(l.outPoint, dur) })) } },
              items: p.items.map((i) => (i.ref === existing.id ? { ...i, name } : i)),
            }),
            "Impostazioni composizione",
          );
        else A.createComp(name, w, h, fps, dur, bg);
        st.set({ dialog: null });
      }}
    >
      <Row label="Nome composizione">
        <input value={name} onChange={(e) => setName(e.target.value)} className={field + " w-64"} />
      </Row>
      <div className="mb-1 mt-2 flex gap-4 border-b border-[#3a3a3a] text-[12px]">
        <span className="border-b-2 border-[#2680eb] pb-1 text-white">Di base</span>
        <span className="pb-1 text-[#8a8a8a]">Avanzate</span>
        <span className="pb-1 text-[#8a8a8a]">Renderer 3D</span>
      </div>
      <Row label="Predefinito">
        <select
          value=""
          onChange={(e) => {
            const p = PRESETS.find((x) => x[0] === e.target.value);
            if (p) (setW(p[1]), setH(p[2]), setFps(p[3]));
          }}
          className={field + " w-64"}
        >
          <option value="">Personalizzato</option>
          {PRESETS.map((p) => (
            <option key={p[0]}>{p[0]}</option>
          ))}
        </select>
      </Row>
      <Row label="Larghezza">
        <input type="number" value={w} min={4} max={30000} onChange={(e) => setW(Number(e.target.value))} className={field + " w-24"} /> px
      </Row>
      <Row label="Altezza">
        <input type="number" value={h} min={4} max={30000} onChange={(e) => setH(Number(e.target.value))} className={field + " w-24"} /> px
      </Row>
      <Row label="Proporzioni pixel">
        <span className="text-[#bdbdbd]">Pixel quadrati</span>
      </Row>
      <Row label="Frequenza fotogrammi">
        <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className={field + " w-28"}>
          {[8, 12, 15, 23.976, 24, 25, 29.97, 30, 50, 59.94, 60].map((f) => (
            <option key={f} value={f}>
              {String(f).replace(".", ",")}
            </option>
          ))}
        </select>
        fotogrammi al secondo
      </Row>
      <Row label="Risoluzione">
        <span className="text-[#bdbdbd]">Piena · {w} x {h}</span>
      </Row>
      <Row label="Durata (secondi)">
        <input type="number" value={dur} min={0.1} max={600} step={0.1} onChange={(e) => setDur(Number(e.target.value))} className={field + " w-24"} />
      </Row>
      <Row label="Colore di sfondo">
        <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-6 w-10 cursor-pointer rounded border border-[#4a4a4a] bg-transparent" />
      </Row>
    </Dialog>
  );
}

function SolidSettings({ layerId }: { layerId?: string }) {
  const st = useAe();
  const comp = compOf(st);
  const l = layerId ? comp?.layers.find((x) => x.id === layerId) : undefined;
  const [name, setName] = useState(l?.name ?? `Tinta unita ${(comp?.layers.filter((x) => x.type === "solid").length ?? 0) + 1}`);
  const [w, setW] = useState(l?.w ?? comp?.width ?? 1920);
  const [h, setH] = useState(l?.h ?? comp?.height ?? 1080);
  const [color, setColor] = useState(l?.color ?? "#7a3b3b");
  if (!comp) return null;
  return (
    <Dialog
      title="Impostazioni tinta unita"
      onCancel={() => st.set({ dialog: null })}
      onOk={() => {
        if (l) A.updateLayer(l.id, (x) => ({ ...x, name, w, h, color }), "Impostazioni tinta unita");
        else {
          const nl = A.addLayer("solid", { name, w, h, color });
          if (nl) A.updateLayer(nl.id, (x) => ({ ...x, transform: { ...x.transform, anchor: { value: [w / 2, h / 2], keys: null } } }), "Nuova tinta unita");
        }
        st.set({ dialog: null });
      }}
    >
      <Row label="Nome">
        <input value={name} onChange={(e) => setName(e.target.value)} className={field + " w-56"} />
      </Row>
      <Row label="Larghezza">
        <input type="number" value={w} onChange={(e) => setW(Number(e.target.value))} className={field + " w-24"} />
      </Row>
      <Row label="Altezza">
        <input type="number" value={h} onChange={(e) => setH(Number(e.target.value))} className={field + " w-24"} />
      </Row>
      <button type="button" onClick={() => (setW(comp.width), setH(comp.height))} className="my-1 rounded-full border border-[#8a8a8a] px-3 py-0.5 text-[12px] hover:bg-white/5">
        Crea dimensione composizione
      </button>
      <Row label="Colore">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-6 w-10 cursor-pointer rounded border border-[#4a4a4a] bg-transparent" />
      </Row>
    </Dialog>
  );
}

function Rename({ title, value, onOk }: { title: string; value: string; onOk: (v: string) => void }) {
  const st = useAe();
  const [v, setV] = useState(value);
  return (
    <Dialog title={title} onCancel={() => st.set({ dialog: null })} onOk={() => (st.set({ dialog: null }), onOk(v))}>
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onFocus={(e) => e.target.select()} className={field + " my-2 w-full"} />
    </Dialog>
  );
}

function Precompose() {
  const st = useAe();
  const [name, setName] = useState(`Pre-comp ${Object.keys(st.project.comps).length}`);
  return (
    <Dialog title="Pre-componi" onCancel={() => st.set({ dialog: null })} onOk={() => (st.set({ dialog: null }), A.precompose(name))}>
      <Row label="Nome nuova composizione">
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={field + " w-56"} />
      </Row>
      <label className="flex items-center gap-2 py-1">
        <input type="radio" checked readOnly className="accent-[#2680eb]" /> Sposta tutti gli attributi nella nuova composizione
      </label>
      <label className="flex items-center gap-2 py-1">
        <input type="checkbox" checked readOnly className="accent-[#2680eb]" /> Apri nuova composizione
      </label>
    </Dialog>
  );
}

export function AeDialogs() {
  const st = useAe();
  const d = st.dialog;
  if (!d) return null;
  switch (d.type) {
    case "comp":
      return <CompSettings id={d.id} />;
    case "solid":
      return <SolidSettings layerId={d.layerId} />;
    case "keys":
      return <KeysHelp title="Scorciatoie da tastiera — After Effects" rows={AE_KEYS} onClose={() => st.set({ dialog: null })} />;
    case "rename":
      return <Rename title={d.title} value={d.value} onOk={d.onOk} />;
    case "precompose":
      return <Precompose />;
    case "confirm":
      return (
        <Dialog title={d.title} onCancel={() => st.set({ dialog: null })} onOk={() => (st.set({ dialog: null }), d.onOk())}>
          <p className="py-2">{d.text}</p>
        </Dialog>
      );
  }
}
