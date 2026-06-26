import { beforeAll, describe, expect, it } from "@jest/globals";
import { createInstance, type i18n as I18n } from "i18next";

import en from "./en.json";
import ru from "./ru.json";

function flattenKeys(value: unknown, prefix: string): string[] {
  if (typeof value !== "object" || value === null) {
    return prefix === "" ? [] : [prefix];
  }
  const keys: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix === "" ? key : `${prefix}.${key}`;
    keys.push(...flattenKeys(child, next));
  }
  return keys;
}

describe("i18n bundles", () => {
  it("keep EN and RU key sets in parity", () => {
    const enKeys = flattenKeys(en, "").sort();
    const ruKeys = flattenKeys(ru, "").sort();
    expect(ruKeys).toEqual(enKeys);
  });
});

describe("i18n interpolation", () => {
  let i18n: I18n;

  beforeAll(async () => {
    i18n = createInstance();
    await i18n.init({
      resources: { en: { translation: en }, ru: { translation: ru } },
      lng: "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
  });

  it("interpolates the product name in EN", () => {
    expect(i18n.t("errors.INSUFFICIENT_STOCK", { productName: "Chair" })).toBe(
      "Not enough stock for Chair.",
    );
  });

  it("interpolates the minimum amount in RU", async () => {
    await i18n.changeLanguage("ru");
    expect(i18n.t("errors.MIN_AMOUNT_NOT_REACHED", { min: 1000 })).toBe(
      "Минимальная сумма заказа — 1000.",
    );
  });
});
