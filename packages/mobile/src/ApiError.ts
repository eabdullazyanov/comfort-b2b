import {
  type ErrorCode,
  type ErrorResponse,
} from "@comfort-b2b/shared/schemas";

/**
 * A backend failure surfaced as a typed error. `code` is the discriminant the
 * UI layer switches over (exhaustively, with a `never` guard) to render a
 * localized message; the optional fields carry interpolation data.
 */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly productId: string | undefined;
  readonly productName: string | undefined;
  readonly min: number | undefined;

  constructor(envelope: ErrorResponse) {
    super(envelope.message);
    this.name = "ApiError";
    this.code = envelope.code;
    this.productId = envelope.productId;
    this.productName = envelope.productName;
    this.min = envelope.min;
  }
}
