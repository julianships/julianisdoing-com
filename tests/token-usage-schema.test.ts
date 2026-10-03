import assert from "node:assert/strict";
import test from "node:test";

import {
  TOKEN_USAGE_BASELINE,
  parseTokenUsageFeed,
  parseTokenUsageResponse,
} from "../src/lib/token-usage.ts";

const validFeed = {
  schemaVersion: 2,
  generatedAt: "2026-10-03T12:00:00.000Z",
  baseline: TOKEN_USAGE_BASELINE,
  observed: {
    tokens: 123,
    from: "2026-05-01T00:00:00.000Z",
    through: "2026-10-03T11:59:00.000Z",
    capturedAt: "2026-10-03T12:00:00.000Z",
    allocation: "capture-high-water",
    coverage: "partial-multi-source-lower-bound",
  },
  sources: [
    { label: "source-1", status: "fresh", lastSuccessfulAt: "2026-10-03T12:00:00.000Z" },
    { label: "source-2", status: "stale", lastSuccessfulAt: "2026-10-02T12:00:00.000Z" },
    { label: "source-3", status: "incomplete", lastSuccessfulAt: "2026-10-03T11:00:00.000Z" },
  ],
  totalTokens: TOKEN_USAGE_BASELINE.tokens + 123,
} as const;

test("accepts the aggregate-only capture schema", () => {
  assert.deepEqual(parseTokenUsageFeed(validFeed), validFeed);
});

test("rejects changed baseline, inconsistent totals, or daily allocation", () => {
  assert.throws(() => parseTokenUsageFeed({
    ...validFeed,
    baseline: { ...TOKEN_USAGE_BASELINE, tokens: 1 },
  }));
  assert.throws(() => parseTokenUsageFeed({ ...validFeed, totalTokens: 7 }));
  assert.throws(() => parseTokenUsageFeed({
    ...validFeed,
    observed: { ...validFeed.observed, daily: [] },
  }));
});

test("rejects identity-like source labels and unknown fields", () => {
  assert.throws(() => parseTokenUsageFeed({ ...validFeed, account: "not-public" }));
  assert.throws(() => parseTokenUsageFeed({
    ...validFeed,
    sources: [{
      label: "named-host",
      status: "fresh",
      lastSuccessfulAt: "2026-10-03T12:00:00.000Z",
    }],
  }));
});

test("requires honest source status and observed range", () => {
  assert.throws(() => parseTokenUsageFeed({
    ...validFeed,
    observed: { ...validFeed.observed, from: null },
  }));
  assert.throws(() => parseTokenUsageFeed({
    ...validFeed,
    sources: [{ label: "source-1", status: "unavailable", lastSuccessfulAt: "2026-10-03T12:00:00.000Z" }],
  }));
});

test("validates the API sync envelope without widening fields", () => {
  const response = {
    ...validFeed,
    sync: { status: "stale", checkedAt: "2026-10-03T12:00:01.000Z" },
  };
  assert.deepEqual(parseTokenUsageResponse(response), response);
  assert.throws(() => parseTokenUsageResponse({
    ...response,
    sync: { ...response.sync, detail: "not-public" },
  }));
});
