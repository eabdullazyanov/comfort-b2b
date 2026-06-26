import {
  createStaticNavigation,
  type StaticParamList,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { CartScreen } from "../screens/CartScreen";
import { CatalogScreen } from "../screens/CatalogScreen";
import { ConfirmScreen } from "../screens/ConfirmScreen";

function renderLanguageSwitcher() {
  return <LanguageSwitcher />;
}

// Static navigation (React Navigation v7's recommended API): the param list is
// inferred from this config (see `RootStackParamList` below), so it can't drift
// from the actual screens. The config is created outside React and can't call
// `t()`, so localized header titles are set per-screen via `useScreenTitle`.
const RootStack = createNativeStackNavigator({
  screens: {
    Catalog: {
      screen: CatalogScreen,
      options: { headerRight: renderLanguageSwitcher },
    },
    Cart: { screen: CartScreen },
    Confirm: { screen: ConfirmScreen, options: { presentation: "modal" } },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  // Module augmentation can only be expressed as a `namespace`/empty interface;
  // this is React Navigation's documented global type-registration idiom, so it
  // makes `useNavigation()` typed everywhere without threading a generic through
  // each screen (no avoidable alternative — hence the scoped disables).
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
