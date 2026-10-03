export const TOKEN_USAGE_BASELINE = {
  tokens: 30_957_682_820,
  capturedAt: "2026-04-18T17:57:37.000Z",
} as const;

export type TokenUsageSource = {
  label: string;
  status: "fresh" | "incomplete" | "stale" | "unavailable" | "unverified";
  lastSuccessfulAt: string | null;
};

export type TokenUsageFeed = {
  schemaVersion: 2;
  generatedAt: string;
  baseline: typeof TOKEN_USAGE_BASELINE;
  observed: {
    tokens: number;
    from: string | null;
    through: string | null;
    capturedAt: string;
    allocation: "capture-high-water";
    coverage: "partial-multi-source-lower-bound";
  };
  sources: TokenUsageSource[];
  totalTokens: number;
};

export type TokenUsageResponse = TokenUsageFeed & {
  sync: {
    status: "live" | "stale" | "offline";
    checkedAt: string;
  };
};

const TOP_LEVEL_KEYS = [
  "schemaVersion", "generatedAt", "baseline", "observed", "sources", "totalTokens",
] as const;
const BASELINE_KEYS = ["tokens", "capturedAt"] as const;
const OBSERVED_KEYS = [
  "tokens", "from", "through", "capturedAt", "allocation", "coverage",
] as const;
const SOURCE_KEYS = ["label", "status", "lastSuccessfulAt"] as const;
const RESPONSE_KEYS = [...TOP_LEVEL_KEYS, "sync"] as const;
const SYNC_KEYS = ["status", "checkedAt"] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(object: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(object).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function isSafeCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && Number.isFinite(Date.parse(value));
}

export function parseTokenUsageFeed(value: unknown): TokenUsageFeed {
  if (!isPlainObject(value) || !hasExactKeys(value, TOP_LEVEL_KEYS)) {
    throw new Error("Invalid token usage feed shape");
  }
  if (value.schemaVersion !== 2 || !isIsoTimestamp(value.generatedAt)) {
    throw new Error("Invalid token usage feed version or timestamp");
  }
  if (!isPlainObject(value.baseline) || !hasExactKeys(value.baseline, BASELINE_KEYS)
    || value.baseline.tokens !== TOKEN_USAGE_BASELINE.tokens
    || value.baseline.capturedAt !== TOKEN_USAGE_BASELINE.capturedAt) {
    throw new Error("Token usage baseline does not match the authorized snapshot");
  }
  if (!isPlainObject(value.observed) || !hasExactKeys(value.observed, OBSERVED_KEYS)
    || !isSafeCount(value.observed.tokens)
    || value.observed.allocation !== "capture-high-water"
    || value.observed.coverage !== "partial-multi-source-lower-bound"
    || !isIsoTimestamp(value.observed.capturedAt)
    || value.observed.capturedAt !== value.generatedAt
    || (value.observed.from !== null && !isIsoTimestamp(value.observed.from))
    || (value.observed.through !== null && !isIsoTimestamp(value.observed.through))) {
    throw new Error("Invalid observed token usage");
  }
  if (value.observed.tokens === 0) {
    if (value.observed.from !== null || value.observed.through !== null) {
      throw new Error("Empty observed usage must not claim a range");
    }
  } else if (value.observed.from === null || value.observed.through === null
    || Date.parse(value.observed.from) < Date.parse(TOKEN_USAGE_BASELINE.capturedAt)
    || Date.parse(value.observed.through) < Date.parse(value.observed.from)) {
    throw new Error("Observed usage range is inconsistent");
  }
  if (!Array.isArray(value.sources) || !value.sources.length) {
    throw new Error("Token usage sources are required");
  }
  const labels = new Set<string>();
  for (const source of value.sources) {
    if (!isPlainObject(source) || !hasExactKeys(source, SOURCE_KEYS)
      || typeof source.label !== "string" || !/^source-[1-9][0-9]*$/.test(source.label)
      || labels.has(source.label)
      || !["fresh", "incomplete", "stale", "unavailable", "unverified"].includes(String(source.status))
      || (source.lastSuccessfulAt !== null && !isIsoTimestamp(source.lastSuccessfulAt))
      || (source.status === "unavailable" && source.lastSuccessfulAt !== null)) {
      throw new Error("Invalid token usage source status");
    }
    labels.add(source.label);
  }
  if (!isSafeCount(value.totalTokens)
    || value.totalTokens !== TOKEN_USAGE_BASELINE.tokens + value.observed.tokens) {
    throw new Error("Token usage total is inconsistent");
  }
  return value as TokenUsageFeed;
}

export function parseTokenUsageResponse(value: unknown): TokenUsageResponse {
  if (!isPlainObject(value) || !hasExactKeys(value, RESPONSE_KEYS)) {
    throw new Error("Invalid token usage response shape");
  }
  const { sync, ...feedValue } = value;
  const feed = parseTokenUsageFeed(feedValue);
  if (!isPlainObject(sync) || !hasExactKeys(sync, SYNC_KEYS)
    || !["live", "stale", "offline"].includes(String(sync.status))
    || !isIsoTimestamp(sync.checkedAt)) {
    throw new Error("Invalid token usage sync state");
  }
  return { ...feed, sync } as TokenUsageResponse;
}

export function offlineTokenUsage(checkedAt = new Date().toISOString()): TokenUsageResponse {
  return {
    schemaVersion: 2,
    generatedAt: TOKEN_USAGE_BASELINE.capturedAt,
    baseline: TOKEN_USAGE_BASELINE,
    observed: {
      tokens: 0,
      from: null,
      through: null,
      capturedAt: TOKEN_USAGE_BASELINE.capturedAt,
      allocation: "capture-high-water",
      coverage: "partial-multi-source-lower-bound",
    },
    sources: [{ label: "source-1", status: "unavailable", lastSuccessfulAt: null }],
    totalTokens: TOKEN_USAGE_BASELINE.tokens,
    sync: { status: "offline", checkedAt },
  };
}
