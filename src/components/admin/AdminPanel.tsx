"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Ban, Crown, HardHat, Gavel, Handshake, KeyRound, LogOut, Megaphone, RefreshCw, ScrollText, Search, Shield, Terminal, UserCog, Wrench, X } from "lucide-react";
import { allLessons } from "@/content/course";
import { todayKey } from "@/lib/date";
import { adminAction, adminLogin, adminLogout, markGrace, useAdmin, type Announcement } from "@/lib/admin/client";
import { useProgress } from "@/lib/progress/store";
import { useAuth, ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { ModSqueakScene } from "@/components/three/lazy";

// Pannello di amministrazione: Pro regalato, sospensioni, amicizie forzate,
// annunci per tutti, statistiche e strumenti di test per il proprio account.

interface UserRow {
  id: string;
  username: string;
  display_name: string | null;
  plan: string;
  xp: number;
  streak_count: number;
  pro_until: string | null;
  banned_until: string | null;
  ban_reason: string | null;
  role: string | null;
  created_at: string;
}

const TABS = [
  ["users", "Utenti", UserCog],
  ["terminal", "Terminale", Terminal],
  ["friends", "Amicizie", Handshake],
  ["announce", "Annuncio", Megaphone],
  ["maintenance", "Manutenzione", HardHat],
  ["me", "Il mio account", Crown],
  ["tools", "Strumenti", Wrench],
  ["log", "Registro", ScrollText],
] as const;
type Tab = (typeof TABS)[number][0];

const active = (d: string | null) => !!d && new Date(d).getTime() > Date.now();
const fmtUntil = (d: string) => (d.startsWith("9999") ? "per sempre" : `fino al ${new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}`);

const btn = "rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-40";
const input = "h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#5865f2]";

type StatValues = { xp: number; streak: number; best?: number };

/** Valori esatti da scrivere a mano: XP, serie e (se c'è) serie migliore. */
function StatsEditor({ initial, onSave, busy, label = "Salva valori" }: { initial: StatValues; onSave: (v: StatValues) => void; busy?: boolean; label?: string }) {
  const [v, setV] = useState({ xp: String(initial.xp), streak: String(initial.streak), best: initial.best === undefined ? "" : String(initial.best) });
  const field = (k: "xp" | "streak" | "best", name: string) => (
    <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-[#b5bac1]">
      {name}
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={v[k]}
        onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))}
        onKeyDown={(e) => e.stopPropagation()}
        className={clsx(input, "w-28")}
      />
    </label>
  );
  const n = (s: string) => Math.max(0, Math.round(Number(s) || 0));
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ xp: n(v.xp), streak: n(v.streak), ...(initial.best !== undefined ? { best: Math.max(n(v.best), n(v.streak)) } : {}) });
      }}
    >
      {field("xp", "XP")}
      {field("streak", "Serie (giorni)")}
      {initial.best !== undefined && field("best", "Serie migliore")}
      <button type="submit" disabled={busy} className={clsx(btn, "h-9 bg-[#5865f2] text-white")}>
        {label}
      </button>
    </form>
  );
}

function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mx-auto flex max-w-sm flex-col gap-3 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(await adminLogin(pw));
        setBusy(false);
        setPw("");
      }}
    >
      <p className="flex items-center gap-2 text-lg font-black text-white">
        <KeyRound size={18} className="text-[#5865f2]" /> Accesso riservato
      </p>
      <p className="text-sm text-[#b5bac1]">Inserisci la password del pannello admin.</p>
      <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.stopPropagation()} autoComplete="off" className={input} placeholder="Password" />
      {err && <p className="text-sm font-bold text-[#ed4245]">{err}</p>}
      <button type="submit" disabled={!pw || busy} className={clsx(btn, "h-10 bg-[#5865f2] text-sm text-white hover:bg-[#4752c4]")}>
        {busy ? "Controllo…" : "Entra"}
      </button>
    </form>
  );
}

function useAsync() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      setMsg({ ok: true, text: ok });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Errore" });
    } finally {
      setBusy(false);
    }
  };
  return { msg, busy, run, setMsg };
}

function Note({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return <p className={clsx("rounded-lg px-3 py-2 text-sm font-bold", msg.ok ? "bg-[#3ba55d]/15 text-[#57f287]" : "bg-[#ed4245]/15 text-[#ff7b7e]")}>{msg.text}</p>;
}

function ServerOnly({ children }: { children: ReactNode }) {
  const { mode, database } = useAdmin();
  if (mode !== "server")
    return (
      <p className="rounded-xl bg-[#faa61a]/10 p-4 text-sm text-[#faa61a]">
        Sei nell&apos;anteprima senza server: le azioni sugli account veri (Pro, ban, amicizie, annunci per tutti) funzionano sul sito vero, dopo aver inserito la password.
      </p>
    );
  if (!database)
    return (
      <p className="rounded-xl bg-[#faa61a]/10 p-4 text-sm text-[#faa61a]">
        Manca la chiave segreta di Supabase sul server. Aggiungi <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code> (Supabase → Settings → API Keys → secret) e riavvia il server.
      </p>
    );
  return <>{children}</>;
}

function Stats() {
  const [s, setS] = useState<{ users: number; banned: number; pro: number; messages: number } | null>(null);
  useEffect(() => {
    if (useAdmin.getState().mode === "server" && useAdmin.getState().database) void adminAction<{ users: number; banned: number; pro: number; messages: number }>("stats").then(setS).catch(() => {});
  }, []);
  if (!s) return null;
  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        ["Utenti", s.users],
        ["Pro", s.pro],
        ["Sospesi", s.banned],
        ["Messaggi", s.messages],
      ].map(([k, v]) => (
        <div key={k as string} className="rounded-lg bg-black/30 px-3 py-2">
          <p className="text-lg font-black text-white">{v}</p>
          <p className="text-[11px] font-bold text-[#b5bac1]">{k}</p>
        </div>
      ))}
    </div>
  );
}

function Users() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const { msg, busy, run } = useAsync();
  const search = () => run(async () => setRows((await adminAction<{ users: UserRow[] }>("search", { q })).users), "Ricerca completata");
  useEffect(() => {
    if (useAdmin.getState().mode === "server" && useAdmin.getState().database) void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const act = (action: string, payload: Record<string, unknown>, ok: string) => run(async () => {
    await adminAction(action, payload);
    setRows((await adminAction<{ users: UserRow[] }>("search", { q })).users);
  }, ok);
  return (
    <ServerOnly>
      <div className="space-y-3">
        <Stats />
        <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), void search())}>
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="Cerca per nome utente" className={clsx(input, "flex-1")} />
          <button type="submit" className={clsx(btn, "flex items-center gap-1 bg-[#5865f2] text-white")}>
            <Search size={14} /> Cerca
          </button>
        </form>
        <Note msg={msg} />
        <div className="space-y-2">
          {rows.map((u) => (
            <div key={u.id} className="rounded-xl bg-black/30 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-white">@{u.username}</span>
                <span className="text-xs text-[#b5bac1]">
                  {u.xp} XP · serie {u.streak_count}
                </span>
                {active(u.pro_until) && <span className="rounded-full bg-[#faa61a]/20 px-2 py-0.5 text-[11px] font-bold text-[#faa61a]">PRO {fmtUntil(u.pro_until!)}</span>}
                {active(u.banned_until) && (
                  <span className="rounded-full bg-[#ed4245]/20 px-2 py-0.5 text-[11px] font-bold text-[#ff7b7e]">
                    SOSPESO {fmtUntil(u.banned_until!)} · {u.ban_reason}
                  </span>
                )}
                {u.role && (
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ backgroundColor: `${ROLE_COLORS[u.role as UserRole]}25`, color: ROLE_COLORS[u.role as UserRole] }}>
                    {ROLE_LABELS[u.role as UserRole]}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#80848e]">Registrato il {new Date(u.created_at).toLocaleDateString("it-IT")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {active(u.banned_until) ? (
                  <button type="button" disabled={busy} onClick={() => act("unban", { userId: u.id }, `@${u.username} non è più sospeso`)} className={clsx(btn, "bg-[#3ba55d]/20 text-[#57f287]")}>
                    Revoca sospensione
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const reason = window.prompt(`Motivo della sospensione di @${u.username}:`, "Spam");
                      if (reason !== null) void act("ban", { userId: u.id, reason }, `@${u.username} sospeso`);
                    }}
                    className={clsx(btn, "bg-[#ed4245]/20 text-[#ff7b7e] hover:bg-[#ed4245]/30")}
                  >
                    Sospendi
                  </button>
                )}
                <span className="mx-0.5 h-4 w-px bg-white/10" />
                {(["owner", "moderatore", "amico", "founder"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    disabled={busy || u.role === r}
                    onClick={() => act("setRole", { userId: u.id, role: r }, `@${u.username} è ora ${ROLE_LABELS[r]}`)}
                    className={clsx(btn, u.role === r ? "ring-1 ring-white/40" : "")}
                    style={{ backgroundColor: `${ROLE_COLORS[r]}20`, color: ROLE_COLORS[r] }}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
                {u.role && (
                  <button type="button" disabled={busy} onClick={() => act("setRole", { userId: u.id, role: null }, `Ruolo rimosso da @${u.username}`)} className={clsx(btn, "bg-white/10 text-white hover:bg-white/20")}>
                    ✕ Ruolo
                  </button>
                )}
                <span className="mx-0.5 h-4 w-px bg-white/10" />
                <button type="button" onClick={() => { setRenaming(renaming === u.id ? null : u.id); setNewName(u.username); }} className={clsx(btn, renaming === u.id ? "bg-[#5865f2] text-white" : "bg-white/10 text-white hover:bg-white/20")}>
                  Rinomina
                </button>
              </div>
              {renaming === u.id && (
                <form className="mt-2 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); act("renameUser", { userId: u.id, username: newName }, `@${u.username} rinominato in @${newName}`); setRenaming(null); }}>
                  <span className="text-sm text-[#b5bac1]">@</span>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className={clsx(input, "w-48")} placeholder="nuovo nome" />
                  <button type="submit" disabled={busy || newName.length < 3} className={clsx(btn, "bg-[#3ba55d] text-white")}>Salva</button>
                  <button type="button" onClick={() => setRenaming(null)} className={clsx(btn, "bg-white/10 text-white")}>Annulla</button>
                </form>
              )}
            </div>
          ))}
          {!rows.length && !busy && <p className="text-sm text-[#80848e]">Nessun utente trovato.</p>}
        </div>
      </div>
    </ServerOnly>
  );
}

function Friends() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const { msg, busy, run } = useAsync();
  return (
    <ServerOnly>
      <div className="space-y-3">
        <p className="text-sm text-[#b5bac1]">Rende amici due utenti senza richiesta (o rompe un&apos;amicizia).</p>
        <div className="flex flex-wrap gap-2">
          <input value={a} onChange={(e) => setA(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="@utente1" className={input} />
          <input value={b} onChange={(e) => setB(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="@utente2" className={input} />
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={busy || !a || !b} onClick={() => run(() => adminAction("forceFriend", { a, b }), `@${a} e @${b} ora sono amici`)} className={clsx(btn, "bg-[#3ba55d] text-white")}>
            Forza amicizia
          </button>
          <button type="button" disabled={busy || !a || !b} onClick={() => run(() => adminAction("unfriend", { a, b }), "Amicizia rimossa")} className={clsx(btn, "bg-white/10 text-white")}>
            Rimuovi amicizia
          </button>
        </div>
        <Note msg={msg} />
      </div>
    </ServerOnly>
  );
}

function AnnounceTab() {
  const st = useAdmin();
  const [text, setText] = useState(st.localAnnouncement?.text ?? "");
  const [tone, setTone] = useState<Announcement["tone"]>(st.localAnnouncement?.tone ?? "info");
  const { msg, busy, run } = useAsync();
  const publish = (t: string) =>
    run(async () => {
      if (st.mode === "server" && st.database) await adminAction("announce", { text: t, tone });
      st.set({ localAnnouncement: t ? { text: t, tone } : null });
    }, t ? "Annuncio pubblicato" : "Annuncio rimosso");
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#b5bac1]">Compare in cima all&apos;app per tutti gli utenti (nell&apos;anteprima solo su questo dispositivo).</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.stopPropagation()} maxLength={280} rows={3} className={clsx(input, "h-auto w-full py-2")} placeholder="Es. Nuove lezioni sul color grading in arrivo venerdì!" />
      <div className="flex flex-wrap items-center gap-2">
        {(["info", "success", "warning"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTone(t)} className={clsx(btn, tone === t ? "bg-white text-black" : "bg-white/10 text-white")}>
            {{ info: "Info", success: "Novità", warning: "Avviso" }[t]}
          </button>
        ))}
        <span className="flex-1" />
        <button type="button" disabled={busy} onClick={() => publish("")} className={clsx(btn, "bg-white/10 text-white")}>
          Rimuovi
        </button>
        <button type="button" disabled={busy || !text.trim()} onClick={() => publish(text.trim())} className={clsx(btn, "bg-[#5865f2] text-white")}>
          Pubblica
        </button>
      </div>
      <Note msg={msg} />
    </div>
  );
}

function MaintenanceTab() {
  const st = useAdmin();
  const [on, setOn] = useState(!!st.localMaintenance?.on);
  const [message, setMessage] = useState(st.localMaintenance?.message ?? "");
  const { msg, busy, run } = useAsync();
  useEffect(() => {
    const loadRemote = async () => {
      if (st.mode === "server" && st.database) {
        try {
          const r = await adminAction<{ settings: Record<string, { on?: boolean; message?: string }> }>("getSettings");
          const m = r.settings.maintenance;
          if (m) { setOn(!!m.on); setMessage(m.message ?? ""); }
        } catch {}
      } else {
        const sb = getSupabase();
        if (sb) {
          const { data } = await sb.from("app_settings").select("value").eq("key", "maintenance").maybeSingle<{ value: { on: boolean; message?: string } }>();
          if (data?.value) { setOn(!!data.value.on); setMessage(data.value.message ?? ""); }
        }
      }
    };
    void loadRemote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const apply = (next: boolean) =>
    run(async () => {
      if (st.mode === "server" && st.database) {
        await adminAction("maintenance", { on: next, message });
      } else {
        const sb = getSupabase();
        if (sb) await sb.from("app_settings").upsert({ key: "maintenance", value: { on: next, message } }).select();
      }
      st.set({ localMaintenance: { on: next, message } });
      setOn(next);
    }, next ? "Manutenzione attivata: gli utenti vedono il cantiere" : "Manutenzione disattivata: l'app è di nuovo aperta");
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#b5bac1]">Spegne l&apos;app per tutti con la schermata del cantiere di Squeak. Tu, con il pannello sbloccato, continui a vederla normalmente.</p>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.stopPropagation()} rows={2} maxLength={280} placeholder="Messaggio (facoltativo), es. Torniamo alle 18 con le nuove lezioni!" className={clsx(input, "h-auto w-full py-2")} />
      <div className="flex items-center gap-3 rounded-xl bg-black/30 p-4">
        <span className={clsx("h-3 w-3 rounded-full", on ? "bg-[#ed4245]" : "bg-[#3ba55d]")} />
        <span className="flex-1 font-black">{on ? "App in manutenzione" : "App aperta"}</span>
        <button type="button" disabled={busy} onClick={() => apply(!on)} className={clsx(btn, on ? "bg-[#3ba55d] text-white" : "bg-[#ed4245] text-white")}>
          {on ? "Riapri l'app" : "Metti in manutenzione"}
        </button>
      </div>
      <Note msg={msg} />
    </div>
  );
}

function Me() {
  const adminPro = useProgress((s) => s.adminPro);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak.count);
  const best = useProgress((s) => s.bestStreak);
  const auth = useAuth();
  const { mode, database } = useAdmin();
  const { msg, busy, run } = useAsync();
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between gap-4 rounded-xl bg-black/30 p-4">
        <span>
          <span className="block font-black text-white">Pro su questo dispositivo</span>
          <span className="text-sm text-[#b5bac1]">Lezioni illimitate per te, anche senza account.</span>
        </span>
        <input type="checkbox" checked={adminPro} onChange={(e) => useProgress.getState().setAdminPro(e.target.checked)} className="h-5 w-5 accent-[#faa61a]" />
      </label>
      {mode === "server" && database && auth.userId && (
        <div className="rounded-xl bg-black/30 p-4">
          <p className="font-black text-white">Pro sul mio account (@{auth.profile?.username})</p>
          <p className="mb-3 text-sm text-[#b5bac1]">Vale su tutti i dispositivi dove accedi.</p>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => run(() => adminAction("grantPro", { userId: auth.userId }), "Pro attivato sul tuo account")} className={clsx(btn, "bg-[#faa61a] text-black")}>
              Attiva per sempre
            </button>
            <button type="button" disabled={busy} onClick={() => run(() => adminAction("revokePro", { userId: auth.userId }), "Pro disattivato")} className={clsx(btn, "bg-white/10 text-white")}>
              Disattiva
            </button>
          </div>
        </div>
      )}
      <div className="rounded-xl bg-black/30 p-4">
        <p className="font-black text-white">I miei valori esatti</p>
        <p className="mb-3 text-sm text-[#b5bac1]">
          Scrivi XP e serie precisi (es. 60 giorni di serie).{mode === "server" && database && auth.userId ? " Si salvano anche sul tuo account online." : " Valgono su questo dispositivo."}
        </p>
        <StatsEditor
          key={`${xp}-${streak}-${best}`}
          initial={{ xp, streak, best }}
          busy={busy}
          onSave={(v) => {
            useProgress.setState({ xp: v.xp, streak: { count: v.streak, lastDay: v.streak ? todayKey() : null }, bestStreak: Math.max(v.best ?? 0, v.streak) });
            if (mode === "server" && database && auth.userId) void run(() => adminAction("setStats", { userId: auth.userId, xp: v.xp, streak: v.streak }), `Salvato: ${v.xp} XP, serie ${v.streak}`);
          }}
        />
      </div>
      <Note msg={msg} />
    </div>
  );
}

function Tools() {
  const st = useAdmin();
  const [done, setDone] = useState<string | null>(null);
  const tool = (label: string, fn: () => void) => (
    <button
      type="button"
      onClick={() => {
        fn();
        setDone(label);
      }}
      className={clsx(btn, "bg-white/10 py-2 text-left text-sm text-white hover:bg-white/20")}
    >
      {label}
    </button>
  );
  const p = useProgress.getState;
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between gap-4 rounded-xl bg-black/30 p-4">
        <span>
          <span className="flex items-center gap-2 font-black text-white">
            <Gavel size={16} /> Scorciatoie di moderazione
          </span>
          <span className="text-sm text-[#b5bac1]">Ctrl+Maiusc+B: ban rapido per nome utente. Martello accanto agli utenti nella pagina Amici.</span>
        </span>
        <input type="checkbox" checked={st.modShortcuts} onChange={(e) => st.set({ modShortcuts: e.target.checked })} className="h-5 w-5 accent-[#ed4245]" />
      </label>
      <label className="flex items-center justify-between gap-4 rounded-xl bg-black/30 p-4">
        <span>
          <span className="flex items-center gap-2 font-black text-white">
            <KeyRound size={16} /> Gioca a qualsiasi livello
          </span>
          <span className="text-sm text-[#b5bac1]">Tutte le lezioni sbloccate su questo dispositivo, senza dover finire quelle prima.</span>
        </span>
        <input type="checkbox" checked={st.unlockAll} onChange={(e) => st.set({ unlockAll: e.target.checked })} className="h-5 w-5 accent-[#57f287]" />
      </label>
      <p className="text-xs font-bold uppercase tracking-wide text-[#80848e]">Il mio progresso (per fare test)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {tool("+100 XP", () => useProgress.setState({ xp: p().xp + 100 }))}
        {tool("+1000 XP", () => useProgress.setState({ xp: p().xp + 1000 }))}
        {tool("Completa tutte le lezioni disponibili", () => p().completeLessons(allLessons.filter((l) => l.status === "available").map((l) => l.id), 0))}
        {tool("Azzera il limite di lezioni di oggi", () => useProgress.setState({ daily: { day: todayKey(), lessonIds: [] } }))}
        {tool("Serie di 30 giorni", () => useProgress.setState({ streak: { count: 30, lastDay: todayKey() }, bestStreak: Math.max(30, p().bestStreak) }))}
        {tool("Azzera la serie", () => useProgress.setState({ streak: { count: 0, lastDay: null } }))}
        {tool("Rivedi l'animazione d'apertura", () => {
          try {
            sessionStorage.removeItem("squeak-splash-shown");
          } catch {
            /* niente */
          }
          window.location.reload();
        })}
        {tool("Ricomincia da zero (progressi)", () => window.confirm("Cancellare tutti i progressi di questo dispositivo?") && p().reset())}
      </div>
      {done && <p className="text-sm font-bold text-[#57f287]">Fatto: {done}</p>}
    </div>
  );
}

function parseArgs(input: string): string[] {
  const args: string[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] === " ") { i++; continue; }
    if (input[i] === '"') {
      const end = input.indexOf('"', i + 1);
      args.push(end === -1 ? input.slice(i + 1) : input.slice(i + 1, end));
      i = end === -1 ? input.length : end + 1;
    } else {
      const end = input.indexOf(" ", i);
      args.push(end === -1 ? input.slice(i) : input.slice(i, end));
      i = end === -1 ? input.length : end;
    }
  }
  return args;
}

const HELP_TEXT = `Comandi disponibili:
  /help                          — Mostra questo messaggio
  /ren "vecchio" "nuovo"         — Rinomina un utente
  /ban "utente" "durata" "motivo"— Sospendi (durata: 1d, 7d, 30d, vuoto=sempre)
  /unban "utente"                — Revoca sospensione
  /roleadd "utente" "ruolo"      — Assegna ruolo (owner/moderatore/amico/founder)
  /roleremove "utente"           — Rimuovi ruolo
  /xpadd "utente" "quantità"     — Aggiungi XP
  /xpremove "utente" "quantità"  — Rimuovi XP
  /streakset "utente" "giorni"   — Imposta la serie
  /pro "utente"                  — Toggle Pro (se ha Pro lo toglie, se non ce l'ha lo dà)
  /search "utente"               — Cerca un utente
  /clear                         — Pulisci il terminale`;

type Line = { text: string; type: "input" | "ok" | "error" | "info" };

function AdminTerminal() {
  const [lines, setLines] = useState<Line[]>([{ text: "SqueakEdit Admin Terminal v1.0 — scrivi /help per i comandi", type: "info" }]);
  const [cmd, setCmd] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = (text: string, type: Line["type"]) => setLines((p) => [...p, { text, type }]);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [lines]);

  const idOf = async (username: string): Promise<string | null> => {
    const res = await adminAction<{ users: UserRow[] }>("search", { q: username.replace(/^@/, "") });
    const exact = res.users.find((u) => u.username === username.replace(/^@/, "").toLowerCase());
    return exact?.id ?? null;
  };

  const exec = async () => {
    const raw = cmd.trim();
    if (!raw) return;
    setHistory((h) => [raw, ...h.slice(0, 49)]);
    setHistIdx(-1);
    setCmd("");
    addLine(`> ${raw}`, "input");

    if (raw === "/clear") { setLines([]); return; }
    if (raw === "/help") { addLine(HELP_TEXT, "info"); return; }

    const parts = raw.startsWith("/") ? [raw.split(" ")[0], ...parseArgs(raw.slice(raw.indexOf(" ") + 1))] : parseArgs(raw);
    if (raw.indexOf(" ") === -1 && raw.startsWith("/")) parts.splice(1);
    const command = parts[0]?.toLowerCase();

    setBusy(true);
    try {
      switch (command) {
        case "/ren": {
          const [, oldName, newName] = parts;
          if (!oldName || !newName) { addLine("Uso: /ren \"vecchio\" \"nuovo\"", "error"); break; }
          const id = await idOf(oldName);
          if (!id) { addLine(`Utente @${oldName} non trovato`, "error"); break; }
          await adminAction("renameUser", { userId: id, username: newName });
          addLine(`@${oldName} rinominato in @${newName}`, "ok");
          break;
        }
        case "/ban": {
          const [, username, duration, ...reasonParts] = parts;
          if (!username) { addLine("Uso: /ban \"utente\" \"durata\" \"motivo\"", "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          const days = duration ? parseInt(duration) || undefined : undefined;
          const reason = reasonParts.join(" ") || undefined;
          await adminAction("ban", { userId: id, days, reason });
          addLine(`@${username} sospeso${days ? ` per ${days} giorni` : " per sempre"}${reason ? ` — ${reason}` : ""}`, "ok");
          break;
        }
        case "/unban": {
          const [, username] = parts;
          if (!username) { addLine("Uso: /unban \"utente\"", "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          await adminAction("unban", { userId: id });
          addLine(`Sospensione di @${username} revocata`, "ok");
          break;
        }
        case "/roleadd": {
          const [, username, role] = parts;
          if (!username || !role) { addLine("Uso: /roleadd \"utente\" \"ruolo\"", "error"); break; }
          if (!["owner", "moderatore", "amico", "founder"].includes(role)) { addLine(`Ruolo non valido. Usa: owner, moderatore, amico, founder`, "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          await adminAction("setRole", { userId: id, role });
          addLine(`@${username} è ora ${ROLE_LABELS[role as UserRole]}`, "ok");
          break;
        }
        case "/roleremove": {
          const [, username] = parts;
          if (!username) { addLine("Uso: /roleremove \"utente\"", "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          await adminAction("setRole", { userId: id, role: null });
          addLine(`Ruolo rimosso da @${username}`, "ok");
          break;
        }
        case "/xpadd": {
          const [, username, amount] = parts;
          if (!username || !amount) { addLine("Uso: /xpadd \"utente\" \"quantità\"", "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          const res = await adminAction<{ xp: number }>("addXp", { userId: id, amount: Math.abs(parseInt(amount) || 0) });
          addLine(`+${amount} XP a @${username} (totale: ${res.xp})`, "ok");
          break;
        }
        case "/xpremove": {
          const [, username, amount] = parts;
          if (!username || !amount) { addLine("Uso: /xpremove \"utente\" \"quantità\"", "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          const res = await adminAction<{ xp: number }>("addXp", { userId: id, amount: -Math.abs(parseInt(amount) || 0) });
          addLine(`-${amount} XP da @${username} (totale: ${res.xp})`, "ok");
          break;
        }
        case "/streakset": {
          const [, username, days] = parts;
          if (!username || days === undefined) { addLine("Uso: /streakset \"utente\" \"giorni\"", "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          await adminAction("setStreak", { userId: id, streak: parseInt(days) || 0 });
          addLine(`Serie di @${username} impostata a ${days} giorni`, "ok");
          break;
        }
        case "/pro": {
          const [, username] = parts;
          if (!username) { addLine("Uso: /pro \"utente\"", "error"); break; }
          const id = await idOf(username);
          if (!id) { addLine(`Utente @${username} non trovato`, "error"); break; }
          const res = await adminAction<{ pro: boolean }>("togglePro", { userId: id });
          addLine(`@${username}: Pro ${res.pro ? "attivato" : "disattivato"}`, "ok");
          break;
        }
        case "/search": {
          const [, username] = parts;
          if (!username) { addLine("Uso: /search \"utente\"", "error"); break; }
          const res = await adminAction<{ users: UserRow[] }>("search", { q: username.replace(/^@/, "") });
          if (!res.users.length) { addLine("Nessun risultato", "info"); break; }
          for (const u of res.users) {
            const tags: string[] = [];
            if (u.role) tags.push(ROLE_LABELS[u.role as UserRole] || u.role);
            if (active(u.pro_until)) tags.push("PRO");
            if (active(u.banned_until)) tags.push("SOSPESO");
            addLine(`@${u.username} — ${u.xp} XP, serie ${u.streak_count}${tags.length ? ` [${tags.join(", ")}]` : ""}`, "info");
          }
          break;
        }
        default:
          addLine(`Comando sconosciuto: ${command}. Scrivi /help per la lista.`, "error");
      }
    } catch (e) {
      addLine(`Errore: ${e instanceof Error ? e.message : "sconosciuto"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter" && !busy) { void exec(); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); const next = Math.min(histIdx + 1, history.length - 1); setHistIdx(next); if (history[next]) setCmd(history[next]); }
    if (e.key === "ArrowDown") { e.preventDefault(); const next = histIdx - 1; setHistIdx(next); setCmd(next < 0 ? "" : history[next] ?? ""); }
  };

  const lineColor = (t: Line["type"]) => ({ input: "text-[#80848e]", ok: "text-[#57f287]", error: "text-[#ff7b7e]", info: "text-[#b5bac1]" }[t]);

  return (
    <ServerOnly>
      <div className="flex h-[420px] flex-col rounded-xl border border-white/10 bg-black font-mono text-sm">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 leading-relaxed" onClick={() => inputRef.current?.focus()}>
          {lines.map((l, i) => (
            <pre key={i} className={clsx("whitespace-pre-wrap", lineColor(l.type))}>{l.text}</pre>
          ))}
          {busy && <pre className="animate-pulse text-[#faa61a]">Esecuzione...</pre>}
        </div>
        <div className="flex items-center border-t border-white/10 px-3 py-2">
          <span className="mr-2 text-[#5865f2] font-bold">$</span>
          <input
            ref={inputRef}
            autoFocus
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={onKey}
            placeholder="/help per i comandi"
            disabled={busy}
            className="flex-1 bg-transparent text-white outline-none placeholder:text-[#4e5058]"
          />
        </div>
      </div>
    </ServerOnly>
  );
}

function Log() {
  const [rows, setRows] = useState<{ id: number; action: string; target: string | null; details: Record<string, unknown> | null; created_at: string }[]>([]);
  const { msg, busy, run } = useAsync();
  const load = () => run(async () => setRows((await adminAction<{ log: typeof rows }>("log")).log), "Registro aggiornato");
  useEffect(() => {
    if (useAdmin.getState().mode === "server" && useAdmin.getState().database) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ServerOnly>
      <div className="space-y-2">
        <button type="button" disabled={busy} onClick={() => void load()} className={clsx(btn, "flex items-center gap-1 bg-white/10 text-white")}>
          <RefreshCw size={13} /> Aggiorna
        </button>
        {msg && !msg.ok && <Note msg={msg} />}
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg bg-black/30 px-3 py-2 text-sm">
            <span className="font-bold text-white">{r.action}</span> <span className="text-[#b5bac1]">{r.target}</span>
            <span className="float-right text-xs text-[#80848e]">{new Date(r.created_at).toLocaleString("it-IT")}</span>
            {r.details && Object.keys(r.details).length > 0 && <p className="text-xs text-[#80848e]">{JSON.stringify(r.details)}</p>}
          </div>
        ))}
        {!rows.length && <p className="text-sm text-[#80848e]">Ancora nessuna azione.</p>}
      </div>
    </ServerOnly>
  );
}

/** Chiudere il pannello non esce: per 10 minuti si riapre senza password (il pulsante Esci invece esce subito). */
const closePanel = () => {
  markGrace();
  useAdmin.setState({ open: false });
};

export function AdminPanel() {
  const st = useAdmin();
  const [tab, setTab] = useState<Tab>("users");
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onPointerDown={(e) => e.target === e.currentTarget && closePanel()}>
      <div className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#1e1f22] text-white shadow-2xl sm:rounded-3xl" onKeyDown={(e) => e.key === "Escape" && closePanel()}>
        <div className="relative shrink-0">
          <div className="h-44 w-full bg-[radial-gradient(ellipse_at_center,#2a2840_0%,#17151f_70%)] sm:h-56">
            <ModSqueakScene className="h-full w-full" />
          </div>
          <div className="absolute left-4 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-black uppercase tracking-wide">
            <Ban size={12} className="mr-1 inline text-[#ed4245]" />
            Pannello admin {st.unlocked && <span className="ml-1 text-[#57f287]">· {st.mode === "server" ? "server" : "anteprima locale"}</span>}
          </div>
          <div className="absolute right-3 top-3 flex gap-1.5">
            {st.unlocked && (
              <button type="button" onClick={() => void adminLogout()} className="grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80" title="Esci dal pannello">
                <LogOut size={15} />
              </button>
            )}
            <button type="button" onClick={closePanel} className="grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80" aria-label="Chiudi">
              <X size={16} />
            </button>
          </div>
        </div>
        {!st.unlocked ? (
          <Login />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/5 p-2 sm:w-48 sm:flex-col sm:border-b-0 sm:border-r">
              {TABS.map(([id, label, Icon]) => (
                <button key={id} type="button" onClick={() => setTab(id)} className={clsx("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold", tab === id ? "bg-[#5865f2] text-white" : "text-[#b5bac1] hover:bg-white/5")}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              {tab === "users" && <Users />}
              {tab === "terminal" && <AdminTerminal />}
              {tab === "friends" && <Friends />}
              {tab === "announce" && <AnnounceTab />}
              {tab === "maintenance" && <MaintenanceTab />}
              {tab === "me" && <Me />}
              {tab === "tools" && <Tools />}
              {tab === "log" && <Log />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
