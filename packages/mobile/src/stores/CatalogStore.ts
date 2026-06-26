import { makeAutoObservable, runInAction } from "mobx";

import {
  type CatalogResponse,
  type Product,
} from "@comfort-b2b/shared/schemas";

import { ApiError } from "../ApiError";
import { toApiError } from "../toApiError";

type FetchCatalog = () => Promise<CatalogResponse>;

/**
 * Loads and holds the product catalog. The fetcher is injected (rather than
 * importing `apiClient` directly) so the store stays decoupled from React
 * Native wiring and is trivially unit-testable with a mock.
 */
export class CatalogStore {
  products: Product[] = [];
  loading = false;
  error: ApiError | undefined = undefined;

  private readonly fetch: FetchCatalog;

  constructor(fetch: FetchCatalog) {
    this.fetch = fetch;
    makeAutoObservable<CatalogStore, "fetch">(this, { fetch: false });
  }

  /** Indexed lookup used by the cart to denormalize lines into prices/names. */
  get productById(): Map<string, Product> {
    return new Map(this.products.map((product) => [product.id, product]));
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.loading = true;
      this.error = undefined;
    });
    try {
      const products = await this.fetch();
      runInAction(() => {
        this.products = products;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = toApiError(error);
        this.loading = false;
      });
    }
  }
}
