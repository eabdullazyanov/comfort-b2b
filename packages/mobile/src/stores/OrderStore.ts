import { makeAutoObservable, runInAction } from "mobx";

import { type OrderAck, type OrderPayload } from "@comfort-b2b/shared/schemas";

import { ApiError } from "../ApiError";
import { toApiError } from "../toApiError";

import { type CartStore } from "./CartStore";

type SubmitOrder = (payload: OrderPayload) => Promise<OrderAck>;

/**
 * Submits the current cart as an order. On success the cart is cleared and the
 * order id retained; on failure the typed `ApiError` is kept so the UI can map
 * its `code` to a localized message (Phase 7) and offer a retry.
 */
export class OrderStore {
  submitting = false;
  lastError: ApiError | undefined = undefined;
  lastOrderId: string | undefined = undefined;

  private readonly cart: CartStore;
  private readonly submit: SubmitOrder;

  constructor(cart: CartStore, submit: SubmitOrder) {
    this.cart = cart;
    this.submit = submit;
    makeAutoObservable<OrderStore, "cart" | "submit">(this, {
      cart: false,
      submit: false,
    });
  }

  async placeOrder(): Promise<boolean> {
    runInAction(() => {
      this.submitting = true;
      this.lastError = undefined;
    });
    try {
      const ack = await this.submit(this.cart.orderPayload);
      runInAction(() => {
        this.lastOrderId = ack.orderId;
        this.submitting = false;
      });
      this.cart.clear();
      return true;
    } catch (error) {
      runInAction(() => {
        this.lastError = toApiError(error);
        this.submitting = false;
      });
      return false;
    }
  }
}
