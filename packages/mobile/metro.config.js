const path = require("path");

const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

/**
 * Metro configuration tuned for a Yarn workspaces monorepo.
 * - `watchFolders` lets Metro see the hoisted root `node_modules` and the
 *   sibling `@comfort-b2b/*` workspaces (e.g. `shared`).
 * - `nodeModulesPaths` resolves dependencies from both the app and the root.
 *
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(monorepoRoot, "node_modules"),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
