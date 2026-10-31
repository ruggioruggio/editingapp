"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { EditorTaskView } from "@/components/lesson/StepViews";
import { PRACTICE_SCENARIOS, type PracticeScenarioId } from "@/content/practice";
import type { EditorTaskResult } from "@/lib/lessons/types";

export function PracticeModal({ scenario, task, onClose }: { scenario: PracticeScenarioId; task: string; onClose: () => void }) {
  const [result, setResult] = useState<EditorTaskResult>({ done: false });
  const step = useMemo(() => ({ ...PRACTICE_SCENARIOS[scenario].step, instructions: task }), [scenario, task]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Editor di prova" className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6">
      <div className="animate-pop mx-auto max-w-6xl rounded-3xl border border-line bg-app p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-pr">Editor di prova · Squeak AI</p>
          <button type="button" onClick={onClose} aria-label="Chiudi l'editor" className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute hover:bg-panel-2 hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <EditorTaskView step={step} onResult={setResult} />
        {result.done && (
          <div className="animate-pop mt-4 flex flex-col items-start gap-3 rounded-2xl border border-success/40 bg-[#12251c] p-4 sm:flex-row sm:items-center">
            <CheckCircle2 size={28} className="shrink-0 text-success" />
            <p className="flex-1 font-bold">Perfetto! Ora puoi fare lo stesso nel tuo progetto Premiere.</p>
            <button type="button" onClick={onClose} className="btn-3d rounded-xl bg-success px-5 py-2.5 font-black uppercase text-[#08311f]">
              Torna alla chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
