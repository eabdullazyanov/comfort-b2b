import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { formatPrice } from "./formatPrice";

/**
 * Returns a currency formatter bound to the active language's locale, so all
 * screens render prices consistently (RU uses `ru-RU`, everything else `en-US`).
 */
export function useFormatPrice(): (amount: number) => string {
  const { i18n } = useTranslation();
  const locale = i18n.language === "ru" ? "ru-RU" : "en-US";
  return useCallback((amount: number) => formatPrice(amount, locale), [locale]);
}
