#!/usr/bin/env node

import { gunzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  fstatSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  TOKEN_USAGE_BASELINE,
  aggregateEvidence,
  buildFeed,
  mergeGlobalEvidence,
  mergeProbeSnapshots,
} from "./token-usage-core.mjs";

const PROBE_PATH = fileURLToPath(new URL("./token_usage_probe.py", import.meta.url));
const SAFE_REMOTE_ARGUMENT = /^[A-Za-z0-9_./:@=+-]+$/;

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    if (!["--config", "--state", "--output", "--summary", "--lock"].includes(name)) {
      throw new Error(`Unknown argument: ${name}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
    values[name.slice(2)] = value;
    index += 1;
  }
  for (const required of ["config", "state", "output"]) {
    if (!values[required]) throw new Error(`--${required} is required`);
  }
  return values;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function validateConfig(config) {
  if (!config || !Number.isInteger(config.requiredSourceCount)
    || config.requiredSourceCount < 1 || !Array.isArray(config.sources)
    || config.sources.length !== config.requiredSourceCount) {
    throw new Error("Config sources must match requiredSourceCount");
  }
  const ids = new Set();
  const labels = new Set();
  for (const source of config.sources) {
    if (typeof source.id !== "string" || !source.id || ids.has(source.id)) {
      throw new Error("Each source requires a unique private id");
    }
    if (!/^source-[1-9][0-9]*$/.test(source.publicLabel) || labels.has(source.publicLabel)) {
      throw new Error("Each source requires a unique generic source-N publicLabel");
    }
    ids.add(source.id);
    labels.add(source.publicLabel);
    if (typeof source.attested !== "boolean") {
      throw new Error(`Source ${source.id} requires an explicit attested boolean`);
    }
    if (!Array.isArray(source.codexHomes) || !Array.isArray(source.hermesDatabases)) {
      throw new Error(`Source ${source.id} requires codexHomes and hermesDatabases arrays`);
    }
    if (!source.transport || !["local", "ssh"].includes(source.transport.type)) {
      throw new Error(`Source ${source.id} has an invalid transport`);
    }
    if (source.transport.type === "ssh") {
      for (const group of [source.transport.argv, source.transport.command]) {
        if (!Array.isArray(group) || !group.length || group.some(
          (value) => typeof value !== "string" || !SAFE_REMOTE_ARGUMENT.test(value)
        )) {
          throw new Error(`Source ${source.id} has unsafe SSH arguments`);
        }
      }
    }
  }
  for (let index = 1; index <= config.requiredSourceCount; index += 1) {
    if (!labels.has(`source-${index}`)) {
      throw new Error("Public source labels must be contiguous source-N values");
    }
  }
  return config;
}

function writePrivateJson(path, value) {
  const absolute = resolve(path);
  const temporary = join(dirname(absolute), `.${Date.now()}-${process.pid}.tmp`);
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, absolute);
}

function runProbe(source) {
  const payload = Buffer.from(JSON.stringify({
    codexHomes: source.codexHomes,
    hermesDatabases: source.hermesDatabases,
  })).toString("base64url");
  const timeout = Math.min(Math.max(Number(source.timeoutSeconds) || 120, 10), 900) * 1_000;
  let result;
  if (source.transport.type === "local") {
    result = spawnSync(source.transport.python ?? "python3", [PROBE_PATH, payload, "--gzip"], {
      maxBuffer: 64 * 1024 * 1024,
      timeout,
    });
  } else {
    const [executable, ...sshArguments] = source.transport.argv;
    result = spawnSync(
      executable,
      [...sshArguments, ...source.transport.command, payload, "--gzip"],
      {
        input: readFileSync(PROBE_PATH, "utf8"),
        maxBuffer: 64 * 1024 * 1024,
        timeout,
      },
    );
  }
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`probe exited ${result.status}: ${String(result.stderr).trim().slice(0, 240)}`);
  }
  const probe = JSON.parse(gunzipSync(result.stdout, {
    maxOutputLength: 128 * 1024 * 1024,
  }).toString("utf8"));
  if (probe.schemaVersion !== 2 || typeof probe.complete !== "boolean"
    || typeof probe.componentComplete?.codex !== "boolean"
    || typeof probe.componentComplete?.hermes !== "boolean"
    || !Array.isArray(probe.codexSessions)
    || !Array.isArray(probe.codexTransitions)
    || !Array.isArray(probe.codexResponses)
    || !Array.isArray(probe.hermesRows)) {
    throw new Error("probe returned an invalid schema");
  }
  return probe;
}

function processStartIdentity(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    const fields = stat.slice(stat.lastIndexOf(")") + 2).trim().split(/\s+/);
    if (fields[19]) return `proc:${fields[19]}`;
  } catch {}
  const result = spawnSync("ps", ["-o", "lstart=", "-p", String(pid)], {
    encoding: "utf8",
    timeout: 2_000,
  });
  const started = String(result.stdout ?? "").trim();
  return result.status === 0 && started ? `ps:${started}` : null;
}

function processIsLive(pid, expectedStart) {
  if (!Number.isSafeInteger(pid) || pid < 1) return false;
  try {
    process.kill(pid, 0);
  } catch (error) {
    if (error?.code === "ESRCH") return false;
    return true;
  }
  if (!expectedStart) return true;
  const actualStart = processStartIdentity(pid);
  return actualStart === null || actualStart === expectedStart;
}

function sameFile(path, identity) {
  try {
    const current = statSync(path);
    return current.dev === identity.dev && current.ino === identity.ino;
  } catch {
    return false;
  }
}

function acquireLock(path) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const descriptor = openSync(path, "wx", 0o600);
      const identity = fstatSync(descriptor);
      writeFileSync(descriptor, `${JSON.stringify({
        pid: process.pid,
        processStart: processStartIdentity(process.pid),
      })}\n`);
      return () => {
        closeSync(descriptor);
        if (sameFile(path, identity)) {
          try { unlinkSync(path); } catch {}
        }
      };
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      let descriptor;
      try {
        descriptor = openSync(path, "r");
        const identity = fstatSync(descriptor);
        const raw = readFileSync(descriptor, "utf8").trim();
        closeSync(descriptor);
        descriptor = undefined;
        let owner;
        try {
          owner = JSON.parse(raw);
          if (typeof owner === "number") owner = { pid: owner, processStart: null };
        } catch {
          owner = { pid: Number(raw), processStart: null };
        }
        if (processIsLive(Number(owner.pid), owner.processStart)) {
          throw new Error("Collector lock is held by a live process");
        }
        if (sameFile(path, identity)) unlinkSync(path);
      } finally {
        if (descriptor !== undefined) closeSync(descriptor);
      }
    }
  }
  throw new Error("Could not safely recover collector lock");
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const config = validateConfig(readJson(args.config));
  const stateLock = resolve(`${args.state}.lock`);
  const releaseLocks = [acquireLock(stateLock)];
  try {
    const extraLock = args.lock && resolve(args.lock);
    if (extraLock && extraLock !== stateLock) releaseLocks.push(acquireLock(extraLock));
    const priorState = existsSync(args.state)
      ? readJson(args.state)
      : { schemaVersion: 1, sources: {} };
    if (priorState.schemaVersion !== 1 || typeof priorState.sources !== "object") {
      throw new Error("Private state has an unsupported schema");
    }

    const nextState = structuredClone(priorState);
    const sourceStatuses = [];
    const failures = [];
    for (const source of config.sources) {
      const previous = nextState.sources[source.id];
      try {
        const current = runProbe(source);
        const snapshot = mergeProbeSnapshots(previous?.snapshot, current);
        nextState.sources[source.id] = {
          publicLabel: source.publicLabel,
          lastSuccessfulAt: current.collectedAt,
          snapshot,
        };
        sourceStatuses.push({
          publicLabel: source.publicLabel,
          status: !source.attested
            ? "unverified"
            : current.complete ? "fresh" : "incomplete",
          lastSuccessfulAt: current.collectedAt,
        });
      } catch (error) {
        failures.push({ publicLabel: source.publicLabel, error: String(error.message ?? error) });
        sourceStatuses.push({
          publicLabel: source.publicLabel,
          status: !source.attested
            ? "unverified"
            : previous?.snapshot ? "stale" : "unavailable",
          lastSuccessfulAt: previous?.lastSuccessfulAt ?? null,
        });
      }
    }

    nextState.updatedAt = new Date().toISOString();
    writePrivateJson(args.state, nextState);
    const snapshots = config.sources
      .map((source) => source.attested ? nextState.sources[source.id]?.snapshot : null)
      .filter(Boolean);
    const evidence = mergeGlobalEvidence(snapshots);
    const aggregate = aggregateEvidence(evidence, TOKEN_USAGE_BASELINE.capturedAt);
    const feed = buildFeed({
      generatedAt: nextState.updatedAt,
      aggregate,
      sources: sourceStatuses,
    });
    writePrivateJson(args.output, feed);

    const summary = {
      generatedAt: feed.generatedAt,
      baselineTokens: feed.baseline.tokens,
      observedTokens: feed.observed.tokens,
      totalTokens: feed.totalTokens,
      observedFrom: feed.observed.from,
      observedThrough: feed.observed.through,
      sourceStatusCounts: sourceStatuses.reduce((counts, source) => {
        counts[source.status] = (counts[source.status] ?? 0) + 1;
        return counts;
      }, {}),
      codexTokens: aggregate.codexTokens,
      hermesTokens: aggregate.hermesTokens,
      diagnostics: aggregate.diagnostics,
      probeFailures: failures.map(({ publicLabel }) => publicLabel),
    };
    if (args.summary) writePrivateJson(args.summary, summary);
    process.stdout.write(`${JSON.stringify(summary)}\n`);
  } finally {
    for (const release of releaseLocks.reverse()) release();
  }
}

try {
  await main();
} catch (error) {
  fail(String(error.message ?? error));
}
