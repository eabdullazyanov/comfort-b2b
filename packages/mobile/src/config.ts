import { Platform } from "react-native";
import Config from "react-native-config";

import { makeMobileConfig } from "./makeMobileConfig";

/**
 * In dev builds, fall back to the platform-correct localhost so no `.env` is
 * needed for local development. In production `__DEV__` is false, so a missing
 * `API_BASE_URL` still throws at startup rather than silently defaulting.
 */
const devDefault = __DEV__
  ? Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000"
  : undefined;

export const config = makeMobileConfig({
  API_BASE_URL: Config.API_BASE_URL ?? devDefault,
});
