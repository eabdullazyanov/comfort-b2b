import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { makeEnv } from "./makeEnv";

const Schema = z.object({
  PORT: z.coerce.number().int().positive(),
  SEED: z.coerce.number().int().optional(),
});

describe("makeEnv", () => {
  it("returns typed, coerced config for a valid source", () => {
    const env = makeEnv(Schema, { PORT: "3000", SEED: "42" });
    expect(env).toEqual({ PORT: 3000, SEED: 42 });
  });

  it("allows omitting optional vars", () => {
    const env = makeEnv(Schema, { PORT: "8080" });
    expect(env.PORT).toBe(8080);
    expect(env.SEED).toBeUndefined();
  });

  it("throws a readable error on misconfiguration", () => {
    expect(() => makeEnv(Schema, { PORT: "not-a-number" })).toThrow(
      /Invalid environment configuration/,
    );
  });
});
