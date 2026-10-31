import { useAe, type AeState } from "@/lib/studio/ae";
import { usePremiere, type PrState } from "@/lib/studio/premiere";

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

export function enterSandbox(app: StudioApp, state: object) {
  const ls = storage();
  if (ls && ls.getItem(backupKey(app)) === null) ls.setItem(backupKey(app), ls.getItem(KEYS[app]) ?? "");
  active[app] = true;
  store(app).setState({ ...clean(app), ...state });
}

export function exitSandbox(app: StudioApp) {
  active[app] = false;
  const ls = storage();
  const raw = ls?.getItem(backupKey(app));
  if (!ls || raw === null || raw === undefined) return;
  ls.removeItem(backupKey(app));
  if (!raw) {
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

export function recoverSandbox(app: StudioApp) {
  if (!active[app]) exitSandbox(app);
}

