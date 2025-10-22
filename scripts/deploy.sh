#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Configuration
APP_DIR="/var/www/crm"
BRANCH="main"
NODE_ENV="production"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to app directory
cd $APP_DIR

# Backup current version
echo "💾 Creating backup..."
./scripts/backup.sh

# Pull latest code
echo "📥 Pulling latest code from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH
echo -e "${GREEN}✅ Code updated${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build application
echo "🔨 Building application..."
npm run build
echo -e "${GREEN}✅ Build completed${NC}"

# Run database migrations
echo "🗄️  Running migrations..."
npm run migrate:prod
echo -e "${GREEN}✅ Migrations completed${NC}"

# Restart application
echo "🔄 Restarting application..."
pm2 restart ecosystem.config.js
echo -e "${GREEN}✅ Application restarted${NC}"

# Wait for app to start
echo "⏳ Waiting for application to start..."
sleep 10

# Health check
echo "🏥 Running health check..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ $HEALTH_CHECK -eq 200 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    
    # Log deployment
    echo "$(date) - Deployment successful - $(git rev-parse --short HEAD)" >> $APP_DIR/logs/deployments.log
else
    echo -e "${RED}❌ Health check failed (Status: $HEALTH_CHECK)${NC}"
    echo "🔙 Rolling back..."
    git checkout HEAD~1
    npm ci --production
    npm run build
    pm2 restart ecosystem.config.js
    echo -e "${RED}❌ Deployment failed. Rolled back to previous version.${NC}"
    exit 1
fi

# Clear cache (optional)
echo "🧹 Clearing cache..."
redis-cli FLUSHDB


echo "📊 Deployment Summary:"
echo "  Version: $(git rev-parse --short HEAD)"
echo "  Branch: $BRANCH"
echo "  Time: $(date)"
echo "  Status: Success ✅"
