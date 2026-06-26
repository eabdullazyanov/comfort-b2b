import { describe, expect, it } from "@jest/globals";

import { ApiError } from "../ApiError";

import { localizeApiError } from "./localizeApiError";

describe("localizeApiError", () => {
  it("maps INSUFFICIENT_STOCK with the product name", () => {
    const result = localizeApiError(
      new ApiError({
        code: "INSUFFICIENT_STOCK",
        message: "ignored",
        productName: "Classic Chair",
      }),
    );

    expect(result).toEqual({
      key: "errors.INSUFFICIENT_STOCK",
      values: { productName: "Classic Chair" },
    });
  });

  it("maps MIN_AMOUNT_NOT_REACHED with the minimum", () => {
    const result = localizeApiError(
      new ApiError({
        code: "MIN_AMOUNT_NOT_REACHED",
        message: "ignored",
        min: 1000,
      }),
    );

    expect(result).toEqual({
      key: "errors.MIN_AMOUNT_NOT_REACHED",
      values: { min: 1000 },
    });
  });

  it("maps codes without interpolation to empty values", () => {
    expect(
      localizeApiError(
        new ApiError({ code: "SERVICE_UNAVAILABLE", message: "ignored" }),
      ),
    ).toEqual({ key: "errors.SERVICE_UNAVAILABLE", values: {} });

    expect(
      localizeApiError(
        new ApiError({ code: "VALIDATION_ERROR", message: "ignored" }),
      ),
    ).toEqual({ key: "errors.VALIDATION_ERROR", values: {} });
  });

  it("degrades gracefully when interpolation fields are absent", () => {
    expect(
      localizeApiError(
        new ApiError({ code: "INSUFFICIENT_STOCK", message: "ignored" }),
      ),
    ).toEqual({
      key: "errors.INSUFFICIENT_STOCK",
      values: { productName: "" },
    });
  });
});
