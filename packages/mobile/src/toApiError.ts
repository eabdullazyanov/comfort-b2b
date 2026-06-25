import axios from "axios";

import { ErrorResponse } from "@comfort-b2b/shared/schemas";

import { ApiError } from "./ApiError";

/**
 * Maps any thrown/rejected value into a typed `ApiError`. A well-formed backend
 * error envelope (`ErrorResponse`) is preserved with its `code`; anything else
 * (network failure, unexpected shape, non-axios throw) degrades to
 * `SERVICE_UNAVAILABLE`.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const envelope = ErrorResponse.safeParse(error.response?.data);
    if (envelope.success) {
      return new ApiError(envelope.data);
    }
    return new ApiError({
      code: "SERVICE_UNAVAILABLE",
      message: error.message,
    });
  }

  return new ApiError({
    code: "SERVICE_UNAVAILABLE",
    message: error instanceof Error ? error.message : "Network request failed",
  });
}
