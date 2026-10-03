#!/usr/bin/env python3
"""Emit compact, content-free token accounting evidence for one host."""

import base64
import datetime
import hashlib
import json
import os
import sqlite3
import sys

VERIFIED_HERMES_TASKS = {
    "", "approval", "background_review", "compression", "goal_judge",
    "title_generation", "vision",
}


def stable_hash(*parts):
    digest = hashlib.sha256()
    for part in parts:
        digest.update(str(part or "").encode("utf-8"))
        digest.update(b"\0")
    return digest.hexdigest()


def iso_from_epoch(value):
    if value is None:
        return None
    try:
        return datetime.datetime.fromtimestamp(
            float(value), datetime.timezone.utc
        ).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    except (TypeError, ValueError, OverflowError):
        return None


def nonnegative_int(value):
    try:
        number = int(value or 0)
        return number if number >= 0 else 0
    except (TypeError, ValueError, OverflowError):
        return 0


def row_total(row):
    return sum(nonnegative_int(row.get(key)) for key in (
        "input", "output", "cacheRead", "cacheWrite"
    ))


def note_issue(stats, name):
    stats[name] = stats.get(name, 0) + 1
    stats["completenessIssues"] += 1


def merge_codex_session(target, incoming):
    if not target.get("startedAt") or (
        incoming.get("startedAt") and incoming["startedAt"] < target["startedAt"]
    ):
        target["startedAt"] = incoming.get("startedAt")
    if not target.get("forkedFrom") and incoming.get("forkedFrom"):
        target["forkedFrom"] = incoming["forkedFrom"]


def load_thread_inventory(home, stats):
    path = os.path.join(home, "state_5.sqlite")
    if not os.path.isfile(path):
        note_issue(stats, "missingCodexStateDatabases")
        return {}
    try:
        connection = sqlite3.connect("file:{}?mode=ro".format(path.replace("?", "%3f")), uri=True)
        try:
            columns = {row[1] for row in connection.execute("PRAGMA table_info(threads)")}
            if not {"id", "rollout_path", "tokens_used"}.issubset(columns):
                note_issue(stats, "invalidCodexStateSchemas")
                return {}
            inventory = {}
            for thread_id, rollout_path, tokens_used in connection.execute(
                "SELECT id, rollout_path, tokens_used FROM threads"
            ):
                if rollout_path:
                    inventory[os.path.realpath(rollout_path)] = {
                        "id": thread_id,
                        "tokens": nonnegative_int(tokens_used),
                    }
            stats["codexThreads"] += len(inventory)
            return inventory
        finally:
            connection.close()
    except (OSError, sqlite3.DatabaseError):
        note_issue(stats, "unreadableCodexStateDatabases")
        return {}


def collect_codex_home(home, sessions, transitions, responses, stats):
    if not os.path.isdir(home):
        note_issue(stats, "missingCodexHomes")
        return
    session_root = os.path.join(home, "sessions")
    if not os.path.isdir(session_root):
        note_issue(stats, "missingCodexSessionDirectories")
        return

    inventory = load_thread_inventory(home, stats)
    discovered = set()
    for folder in ("sessions", "archived_sessions"):
        root = os.path.join(home, folder)
        if not os.path.isdir(root):
            continue
        try:
            for directory, _, files in os.walk(
                root, onerror=lambda _error: note_issue(stats, "unreadableCodexDirectories")
            ):
                for filename in files:
                    if filename.endswith(".jsonl"):
                        discovered.add(os.path.realpath(os.path.join(directory, filename)))
        except OSError:
            note_issue(stats, "unreadableCodexDirectories")

    selected = set(inventory)
    for path in selected - discovered:
        if os.path.isfile(path):
            discovered.add(path)
        else:
            note_issue(stats, "missingSelectedRollouts")
    stats["orphanRolloutFiles"] += len(discovered - selected)

    for path in sorted(discovered):
        stats["codexFiles"] += 1
        metadata = None
        snapshots = []
        response_records = []
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as handle:
                for line_number, line in enumerate(handle):
                    if ("\"session_meta\"" not in line
                            and "\"token_count\"" not in line
                            and "\"token_usage_record\"" not in line):
                        continue
                    try:
                        entry = json.loads(line)
                    except (TypeError, ValueError):
                        stats["invalidLines"] += 1
                        continue
                    if entry.get("type") == "session_meta":
                        payload = entry.get("payload") or {}
                        metadata = {
                            "id": payload.get("id") or payload.get("session_id"),
                            "startedAt": payload.get("timestamp") or entry.get("timestamp"),
                            "provider": payload.get("model_provider"),
                            "forkedFrom": payload.get("forked_from_id"),
                        }
                        continue
                    payload = entry.get("payload") or {}
                    if entry.get("type") == "token_usage_record":
                        usage = payload.get("usage") or {}
                        response_id = payload.get("response_id")
                        total = nonnegative_int(usage.get("total_tokens"))
                        if response_id and total:
                            response_records.append({
                                "responseId": response_id,
                                "sessionId": payload.get("session_id") or payload.get("thread_id"),
                                "at": entry.get("timestamp"),
                                "total": total,
                                "threadTotal": (payload.get("thread_token_usage") or {}).get("total_tokens"),
                            })
                        continue
                    info = payload.get("info") or {}
                    usage = info.get("total_token_usage")
                    if (
                        entry.get("type") == "event_msg"
                        and payload.get("type") == "token_count"
                        and isinstance(usage, dict)
                    ):
                        total = nonnegative_int(usage.get("total_tokens"))
                        if total:
                            snapshots.append({
                                "at": entry.get("timestamp"),
                                "ordinal": entry.get("ordinal", line_number),
                                "total": total,
                            })
        except OSError:
            note_issue(stats, "unreadableFiles")
            continue
        if not metadata or not metadata.get("id"):
            stats["missingSessionIdentity"] += 1
            continue
        if metadata.get("provider") != "openai":
            stats["providerDocumentsExcluded"] += 1
            continue

        key = stable_hash("codex-session", metadata["id"])
        incoming = {
            "key": key,
            "startedAt": metadata.get("startedAt"),
            "forkedFrom": stable_hash("codex-session", metadata["forkedFrom"])
            if metadata.get("forkedFrom") else None,
        }
        if key in sessions:
            merge_codex_session(sessions[key], incoming)
        else:
            sessions[key] = incoming

        previous = None
        for item in snapshots:
            record_key = stable_hash(
                "codex-record", metadata["id"], item.get("at"),
                item.get("ordinal"), item.get("total")
            )
            transition_key = stable_hash(
                "codex-transition", key,
                previous.get("recordKey") if previous else "", record_key
            )
            transitions[transition_key] = {
                "key": transition_key,
                "sessionKey": key,
                "at": item.get("at"),
                "total": item.get("total"),
                "previousAt": previous.get("at") if previous else None,
                "previousTotal": previous.get("total") if previous else None,
            }
            previous = {**item, "recordKey": record_key}

        for item in response_records:
            response_key = stable_hash("codex-response", item["responseId"])
            candidate = {
                "key": response_key,
                "sessionKey": stable_hash(
                    "codex-session", item.get("sessionId") or metadata["id"]
                ),
                "at": item.get("at"),
                "total": item.get("total"),
                "threadTotal": item.get("threadTotal"),
            }
            existing = responses.get(response_key)
            if not existing or str(candidate.get("at") or "") < str(existing.get("at") or ""):
                responses[response_key] = candidate

        if response_records and snapshots:
            earliest_response = min(
                str(item.get("at") or "") for item in response_records
            )
            legacy_high_water = max(
                (item["total"] for item in snapshots
                 if str(item.get("at") or "") < earliest_response),
                default=0,
            )
            unique_responses = {}
            for item in response_records:
                unique_responses.setdefault(item["responseId"], item)
            ordered = sorted(unique_responses.values(), key=lambda item: str(item.get("at") or ""))
            first, last = ordered[0], ordered[-1]
            if first.get("threadTotal") is not None and last.get("threadTotal") is not None:
                # Provider response records carry a lifetime counter, unlike the
                # context/status counter in snapshots and threads.tokens_used.
                prefix = nonnegative_int(first["threadTotal"]) - first["total"]
                expected = prefix + sum(item["total"] for item in ordered)
                if prefix < 0 or expected != nonnegative_int(last["threadTotal"]):
                    note_issue(stats, "codexEvidenceReconciliationMismatches")
                elif expected != max(item["total"] for item in snapshots):
                    stats["contextCounterDifferences"] = stats.get("contextCounterDifferences", 0) + 1
            else:
                expected = legacy_high_water + sum(item["total"] for item in ordered)
                if expected != max(item["total"] for item in snapshots):
                    note_issue(stats, "codexEvidenceReconciliationMismatches")

        selected_thread = inventory.get(path)
        if selected_thread:
            latest_cumulative = snapshots[-1]["total"] if snapshots else 0
            if latest_cumulative != selected_thread["tokens"]:
                note_issue(stats, "codexReconciliationMismatches")


def collect_hermes_database(path, rows_by_key, stats):
    if not os.path.isfile(path):
        note_issue(stats, "missingHermesDatabases")
        return
    uri = "file:{}?mode=ro".format(path.replace("?", "%3f"))
    try:
        connection = sqlite3.connect(uri, uri=True)
    except (OSError, sqlite3.DatabaseError):
        note_issue(stats, "unreadableHermesDatabases")
        return
    try:
        ledger_columns = {row[1] for row in connection.execute(
            "PRAGMA table_info(session_model_usage)"
        )}
        required_ledger = {
            "session_id", "model", "billing_provider", "billing_base_url",
            "billing_mode", "task", "input_tokens", "output_tokens",
            "cache_read_tokens", "cache_write_tokens", "reasoning_tokens",
            "first_seen", "last_seen",
        }
        if not required_ledger.issubset(ledger_columns):
            note_issue(stats, "invalidHermesLedgerSchemas")
            return

        ledger_main_sessions = set()
        ledger_query = """
            SELECT session_id, model, billing_provider, billing_base_url,
                   billing_mode, task, input_tokens, output_tokens,
                   cache_read_tokens, cache_write_tokens, reasoning_tokens,
                   first_seen, last_seen
            FROM session_model_usage
            WHERE billing_provider = 'openai-codex'
        """
        for row in connection.execute(ledger_query):
            task = str(row[5] or "")
            if task == "moa" or task.startswith("moa_"):
                stats["moaLedgerRowsExcluded"] += 1
                continue
            if task not in VERIFIED_HERMES_TASKS:
                note_issue(stats, "unverifiedHermesTaskRowsExcluded")
                continue
            session_key = stable_hash("hermes-session", row[0])
            task_kind = "main" if not task else "auxiliary"
            if task_kind == "main":
                ledger_main_sessions.add(row[0])
            key = stable_hash("hermes-ledger", *row[:6])
            candidate = {
                "key": key,
                "sessionKey": session_key,
                "taskKind": task_kind,
                "firstSeen": iso_from_epoch(row[11]),
                "lastSeen": iso_from_epoch(row[12]),
                "input": nonnegative_int(row[6]),
                "output": nonnegative_int(row[7]),
                "cacheRead": nonnegative_int(row[8]),
                "cacheWrite": nonnegative_int(row[9]),
                "reasoning": nonnegative_int(row[10]),
                "kind": "ledger",
            }
            existing = rows_by_key.get(key)
            if not existing or row_total(candidate) > row_total(existing):
                rows_by_key[key] = candidate
            stats["nativeHermesLedgerRows"] += 1

        session_columns = {row[1] for row in connection.execute(
            "PRAGMA table_info(sessions)"
        )}
        required_sessions = {
            "id", "model", "billing_provider", "billing_base_url", "billing_mode",
            "input_tokens", "output_tokens", "cache_read_tokens", "cache_write_tokens",
            "reasoning_tokens", "started_at", "ended_at", "last_activity_at",
        }
        if not required_sessions.issubset(session_columns):
            note_issue(stats, "invalidHermesSessionSchemas")
            return
        fallback_query = """
            SELECT id, model, billing_provider, billing_base_url,
                   billing_mode, input_tokens, output_tokens,
                   cache_read_tokens, cache_write_tokens, reasoning_tokens,
                   started_at, COALESCE(ended_at, last_activity_at, started_at)
            FROM sessions WHERE billing_provider = 'openai-codex'
        """
        for row in connection.execute(fallback_query):
            if row[0] in ledger_main_sessions:
                continue
            session_key = stable_hash("hermes-session", row[0])
            key = stable_hash("hermes-session-fallback", *row[:5])
            candidate = {
                "key": key,
                "sessionKey": session_key,
                "taskKind": "main",
                "firstSeen": iso_from_epoch(row[10]),
                "lastSeen": iso_from_epoch(row[11]),
                "input": nonnegative_int(row[5]),
                "output": nonnegative_int(row[6]),
                "cacheRead": nonnegative_int(row[7]),
                "cacheWrite": nonnegative_int(row[8]),
                "reasoning": nonnegative_int(row[9]),
                "kind": "session-fallback",
            }
            existing = rows_by_key.get(key)
            if not existing or row_total(candidate) > row_total(existing):
                rows_by_key[key] = candidate
            stats["hermesFallbackRows"] += 1
    except (OSError, sqlite3.DatabaseError):
        note_issue(stats, "unreadableHermesDatabases")
    finally:
        connection.close()


def main():
    if len(sys.argv) != 2:
        raise SystemExit("probe configuration argument required")
    encoded = sys.argv[1]
    encoded += "=" * (-len(encoded) % 4)
    config = json.loads(base64.urlsafe_b64decode(encoded.encode("ascii")))
    sessions = {}
    transitions = {}
    responses = {}
    hermes_rows = {}
    stats = {
        "codexFiles": 0,
        "codexThreads": 0,
        "orphanRolloutFiles": 0,
        "invalidLines": 0,
        "unreadableFiles": 0,
        "missingSessionIdentity": 0,
        "providerDocumentsExcluded": 0,
        "nativeHermesLedgerRows": 0,
        "moaLedgerRowsExcluded": 0,
        "hermesFallbackRows": 0,
        "completenessIssues": 0,
    }
    before_codex = stats["completenessIssues"]
    for home in config.get("codexHomes", []):
        collect_codex_home(home, sessions, transitions, responses, stats)
    codex_complete = stats["completenessIssues"] == before_codex
    before_hermes = stats["completenessIssues"]
    for database in config.get("hermesDatabases", []):
        collect_hermes_database(database, hermes_rows, stats)
    hermes_complete = stats["completenessIssues"] == before_hermes
    output = {
        "schemaVersion": 2,
        "collectedAt": datetime.datetime.now(datetime.timezone.utc)
        .isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "complete": stats["completenessIssues"] == 0,
        "componentComplete": {
            "codex": codex_complete,
            "hermes": hermes_complete,
        },
        "codexSessions": list(sessions.values()),
        "codexTransitions": list(transitions.values()),
        "codexResponses": list(responses.values()),
        "hermesRows": list(hermes_rows.values()),
        "stats": stats,
    }
    json.dump(output, sys.stdout, separators=(",", ":"), sort_keys=True)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
