import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { LoginForm } from "@/components/site/LoginForm";

export const metadata: Metadata = { title: "Accedi" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-4">
        <Link href="/" aria-label="Chiudi" className="text-ink-mute hover:text-ink">
          <X size={26} />
        </Link>
        <Link href="/learn" className="btn-3d rounded-xl border-2 border-line bg-panel px-4 py-2 text-sm font-black uppercase text-pr">
          Registrati
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 pb-16">
        <Mascot size={110} idle />
        <h1 className="mb-6 mt-3 text-2xl font-black">Accedi</h1>
        <LoginForm />
      </main>
    </div>
  );
}
