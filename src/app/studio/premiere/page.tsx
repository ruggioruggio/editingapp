import type { Metadata } from "next";
import { PremiereStudio } from "@/components/studio/premiere/PremiereStudio";

export const metadata: Metadata = { title: "Pratica · Premiere Pro" };

export default function PremierePracticePage() {
  return <PremiereStudio />;
}
