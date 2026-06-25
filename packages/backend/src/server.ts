import { generateCatalog } from "./catalog.ts";
import { env } from "./env.ts";
import { makeApp } from "./makeApp.ts";
import { makeRng } from "./rng.ts";

const rng = makeRng(env.SEED);
const catalog = generateCatalog(makeRng(env.SEED));

const app = makeApp({
  catalog,
  rng,
  analyticsFailureRate: env.ANALYTICS_FAILURE_RATE,
  orderFailureRate: env.ORDER_FAILURE_RATE,
  latencyMs: env.LATENCY_MS,
});

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${String(env.PORT)}`);
});
