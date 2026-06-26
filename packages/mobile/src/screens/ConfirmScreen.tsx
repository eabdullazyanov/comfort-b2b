import { StackActions, useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Divider,
  List,
  Portal,
  Text,
} from "react-native-paper";

import { localizeApiError } from "../i18n/localizeApiError";
import { useScreenTitle } from "../navigation/useScreenTitle";
import { ORDER_OPTIONS } from "../orderOptions";
import { useStores } from "../stores/useStores";
import { useFormatPrice } from "../useFormatPrice";

/** Read-only summary + submit, with localized success/error dialogs and retry. */
export const ConfirmScreen = observer(function ConfirmScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const formatPrice = useFormatPrice();
  const { cart, order } = useStores();

  useScreenTitle(t("confirm.title"));

  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const selectedOptions = ORDER_OPTIONS.filter((option) =>
    cart.selectedOptionIds.has(option.id),
  );

  async function handleConfirm() {
    const ok = await order.placeOrder();
    if (ok) {
      setSuccessVisible(true);
    } else {
      setErrorVisible(true);
    }
  }

  return (
    // Own Portal.Host: this screen is a native-stack modal, which renders above
    // PaperProvider's root Portal host — without a local host the Dialog mounts
    // *behind* the modal and the user sees no feedback after placing an order.
    <Portal.Host>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <List.Subheader>{t("confirm.summaryTitle")}</List.Subheader>
          {cart.lineItems.map(({ product, qty }) => (
            <List.Item
              key={product.id}
              title={product.name}
              description={`${String(qty)} × ${formatPrice(product.price)}`}
              right={() => (
                <Text variant="bodyMedium">
                  {formatPrice(product.price * qty)}
                </Text>
              )}
            />
          ))}

          <List.Subheader>{t("confirm.optionsTitle")}</List.Subheader>
          {selectedOptions.length === 0 ? (
            <List.Item title={t("confirm.noOptions")} />
          ) : (
            selectedOptions.map((option) => (
              <List.Item key={option.id} title={t(`options.${option.id}`)} />
            ))
          )}

          <Divider />
          <View style={styles.totalRow}>
            <Text variant="titleMedium">{t("confirm.total")}</Text>
            <Text variant="titleMedium">{formatPrice(cart.total)}</Text>
          </View>
        </ScrollView>

        <Divider />
        <View style={styles.footer}>
          <Button
            mode="contained"
            loading={order.submitting}
            disabled={order.submitting}
            onPress={() => {
              void handleConfirm();
            }}
          >
            {order.submitting ? t("confirm.placing") : t("confirm.placeOrder")}
          </Button>
          <Button
            disabled={order.submitting}
            onPress={() => {
              navigation.goBack();
            }}
          >
            {t("confirm.cancel")}
          </Button>
        </View>

        <Portal>
          <Dialog dismissable={false} visible={successVisible}>
            <Dialog.Title>{t("confirm.successTitle")}</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                {t("confirm.successBody", { orderId: order.lastOrderId ?? "" })}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setSuccessVisible(false);
                  navigation.dispatch(StackActions.popToTop());
                }}
              >
                {t("confirm.done")}
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog
            visible={errorVisible && order.lastError !== undefined}
            onDismiss={() => {
              setErrorVisible(false);
            }}
          >
            <Dialog.Title>{t("confirm.errorTitle")}</Dialog.Title>
            <Dialog.Content>
              {order.lastError === undefined ? null : (
                <Text variant="bodyMedium">
                  {t(
                    localizeApiError(order.lastError).key,
                    localizeApiError(order.lastError).values,
                  )}
                </Text>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setErrorVisible(false);
                }}
              >
                {t("confirm.dismiss")}
              </Button>
              <Button
                onPress={() => {
                  setErrorVisible(false);
                  void handleConfirm();
                }}
              >
                {t("confirm.retry")}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Portal.Host>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
  },
  footer: {
    gap: 8,
    padding: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
