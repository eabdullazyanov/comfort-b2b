import { z } from "zod";

/**
 * Validates a 2xx response body against its schema. The boundary is RESILIENT,
 * not fatal: on a success-shape mismatch we surface the validation error (log)
 * but pass the raw payload through rather than crashing the app. This is the
 * ONE sanctioned `as` in the repo (everywhere else uses `zod.parse`/guards).
 */
export function parseResponse<Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
  label: string,
): z.infer<Schema> {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn(
    `[apiClient] ${label} response failed validation:\n${z.prettifyError(result.error)}`,
  );
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as z.infer<Schema>;
}
