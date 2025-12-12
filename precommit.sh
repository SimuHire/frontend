#!/usr/bin/env bash
set -euo pipefail

echo "Running lint..."
npm run lint

echo "Running unit tests (CI mode)..."
npm run test:ci

echo "Running typecheck..."
npm run typecheck

echo "Building frontend..."
npm run build

echo "precommit checks passed."
