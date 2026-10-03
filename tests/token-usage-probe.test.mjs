import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function createCodexState(root, rows) {
  execFileSync("python3", ["-c", `
import sqlite3, sys, json
root, rows = sys.argv[1], json.loads(sys.argv[2])
c = sqlite3.connect(root + '/state_5.sqlite')
c.execute('create table threads (id text, rollout_path text, tokens_used integer)')
c.executemany('insert into threads values (?,?,?)', rows)
c.commit(); c.close()
`, root, JSON.stringify(rows)]);
}

test("probe discovers active and archived rollouts without emitting content", () => {
  const root = mkdtempSync(join(tmpdir(), "token-probe-"));
  mkdirSync(join(root, "sessions"));
  mkdirSync(join(root, "archived_sessions"));
  const rollout = (id, total, responseId) => [
    JSON.stringify({
      type: "token_usage_record", timestamp: "2026-05-01T00:59:00.000Z",
      payload: {
        response_id: responseId, session_id: id,
        usage: { total_tokens: total },
      },
    }),
    JSON.stringify({
      type: "session_meta",
      payload: {
        id, timestamp: "2026-05-01T00:00:00.000Z", model_provider: "openai",
        base_instructions: "must never leave the host",
      },
    }),
    JSON.stringify({
      type: "event_msg", timestamp: "2026-05-01T01:00:00.000Z",
      payload: { type: "token_count", info: { total_token_usage: { total_tokens: total } } },
    }),
  ].join("\n");
  const activePath = join(root, "sessions", "active.jsonl");
  const archivedPath = join(root, "archived_sessions", "archived.jsonl");
  writeFileSync(activePath, rollout("active", 100, "shared-response"));
  writeFileSync(archivedPath, rollout("archived", 200, "shared-response"));
  createCodexState(root, [
    ["active", activePath, 100], ["archived", archivedPath, 200],
  ]);
  const config = Buffer.from(JSON.stringify({
    codexHomes: [root], hermesDatabases: [],
  })).toString("base64url");
  const output = execFileSync("python3", ["scripts/token_usage_probe.py", config], {
    encoding: "utf8",
  });
  const parsed = JSON.parse(output);
  assert.equal(parsed.codexSessions.length, 2);
  assert.equal(parsed.codexResponses.length, 1);
  assert.equal(parsed.stats.codexFiles, 2);
  assert.equal(parsed.complete, true);
  assert.equal(output.includes("must never leave the host"), false);
  assert.equal(output.includes(root), false);
});

test("response lifetime totals reconcile despite a reduced context counter", () => {
  const root = mkdtempSync(join(tmpdir(), "token-context-counter-"));
  mkdirSync(join(root, "sessions"));
  const path = join(root, "sessions", "lifetime.jsonl");
  const records = [
    { type: "session_meta", payload: { id: "lifetime", timestamp: "2026-05-01T00:00:00Z", model_provider: "openai" } },
    { type: "token_usage_record", timestamp: "2026-05-01T01:00:00Z", payload: { response_id: "first", usage: { total_tokens: 100 }, thread_token_usage: { total_tokens: 100 } } },
    { type: "event_msg", timestamp: "2026-05-01T01:00:01Z", payload: { type: "token_count", info: { total_token_usage: { total_tokens: 100 } } } },
    { type: "token_usage_record", timestamp: "2026-05-01T02:00:00Z", payload: { response_id: "second", usage: { total_tokens: 30 }, thread_token_usage: { total_tokens: 130 } } },
    { type: "event_msg", timestamp: "2026-05-01T02:00:01Z", payload: { type: "token_count", info: { total_token_usage: { total_tokens: 30 } } } },
  ];
  writeFileSync(path, records.map((row) => JSON.stringify(row)).join("\n"));
  createCodexState(root, [["lifetime", path, 30]]);
  const config = Buffer.from(JSON.stringify({ codexHomes: [root], hermesDatabases: [] })).toString("base64url");
  const parsed = JSON.parse(execFileSync("python3", ["scripts/token_usage_probe.py", config], { encoding: "utf8" }));
  assert.equal(parsed.complete, true);
  assert.equal(parsed.codexResponses.reduce((sum, row) => sum + row.total, 0), 130);
});

test("probe marks missing configured sources incomplete instead of fresh-empty", () => {
  const config = Buffer.from(JSON.stringify({
    codexHomes: [join(tmpdir(), "definitely-missing-codex-home")],
    hermesDatabases: [join(tmpdir(), "definitely-missing-hermes.db")],
  })).toString("base64url");
  const parsed = JSON.parse(execFileSync(
    "python3", ["scripts/token_usage_probe.py", config], { encoding: "utf8" },
  ));
  assert.equal(parsed.complete, false);
  assert.equal(parsed.stats.completenessIssues, 2);
});

test("Hermes trusts ledger route attribution, excludes MoA, and only falls back by route", () => {
  const directory = mkdtempSync(join(tmpdir(), "token-hermes-probe-"));
  const database = join(directory, "state.db");
  execFileSync("python3", ["-c", `
import sqlite3, sys, json
db=sys.argv[1]; c=sqlite3.connect(db)
c.execute('create table session_model_usage (session_id text, model text, billing_provider text, billing_base_url text, billing_mode text, task text, input_tokens integer, output_tokens integer, cache_read_tokens integer, cache_write_tokens integer, reasoning_tokens integer, first_seen real, last_seen real)')
c.execute('create table sessions (id text, model text, billing_provider text, billing_base_url text, billing_mode text, input_tokens integer, output_tokens integer, cache_read_tokens integer, cache_write_tokens integer, reasoning_tokens integer, started_at real, ended_at real, last_activity_at real, model_config text)')
ledger=[
 ('ledger-session','gpt','openai-codex','url','subscription_included','',100,20,30,5,10,1770000000,1770000100),
 ('ledger-session','gpt','openai-codex','url','','background_review',40,10,5,0,5,1770000000,1770000100),
 ('ledger-session','gpt','openai-codex','url','','moa_aggregator',999,999,0,0,0,1770000000,1770000100),
 ('ledger-session','gpt','openai-codex','url','','unreviewed_task',999,999,0,0,0,1770000000,1770000100)]
c.executemany('insert into session_model_usage values (?,?,?,?,?,?,?,?,?,?,?,?,?)',ledger)
sessions=[
 ('ledger-session','gpt','openai-codex','url','subscription_included',999,999,0,0,0,1770000000,1770000100,1770000100,'{}'),
 ('fallback-session','gpt','openai-codex','url','subscription_included',50,10,5,0,5,1770000000,1770000100,1770000100,'{}'),
 ('other-session','gpt','other','url','',500,500,0,0,0,1770000000,1770000100,1770000100,'{}')]
c.executemany('insert into sessions values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',sessions)
c.commit(); c.close()
`, database]);
  const config = Buffer.from(JSON.stringify({
    codexHomes: [], hermesDatabases: [database],
  })).toString("base64url");
  const parsed = JSON.parse(execFileSync(
    "python3", ["scripts/token_usage_probe.py", config], { encoding: "utf8" },
  ));
  assert.equal(parsed.complete, false);
  assert.equal(parsed.hermesRows.length, 3);
  assert.deepEqual(
    parsed.hermesRows.map(({ kind }) => kind).sort(),
    ["ledger", "ledger", "session-fallback"],
  );
  assert.equal(parsed.stats.moaLedgerRowsExcluded, 1);
  assert.equal(parsed.stats.unverifiedHermesTaskRowsExcluded, 1);
});
