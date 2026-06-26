import { describe, expect, it, jest } from "@jest/globals";

import {
  type OrderAck,
  type OrderPayload,
  type Product,
} from "@comfort-b2b/shared/schemas";

import { ApiError } from "../ApiError";

import { CartStore } from "./CartStore";
import { CatalogStore } from "./CatalogStore";
import { OrderStore } from "./OrderStore";

type Submit = (payload: OrderPayload) => Promise<OrderAck>;

const PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Chair", price: 500, stock: 10 },
];

async function makeCart(): Promise<CartStore> {
  const catalog = new CatalogStore(() => Promise.resolve(PRODUCTS));
  await catalog.load();
  const cart = new CartStore(catalog);
  cart.setQty("p1", 3); // total 1500
  return cart;
}

describe("OrderStore", () => {
  it("submits the cart payload, clears the cart, and records the order id", async () => {
    const cart = await makeCart();
    const submit = jest.fn<Submit>(() =>
      Promise.resolve<OrderAck>({ orderId: "o-123" }),
    );
    const store = new OrderStore(cart, submit);

    const ok = await store.placeOrder();

    expect(ok).toBe(true);
    expect(submit.mock.calls[0]?.[0]).toEqual({
      lines: [{ productId: "p1", qty: 3 }],
      options: [],
      total: 1500,
    });
    expect(store.lastOrderId).toBe("o-123");
    expect(store.submitting).toBe(false);
    expect(cart.itemCount).toBe(0);
  });

  it("keeps the cart and stores the typed error on failure", async () => {
    const cart = await makeCart();
    const submit = jest.fn<Submit>(() =>
      Promise.reject(
        new ApiError({
          code: "INSUFFICIENT_STOCK",
          message: 'Insufficient stock for "Classic Chair"',
          productId: "p1",
          productName: "Classic Chair",
        }),
      ),
    );
    const store = new OrderStore(cart, submit);

    const ok = await store.placeOrder();

    expect(ok).toBe(false);
    expect(store.lastError?.code).toBe("INSUFFICIENT_STOCK");
    expect(store.submitting).toBe(false);
    expect(cart.itemCount).toBe(3);
  });
});
