import assert from "node:assert/strict";
import test from "node:test";

import {
  TOKEN_USAGE_BASELINE,
  aggregateEvidence,
  buildFeed,
  mergeGlobalEvidence,
  mergeProbeSnapshots,
} from "../scripts/token-usage-core.mjs";

const cutoff = TOKEN_USAGE_BASELINE.capturedAt;
const session = (key, snapshots, extra = {}) => ({
  key,
  startedAt: "2026-05-01T00:00:00.000Z",
  forkedFrom: null,
  snapshots,
  ...extra,
});
const snap = (at, total, ordinal = total) => ({ at, total, ordinal });
const probe = ({ sessions = [], responses = [], rows = [], collectedAt = "2026-10-03T00:00:00.000Z" } = {}) => {
  const transitions = [];
  const metadata = sessions.map(({ snapshots, ...item }) => {
    let previous = null;
    for (const current of snapshots) {
      const recordKey = `${item.key}:${current.at}:${current.ordinal}:${current.total}`;
      transitions.push({
        key: `${item.key}:${previous?.recordKey ?? "start"}:${recordKey}`,
        sessionKey: item.key,
        at: current.at,
        total: current.total,
        previousAt: previous?.at ?? null,
        previousTotal: previous?.total ?? null,
      });
      previous = { ...current, recordKey };
    }
    return item;
  });
  return {
    schemaVersion: 2,
    collectedAt,
    complete: true,
    componentComplete: { codex: true, hermes: true },
    codexSessions: metadata,
    codexTransitions: transitions,
    codexResponses: responses,
    hermesRows: rows,
    stats: {},
  };
};

test("uses cumulative high-water deltas and ignores repeated status snapshots", () => {
  const evidence = mergeGlobalEvidence([probe({ sessions: [session("a", [
    snap("2026-05-01T01:00:00.000Z", 100, 1),
    snap("2026-05-01T01:01:00.000Z", 100, 2),
    snap("2026-05-01T01:02:00.000Z", 145, 3),
  ])] })]);
  const result = aggregateEvidence(evidence, cutoff);
  assert.equal(result.codexTokens, 145);
  assert.equal(result.diagnostics.repeatedSnapshotsExcluded, 1);
});

test("deduplicates copied sessions across hosts but preserves independent equal usage", () => {
  const copied = session("same-stable-id", [snap("2026-05-01T01:00:00.000Z", 100)]);
  const independent = session("different-stable-id", [snap("2026-05-01T01:00:00.000Z", 100)]);
  const evidence = mergeGlobalEvidence([
    probe({ sessions: [copied] }),
    probe({ sessions: [structuredClone(copied), independent] }),
  ]);
  assert.equal(aggregateEvidence(evidence, cutoff).codexTokens, 200);
  assert.equal(evidence.codexSessions.size, 2);
});

test("uses one conservative high water for divergent legacy copies", () => {
  const shared = snap("2026-05-01T01:00:00.000Z", 100, 1);
  const left = session("shared-session", [
    shared,
    snap("2026-05-02T01:00:00.000Z", 150, 2),
  ]);
  const right = session("shared-session", [
    shared,
    snap("2026-05-02T02:00:00.000Z", 130, 3),
  ]);
  const result = aggregateEvidence(mergeGlobalEvidence([
    probe({ sessions: [left] }), probe({ sessions: [right] }),
  ]), cutoff);
  assert.equal(result.codexTokens, 150);
  assert.equal(result.diagnostics.ambiguousCounterDecreases, 1);
});

test("persists current component completeness across upgrades and recovery", () => {
  const legacy = { ...probe(), schemaVersion: 1 };
  delete legacy.componentComplete;
  const upgraded = mergeProbeSnapshots(legacy, probe());
  assert.deepEqual(upgraded.componentComplete, { codex: true, hermes: true });
  const incomplete = { ...probe(), complete: false, componentComplete: { codex: true, hermes: false } };
  const degraded = mergeProbeSnapshots(upgraded, incomplete);
  assert.deepEqual(degraded.componentComplete, incomplete.componentComplete);
  assert.notEqual(degraded.componentComplete, incomplete.componentComplete);
  const recovered = mergeProbeSnapshots(degraded, probe());
  assert.deepEqual(recovered.componentComplete, { codex: true, hermes: true });
  const missing = { ...probe(), complete: false };
  delete missing.componentComplete;
  assert.equal(mergeProbeSnapshots(recovered, missing).componentComplete, undefined);
});

test("retains disappeared records and merges recovery without recounting", () => {
  const first = probe({ sessions: [session("a", [snap("2026-05-01T01:00:00.000Z", 100)])] });
  const disconnectedLastGood = mergeProbeSnapshots(first, probe());
  assert.equal(disconnectedLastGood.codexSessions.length, 1);
  const recovered = mergeProbeSnapshots(disconnectedLastGood, probe({ sessions: [
    session("a", [
      snap("2026-05-01T01:00:00.000Z", 100),
      snap("2026-05-02T01:00:00.000Z", 160),
    ]),
  ] }));
  assert.equal(
    aggregateEvidence(mergeGlobalEvidence([recovered]), cutoff).codexTokens,
    160,
  );
});

test("subtracts fork inheritance and excludes replayed pre-fork snapshots", () => {
  const parent = session("parent", [snap("2026-05-01T01:00:00.000Z", 100)]);
  const child = session("child", [
    snap("2026-05-01T01:00:00.000Z", 100, 1),
    snap("2026-05-02T01:00:00.000Z", 130, 2),
  ], { startedAt: "2026-05-02T00:00:00.000Z", forkedFrom: "parent" });
  const result = aggregateEvidence(
    mergeGlobalEvidence([probe({ sessions: [parent, child] })]),
    cutoff,
  );
  assert.equal(result.codexTokens, 130);
  assert.equal(result.diagnostics.replaySnapshotsExcluded, 1);
});

test("does not assume a cumulative decrease is newly paid usage", () => {
  const result = aggregateEvidence(mergeGlobalEvidence([probe({ sessions: [session("a", [
    snap("2026-05-01T01:00:00.000Z", 100),
    snap("2026-05-01T02:00:00.000Z", 150),
    snap("2026-05-01T03:00:00.000Z", 20),
    snap("2026-05-01T04:00:00.000Z", 40),
  ])] })]), cutoff);
  assert.equal(result.codexTokens, 150);
  assert.equal(result.diagnostics.ambiguousCounterDecreases, 2);
});

test("does not count an early modern status snapshot as legacy usage", () => {
  const evidence = mergeGlobalEvidence([probe({
    sessions: [session("early-status", [snap("2026-05-01T01:00:00.000Z", 100)])],
    responses: [{ key: "first-response", sessionKey: "early-status", at: "2026-05-01T01:00:01.000Z", total: 100, threadTotal: 100 }],
  })]);
  assert.equal(aggregateEvidence(evidence, cutoff).codexTokens, 100);
});

test("deduplicates response usage despite changed timestamps", () => {
  const metadata = session("a", []);
  const result = aggregateEvidence(mergeGlobalEvidence([
    probe({ sessions: [metadata], responses: [{
      key: "response-1", sessionKey: "a", at: "2026-05-01T01:00:00.000Z", total: 40,
    }] }),
    probe({ sessions: [metadata], responses: [{
      key: "response-1", sessionKey: "a", at: "2026-05-01T01:01:00.000Z", total: 40,
    }] }),
  ]), cutoff);
  assert.equal(result.codexTokens, 40);
  assert.equal(result.diagnostics.codexResponses, 1);
});

test("deduplicates inherited fork responses and counts a new child response", () => {
  const parent = session("parent", []);
  const child = session("child", [], {
    startedAt: "2026-05-02T00:00:00.000Z", forkedFrom: "parent",
  });
  const result = aggregateEvidence(mergeGlobalEvidence([probe({
    sessions: [parent, child],
    responses: [
      { key: "shared-response", sessionKey: "parent", at: "2026-05-01T01:00:00.000Z", total: 100 },
      { key: "shared-response", sessionKey: "child", at: "2026-05-02T00:00:00.000Z", total: 100 },
      { key: "child-response", sessionKey: "child", at: "2026-05-02T01:00:00.000Z", total: 30 },
    ],
  })]), cutoff);
  assert.equal(result.codexTokens, 130);
});

test("uses legacy evidence only before a session's first response record", () => {
  const mixed = session("mixed", [
    snap("2026-05-01T01:00:00.000Z", 50),
    snap("2026-05-01T03:00:00.000Z", 90),
  ]);
  const result = aggregateEvidence(mergeGlobalEvidence([probe({
    sessions: [mixed],
    responses: [{
      key: "modern", sessionKey: "mixed", at: "2026-05-01T02:00:00.000Z", total: 40,
    }],
  })]), cutoff);
  assert.equal(result.codexTokens, 90);
});

test("allocates unique response evidence by its own cutoff timestamp", () => {
  const result = aggregateEvidence(mergeGlobalEvidence([probe({
    sessions: [session("crossing", [], { startedAt: "2026-04-18T16:00:00.000Z" })],
    responses: [
      { key: "before", sessionKey: "crossing", at: "2026-04-18T17:00:00.000Z", total: 80 },
      { key: "after", sessionKey: "crossing", at: "2026-04-18T18:30:00.000Z", total: 30 },
    ],
  })]), cutoff);
  assert.equal(result.codexTokens, 30);
});

test("subtracts pre-snapshot cumulative usage for a crossing session", () => {
  const result = aggregateEvidence(mergeGlobalEvidence([probe({ sessions: [session("a", [
    snap("2026-04-18T17:00:00.000Z", 80),
    snap("2026-04-18T18:30:00.000Z", 120),
  ], { startedAt: "2026-04-18T16:00:00.000Z" })] })]), cutoff);
  assert.equal(result.codexTokens, 40);
});

test("anchors an unobservable cross-cutoff session conservatively", () => {
  const result = aggregateEvidence(mergeGlobalEvidence([probe({ sessions: [session("a", [
    snap("2026-04-18T18:30:00.000Z", 120),
    snap("2026-04-18T19:00:00.000Z", 150),
  ], { startedAt: "2026-04-18T16:00:00.000Z" })] })]), cutoff);
  assert.equal(result.codexTokens, 30);
  assert.equal(result.diagnostics.ambiguousCrossCutoffSessions, 1);
});

test("Hermes uses canonical disjoint buckets and copied-row high water", () => {
  const row = {
    sessionKey: "session-a", taskKind: "main",
    key: "ledger-row", firstSeen: "2026-05-01T00:00:00.000Z",
    lastSeen: "2026-05-02T00:00:00.000Z", input: 100, cacheRead: 80,
    cacheWrite: 5, output: 30, reasoning: 20, kind: "ledger",
  };
  const larger = { ...row, input: 120, lastSeen: "2026-05-03T00:00:00.000Z" };
  const result = aggregateEvidence(mergeGlobalEvidence([
    probe({ rows: [row] }), probe({ rows: [larger] }),
  ]), cutoff);
  assert.equal(result.hermesTokens, 235);
  assert.equal(result.diagnostics.hermesRows, 1);
});

test("retires a persisted session fallback when main ledger rows appear", () => {
  const fallback = {
    key: "fallback", sessionKey: "session-a", taskKind: "main", kind: "session-fallback",
    firstSeen: "2026-05-01T00:00:00.000Z", lastSeen: "2026-05-01T01:00:00.000Z",
    input: 100, output: 10, cacheRead: 0, cacheWrite: 0, reasoning: 0,
  };
  const mainA = {
    ...fallback, key: "main-a", kind: "ledger", input: 70, output: 10,
  };
  const mainB = {
    ...fallback, key: "main-b", kind: "ledger", input: 30, output: 5,
  };
  const auxiliary = {
    ...fallback, key: "aux", kind: "ledger", taskKind: "auxiliary", input: 20, output: 5,
  };
  const retained = mergeProbeSnapshots(
    probe({ rows: [fallback] }),
    probe({ rows: [mainA, mainB, auxiliary] }),
  );
  const evidence = mergeGlobalEvidence([
    retained,
    probe({ rows: [{ ...mainA, input: 60 }] }),
  ]);
  assert.equal(evidence.hermesRows.has("fallback"), false);
  assert.equal(aggregateEvidence(evidence, cutoff).hermesTokens, 140);
});

test("retains last-good Hermes rows when a replacement schema is incomplete", () => {
  const row = {
    key: "last-good", firstSeen: "2026-05-01T00:00:00.000Z",
    lastSeen: "2026-05-01T01:00:00.000Z", input: 100, output: 10,
    cacheRead: 0, cacheWrite: 0, reasoning: 0, kind: "ledger",
  };
  const previous = { ...probe({ rows: [row] }), schemaVersion: 1 };
  const current = {
    ...probe(), complete: false, componentComplete: { codex: true, hermes: false },
  };
  const merged = mergeProbeSnapshots(previous, current);
  assert.equal(merged.hermesRows.length, 1);
  assert.equal(aggregateEvidence(mergeGlobalEvidence([merged]), cutoff).hermesTokens, 110);
});

test("excludes Hermes rows whose post-snapshot portion cannot be isolated", () => {
  const row = {
    key: "crossing-row", firstSeen: "2026-04-01T00:00:00.000Z",
    lastSeen: "2026-05-01T00:00:00.000Z", input: 100, cacheRead: 0,
    cacheWrite: 0, output: 10, kind: "ledger",
  };
  const result = aggregateEvidence(mergeGlobalEvidence([probe({ rows: [row] })]), cutoff);
  assert.equal(result.hermesTokens, 0);
  assert.equal(result.diagnostics.ambiguousHermesRows, 1);
});

test("builds a capture-allocated feed with generic source freshness", () => {
  const feed = buildFeed({
    generatedAt: "2026-10-03T01:00:00.000Z",
    aggregate: {
      tokens: 50,
      firstObservedAt: "2026-05-01T00:00:00.000Z",
      lastObservedAt: "2026-10-03T00:00:00.000Z",
    },
    sources: [
      { publicLabel: "source-1", status: "fresh", lastSuccessfulAt: "2026-10-03T01:00:00.000Z" },
      { publicLabel: "source-2", status: "stale", lastSuccessfulAt: "2026-10-02T01:00:00.000Z" },
    ],
  });
  assert.equal(feed.totalTokens, TOKEN_USAGE_BASELINE.tokens + 50);
  assert.equal(feed.observed.allocation, "capture-high-water");
  assert.deepEqual(feed.sources.map(({ status }) => status), ["fresh", "stale"]);
});
