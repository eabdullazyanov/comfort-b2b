import { type Product } from "@comfort-b2b/shared/schemas";

const ADJECTIVES = [
  "Classic",
  "Modern",
  "Premium",
  "Compact",
  "Deluxe",
  "Standard",
  "Elite",
  "Basic",
  "Pro",
  "Ultra",
];

const NOUNS = [
  "Chair",
  "Desk",
  "Lamp",
  "Shelf",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headset",
  "Webcam",
  "Speaker",
];

/**
 * Generates a catalog of 1000 products with deterministic names, prices (100–10 000 ₽),
 * and stock levels (0–49) derived from the provided RNG instance.
 */
export function generateCatalog(rng: () => number): Product[] {
  return Array.from({ length: 1000 }, (_, i) => {
    const adj = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(rng() * NOUNS.length)];
    const price = Math.floor(rng() * 9900) + 100;
    const stock = Math.floor(rng() * 50);
    return {
      id: `p${String(i + 1)}`,
      name: `${adj ?? "Standard"} ${noun ?? "Item"} ${String(i + 1)}`,
      price,
      stock,
    };
  });
}
