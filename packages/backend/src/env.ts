import { z } from "zod";

import { makeEnv } from "@comfort-b2b/shared/makeEnv";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  ANALYTICS_FAILURE_RATE: z.coerce.number().min(0).max(1).default(0),
  ORDER_FAILURE_RATE: z.coerce.number().min(0).max(1).default(0),
  LATENCY_MS: z.coerce.number().int().nonnegative().default(0),
  SEED: z.coerce.number().int().optional(),
});

export const env = makeEnv(EnvSchema, process.env);
