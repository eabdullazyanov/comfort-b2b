import { describe, expect, it } from "@jest/globals";

import { getMinimumOrder } from "./getMinimumOrder";

describe("getMinimumOrder", () => {
  it("exposes the shared minimum order constant", () => {
    expect(getMinimumOrder()).toBe(1000);
  });
});
