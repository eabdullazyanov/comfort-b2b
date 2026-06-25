import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  roots: ["<rootDir>/packages"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", {}],
  },
  moduleNameMapper: {
    "^@comfort-b2b/shared/(.*)$": "<rootDir>/packages/shared/src/$1",
  },
};

export default config;
