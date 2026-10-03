"use client";

import { useEffect, useState } from "react";

import {
  offlineTokenUsage,
  parseTokenUsageResponse,
  type TokenUsageResponse,
} from "./token-usage";

const POLL_INTERVAL_MS = 60_000;

export function useTokenUsage() {
  const [usage, setUsage] = useState<TokenUsageResponse>(() => offlineTokenUsage());

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const refresh = async () => {
      try {
        const response = await fetch("/api/token-usage", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Token usage request failed");
        const next = parseTokenUsageResponse(await response.json());
        if (active) setUsage(next);
      } catch {
        if (active && !controller.signal.aborted) {
          setUsage(offlineTokenUsage());
        }
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return usage;
}
