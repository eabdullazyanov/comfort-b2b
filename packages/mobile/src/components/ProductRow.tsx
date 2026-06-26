import { observer } from "mobx-react-lite";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Divider, Text } from "react-native-paper";

import { type Product } from "@comfort-b2b/shared/schemas";

import { useStores } from "../stores/useStores";
import { useFormatPrice } from "../useFormatPrice";

import { QtyStepper } from "./QtyStepper";

/** Fixed row height so the catalog `FlatList` can use `getItemLayout`. */
export const PRODUCT_ROW_HEIGHT = 76;

interface ProductRowProps {
  product: Product;
}

// `observer` re-renders the row when this product's cart qty changes; `memo`
// stops it re-rendering when sibling rows change (product props are stable).
const ObservedProductRow = observer(function ProductRow({
  product,
}: ProductRowProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  const { cart } = useStores();

  const qty = cart.lines.get(product.id) ?? 0;
  const outOfStock = product.stock <= 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text variant="titleMedium" numberOfLines={1}>
            {product.name}
          </Text>
          <Text variant="bodyMedium">{formatPrice(product.price)}</Text>
          <Text variant="bodySmall" style={styles.stock}>
            {outOfStock
              ? t("catalog.outOfStock")
              : t("catalog.stock", { stock: product.stock })}
          </Text>
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
      </View>
      <Divider />
    </View>
  );
});

export const ProductRow = memo(ObservedProductRow);

const styles = StyleSheet.create({
  container: {
    height: PRODUCT_ROW_HEIGHT,
    justifyContent: "center",
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    paddingHorizontal: 16,
  },
  stock: {
    opacity: 0.6,
  },
});
