#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker Desktop or Docker Engine." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "docker compose or docker-compose not found." >&2
  exit 1
fi

echo "Starting database and backend via Docker Compose..."
"${COMPOSE_CMD[@]}" up -d db backend

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "node_modules not found. Installing dependencies..."
  npm install
fi

echo "Starting frontend (Vite)..."
npm run dev
