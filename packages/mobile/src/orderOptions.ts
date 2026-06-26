import { type OrderOption } from "@comfort-b2b/shared/schemas";

/** Stable identifiers for the fixed order options (used as `options.<id>` keys). */
export type OptionId = "express_delivery" | "gift_wrap" | "assembly";

/**
 * The fixed set of order options a customer can toggle on the cart. Kept as a
 * single source on the mobile side (the backend only echoes the selected ids
 * back through the order payload). The English `label` is the stable string sent
 * in the analytics payload; the UI displays each option via the localized
 * `options.<id>` translation key (see `packages/mobile/src/i18n`).
 */
export const ORDER_OPTIONS: (OrderOption & { id: OptionId })[] = [
  { id: "express_delivery", label: "Express delivery" },
  { id: "gift_wrap", label: "Gift wrapping" },
  { id: "assembly", label: "Assembly service" },
];
