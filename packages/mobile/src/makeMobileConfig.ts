import { z } from "zod";

import { makeEnv } from "@comfort-b2b/shared/makeEnv";

/**
 * Builds the typed mobile runtime config from a raw env source. `API_BASE_URL`
 * is REQUIRED and must be a valid URL - misconfiguration fails fast at startup
 * rather than silently falling back to a default (which is dangerous in prod).
 * Pure (no React Native imports) so it is unit-testable; `config.ts` wires the
 * `react-native-config` source into it.
 */
export function makeMobileConfig(source: unknown) {
  const schema = z.strictObject({
    API_BASE_URL: z.url(),
  });
  return makeEnv(schema, source);
}
