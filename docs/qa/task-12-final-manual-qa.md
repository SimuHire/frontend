# Task 12 Final Manual QA

Executive verdict: PASS

Task 12 QA status: PASS

Manual local QA verified both backend and frontend servers, browser flows for
Talent Partner and candidate credentials, legacy terminology guards, security
boundaries, production safety guards, branded edge states, media retention, and
the v4-final screenshot audit. This PR is ready for final review and release-tag
preparation.

## Iteration 16 Final QA Closure

- QA date: 2026-05-27 local / 2026-05-28 UTC.
- Backend repo: `winoe-ai-backend`, branch `yc-demo-task-12`, HEAD
  `3b8566f485e53ba70f06ee1e22a52270398a8b16`.
- Frontend repo: `winoe-ai-frontend`, branch `yc-demo-task-12`, HEAD
  `4c7161b395c1f972f78a22ab06bb28bed53d9479`.
- Initial backend working tree was clean. Initial frontend working tree had the
  QA edge-route gate/test changes and Iteration 16 dry-run evidence artifacts.
- QA applies to the committed HEADs above plus working-tree QA artifacts and the
  frontend QA edge-route production-safety implementation.
- Disk before cleanup: `7.6Gi` free. After cleaning disposable `.next`,
  `coverage`, `test-results`, and cache output: `8.5Gi` free.
- `/qa/edge-states` is production-closed. The route calls `notFound()` whenever
  `NODE_ENV=production`, including when
  `NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES=1` and `VERCEL_ENV` is preview or
  production.
- Targeted QA edge-route tests: PASS,
  `npx jest tests/unit/app/qaEdgeStates.test.tsx --runInBand`, 5 tests.
- Production build: PASS. The QA route is present in the build route list but
  remains closed by the server-side production gate.

### Iteration 16 Server And Seed

- Backend command:
  `WINOE_ENV=local WINOE_DEMO_MODE=1 WINOE_ADMIN_API_KEY=test-admin-key DISABLE_RELOAD=1 ./runBackend.sh api`.
- Backend health: `GET http://localhost:8000/health` returned `200` with
  `{"status":"ok"}`.
- Frontend command:
  `WINOE_BACKEND_BASE_URL=http://localhost:8000 npm run dev`.
- Frontend health: `GET http://localhost:3000/api/health` returned `200` with
  upstream backend status `200`.
- Final reset seed command:
  `PYTHONPATH=$PWD GITHUB_PROVIDER=fake WINOE_DEMO_MODE=1 poetry run python scripts/seed_demo.py --reset-db --talent-partner-email winoetalentpartner@gmail.com --talent-partner-name TalentPartner --qa-candidate-email winoecandidate@gmail.com --github-provider fake`.
- Final seed result: `company_id=1`, completed Trial `2`, candidate sessions
  `[1, 2, 3, 4]`, fake repo `winoe-ai-demo/winoe-ws-sarah-chen`.
- Candidate dry-run controls used candidate session `4`, token
  `2b8a38ad70c4cfc9464010c38743939d`, and task IDs `11` through `15` for Day 1
  through Day 5.
- Auth method: documented local dev QA login for the exact requested emails,
  because local Auth0 username/password submission was not available in the
  local browser flow.

### Iteration 16 Timed Dry Runs

- Talent Partner timed dry run: PASS, 12 seconds
  (`2026-05-28T02:22:57.565Z` to `2026-05-28T02:23:09.547Z`), zero browser
  `error` messages, zero failed resources, zero HTTP failures, and zero ignored
  aborted requests.
- Talent Partner route coverage: dev QA login, dashboard, create Trial route,
  Trial Preview, Trial Detail, invite candidate modal, Submission Review, Winoe
  Report, Evidence Trail drawer, Benchmarks, Settings, and return to dashboard.
- Candidate timed dry run: PASS, 34 seconds
  (`2026-05-28T02:23:09.637Z` to `2026-05-28T02:23:43.921Z`), zero browser
  `error` messages, zero non-aborted failed resources, zero HTTP failures, and
  one ignored navigation-induced `net::ERR_ABORTED` while moving between
  deliberate route states.
- Candidate route/state coverage: dev QA login, candidate portal,
  schedule/start, pre-day countdown, Day 1 workspace, Day 1 submitted/closed
  transition, Day 2 Codespace card, Day 2 run-tests running, Day 2 run-tests
  succeeded, deterministic Day 2 run-tests failed state, Day 3 wrap-up, Day 4
  Handoff + Demo upload/record, Day 4 video preview, Day 5 Reflection workspace,
  Day 5 distinct countdown, completion, and read-only submission review.
- Evidence files:
  `docs/qa/task-12-iteration-16-demo-dry-runs.log`,
  `docs/qa/task-12-iteration-16-browser-console.log`,
  `docs/qa/task-12-iteration-16-network.log`,
  `docs/qa/task-12-iteration-16-talent-partner-run.json`,
  `docs/qa/task-12-iteration-16-candidate-run.json`, and
  `docs/qa/task-12-iteration-16-release-clean-run.json`.

### Iteration 16 Final Console And QA Status

- Final release-clean route-family acceptance: PASS, zero browser `error`
  messages, zero non-aborted failed resources, zero HTTP failures, and one
  ignored navigation-induced `net::ERR_ABORTED` while moving between deliberate
  candidate route states.
- Route-family coverage: Talent Partner dashboard, Trial creation/preview/detail,
  Submission Review, Winoe Report, Benchmarks, Settings, candidate portal,
  schedule/start, Day 1, Day 2, Day 3, Day 4, Day 5, completion, and read-only
  review.
- Screenshot audit remains closed: 50/50 required screenshots PASS and 12/12
  edge screenshots PASS.
- Dark mode, mobile 375px, and tablet 768px evidence remain PASS.
- Security remains PASS from Iteration 15 representative probes and focused
  automation.
- Task 12 QA status: PASS.

## Iteration 15 Focused Closure

- QA date: 2026-05-27 local / 2026-05-28 UTC.
- Backend repo: `winoe-ai-backend`, branch `yc-demo-task-12`, HEAD
  `dc1c87c90c5999b283a7d098d617df02ddb79132`.
- Frontend repo: `winoe-ai-frontend`, branch `yc-demo-task-12`, HEAD
  `5f6e45511e0b062c5990b6c7ff7f45db9d46b74a`.
- Initial working trees were clean. Iteration 15 changed frontend QA artifacts
  and two narrow frontend implementation files for local edge-state QA and
  nested expired-invite date parsing.
- Disk before cleanup and after no-op cleanup: `11Gi` free.

### Iteration 15 Server And Seed

- Backend command:
  `WINOE_ENV=local WINOE_DEMO_MODE=1 WINOE_ADMIN_API_KEY=test-admin-key DISABLE_RELOAD=1 ./runBackend.sh api`.
- Backend health: `GET http://localhost:8000/health` returned `200`.
- Frontend command:
  `WINOE_BACKEND_BASE_URL=http://localhost:8000 npm run dev`.
- Frontend health: `GET http://localhost:3000/api/health` returned `200`.
- Demo-scoped seed first failed on stale local FK data from prior QA runs, then
  the explicit local `--reset-db` seed path succeeded:
  `company_id=1`, completed Trial `2`, candidate sessions `[1, 2, 3, 4]`,
  fake repo `winoe-ai-demo/winoe-ws-sarah-chen`.
- Local QA fixture records used:
  empty Talent Partner `empty.talentpartner.qa@winoe.ai`; benchmark comparison
  candidate IDs `[3, 5, 6]`; Day 2/no-GitHub and completion candidate session
  `4`, token `2b8a38ad70c4cfc9464010c38743939d`; expired invite token
  `qa-expired-invite-token`; already-claimed invite token
  `qa-already-claimed-invite-token`.
- Admin day-window payloads used:
  candidate session `4`, target day `2` for the no-GitHub modal; candidate
  session `4`, target day `5` for backend-backed completion.

### Iteration 15 Screenshot Closure

- Required screenshots: 50 PASS / 0 FAIL.
- Edge screenshots: 12 PASS / 0 FAIL.
- Replaced files:
  `04-talent-partner-dashboard-empty-state-desktop-light.png`,
  `06-talent-partner-dashboard-loading-skeleton-desktop-light.png`,
  `28-talent-partner-benchmarks-compare-3-candidates-desktop-light.png`,
  `38-candidate-day-2-github-username-modal-desktop-light.png`, and
  `49-candidate-post-trial-congratulations-desktop-light.png`.
- Added edge files:
  `71-edge-success-toast-desktop-light.png` through
  `77-edge-protected-redirect-unauthenticated-desktop-light.png`.
- Dark, mobile, and tablet evidence remains PASS from Iteration 14 and was not
  replaced.

### Iteration 15 Security And Browser Health

- Focused backend security/lifecycle automation: PASS, 36 tests.
- Focused frontend edge/invite parser automation: PASS, 9 tests.
- Manual/API security probes are recorded in
  `docs/qa/task-12-iteration-15-security-probes.log`; auth boundaries, admin
  token rejection, invite expired/claimed states, and same-origin CSRF behavior
  were probed locally. The initial browser same-origin probe was corrected with
  a raw cookie-authenticated request to prove missing-origin rejection.
- Release-clean browser console/network logs are recorded in
  `docs/qa/task-12-iteration-15-browser-console.log` and
  `docs/qa/task-12-iteration-15-network.log`: zero browser errors and zero
  non-aborted request failures on exercised normal route families.

### Iteration 15 Timed Dry Run

- Talent Partner timed script: 42 seconds, but two text assertions were too
  narrow and one navigation-induced aborted request was recorded.
- Candidate timed script: 3.9 seconds over portal, completion, and read-only
  review only; it did not formally exercise Day 1, Day 2, Day 3, Day 4, and Day
  5 in sequence after the final fixture changes.

### Iteration 15 Blocker

The screenshot and edge gates are closed, but Task 12 remains BLOCKED because
the formal timed demo dry-run gate is not fully closed. A full candidate
stopwatch pass across portal, schedule/start, pre-day, Day 1, Day 2, Day 3, Day
4, Day 5, completion, and read-only review still needs to be run in one clean
context. Do not tag `v4-yc-submission`.

## Iteration 14 Scope

- QA date: 2026-05-27 local / 2026-05-28 UTC.
- Backend repo: `winoe-ai-backend`, branch `yc-demo-task-12`, HEAD
  `eac50e89277ee91340c4d7dc8e7da811e3e7ea09`.
- Frontend repo: `winoe-ai-frontend`, branch `yc-demo-task-12`, HEAD
  `591db9f792314f6ad08ddac2b335e13836f8baac`.
- Supervisor-provided Iteration 13 heads were not checked out locally. QA applies
  to the committed HEADs above plus the working-tree QA docs/screenshots.
- Initial working trees were clean in both repos.
- Final working tree changes are QA evidence only: frontend screenshots/docs and
  both repo `pr.md` files.

## Environment

- OS: Darwin `25.3.0` arm64.
- Node: `v25.2.1`.
- npm: `11.6.2`.
- Python: system `3.14.3`; backend Poetry venv used Python `3.12.8`.
- Poetry: `2.3.2`.
- Browser: Chromium via Playwright.
- Viewports: desktop `1440x1000`, mobile `375x812`, tablet `768x1024`.
- Disk before cleanup: `7.6Gi` free. After safe cleanup: `8.0Gi` free.

## Automated Gates

Sanity and focused lifecycle/security automation passed:

- Backend legacy guard: PASS.
- Backend auth isolation: PASS, 5 tests.
- Backend CSRF protected-prefix/Winoe Report route: PASS, 2 tests.
- Backend Day 5 cutoff: PASS, 1 test.
- Frontend legacy guard: PASS.
- Frontend lint: PASS.
- Frontend typecheck: PASS.
- Frontend scheduled/pre-day, missing-draft, offline/error targeted tests: PASS,
  6 suites / 18 tests.
- Backend rate-limit focused set: PASS, 9 tests.
- Backend media retention focused set: PASS, 7 tests.
- Backend production safety/demo-mode focused set: PASS, 23 tests.

Full precommit was not rerun because implementation files were not changed and
the required sanity set passed.

## Server And Seed

- Backend initial command:
  `WINOE_ENV=local WINOE_ADMIN_API_KEY=test-admin-key DISABLE_RELOAD=1 ./runBackend.sh api`.
- Backend health: `GET http://localhost:8000/health` returned `200`.
- To complete local GitHub/Codespace states without real GitHub writes, backend
  was restarted with:
  `WINOE_ENV=local WINOE_DEMO_MODE=1 WINOE_ADMIN_API_KEY=test-admin-key DISABLE_RELOAD=1 ./runBackend.sh api`.
- Frontend command:
  `WINOE_BACKEND_BASE_URL=http://localhost:8000 npm run dev`.
- Frontend health: `GET http://localhost:3000/api/health` returned `200`.
- Final seed command:
  `PYTHONPATH=$PWD GITHUB_PROVIDER=fake WINOE_DEMO_MODE=1 poetry run python scripts/seed_demo.py --talent-partner-email winoetalentpartner@gmail.com --talent-partner-name TalentPartner --qa-candidate-email winoecandidate@gmail.com --github-provider fake`.
- Final seed result: `company_id=28`, seed-reported completed trial `80`,
  candidate sessions `[108, 109, 110, 111]`, fake repo
  `winoe-ai-demo/winoe-ws-sarah-chen`.
- Session mapping:
  - `108`: Marcus Okonjo, trial `79`, not started.
  - `109`: Priya Patel, trial `79`, not started.
  - `110`: Sarah Chen, trial `80`, completed/read-only/report state.
  - `111`: `winoecandidate@gmail.com`, trial `81`, QA candidate token
    `2b8a38ad70c4cfc9464010c38743939d`.

## Auth

- Real local Auth0 username/password submission was unavailable. The local login
  page redirects to Auth0 and did not expose a reliable local username/password
  form for the provided credentials.
- Talent Partner dev QA login:
  `/api/dev/qa-login?role=talent_partner&email=winoetalentpartner%40gmail.com&returnTo=/talent-partner/trials`.
- Talent Partner identity evidence: `/api/auth/me` returned `200` with
  `email=winoetalentpartner@gmail.com`, `role=talent_partner`,
  `companyId=28`, `companyName=Acme`.
- Candidate dev QA login:
  `/api/dev/qa-login?role=candidate&email=winoecandidate%40gmail.com&returnTo=/candidate/portal`.
- Candidate route evidence: `/candidate/portal` rendered the requested email;
  `/api/backend/candidate/invites?includeTerminated=true` returned `200`;
  `/api/backend/candidate/session/2b8a38ad70c4cfc9464010c38743939d` returned
  `200`.

## Screenshot Audit

- Screenshot directory: `docs/screenshots/v4-final/`.
- Fresh screenshot files captured: 72 PNG files.
- Required 50 screenshot count: 45 PASS, 5 FAIL.
- Failed required screenshots:
  - `04-talent-partner-dashboard-empty-state-desktop-light.png`: no true empty
    workspace fixture; file is a no-data surrogate.
  - `06-talent-partner-dashboard-loading-skeleton-desktop-light.png`: capture
    reached loaded dashboard instead of skeleton.
  - `28-talent-partner-benchmarks-compare-3-candidates-desktop-light.png`: seed
    exposes only one completed candidate, not a valid 3-candidate comparison.
  - `38-candidate-day-2-github-username-modal-desktop-light.png`: seed already
    has a GitHub username, so the modal did not appear.
  - `49-candidate-post-trial-congratulations-desktop-light.png`: correct
    completion copy was captured only with injected local session state, not a
    backend-backed completion.
- Edge screenshot count: 5 PASS, 7 FAIL. Missing: success toast, error toast,
  warning toast, branded 500, expired invite, already-claimed invite, and a
  distinct unauthenticated protected-route redirect screenshot.
- Dark/mobile/tablet evidence: captured and spot-checked; see screenshot README.

## Browser Health

- Release-clean contexts were separated from edge/probe contexts for the final
  console pass.
- Normal demo-visible route console result: zero browser `error` messages and
  zero request failures on Talent Partner and candidate clean-route passes.
- Earlier probe contexts intentionally produced expected 4xx/404 states and are
  not counted against release-clean console acceptance.

## Metadata And Compatibility

- Browser titles use Winoe/Winoe AI, including `Winoe AI - Trials | Winoe`.
- Favicon/icon links use `/favicon.ico` and `/winoe-icon.svg`.
- OG/Twitter metadata uses `Winoe AI` and canonical Winoe copy.
- Manifest `/manifest.json` has `"name": "Winoe AI"` and
  `"short_name": "Winoe"`.
- `/candidate-sessions/[token]` compatibility route redirected into candidate
  auth/not-authorized handling rather than rendering as an active product route.
- Active Winoe Report UI used canonical `/api/candidate_trials/...` BFF path.

## Security And Lifecycle

- Talent Partner/candidate isolation: PASS via focused auth isolation tests.
- Candidate cannot use Talent Partner/admin surfaces: PASS via auth isolation.
- CSRF protected route coverage: PASS.
- Rate limits and 429 behavior: PASS via focused rate-limit tests.
- Day 5 cutoff after 9 PM candidate-local: PASS.
- Media retention: PASS for 91-day purge, 89-day preservation, incomplete Trial
  preservation, storage deletion, and idempotency.
- Production safety: PASS for demo-mode production rejection and placeholder
  admin/Auth0 config rejection.
- Invite expired/claimed visual screenshots remain missing, so edge visual QA is
  still BLOCKED even though backend invite states are covered by automation.

## Demo Dry Run

- Talent Partner path was exercised while capturing screenshots:
  login, dashboard, Trial create/preview, Trial detail, invite, submission
  review, Winoe Report, Evidence Trail, Benchmarks, Settings, return navigation.
- Candidate path was exercised while capturing screenshots:
  invite, portal, schedule, pre-day, Day 1, Day 2 Codespace/run-tests states,
  Day 3, Day 4 upload/record, Day 5, and review.
- A formal stopwatch dry run under 8 minutes was not completed, so this gate is
  BLOCKED.

## Blockers

1. Five required screenshots are not valid release-state evidence.
2. Seven required edge screenshots are missing.
3. The timed demo dry run was not formally completed.
4. Local QA needed backend `WINOE_DEMO_MODE=1` for fake GitHub/Codespace states;
   the initially requested backend command used the real GitHub provider from
   `.env`, which rejected the seeded fake QA candidate GitHub identity.

## Remaining Risks

- Full release approval cannot rely on surrogate/forced screenshots.
- The current checked-out SHAs differ from the supervisor-provided Iteration 13
  known heads, so this evidence applies to the actual local HEADs only.
- Browser QA used dev QA login; production Auth0 credential reliability was not
  certified locally.
