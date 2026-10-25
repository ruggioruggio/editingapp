/**
 * Unico punto in cui vive il naming. Cambia qui e si aggiorna tutta l'app
 * (logo, AI, titoli, manifest, link agli store).
 */
const mascotName = "Squeak";

export const brand = {
  mascotName,
  appName: "SqueakEdit",
  aiName: `${mascotName} AI`,
  tagline: "Impara il montaggio video, 3 minuti al giorno.",
  description:
    "Il modo gratuito e divertente di imparare montaggio, color correction e motion graphics: micro-lezioni ed esercizi in un editor stile Premiere Pro.",
  // Segnaposto finché non ci sono gli account reali
  discordUrl: "https://discord.gg/your-invite",
  appStoreUrl: null as string | null,
  playStoreUrl: null as string | null,
} as const;
