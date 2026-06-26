/**
 * Minimal mock for `@react-navigation/native` used in Jest component tests.
 * Provides stub implementations of the navigation hooks.
 */
import { type ReactNode } from "react";

import { jest } from "@jest/globals";

export function useNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
}

export function useRoute() {
  return { name: "Test", key: "test", params: {} };
}

export function useIsFocused() {
  return true;
}

export const StackActions = {
  popToTop: jest.fn(() => ({ type: "POP_TO_TOP" })),
  push: jest.fn(() => ({ type: "PUSH" })),
  pop: jest.fn(() => ({ type: "POP" })),
};

export function NavigationContainer({
  children,
}: {
  children?: ReactNode;
}): ReactNode {
  return children ?? null;
}
