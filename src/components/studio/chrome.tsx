"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { X } from "lucide-react";

// Pezzi comuni ai simulatori: barra dei menu, pannelli con schede, finestre,
// avvisi e la tabella delle scorciatoie.

export type MenuItem = { label: string; keys?: string; action?: () => void; disabled?: boolean } | "-";
export type Menu = { label: string; items: MenuItem[] };

export function timecode(t: number, fps: number) {
  const f = Math.round(Math.max(0, t) * fps);
  const r = Math.round(fps);
  const ff = f % r;
  const s = Math.floor(f / r);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(ff)}`;
}

export function MenuBar({ app, color, menus, right }: { app: string; color: string; menus: Menu[]; right?: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const place = (el: HTMLElement) => setLeft(el.getBoundingClientRect().left - (ref.current?.getBoundingClientRect().left ?? 0));
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);
  return (
    <div ref={ref} className="relative z-40 flex h-8 shrink-0 items-center gap-0.5 border-b border-black bg-[#1e1e1e] px-2 text-[12px] text-[#cfcfcf]">
      <span className="mr-2 grid h-5 w-5 place-items-center rounded-[4px] border text-[10px] font-black" style={{ background: "#00005b", borderColor: color, color }}>
        {app}
      </span>
      <div className="flex min-w-0 overflow-x-auto">
        {menus.map((m, i) => (
          <div key={m.label} className="relative">
            <button
              type="button"
              onClick={(e) => {
                place(e.currentTarget);
                setOpen(open === i ? null : i);
              }}
              onPointerEnter={(e) => {
                if (open === null) return;
                place(e.currentTarget);
                setOpen(i);
              }}
              className={clsx("rounded px-2 py-1 whitespace-nowrap", open === i ? "bg-[#3a3a3a] text-white" : "hover:bg-[#2c2c2c]")}
            >
              {m.label}
            </button>
          </div>
        ))}
      </div>
      {open !== null && (
        <div
          className="absolute top-8 min-w-60 rounded-md border border-black bg-[#2c2c2c] py-1 shadow-[0_10px_30px_rgb(0_0_0/0.6)]"
          style={{ left: Math.max(0, Math.min(left, (ref.current?.clientWidth ?? 9999) - 250)) }}
        >
          {menus[open].items.map((it, k) =>
            it === "-" ? (
              <div key={k} className="my-1 border-t border-[#444]" />
            ) : (
              <button
                key={k}
                type="button"
                disabled={it.disabled}
                onClick={() => {
                  setOpen(null);
                  it.action?.();
                }}
                className="flex w-full items-center justify-between gap-6 px-4 py-1.5 text-left hover:bg-[#2680eb] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span>{it.label}</span>
                {it.keys && <span className="text-[11px] text-[#9a9a9a]">{it.keys}</span>}
              </button>
            ),
          )}
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        {right}
        <Link href="/practice" className="rounded px-2 py-1 font-semibold text-[#cfcfcf] hover:bg-[#2c2c2c]" title="Torna a Pratica">
          <X size={15} />
        </Link>
      </div>
    </div>
  );
}

export function Panel<T extends string>({
  tabs,
  tab,
  onTab,
  children,
  className,
  actions,
  focused,
}: {
  tabs: readonly T[];
  tab: T;
  onTab?: (t: T) => void;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  focused?: boolean;
}) {
  return (
    <section
      className={clsx(
        "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[6px] border bg-[#232323]",
        focused ? "border-[#2680eb]" : "border-[#151515]",
        className,
      )}
    >
      <div className="flex h-7 shrink-0 items-center gap-3 overflow-x-auto px-2 text-[12px]">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTab?.(t)}
            className={clsx("whitespace-nowrap border-b-2 py-1", t === tab ? "border-[#2680eb] text-white" : "border-transparent text-[#8f8f8f] hover:text-[#cfcfcf]")}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">{actions}</div>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function Modal({ children, onClose, wide }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-3" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={clsx("w-full", wide ? "max-w-5xl" : "max-w-3xl")}>{children}</div>
    </div>
  );
}

export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-md border border-black bg-[#2c2c2c] px-4 py-2 text-[13px] text-white shadow-[0_8px_24px_rgb(0_0_0/0.6)]">
      {text}
    </div>
  );
}

export function KeysHelp({ title, rows, onClose }: { title: string; rows: [string, string][]; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80dvh] overflow-y-auto rounded-lg border border-black bg-[#232323] text-[#c8c8c8] shadow-2xl">
        <div className="flex h-9 items-center justify-between border-b border-black bg-[#2b2b2b] px-4 text-[13px] font-semibold text-white">
          {title}
          <button type="button" onClick={onClose} aria-label="Chiudi">
            <X size={15} />
          </button>
        </div>
        <div className="grid gap-x-8 p-4 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k + v} className="flex items-center justify-between gap-4 border-b border-[#2e2e2e] py-1.5 text-[12px]">
              <span>{v}</span>
              <kbd className="rounded border border-[#4a4a4a] bg-[#1b1b1b] px-1.5 py-0.5 font-mono text-[11px] text-white">{k}</kbd>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/** true se l'evento da tastiera arriva da un campo di testo (allora le scorciatoie tacciono). */
export const typing = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

/** Avanza il tempo con requestAnimationFrame finché `active` è vero. */
export function usePlayback(active: boolean, tick: (dt: number) => void) {
  const cb = useRef(tick);
  useEffect(() => {
    cb.current = tick;
  });
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      cb.current(Math.min(0.1, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/** true su schermi larghi (layout a pannelli affiancati come nel programma vero). */
export function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
}
