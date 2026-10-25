import Link from "next/link";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";

/** Cornice comune delle pagine di accesso, stile Duolingo. */
export function AuthShell({
  title,
  corner,
  children,
}: {
  title: string;
  corner?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-4">
        <Link href="/" aria-label="Chiudi" className="text-ink-mute hover:text-ink">
          <X size={26} />
        </Link>
        {corner && (
          <Link
            href={corner.href}
            className="btn-3d rounded-xl border-2 border-line bg-panel px-4 py-2 text-sm font-black uppercase text-pr"
          >
            {corner.label}
          </Link>
        )}
      </header>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 pb-16">
        <Mascot size={110} idle />
        <h1 className="mb-6 mt-3 text-2xl font-black">{title}</h1>
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

export const fieldClass =
  "w-full rounded-2xl border-2 border-line bg-panel-2 px-4 py-3.5 font-semibold outline-none placeholder:text-ink-mute focus:border-pr";

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="btn-3d w-full rounded-2xl bg-accent py-3.5 font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {busy ? "Un attimo…" : children}
    </button>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "animate-pop rounded-2xl border border-danger/40 bg-danger/10 p-3 text-center text-sm font-semibold text-danger"
          : "animate-pop rounded-2xl border border-success/40 bg-success/10 p-3 text-center text-sm font-semibold text-success"
      }
    >
      {children}
    </p>
  );
}

export function NotConfigured() {
  return (
    <div className="space-y-4 text-center">
      <FormMessage tone="info">
        Gli account non sono ancora attivi su questa installazione. Puoi usare l&apos;app come ospite: i progressi restano
        su questo dispositivo.
      </FormMessage>
      <Link href="/learn" className="btn-3d block rounded-2xl bg-success py-3.5 font-black uppercase text-[#08311f]">
        Continua come ospite
      </Link>
    </div>
  );
}
