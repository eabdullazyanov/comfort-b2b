/**
 * Mock for `useFormatPrice` hook used in Jest component tests.
 * Returns a simple formatter that renders amounts as "N ₽".
 */
export function useFormatPrice(): (amount: number) => string {
  return (amount: number) => `${String(amount)} ₽`;
}
