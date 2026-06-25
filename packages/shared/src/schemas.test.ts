import { describe, expect, it } from "@jest/globals";

import {
  AnalyticsEvent,
  CartLineDTO,
  ErrorResponse,
  OrderAck,
  OrderPayload,
  Product,
} from "./schemas";

describe("Product", () => {
  it("parses a well-formed product", () => {
    const product = Product.parse({
      id: "p1",
      name: "Chair",
      price: 1200,
      stock: 5,
    });
    expect(product).toEqual({ id: "p1", name: "Chair", price: 1200, stock: 5 });
  });

  it("rejects a non-positive price", () => {
    expect(() =>
      Product.parse({ id: "p1", name: "Chair", price: 0, stock: 5 }),
    ).toThrow();
  });

  it("rejects a fractional stock", () => {
    expect(() =>
      Product.parse({ id: "p1", name: "Chair", price: 10, stock: 1.5 }),
    ).toThrow();
  });
});

describe("CartLineDTO", () => {
  it("requires a positive integer quantity", () => {
    expect(() => CartLineDTO.parse({ productId: "p1", qty: 0 })).toThrow();
    expect(CartLineDTO.parse({ productId: "p1", qty: 2 })).toEqual({
      productId: "p1",
      qty: 2,
    });
  });
});

describe("OrderPayload", () => {
  it("round-trips a valid payload", () => {
    const payload = {
      lines: [{ productId: "p1", qty: 2 }],
      options: ["gift-wrap"],
      total: 2400,
    };
    expect(OrderPayload.parse(payload)).toEqual(payload);
  });

  it("rejects a malformed line", () => {
    expect(() =>
      OrderPayload.parse({
        lines: [{ productId: "p1" }],
        options: [],
        total: 100,
      }),
    ).toThrow();
  });
});

describe("AnalyticsEvent", () => {
  it("parses a full event with products and options", () => {
    const event = {
      id: "e1",
      createdAt: 1_700_000_000_000,
      products: [{ id: "p1", name: "Chair", price: 1200, qty: 2 }],
      options: [{ id: "gift-wrap", label: "Gift wrap" }],
      total: 2400,
    };
    expect(AnalyticsEvent.parse(event)).toEqual(event);
  });
});

describe("ErrorResponse", () => {
  it("parses an error envelope with optional fields", () => {
    const error = ErrorResponse.parse({
      code: "INSUFFICIENT_STOCK",
      message: "Out of stock",
      productId: "p1",
      productName: "Chair",
    });
    expect(error.code).toBe("INSUFFICIENT_STOCK");
    expect(error.min).toBeUndefined();
  });

  it("rejects an unknown error code", () => {
    expect(() => ErrorResponse.parse({ code: "NOPE", message: "x" })).toThrow();
  });
});

describe("OrderAck", () => {
  it("requires an orderId", () => {
    expect(OrderAck.parse({ orderId: "o1" })).toEqual({ orderId: "o1" });
    expect(() => OrderAck.parse({})).toThrow();
  });
});
