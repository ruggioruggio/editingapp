import { compOf, timeOf, useAe } from "@/lib/studio/ae";
import { typing } from "../chrome";
import * as A from "./actions";
import { openAeImport } from "./Panels";

export const AE_KEYS: [string, string][] = [
  ["Ctrl+N", "Nuova composizione"],
  ["Ctrl+K", "Impostazioni composizione"],
  ["Ctrl+I", "Importa file"],
  ["Ctrl+Y", "Nuova tinta unita"],
  ["Ctrl+Alt+Y", "Nuovo livello di regolazione"],
  ["Ctrl+Alt+Maiusc+Y", "Nuovo oggetto nullo"],
  ["Ctrl+Alt+Maiusc+T", "Nuovo livello di testo"],
  ["Ctrl+Maiusc+Y", "Impostazioni tinta unita"],
  ["Ctrl+Maiusc+C", "Pre-componi"],
  ["Ctrl+Z / Ctrl+Maiusc+Z", "Annulla / Ripeti"],
  ["Ctrl+X / C / V", "Taglia / Copia / Incolla (livelli o fotogrammi chiave)"],
  ["Ctrl+D", "Duplica"],
  ["Ctrl+Maiusc+D", "Dividi livello"],
  ["Canc", "Elimina"],
  ["Ctrl+A / Ctrl+Maiusc+A", "Seleziona / Deseleziona tutto"],
  ["Invio", "Rinomina livello"],
  ["Spazio", "Anteprima"],
  ["Home / Fine", "Inizio / fine composizione"],
  ["PagSu / PagGiù", "Fotogramma precedente / successivo"],
  ["Maiusc+PagSu / PagGiù", "Indietro / avanti di 10 fotogrammi"],
  ["J / K", "Fotogramma chiave o marcatore precedente / successivo"],
  ["I / O", "Attacco / uscita del livello"],
  ["B / N", "Inizio / fine area di lavoro"],
  ["[ / ]", "Sposta inizio / fine livello all'indicatore"],
  ["Alt+[ / Alt+]", "Rifila inizio / fine livello"],
  ["P", "Posizione"],
  ["S", "Scala"],
  ["R", "Rotazione"],
  ["T", "Opacità"],
  ["A", "Punto di ancoraggio"],
  ["U", "Proprietà animate"],
  ["E", "Effetti"],
  ["M", "Maschere"],
  ["L", "Livelli audio"],
  ["Maiusc+lettera", "Aggiunge la proprietà a quelle mostrate"],
  ["Alt+Maiusc+P/S/R/T/A", "Aggiunge un fotogramma chiave"],
  ["F9", "Easy Ease"],
  ["Maiusc+F9", "Easy Ease in entrata"],
  ["Ctrl+Maiusc+F9", "Easy Ease in uscita"],
  ["Ctrl+Alt+H", "Interpolazione tenuta"],
  ["Maiusc+F3", "Editor grafico"],
  ["F4", "Switch / Modalità"],
  ["Ctrl+] / Ctrl+[", "Porta avanti / indietro il livello"],
  ["Ctrl+Maiusc+] / [", "Porta in primo piano / in fondo"],
  ["Ctrl+Alt+Home", "Centra punto di ancoraggio"],
  ["Ctrl+Home", "Centra il livello"],
  ["Ctrl+Alt+F", "Adatta alla composizione"],
  ["Ctrl+Alt+R", "Inverti tempo livello"],
  ["V", "Selezione"],
  ["H", "Mano"],
  ["Z", "Zoom"],
  ["W", "Rotazione"],
  ["Y", "Retro (punto di ancoraggio)"],
  ["Q", "Forme (premi più volte per cambiare)"],
  ["G", "Penna (maschera sul livello selezionato)"],
  ["Ctrl+T", "Testo"],
  ["F2", "Deseleziona tutto"],
];

const SHAPES = ["rect", "rrect", "ellipse", "polygon", "star"] as const;

export function handleAeKey(e: KeyboardEvent) {
  const s = useAe.getState();
  if (typing(e) || s.dialog || s.editingText) return;
  const k = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  const shift = e.shiftKey;
  const alt = e.altKey;
  const c = compOf(s);
  const fr = 1 / (c?.fps ?? 30);
  const t = timeOf(s);
  let ok = true;
  const PROP: Record<string, string> = { p: "t.position", s: "t.scale", r: "t.rotation", t: "t.opacity", a: "t.anchor" };

  if (ctrl && alt && shift && k === "y") A.addLayer("null");
  else if (ctrl && alt && shift && k === "t") A.addLayer("text");
  else if (ctrl && alt && shift && k === "n") A.newFolder();
  else if (ctrl && alt && k === "y") A.addLayer("adjustment");
  else if (ctrl && alt && k === "h") A.setInterp("hold");
  else if (ctrl && alt && k === "home") A.centerAnchor();
  else if (ctrl && alt && k === "f") A.fitToComp("fit");
  else if (ctrl && alt && k === "r") A.reverseLayer();
  else if (ctrl && shift && k === "y") {
    const l = c?.layers.find((x) => s.selected.includes(x.id) && x.type === "solid");
    if (l) s.set({ dialog: { type: "solid", layerId: l.id } });
  } else if (ctrl && shift && k === "c") s.selected.length && s.set({ dialog: { type: "precompose" } });
  else if (ctrl && shift && k === "d") A.splitLayer();
  else if (ctrl && shift && k === "z") s.redo();
  else if (ctrl && shift && k === "a") s.set({ selected: [], selectedKeys: [] });
  else if (ctrl && shift && k === "f9") A.setInterp("easeOut");
  else if (ctrl && shift && (k === "]" || e.code === "BracketRight")) A.moveLayerOrder("top");
  else if (ctrl && shift && (k === "[" || e.code === "BracketLeft")) A.moveLayerOrder("bottom");
  else if (ctrl && k === "z") s.undo();
  else if (ctrl && k === "y") s.set({ dialog: { type: "solid" } });
  else if (ctrl && k === "x") A.copy(true);
  else if (ctrl && k === "c") A.copy(false);
  else if (ctrl && k === "v") A.paste();
  else if (ctrl && k === "d") A.duplicate();
  else if (ctrl && k === "a") A.selectAll();
  else if (ctrl && k === "n") s.set({ dialog: { type: "comp" } });
  else if (ctrl && k === "k") c && s.set({ dialog: { type: "comp", id: c.id } });
  else if (ctrl && k === "i") openAeImport();
  else if (ctrl && k === "t") s.set({ tool: "text" });
  else if (ctrl && k === "home") A.centerLayer();
  else if (ctrl && k === "s") (s.set({ saved: true }), s.notify("Progetto salvato"));
  else if (ctrl && k === "m") s.notify("Coda di rendering: l'esportazione non è disponibile nel simulatore");
  else if (ctrl && (k === "]" || e.code === "BracketRight")) A.moveLayerOrder("up");
  else if (ctrl && (k === "[" || e.code === "BracketLeft")) A.moveLayerOrder("down");
  else if (ctrl) ok = false;
  else if (alt && shift && PROP[k]) A.keyProp(PROP[k]);
  else if (alt && (k === "[" || e.code === "BracketLeft")) A.trimTo("in");
  else if (alt && (k === "]" || e.code === "BracketRight")) A.trimTo("out");
  else if (k === "[" || e.code === "BracketLeft") A.moveTo("in");
  else if (k === "]" || e.code === "BracketRight") A.moveTo("out");
  else if (k === "f9") A.setInterp(shift ? "easeIn" : "ease");
  else if (k === "f3" && shift) s.set({ graph: !s.graph });
  else if (k === "f4") s.set({ modes: !s.modes });
  else if (k === "f2") s.set({ selected: [], selectedKeys: [] });
  else if (k === " ") s.set({ playing: !s.playing });
  else if (k === "home") s.setTime(0);
  else if (k === "end") s.setTime(c?.duration ?? 0);
  else if (k === "pageup") s.setTime(t - fr * (shift ? 10 : 1));
  else if (k === "pagedown") s.setTime(t + fr * (shift ? 10 : 1));
  else if (k === "arrowleft" && !shift) s.setTime(t - fr);
  else if (k === "arrowright" && !shift) s.setTime(t + fr);
  else if (k === "j") A.goKey(-1);
  else if (k === "k") A.goKey(1);
  else if (k === "b") c && s.commitComp((x) => ({ ...x, workIn: Math.min(t, x.workOut - fr) }), "Inizio area di lavoro");
  else if (k === "n") c && s.commitComp((x) => ({ ...x, workOut: Math.max(t + fr, x.workIn + fr) }), "Fine area di lavoro");
  else if (k === "i") {
    const l = c?.layers.find((x) => s.selected.includes(x.id));
    if (l) s.setTime(l.inPoint);
  } else if (k === "o") {
    const l = c?.layers.find((x) => s.selected.includes(x.id));
    if (l) s.setTime(l.outPoint - fr);
  } else if (PROP[k] && !alt) A.reveal([PROP[k]], shift);
  else if (k === "u") A.reveal("animated", shift);
  else if (k === "e") A.reveal("effects", shift);
  else if (k === "m") A.reveal("masks", shift);
  else if (k === "f") A.reveal("masks", shift);
  else if (k === "l") A.reveal("audio", shift);
  else if (k === "delete" || k === "backspace") {
    if (s.projectSel.length && !s.selected.length) A.deleteItems(s.projectSel);
    else A.deleteSelected();
  } else if (k === "enter") {
    const l = c?.layers.find((x) => s.selected.includes(x.id));
    if (l) s.set({ dialog: { type: "rename", title: "Rinomina livello", value: l.name, onOk: (v) => A.updateLayer(l.id, (x) => ({ ...x, name: v }), "Rinomina livello") } });
  } else if (k === "escape") s.set({ selected: [], selectedKeys: [], maskDraft: null, menu: null });
  else if (k === "v") s.set({ tool: "select" });
  else if (k === "h") s.set({ tool: "hand" });
  else if (k === "z") s.set({ tool: "zoom" });
  else if (k === "w") s.set({ tool: "rotate" });
  else if (k === "y") s.set({ tool: "anchor" });
  else if (k === "g") s.set({ tool: "pen" });
  else if (k === "q") {
    const i = SHAPES.indexOf(s.tool as (typeof SHAPES)[number]);
    s.set({ tool: SHAPES[(i + 1) % SHAPES.length] });
  } else ok = false;
  if (ok) {
    e.preventDefault();
    e.stopPropagation();
  }
}
