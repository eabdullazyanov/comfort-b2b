import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";

import { useStores } from "../stores/useStores";
import { useFormatPrice } from "../useFormatPrice";

interface CartSummaryBarProps {
  onPress: () => void;
}

/** Floating bar shown over the catalog when the cart is non-empty. */
export const CartSummaryBar = observer(function CartSummaryBar({
  onPress,
}: CartSummaryBarProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  const { cart } = useStores();

  if (cart.itemCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" icon="cart" onPress={onPress}>
        {t("catalog.viewCart", {
          items: cart.itemCount,
          price: formatPrice(cart.total),
        })}
      </Button>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    padding: 16,
    position: "absolute",
    right: 0,
  },
});
