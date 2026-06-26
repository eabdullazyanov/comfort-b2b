import { useContext } from "react";

import { type RootStore } from "./RootStore";
import { StoreContext } from "./StoreContext";

/** Reads the `RootStore` from context; throws if used outside its provider. */
export function useStores(): RootStore {
  const store = useContext(StoreContext);
  if (store === undefined) {
    throw new Error("useStores must be used within a StoreContext.Provider");
  }
  return store;
}
