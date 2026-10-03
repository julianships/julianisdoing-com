import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function createCodexState(home, rolloutPath, tokens) {
  execFileSync("python3", ["-c", `
import sqlite3, sys
db, path, tokens = sys.argv[1], sys.argv[2], int(sys.argv[3])
c=sqlite3.connect(db)
c.execute('create table if not exists threads (id text primary key, rollout_path text, tokens_used integer)')
c.execute('insert or replace into threads values (?,?,?)',('stable-session',path,tokens))
c.commit(); c.close()
`, join(home, "state_5.sqlite"), rolloutPath, String(tokens)]);
}

function rollout(total, includeSecond = false) {
  const records = [
    {
      type: "session_meta",
      payload: {
        id: "stable-session",
        timestamp: "2026-05-01T00:00:00.000Z",
        model_provider: "openai",
      },
    },
    {
      type: "event_msg",
      timestamp: "2026-05-01T01:00:00.000Z",
      payload: { type: "token_count", info: { total_token_usage: { total_tokens: total } } },
    },
  ];
  if (includeSecond) records.push({
    type: "event_msg",
    timestamp: "2026-05-02T01:00:00.000Z",
    payload: { type: "token_count", info: { total_token_usage: { total_tokens: 150 } } },
  });
  return `${records.map(JSON.stringify).join("\n")}\n`;
}

test("collector retains a disconnected source and recovers without recounting", () => {
  const directory = mkdtempSync(join(tmpdir(), "token-collector-"));
  const codexHome = join(directory, "codex");
  mkdirSync(join(codexHome, "sessions"), { recursive: true });
  const rolloutPath = join(codexHome, "sessions", "rollout.jsonl");
  writeFileSync(rolloutPath, rollout(100));
  createCodexState(codexHome, rolloutPath, 100);
  const configPath = join(directory, "config.json");
  const statePath = join(directory, "state.json");
  const outputPath = join(directory, "feed.json");
  const config = {
    requiredSourceCount: 2,
    sources: [
      {
        id: "private-a",
        publicLabel: "source-1",
        attested: true,
        transport: { type: "local", python: "python3" },
        codexHomes: [codexHome],
        hermesDatabases: [],
      },
      {
        id: "private-b",
        publicLabel: "source-2",
        attested: true,
        transport: { type: "local", python: "definitely-not-a-python" },
        codexHomes: [],
        hermesDatabases: [],
      },
    ],
  };
  const run = () => execFileSync("node", [
    "scripts/collect-token-usage.mjs",
    "--config", configPath,
    "--state", statePath,
    "--output", outputPath,
  ], { encoding: "utf8" });

  writeFileSync(configPath, JSON.stringify(config));
  run();
  let feed = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(feed.observed.tokens, 100);
  assert.deepEqual(feed.sources.map(({ status }) => status), ["fresh", "unavailable"]);

  config.sources[0].transport.python = "definitely-not-a-python";
  writeFileSync(configPath, JSON.stringify(config));
  run();
  feed = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(feed.observed.tokens, 100);
  assert.deepEqual(feed.sources.map(({ status }) => status), ["stale", "unavailable"]);

  config.sources[0].transport.python = "python3";
  writeFileSync(rolloutPath, rollout(100, true));
  createCodexState(codexHome, rolloutPath, 150);
  writeFileSync(configPath, JSON.stringify(config));
  run();
  feed = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(feed.observed.tokens, 150);
  assert.deepEqual(feed.sources.map(({ status }) => status), ["fresh", "unavailable"]);
});

test("collector reports an incomplete probe and recovers a dead-owner lock", () => {
  const directory = mkdtempSync(join(tmpdir(), "token-collector-lock-"));
  const configPath = join(directory, "config.json");
  const statePath = join(directory, "state.json");
  const outputPath = join(directory, "feed.json");
  const lockPath = join(directory, "collector.lock");
  writeFileSync(configPath, JSON.stringify({
    requiredSourceCount: 1,
    sources: [{
      id: "private-a", publicLabel: "source-1", attested: true,
      transport: { type: "local", python: "python3" },
      codexHomes: [join(directory, "missing")], hermesDatabases: [],
    }],
  }));
  writeFileSync(lockPath, JSON.stringify({ pid: 99999999, processStart: "dead" }));
  execFileSync("node", [
    "scripts/collect-token-usage.mjs", "--config", configPath,
    "--state", statePath, "--output", outputPath, "--lock", lockPath,
  ]);
  const feed = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(feed.sources[0].status, "incomplete");
  assert.equal(existsSync(lockPath), false);
});

test("collector never removes a live owner's lock", () => {
  const directory = mkdtempSync(join(tmpdir(), "token-collector-live-lock-"));
  const configPath = join(directory, "config.json");
  const statePath = join(directory, "state.json");
  const outputPath = join(directory, "feed.json");
  const lockPath = join(directory, "collector.lock");
  writeFileSync(configPath, JSON.stringify({ requiredSourceCount: 1, sources: [{
    id: "private-a", publicLabel: "source-1", attested: true,
    transport: { type: "local", python: "python3" }, codexHomes: [], hermesDatabases: [],
  }] }));
  writeFileSync(lockPath, `${process.pid}\n`);
  const result = spawnSync("node", [
    "scripts/collect-token-usage.mjs", "--config", configPath,
    "--state", statePath, "--output", outputPath, "--lock", lockPath,
  ], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /live process/);
  assert.equal(existsSync(lockPath), true);
});
