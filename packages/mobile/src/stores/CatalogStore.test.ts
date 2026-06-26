import { describe, expect, it } from "@jest/globals";

import { type Product } from "@comfort-b2b/shared/schemas";

import { ApiError } from "../ApiError";

import { CatalogStore } from "./CatalogStore";

const PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Chair", price: 500, stock: 10 },
  { id: "p2", name: "Modern Desk", price: 750, stock: 4 },
];

describe("CatalogStore", () => {
  it("loads products and indexes them by id", async () => {
    const store = new CatalogStore(() => Promise.resolve(PRODUCTS));

    expect(store.loading).toBe(false);
    await store.load();

    expect(store.loading).toBe(false);
    expect(store.error).toBeUndefined();
    expect(store.products).toHaveLength(2);
    expect(store.productById.get("p2")?.name).toBe("Modern Desk");
  });

  it("captures a typed ApiError when the fetch rejects", async () => {
    const store = new CatalogStore(() =>
      Promise.reject(
        new ApiError({ code: "SERVICE_UNAVAILABLE", message: "down" }),
      ),
    );

    await store.load();

    expect(store.products).toHaveLength(0);
    expect(store.loading).toBe(false);
    expect(store.error?.code).toBe("SERVICE_UNAVAILABLE");
  });
});
