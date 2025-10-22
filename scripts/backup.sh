#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/crm"
DB_NAME="crm_production"
DB_USER="crm_user"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🔄 Starting backup process..."

# Database backup
echo "📦 Backing up database..."
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/db-$DATE.sql.gz
echo "✅ Database backup completed"

# Files backup
echo "📦 Backing up files..."
tar -czf $BACKUP_DIR/files-$DATE.tar.gz /var/www/crm/uploads
echo "✅ Files backup completed"

# Upload to S3 (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "☁️ Uploading to S3..."
    aws s3 cp $BACKUP_DIR/db-$DATE.sql.gz s3://$AWS_S3_BUCKET/backups/
    aws s3 cp $BACKUP_DIR/files-$DATE.tar.gz s3://$AWS_S3_BUCKET/backups/
    echo "✅ Uploaded to S3"
fi

# Clean old backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "✅ Old backups cleaned"

echo "🎉 Backup completed successfully!"
