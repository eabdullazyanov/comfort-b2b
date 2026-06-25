import { describe, expect, it } from "@jest/globals";

import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats an amount as rubles without decimals", () => {
    expect(formatPrice(1000)).toContain("1");
    expect(formatPrice(1000)).not.toContain(",00");
  });
});
