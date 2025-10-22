#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${1:-}" ]]; then
  echo "Usage: ./scripts/restore.sh <backup-folder>"
  exit 1
fi

BACKUP_DIR="$1"

echo "[+] Restoring database from ${BACKUP_DIR}/database.sql"
psql "$DATABASE_URL" < "${BACKUP_DIR}/database.sql"

echo "[+] Restoring uploaded assets"
rsync -av --delete "${BACKUP_DIR}/assets/" "$ASSETS_DIR/"

echo "[+] Restore completed"
