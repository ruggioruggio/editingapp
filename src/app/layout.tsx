import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CookieBanner } from "@/components/app/CookieBanner";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { AdminGate } from "@/components/admin/AdminGate";
import { MaintenanceGate } from "@/components/app/Maintenance";
import { ThemeSync } from "@/components/app/ThemeSync";
import { THEME_BOOT } from "@/lib/settings/store";
import { brand } from "@/config/brand";
import "./globals.css";

const nunito = localFont({ src: "../fonts/nunito.woff2", variable: "--font-nunito", weight: "200 1000", display: "swap" });
const mono = localFont({ src: "../fonts/jetbrains-mono.woff2", variable: "--font-jetbrains", weight: "100 800", display: "swap" });

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
        <CookieBanner />
      </body>
    </html>
  );
}
