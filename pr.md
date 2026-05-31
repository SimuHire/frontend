# Task 1: Add DEMO_MODE verification catalog and evidence baseline

## Summary

This PR adds the accepted Task 1 verification catalog and evidence bundle for DEMO_MODE.

This is a QA/audit artifact PR. It does not fix product defects. It establishes the sprint triage baseline for Tasks 4–9 and records the real DEMO_MODE state of the product.

## What changed

- `WINOE_DEMO_VERIFICATION_CATALOG.md`
- `docs/screenshots/demo-verification/task-1/*`
- `docs/screenshots/demo-verification/task-1/40-api-citation-response.json`
- Audit evidence text files created during the verification pass, including:
  - `docs/screenshots/demo-verification/task-1/45-credential-map.txt`
  - `docs/screenshots/demo-verification/task-1/44-state-machine-log.txt`
  - `docs/screenshots/demo-verification/task-1/44-state-machine-log-v2.txt`
  - `docs/screenshots/demo-verification/task-1/47-demo-mode-production-guard.txt`
  - `docs/screenshots/demo-verification/task-1/25-winoe-report-print-inspection.txt`
  - `docs/screenshots/demo-verification/task-1/16-submission-review-per-day-evidence.txt`

## Verification performed

- DEMO_MODE boot verified.
- Seed script ran successfully.
- Correct demo credentials tested:
  - Talent Partner: `winoetalentpartner@gmail.com`
  - Candidate: `winoecandidate@gmail.com`
- Talent Partner surfaces walked.
- Candidate surfaces walked.
- Winoe Report inspected.
- Evidence Trail Drawer inspected.
- Citation API inspected.
- Print/PDF inspected.
- Submission Review inspected.
- Benchmarks/Compare inspected.
- AI pipeline/infra spot checks recorded.
- DEMO_MODE production guard checked.
- Frontend precommit passed.

```text
./precommit.sh
PASS
```

## Accepted P0 findings

- DEMO_MODE seed / credential / story reachability
- Winoe Report citation artifact resolution
- Day 1 editor unreachable from correct candidate credential
- Day 2 Codespace / run-tests unreachable from correct candidate credential
- Day 3 Codespace / run-tests unreachable from correct candidate credential

## Known limitations intentionally preserved

- Invite modal submit/duplicate/copyable URL behavior was not exercised end-to-end.
- Model endpoint reachability was not tested.
- Submission Review evidence is consolidated rather than independent per-day screenshots.
- Candidate Day 1–5 live workspaces are blocked by future-dated demo candidate story.
- This PR does not fix any of the cataloged defects.

## Risk

Low implementation risk because this is documentation/evidence only.

High product planning value because it replaces optimistic readiness claims with evidence.

Do not merge this as a "product ready" signal; merge it as a triage baseline.

## Rollback

Revert the documentation/evidence files if needed.

No runtime behavior changes.

## QA checklist

- [x] DEMO_MODE boot status recorded
- [x] Seed status recorded
- [x] TP surfaces cataloged
- [x] Candidate surfaces cataloged
- [x] Winoe Report cataloged
- [x] Citation API spot-checked
- [x] Evidence Trail validator spot-checked
- [x] State machine evidence recorded
- [x] AgentSnapshots evidence recorded
- [x] DEMO_MODE production guard checked
- [x] Frontend precommit passed
- [x] No functional product code changed

✅ Catalog Accepted — proceed to fix-tasks.
