"use client";

import { useEffect } from "react";
import { preloadLessonTranslations } from "@/content/lessons/i18n";
import { resolvedTheme, useSettings } from "@/lib/settings/store";

export function ThemeSync() {
  const theme = useSettings((s) => s.theme);
  const lang = useSettings((s) => s.lang);
  useEffect(() => {
    const apply = () => {
      const t = resolvedTheme(theme);
      document.documentElement.dataset.theme = t;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#ffffff" : "#121212");
    };
    apply();
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    mq?.addEventListener("change", apply);
    return () => mq?.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
    preloadLessonTranslations(lang);
  }, [lang]);
  return null;
}
