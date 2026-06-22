# Task 4: Public Landing Page

# Summary

- Replaces the old bare `/` launcher with a polished Winoe AI public landing page for signed-out visitors.
- Adds a Winoe-branded marketing shell with top bar, footer, hero, Trial strip, evidence-first messaging, credibility band, and Winoe Report proof visual.
- Preserves `/login` and existing auth entry points while making the public top bar auth-aware.
- Updates marketing metadata, OG, and Twitter image behavior to use Winoe terminology and PNG image endpoints.

# Why

`/` previously behaved like a bare launcher instead of a credible public entry point. Task 4 makes the root route serve as a public marketing surface for Talent Partners while preserving the existing Talent Partner and Candidate auth paths.

# What Changed

## Public landing page

- Added a signed-out public landing page with Winoe wordmark, Talent Partner login, Candidate portal, and request-access CTA.
- Added the hero promise: "Reveal the real hire. Prove it with work."
- Added public sections for the 3-step Trial flow, evidence-first differentiation, truthful design-partner credibility, and a thin footer.
- Positioned Winoe AI as real-work hiring using canonical Winoe terminology.

## Auth-aware navigation

- Added auth-aware top bar behavior for the marketing surface.
- Preserved `/login`.
- Signed-in users are not shown misleading public login or request-access CTAs.

## Winoe Report proof visual

- Added the public Winoe Report proof PNG at `public/marketing/winoe-report-preview.png`.
- Added `scripts/generate-marketing-report-preview.mjs` for regenerating the proof visual.
- Surfaced Winoe Reports, Winoe Scores, and Evidence Trails in the public story.

## Metadata / OG / Twitter

- Updated marketing metadata to use Winoe AI, Trials, Winoe Reports, Winoe Scores, and Evidence Trails.
- Ensured OG and Twitter images resolve through PNG endpoints.
- Verified `/opengraph-image` and `/twitter-image` return PNG images at 1200x630.
- Deleted the unused `public/og-image.svg`.
- Verified theme color is the literal `#C9A66B`.

## QA artifact hygiene

- Added `/qa_verifications/landing-page/` to `.gitignore`.
- Kept locally captured QA screenshots and reports out of git.
- Added `scripts/landing-page-qa.mjs` for focused landing page QA.

## Tests

- Added and updated unit coverage for marketing metadata, signed-out and signed-in marketing content, and `MarketingTopBar`.
- Updated related app navigation test expectations for the new marketing behavior.

# Product Notes

- Brand promise: "Reveal the real hire. Prove it with work."
- Winoe AI is positioned as real-work hiring.
- Winoe Reports, Winoe Scores, and Evidence Trails are visible in the public story.
- No fake logos, fake testimonials, or unsupported claims were added.
- Signed-in users are not shown misleading public login or request-access CTAs.

# QA

- `./precommit.sh` PASS.
- Frontend tests PASS: 540 suites / 1737 tests.
- Typecheck PASS.
- Production build PASS.
- Local production server QA PASS.
- Signed-out `/` PASS.
- `/login` PASS.
- Talent Partner login PASS.
- Candidate login PASS.
- Responsive QA PASS at 1440 / 1280 / 375.
- Metadata / OG / Twitter QA PASS.
- Lighthouse Performance: 91.
- Lighthouse Accessibility: 96.
- Lighthouse Best Practices: 96.
- Lighthouse SEO: 100.
- Final git status clean during QA.

# Manual QA Details

- Backend: local `http://localhost:8000`.
- Frontend: local `http://localhost:3000`.
- Backend commands used: `./runBackend.sh api`, `./runBackend.sh worker`.
- Frontend commands used: `npm run build`, `npm run start`.
- Backend `/health`: 200.
- Backend `/ready`: 200 after worker start.
- Frontend `/api/health`: upstream status 200.

# Risk / Caveats

- QA was run on checked-out `main`; before PR creation, commit `bf6601ef1ae7231688e3d93105b0b59d4218345d` must be pushed or moved to the intended feature branch and must not be pushed directly to remote `main`.
- Local ignored QA artifacts were generated under `qa_verifications/landing-page/...` and are intentionally not tracked.
- Lighthouse noted non-blocking report-only CSP console noise and minor contrast notes, but Accessibility remained 96.

# Screenshots / Artifacts

- Screenshots were captured locally under the ignored QA path and were not committed.
- Do not embed local-only screenshots unless explicitly requested.

# Rollback

Revert the frontend PR to restore the previous marketing home behavior. No migration or backend rollback is required.
