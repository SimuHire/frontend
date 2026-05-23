# Task 8 — Candidate Onboarding + Day 1 Design Doc Workspace

## Status

TASK 8 FULL QA PASSED WITH WARNINGS

## Frontend Summary

- Public `/invite/{token}` claim page implemented.
- Candidate setup form captures full name, preferred display name, and timezone.
- Candidate auth handoff and auto-claim flow are wired end to end.
- Candidate portal is available at `/candidate/portal`.
- Legacy `/candidate/dashboard` remains as a compatibility alias.
- Start-date scheduling flow is in place.
- Pre-Day countdown and locked state are handled distinctly.
- Day 1 Design Doc workspace is available.
- The Day 1 layout uses a three-column structure.
- Project Brief is shown in the right rail.
- The editor uses Tiptap.
- Bubble menu formatting covers Bold, Italic, Code, and Link.
- Slash commands are available.
- Autosave runs every 8 seconds, on blur, and through manual Save as draft.
- Autosave failure and retry handling are covered.
- The Day 1 submit dialog is implemented.
- Final submit and duplicate-submit handling are covered.
- Started/closed state copy is distinct from true pre-start scheduled copy.
- Product terminology cleanup is applied across Task 8 surfaces.

## Iteration 10 Final Fix

`Day1MarkdownEditor` now disables StarterKit’s built-in link extension and keeps the explicit `Link` extension. This removes the duplicate Tiptap link warning while preserving bubble-menu Link behavior.

File:

`src/features/candidate/tasks/components/Day1MarkdownEditor.tsx`

## Frontend Checks

| Command | Result | Notes |
|---|---|---|
| npm run lint | PASS | ESLint and Prettier clean |
| npx jest tests/unit/features/candidate/tasks/components/day1MarkdownEditorActions.test.ts --runInBand | PASS | Bubble-menu action coverage passed |
| npx jest tests/integration/candidate/CandidateSessionPageClient.behavior.scheduleSuccess.test.tsx tests/integration/candidate/CandidateSessionPageClient.behavior.scheduleAuthConflict.test.tsx tests/integration/candidate/CandidateSessionPageClient.behavior.lockedProxy.test.tsx --runInBand | PASS | Candidate session integration checks passed |
| ./precommit.sh | PASS | Lint, Jest CI/coverage, typecheck, and build passed |

## Browser QA

| Flow | Result | Notes |
|---|---|---|
| Real-backend editor smoke | PASS | Used local QA login with real backend draft endpoints |
| Bubble menu duplicate link warning check | PASS | No duplicate-link warning in fresh browser console |
| Bubble menu Bold / Italic / Code / Link | PASS | Formatting persisted after reload |
| Slash command smoke | PASS | `/h2` applied successfully |
| Autosave reload smoke | PASS | Draft restored after reload |
| Submit dialog smoke | PASS | Dialog opened by normal click; Keep working preserved editor content |

## Frontend Warning

React key warning remains in `SubmissionReviewPage` / `SubmissionReviewCodePreview` / `Highlight` stack. This is outside Task 8 candidate/editor surfaces and should be handled separately.

## Final QA Verdict

TASK 8 FULL QA PASSED WITH WARNINGS.

Task 8 passed full manual QA after iterative blocker repairs and warning cleanup. The remaining warnings are non-Task-8 or repo-wide debt:

1. Backend full precommit remains red on known repo-wide coverage / rate-limit debt.
2. Frontend React key warning remains in non-Task-8 Submission Review surfaces.

No Task 8 blockers remain.
