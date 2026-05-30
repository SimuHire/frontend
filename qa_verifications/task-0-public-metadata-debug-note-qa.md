# Task 0 — Same-Day Quick Wins: Public Metadata + Debug Note — End-to-End Manual QA

## Environment

- Date/time: `Sat May 30 06:37:12 EDT 2026`
- OS: `macOS 26.3 (Build 25D125)`; `Darwin 25.3.0 arm64`
- Backend branch: `yc-final-sprint-00`
- Frontend branch: `yc-final-sprint-00`
- Backend command/port: `./runBackend.sh up` on `8000`
- Frontend command/port: `npm run start -- --port 3000` on `3000`
- Local app URL: `http://127.0.0.1:3000/`
- Backend startup: successful
- Frontend startup: successful
- Backend mode: `WINOE_ENV=local`, reload enabled, `DEV_AUTH_BYPASS=1` by local defaults
- Backend runtime notes: local AI readiness emitted unrelated Anthropic credit-balance warnings from background job activity, but `/health` and `/ready` were both healthy

## Credentials Used

- Talent Partner credentials were used for the Talent Partner smoke.
- Candidate credentials were used for the Candidate smoke.
- Passwords are not repeated here.

## Source / Static Checks

| Check                      | Result | Notes                                                                                                                                                    |
| -------------------------- | -----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Debug note grep            |   PASS | No public marketing/app debug note matched in `src` or `public`                                                                                          |
| Theme-color source         |   PASS | `PUBLIC_THEME_COLOR` is literal `#C9A66B` in [`public-theme-color.ts`](/Users/robelmelaku/Desktop/Winoe-AI-I/winoe-ai-frontend/public-theme-color.ts)    |
| OG/Twitter metadata source |   PASS | Both routes point at `/opengraph-image` and `/twitter-image`; no SVG/WebP/GIF references in metadata                                                     |
| Canonical metadata source  |   PASS | Public root canonical exists in [`src/app/(marketing)/page.tsx`](</Users/robelmelaku/Desktop/Winoe-AI-I/winoe-ai-frontend/src/app/(marketing)/page.tsx>) |
| Satori safety source       |   PASS | No CSS vars, no grid, no zIndex/z-index; both image files export `image/png` and `1200x630`                                                              |
| `globals.css` diff         |   PASS | No Task 0 diff in [`src/app/globals.css`](/Users/robelmelaku/Desktop/Winoe-AI-I/winoe-ai-frontend/src/app/globals.css)                                   |

## Guardrail Checks

| Check                            | Result | Notes                                                                                                                     |
| -------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------- |
| Normal `npm run lint:metadata`   |   PASS | `metadata guardrail passed`                                                                                               |
| CSS-var theme-color failure test |   PASS | Failed as expected with `metadata guardrail failed: public theme color constant must remain #C9A66B`                      |
| Bad SVG image failure test       |   PASS | Failed as expected with `metadata guardrail failed: marketing page openGraph.images must not reference SVG, WebP, or GIF` |
| Missing canonical failure test   |   PASS | Failed as expected with `metadata guardrail failed: marketing page must define canonical alternates for the public root`  |
| Final clean rerun                |   PASS | `metadata guardrail passed` and worktree returned clean                                                                   |

## Build / Checks

| Check                    | Result | Notes                                                                                  |
| ------------------------ | -----: | -------------------------------------------------------------------------------------- |
| `npm run lint`           |   PASS | Metadata, ESLint, and Prettier checks passed                                           |
| `npm run typecheck`      |   PASS | TypeScript check passed                                                                |
| `npm run build`          |   PASS | Build completed without Satori unsupported CSS warnings                                |
| `./precommit.sh`         |   PASS | Initial run failed on this report's Prettier formatting; rerun passed after formatting |
| Backend startup / health |   PASS | `/health` returned `{"status":"ok"}` and `/ready` returned ready                       |

## Running App Metadata Checks

| Check                                |                            Result | Notes                                                                       |
| ------------------------------------ | --------------------------------: | --------------------------------------------------------------------------- |
| Theme-color rendered as `#C9A66B`    |                              PASS | Present in root HTML and browser metadata                                   |
| Canonical rendered                   |                              PASS | `https://winoe.ai` in source and runtime HTML                               |
| OG image rendered and PNG route      |                              PASS | `/opengraph-image` returned `image/png`                                     |
| Twitter image rendered and PNG route |                              PASS | `/twitter-image` returned `image/png`                                       |
| No `invite-token` debug copy         | FAIL in production / PASS locally | Local HTML had no debug copy; production HTML still shows it                |
| No `/og-image.svg`                   | PASS locally / FAIL in production | Local HTML uses PNG routes; production HTML still references `og-image.svg` |

## OG/Twitter Image Verification

| Route              | Content-Type | Dimensions |      Byte Size | Artifact                   |
| ------------------ | ------------ | ---------- | -------------: | -------------------------- |
| `/opengraph-image` | `image/png`  | `1200x630` | `59,716` bytes | `/tmp/winoe-opengraph.png` |
| `/twitter-image`   | `image/png`  | `1200x630` | `59,716` bytes | `/tmp/winoe-twitter.png`   |

## Browser Screenshots

| Artifact                                | Path                                        |
| --------------------------------------- | ------------------------------------------- |
| Public root screenshot                  | `qa-task0-public-root.png`                  |
| Talent Partner login error screenshot   | `qa-task0-talent-partner-login-error.png`   |
| Candidate login form screenshot         | `qa-task0-candidate-login-form.png`         |
| Candidate portal login error screenshot | `qa-task0-candidate-portal-login-error.png` |
| OG image artifact                       | `/tmp/winoe-opengraph.png`                  |
| Twitter image artifact                  | `/tmp/winoe-twitter.png`                    |

## Login Smoke Results

| Check                         |  Result | Notes                                                                                   |
| ----------------------------- | ------: | --------------------------------------------------------------------------------------- |
| Talent Partner login link     |    PASS | Link present on the public root and opened Auth0 consent                                |
| Talent Partner authentication | BLOCKED | Auth0 callback failed with `callback_failed` / `invalid_state` after consent            |
| Candidate portal link         |    PASS | Link present on the public root and opened Auth0 login                                  |
| Candidate authentication      | BLOCKED | Auth0 callback failed with `callback_failed` / `invalid_state` after login/consent flow |

### Exact auth failure observed

- Talent Partner: `Winoe AI - Sign-in error | Winoe` at `/auth/error?mode=talent_partner&returnTo=&error=callback_failed&errorCode=invalid_state&errorId=...`
- Candidate: `Winoe AI - Sign-in error | Winoe` at `/auth/error?mode=talent_partner&returnTo=&error=callback_failed&errorCode=invalid_state&errorId=...`

## Production Comparison

### Local result

- `theme-color` is literal `#C9A66B`
- OG/Twitter metadata uses `/opengraph-image` and `/twitter-image`
- Guardrail and build checks pass
- Auth smoke is blocked by Auth0 callback failure

### Production result

- Production HTML still shows the old state:
  - `theme-color` is `var(--wheat-500)`
  - `og:image` / `twitter:image` reference `https://winoe.ai/og-image.svg`
  - the debug note `In production, candidates will receive a unique trial link like /invite/<invite-token>.` is still present

## Final Verdict

✅ TASK 0 LOCAL QA PASS — Authenticated smoke blocked by unrelated Auth0 local environment issue; production verification pending deploy.

## Iteration 4 Note

- Initial frontend `./precommit.sh` after adding this QA report failed on Prettier formatting for this report file.
- After formatting the QA report with Prettier, frontend `./precommit.sh` passed.

## Notes

- Backend repo remained untouched for this frontend-only task.
- No product code changes were made during QA; only this report file was added.
- The local frontend worktree was clean after reverting the temporary guardrail failures.

## Final Gap Classification

- Local Task 0 public metadata status: `PASS`
- Local runtime metadata status: `PASS`
- Auth0 callback classification: `Environment/Auth0 configuration blocker, not Task 0 regression`
- Evidence: the authorize request always uses `redirect_uri=http://localhost:3000/auth/callback`, and the `127.0.0.1` browser flow returns to `http://localhost:3000/auth/error?error=callback_failed&errorCode=invalid_state...`
- Production deployment status: `Production stale — Task 0 not deployed yet`
- PR readiness: `Task 0 is PR-ready`
- Production verification readiness: `Ready for production verification after deploy`
- Authenticated smoke status: `PASS on localhost`, `BLOCKED on 127.0.0.1` by local Auth0 hostname/config mismatch

✅ TASK 0 LOCAL QA PASS — Authenticated smoke blocked by unrelated Auth0 local environment issue; production verification pending deploy.
