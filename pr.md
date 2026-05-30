# Task 0 — Same-Day Quick Wins: Public Metadata + Debug Note

## Summary

This PR removes the public debug note from the signed-out homepage, fixes public document metadata, replaces SVG social previews with PNG-generating Next image routes, and adds an automated metadata guardrail.

This is intentionally not the full landing-page rebuild.

## Why

- The public homepage exposed scaffold/debug copy about `/invite/<invite-token>`.
- `theme-color` used `var(--wheat-500)`, which is invalid in metadata.
- OG/Twitter previews referenced SVG, which social platforms often do not render.
- Existing design-token guardrails did not cover document metadata.

## Changes

- Public homepage cleanup
  - Removed the rendered debug paragraph from the signed-out marketing home.

- Public metadata
  - `theme-color` now resolves to literal `#C9A66B`.
  - Public root has canonical metadata.
  - Open Graph metadata points to the PNG-producing preview route.
  - Twitter metadata points to the PNG-producing preview route.

- Social preview images
  - Added `src/app/opengraph-image.tsx`.
  - Added `src/app/twitter-image.tsx`.
  - Both use `next/og`.
  - Both export `1200x630`.
  - Both export `image/png`.
  - Templates use inline, Satori-safe styles only.
  - No CSS variables, no grid, no zIndex/z-index.

- Metadata guardrail
  - Added `scripts/check-public-metadata.mjs`.
  - Added `lint:metadata`.
  - Wired the metadata guardrail into `npm run lint`.
  - The guardrail blocks:
    - CSS-var `theme-color` regression.
    - non-PNG/SVG/WebP/GIF OG/Twitter metadata regressions.
    - missing canonical metadata.
    - unsupported Satori CSS regressions such as grid or zIndex.

- QA documentation
  - Added/updated `qa_verifications/task-0-public-metadata-debug-note-qa.md`.
  - Documents local QA, guardrail failure tests, Auth0 hostname classification, and production verification pending deploy.

## Files Changed

- `package.json`
- `pr.md`
- `public-theme-color.ts`
- `scripts/check-public-metadata.mjs`
- `src/app/(marketing)/page.tsx`
- `src/app/layout.tsx`
- `src/app/opengraph-image.tsx`
- `src/app/twitter-image.tsx`
- `src/features/marketing/home/MarketingHomeSignedOut.tsx`
- `qa_verifications/task-0-public-metadata-debug-note-qa.md`

`src/app/globals.css` is not part of the final diff. Backend has no code changes.

## Verification

| Command                                                       | Result                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------- | ----- | -------------------- | --------- |
| `npm run lint:metadata`                                       | PASS                                                           |
| `npm run lint`                                                | PASS                                                           |
| `npm run typecheck`                                           | PASS                                                           |
| `npm run build`                                               | PASS                                                           |
| `./precommit.sh`                                              | PASS                                                           |
| `grep -R "In production, candidates will receive" src public  |                                                                | true` | No output            |
| `grep -R "invite-token" src/features/marketing src/app public |                                                                | true` | No public debug copy |
| `grep -R "themeColor.\*var(" src/app public-theme-color.ts    |                                                                | true` | No output            |
| `grep -R "og-image.svg" src public                            |                                                                | true` | No output            |
| `grep -R "zIndex\\                                            | z-index" src/app/opengraph-image.tsx src/app/twitter-image.tsx |       | true`                | No output |

Local runtime verification:

- Local root rendered `theme-color` as `#C9A66B`.
- Local root rendered canonical metadata.
- Local root rendered OG/Twitter PNG image routes.
- `/opengraph-image` returned `image/png`, `1200x630`, about `59,716` bytes.
- `/twitter-image` returned `image/png`, `1200x630`, about `59,716` bytes.
- Public root visually showed no debug note.
- Login links remained visible.

## Guardrail Failure Tests

- Temporarily changed theme color to `var(--wheat-500)`:
  - `npm run lint:metadata` failed as expected.
- Temporarily changed OG/Twitter image URL to `/bad-preview.svg`:
  - `npm run lint:metadata` failed as expected.
- Temporarily removed canonical metadata:
  - `npm run lint:metadata` failed as expected.
- Reverted each temporary change and confirmed `npm run lint:metadata` passed.

## QA Status

`✅ TASK 0 LOCAL QA PASS — Authenticated smoke blocked by unrelated Auth0 local environment issue; production verification pending deploy.`

- Talent Partner and Candidate authenticated smoke passed on `http://localhost:3000`.
- `http://127.0.0.1:3000` reproduced `callback_failed` / `invalid_state`.
- The redirect URI always used `http://localhost:3000/auth/callback`.
- This is classified as a local Auth0 hostname/config issue, not a Task 0 regression.

## Production Status

- Production `https://winoe.ai` is still stale.
- Production still showed old metadata/debug note during QA.
- This is expected until this PR is merged and deployed.
- Production verification must be rerun after deploy.

## Risk / Rollback

- Risk is low; changes are public metadata and homepage debug-copy removal only.
- The metadata guardrail reduces regression risk.
- Rollback is straightforward by reverting this PR.
- No backend changes.
- No landing-page rebuild included.

## Reviewer Notes

- This PR intentionally does not build the new landing page.
- This PR intentionally does not change authenticated Talent Partner or Candidate product flows.
- Backend orchestrated precommit failure, if seen externally, is unrelated to this frontend-only Task 0 and backend has no diff.
