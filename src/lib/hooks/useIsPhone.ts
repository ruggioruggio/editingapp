import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 899px)";

/** true su telefono (schermo stretto): i simulatori completi sono solo per desktop/tablet. */
export function useIsPhone() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
