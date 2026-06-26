import { type OrderOption } from "@comfort-b2b/shared/schemas";

/**
 * The fixed set of order options a customer can toggle on the cart. Kept as a
 * single source on the mobile side (the backend only echoes the selected ids
 * back through the order payload); labels are display strings localized at the
 * UI layer in Phase 7.
 */
export const ORDER_OPTIONS: OrderOption[] = [
  { id: "express_delivery", label: "Express delivery" },
  { id: "gift_wrap", label: "Gift wrapping" },
  { id: "assembly", label: "Assembly service" },
];
