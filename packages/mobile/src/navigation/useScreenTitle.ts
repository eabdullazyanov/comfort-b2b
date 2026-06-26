import { type ParamListBase, useNavigation } from "@react-navigation/native";
import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLayoutEffect } from "react";

/**
 * Sets the native-stack header title from a (localized) string. Needed with the
 * static navigation API because the navigator config is built outside React and
 * can't call `t()` — so titles that must react to a language switch are set here
 * via `setOptions` (`useLayoutEffect` runs before paint, so there's no flash).
 */
export function useScreenTitle(title: string): void {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);
}
