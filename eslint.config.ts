import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

// `eslint-plugin-react-hooks` ships a non-standard `configs.flat` shape that is
// not assignable to ESLint's flat `Plugin` type. We only need its rules, so we
// register a minimal plugin object without the incompatible `configs`.
const reactHooksPlugin = {
  meta: reactHooks.meta,
  rules: reactHooks.rules,
};

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.yarn/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "packages/mobile/android/**",
    "packages/mobile/ios/**",
    "packages/mobile/vendor/**",
    // RN-managed CommonJS config/entry files (the only `.js` files in the repo).
    "packages/mobile/metro.config.js",
    "packages/mobile/babel.config.js",
    "packages/mobile/index.js",
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs["flat/recommended"],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": {
        typescript: {
          project: ["packages/*/tsconfig.json"],
          noWarnOnMultipleProjects: true,
        },
        node: true,
      },
    },
    rules: {
      "func-style": ["error", "declaration"],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "@comfort-b2b/**",
              group: "internal",
              position: "before",
            },
            { pattern: "@/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/filename-case": [
        "error",
        { cases: { camelCase: true, pascalCase: true } },
      ],
    },
  },
  {
    files: ["packages/mobile/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooksPlugin },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  {
    /**
     * Jest `__mocks__` files are intentional module stubs.
     * - Filenames must match the module they replace (e.g. `react-native.tsx`)
     *   so kebab-case is intentional and `unicorn/filename-case` is disabled.
     * - Empty function bodies are valid no-op stubs for unused callbacks.
     * - Type assertions are sometimes necessary to satisfy the mocked types.
     * - Import order within these utility files is relaxed.
     * - Unused parameters in stub signatures are documented noise.
     */
    files: [
      "packages/mobile/__mocks__/**/*.{ts,tsx}",
      "packages/mobile/jest.rn-setup.ts",
    ],
    rules: {
      "unicorn/filename-case": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/order": "off",
    },
  },
  prettier,
]);
