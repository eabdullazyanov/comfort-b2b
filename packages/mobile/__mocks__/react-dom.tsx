/**
 * Stub for `react-dom` required by `mobx-react-lite` in a React Native test
 * environment. The package isn't installed (RN doesn't use the DOM renderer),
 * so we provide the minimal surface that mobx-react-lite actually calls.
 */
export function unstable_batchedUpdates(fn: () => void): void {
  fn();
}
