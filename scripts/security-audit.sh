#!/usr/bin/env bash
set -euo pipefail

echo "[+] Running dependency audit"
npm audit --production

echo "[+] Checking npm packages for known vulnerabilities"
npx retire

echo "[+] Running ESLint security rules"
npm run lint

echo "[+] Security audit completed"
