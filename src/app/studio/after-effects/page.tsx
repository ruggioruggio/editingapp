import type { Metadata } from "next";
import { AfterEffectsStudio } from "@/components/studio/ae/AfterEffectsStudio";

export const metadata: Metadata = { title: "Pratica · After Effects" };

export default function AfterEffectsPracticePage() {
  return <AfterEffectsStudio />;
}
