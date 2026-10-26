import { useAe, type AeState } from "@/lib/studio/ae";
import { usePremiere, type PrState } from "@/lib/studio/premiere";

// "Sabbiera" degli esercizi nelle lezioni: il simulatore riceve un progetto
// preparato per l'esercizio, e il progetto vero dell'utente viene messo da
// parte (anche in localStorage, così si recupera se la pagina si chiude a
// metà) e rimesso al suo posto alla fine.

export type StudioApp = "premiere" | "ae";

const KEYS: Record<StudioApp, string> = { premiere: "studio-premiere-v2", ae: "studio-ae-v2" };
const backupKey = (app: StudioApp) => `${KEYS[app]}-lesson-backup`;
const active: Record<StudioApp, boolean> = { premiere: false, ae: false };

const CLEAN_PR: Partial<PrState> = {
  past: [],
  future: [],
  gesture: null,
  selection: [],
  selTrans: null,
  gap: null,
  playing: false,
  dialog: null,
  menu: null,
  toast: null,
  source: { mediaId: null, t: 0, in: null, out: null, playing: false },
  bin: null,
  projectSel: [],
  tool: "select",
  maximized: null,
  clipboard: null,
  editingText: null,
  lastExport: null,
  saved: true,
};

const CLEAN_AE: Partial<AeState> = {
  past: [],
  future: [],
  gesture: null,
  playing: false,
  selected: [],
  selectedKeys: [],
  selectedProps: [],
  open: {},
  exprOpen: [],
  tool: "select",
  graph: false,
  projectSel: [],
  folder: null,
  clipboard: null,
  dialog: null,
  menu: null,
  toast: null,
  editingText: null,
  maskDraft: null,
  saved: true,
};

const store = (app: StudioApp) => (app === "premiere" ? usePremiere : useAe) as unknown as { setState: (s: object) => void; getState: () => { reset: () => void } };
const clean = (app: StudioApp) => (app === "premiere" ? CLEAN_PR : CLEAN_AE);

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Carica nel simulatore il progetto dell'esercizio, salvando quello dell'utente. */
export function enterSandbox(app: StudioApp, state: object) {
  const ls = storage();
  // se c'è già un backup (pagina chiusa a metà esercizio) quello è il progetto vero: non va sovrascritto
  if (ls && ls.getItem(backupKey(app)) === null) ls.setItem(backupKey(app), ls.getItem(KEYS[app]) ?? "");
  active[app] = true;
  store(app).setState({ ...clean(app), ...state });
}

/** Rimette il progetto dell'utente com'era prima dell'esercizio. */
export function exitSandbox(app: StudioApp) {
  active[app] = false;
  const ls = storage();
  const raw = ls?.getItem(backupKey(app));
  if (!ls || raw === null || raw === undefined) return;
  ls.removeItem(backupKey(app));
  if (!raw) {
    // l'utente non aveva mai aperto il simulatore: si torna al progetto di esempio
    store(app).getState().reset();
    return;
  }
  try {
    const saved = (JSON.parse(raw) as { state?: object }).state ?? {};
    store(app).setState({ ...clean(app), ...saved });
    ls.setItem(KEYS[app], raw);
  } catch {
    store(app).getState().reset();
  }
}

/** All'apertura del simulatore: recupera un progetto rimasto da parte da un esercizio interrotto. */
export function recoverSandbox(app: StudioApp) {
  if (!active[app]) exitSandbox(app);
}

