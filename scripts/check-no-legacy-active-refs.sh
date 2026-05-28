#!/usr/bin/env bash
set -euo pipefail

patterns=(
  "Tenon"
  "tenon"
  "SimuHire"
  "simuhire"
  "Fit Profile"
  "fit profile"
  "Fit Score"
  "fit score"
  "simError"
  "simulation"
  "Simulation"
  "recruiter"
  "Recruiter"
  "Template Catalog"
  "Precommit"
  "precommit"
  "Codespace Specializor"
  "Codespace Specification"
)

targets=(
  "src"
  "tests"
  "public"
  "package.json"
  ".github"
  "README.md"
  "pr.md"
)

matches=0
for pattern in "${patterns[@]}"; do
  result="$(
    rg -n -i --hidden --fixed-strings -e "$pattern" "${targets[@]}" \
    --glob '!**/node_modules/**' \
    --glob '!**/.next/**' \
    --glob '!src/app/(candidate)/(legacy)/candidate-sessions/**' \
    --glob '!tests/unit/app/candidate/legacyRouteRedirect.test.ts' \
    --glob '!tests/unit/proxy.candidateRoutes.test.ts' \
    --glob '!tests/unit/lib/authRouting.extra.test.ts' \
    --glob '!tests/unit/app/public/LoginPage.test.tsx' \
    --glob '!tests/unit/features/candidate/portal/CandidateDashboardPage.extractInviteToken*.ts' \
    --glob '!tests/unit/features/candidate/tasks/CandidateTaskView.day3ImplementationWrapUp.test.tsx' \
    --glob '!tests/unit/features/candidate/tasks/components/WorkspacePanelCopy.test.tsx' \
    --glob '!tests/e2e/**' \
    --glob '!scripts/check-no-legacy-active-refs.sh' || true
  )"
  if [[ -n "$result" ]]; then
    filtered="$(
      printf '%s\n' "$result" |
        awk '!(($0 ~ /^pr\.md:/) && (($0 ~ /\.\/precommit\.sh/) || ($0 ~ /rg -n -i/)))'
    )"
  else
    filtered=""
  fi
  if [[ -n "$filtered" ]]; then
    printf '%s\n' "$filtered"
    matches=1
  fi
done

if [[ "$matches" -ne 0 ]]; then
  echo "Legacy active-code references found." >&2
  exit 1
fi

echo "No legacy active-code references found."
