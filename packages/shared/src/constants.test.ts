import { describe, expect, it } from "@jest/globals";

import { CURRENCY, MIN_ORDER } from "./constants";

describe("constants", () => {
  it("requires a minimum order of 1000", () => {
    expect(MIN_ORDER).toBe(1000);
  });

  it("uses rubles as the currency", () => {
    expect(CURRENCY).toBe("RUB");
  });
});
