/**
 * Minimal mock for `react-native` used in Jest component tests.
 *
 * All host components render as string-typed React elements (e.g. 'View',
 * 'Text') so that @testing-library/react-native queries work correctly:
 * the library checks `typeof instance.type === 'string'` to identify host
 * nodes, and matches text content / accessibility props on those nodes.
 */
import React from "react";

// ---- Style utilities -------------------------------------------------------

export const StyleSheet = {
  create: <T extends object>(styles: T): T => styles,
  flatten: (style: unknown): unknown => style,
  absoluteFillObject: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  hairlineWidth: 1,
};

// ---- Platform --------------------------------------------------------------

export const Platform = {
  OS: "ios" as const,
  select: <T extends object>(obj: T): T[keyof T] =>
    ("ios" in obj
      ? obj["ios" as keyof T]
      : obj["default" as keyof T]) as T[keyof T],
  Version: 16,
};

// ---- Host element factory --------------------------------------------------

type AnyProps = { children?: React.ReactNode; [key: string]: unknown };

function hostEl(tag: string) {
  return function HostComponent({ children, ...props }: AnyProps) {
    return React.createElement(tag, props, children);
  };
}

// ---- Components ------------------------------------------------------------

export const View = hostEl("View");
export const Text = hostEl("Text");
export const ScrollView = hostEl("ScrollView");
export const TouchableOpacity = hostEl("View");
export const Pressable = hostEl("Pressable");
export const FlatList = hostEl("View");
export const Image = hostEl("Image");
export const Modal = hostEl("Modal");
export const SafeAreaView = hostEl("View");
export const ActivityIndicator = hostEl("View");
export const TouchableHighlight = hostEl("View");

// ---- Utilities -------------------------------------------------------------

export const Animated = {
  View: View,
  Text: Text,
  Value: class {
    constructor(_value: number) {}
    setValue(_v: number) {}
  },
  timing: () => ({ start: (_cb?: () => void) => {}, stop: () => {} }),
  spring: () => ({ start: (_cb?: () => void) => {}, stop: () => {} }),
  sequence: () => ({ start: (_cb?: () => void) => {}, stop: () => {} }),
  parallel: () => ({ start: (_cb?: () => void) => {}, stop: () => {} }),
  createAnimatedComponent: <P extends object>(C: React.ComponentType<P>) => C,
};

export const Dimensions = {
  get: (_dim: string) => ({ width: 375, height: 812, scale: 2 }),
  addEventListener: () => ({ remove: () => {} }),
};

export const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
};

export const Appearance = {
  getColorScheme: () => "light",
  addChangeListener: () => ({ remove: () => {} }),
};

export function useColorScheme(): string {
  return "light";
}

export const AccessibilityInfo = {
  isReduceMotionEnabled: () => Promise.resolve(false),
};

export const DevSettings = {
  addMenuItem: () => {},
};

export const I18nManager = {
  isRTL: false,
};

export const NativeModules = {};
