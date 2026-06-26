module.exports = {
  presets: ["module:@react-native/babel-preset"],
  // zod v4 ships `export * as ns from "..."`; the RN preset doesn't enable this
  // transform, so Metro fails to bundle it without this plugin.
  plugins: ["@babel/plugin-transform-export-namespace-from"],
};
