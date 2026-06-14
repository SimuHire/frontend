# Task 3: Align frontend QA path with Talent Partner Trial routes and verify Winoe Report integrity

## Summary

This frontend PR updates the Task 3 browser QA helper so it exercises the canonical Talent Partner Trial route family used by the product. The actual source diff is focused on `scripts/task3-browser-qa.mjs`; it does not redesign product UI.

The helper now returns Talent Partner QA login to `/talent-partner/trials`, accepts canonical `/talent-partner/trials/...` URLs while retaining compatibility with the dashboard route family where the app still redirects there, and points the Candidate boundary attempt at the Talent Partner route family. The existing `TASK3_QA_TALENT_PARTNER_EMAIL` override remains the QA mechanism used for `winoetalentpartner@gmail.com`.

The branch diff also contains generated browser QA evidence under `qa_verifications/task3-focused-rerun/` and `qa_verifications/task3-rerun/`. Confirm whether those artifacts should be removed before opening the PR.

## Why this matters

Task 3 QA must exercise the same Talent Partner route family used in the product. Stale `/dashboard/trials/...` assumptions caused false QA failures. Frontend QA also needs to prove the visible Winoe Report path, Candidate boundary, and evidence controls in the browser, not only backend tests.

## Frontend changes

- Updates `scripts/task3-browser-qa.mjs`.
- Changes Talent Partner QA login return targets from `/dashboard/trials` to `/talent-partner/trials`.
- Accepts `/talent-partner/trials/...` and `/dashboard/trials/...` URLs where compatibility is intentional.
- Keeps support for `TASK3_QA_TALENT_PARTNER_EMAIL=winoetalentpartner@gmail.com`.
- Changes the Candidate boundary attempt to target `/talent-partner/trials`.
- Changes the fallback default Talent Partner QA email from `talent_partner1@local.test` to `talent_partner1@example.com`.
- Adds generated QA artifacts in `qa_verifications/task3-focused-rerun/` and `qa_verifications/task3-rerun/` in the current branch diff.

## User-facing behavior

- Talent Partner Winoe Report route renders after backend seed alignment.
- Winoe Score and all dimensions render.
- Evidence controls render.
- Candidate is redirected/denied from the Talent Partner report route.
- No forbidden legacy terminology was found in the focused QA scan.

## QA evidence

```text
Frontend dev server: PASS at http://localhost:3000
Talent Partner browser QA: PASS
Candidate browser QA: PASS
TASK3_QA_TALENT_PARTNER_EMAIL=winoetalentpartner@gmail.com npm run qa:task3: PASS
Frontend precommit: PASS
Test suites: 539 passed
Tests: 1736 passed
Coverage: 100%
Typecheck: PASS
Production build: PASS
Final frontend git status after QA: clean
```

## Test plan

Backend must be running locally for `qa:task3`.

```bash
WINOE_BACKEND_BASE_URL=http://127.0.0.1:8000 NEXT_PUBLIC_WINOE_API_BASE_URL=/api/backend npm run dev

TASK3_QA_TALENT_PARTNER_EMAIL=winoetalentpartner@gmail.com npm run qa:task3

bash precommit.sh
```

## Manual QA

Manual browser QA covered:

- `/talent-partner/trials`
- `/talent-partner/trials/{trialId}`
- `/talent-partner/trials/{trialId}/candidates/{candidateSessionId}/winoe-report`
- `/candidate/portal`
- Candidate attempt to Talent Partner report route

Required acceptance path passed:

- Talent Partner completed dashboard -> Trial detail -> Winoe Report.
- Winoe Report rendered Winoe Score, all 8 dimensions/sub-scores, and evidence controls.
- Candidate portal rendered.
- Candidate was blocked from Talent Partner-only report/citation/submission artifacts.

## Risks / non-blocking notes

- Local dev hydration mismatch warnings were observed.
- Existing Jest console warnings for React key/fake timer cleanup were observed.
- Warnings did not block the Task 3 trust path.
- Generated QA artifacts must be removed or confirmed intentional before final PR status if the repository should not commit browser output files.

## Rollback

Revert the frontend QA helper changes to restore the previous route expectation. No product-data rollback is required.

## Reviewer checklist

- [ ] QA helper uses the required Talent Partner email through `TASK3_QA_TALENT_PARTNER_EMAIL`.
- [ ] Canonical Talent Partner route is accepted.
- [ ] Candidate denial is still verified.
- [ ] Generated artifacts are not committed unless intentionally retained.
- [ ] Precommit is green.
