#!/bin/bash
# Phase 1 validation script
# Run this to verify all Phase 1 requirements are met

set -e

echo "=== Phase 1 Validation ==="
echo ""

echo "1. Checking legacy directory structure..."
if [ -d "legacy/server" ] && [ -d "legacy/client" ] && [ -d "legacy/presentation" ]; then
	echo "   PASS: Legacy directories exist"
else
	echo "   FAIL: Legacy directories missing"
	exit 1
fi

echo ""
echo "2. Checking npm workspace structure..."
if [ -f "package-lock.json" ] && ! [ -f "yarn.lock" ]; then
	echo "   PASS: Using npm (not yarn)"
else
	echo "   FAIL: yarn.lock exists or package-lock.json missing"
	exit 1
fi

echo ""
echo "3. Checking Node version..."
if [ -f ".nvmrc" ] && grep -q "22" .nvmrc; then
	echo "   PASS: .nvmrc pins Node 22"
else
	echo "   FAIL: .nvmrc missing or wrong version"
	exit 1
fi

echo ""
echo "4. Building @solve/common..."
npm run build -w @solve/common
echo "   PASS: @solve/common builds"

echo ""
echo "5. Building @solve/api..."
npm run build -w @solve/api
echo "   PASS: @solve/api builds"

echo ""
echo "6. Running lint..."
npm run lint
echo "   PASS: Lint passes"

echo ""
echo "7. Running format check..."
npm run format:check
echo "   PASS: Format check passes"

echo ""
echo "8. Checking CI workflow..."
if [ -f ".github/workflows/ci.yml" ]; then
	echo "   PASS: CI workflow exists"
else
	echo "   FAIL: CI workflow missing"
	exit 1
fi

echo ""
echo "=========================================="
echo "All Phase 1 checks passed!"
echo "=========================================="
