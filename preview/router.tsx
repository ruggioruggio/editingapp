import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// Router in memoria per l'anteprima a file unico: al posto delle rotte di Next.js
// teniamo il percorso in uno stato React.

interface RouterValue {
  path: string;
  navigate: (href: string, replace?: boolean) => void;
  back: () => void;
}

const RouterContext = createContext<RouterValue>({ path: "/", navigate: () => {}, back: () => {} });

export function PreviewRouter({ children, initial = "/", blockedPaths }: { children: (path: string) => ReactNode; initial?: string; blockedPaths?: Set<string> }) {
  const [stack, setStack] = useState<string[]>([initial]);
  const path = stack[stack.length - 1];

  const navigate = useCallback((href: string, replace = false) => {
    if (blockedPaths?.has(href)) return;
    setStack((s) => (replace ? [...s.slice(0, -1), href] : [...s, href]));
    window.scrollTo(0, 0);
  }, [blockedPaths]);
  const back = useCallback(() => setStack((s) => {
    if (s.length <= 1) return s;
    const prev = s[s.length - 2];
    if (blockedPaths?.has(prev)) return s;
    return s.slice(0, -1);
  }), [blockedPaths]);

  const value = useMemo(() => ({ path, navigate, back }), [path, navigate, back]);
  return <RouterContext.Provider value={value}>{children(path)}</RouterContext.Provider>;
}

export const usePreviewRouter = () => useContext(RouterContext);
