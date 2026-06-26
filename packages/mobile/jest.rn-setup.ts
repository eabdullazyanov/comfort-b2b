/**
 * Minimal jest setup for mobile component tests.
 *
 * Sets the global flag that React's scheduler checks to determine whether
 * async `act()` semantics should apply, avoiding "not wrapped in act()"
 * warnings in tests that trigger state updates asynchronously.
 */
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  configurable: true,
  enumerable: true,
  value: true,
  writable: true,
});
