import { describe, expect, it } from "@jest/globals";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";

import { ApiError } from "./ApiError";
import { toApiError } from "./toApiError";

function axiosErrorWithData(data: unknown): AxiosError {
  const response: AxiosResponse = {
    data,
    status: 409,
    statusText: "Conflict",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return new AxiosError(
    "Request failed with status code 409",
    AxiosError.ERR_BAD_RESPONSE,
    undefined,
    undefined,
    response,
  );
}

describe("toApiError", () => {
  it("preserves a well-formed backend error envelope", () => {
    const result = toApiError(
      axiosErrorWithData({
        code: "INSUFFICIENT_STOCK",
        message: 'Insufficient stock for "Classic Chair"',
        productId: "p1",
        productName: "Classic Chair",
      }),
    );

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe("INSUFFICIENT_STOCK");
    expect(result.productName).toBe("Classic Chair");
    expect(result.message).toContain("Classic Chair");
  });

  it("degrades a network failure (no response) to SERVICE_UNAVAILABLE", () => {
    const result = toApiError(
      new AxiosError("Network Error", AxiosError.ERR_NETWORK),
    );

    expect(result.code).toBe("SERVICE_UNAVAILABLE");
    expect(result.message).toBe("Network Error");
  });

  it("degrades an unrecognized envelope shape to SERVICE_UNAVAILABLE", () => {
    const result = toApiError(axiosErrorWithData({ code: "NOPE" }));

    expect(result.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("degrades a non-axios throw to SERVICE_UNAVAILABLE", () => {
    const result = toApiError(new Error("boom"));

    expect(result.code).toBe("SERVICE_UNAVAILABLE");
    expect(result.message).toBe("boom");
  });

  it("returns an existing ApiError unchanged", () => {
    const original = new ApiError({
      code: "MIN_AMOUNT_NOT_REACHED",
      message: "too low",
      min: 1000,
    });

    expect(toApiError(original)).toBe(original);
  });
});
