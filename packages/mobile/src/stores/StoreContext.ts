import { createContext } from "react";

import { type RootStore } from "./RootStore";

/**
 * Provides the singleton `RootStore` to the component tree. Screens read it via
 * `useStores()`; tests can wrap components in this provider with a mock store.
 */
export const StoreContext = createContext<RootStore | undefined>(undefined);
