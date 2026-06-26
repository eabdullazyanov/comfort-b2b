import { makeAutoObservable } from "mobx";

import { MIN_ORDER } from "@comfort-b2b/shared/constants";
import {
  type AnalyticsProduct,
  type OrderOption,
  type OrderPayload,
  type Product,
} from "@comfort-b2b/shared/schemas";

import { ORDER_OPTIONS } from "../orderOptions";

import { type CatalogStore } from "./CatalogStore";

/** A denormalized snapshot of the cart, fed to the analytics delivery queue. */
export interface CartSnapshot {
  products: AnalyticsProduct[];
  options: OrderOption[];
  total: number;
}

/**
 * The shopping cart: a `productId -> qty` map plus a set of selected option
 * ids. Prices/names are resolved on demand from the injected `CatalogStore`,
 * so the cart never stores stale product data.
 */
export class CartStore {
  readonly lines = new Map<string, number>();
  readonly selectedOptionIds = new Set<string>();

  private readonly catalog: CatalogStore;

  constructor(catalog: CatalogStore) {
    this.catalog = catalog;
    makeAutoObservable<CartStore, "catalog">(this, { catalog: false });
  }

  get lineItems(): { product: Product; qty: number }[] {
    const items: { product: Product; qty: number }[] = [];
    for (const [productId, qty] of this.lines) {
      const product = this.catalog.productById.get(productId);
      if (product !== undefined) {
        items.push({ product, qty });
      }
    }
    return items;
  }

  get itemCount(): number {
    let count = 0;
    for (const qty of this.lines.values()) {
      count += qty;
    }
    return count;
  }

  get total(): number {
    let sum = 0;
    for (const { product, qty } of this.lineItems) {
      sum += product.price * qty;
    }
    return sum;
  }

  get meetsMinimum(): boolean {
    return this.total >= MIN_ORDER;
  }

  get selectedOptions(): OrderOption[] {
    return ORDER_OPTIONS.filter((option) =>
      this.selectedOptionIds.has(option.id),
    );
  }

  /** Denormalized product+option payload recorded on every analytics event. */
  get snapshot(): CartSnapshot {
    return {
      products: this.lineItems.map(({ product, qty }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        qty,
      })),
      options: this.selectedOptions,
      total: this.total,
    };
  }

  /** Wire shape posted to `POST /orders`. */
  get orderPayload(): OrderPayload {
    return {
      lines: [...this.lines.entries()].map(([productId, qty]) => ({
        productId,
        qty,
      })),
      options: [...this.selectedOptionIds],
      total: this.total,
    };
  }

  /**
   * A primitive fingerprint of the cart that changes on any line/option edit;
   * the root reaction watches this to fire analytics exactly once per change.
   */
  get analyticsKey(): string {
    const lines = [...this.lines.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([productId, qty]) => `${productId}:${String(qty)}`)
      .join(",");
    const options = [...this.selectedOptionIds].sort().join(",");
    return `${lines}|${options}`;
  }

  setQty(productId: string, qty: number): void {
    if (qty <= 0) {
      this.lines.delete(productId);
      return;
    }
    this.lines.set(productId, qty);
  }

  addOne(productId: string): void {
    this.setQty(productId, (this.lines.get(productId) ?? 0) + 1);
  }

  removeOne(productId: string): void {
    this.setQty(productId, (this.lines.get(productId) ?? 0) - 1);
  }

  remove(productId: string): void {
    this.lines.delete(productId);
  }

  toggleOption(optionId: string): void {
    if (this.selectedOptionIds.has(optionId)) {
      this.selectedOptionIds.delete(optionId);
    } else {
      this.selectedOptionIds.add(optionId);
    }
  }

  clear(): void {
    this.lines.clear();
    this.selectedOptionIds.clear();
  }
}
