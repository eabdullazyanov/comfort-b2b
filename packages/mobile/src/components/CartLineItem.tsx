import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Divider, IconButton, Text } from "react-native-paper";

import { type Product } from "@comfort-b2b/shared/schemas";

import { useStores } from "../stores/useStores";
import { useFormatPrice } from "../useFormatPrice";

import { QtyStepper } from "./QtyStepper";

interface CartLineItemProps {
  product: Product;
  qty: number;
}

/** One editable cart line: name, line subtotal, qty stepper and a remove icon. */
export const CartLineItem = observer(function CartLineItem({
  product,
  qty,
}: CartLineItemProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  const { cart } = useStores();

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text variant="titleMedium" numberOfLines={1}>
            {product.name}
          </Text>
          <Text variant="bodyMedium">{formatPrice(product.price * qty)}</Text>
        </View>
        <QtyStepper
          value={qty}
          disableAdd={qty >= product.stock}
          onAdd={() => {
            cart.addOne(product.id);
          }}
          onRemove={() => {
            cart.removeOne(product.id);
          }}
        />
        <IconButton
          icon="delete-outline"
          size={20}
          accessibilityLabel={t("cart.remove")}
          onPress={() => {
            cart.remove(product.id);
          }}
        />
      </View>
      <Divider />
    </View>
  );
});

const styles = StyleSheet.create({
  info: {
    flex: 1,
    paddingRight: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 16,
    paddingVertical: 8,
  },
});
