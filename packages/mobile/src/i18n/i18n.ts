import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import ru from "./ru.json";
import { DEFAULT_LANGUAGE } from "./supportedLanguages";

// Typed `t()`: keys are inferred from the EN bundle shape. Typing off
// `typeof en` (a JSON import) preserves the key structure without an
// `as const` (banned by the repo-wide `assertionStyle: "never"` rule); `ru.json`
// is shape-checked against the same type by `i18n.test.ts`.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof en };
  }
}

// Resources are inline (no async backend), so `t()` is ready synchronously
// after this module is imported for its side effect from `App.tsx`.
void i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});
