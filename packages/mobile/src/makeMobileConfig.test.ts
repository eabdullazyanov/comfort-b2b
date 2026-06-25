import { describe, expect, it } from "@jest/globals";

import { makeMobileConfig } from "./makeMobileConfig";

describe("makeMobileConfig", () => {
  it("returns the validated API_BASE_URL when present", () => {
    const config = makeMobileConfig({ API_BASE_URL: "http://10.0.2.2:3000" });
    expect(config.API_BASE_URL).toBe("http://10.0.2.2:3000");
  });

  it("throws when API_BASE_URL is absent", () => {
    expect(() => makeMobileConfig({})).toThrow(
      /Invalid environment configuration/,
    );
  });

  it("throws when API_BASE_URL is undefined", () => {
    expect(() => makeMobileConfig({ API_BASE_URL: undefined })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it("throws on a malformed API_BASE_URL", () => {
    expect(() => makeMobileConfig({ API_BASE_URL: "not-a-url" })).toThrow(
      /Invalid environment configuration/,
    );
  });
});
