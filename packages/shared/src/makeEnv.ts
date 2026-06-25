import { z } from "zod";

/**
 * Parse and validate an environment-variable source against a zod schema,
 * failing fast with a readable message on misconfiguration. Returns the typed,
 * coerced config so callers consume `z.infer<Schema>` instead of `process.env`
 * stringly-typed access. Used by both the backend and the mobile app.
 */
export function makeEnv<Schema extends z.ZodType>(
  schema: Schema,
  source: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
