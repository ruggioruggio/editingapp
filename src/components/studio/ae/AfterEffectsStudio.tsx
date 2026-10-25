"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Circle, Film, Folder, Hand, MousePointer2, Pause, Play, Square, Type } from "lucide-react";
import { PButton, PNumber, PSelect, Row, Scrubby } from "@/components/premiere/controls";
import {
  PROP_KEYS,
  PROP_SHORTCUT,
  addKey,
  isAnimated,
  makeLayer,
  updateKeys,
  useAfterEffects,
  type AeComp,
  type AeLayer,
  type AeTool,
  type Interp,
} from "@/lib/studio/afterEffects";
import { KeysHelp, MenuBar, Modal, Panel, Toast, typing, usePlayback, useWide, type Menu } from "../chrome";
import { CompView } from "./CompView";
import { AeTimeline } from "./AeTimeline";

const KEYS: [string, string][] = [
  ["Spazio", "Anteprima (riproduci / ferma)"],
  ["Home / Fine", "Inizio / fine composizione"],
  ["PagSu / PagGiù", "Fotogramma precedente / successivo"],
  ["J / K", "Keyframe precedente / successivo"],
  ["P", "Mostra Posizione"],
  ["S", "Mostra Scala"],
  ["R", "Mostra Rotazione"],
  ["T", "Mostra Opacità"],
  ["A", "Mostra Punto di ancoraggio"],
  ["U", "Mostra le proprietà animate"],
  ["Alt+Maiusc+P/S/R/T", "Aggiungi keyframe a quella proprietà"],
  ["F9", "Easy Ease sui keyframe selezionati"],
  ["Ctrl+Alt+H", "Interpolazione tenuta"],
  ["V", "Strumento Selezione"],
  ["H", "Strumento Mano"],
  ["Ctrl+T", "Strumento Testo"],
  ["Q", "Rettangolo / Ellisse"],
  ["Ctrl+Y", "Nuova tinta unita"],
  ["Ctrl+D", "Duplica livello"],
  ["Canc", "Elimina keyframe o livello"],
  ["[ / ]", "Sposta inizio / fine livello all'istante corrente"],
  ["Alt+[ / Alt+]", "Rifila inizio / fine del livello"],
  ["Ctrl+K", "Impostazioni composizione"],
  ["Ctrl+Z / Ctrl+Maiusc+Z", "Annulla / ripeti"],
];

const TOOLS: { id: AeTool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Selezione (V)", icon: MousePointer2 },
  { id: "hand", label: "Mano (H)", icon: Hand },
  { id: "rect", label: "Rettangolo (Q)", icon: Square },
  { id: "ellipse", label: "Ellisse (Q)", icon: Circle },
  { id: "text", label: "Testo orizzontale (Ctrl+T)", icon: Type },
];

function Tools() {
  const st = useAfterEffects();
  return (
    <div className="flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b border-black bg-[#1e1e1e] px-2">
      {TOOLS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => st.set({ tool: id })}
          className={clsx("grid h-7 w-7 shrink-0 place-items-center rounded", st.tool === id ? "bg-[#2680eb] text-white" : "text-[#bdbdbd] hover:bg-white/10")}
        >
          <Icon size={15} />
        </button>
      ))}
      <span className="mx-2 h-5 w-px bg-[#3a3a3a]" />
      <button type="button" onClick={() => st.set({ playing: !st.playing })} className="flex items-center gap-1 rounded px-2 py-1 text-[12px] text-[#cfcfcf] hover:bg-white/10" title="Anteprima (Spazio)">
        {st.playing ? <Pause size={14} /> : <Play size={14} />} Anteprima
      </button>
    </div>
  );
}

function ProjectPanel() {
  const { comp } = useAfterEffects();
  return (
    <div className="space-y-2 overflow-y-auto p-2 text-[12px]">
      <div className="flex gap-2 rounded bg-[#1b1b1b] p-2">
        <div className="grid h-12 w-20 shrink-0 place-items-center rounded-sm" style={{ background: comp.layers.at(-1)?.type === "solid" ? comp.layers.at(-1)!.color : "#000" }}>
          <Film size={16} className="text-white/70" />
        </div>
        <div className="text-[11px] leading-snug text-[#9a9a9a]">
          <p className="font-semibold text-white">{comp.name}</p>
          <p>
            {comp.width} × {comp.height} (1,00)
          </p>
          <p>
            Δ 0:00:{String(comp.duration).padStart(2, "0")}:00, {comp.fps} fps
          </p>
        </div>
      </div>
      <p className="flex items-center gap-1.5 px-1 text-[#cfcfcf]">
        <Film size={13} className="text-[#d291ff]" /> {comp.name}
      </p>
      <p className="flex items-center gap-1.5 px-1 text-[#cfcfcf]">
        <Folder size={13} className="text-[#d8b45a]" /> Solidi
      </p>
    </div>
  );
}

/** Pannello Carattere / Proprietà del livello selezionato. */
function PropertiesPanel() {
  const st = useAfterEffects();
  const { comp, selected } = st;
  const l = comp.layers.find((x) => x.id === selected[0]);
  if (!l) return <p className="p-3 text-[12px] text-[#8f8f8f]">Seleziona un livello per modificarne testo, colore e forma.</p>;
  const upd = (patch: Partial<AeLayer>, key: string) => st.commit({ ...comp, layers: comp.layers.map((k) => (k.id === l.id ? { ...k, ...patch } : k)) }, key + l.id);
  return (
    <div className="space-y-3 overflow-y-auto p-3 text-[12px]">
      <label className="block">
        <span className="text-[#9a9a9a]">Nome livello</span>
        <input value={l.name} onChange={(e) => upd({ name: e.target.value }, "name")} className="mt-1 h-7 w-full rounded border border-[#3e3e3e] bg-[#1b1b1b] px-2 text-white outline-none focus:border-[#2680eb]" />
      </label>
      {l.type === "text" && (
        <>
          <label className="block">
            <span className="text-[#9a9a9a]">Testo</span>
            <textarea
              value={l.text}
              rows={2}
              onChange={(e) => upd({ text: e.target.value, name: e.target.value.slice(0, 24) || "Testo" }, "text")}
              className="mt-1 w-full rounded border border-[#3e3e3e] bg-[#1b1b1b] px-2 py-1 text-white outline-none focus:border-[#2680eb]"
            />
          </label>
          <div className="flex items-center justify-between">
            <span className="text-[#9a9a9a]">Dimensione font</span>
            <Scrubby value={l.fontSize ?? 100} min={8} max={600} decimals={0} suffix=" px" onChange={(v) => upd({ fontSize: v }, "fs")} />
          </div>
        </>
      )}
      {l.type === "shape" && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[#9a9a9a]">Forma</span>
            <PSelect value={l.shape ?? "rect"} options={["rect", "ellipse", "star"] as const} format={(v) => ({ rect: "Rettangolo", ellipse: "Ellisse", star: "Stella" })[v]} onChange={(v) => upd({ shape: v }, "shape")} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#9a9a9a]">Dimensione</span>
            <span className="flex gap-2">
              <Scrubby value={l.size?.[0] ?? 200} min={1} max={4000} decimals={0} onChange={(v) => upd({ size: [v, l.size?.[1] ?? 200] }, "w")} />
              <Scrubby value={l.size?.[1] ?? 200} min={1} max={4000} decimals={0} onChange={(v) => upd({ size: [l.size?.[0] ?? 200, v] }, "h")} />
            </span>
          </div>
        </>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[#9a9a9a]">{l.type === "shape" ? "Riempimento" : "Colore"}</span>
        <input type="color" value={l.color} onChange={(e) => upd({ color: e.target.value }, "color")} className="h-7 w-12 cursor-pointer rounded border border-[#3e3e3e] bg-transparent" />
      </div>
      <p className="border-t border-[#333] pt-2 text-[11px] leading-relaxed text-[#7a7a7a]">
        Per animare: apri il livello nella timeline (o premi P, S, R, T), clicca il cronometro, sposta l&apos;indicatore e cambia il valore.
      </p>
    </div>
  );
}

function CompSettings({ onClose }: { onClose: () => void }) {
  const st = useAfterEffects();
  const [c, setC] = useState<Pick<AeComp, "name" | "width" | "height" | "fps" | "duration" | "bg">>(st.comp);
  return (
    <Modal onClose={onClose}>
      <div className="mx-auto max-w-lg rounded-lg border border-black bg-[#232323] text-[#c8c8c8] shadow-2xl">
        <div className="flex h-9 items-center border-b border-black bg-[#2b2b2b] px-4 text-[13px] font-semibold text-white">Impostazioni composizione</div>
        <div className="space-y-1 p-4">
          <Row label="Nome composizione">
            <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} className="h-7 w-full rounded border border-[#3e3e3e] bg-[#1b1b1b] px-2 text-[12px] text-white outline-none focus:border-[#2680eb]" />
          </Row>
          <Row label="Predefinito">
            <PSelect
              value={`${c.width}x${c.height}`}
              options={["1920x1080", "3840x2160", "1080x1920", "1080x1080", "1280x720"] as const as readonly string[]}
              format={(v) => ({ "1920x1080": "HD 1080 · 1920×1080", "3840x2160": "UHD 4K · 3840×2160", "1080x1920": "Social verticale · 1080×1920", "1080x1080": "Quadrato · 1080×1080", "1280x720": "HD 720 · 1280×720" })[v] ?? v}
              onChange={(v) => {
                const [w, h] = v.split("x").map(Number);
                setC({ ...c, width: w, height: h });
              }}
            />
          </Row>
          <Row label="Larghezza / Altezza">
            <PNumber value={c.width} min={16} max={8192} onChange={(width) => setC({ ...c, width })} />
            <PNumber value={c.height} min={16} max={8192} onChange={(height) => setC({ ...c, height })} />
          </Row>
          <Row label="Frequenza fotogrammi">
            <PSelect value={c.fps} options={[23.976, 24, 25, 29.97, 30, 50, 60] as const as readonly number[]} format={(v) => String(v).replace(".", ",")} onChange={(fps) => setC({ ...c, fps })} />
          </Row>
          <Row label="Durata (secondi)">
            <PNumber value={c.duration} min={1} max={60} onChange={(duration) => setC({ ...c, duration })} />
          </Row>
          <Row label="Colore sfondo">
            <input type="color" value={c.bg} onChange={(e) => setC({ ...c, bg: e.target.value })} className="h-7 w-12 rounded border border-[#3e3e3e] bg-transparent" />
          </Row>
        </div>
        <div className="flex justify-end gap-2 border-t border-black px-4 py-3">
          <PButton onClick={onClose}>Annulla</PButton>
          <PButton
            primary
            onClick={() => {
              const s = useAfterEffects.getState();
              s.commit({ ...s.comp, ...c, layers: s.comp.layers.map((l) => ({ ...l, outPoint: Math.min(l.outPoint, c.duration) })) });
              s.set({ time: Math.min(s.time, c.duration) });
              onClose();
            }}
          >
            OK
          </PButton>
        </div>
      </div>
    </Modal>
  );
}

/** Solo lato client: il simulatore usa tastiera, misure dello schermo e numeri calcolati al volo. */
export function AfterEffectsStudio() {
  const hydrated = useHydrated();
  return hydrated ? <AfterEffectsStudioInner /> : <div className="fixed inset-0 bg-[#161616]" />;
}

function AfterEffectsStudioInner() {
  const st = useAfterEffects();
  const wide = useWide();
  const [mobileTab, setMobileTab] = useState<"Timeline" | "Proprietà" | "Progetto">("Timeline");
  const [rightTab, setRightTab] = useState<"Carattere" | "Info">("Carattere");

  usePlayback(st.playing, (dt) => {
    const s = useAfterEffects.getState();
    const t = s.time + dt;
    s.set({ time: t >= s.comp.duration ? 0 : t }); // l'anteprima va in loop
  });

  const act = {
    newLayer: (type: "text" | "shape" | "solid") => {
      const s = useAfterEffects.getState();
      const l = makeLayer(type, s.comp, s.comp.layers.length, undefined, type === "text" ? { name: "Testo", text: "Testo" } : {});
      s.commit({ ...s.comp, layers: [l, ...s.comp.layers] });
      s.set({ selected: [l.id] });
    },
    duplicate: () => {
      const s = useAfterEffects.getState();
      const ls = s.comp.layers.filter((l) => s.selected.includes(l.id));
      if (!ls.length) return;
      const copies = ls.map((l) => ({ ...structuredClone(l), id: `${l.id}c${Date.now() % 100000}`, name: `${l.name} 2` }));
      s.commit({ ...s.comp, layers: [...copies, ...s.comp.layers] });
      s.set({ selected: copies.map((c) => c.id) });
    },
    remove: () => {
      const s = useAfterEffects.getState();
      if (s.selectedKeys.length) {
        s.commit(updateKeys(s.comp, new Set(s.selectedKeys), () => null));
        return s.set({ selectedKeys: [] });
      }
      if (s.selected.length) s.commit({ ...s.comp, layers: s.comp.layers.filter((l) => !s.selected.includes(l.id)) });
    },
    interp: (i: Interp) => {
      const s = useAfterEffects.getState();
      if (!s.selectedKeys.length) return s.notify("Seleziona prima uno o più keyframe nella timeline");
      s.commit(updateKeys(s.comp, new Set(s.selectedKeys), (k) => ({ ...k, interp: i })));
      s.notify(i === "ease" ? "Easy Ease applicato" : i === "hold" ? "Interpolazione tenuta" : "Interpolazione lineare");
    },
    reveal: (keys: (typeof PROP_KEYS)[number][] | "animated", add: boolean) => {
      const s = useAfterEffects.getState();
      const targets = s.selected.length ? s.comp.layers.filter((l) => s.selected.includes(l.id)) : s.comp.layers;
      const open = { ...s.open };
      for (const l of targets) {
        const want = keys === "animated" ? PROP_KEYS.filter((k) => isAnimated(l, k)) : keys;
        const cur = add ? open[l.id] ?? [] : [];
        const next = PROP_KEYS.filter((k) => cur.includes(k) || want.includes(k));
        if (next.length && !(open[l.id] && !add && JSON.stringify(open[l.id]) === JSON.stringify(next))) open[l.id] = next;
        else delete open[l.id];
      }
      s.set({ open });
    },
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useAfterEffects.getState();
      if (typing(e) || (s.dialog && s.dialog !== "keys")) return;
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const frame = 1 / s.comp.fps;
      const sel = s.comp.layers.filter((l) => s.selected.includes(l.id));
      const keyTimes = [...new Set((sel.length ? sel : s.comp.layers).flatMap((l) => PROP_KEYS.flatMap((p) => l.props[p].keys?.map((x) => x.t) ?? [])))].sort((a, b) => a - b);
      let handled = true;
      if (ctrl && e.altKey && k === "h") act.interp("hold");
      else if (ctrl && k === "z") e.shiftKey ? s.redo() : s.undo();
      else if (ctrl && k === "y" && e.shiftKey) s.redo();
      else if (ctrl && k === "y") act.newLayer("solid");
      else if (ctrl && k === "d") act.duplicate();
      else if (ctrl && k === "t") s.set({ tool: "text" });
      else if (ctrl && k === "k") s.set({ dialog: "comp" });
      else if (ctrl && k === "a") s.set({ selected: s.comp.layers.map((l) => l.id) });
      else if (ctrl) handled = false;
      else if (e.altKey && e.shiftKey && PROP_SHORTCUT[k]) {
        for (const l of sel) s.commit(addKey(useAfterEffects.getState().comp, l.id, PROP_SHORTCUT[k], s.time));
        act.reveal([PROP_SHORTCUT[k]], true);
      } else if (e.altKey && (e.key === "[" || e.key === "]")) {
        s.commit({ ...s.comp, layers: s.comp.layers.map((l) => (s.selected.includes(l.id) ? (e.key === "[" ? { ...l, inPoint: Math.min(s.time, l.outPoint - frame) } : { ...l, outPoint: Math.max(s.time + frame, l.inPoint + frame) }) : l)) });
      } else if (k === "[" || k === "]") {
        s.commit({
          ...s.comp,
          layers: s.comp.layers.map((l) => {
            if (!s.selected.includes(l.id)) return l;
            const d = k === "[" ? s.time - l.inPoint : s.time - l.outPoint;
            return { ...l, inPoint: l.inPoint + d, outPoint: l.outPoint + d };
          }),
        });
      } else if (k === "f9") act.interp("ease");
      else if (k === " ") s.set({ playing: !s.playing });
      else if (k === "home") s.set({ time: 0 });
      else if (k === "end") s.set({ time: s.comp.duration - frame });
      else if (k === "pageup") s.set({ time: Math.max(0, s.time - frame) });
      else if (k === "pagedown") s.set({ time: Math.min(s.comp.duration, s.time + frame) });
      else if (k === "j") s.set({ time: [...keyTimes].reverse().find((t) => t < s.time - frame / 2) ?? s.time });
      else if (k === "k") s.set({ time: keyTimes.find((t) => t > s.time + frame / 2) ?? s.time });
      else if (k === "u") act.reveal("animated", false);
      else if (PROP_SHORTCUT[k]) act.reveal([PROP_SHORTCUT[k]], e.shiftKey);
      else if (k === "v") s.set({ tool: "select" });
      else if (k === "h") s.set({ tool: "hand" });
      else if (k === "q") s.set({ tool: s.tool === "rect" ? "ellipse" : "rect" });
      else if (k === "delete" || k === "backspace") act.remove();
      else if (k === "escape") s.set({ selected: [], selectedKeys: [], dialog: null });
      else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menus: Menu[] = [
    {
      label: "File",
      items: [
        { label: "Ripristina progetto di esempio", action: st.reset },
        "-",
        { label: "Esporta › Aggiungi a Media Encoder", action: () => st.notify(`"${st.comp.name}" aggiunta alla coda di rendering`) },
      ],
    },
    {
      label: "Modifica",
      items: [
        { label: "Annulla", keys: "Ctrl+Z", action: st.undo, disabled: !st.past.length },
        { label: "Ripeti", keys: "Ctrl+Maiusc+Z", action: st.redo, disabled: !st.future.length },
        "-",
        { label: "Duplica", keys: "Ctrl+D", action: act.duplicate },
        { label: "Elimina", keys: "Canc", action: act.remove },
        { label: "Seleziona tutto", keys: "Ctrl+A", action: () => st.set({ selected: st.comp.layers.map((l) => l.id) }) },
      ],
    },
    { label: "Composizione", items: [{ label: "Impostazioni composizione…", keys: "Ctrl+K", action: () => st.set({ dialog: "comp" }) }, { label: "Anteprima", keys: "Spazio", action: () => st.set({ playing: !st.playing }) }] },
    {
      label: "Livello",
      items: [
        { label: "Nuovo › Testo", keys: "Ctrl+Alt+Maiusc+T", action: () => act.newLayer("text") },
        { label: "Nuovo › Tinta unita…", keys: "Ctrl+Y", action: () => act.newLayer("solid") },
        { label: "Nuovo › Livello forma", action: () => act.newLayer("shape") },
      ],
    },
    {
      label: "Animazione",
      items: [
        { label: "Assistente fotogrammi chiave › Easy Ease", keys: "F9", action: () => act.interp("ease") },
        { label: "Interpolazione › Lineare", action: () => act.interp("linear") },
        { label: "Interpolazione › Tenuta", keys: "Ctrl+Alt+H", action: () => act.interp("hold") },
        "-",
        { label: "Mostra proprietà animate", keys: "U", action: () => act.reveal("animated", false) },
      ],
    },
    { label: "Visualizza", items: [{ label: st.graph ? "✓ Editor grafico" : "Editor grafico", action: () => st.set({ graph: st.graph ? null : st.selected[0] ? { layer: st.selected[0], prop: "position" } : null }) }] },
    { label: "Aiuto", items: [{ label: "Scorciatoie da tastiera…", action: () => st.set({ dialog: "keys" }) }] },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-[#161616] text-[#c8c8c8]">
      <MenuBar app="Ae" color="#d291ff" menus={menus} right={<span className="hidden text-[11px] text-[#7a7a7a] md:inline">Progetto.aep — SqueakEdit</span>} />
      <Tools />
      {wide ? (
        <div className="grid min-h-0 flex-1 grid-cols-[230px_minmax(0,1fr)_260px] grid-rows-[minmax(0,1.1fr)_minmax(0,1fr)] gap-1 p-1">
          <Panel tabs={["Progetto"]} tab="Progetto">
            <ProjectPanel />
          </Panel>
          <Panel tabs={["Composizione: " + st.comp.name]} tab={"Composizione: " + st.comp.name}>
            <CompView />
          </Panel>
          <Panel tabs={["Carattere", "Info"] as const} tab={rightTab} onTab={setRightTab}>
            {rightTab === "Carattere" ? <PropertiesPanel /> : <Info />}
          </Panel>
          <Panel tabs={[st.comp.name]} tab={st.comp.name} className="col-span-3" focused>
            <div className="absolute inset-0">
              <AeTimeline />
            </div>
          </Panel>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-1">
          <Panel tabs={["Composizione"]} tab="Composizione" className="h-[38%] shrink-0">
            <CompView />
          </Panel>
          <Panel tabs={["Timeline", "Proprietà", "Progetto"] as const} tab={mobileTab} onTab={setMobileTab} className="min-h-0 flex-1" focused>
            {mobileTab === "Timeline" && (
              <div className="absolute inset-0">
                <AeTimeline />
              </div>
            )}
            {mobileTab === "Proprietà" && <PropertiesPanel />}
            {mobileTab === "Progetto" && <ProjectPanel />}
          </Panel>
          <div className="flex shrink-0 gap-1 overflow-x-auto rounded-[6px] border border-[#151515] bg-[#232323] p-1 text-[11px] font-semibold">
            {[
              ["Easy Ease", () => act.interp("ease")],
              ["P", () => act.reveal(["position"], false)],
              ["S", () => act.reveal(["scale"], false)],
              ["R", () => act.reveal(["rotation"], false)],
              ["T", () => act.reveal(["opacity"], false)],
              ["Elimina", act.remove],
              ["Annulla", st.undo],
            ].map(([label, fn]) => (
              <button key={label as string} type="button" onClick={fn as () => void} className="shrink-0 rounded px-2.5 py-1.5 text-[#cfcfcf] hover:bg-white/10">
                {label as string}
              </button>
            ))}
          </div>
        </div>
      )}
      {st.dialog === "comp" && <CompSettings onClose={() => st.set({ dialog: null })} />}
      {st.dialog === "keys" && <KeysHelp title="Scorciatoie da tastiera — After Effects" rows={KEYS} onClose={() => st.set({ dialog: null })} />}
      <Toast text={st.toast} />
    </div>
  );
}

function Info() {
  const { comp, time, selected, selectedKeys } = useAfterEffects();
  const l = comp.layers.find((x) => x.id === selected[0]);
  return (
    <div className="space-y-1 p-3 font-mono text-[11px] text-[#9a9a9a]">
      <p>Tempo: {time.toFixed(2)} s · fotogramma {Math.round(time * comp.fps)}</p>
      <p>Livelli: {comp.layers.length}</p>
      <p>Selezionato: {l?.name ?? "—"}</p>
      <p>Keyframe selezionati: {selectedKeys.length}</p>
    </div>
  );
}
