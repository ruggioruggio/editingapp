import { usePremiere, seqOf } from "@/lib/studio/premiere";
import { typing } from "../chrome";
import * as A from "./actions";
import { openImport } from "./ProjectPanels";

// Scorciatoie da tastiera di Premiere Pro (come in "Scorciatoie da tastiera…").

export const PR_KEYS: [string, string][] = [
  ["Ctrl+N", "Nuova sequenza"],
  ["Ctrl+/", "Nuovo raccoglitore"],
  ["Ctrl+I", "Importa"],
  ["Ctrl+S", "Salva"],
  ["Ctrl+M", "Esporta media"],
  ["Ctrl+Z", "Annulla"],
  ["Ctrl+Maiusc+Z", "Ripeti"],
  ["Ctrl+X", "Taglia"],
  ["Ctrl+C", "Copia"],
  ["Ctrl+V", "Incolla"],
  ["Ctrl+Maiusc+V", "Incolla e inserisci"],
  ["Ctrl+Alt+V", "Incolla attributi"],
  ["Canc", "Cancella"],
  ["Maiusc+Canc", "Elimina con increspatura"],
  ["Ctrl+A", "Seleziona tutto"],
  ["Ctrl+Maiusc+A", "Deseleziona tutto"],
  ["Ctrl+K", "Aggiungi modifica"],
  ["Ctrl+Maiusc+K", "Aggiungi modifica a tutte le tracce"],
  ["Ctrl+D", "Applica transizione video"],
  ["Ctrl+Maiusc+D", "Applica transizione audio"],
  ["Maiusc+D", "Applica transizioni predefinite alla selezione"],
  ["Ctrl+L", "Collega / Scollega"],
  ["Maiusc+E", "Abilita / Disabilita clip"],
  ["Ctrl+R", "Velocità/Durata"],
  ["Spazio", "Riproduci / Interrompi"],
  ["J", "Riproduci indietro (premi più volte per accelerare)"],
  ["K", "Interrompi"],
  ["L", "Riproduci avanti (premi più volte per accelerare)"],
  ["← / →", "Fotogramma precedente / successivo"],
  ["Maiusc+← / →", "Indietro / avanti di 5 fotogrammi"],
  ["↑ / ↓", "Punto di modifica precedente / successivo"],
  ["Home / Fine", "Inizio / fine sequenza"],
  ["I / O", "Contrassegna attacco / uscita"],
  ["Maiusc+I / Maiusc+O", "Vai ad attacco / uscita"],
  ["Ctrl+Maiusc+X", "Cancella attacco e uscita"],
  ["X", "Contrassegna clip"],
  ["/", "Contrassegna selezione"],
  [", / .", "Inserisci / Sovrascrivi"],
  ["; / '", "Solleva / Estrai"],
  ["Q / W", "Rifila con increspatura la modifica precedente / successiva fino all'indicatore"],
  ["Alt+← / →", "Sposta le clip selezionate di 1 fotogramma"],
  ["Alt+↑ / ↓", "Sposta le clip selezionate di una traccia"],
  ["M", "Aggiungi marcatore"],
  ["Maiusc+M / Ctrl+Maiusc+M", "Marcatore successivo / precedente"],
  ["F", "Corrispondenza fotogramma"],
  ["S", "Aggancia nella timeline"],
  ["= / -", "Ingrandisci / Riduci"],
  ["\\", "Adatta sequenza alla finestra"],
  ["`", "Ingrandisci/ripristina il pannello sotto il puntatore"],
  ["V", "Strumento Selezione"],
  ["A / Maiusc+A", "Selezione traccia avanti / indietro"],
  ["B", "Strumento Modifica con increspatura"],
  ["N", "Strumento Modifica rotazione"],
  ["R", "Strumento Allunga velocità"],
  ["C", "Strumento Lama"],
  ["Y", "Strumento Scorrimento"],
  ["U", "Strumento Scivolamento"],
  ["P", "Strumento Penna"],
  ["H", "Strumento Mano"],
  ["Z", "Strumento Zoom"],
  ["T", "Strumento Testo"],
];

export function handlePremiereKey(e: KeyboardEvent) {
  const s = usePremiere.getState();
  if (typing(e) || s.dialog || s.editingText) return;
  if (s.mode !== "edit") return;
  const k = e.key.toLowerCase();
  const code = e.code;
  const ctrl = e.ctrlKey || e.metaKey;
  const shift = e.shiftKey;
  const alt = e.altKey;
  let ok = true;

  if (ctrl) {
    if (k === "z") shift ? s.redo() : s.undo();
    else if (k === "y") s.redo();
    else if (k === "x" && shift) A.clearInOut();
    else if (k === "x") A.copy(true);
    else if (k === "c") A.copy(false);
    else if (k === "v" && alt) s.clipboard?.length && s.set({ dialog: { type: "pasteAttr" } });
    else if (k === "v") A.paste(shift);
    else if (k === "a" && shift) s.set({ selection: [], gap: null, selTrans: null });
    else if (k === "a") s.focus === "project" ? s.set({ projectSel: s.project.items.filter((i) => i.parent === s.bin).map((i) => i.id) }) : A.selectAll();
    else if (k === "k") A.addEdit(shift);
    else if (k === "d") A.applyDefaultTransition(shift ? "audio" : "video");
    else if (k === "l") A.linkUnlink();
    else if (k === "r") s.selection.length && s.set({ dialog: { type: "speed", ids: s.selection } });
    else if (k === "n") s.set({ dialog: { type: "sequence" } });
    else if (k === "/") A.newBin();
    else if (k === "i") openImport();
    else if (k === "m" && shift) A.goMarker(-1);
    else if (k === "m") seqOf(s) && s.set({ dialog: { type: "export" } });
    else if (k === "s") {
      s.set({ saved: true });
      s.notify("Progetto salvato");
    } else ok = false;
  } else if (alt) {
    if (k === "arrowleft") A.nudge(-1);
    else if (k === "arrowright") A.nudge(1);
    else if (k === "arrowup") A.moveToTrack(1);
    else if (k === "arrowdown") A.moveToTrack(-1);
    else ok = false;
  } else if (k === " ") A.togglePlay();
  else if (k === "j") A.shuttle(-1);
  else if (k === "k") A.shuttle(0);
  else if (k === "l") A.shuttle(1);
  else if (k === "arrowleft") A.stepFrames(shift ? -5 : -1);
  else if (k === "arrowright") A.stepFrames(shift ? 5 : 1);
  else if (k === "arrowup") A.goEdit(-1);
  else if (k === "arrowdown") A.goEdit(1);
  else if (k === "home") s.focus === "source" ? s.set({ source: { ...s.source, t: 0 } }) : s.setPlayhead(0);
  else if (k === "end") {
    const q = seqOf(s);
    if (q) s.setPlayhead(q.clips.reduce((m, c) => Math.max(m, c.start + (c.out - c.in) / c.speed), 0));
  } else if (k === "i") shift ? A.goToIn() : A.markIn();
  else if (k === "o") shift ? A.goToOut() : A.markOut();
  else if (k === "x") A.markClip();
  else if (k === "/") A.markSelection();
  else if (k === "," || code === "Comma") A.place("insert");
  else if (k === "." || code === "Period") A.place("overwrite");
  else if (k === ";") A.liftOrExtract(false);
  else if (k === "'") A.liftOrExtract(true);
  else if (k === "q") A.rippleTrimToPlayhead("prev");
  else if (k === "w") A.rippleTrimToPlayhead("next");
  else if (k === "m") shift ? A.goMarker(1) : A.addMarker();
  else if (k === "f") A.matchFrame();
  else if (k === "s") s.set({ snapping: !s.snapping });
  else if (k === "=" || k === "+") A.zoom(1.4);
  else if (k === "-") A.zoom(1 / 1.4);
  else if (k === "\\") A.zoomToFit();
  else if (k === "d" && shift) A.applyDefaultTransition("both");
  else if (k === "e" && shift) A.toggleEnable();
  else if (k === "delete" || k === "backspace") {
    if (s.focus === "project" && s.projectSel.length) A.deleteProjectItems(s.projectSel);
    else A.deleteSelection(shift);
  } else if (k === "`") {
    s.set({ maximized: s.maximized ? null : s.focus });
  } else if (k === "escape") s.set({ selection: [], gap: null, selTrans: null, menu: null });
  else if (k === "v") A.setTool("select");
  else if (k === "a") A.setTool(shift ? "trackBack" : "trackFwd");
  else if (k === "b") A.setTool("ripple");
  else if (k === "n") A.setTool("roll");
  else if (k === "r") A.setTool("rate");
  else if (k === "c") A.setTool("razor");
  else if (k === "y") A.setTool("slip");
  else if (k === "u") A.setTool("slide");
  else if (k === "p") A.setTool("pen");
  else if (k === "h") A.setTool("hand");
  else if (k === "z") A.setTool("zoom");
  else if (k === "t") A.setTool("type");
  else ok = false;
  if (ok) {
    e.preventDefault();
    e.stopPropagation();
  }
}
