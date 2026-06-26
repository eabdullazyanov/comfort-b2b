import { afterEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import {
  type AnalyticsAck,
  type OrderAck,
  type Product,
} from "@comfort-b2b/shared/schemas";

import { RootStore } from "../stores/RootStore";
import { StoreContext } from "../stores/StoreContext";

import { ConfirmScreen } from "./ConfirmScreen";

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

const PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Chair", price: 500, stock: 5 },
  { id: "p2", name: "Modern Desk", price: 800, stock: 3 },
];

function makeRoot(products: Product[] = PRODUCTS): RootStore {
  return new RootStore(
    {
      fetchCatalog: () => Promise.resolve(products),
      sendAnalytics: () => Promise.resolve(ANALYTICS_OK),
      submitOrder: () => Promise.resolve(ORDER_OK),
    },
    { debounceMs: 0 },
  );
}

async function renderConfirmScreen(root: RootStore) {
  await render(
    <StoreContext.Provider value={root}>
      <ConfirmScreen />
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

describe("ConfirmScreen", () => {
  it("lists products in order summary", async () => {
    root = makeRoot();
    await root.catalog.load();
    root.cart.setQty("p1", 2);
    root.cart.setQty("p2", 1);

    await renderConfirmScreen(root);

    expect(screen.getByText("Classic Chair")).toBeTruthy();
    expect(screen.getByText("Modern Desk")).toBeTruthy();
  });

  it("displays correct total price", async () => {
    root = makeRoot();
    await root.catalog.load();
    root.cart.setQty("p1", 2); // 2 × 500 = 1000
    root.cart.setQty("p2", 1); // 1 × 800 = 800  → total = 1800

    await renderConfirmScreen(root);

    expect(screen.getByText("1800 ₽")).toBeTruthy();
  });

  it("shows 'no options' placeholder when no options are selected", async () => {
    root = makeRoot();
    await root.catalog.load();
    root.cart.setQty("p1", 2);

    await renderConfirmScreen(root);

    expect(screen.getByText("confirm.noOptions")).toBeTruthy();
  });

  it("renders Place order button", async () => {
    root = makeRoot();
    await root.catalog.load();
    root.cart.setQty("p1", 2);

    await renderConfirmScreen(root);

    expect(screen.getByText("confirm.placeOrder")).toBeTruthy();
  });
});
