import { type ApiError } from "../ApiError";

/** A translation key plus the interpolation values it needs. */
export interface LocalizedApiError {
  key: `errors.${ApiError["code"]}`;
  values: { productName?: string; min?: number };
}

/**
 * Maps a typed `ApiError` to a localized-message key and its interpolation
 * values. Exhaustive over every `ErrorCode` with a `never` guard, so adding a
 * new code is a compile error until it is handled here (and translated in the
 * EN/RU bundles).
 */
export function localizeApiError(error: ApiError): LocalizedApiError {
  switch (error.code) {
    case "INSUFFICIENT_STOCK": {
      return {
        key: "errors.INSUFFICIENT_STOCK",
        values: { productName: error.productName ?? "" },
      };
    }
    case "MIN_AMOUNT_NOT_REACHED": {
      return {
        key: "errors.MIN_AMOUNT_NOT_REACHED",
        values: { min: error.min ?? 0 },
      };
    }
    case "SERVICE_UNAVAILABLE": {
      return { key: "errors.SERVICE_UNAVAILABLE", values: {} };
    }
    case "VALIDATION_ERROR": {
      return { key: "errors.VALIDATION_ERROR", values: {} };
    }
    default: {
      const exhaustive: never = error.code;
      return exhaustive;
    }
  }
}
