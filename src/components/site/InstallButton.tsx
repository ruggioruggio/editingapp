"use client";

import { useEffect, useState } from "react";
import { Check, Download } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="flex items-center gap-2 font-black text-success">
        <Check size={20} /> App installata
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={!prompt}
        onClick={async () => {
          if (!prompt) return;
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === "accepted") setInstalled(true);
          setPrompt(null);
        }}
        className="btn-3d flex items-center gap-2 rounded-2xl bg-success px-6 py-3.5 font-black uppercase text-[#08311f] disabled:bg-panel-3 disabled:text-ink-mute"
      >
        <Download size={20} /> Installa sul computer
      </button>
      {!prompt && (
        <p className="mt-3 text-sm text-ink-mute">
          Apri questa pagina con Chrome o Edge e usa l&apos;icona di installazione nella barra degli indirizzi. Su Safari
          per Mac: File → Aggiungi al Dock.
        </p>
      )}
    </div>
  );
}
