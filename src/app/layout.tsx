import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { AdminGate } from "@/components/admin/AdminGate";
import { MaintenanceGate } from "@/components/app/Maintenance";
import { brand } from "@/config/brand";
import "./globals.css";

// Font arrotondato e amichevole, nello spirito di Duolingo
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800", "900"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: `${brand.appName} — ${brand.tagline}`, template: `%s · ${brand.appName}` },
  description: brand.description,
  applicationName: brand.appName,
};

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${nunito.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-app text-ink">
        <SupabaseSync />
        {children}
        <MaintenanceGate />
        <AdminGate />
      </body>
    </html>
  );
}
