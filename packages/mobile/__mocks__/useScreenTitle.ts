/**
 * Mock for `useScreenTitle` hook used in Jest component tests.
 * The hook calls `navigation.setOptions({ title })` in a layout effect —
 * in tests we simply no-op that call.
 */
export function useScreenTitle(_title: string): void {
  // no-op: navigation.setOptions is not needed in tests
}
