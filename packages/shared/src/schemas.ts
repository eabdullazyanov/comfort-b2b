import { z } from "zod";

/**
 * Single source of truth for every value that crosses the backend <-> mobile
 * boundary. Each schema is paired with its `z.infer` type (same identifier:
 * one is a value, one is a type) so callers `Schema.parse(data)` at the edge
 * and consume the inferred type everywhere else - never `as`.
 */

export const Product = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
});
export type Product = z.infer<typeof Product>;

export const OrderOption = z.object({
  id: z.string(),
  label: z.string(),
});
export type OrderOption = z.infer<typeof OrderOption>;

/** Wire shape for a single cart line sent to the backend. */
export const CartLineDTO = z.object({
  productId: z.string(),
  qty: z.number().int().positive(),
});
export type CartLineDTO = z.infer<typeof CartLineDTO>;

/** A product line as recorded inside an analytics event (denormalized). */
export const AnalyticsProduct = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
});
export type AnalyticsProduct = z.infer<typeof AnalyticsProduct>;

export const AnalyticsEvent = z.object({
  id: z.string(),
  createdAt: z.number().int().nonnegative(),
  products: z.array(AnalyticsProduct),
  options: z.array(OrderOption),
  total: z.number().int().nonnegative(),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEvent>;

export const OrderPayload = z.object({
  lines: z.array(CartLineDTO),
  options: z.array(z.string()),
  total: z.number().int().nonnegative(),
});
export type OrderPayload = z.infer<typeof OrderPayload>;

export const ErrorCode = z.enum([
  "SERVICE_UNAVAILABLE",
  "INSUFFICIENT_STOCK",
  "MIN_AMOUNT_NOT_REACHED",
  "VALIDATION_ERROR",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

/** Error envelope returned by every failing backend route. */
export const ErrorResponse = z.object({
  code: ErrorCode,
  message: z.string(),
  productId: z.string().optional(),
  productName: z.string().optional(),
  min: z.number().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;

/** Success envelope: `GET /catalog`. */
export const CatalogResponse = z.array(Product);
export type CatalogResponse = z.infer<typeof CatalogResponse>;

/** Success envelope: `POST /analytics`. */
export const AnalyticsAck = z.object({ ok: z.literal(true) });
export type AnalyticsAck = z.infer<typeof AnalyticsAck>;

/** Success envelope: `POST /orders`. */
export const OrderAck = z.object({ orderId: z.string() });
export type OrderAck = z.infer<typeof OrderAck>;
