#!/bin/bash
# scripts/restore.sh

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="crm_production"
DB_USER="crm_user"

echo "⚠️  WARNING: This will replace current database!"
echo "Backup file: $BACKUP_FILE"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "🔄 Starting restore process..."

# Stop application
echo "⏸️  Stopping application..."
pm2 stop all

# Drop and recreate database
echo "🗑️  Dropping database..."
psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U postgres -c "CREATE DATABASE $DB_NAME;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Restore database
echo "📦 Restoring database..."
gunzip -c $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME

# Start application
echo "▶️  Starting application..."
pm2 restart all

# Health check
sleep 5
if curl -f http://localhost:3000/health; then
    echo "✅ Restore completed successfully!"
else
    echo "❌ Health check failed. Please investigate."
    exit 1
fi
