import { randomUUID } from "node:crypto";

import express, { type Express } from "express";
import { z } from "zod";

import { MIN_ORDER } from "@comfort-b2b/shared/constants";
import {
  AnalyticsAck,
  AnalyticsEvent,
  CatalogResponse,
  OrderAck,
  OrderPayload,
  type ErrorResponse,
  type Product,
} from "@comfort-b2b/shared/schemas";

export interface AppConfig {
  catalog: Product[];
  rng: () => number;
  analyticsFailureRate: number;
  orderFailureRate: number;
  latencyMs: number;
}

function sendError(
  res: express.Response,
  status: number,
  body: ErrorResponse,
): void {
  res.status(status).json(body);
}

export function makeApp(config: AppConfig): Express {
  const app = express();
  app.use(express.json());

  app.use((_req, _res, next) => {
    setTimeout(() => {
      next();
    }, config.latencyMs);
  });

  app.get("/catalog", (_req, res) => {
    res.json(CatalogResponse.parse(config.catalog));
  });

  app.post("/analytics", (req, res) => {
    const parsed = AnalyticsEvent.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 400, {
        code: "VALIDATION_ERROR",
        message: z.prettifyError(parsed.error),
      });
      return;
    }
    if (config.rng() < config.analyticsFailureRate) {
      sendError(res, 503, {
        code: "SERVICE_UNAVAILABLE",
        message: "Service temporarily unavailable",
      });
      return;
    }
    res.json(AnalyticsAck.parse({ ok: true }));
  });

  app.post("/orders", (req, res) => {
    const parsed = OrderPayload.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 400, {
        code: "VALIDATION_ERROR",
        message: z.prettifyError(parsed.error),
      });
      return;
    }
    const payload = parsed.data;

    if (payload.total < MIN_ORDER) {
      sendError(res, 422, {
        code: "MIN_AMOUNT_NOT_REACHED",
        message: `Minimum order total is ${String(MIN_ORDER)} RUB`,
        min: MIN_ORDER,
      });
      return;
    }

    for (const line of payload.lines) {
      const product = config.catalog.find((p) => p.id === line.productId);
      if (product !== undefined && product.stock < line.qty) {
        sendError(res, 409, {
          code: "INSUFFICIENT_STOCK",
          message: `Insufficient stock for "${product.name}"`,
          productId: product.id,
          productName: product.name,
        });
        return;
      }
    }

    if (config.rng() < config.orderFailureRate) {
      sendError(res, 503, {
        code: "SERVICE_UNAVAILABLE",
        message: "Service temporarily unavailable",
      });
      return;
    }

    res.json(OrderAck.parse({ orderId: randomUUID() }));
  });

  return app;
}
