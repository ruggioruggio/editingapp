/**
 * Unico punto in cui vive il naming. Cambia qui il nome della mascotte
 * e si aggiorna tutta l'app (logo, AI, titoli, manifest).
 */
const mascotName = "Mozzy";
const productSuffix = "Edit";

export const brand = {
  mascotName,
  productSuffix,
  appName: `${mascotName} ${productSuffix}`,
  aiName: `${mascotName} AI`,
  tagline: "Impara il montaggio video, 3 minuti al giorno.",
  description:
    "Micro-lezioni gamificate di montaggio, color correction e motion graphics, con esercizi pratici in un editor stile Premiere Pro direttamente nel browser.",
  discordUrl: "https://discord.gg/your-invite",
} as const;
