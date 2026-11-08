import type { Metadata } from "next";
import { NotFoundView } from "@/components/site/NotFoundView";

export const metadata: Metadata = { title: "Pagina non trovata" };

export default function NotFound() {
  return <NotFoundView />;
}
