import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import {
  type AnalyticsAck,
  type AnalyticsEvent,
} from "@comfort-b2b/shared/schemas";

import { ApiError } from "../ApiError";

import { AnalyticsStore } from "./AnalyticsStore";
import { type CartSnapshot } from "./CartStore";

type Send = (event: AnalyticsEvent) => Promise<AnalyticsAck>;

const SNAPSHOT: CartSnapshot = {
  products: [{ id: "p1", name: "Classic Chair", price: 500, qty: 2 }],
  options: [{ id: "express_delivery", label: "Express delivery" }],
  total: 1000,
};

function ack(): Promise<AnalyticsAck> {
  return Promise.resolve<AnalyticsAck>({ ok: true });
}

function unavailable(): Promise<AnalyticsAck> {
  return Promise.reject(
    new ApiError({ code: "SERVICE_UNAVAILABLE", message: "down" }),
  );
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("AnalyticsStore", () => {
  it("debounces then delivers the full snapshot once", async () => {
    const send = jest.fn<Send>(() => ack());
    const store = new AnalyticsStore(send, {
      debounceMs: 300,
      baseBackoffMs: 100,
      maxAttempts: 3,
    });

    store.track(SNAPSHOT);
    await jest.advanceTimersByTimeAsync(150);
    store.track(SNAPSHOT);
    await jest.advanceTimersByTimeAsync(300);

    expect(send).toHaveBeenCalledTimes(1);
    const event = send.mock.calls[0]?.[0];
    expect(event?.products).toEqual(SNAPSHOT.products);
    expect(event?.options).toEqual(SNAPSHOT.options);
    expect(event?.total).toBe(1000);
    expect(store.records).toHaveLength(1);
    expect(store.records[0]?.status).toBe("success");
    expect(store.lastStatus).toBe("success");
  });

  it("retries with exponential backoff until it succeeds", async () => {
    let attempts = 0;
    const send = jest.fn<Send>(() => {
      attempts += 1;
      return attempts < 3 ? unavailable() : ack();
    });
    const store = new AnalyticsStore(send, {
      debounceMs: 300,
      baseBackoffMs: 100,
      maxAttempts: 5,
    });

    store.track(SNAPSHOT);
    await jest.advanceTimersByTimeAsync(300); // attempt 1 fails -> backoff 100ms
    await jest.advanceTimersByTimeAsync(100); // attempt 2 fails -> backoff 200ms
    await jest.advanceTimersByTimeAsync(200); // attempt 3 succeeds

    expect(send).toHaveBeenCalledTimes(3);
    expect(store.records[0]?.status).toBe("success");
    expect(store.records[0]?.attempts).toBe(3);
    expect(store.lastStatus).toBe("success");
  });

  it("marks an event failed after exhausting attempts, then retries manually", async () => {
    let ok = false;
    const send = jest.fn<Send>(() => (ok ? ack() : unavailable()));
    const store = new AnalyticsStore(send, {
      debounceMs: 300,
      baseBackoffMs: 100,
      maxAttempts: 2,
    });

    store.track(SNAPSHOT);
    await jest.advanceTimersByTimeAsync(300); // attempt 1 fails -> backoff 100ms
    await jest.advanceTimersByTimeAsync(100); // attempt 2 fails -> failed

    expect(store.records[0]?.status).toBe("failed");
    expect(store.lastStatus).toBe("failed");
    expect(send).toHaveBeenCalledTimes(2);

    ok = true;
    store.retry(1);
    await jest.advanceTimersByTimeAsync(0);

    expect(store.records[0]?.status).toBe("success");
    expect(store.lastStatus).toBe("success");
  });

  it("never lets a stale retried delivery clobber a newer event's status", async () => {
    const send = jest.fn<Send>((event) =>
      event.id === "evt-1" ? unavailable() : ack(),
    );
    const store = new AnalyticsStore(send, {
      debounceMs: 300,
      baseBackoffMs: 100,
      maxAttempts: 1,
    });

    store.track(SNAPSHOT);
    await jest.advanceTimersByTimeAsync(300); // evt-1 fails
    expect(store.lastStatus).toBe("failed");

    store.track({ ...SNAPSHOT, total: 2000 });
    await jest.advanceTimersByTimeAsync(300); // evt-2 succeeds
    expect(store.lastStatus).toBe("success");

    store.retry(1); // re-deliver the old failed event (still fails)
    await jest.advanceTimersByTimeAsync(0);

    expect(store.records.find((r) => r.seq === 1)?.status).toBe("failed");
    expect(store.lastStatus).toBe("success");
  });
});
