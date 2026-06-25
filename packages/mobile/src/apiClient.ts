import axios from "axios";

import {
  AnalyticsAck,
  type AnalyticsEvent,
  CatalogResponse,
  OrderAck,
  type OrderPayload,
} from "@comfort-b2b/shared/schemas";

import { config } from "./config";
import { parseResponse } from "./parseResponse";
import { toApiError } from "./toApiError";

const client = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Normalize every transport/HTTP failure into a typed `ApiError` so callers
// (stores) only ever catch one error type.
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    throw toApiError(error);
  },
);

export async function fetchCatalog(): Promise<CatalogResponse> {
  const response = await client.get("/catalog");
  return parseResponse(CatalogResponse, response.data, "GET /catalog");
}

export async function sendAnalytics(
  event: AnalyticsEvent,
): Promise<AnalyticsAck> {
  const response = await client.post("/analytics", event);
  return parseResponse(AnalyticsAck, response.data, "POST /analytics");
}

export async function submitOrder(payload: OrderPayload): Promise<OrderAck> {
  const response = await client.post("/orders", payload);
  return parseResponse(OrderAck, response.data, "POST /orders");
}
