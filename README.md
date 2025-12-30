# SimuHire Frontend

Next.js App Router (React 19 + TypeScript) UI for SimuHire’s 5-day work simulations. Candidates complete day-by-day tasks via invite tokens; recruiters create simulations, invite candidates, and review submissions.

## Architecture

- App Router under `src/app`; shared shell in `src/features/shared/layout/AppShell`.
- Auth0 for recruiter portal; `src/middleware.ts` redirects unauthenticated recruiters to `/auth/login?returnTo=…`.
- Candidate portal talks directly to the backend with token headers. Recruiter portal uses Next API routes as a BFF that forward to the backend with Auth0 access tokens.
- Styling via Tailwind utility classes and shared UI primitives in `src/components/ui`.

## Routes

- Marketing: `/` (`src/app/(marketing)/page.tsx`).
- Auth: `/auth/login`, `/auth/logout`.
- Candidate portal: `/candidate-sessions/[token]` (wrapped by `CandidateSessionProvider` layout).
- Recruiter portal: `/dashboard`, `/dashboard/simulations/new`, `/dashboard/simulations/[id]`, `/dashboard/simulations/[id]/candidates/[candidateSessionId]`.
- API BFF: `/api/simulations` (+ `/[id]/invite`, `/[id]/candidates`), `/api/submissions`, `/api/submissions/[submissionId]`, `/api/dev/access-token`.

## Key Components & Features

- Candidate session state: `src/features/candidate/session/CandidateSessionProvider` persists token/bootstrap in `sessionStorage`.
- Candidate flow: bootstrap token → intro → current task fetch → text/code editor with local drafts → submit → progress tracker; friendly error messages and retry hooks.
- Recruiter dashboard: `DashboardView` + `SimulationList` with invite modal/toast, profile card, and navigation to creation/detail/submission views.
- Submissions viewer: renders per-day artifacts (prompt, text, code with copy/download, testResults JSON if present).

## API Integration

- Base config: `NEXT_PUBLIC_API_BASE_URL` (defaults to `/api`); BFF targets `BACKEND_BASE_URL` (default `http://localhost:8000`).
- Candidate calls (direct):
  - `GET /candidate/session/{token}` bootstrap.
  - `GET /candidate/session/{id}/current_task` with header `x-candidate-token`.
  - `POST /tasks/{taskId}/submit` with headers `x-candidate-token`, `x-candidate-session-id`; body `{contentText?, codeBlob?}`.
- Recruiter calls (via BFF with Auth0 bearer token):
  - `GET /api/auth/me` (profile).
  - `GET/POST /api/simulations`.
  - `POST /api/simulations/{id}/invite`.
  - `GET /api/simulations/{id}/candidates`.
  - `GET /api/submissions?candidateSessionId=…`, `GET /api/submissions/{submissionId}`.
- Not implemented: codespace init/status, run-tests polling UI, execution profile fetch.

## Configuration / Env Vars

- `NEXT_PUBLIC_API_BASE_URL` – backend base for candidate calls (e.g., `https://backend.example.com/api`).
- `BACKEND_BASE_URL` – backend base for BFF (default `http://localhost:8000`; `/api` suffix trimmed).
- Auth0: `AUTH0_SECRET`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`, `AUTH0_SCOPE`, `APP_BASE_URL`.
- Optional helper script: `./runFrontend.sh` echoes `BACKEND_BASE_URL` then runs `npm run dev`.

## Local Development

- Install: `npm install`.
- Run dev: `npm run dev` (<http://localhost:3000>). Build: `npm run build`; start: `npm start`.
- Tests/checks: `npm test`, `npm run test:coverage`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `./precommit.sh`.
- Point to local backend: set `BACKEND_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.

## Typical Flows

- Candidate: open invite link → bootstrap session → intro → load current task → auto-save drafts → submit with token/session headers → refresh current task → finish when `isComplete` true.
- Recruiter: Auth0 login → dashboard loads profile + simulations → create simulation → invite candidate (modal + copy invite URL) → view simulation candidates (status/time) → view per-task submissions (text/code/testResults).

## Planned Roadmap (not yet in code)

- Email verification before unlocking sessions.
- GitHub-native workflow: codespace init/status, run-tests trigger + duplicate-run prevention UI.
- Day4 demo capture + transcript; Day5 structured markdown submission.
- Execution profile/report view, comparison, and print/export.
- Candidate run-tests panel integration and richer states/loading skeletons.
