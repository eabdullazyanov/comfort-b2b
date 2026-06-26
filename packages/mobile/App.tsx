import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { fetchCatalog, sendAnalytics, submitOrder } from "./src/apiClient";
import { LanguageSwitcher } from "./src/components/LanguageSwitcher";
import { formatPrice } from "./src/formatPrice";
import "./src/i18n/i18n";
import { RootStore } from "./src/stores/RootStore";

const store = new RootStore({ fetchCatalog, sendAnalytics, submitOrder });

const App = observer(function App() {
  const isDarkMode = useColorScheme() === "dark";
  const { t, i18n } = useTranslation();
  const priceLocale = i18n.language === "ru" ? "ru-RU" : "en-US";

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <Text style={styles.title}>{t("app.title")}</Text>
        <Text style={styles.subtitle}>
          {t("app.minOrder", { price: formatPrice(1000, priceLocale) })}
        </Text>
        <Text style={styles.subtitle}>
          {t("app.cartSummary", {
            products: store.catalog.products.length,
            count: store.cart.itemCount,
          })}
        </Text>
        <LanguageSwitcher />
      </View>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    justifyContent: "center",
    padding: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});

export default App;
