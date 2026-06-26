import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import {
  type AnalyticsAck,
  type CatalogResponse,
  type OrderAck,
  type Product,
} from "@comfort-b2b/shared/schemas";

import { RootStore } from "./RootStore";

const PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Chair", price: 500, stock: 10 },
];

function makeStore(sendAnalytics: () => Promise<AnalyticsAck>): RootStore {
  return new RootStore(
    {
      fetchCatalog: () => Promise.resolve<CatalogResponse>(PRODUCTS),
      sendAnalytics,
      submitOrder: () => Promise.resolve<OrderAck>({ orderId: "o-1" }),
    },
    { debounceMs: 300, baseBackoffMs: 100, maxAttempts: 1 },
  );
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("RootStore", () => {
  it("fires analytics with the full snapshot on every cart change", async () => {
    const sendAnalytics = jest.fn(() =>
      Promise.resolve<AnalyticsAck>({ ok: true }),
    );
    const store = makeStore(sendAnalytics);
    await store.catalog.load();

    store.cart.setQty("p1", 2);
    await jest.advanceTimersByTimeAsync(300);

    expect(sendAnalytics).toHaveBeenCalledTimes(1);
    expect(store.analytics.records[0]?.event.total).toBe(1000);

    store.cart.toggleOption("gift_wrap");
    await jest.advanceTimersByTimeAsync(300);

    expect(sendAnalytics).toHaveBeenCalledTimes(2);

    store.dispose();
  });

  it("stops firing analytics after dispose", async () => {
    const sendAnalytics = jest.fn(() =>
      Promise.resolve<AnalyticsAck>({ ok: true }),
    );
    const store = makeStore(sendAnalytics);
    await store.catalog.load();

    store.cart.addOne("p1");
    await jest.advanceTimersByTimeAsync(300);
    expect(sendAnalytics).toHaveBeenCalledTimes(1);

    store.dispose();
    store.cart.addOne("p1");
    await jest.advanceTimersByTimeAsync(300);

    expect(sendAnalytics).toHaveBeenCalledTimes(1);
  });
});
