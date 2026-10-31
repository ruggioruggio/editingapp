import type { Lang } from "@/lib/settings/store";
import type { LessonTranslations } from "./types";

const translationModules: Partial<Record<Lang, () => Promise<{ default: LessonTranslations }>>> = {
  en: () => import("./en") as Promise<{ default: LessonTranslations }>,
};

const cache = new Map<Lang, LessonTranslations>();

export async function loadLessonTranslations(lang: Lang): Promise<LessonTranslations | null> {
  if (lang === "it") return null;
  const cached = cache.get(lang);
  if (cached) return cached;
  const loader = translationModules[lang];
  if (!loader) return null;
  const mod = await loader();
  cache.set(lang, mod.default);
  return mod.default;
}

let syncCache: Partial<Record<Lang, LessonTranslations>> = {};

export function getLessonTranslationsSync(lang: Lang): LessonTranslations | null {
  if (lang === "it") return null;
  return syncCache[lang] ?? cache.get(lang) ?? null;
}

export function preloadLessonTranslations(lang: Lang): void {
  if (lang === "it" || syncCache[lang] || cache.get(lang)) return;
  void loadLessonTranslations(lang).then((t) => {
    if (t) syncCache[lang] = t;
  });
}
