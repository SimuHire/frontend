# Task 11: Surface verified report evidence and finalized candidate states

## Summary

- Surfaces backend-validated Winoe Report evidence in the Talent Partner report experience.
- Updates candidate portal report states so pending, finalized/reviewed, and Talent Partner-shared reports are distinct.
- Gates internal AI/runtime controls behind backend-provided viewer capabilities.
- Aligns frontend normalization with backend citation payload fields used by the Task 11 Evidence Trail.
- Task 11 is code ready and approved for QA signoff / PR prep based on Iteration 5 verification.

## Frontend Implementation Details

- Winoe Report Evidence Trail now renders backend report-level citation payloads.
- Evidence empty-state only appears when citations are truly absent.
- Frontend normalizers now support backend citation fields:
  - `citations`
  - `evidenceTrail`
  - `artifact_type`
  - `artifact_ref`
  - `dimension`
  - `excerpt`
- Frontend state handling supports candidate finalized report fields returned by the backend.
- UI visibility for internal AI/runtime controls is derived from `viewerCapabilities.canManageInternalAiControls`.

## Talent Partner Report UX Changes

- The Talent Partner report view renders persisted report-level citations in the Winoe Report Evidence Trail.
- Citation rendering supports backend Evidence Trail payload shapes instead of relying only on older normalized frontend-only fields.
- The Evidence Trail empty-state is reserved for reports where citations are truly absent.
- Manual QA covered the Report Evidence Trail UX against deterministic backend data.

## Candidate Portal Changes

- Candidate portal distinguishes:
  - Pending report.
  - Finalized/reviewed report.
  - Report shared with Talent Partner.
- Candidate copy does not imply Winoe makes hiring decisions.
- Candidate copy says the Winoe Report and Evidence Trail were shared with the Talent Partner.
- Manual QA covered candidate finalized state and invite persistence.

## Trial Detail / Internal Controls Gating

- Talent Partner Trial detail gates internal AI/runtime controls behind `viewerCapabilities.canManageInternalAiControls`.
- Regular Talent Partner users no longer see internal AI override/runtime controls.
- Internal controls remain available only when the backend capability payload permits them.

## Tests Run

- Frontend precommit passed.
- Backend precommit passed as part of the completed Task 11 verification.
- Frontend tests were added or updated for:
  - Winoe Report citation rendering.
  - Evidence empty-state behavior.
  - Candidate finalized/pending portal states.
  - Internal AI controls visibility.

## Manual QA Evidence

Iteration 5 QA reported full local manual QA passed with:

- Backend API.
- Backend worker.
- Frontend.
- Database.
- Admin endpoints.
- Notification audit.
- Report Evidence Trail UX.
- Candidate finalized state.
- Invite persistence.
- DLQ/retry.
- Health/readiness.

## Known Limitations / Accepted Tradeoffs

- Local QA used deterministic demo backend data.
- Live email/provider rendering was not exercised from frontend.
- Operator-only admin UI was not added; Task 11 operator tooling is API-first.

## Risk Notes

- Report Evidence Trail rendering depends on backend citation payloads remaining present and normalized across supported field names.
- Candidate report state copy depends on finalized/shared state fields from the backend.
- Internal AI/runtime controls must remain gated by `viewerCapabilities.canManageInternalAiControls` to avoid exposing operator-only controls to regular Talent Partner users.
