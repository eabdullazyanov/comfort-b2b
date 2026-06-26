import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { z } from "zod";

import { parseResponse } from "./parseResponse";

const Schema = z.strictObject({ ok: z.boolean() });

describe("parseResponse", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns parsed data for a matching payload", () => {
    const result = parseResponse(Schema, { ok: true }, "test");
    expect(result).toStrictEqual({ ok: true });
  });

  it("passes the raw payload through and warns on a shape mismatch", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());
    const payload = { ok: "nope" };

    const result = parseResponse(Schema, payload, "GET /catalog");

    expect(result).toBe(payload);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("GET /catalog");
  });
});
