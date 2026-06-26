import { type IReactionDisposer, reaction } from "mobx";

import {
  type AnalyticsAck,
  type AnalyticsEvent,
  type CatalogResponse,
  type OrderAck,
  type OrderPayload,
} from "@comfort-b2b/shared/schemas";

import { AnalyticsStore, type AnalyticsOptions } from "./AnalyticsStore";
import { CartStore } from "./CartStore";
import { CatalogStore } from "./CatalogStore";
import { OrderStore } from "./OrderStore";

/** The API surface the stores depend on; injected so they stay testable. */
interface ApiDeps {
  fetchCatalog: () => Promise<CatalogResponse>;
  sendAnalytics: (event: AnalyticsEvent) => Promise<AnalyticsAck>;
  submitOrder: (payload: OrderPayload) => Promise<OrderAck>;
}

/**
 * Composition root: builds and wires every store. A single `reaction` watches
 * the cart's `analyticsKey` and fires analytics on every cart/option change,
 * sending the full denormalized snapshot.
 */
export class RootStore {
  readonly catalog: CatalogStore;
  readonly cart: CartStore;
  readonly analytics: AnalyticsStore;
  readonly order: OrderStore;

  private readonly disposeReaction: IReactionDisposer;

  constructor(api: ApiDeps, analyticsOptions: AnalyticsOptions = {}) {
    this.catalog = new CatalogStore(api.fetchCatalog);
    this.cart = new CartStore(this.catalog);
    this.analytics = new AnalyticsStore(api.sendAnalytics, analyticsOptions);
    this.order = new OrderStore(this.cart, api.submitOrder);

    this.disposeReaction = reaction(
      () => this.cart.analyticsKey,
      () => {
        this.analytics.track(this.cart.snapshot);
      },
    );
  }

  dispose(): void {
    this.disposeReaction();
    this.analytics.dispose();
  }
}
