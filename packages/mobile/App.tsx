import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

import { fetchCatalog, sendAnalytics, submitOrder } from "./src/apiClient";
import "./src/i18n/i18n";
import { Navigation } from "./src/navigation/AppNavigator";
import { RootStore } from "./src/stores/RootStore";
import { StoreContext } from "./src/stores/StoreContext";

enableScreens();

// Single composition root: the real API functions are injected here (keeping
// the stores out of the react-native-config import chain so they stay testable).
const store = new RootStore({ fetchCatalog, sendAnalytics, submitOrder });

function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <PaperProvider theme={isDarkMode ? MD3DarkTheme : MD3LightTheme}>
        <StoreContext.Provider value={store}>
          <Navigation />
        </StoreContext.Provider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
