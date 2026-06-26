import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Checkbox, Divider, List, Text } from "react-native-paper";

import { MIN_ORDER } from "@comfort-b2b/shared/constants";

import { AnalyticsStatusBadge } from "../components/AnalyticsStatusBadge";
import { CartLineItem } from "../components/CartLineItem";
import { useScreenTitle } from "../navigation/useScreenTitle";
import { ORDER_OPTIONS } from "../orderOptions";
import { useStores } from "../stores/useStores";
import { useFormatPrice } from "../useFormatPrice";

/** Editable cart: lines, fixed options, analytics status, min-gated checkout. */
export const CartScreen = observer(function CartScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const formatPrice = useFormatPrice();
  const { cart } = useStores();

  useScreenTitle(t("cart.title"));

  if (cart.lineItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="titleMedium">{t("cart.empty")}</Text>
        <Button
          mode="contained"
          onPress={() => {
            navigation.navigate("Catalog");
          }}
        >
          {t("cart.browse")}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cart.lineItems.map(({ product, qty }) => (
          <CartLineItem key={product.id} product={product} qty={qty} />
        ))}

        <List.Subheader>{t("cart.optionsTitle")}</List.Subheader>
        {ORDER_OPTIONS.map((option) => (
          <Checkbox.Item
            key={option.id}
            label={t(`options.${option.id}`)}
            status={
              cart.selectedOptionIds.has(option.id) ? "checked" : "unchecked"
            }
            onPress={() => {
              cart.toggleOption(option.id);
            }}
          />
        ))}
      </ScrollView>

      <Divider />
      <View style={styles.footer}>
        <AnalyticsStatusBadge />
        <View style={styles.totalRow}>
          <Text variant="titleMedium">{t("cart.total")}</Text>
          <Text variant="titleMedium">{formatPrice(cart.total)}</Text>
        </View>
        {cart.meetsMinimum ? null : (
          <Text variant="bodySmall" style={styles.hint}>
            {t("cart.minHint", {
              amount: formatPrice(MIN_ORDER - cart.total),
              min: formatPrice(MIN_ORDER),
            })}
          </Text>
        )}
        <Button
          mode="contained"
          disabled={!cart.meetsMinimum}
          onPress={() => {
            navigation.navigate("Confirm");
          }}
        >
          {t("cart.proceed")}
        </Button>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  footer: {
    gap: 12,
    padding: 16,
  },
  hint: {
    color: "#b00020",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
