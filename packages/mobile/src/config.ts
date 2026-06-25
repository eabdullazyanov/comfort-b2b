import Config from "react-native-config";

import { makeMobileConfig } from "./makeMobileConfig";

/**
 * `API_BASE_URL` must be supplied via a native `.env` (read by
 * `react-native-config`); there is no default, so a missing/invalid value
 * throws at startup instead of silently pointing at the wrong host. The host's
 * `localhost` is reachable as `http://10.0.2.2:3000` from the Android emulator
 * and `http://localhost:3000` from the iOS simulator - set it accordingly per
 * build (see `packages/mobile/.env.example`).
 */
export const config = makeMobileConfig({ API_BASE_URL: Config.API_BASE_URL });
