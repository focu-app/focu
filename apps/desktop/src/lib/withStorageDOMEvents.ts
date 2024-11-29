import type { Mutate, StoreApi, UseBoundStore } from "zustand";

export type StoreWithPersist<T> = Mutate<
  StoreApi<T>,
  [["zustand/persist", unknown]]
>;
export type BoundStoreWithPersist<S> = UseBoundStore<StoreWithPersist<S>>;

export const withStorageDOMEvents = <T>(store: StoreWithPersist<T>) => {
  if (typeof window === "undefined") return () => { };

  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      store.persist.rehydrate();
    }
  };

  window.addEventListener("storage", storageEventCallback);

  return () => {
    window.removeEventListener("storage", storageEventCallback);
  };
};
