import type { Metadata } from "next";
import Link from "next/link";
import { PricingTable } from "@/components/pricing/PricingTable";
import { features } from "@/config/features";

export const metadata: Metadata = { title: "Piani" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-extrabold">{features.payments ? "Scegli il tuo piano" : "I piani di SqueakEdit"}</h1>
      <p className="mb-8 text-sm text-ink-dim">
        {features.payments
          ? "Inizia gratis. Passa a Pro quando vuoi imparare senza limiti."
          : "SqueakEdit è gratis. Il piano Pro, con lezioni illimitate e Squeak AI, è in arrivo."}
      </p>
      <PricingTable />
      {features.payments && (
        <p className="mt-6 text-sm text-ink-dim">
          Prezzi IVA inclusa. L&apos;abbonamento si rinnova automaticamente e puoi disdirlo quando vuoi, senza penali.
          Dettagli su rinnovo, recesso e rimborsi nelle{" "}
          <Link href="/legal/acquisti" className="font-bold text-pr underline">
            Condizioni di acquisto
          </Link>
          .
        </p>
      )}
    </div>
  );
}
