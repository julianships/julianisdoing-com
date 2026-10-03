export const TOKEN_USAGE_BASELINE = Object.freeze({
  tokens: 30_957_682_820,
  capturedAt: "2026-04-18T17:57:37.000Z",
});

function asCount(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function timestamp(value) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rowTotal(row) {
  return asCount(row.input) + asCount(row.cacheRead)
    + asCount(row.cacheWrite) + asCount(row.output);
}

function mergeSession(target, incoming) {
  if (!target.startedAt || (incoming.startedAt && incoming.startedAt < target.startedAt)) {
    target.startedAt = incoming.startedAt;
  }
  if (!target.forkedFrom && incoming.forkedFrom) target.forkedFrom = incoming.forkedFrom;
}

function mergeResponse(target, incoming) {
  if (incoming.threadTotal !== null && incoming.threadTotal !== undefined
    && (target.threadTotal === undefined || String(incoming.at ?? "") <= String(target.at ?? ""))) {
    target.threadTotal = incoming.threadTotal;
  }
  if (String(incoming.at ?? "") < String(target.at ?? "")) {
    target.at = incoming.at;
    target.sessionKey = incoming.sessionKey;
  }
  const incomingTotal = asCount(incoming.total);
  const targetTotal = asCount(target.total);
  if (incomingTotal && (!targetTotal || incomingTotal < targetTotal)) target.total = incomingTotal;
}

function mergeHermesRows(rows, incomingRows) {
  for (const incoming of incomingRows ?? []) {
    const target = rows.get(incoming.key);
    if (!target || rowTotal(incoming) > rowTotal(target)
      || (rowTotal(incoming) === rowTotal(target)
        && String(incoming.lastSeen ?? "") > String(target.lastSeen ?? ""))) {
      rows.set(incoming.key, structuredClone(incoming));
    }
  }
  const representedSessions = new Set(
    [...rows.values()]
      .filter((row) => row.kind === "ledger" && row.taskKind === "main" && row.sessionKey)
      .map((row) => row.sessionKey),
  );
  for (const [key, row] of rows) {
    if (row.kind === "session-fallback" && representedSessions.has(row.sessionKey)) {
      rows.delete(key);
    }
  }
}

export function mergeProbeSnapshots(previous, current) {
  if (!previous) return structuredClone(current);
  const merged = structuredClone(previous);
  merged.schemaVersion = current.schemaVersion;
  merged.collectedAt = current.collectedAt;
  merged.stats = current.stats;
  merged.complete = current.complete;
  if (current.componentComplete !== undefined) {
    merged.componentComplete = structuredClone(current.componentComplete);
  } else {
    delete merged.componentComplete;
  }

  const sessions = new Map((merged.codexSessions ?? []).map((item) => [item.key, item]));
  for (const incoming of current.codexSessions ?? []) {
    const target = sessions.get(incoming.key);
    if (target) mergeSession(target, incoming);
    else sessions.set(incoming.key, structuredClone(incoming));
  }
  merged.codexSessions = [...sessions.values()];
  const transitions = new Map(
    (merged.codexTransitions ?? []).map((item) => [item.key, item]),
  );
  for (const incoming of current.codexTransitions ?? []) {
    transitions.set(incoming.key, structuredClone(incoming));
  }
  merged.codexTransitions = [...transitions.values()];

  const responses = new Map(
    (merged.codexResponses ?? []).map((item) => [item.key, item]),
  );
  for (const incoming of current.codexResponses ?? []) {
    const target = responses.get(incoming.key);
    if (target) mergeResponse(target, incoming);
    else responses.set(incoming.key, structuredClone(incoming));
  }
  merged.codexResponses = [...responses.values()];

  const rows = new Map(
    (previous.schemaVersion ?? 1) < 2 && current.componentComplete?.hermes
      ? []
      : (merged.hermesRows ?? []).map((item) => [item.key, item]),
  );
  mergeHermesRows(rows, current.hermesRows);
  merged.hermesRows = [...rows.values()];
  return merged;
}

export function mergeGlobalEvidence(sourceSnapshots) {
  const sessions = new Map();
  const transitions = new Map();
  const responses = new Map();
  const rows = new Map();
  for (const snapshot of sourceSnapshots) {
    for (const incoming of snapshot.codexSessions ?? []) {
      const target = sessions.get(incoming.key);
      if (target) mergeSession(target, incoming);
      else sessions.set(incoming.key, structuredClone(incoming));
    }
    for (const incoming of snapshot.codexTransitions ?? []) {
      transitions.set(incoming.key, structuredClone(incoming));
    }
    for (const incoming of snapshot.codexResponses ?? []) {
      const target = responses.get(incoming.key);
      if (target) mergeResponse(target, incoming);
      else responses.set(incoming.key, structuredClone(incoming));
    }
    mergeHermesRows(rows, snapshot.hermesRows);
  }
  return {
    codexSessions: sessions,
    codexTransitions: transitions,
    codexResponses: responses,
    hermesRows: rows,
  };
}

export function aggregateEvidence(evidence, cutoff = TOKEN_USAGE_BASELINE.capturedAt) {
  const cutoffTime = timestamp(cutoff);
  if (cutoffTime === null) throw new Error("Invalid snapshot cutoff");
  let codexTokens = 0;
  let hermesTokens = 0;
  let firstObservedAt = null;
  let lastObservedAt = null;
  let repeatedSnapshotsExcluded = 0;
  let replaySnapshotsExcluded = 0;
  let ambiguousCounterDecreases = 0;
  let ambiguousCrossCutoffSessions = 0;
  let ambiguousHermesRows = 0;

  const observe = (at) => {
    if (!at) return;
    if (firstObservedAt === null || at < firstObservedAt) firstObservedAt = at;
    if (lastObservedAt === null || at > lastObservedAt) lastObservedAt = at;
  };

  const earliestResponseBySession = new Map();
  const legacyCeilingBySession = new Map();
  for (const response of evidence.codexResponses?.values() ?? []) {
    const occurredAt = timestamp(response.at);
    const total = asCount(response.total);
    if (occurredAt === null || !total) continue;
    const existing = earliestResponseBySession.get(response.sessionKey);
    if (existing === undefined || occurredAt < existing) {
      earliestResponseBySession.set(response.sessionKey, occurredAt);
      if (response.threadTotal !== null && response.threadTotal !== undefined
        && asCount(response.threadTotal) >= total) {
        legacyCeilingBySession.set(response.sessionKey, asCount(response.threadTotal) - total);
      } else {
        legacyCeilingBySession.delete(response.sessionKey);
      }
    }
    if (occurredAt >= cutoffTime) {
      codexTokens += total;
      observe(new Date(occurredAt).toISOString());
    }
  }

  const snapshotsBySession = new Map();
  const logicalSnapshots = new Set();
  for (const transition of evidence.codexTransitions.values()) {
    const occurredAt = timestamp(transition.at);
    const total = asCount(transition.total);
    if (occurredAt === null || !total) continue;
    const logicalKey = `${transition.sessionKey}\0${occurredAt}\0${total}`;
    if (logicalSnapshots.has(logicalKey)) {
      repeatedSnapshotsExcluded += 1;
      continue;
    }
    logicalSnapshots.add(logicalKey);
    const list = snapshotsBySession.get(transition.sessionKey) ?? [];
    list.push({ at: occurredAt, total });
    snapshotsBySession.set(transition.sessionKey, list);
  }

  const maxSnapshotAt = (sessionKey, at) => {
    let maximum = null;
    for (const item of snapshotsBySession.get(sessionKey) ?? []) {
      if (item.at <= at && (maximum === null || item.total > maximum)) maximum = item.total;
    }
    return maximum;
  };

  for (const [sessionKey, session] of evidence.codexSessions) {
    const createdAt = timestamp(session.startedAt);
    const modernBoundary = earliestResponseBySession.get(sessionKey) ?? Infinity;
    const allSnapshots = (snapshotsBySession.get(sessionKey) ?? [])
      .sort((left, right) => left.at - right.at || left.total - right.total);
    const replayFloor = createdAt === null ? null : allSnapshots
      .filter((item) => item.at < createdAt)
      .reduce((maximum, item) => Math.max(maximum, item.total), 0) || null;
    const snapshots = allSnapshots.filter((item) => {
      if (item.at >= modernBoundary) return false;
      if (createdAt !== null && item.at < createdAt) {
        replaySnapshotsExcluded += 1;
        return false;
      }
      return true;
    }).map((item) => ({
      ...item,
      total: Math.min(item.total, legacyCeilingBySession.get(sessionKey) ?? Infinity),
    }));
    if (!snapshots.length) continue;

    let highWater = 0;
    if (session.forkedFrom && createdAt !== null) {
      highWater = Math.max(
        replayFloor ?? 0,
        maxSnapshotAt(session.forkedFrom, createdAt) ?? 0,
      );
    }
    const preCutoff = snapshots.filter((item) => item.at < cutoffTime);
    if (preCutoff.length) {
      highWater = Math.max(highWater, ...preCutoff.map((item) => item.total));
    } else if (createdAt === null || createdAt < cutoffTime) {
      const firstPostCutoff = snapshots.find((item) => item.at >= cutoffTime);
      if (firstPostCutoff) {
        highWater = Math.max(highWater, firstPostCutoff.total);
        ambiguousCrossCutoffSessions += 1;
      }
    }

    for (const item of snapshots) {
      if (item.at < cutoffTime) continue;
      if (item.total > highWater) {
        codexTokens += item.total - highWater;
        highWater = item.total;
        observe(new Date(item.at).toISOString());
      } else if (item.total === highWater) {
        repeatedSnapshotsExcluded += 1;
      } else {
        ambiguousCounterDecreases += 1;
      }
    }
  }

  for (const row of evidence.hermesRows.values()) {
    const firstSeen = timestamp(row.firstSeen);
    const lastSeen = timestamp(row.lastSeen);
    if (firstSeen === null || lastSeen === null || lastSeen < cutoffTime) continue;
    if (firstSeen < cutoffTime) {
      ambiguousHermesRows += 1;
      continue;
    }
    const total = rowTotal(row);
    if (!total) continue;
    hermesTokens += total;
    observe(row.firstSeen);
    observe(row.lastSeen);
  }

  return {
    tokens: codexTokens + hermesTokens,
    codexTokens,
    hermesTokens,
    firstObservedAt,
    lastObservedAt,
    diagnostics: {
      codexSessions: evidence.codexSessions.size,
      codexTransitions: evidence.codexTransitions.size,
      codexResponses: evidence.codexResponses?.size ?? 0,
      hermesRows: evidence.hermesRows.size,
      repeatedSnapshotsExcluded,
      replaySnapshotsExcluded,
      ambiguousCounterDecreases,
      ambiguousCrossCutoffSessions,
      ambiguousHermesRows,
    },
  };
}

export function buildFeed({ generatedAt = new Date().toISOString(), aggregate, sources }) {
  return {
    schemaVersion: 2,
    generatedAt,
    baseline: TOKEN_USAGE_BASELINE,
    observed: {
      tokens: aggregate.tokens,
      from: aggregate.firstObservedAt,
      through: aggregate.lastObservedAt,
      capturedAt: generatedAt,
      allocation: "capture-high-water",
      coverage: "partial-multi-source-lower-bound",
    },
    sources: sources.map((source) => ({
      label: source.publicLabel,
      status: source.status,
      lastSuccessfulAt: source.lastSuccessfulAt,
    })),
    totalTokens: TOKEN_USAGE_BASELINE.tokens + aggregate.tokens,
  };
}
