#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker не найден. Установите Docker Desktop или Docker Engine." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "docker compose или docker-compose не найдены." >&2
  exit 1
fi

echo "Запуск базы данных и backend через Docker Compose..."
"${COMPOSE_CMD[@]}" up -d db backend

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "node_modules не найдены. Устанавливаем зависимости..."
  npm install
fi

echo "Запуск frontend (Vite)..."
npm run dev
