import { MIN_ORDER } from "@comfort-b2b/shared/constants";

/** Returns the minimum order total the backend will accept. */
export function getMinimumOrder(): number {
  return MIN_ORDER;
}
