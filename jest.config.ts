import type { Config } from "jest";

/**
 * `@swc/jest` transform configured for both TypeScript and TSX files.
 * The `react.runtime: "automatic"` option enables the new JSX transform
 * (react/jsx-runtime) so components don't need `import React from "react"`.
 */
const swcTransform: Config["transform"] = {
  "^.+\\.(t|j)sx?$": [
    "@swc/jest",
    {
      jsc: {
        transform: {
          react: {
            runtime: "automatic",
          },
        },
      },
    },
  ],
};

const sharedMapper: NonNullable<Config["moduleNameMapper"]> = {
  "^@comfort-b2b/shared/(.*)$": "<rootDir>/packages/shared/src/$1",
};

/**
 * moduleNameMapper entries that replace heavy native/DOM packages and
 * project-internal hooks with lightweight test doubles.  Using the mapper
 * rather than `jest.mock()` factories guarantees the stubs are always loaded
 * regardless of `@swc/jest`'s hoisting behaviour.
 */
const rnMocks: NonNullable<Config["moduleNameMapper"]> = {
  // React Native host components → simple React mock
  "^react-native$": "<rootDir>/packages/mobile/__mocks__/react-native.tsx",
  // react-native-paper UI widgets → accessible React mock
  "^react-native-paper$":
    "<rootDir>/packages/mobile/__mocks__/react-native-paper.tsx",
  // react-dom is not installed in this RN project; stub the minimal surface
  // used by mobx-react-lite (unstable_batchedUpdates).
  "^react-dom$": "<rootDir>/packages/mobile/__mocks__/react-dom.tsx",
  // i18next hooks → return translation keys verbatim
  "^react-i18next$": "<rootDir>/packages/mobile/__mocks__/react-i18next.tsx",
  // Navigation hooks → no-op mocks
  "^@react-navigation/native$":
    "<rootDir>/packages/mobile/__mocks__/react-navigation-native.tsx",
  // Project-internal hooks used by every screen
  ".*useFormatPrice$": "<rootDir>/packages/mobile/__mocks__/useFormatPrice.ts",
  ".*navigation/useScreenTitle$":
    "<rootDir>/packages/mobile/__mocks__/useScreenTitle.ts",
};

const config: Config = {
  projects: [
    {
      /**
       * Pure Node test suite: shared schemas, backend routes, store unit
       * tests. No React Native components; environment stays `node`.
       */
      displayName: "node",
      testEnvironment: "node",
      roots: ["<rootDir>/packages"],
      testMatch: ["**/*.test.ts"],
      transform: swcTransform,
      moduleNameMapper: sharedMapper,
    },
    {
      /**
       * Mobile component test suite: renders React Native screens and
       * components via @testing-library/react-native + test-renderer.
       * Heavy native packages (react-native, react-native-paper) are
       * replaced by lightweight JS mocks so no native environment is
       * required.
       */
      displayName: "mobile-ui",
      testEnvironment: "node",
      roots: ["<rootDir>/packages/mobile"],
      testMatch: ["**/*.test.tsx"],
      transform: swcTransform,
      moduleNameMapper: { ...sharedMapper, ...rnMocks },
      setupFiles: ["<rootDir>/packages/mobile/jest.rn-setup.ts"],
    },
  ],
};

export default config;
