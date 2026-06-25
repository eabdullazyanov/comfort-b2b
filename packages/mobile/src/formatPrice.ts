import { CURRENCY } from "@comfort-b2b/shared/constants";

/** Formats a ruble amount as a localized currency string (no fractional part). */
export function formatPrice(amount: number, locale = "ru-RU"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}
