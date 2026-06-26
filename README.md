# comfort-b2b

A Yarn 4 (Berry) TypeScript monorepo: a **shared zod-schema package** is the
single source of truth for all data crossing the wire, consumed by a **mock
Express backend** (which randomly returns typed errors) and a **React Native
CLI app** (MobX + react-native-paper + i18n EN/RU) that shops a 1000-item
catalog and confirms orders with a 1000 ₽ minimum.

## Layout

```
comfort-b2b/
├── packages/
│   ├── shared/    @comfort-b2b/shared  — zod schemas + inferred types, makeEnv, constants
│   ├── backend/   @comfort-b2b/backend — Express server with seedable random typed faults
│   └── mobile/    @comfort-b2b/mobile  — React Native CLI app (Metro, MobX, Paper, i18n)
├── tsconfig.base.json   strict TS config every workspace extends
├── eslint.config.ts     flat ESLint config (TS-checked, import/order, no-`as`, unicorn)
├── jest.config.ts       Jest (@swc/jest), co-located *.test.ts(x)
├── knip.json            dead-code / unused-dependency checks
└── README.md
```

Data flow: `shared` schemas → `backend` routes (validated before send) and
`mobile` api client (validated on receive) → HTTP between them.

## Architecture

- **zod as the single source of truth** (`@comfort-b2b/shared/schemas`): every boundary object is a zod schema paired with its `z.infer` type — backend and app can't drift.
- **Validate at every boundary**: the backend validates request bodies and re-parses responses before sending. The app re-parses every response with `safeParse` and maps error envelopes to a discriminated union keyed by `code`.
- **Seedable faults**: the backend's randomness is a seedable RNG, so each error branch is forceable in tests and reproducible by setting `SEED`.
- **MobX stores** (`packages/mobile/src/stores`) keep business logic out of components. All API functions are dependency-injected into the stores (composition root in `App.tsx`), so stores unit-test with mocks and never import React Native config.
- **`AnalyticsStore` is a reliable delivery queue**: rapid edits are debounced, events deliver in order through a sequential queue with bounded exponential-backoff retry, and a monotonic `seq` guards against stale retried deliveries.
- **Screens** (`packages/mobile/src/screens`) are thin `observer` views over stores — no business logic. The catalog is a virtualized 1000-item `FlatList` with `getItemLayout` + `memo(observer(ProductRow))` so only the edited row re-renders.

## Running locally

### Prerequisites

- **Node 22+** (`.nvmrc` pins 22; run `nvm use`).
- **Yarn 4** via Corepack — `corepack enable` (the repo pins `yarn@4.9.1`).
- For **mobile native builds** only:
  - Android: Android Studio + SDK + an emulator/device.
  - iOS (macOS): Xcode, plus Ruby/Bundler + CocoaPods (`gem install bundler`).

### Install & verify

```bash
corepack enable
yarn install
yarn check   # typecheck → lint → knip → test → format:check
```

### Start backend + app

```bash
# backend (watch mode)
yarn workspace @comfort-b2b/backend dev

# iOS (macOS): install CocoaPods once, then build + launch
yarn pods
yarn workspace @comfort-b2b/mobile ios

# Android: build + launch on a running emulator/device
yarn workspace @comfort-b2b/mobile android
```

**Reaching the backend from a device/emulator:** no setup needed for the iOS
simulator or Android emulator — the app picks the correct localhost URL
automatically (`localhost:3000` on iOS, `10.0.2.2:3000` on Android). To point at
a non-localhost backend (real device, staging), create
`packages/mobile/.env` with `API_BASE_URL=<url>` (see `.env.example`).
