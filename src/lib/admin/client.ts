"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Stato del pannello admin nel browser. La password si verifica sul server
// (cookie httpOnly); solo l'anteprima a file unico, che non ha server, usa un
// hash lento iniettato al momento della build e lavora in modalità locale.

export interface Announcement {
  text: string;
  tone: "info" | "success" | "warning";
}

interface AdminState {
  open: boolean;
  unlocked: boolean;
  mode: "server" | "local" | null;
  database: boolean;
  modShortcuts: boolean;
  /** tutte le lezioni giocabili senza finire quelle prima (solo su questo dispositivo) */
  unlockAll: boolean;
  quickBan: boolean;
  quickBanUser: string | null;
  localAnnouncement: Announcement | null;
  localMaintenance: { on: boolean; message?: string } | null;
  set: (p: Partial<AdminState>) => void;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      open: false,
      unlocked: false,
      mode: null,
      database: false,
      modShortcuts: false,
      unlockAll: false,
      quickBan: false,
      quickBanUser: null,
      localAnnouncement: null,
      localMaintenance: null,
      set: (p) => set(p),
    }),
    { name: "squeak-admin", partialize: (s) => ({ modShortcuts: s.modShortcuts, unlockAll: s.unlockAll, localAnnouncement: s.localAnnouncement, localMaintenance: s.localMaintenance }) },
  ),
);

const PREVIEW_HASH: string | undefined = typeof process !== "undefined" ? process.env.ADMIN_PREVIEW_HASH : undefined;

async function verifyLocal(password: string): Promise<boolean> {
  if (!PREVIEW_HASH) return false;
  const [algo, iter, saltHex, hashHex] = PREVIEW_HASH.split(":");
  if (algo !== "pbkdf2") return false;
  const hex = (h: string) => new Uint8Array(h.match(/../g)!.map((b) => parseInt(b, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: hex(saltHex), iterations: Number(iter) }, key, 256));
  const want = hex(hashHex);
  let diff = bits.length ^ want.length;
  for (let i = 0; i < want.length; i++) diff |= bits[i] ^ want[i];
  return diff === 0;
}

// Dopo aver inserito la password, per 10 minuti il pannello si riapre senza chiederla.
const GRACE_KEY = "squeak-admin-grace";
const GRACE_MS = 10 * 60_000;
export function markGrace() {
  try {
    localStorage.setItem(GRACE_KEY, String(Date.now() + GRACE_MS));
  } catch {
    /* niente */
  }
}
export function graceActive() {
  try {
    return Number(localStorage.getItem(GRACE_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}
function clearGrace() {
  try {
    localStorage.removeItem(GRACE_KEY);
  } catch {
    /* niente */
  }
}

/** Chiede al server se la sessione admin è ancora valida. */
export async function checkSession() {
  try {
    const r = await fetch("/api/admin/login", { cache: "no-store" });
    if (!r.ok) return;
    const j = (await r.json()) as { ok: boolean; database: boolean };
    if (j.ok) useAdmin.setState({ unlocked: true, mode: "server", database: j.database });
  } catch {
    /* anteprima senza server */
  }
}

export async function adminLogin(password: string): Promise<string | null> {
  try {
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    const ct = r.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = (await r.json()) as { ok?: boolean; error?: string; database?: boolean };
      if (j.ok) {
        useAdmin.setState({ unlocked: true, mode: "server", database: !!j.database });
        markGrace();
        return null;
      }
      return j.error ?? "Accesso negato";
    }
  } catch {
    /* nessun server: si prova la verifica locale dell'anteprima */
  }
  if (await verifyLocal(password)) {
    useAdmin.setState({ unlocked: true, mode: "local", database: false });
    markGrace();
    return null;
  }
  return PREVIEW_HASH ? "Password sbagliata" : "Server non raggiungibile";
}

export async function adminLogout() {
  clearGrace();
  try {
    await fetch("/api/admin/login", { method: "DELETE" });
  } catch {
    /* niente */
  }
  useAdmin.setState({ unlocked: false, mode: null, open: false });
}

export async function adminAction<T = { ok: boolean }>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  if (useAdmin.getState().mode !== "server") throw new Error("Questa azione richiede il sito con il server (non funziona nell'anteprima)");
  const r = await fetch("/api/admin/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
  const j = (await r.json().catch(() => ({ error: "Risposta non valida" }))) as T & { error?: string };
  if (!r.ok || j.error) {
    if (r.status === 401) useAdmin.setState({ unlocked: false, mode: null });
    throw new Error(j.error ?? "Errore");
  }
  return j;
}
