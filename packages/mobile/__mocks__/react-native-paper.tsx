/**
 * Minimal mock for `react-native-paper` used in Jest component tests.
 *
 * Each component forwards props that @testing-library/react-native relies on:
 * - `accessible` / `accessibilityRole` / `accessibilityState` – for role
 *   queries and toBeDisabled().
 * - `accessibilityLabel` / `aria-label` – for getByLabelText().
 * - Text children rendered as 'Text' host nodes so getByText() finds them.
 */
import React from "react";

type AnyProps = { children?: React.ReactNode; [key: string]: unknown };

// ---- Text ------------------------------------------------------------------

export function Text({ children, ...props }: AnyProps) {
  return React.createElement("Text", props, children);
}

// ---- Button ----------------------------------------------------------------

interface ButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  [key: string]: unknown;
}

export function Button({ children, onPress, disabled, ...rest }: ButtonProps) {
  return React.createElement(
    "View",
    {
      accessible: true,
      accessibilityRole: "button",
      accessibilityState: { disabled: Boolean(disabled) },
      onPress: disabled ? undefined : onPress,
      ...rest,
    },
    React.createElement("Text", null, children),
  );
}

// ---- IconButton ------------------------------------------------------------

interface IconButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  [key: string]: unknown;
}

export function IconButton({
  onPress,
  disabled,
  accessibilityLabel,
  ...rest
}: IconButtonProps) {
  return React.createElement("View", {
    accessible: true,
    accessibilityRole: "button",
    accessibilityLabel,
    accessibilityState: { disabled: Boolean(disabled) },
    onPress: disabled ? undefined : onPress,
    ...rest,
  });
}

// ---- Chip ------------------------------------------------------------------

export function Chip({ children, ...props }: AnyProps) {
  return React.createElement(
    "View",
    { accessible: true, ...props },
    React.createElement("Text", null, children),
  );
}

// ---- Divider ---------------------------------------------------------------

export function Divider(_props: AnyProps) {
  return React.createElement("View", { accessibilityRole: "separator" });
}

// ---- Checkbox --------------------------------------------------------------

interface CheckboxItemProps {
  label?: string;
  status?: "checked" | "unchecked" | "indeterminate";
  onPress?: () => void;
  [key: string]: unknown;
}

function CheckboxItem({ label, status, onPress, ...rest }: CheckboxItemProps) {
  return React.createElement(
    "View",
    {
      accessible: true,
      accessibilityRole: "checkbox",
      accessibilityState: { checked: status === "checked" },
      onPress,
      ...rest,
    },
    React.createElement("Text", null, label),
  );
}

export const Checkbox = { Item: CheckboxItem };

// ---- List ------------------------------------------------------------------

function ListSubheader({ children, ...props }: AnyProps) {
  return React.createElement("Text", props, children);
}

interface ListItemProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  right?: () => React.ReactNode;
  [key: string]: unknown;
}

function ListItem({ title, description, right, ...props }: ListItemProps) {
  return React.createElement(
    "View",
    props,
    React.createElement("Text", null, title),
    description ? React.createElement("Text", null, description) : null,
    right ? right() : null,
  );
}

export const List = { Subheader: ListSubheader, Item: ListItem };

// ---- Portal ----------------------------------------------------------------

export function Portal({ children }: AnyProps) {
  return React.createElement(React.Fragment, null, children);
}
Portal.Host = function PortalHost({ children }: AnyProps) {
  return React.createElement(React.Fragment, null, children);
};

// ---- Dialog ----------------------------------------------------------------

interface DialogProps {
  children?: React.ReactNode;
  visible?: boolean;
  [key: string]: unknown;
}

function Dialog({ children, visible, ...props }: DialogProps) {
  if (!visible) return null;
  return React.createElement(
    "View",
    { accessibilityRole: "dialog", ...props },
    children,
  );
}
Dialog.Title = function DialogTitle({ children }: AnyProps) {
  return React.createElement("Text", null, children);
};
Dialog.Content = function DialogContent({ children }: AnyProps) {
  return React.createElement("View", null, children);
};
Dialog.Actions = function DialogActions({ children }: AnyProps) {
  return React.createElement("View", null, children);
};

export { Dialog };

// ---- Surface / Card (minimal stubs) ----------------------------------------

export function Surface({ children, ...props }: AnyProps) {
  return React.createElement("View", props, children);
}
