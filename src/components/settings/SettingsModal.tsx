"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { KeyRound, LogOut, Mail, Monitor, Moon, Play, ShieldCheck, Sun, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { LANGS, useT } from "@/lib/settings/i18n";
import { sfx } from "@/lib/settings/sfx";
import { SFX_CATEGORIES, useSettings, type Theme } from "@/lib/settings/store";

type Tab = "general" | "sounds" | "security";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("general");
  return (
    <Modal onClose={onClose} title={t("settings")}>
      <div className="mb-4 flex gap-1 rounded-2xl bg-panel p-1">
        {(["general", "sounds", "security"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={clsx("flex-1 rounded-xl px-2 py-2 text-sm font-black", tab === id ? "bg-panel-3 text-ink" : "text-ink-mute hover:text-ink")}
          >
            {t(id)}
          </button>
        ))}
      </div>
      {tab === "general" && <GeneralTab />}
      {tab === "sounds" && <SoundsTab />}
      {tab === "security" && <SecurityTab onClose={onClose} />}
    </Modal>
  );
}

export function Modal({ onClose, title, children, wide }: { onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={clsx("animate-pop flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-3xl border-2 border-line bg-app shadow-2xl", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-center justify-between border-b-2 border-line px-5 py-3">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="rounded-xl p-1.5 text-ink-mute hover:bg-panel-2 hover:text-ink">
            <X size={22} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-ink-mute">{title}</h3>
      {children}
      {note && <p className="mt-2 text-xs text-ink-mute">{note}</p>}
    </section>
  );
}

function GeneralTab() {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const theme = useSettings((s) => s.theme);
  const set = useSettings((s) => s.set);
  const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: "dark", label: t("themeDark"), icon: Moon },
    { id: "light", label: t("themeLight"), icon: Sun },
    { id: "system", label: t("themeSystem"), icon: Monitor },
  ];
  return (
    <>
      <Section title={t("language")} note={t("languageNote")}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => set({ lang: l.id })}
              className="duo-card flex items-center gap-2 px-3 py-2.5 text-left font-bold"
              data-state={lang === l.id ? "selected" : undefined}
            >
              <span className="text-xl">{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </Section>
      <Section title={t("theme")}>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => set({ theme: id })}
              className="duo-card flex flex-col items-center gap-1.5 px-2 py-3 font-bold"
              data-state={theme === id ? "selected" : undefined}
            >
              <Icon size={22} /> {label}
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

function Slider({ value, onChange, label, onTest }: { value: number; onChange: (v: number) => void; label: string; onTest?: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-44 shrink-0 text-sm font-bold text-ink-dim sm:w-52">{label}</span>
      <input type="range" min={0} max={100} value={Math.round(value * 100)} onChange={(e) => onChange(Number(e.target.value) / 100)} className="min-w-0 flex-1 accent-[var(--color-success)]" />
      <span className="w-9 text-right text-xs font-black tabular-nums text-ink-mute">{Math.round(value * 100)}</span>
      {onTest && (
        <button type="button" onClick={onTest} aria-label="Prova" className="rounded-lg bg-panel-2 p-1.5 text-ink-dim hover:text-ink">
          <Play size={14} />
        </button>
      )}
    </div>
  );
}

function SoundsTab() {
  const t = useT();
  const master = useSettings((s) => s.master);
  const volumes = useSettings((s) => s.volumes);
  const set = useSettings((s) => s.set);
  const setVolume = useSettings((s) => s.setVolume);
  return (
    <>
      <Section title={t("master")}>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => set({ master: master > 0 ? 0 : 0.8 })} className="rounded-xl bg-panel-2 p-2 text-ink-dim hover:text-ink" aria-label={t("mute")}>
            {master > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <div className="flex-1">
            <Slider value={master} onChange={(v) => set({ master: v })} label={t("master")} onTest={() => sfx("correct")} />
          </div>
        </div>
      </Section>
      <Section title={t("sounds")}>
        {SFX_CATEGORIES.map((c) => (
          <Slider key={c} value={volumes[c]} label={t(`sfx_${c}`)} onChange={(v) => setVolume(c, v)} onTest={() => sfx(c)} />
        ))}
      </Section>
    </>
  );
}

function Msg({ text, ok }: { text: string; ok?: boolean }) {
  if (!text) return null;
  return <p className={clsx("mt-2 text-sm font-bold", ok ? "text-success" : "text-danger")}>{text}</p>;
}

function SecurityTab({ onClose }: { onClose: () => void }) {
  const t = useT();
  const status = useAuth((s) => s.status);
  const email = useAuth((s) => s.email);
  const sb = getSupabase();
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState<[string, boolean]>(["", false]);
  const [mail, setMail] = useState("");
  const [mailMsg, setMailMsg] = useState<[string, boolean]>(["", false]);
  const [factor, setFactor] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [mfaMsg, setMfaMsg] = useState<[string, boolean]>(["", false]);
  const [del, setDel] = useState("");
  const [delMsg, setDelMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sb || status !== "user") return;
    void sb.auth.mfa.listFactors().then(({ data }) => setFactor(data?.totp?.find((f) => f.status === "verified")?.id ?? null));
  }, [sb, status]);

  if (status !== "user" || !sb) {
    return <p className="rounded-2xl bg-panel p-4 text-ink-dim">{t("guestSecurity")}</p>;
  }

  const input = "w-full rounded-xl border-2 border-line bg-panel px-3 py-2.5 font-semibold outline-none focus:border-accent";

  return (
    <>
      <Section title={t("changePassword")}>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (pw.length < 8) return setPwMsg(["Almeno 8 caratteri", false]);
            setBusy(true);
            const { error } = await sb.auth.updateUser({ password: pw });
            setBusy(false);
            setPw("");
            setPwMsg(error ? [error.message, false] : [t("saved"), true]);
          }}
        >
          <input type="password" autoComplete="new-password" placeholder={t("newPassword")} value={pw} onChange={(e) => setPw(e.target.value)} className={input} />
          <button type="submit" disabled={busy} className="duo-btn shrink-0 px-4">
            <KeyRound size={16} />
          </button>
        </form>
        <Msg text={pwMsg[0]} ok={pwMsg[1]} />
      </Section>

      <Section title={t("changeEmail")} note={email ?? undefined}>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(mail)) return setMailMsg(["Email non valida", false]);
            setBusy(true);
            const { error } = await sb.auth.updateUser({ email: mail });
            setBusy(false);
            setMailMsg(error ? [error.message, false] : ["Controlla la posta: ti abbiamo mandato un link per confermare la nuova email.", true]);
          }}
        >
          <input type="email" placeholder={t("newEmail")} value={mail} onChange={(e) => setMail(e.target.value)} className={input} />
          <button type="submit" disabled={busy} className="duo-btn shrink-0 px-4">
            <Mail size={16} />
          </button>
        </form>
        <Msg text={mailMsg[0]} ok={mailMsg[1]} />
      </Section>

      <Section title={t("twoFactor")}>
        <div className="rounded-2xl border-2 border-line p-4">
          <p className="flex items-start gap-2 text-sm text-ink-dim">
            <ShieldCheck size={20} className={factor ? "shrink-0 text-success" : "shrink-0 text-ink-mute"} /> {factor ? t("twoFactorOn") : t("twoFactorOff")}
          </p>
          {enroll ? (
            <div className="mt-3 flex flex-col items-center gap-3">
              <p className="text-center text-sm">{t("scanQr")}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enroll.qr} alt="QR 2FA" className="h-44 w-44 rounded-xl bg-white p-2" />
              <code className="select-all break-all rounded-lg bg-panel px-2 py-1 text-xs">{enroll.secret}</code>
              <form
                className="flex w-full gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
                  setBusy(false);
                  if (error) return setMfaMsg(["Codice sbagliato, riprova", false]);
                  setFactor(enroll.id);
                  setEnroll(null);
                  setCode("");
                  setMfaMsg([t("saved"), true]);
                }}
              >
                <input inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={clsx(input, "text-center tracking-[0.4em]")} />
                <button type="submit" disabled={busy || code.length !== 6} className="duo-btn shrink-0">
                  {t("verify")}
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              className={clsx("duo-btn mt-3 w-full", factor && "duo-red")}
              onClick={async () => {
                setBusy(true);
                setMfaMsg(["", false]);
                if (factor) {
                  const { error } = await sb.auth.mfa.unenroll({ factorId: factor });
                  setBusy(false);
                  if (error) return setMfaMsg(["Per disattivarla esci e rientra usando il codice 2FA, poi riprova.", false]);
                  return setFactor(null);
                }
                const { data: list } = await sb.auth.mfa.listFactors();
                for (const f of list?.all ?? []) if (f.status !== "verified") await sb.auth.mfa.unenroll({ factorId: f.id });
                const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `SqueakEdit ${Date.now()}` });
                setBusy(false);
                if (error || !data) return setMfaMsg([error?.message ?? "Errore", false]);
                setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
              }}
            >
              {factor ? t("disable") : t("enable")}
            </button>
          )}
          <Msg text={mfaMsg[0]} ok={mfaMsg[1]} />
        </div>
      </Section>

      <Section title={t("signOutAll")}>
        <button
          type="button"
          className="duo-btn duo-ghost w-full"
          onClick={async () => {
            await sb.auth.signOut({ scope: "global" });
            onClose();
            location.href = "/";
          }}
        >
          <LogOut size={16} /> {t("signOutAll")}
        </button>
      </Section>

      <Section title={t("deleteAccount")} note={t("deleteWarn")}>
        <div className="flex gap-2">
          <input placeholder={t("deleteConfirm")} value={del} onChange={(e) => setDel(e.target.value)} className={input} />
          <button
            type="button"
            disabled={del !== "ELIMINA" || busy}
            className="duo-btn duo-red shrink-0 px-4"
            onClick={async () => {
              setBusy(true);
              const res = await fetch("/api/account/delete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: "ELIMINA" }) }).catch(() => null);
              const json = (await res?.json().catch(() => ({}))) as { ok?: boolean; error?: string };
              setBusy(false);
              if (!res?.ok || !json.ok) return setDelMsg(json.error ?? "Non disponibile in questa versione");
              await sb.auth.signOut().catch(() => undefined);
              localStorage.clear();
              location.href = "/";
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
        <Msg text={delMsg} />
      </Section>
    </>
  );
}
