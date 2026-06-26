import { afterEach, describe, expect, it } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import {
  type AnalyticsAck,
  type OrderAck,
  type Product,
} from "@comfort-b2b/shared/schemas";

import { RootStore } from "../stores/RootStore";
import { StoreContext } from "../stores/StoreContext";

import { ProductRow } from "./ProductRow";

// All module mocks are applied globally via `moduleNameMapper` in jest.config.ts:
// - react-native         → packages/mobile/__mocks__/react-native.tsx
// - react-native-paper   → packages/mobile/__mocks__/react-native-paper.tsx
// - react-i18next        → packages/mobile/__mocks__/react-i18next.tsx
// - useFormatPrice       → packages/mobile/__mocks__/useFormatPrice.ts

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ANALYTICS_OK: AnalyticsAck = { ok: true };
const ORDER_OK: OrderAck = { orderId: "ORD-TEST" };

const PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Chair", price: 500, stock: 5 },
  { id: "p2", name: "Modern Desk", price: 800, stock: 2 },
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

async function renderRow(root: RootStore, product: Product) {
  await render(
    <StoreContext.Provider value={root}>
      <ProductRow product={product} />
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

describe("ProductRow", () => {
  it("shows product name and initial qty of zero", async () => {
    root = makeRoot();
    await root.catalog.load();
    const product = PRODUCTS[0]!;

    await renderRow(root, product);

    expect(screen.getByText("Classic Chair")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("increments cart qty when the + button is pressed", async () => {
    root = makeRoot();
    await root.catalog.load();
    const product = PRODUCTS[0]!;

    await renderRow(root, product);
    await act(async () => {
      await fireEvent.press(screen.getByLabelText("increment"));
    });

    expect(root.cart.lines.get("p1")).toBe(1);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("decrements cart qty when the − button is pressed", async () => {
    root = makeRoot();
    await root.catalog.load();
    const product = PRODUCTS[0]!;
    root.cart.addOne("p1");
    root.cart.addOne("p1"); // qty = 2

    await renderRow(root, product);
    await act(async () => {
      await fireEvent.press(screen.getByLabelText("decrement"));
    });

    expect(root.cart.lines.get("p1")).toBe(1);
  });

  it("disables the + button when qty equals stock", async () => {
    root = makeRoot();
    await root.catalog.load();
    const product = PRODUCTS[1]!; // stock = 2
    root.cart.setQty("p2", 2); // fill stock

    await renderRow(root, product);

    expect(screen.getByLabelText("increment")).toBeDisabled();
  });
});
