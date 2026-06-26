import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  type ListRenderItemInfo,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

import { type Product } from "@comfort-b2b/shared/schemas";

import { CartSummaryBar } from "../components/CartSummaryBar";
import { PRODUCT_ROW_HEIGHT, ProductRow } from "../components/ProductRow";
import { localizeApiError } from "../i18n/localizeApiError";
import { useScreenTitle } from "../navigation/useScreenTitle";
import { useStores } from "../stores/useStores";

function keyExtractor(product: Product): string {
  return product.id;
}

function renderProduct({ item }: ListRenderItemInfo<Product>) {
  return <ProductRow product={item} />;
}

function getItemLayout(
  _data: ArrayLike<Product> | null | undefined,
  index: number,
) {
  return {
    length: PRODUCT_ROW_HEIGHT,
    offset: PRODUCT_ROW_HEIGHT * index,
    index,
  };
}

/** Virtualized 1000-item catalog with memoized observer rows + a cart bar. */
export const CatalogScreen = observer(function CatalogScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { catalog } = useStores();

  useScreenTitle(t("app.title"));

  useEffect(() => {
    if (catalog.products.length === 0 && !catalog.loading) {
      void catalog.load();
    }
  }, [catalog]);

  if (catalog.loading && catalog.products.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.centeredText}>{t("catalog.loading")}</Text>
      </View>
    );
  }

  if (catalog.error !== undefined && catalog.products.length === 0) {
    const { key, values } = localizeApiError(catalog.error);
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">{t("catalog.errorTitle")}</Text>
        <Text style={styles.centeredText}>{t(key, values)}</Text>
        <Button
          mode="contained"
          onPress={() => {
            void catalog.load();
          }}
        >
          {t("catalog.retry")}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={catalog.products}
        keyExtractor={keyExtractor}
        renderItem={renderProduct}
        getItemLayout={getItemLayout}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={11}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
      />
      <CartSummaryBar
        onPress={() => {
          navigation.navigate("Cart");
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  centeredText: {
    opacity: 0.7,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 96,
  },
});
