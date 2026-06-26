import { describe, expect, it } from "@jest/globals";

import { type Product } from "@comfort-b2b/shared/schemas";

import { CartStore } from "./CartStore";
import { CatalogStore } from "./CatalogStore";

const PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Chair", price: 500, stock: 10 },
  { id: "p2", name: "Modern Desk", price: 333, stock: 4 },
];

async function makeCart(): Promise<CartStore> {
  const catalog = new CatalogStore(() => Promise.resolve(PRODUCTS));
  await catalog.load();
  return new CartStore(catalog);
}

describe("CartStore", () => {
  it("sums price * qty across lines and counts items", async () => {
    const cart = await makeCart();
    cart.addOne("p1");
    cart.setQty("p2", 3);

    expect(cart.itemCount).toBe(4);
    expect(cart.total).toBe(500 + 333 * 3);
  });

  it("meetsMinimum is exclusive-below / inclusive at exactly MIN_ORDER", async () => {
    const cart = await makeCart();
    cart.setQty("p1", 1); // 500
    expect(cart.total).toBe(500);
    expect(cart.meetsMinimum).toBe(false);

    cart.setQty("p1", 2); // exactly 1000
    expect(cart.total).toBe(1000);
    expect(cart.meetsMinimum).toBe(true);
  });

  it("removes a line when qty drops to zero", async () => {
    const cart = await makeCart();
    cart.addOne("p1");
    cart.removeOne("p1");

    expect(cart.lines.has("p1")).toBe(false);
    expect(cart.itemCount).toBe(0);
  });

  it("toggles options on and off", async () => {
    const cart = await makeCart();
    cart.toggleOption("gift_wrap");
    expect(cart.selectedOptions.map((o) => o.id)).toEqual(["gift_wrap"]);

    cart.toggleOption("gift_wrap");
    expect(cart.selectedOptions).toHaveLength(0);
  });

  it("builds a denormalized analytics snapshot and an order payload", async () => {
    const cart = await makeCart();
    cart.setQty("p1", 2);
    cart.toggleOption("express_delivery");

    expect(cart.snapshot).toEqual({
      products: [{ id: "p1", name: "Classic Chair", price: 500, qty: 2 }],
      options: [{ id: "express_delivery", label: "Express delivery" }],
      total: 1000,
    });
    expect(cart.orderPayload).toEqual({
      lines: [{ productId: "p1", qty: 2 }],
      options: ["express_delivery"],
      total: 1000,
    });
  });

  it("changes analyticsKey on any line or option edit", async () => {
    const cart = await makeCart();
    const empty = cart.analyticsKey;

    cart.addOne("p1");
    const withLine = cart.analyticsKey;
    expect(withLine).not.toBe(empty);

    cart.toggleOption("assembly");
    expect(cart.analyticsKey).not.toBe(withLine);
  });

  it("clear empties lines and options", async () => {
    const cart = await makeCart();
    cart.addOne("p1");
    cart.toggleOption("assembly");
    cart.clear();

    expect(cart.itemCount).toBe(0);
    expect(cart.selectedOptions).toHaveLength(0);
  });
});
