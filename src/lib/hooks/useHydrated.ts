import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * true solo sul client dopo l'idratazione. Serve per mostrare dati salvati
 * in localStorage (progressi, piano) senza mismatch con il render del server.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
