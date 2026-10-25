import { Suspense } from "react";
import type { Metadata } from "next";
import { AiChat } from "@/components/ai/AiChat";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: brand.aiName };

export default function AiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-40 pt-6">
      <Suspense>
        <AiChat />
      </Suspense>
    </div>
  );
}
