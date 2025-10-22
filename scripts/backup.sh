#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backups/${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"

echo "[+] Creating database backup"
pg_dump "$DATABASE_URL" > "${BACKUP_DIR}/database.sql"

echo "[+] Archiving uploaded assets"
rsync -av --delete "$ASSETS_DIR/" "${BACKUP_DIR}/assets/"

echo "[+] Storing environment snapshot"
printenv | grep -E '^(APP_|API_|DB_)' > "${BACKUP_DIR}/env.snapshot"

echo "[+] Backup completed at ${BACKUP_DIR}"
