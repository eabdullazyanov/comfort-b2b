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

## Prerequisites

- **Node 22+** (`.nvmrc` pins 22; run `nvm use`).
- **Yarn 4** via Corepack — `corepack enable` (the repo pins `yarn@4.9.1`).
- For the **mobile native builds** only:
  - Android: Android Studio + SDK + an emulator/device.
  - iOS (macOS): Xcode, plus Ruby/Bundler + CocoaPods (`gem install bundler`).

## Install & verify

```bash
corepack enable
yarn install
yarn check   # typecheck → lint → knip → test → format:check (must be all green)
```

`yarn check` is the canonical "is everything OK" command and is what the Husky
`pre-commit` hook runs. Individual scripts also exist: `yarn typecheck`,
`yarn lint`, `yarn knip`, `yarn test`, `yarn format` / `yarn format:check`.

## Running the app

The backend and the app run as separate processes:

```bash
# backend (watch mode)
yarn workspace @comfort-b2b/backend dev

# iOS (macOS): install CocoaPods once, then build + launch
yarn pods
yarn workspace @comfort-b2b/mobile ios

# Android: build + launch on a running emulator/device
yarn workspace @comfort-b2b/mobile android
```

`react-native run-ios`/`run-android` start Metro automatically; run it on its own
with `yarn start` if you prefer.

**Reaching the backend from a device/emulator:** copy
`packages/mobile/.env.example` → `packages/mobile/.env` and set `API_BASE_URL`
(read by `react-native-config`, validated as a URL at startup — there is **no
default**, so a missing/invalid value fails fast). The host's `localhost` is
`http://10.0.2.2:3000` from the Android emulator and `http://localhost:3000`
from the iOS simulator, so set it accordingly per build.

## Backend API

The backend listens on `http://localhost:3000` by default and exposes:

| Method & path     | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `GET /catalog`    | 1000 generated products (zod-validated before send) |
| `POST /analytics` | accepts an `AnalyticsEvent`, returns `{ ok: true }` |
| `POST /orders`    | accepts an `OrderPayload`, returns `{ orderId }`    |

### Configuration & triggering the simulated errors

**Backend configuration is entirely optional** — the server starts with sane
defaults and zero env vars. To customize, copy `packages/backend/.env.example` →
`packages/backend/.env` and tweak (each var is optional and parsed/validated
with zod at boot):

| Variable                 | Effect / how to trigger an error                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `PORT`                   | Server port (default `3000`).                                                                             |
| `ANALYTICS_FAILURE_RATE` | Probability `[0–1]` that `POST /analytics` returns **503 SERVICE_UNAVAILABLE**. Set `1` to always fail.   |
| `ORDER_FAILURE_RATE`     | Probability `[0–1]` that `POST /orders` returns **503 SERVICE_UNAVAILABLE** (after deterministic checks). |
| `LATENCY_MS`             | Artificial latency added to every response.                                                               |
| `SEED`                   | Integer seed → deterministic catalog + failures (for reproducible testing).                               |

Deterministic errors (no env needed):

- **422 MIN_AMOUNT_NOT_REACHED** — send an order with `total < 1000`.
- **409 INSUFFICIENT_STOCK** — order a line whose `qty` exceeds the product's `stock`.
- **400 VALIDATION_ERROR** — send a body that fails the zod schema.

## Architecture rationale

- **zod as the single source of truth** (`@comfort-b2b/shared/schemas`): every
  boundary object is a zod schema paired with its `z.infer` type. The value and
  the type share one identifier, so backend and app can't drift.
- **Validate at every boundary**: the backend validates request bodies and
  re-parses responses before sending. The app re-parses every response with
  `safeParse` and maps error envelopes to a discriminated union keyed by `code`.
  On a success-shape mismatch the app is **resilient, not fatal** — it surfaces
  the validation error but still passes the payload through rather than throwing.
- **Seedable faults**: the backend's randomness is a seedable RNG, so each error
  branch is forceable in tests and reproducible by setting `SEED`.
- **MobX stores** (app, `packages/mobile/src/stores`) keep business logic out of
  components. `CatalogStore` loads the catalog; `CartStore` holds the
  `productId → qty` map + selected options and derives `total`/`meetsMinimum`/the
  analytics & order snapshots; `OrderStore` submits and clears the cart;
  `RootStore` wires them and runs a single `reaction` on the cart's
  `analyticsKey` so every cart/option change fires analytics. All API functions
  are **dependency-injected** into the stores (the composition root in `App.tsx`
  passes the real `apiClient`), so the stores unit-test with mocks and never
  import React Native config.
- **`AnalyticsStore` is a reliable delivery queue**: rapid edits are debounced
  into one event, events deliver strictly in order through a sequential queue
  with bounded exponential-backoff retry, a monotonic `seq` guards the rolled-up
  `lastStatus` against a stale/retried older delivery, and the full denormalized
  product+option list is sent every time. Failed events expose a manual `retry`.

## Conventions

Coding conventions (no-`as`, one-util-per-file, no barrels, import/order,
Prettier, the RN CommonJS exceptions, etc.) are defined and enforced in
`.cursor/rules/*.mdc` — that's the single source of truth, not this README.

## Status (delivered in reviewable phases)

| Phase | Scope                                              | State |
| ----- | -------------------------------------------------- | ----- |
| 1     | Monorepo infra + tooling                           | ✅    |
| 2     | `@comfort-b2b/shared` zod schemas + `makeEnv`      | ✅    |
| 3     | `@comfort-b2b/backend` Express + seedable faults   | ✅    |
| 4     | `@comfort-b2b/mobile` RN scaffold + Metro monorepo | ✅    |
| 5     | Mobile api client (axios + zod) + runtime config   | ✅    |
| 6     | MobX stores (catalog/cart/analytics/order)         | ✅    |
| 7     | i18n (EN + RU)                                     | ✅    |
| 8     | Screens (Catalog → Cart → Confirm)                 | ⏳    |
| 9     | Component tests + final polish                     | ⏳    |
