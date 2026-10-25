import { useMemo } from "react";
import { usePreviewRouter } from "../router";

// Sostituisce next/navigation per l'anteprima a file unico.
export function useRouter() {
  const { navigate, back } = usePreviewRouter();
  return useMemo(
    () => ({
      push: (href: string) => navigate(href),
      replace: (href: string) => navigate(href, true),
      back,
      refresh: () => {},
      prefetch: () => {},
    }),
    [navigate, back],
  );
}

export function usePathname() {
  return usePreviewRouter().path.split("?")[0];
}

export function useSearchParams() {
  const { path } = usePreviewRouter();
  return useMemo(() => new URLSearchParams(path.split("?")[1] ?? ""), [path]);
}

export function notFound(): never {
  throw new Error("Pagina non trovata");
}
