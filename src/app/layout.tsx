import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { AdminGate } from "@/components/admin/AdminGate";
import { MaintenanceGate } from "@/components/app/Maintenance";
import { ThemeSync } from "@/components/app/ThemeSync";
import { THEME_BOOT } from "@/lib/settings/store";
import { brand } from "@/config/brand";
import "./globals.css";

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
    <html lang="it" data-theme="dark" className={`${nunito.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* tema salvato applicato prima del primo disegno (niente lampo) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-dvh bg-app text-ink">
        <SupabaseSync />
        <ThemeSync />
        {children}
        <MaintenanceGate />
        <AdminGate />
      </body>
    </html>
  );
}
