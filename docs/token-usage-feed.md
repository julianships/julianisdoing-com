# Token usage feed operations

The counter combines the authorized fixed historical snapshot with measured post-capture evidence. It is a partial multi-source lower bound, not immutable source history or account-global history. It does not claim coverage for ordinary ChatGPT use, unavailable devices, deleted evidence that was never observed, or historical identity attribution that has not been independently established.

## Accounting contract

- The baseline is exactly `30,957,682,820`, captured at `2026-04-18T17:57:37Z`. That is the snapshot capture time, not an independently verified provider cutoff.
- Codex uses each `token_usage_record` response ID and its per-response `usage.total_tokens` when available. Stable response IDs deduplicate copied logs, changed timestamps, resumes, and inherited fork replay while preserving genuinely new child responses.
- Older spans without response records use one conservative cumulative high water per stable session. Repeated or alternate-predecessor snapshots add zero, and a counter decrease is flagged but never assumed to be a new paid epoch. Sessions crossing the baseline subtract their last observable pre-capture high water; if that anchor is unavailable, the first post-capture snapshot is excluded.
- Mixed sessions use legacy cumulative evidence only before the first response record. Forks subtract observable inherited legacy high water and ignore pre-fork replay records.
- The probe reads the canonical `state_5.sqlite` thread inventory, follows its selected rollout paths, also discovers active and archived orphan rollouts, and flags cumulative/SQLite reconciliation mismatches as incomplete coverage.
- Hermes uses cumulative `session_model_usage` rows keyed by the complete ledger identity. Copied databases merge by row high water. Canonical uncached input, cache-read, cache-write, and output buckets are disjoint; reasoning remains an output subset.
- Hermes ledger rows are attributed by their own exact `billing_provider='openai-codex'` route, including verified main and auxiliary tasks; they do not require optional gateway runtime metadata. MoA advisor/aggregator auxiliary rows are excluded because that usage is already represented by the main loop.
- Hermes session totals are used only for an exact OpenAI-Codex session route with no main model-ledger representation. A persisted fallback is retired as soon as main ledger rows appear, while multiple models and independent auxiliary tasks remain distinct.
- Hermes rows crossing the baseline are excluded because cumulative ledger rows do not reveal their post-capture portion. Ledger timestamps are used only as evidence bounds, never as daily allocation.

The chart appends one capture/high-water point to the preserved historical series. It does not fabricate daily or last-30-day usage.
Historical Hermes rows do not contain a credential-pool identity, so configured subscription pools are represented only as a combined lower bound, never an exact historical per-account split.

## Multi-host collection

Copy the example configuration to an ignored private file. Set `requiredSourceCount` to the authorized inventory size and define every independently polled runtime as a source; collection is rejected if the counts differ. A source must remain `attested: false` until the owner has reviewed its runtime/account scope. Unattested evidence is retained privately but excluded from the public total and reported as `unverified`. Keep private source IDs, hostnames, local paths, account inspection, and SSH details out of public files. Public labels must be contiguous generic `source-N` values.

The collector invokes a small Python probe locally or over SSH using configured argument arrays. It never constructs a shell command. Probe output uses gzip transport with bounded decompression to avoid slow historical-evidence transfers. The remote probe reads active and archived Codex rollouts plus selected Hermes databases and returns only hashes, timestamps, cumulative numeric counters, and diagnostics. Prompts, transcript content, instructions, paths, account identifiers, and credentials never leave the source host.

```bash
npm run token-usage:collect -- \
  --config .token-usage.config.json \
  --state .token-tracker-evidence/private-state.json \
  --output usage.json \
  --summary .token-tracker-evidence/collector-summary.json \
  --lock .token-tracker-evidence/collector.lock
```

Private state is written atomically with mode `0600`. It retains the last good source snapshot when a host is disconnected, a required schema is unavailable, or logs are archived, moved, or deleted. Missing/unreadable configured inputs and reconciliation mismatches produce an `incomplete` source rather than a fresh empty source. Recovery merges stable evidence, so it does not recount old usage. The lock rejects a live concurrent owner and safely recovers a dead owner by PID/process-start identity.

## Publishing and verification

The owner can publish only `usage.json` to a public Gist and configure the site with its HTTPS raw URL in `USAGE_FEED_URL`. A local scheduler may rerun the collector and update the same file without a model call.

The site API applies a five-second timeout, a 512 KiB size limit, strict unknown-field rejection, and no caching. The client polls every 60 seconds. Any incomplete, stale, unavailable, or unverified source makes the feed visibly stale while retained last-good evidence remains included. A missing or invalid feed falls back to the captured baseline and is labeled offline.

After owner-managed configuration and deployment, verify the aggregate-only endpoint, source freshness labels, stale-host retention, recovery, scheduler logs, and the rendered chart. Gist creation, environment changes, scheduler installation, deployment, and production verification remain owner operations.
