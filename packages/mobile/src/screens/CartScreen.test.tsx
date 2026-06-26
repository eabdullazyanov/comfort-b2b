import { afterEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import {
  type AnalyticsAck,
  type OrderAck,
  type Product,
} from "@comfort-b2b/shared/schemas";

import { RootStore } from "../stores/RootStore";
import { StoreContext } from "../stores/StoreContext";

import { CartScreen } from "./CartScreen";

// All module mocks are applied globally via `moduleNameMapper` in jest.config.ts:
// - react-native                   → packages/mobile/__mocks__/react-native.tsx
// - react-native-paper             → packages/mobile/__mocks__/react-native-paper.tsx
// - react-i18next                  → packages/mobile/__mocks__/react-i18next.tsx
// - @react-navigation/native       → packages/mobile/__mocks__/react-navigation-native.tsx
// - useFormatPrice                 → packages/mobile/__mocks__/useFormatPrice.ts
// - navigation/useScreenTitle      → packages/mobile/__mocks__/useScreenTitle.ts

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ANALYTICS_OK: AnalyticsAck = { ok: true };
const ORDER_OK: OrderAck = { orderId: "ORD-TEST" };

/** price 200 → 5 items needed to reach MIN_ORDER of 1000 */
const CHEAP_PRODUCT: Product = {
  id: "p-cheap",
  name: "Cheap Item",
  price: 200,
  stock: 10,
};
/** price 500 → 2 items reach MIN_ORDER of 1000 */
const EXPENSIVE_PRODUCT: Product = {
  id: "p-exp",
  name: "Expensive Item",
  price: 500,
  stock: 5,
};

function makeRoot(
  products: Product[] = [CHEAP_PRODUCT, EXPENSIVE_PRODUCT],
): RootStore {
  return new RootStore(
    {
      fetchCatalog: () => Promise.resolve(products),
      sendAnalytics: () => Promise.resolve(ANALYTICS_OK),
      submitOrder: () => Promise.resolve(ORDER_OK),
    },
    { debounceMs: 0 },
  );
}

async function renderCartScreen(root: RootStore) {
  await render(
    <StoreContext.Provider value={root}>
      <CartScreen />
    </StoreContext.Provider>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

let root: RootStore;

afterEach(() => {
  root.dispose();
});

describe("CartScreen", () => {
  it("shows empty cart message when cart has no items", async () => {
    root = makeRoot();
    await root.catalog.load();

    await renderCartScreen(root);

    expect(screen.getByText("cart.empty")).toBeTruthy();
  });

  it("disables Proceed button when cart total is below minimum", async () => {
    root = makeRoot();
    await root.catalog.load();
    root.cart.addOne("p-cheap"); // total = 200, below MIN_ORDER=1000

    await renderCartScreen(root);

    expect(screen.getByText("cart.proceed")).toBeDisabled();
  });

  it("enables Proceed button when cart total meets minimum", async () => {
    root = makeRoot();
    await root.catalog.load();
    root.cart.setQty("p-exp", 2); // total = 1000, meets MIN_ORDER

    await renderCartScreen(root);

    expect(screen.getByText("cart.proceed")).toBeEnabled();
  });

  it("shows min-hint text when cart total is below minimum", async () => {
    root = makeRoot();
    await root.catalog.load();
    root.cart.addOne("p-cheap"); // total = 200

    await renderCartScreen(root);

    expect(screen.getByText("cart.minHint")).toBeTruthy();
  });
});
