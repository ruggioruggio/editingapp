import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

// Sostituisce next/dynamic con React.lazy (nel file unico tutto è già incluso).
export default function dynamic<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  options?: { loading?: () => ReactNode; ssr?: boolean },
) {
  const Lazy = lazy(async () => {
    const mod = await loader();
    return { default: ("default" in mod ? mod.default : mod) as ComponentType<P> };
  });
  return function DynamicComponent(props: P) {
    return (
      <Suspense fallback={options?.loading ? options.loading() : null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}
