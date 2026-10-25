import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing/PricingTable";

export const metadata: Metadata = { title: "Piani" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-extrabold">Scegli il tuo piano</h1>
      <p className="mb-8 text-sm text-ink-dim">Inizia gratis. Passa a Pro quando vuoi imparare senza limiti.</p>
      <PricingTable />
      <p className="mt-6 text-xs text-ink-mute">
        Build di sviluppo: i pagamenti (Stripe) non sono ancora collegati. Il bottone simula il cambio di piano per
        testare limiti e funzioni Pro.
      </p>
    </div>
  );
}
