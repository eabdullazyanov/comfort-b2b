/**
 * Minimal mock for `react-i18next` used in Jest component tests.
 * Returns translation keys verbatim so tests can assert on i18n key strings.
 */
import { type ReactNode } from "react";

export function useTranslation() {
  return {
    t: (key: string, _opts?: Record<string, unknown>): string => key,
    i18n: { changeLanguage: () => Promise.resolve() },
  };
}

export function Trans({ children }: { children?: ReactNode }): ReactNode {
  return children ?? null;
}

export function initReactI18next(): void {}
