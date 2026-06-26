import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

interface QtyStepperProps {
  value: number;
  onAdd: () => void;
  onRemove: () => void;
  disableAdd?: boolean;
}

/** A `− value +` quantity control reused by the catalog rows and cart lines. */
export function QtyStepper({
  value,
  onAdd,
  onRemove,
  disableAdd = false,
}: QtyStepperProps) {
  return (
    <View style={styles.row}>
      <IconButton
        icon="minus"
        mode="contained-tonal"
        size={16}
        disabled={value <= 0}
        onPress={onRemove}
        accessibilityLabel="decrement"
      />
      <Text variant="titleMedium" style={styles.value}>
        {String(value)}
      </Text>
      <IconButton
        icon="plus"
        mode="contained-tonal"
        size={16}
        disabled={disableAdd}
        onPress={onAdd}
        accessibilityLabel="increment"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  value: {
    minWidth: 24,
    textAlign: "center",
  },
});
