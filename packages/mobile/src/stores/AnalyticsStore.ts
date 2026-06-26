import { action, makeObservable, observable, runInAction } from "mobx";

import {
  type AnalyticsAck,
  type AnalyticsEvent,
} from "@comfort-b2b/shared/schemas";

import { ApiError } from "../ApiError";
import { toApiError } from "../toApiError";

import { type CartSnapshot } from "./CartStore";

type SendAnalytics = (event: AnalyticsEvent) => Promise<AnalyticsAck>;

export type DeliveryStatus = "pending" | "sending" | "success" | "failed";

/** One audited delivery attempt-set for a single tracked cart snapshot. */
export interface AnalyticsRecord {
  seq: number;
  event: AnalyticsEvent;
  status: DeliveryStatus;
  attempts: number;
  error: ApiError | undefined;
}

export interface AnalyticsOptions {
  debounceMs?: number;
  maxAttempts?: number;
  baseBackoffMs?: number;
}

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_BASE_BACKOFF_MS = 500;

/**
 * Reliable analytics delivery engine. Rapid cart edits are debounced into a
 * single event; events are delivered strictly in order through a sequential
 * queue with bounded exponential-backoff retry. A monotonic `seq` guards
 * `lastStatus` so a slow/retried older delivery can never clobber the status of
 * a newer one. The full denormalized product + option list is sent every time.
 */
export class AnalyticsStore {
  records: AnalyticsRecord[] = [];
  lastStatus: DeliveryStatus | undefined = undefined;

  private readonly send: SendAnalytics;
  private readonly debounceMs: number;
  private readonly maxAttempts: number;
  private readonly baseBackoffMs: number;

  private nextSeq = 1;
  private latestSeq = 0;
  private pending: CartSnapshot | undefined = undefined;
  private debounceTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  private queue: number[] = [];
  private processing = false;

  constructor(send: SendAnalytics, options: AnalyticsOptions = {}) {
    this.send = send;
    this.debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    // Only the audit log and the rolled-up status are observable; the queue,
    // counters, timers and injected `send` stay plain (mutated inside actions /
    // `runInAction`).
    makeObservable(this, {
      records: observable,
      lastStatus: observable,
      track: action,
      retry: action,
      dispose: action,
    });
  }

  /** Debounce a cart snapshot; the latest snapshot within the window wins. */
  track(snapshot: CartSnapshot): void {
    this.pending = snapshot;
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }

  /** Re-queue a previously failed event for another round of delivery. */
  retry(seq: number): void {
    const record = this.records.find((item) => item.seq === seq);
    if (record?.status !== "failed") {
      return;
    }
    record.status = "pending";
    record.error = undefined;
    this.enqueue(seq);
  }

  /** Cancels the pending debounce timer; call when tearing the store down. */
  dispose(): void {
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
  }

  private flush(): void {
    const snapshot = this.pending;
    this.pending = undefined;
    this.debounceTimer = undefined;
    if (snapshot === undefined) {
      return;
    }
    const seq = this.nextSeq;
    this.nextSeq += 1;
    this.latestSeq = seq;
    runInAction(() => {
      this.records.push({
        seq,
        event: {
          id: `evt-${String(seq)}`,
          createdAt: Date.now(),
          products: snapshot.products,
          options: snapshot.options,
          total: snapshot.total,
        },
        status: "pending",
        attempts: 0,
        error: undefined,
      });
      this.lastStatus = "pending";
    });
    this.enqueue(seq);
  }

  private enqueue(seq: number): void {
    this.queue.push(seq);
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }
    this.processing = true;
    while (this.queue.length > 0) {
      const seq = this.queue.shift();
      if (seq !== undefined) {
        await this.deliver(seq);
      }
    }
    this.processing = false;
  }

  private async deliver(seq: number): Promise<void> {
    const record = this.records.find((item) => item.seq === seq);
    if (record === undefined) {
      return;
    }
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      runInAction(() => {
        record.status = "sending";
        record.attempts = attempt;
        this.setLastStatus(seq, "sending");
      });
      try {
        await this.send(record.event);
        runInAction(() => {
          record.status = "success";
          record.error = undefined;
          this.setLastStatus(seq, "success");
        });
        return;
      } catch (error) {
        const apiError = toApiError(error);
        if (attempt >= this.maxAttempts) {
          runInAction(() => {
            record.status = "failed";
            record.error = apiError;
            this.setLastStatus(seq, "failed");
          });
          return;
        }
        runInAction(() => {
          record.error = apiError;
        });
        await this.delay(this.baseBackoffMs * 2 ** (attempt - 1));
      }
    }
  }

  /** Only the newest tracked event may set `lastStatus` (anti-stale guard). */
  private setLastStatus(seq: number, status: DeliveryStatus): void {
    if (seq >= this.latestSeq) {
      this.lastStatus = status;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
