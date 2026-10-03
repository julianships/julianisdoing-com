import { NextResponse } from "next/server";

import {
  offlineTokenUsage,
  parseTokenUsageFeed,
  type TokenUsageResponse,
} from "@/lib/token-usage";

export const dynamic = "force-dynamic";

const MAX_FEED_BYTES = 512 * 1024;
const STALE_AFTER_MS = 15 * 60 * 1000;
const CLOCK_SKEW_TOLERANCE_MS = 5 * 60 * 1000;

function json(response: TokenUsageResponse) {
  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const configuredUrl = process.env.USAGE_FEED_URL;

  try {
    if (!configuredUrl) return json(offlineTokenUsage(checkedAt));
    const url = new URL(configuredUrl);
    if (url.protocol !== "https:") throw new Error("Usage feed must use HTTPS");

    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error("Usage feed request failed");
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_FEED_BYTES) throw new Error("Usage feed is too large");
    const body = await response.text();
    if (Buffer.byteLength(body, "utf8") > MAX_FEED_BYTES) {
      throw new Error("Usage feed is too large");
    }

    const feed = parseTokenUsageFeed(JSON.parse(body));
    const age = Date.now() - Date.parse(feed.generatedAt);
    const sourceDegraded = feed.sources.some((source) => source.status !== "fresh");
    const status = sourceDegraded
      || age > STALE_AFTER_MS || age < -CLOCK_SKEW_TOLERANCE_MS
      ? "stale"
      : "live";
    return json({ ...feed, sync: { status, checkedAt } });
  } catch {
    return json(offlineTokenUsage(checkedAt));
  }
}
