#!/bin/bash
# scripts/rollback.sh

set -e

echo "⏮️  Starting rollback process..."

APP_DIR="/var/www/crm"
cd $APP_DIR

# Get previous commit
CURRENT_COMMIT=$(git rev-parse HEAD)
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

echo "Current version: $CURRENT_COMMIT"
echo "Rolling back to: $PREVIOUS_COMMIT"

read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

# Checkout previous version
echo "📥 Checking out previous version..."
git checkout $PREVIOUS_COMMIT

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build
echo "🔨 Building..."
npm run build

# Restart
echo "🔄 Restarting..."
pm2 restart ecosystem.config.js

# Health check
sleep 5
if curl -f http://localhost:3000/health; then
    echo "✅ Rollback completed successfully!"
    echo "$(date) - Rollback to $PREVIOUS_COMMIT" >> logs/deployments.log
else
    echo "❌ Health check failed after rollback!"
    exit 1
fi
