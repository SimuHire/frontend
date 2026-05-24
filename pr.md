# Task 9: Complete Candidate Days 2–5 Trial Experience

## Status

PASS — Task 9 is fully addressed, manually end-to-end QA verified, and ready for PR.

## Frontend Summary

- Implements and hardens the candidate-facing Day 2/3 implementation workspace experience.
- Adds GitHub username gating before Codespace access.
- Updates Day 2 and Day 3 workspace copy to reflect from-scratch Codespace work.
- Aligns run-tests UI state with the `succeeded` terminal state.
- Protects Day 1/2/3 submit-label behavior.
- Verifies Day 4 handoff/demo and Day 5 reflection surfaces through targeted tests and manual QA.
- Removes retired Day 1 `template` wording from candidate-facing help copy.
- Adds regression coverage for terminology and candidate-state behavior.

## Frontend Files

### Candidate workspace / Day 2-3

- `src/features/candidate/session/views/WorkspaceAndTests.tsx`
- `src/features/candidate/tasks/components/GithubUsernamePromptModal.tsx`
- `src/features/candidate/tasks/components/WorkspacePanel.tsx`
- `src/features/candidate/tasks/components/WorkspacePanelHeader.tsx`
- `src/features/candidate/tasks/components/WorkspacePanelBody.tsx`
- `src/features/candidate/tasks/components/TaskHeader.tsx`
- `src/features/candidate/tasks/CandidateTaskViewInner.tsx`

### Run-tests UI

- `src/features/candidate/tasks/components/RunTestsPanelHeader.tsx`
- `src/features/candidate/tasks/hooks/useRunTestsCopy.ts`
- `src/features/candidate/tasks/hooks/useRunTestsMessages.ts`
- `src/features/candidate/tasks/hooks/useRunTestsTypes.ts`

### Terminology fix

- `src/features/candidate/tasks/components/Day1DesignDocWorkspace.tsx`

### Tests

- `tests/unit/features/candidate/session/views/WorkspaceAndTests.test.tsx`
- `tests/unit/features/candidate/tasks/components/WorkspacePanelCopy.test.tsx`
- `tests/unit/features/candidate/tasks/hooks/useRunTestsCopy.test.ts`
- `tests/unit/features/candidate/tasks/hooks/runTestsMeta.test.ts`
- `tests/unit/features/candidate/tasks/hooks/runTestsMessages.test.ts`
- `tests/unit/features/candidate/tasks/CandidateTaskView.submitFeedback.test.tsx`
- `tests/unit/features/candidate/tasks/CandidateTaskView.closedReadOnly.test.tsx`
- `tests/unit/features/candidate/tasks/CandidateTaskView.day3ImplementationWrapUp.test.tsx`
- `tests/unit/features/candidate/tasks/components/Day5ReflectionPanel.validation.test.tsx`
- `tests/unit/features/candidate/tasks/handoff/HandoffUploadPanel.day4Requirements.test.tsx`
- `tests/unit/features/candidate/tasks/CandidateTaskView.day1DesignDoc.test.tsx`
- updated `RunTestsPanel.*` tests as relevant

## Frontend Behavior

### Day 2

- Candidate is blocked by GitHub username modal when missing.
- Valid GitHub username unlocks the Codespace workspace.
- Day 2 copy says `Day 2 — Implementation Kickoff`.
- Day 2 copy says `Build from scratch in your Codespace. AI tools welcome.`
- Codespace card explains the from-scratch repo contents:
  - `.devcontainer/`
  - `README.md` Project Brief
  - Evidence Trail workflow
  - no starter code
- Run-tests state machine uses:
  - `idle`
  - `starting`
  - `running`
  - `succeeded`
  - `failed`
- Day 2 submit label:
  - `Submit Day 2 & continue tomorrow at 9 AM`

### Day 3

- Uses the same Codespace/workspace lineage.
- Day 3 copy says `Day 3 — Implementation Wrap-Up`.
- Day 3 copy says `Continue in the same Codespace. Polish and finalize.`
- Day 3 submit label:
  - `Submit Day 3 & continue to Day 4 — Demo handoff`

### Day 4

- Existing handoff/demo upload and transcript UX was verified.
- Transcript gating tests remain green.
- Candidate review surface shows submitted recording/transcript evidence.

### Day 5

- Existing reflection essay surface was verified.
- 9 PM local deadline copy is covered.
- Completion/read-only state is verified.

### Terminology

- Removed visible Day 1 `template` copy.
- Added regression test to prevent candidate-visible `template` wording from returning.

## Frontend Checks

- `npm ci` — pass
- `npm run typecheck` — pass
- Focused Task 9 frontend Jest suite — pass
- `./precommit.sh` — pass
- Next build via precommit — pass
- Frontend precommit included lint, prettier, tests, coverage, typecheck, and build

## Frontend Manual QA

- Local frontend ran at `http://localhost:3000`.
- Candidate Days 2–5 were manually exercised.
- Day 2 GitHub username / Codespace flow passed.
- Day 3 same-workspace flow passed.
- Day 4 handoff/demo evidence and transcript flow passed.
- Day 5 reflection, 9 PM deadline, completion, and read-only review passed.
- Post-Trial read-only review passed.
- Terminology audit passed after Day 1 copy fix.

## Risks / Follow-up

- Talent Partner onboarding BFF 500 was observed during QA setup but is out of scope for this Task 9 candidate Days 2–5 PR.
- Recommendation: track as a separate follow-up issue.

## Checklist

- [x] Uses current Winoe AI terminology.
- [x] Avoids retired terminology in candidate-visible copy.
- [x] Preserves Evidence Trail integrity.
- [x] Handles locked/read-only candidate states.
- [x] Covers Day 2/3 implementation workspace behavior.
- [x] Covers Day 4 handoff/demo evidence behavior.
- [x] Covers Day 5 reflection/completion behavior.
- [x] Includes targeted automated tests.
- [x] Passed local typecheck/build where applicable.
- [x] Passed precommit.
- [x] Manually QA verified locally.
