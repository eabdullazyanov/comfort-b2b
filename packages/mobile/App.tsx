import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { formatPrice } from "./src/formatPrice";

function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <Text style={styles.title}>comfort-b2b</Text>
        <Text style={styles.subtitle}>
          Phase 4 scaffold ready · min order {formatPrice(1000)}
        </Text>
      </View>
    </SafeAreaProvider>
  );
}

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
