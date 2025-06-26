#!/bin/bash

# Configuration
APP_NAME="autovault"
DEPLOY_ENV=$1
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/deployments"

# Check if environment argument is provided
if [ -z "$DEPLOY_ENV" ]; then
    echo "Error: Please specify deployment environment (production/staging)"
    echo "Usage: ./deploy.sh [production|staging]"
    exit 1
fi

# Validate environment
if [ "$DEPLOY_ENV" != "production" ] && [ "$DEPLOY_ENV" != "staging" ]; then
    echo "Error: Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

echo "Starting deployment to $DEPLOY_ENV environment..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to handle errors
handle_error() {
    echo "Error: Deployment failed at step: $1"
    echo "Rolling back changes..."
    # Add rollback logic here
    exit 1
}

# Backup current deployment
echo "Creating backup of current deployment..."
tar -czf "$BACKUP_DIR/${APP_NAME}_${DEPLOY_ENV}_${TIMESTAMP}.tar.gz" . \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="logs" \
    --exclude="uploads" \
    || handle_error "backup"

# Pull latest changes
echo "Pulling latest changes from git..."
git pull origin main || handle_error "git pull"

# Install dependencies
echo "Installing dependencies..."
npm ci || handle_error "npm install"

# Run tests
echo "Running tests..."
npm test || handle_error "tests"

# Build application
echo "Building application..."
npm run build || handle_error "build"

# Database migration
echo "Running database migrations..."
node scripts/init-db.js || handle_error "database migration"

# Stop current application
echo "Stopping current application..."
if [ "$DEPLOY_ENV" = "production" ]; then
    docker-compose -f docker-compose.yml down || handle_error "docker compose down"
else
    docker-compose -f docker-compose.staging.yml down || handle_error "docker compose down"
fi

# Start new application
echo "Starting new application..."
if [ "$DEPLOY_ENV" = "production" ]; then
    docker-compose -f docker-compose.yml up -d || handle_error "docker compose up"
else
    docker-compose -f docker-compose.staging.yml up -d || handle_error "docker compose up"
fi

# Verify deployment
echo "Verifying deployment..."
sleep 10  # Wait for application to start

# Check if application is responding
curl -f http://localhost:3000/health || handle_error "health check"

# Clean up old backups (keep last 5)
echo "Cleaning up old backups..."
ls -t $BACKUP_DIR/${APP_NAME}_${DEPLOY_ENV}_*.tar.gz | tail -n +6 | xargs -r rm

# Create deployment report
echo "Creating deployment report..."
cat << EOF > "$BACKUP_DIR/deploy_report_${TIMESTAMP}.txt"
Deployment Report
================

Date: $(date)
Environment: $DEPLOY_ENV
Git Commit: $(git rev-parse HEAD)
Node Version: $(node -v)
NPM Version: $(npm -v)

Backup File: ${APP_NAME}_${DEPLOY_ENV}_${TIMESTAMP}.tar.gz
Deployment Status: Success

Environment Variables:
- NODE_ENV: $DEPLOY_ENV
- PORT: 3000

Services Status:
$(docker-compose ps)

EOF

echo "Deployment completed successfully!"
echo "Deployment report: $BACKUP_DIR/deploy_report_${TIMESTAMP}.txt"

# Monitoring instructions
cat << EOF

Monitoring Instructions:
1. Check application logs:
   docker-compose logs -f app

2. Monitor resources:
   docker stats

3. View deployment report:
   cat $BACKUP_DIR/deploy_report_${TIMESTAMP}.txt

4. Rollback if needed:
   ./scripts/rollback.sh $DEPLOY_ENV ${APP_NAME}_${DEPLOY_ENV}_${TIMESTAMP}.tar.gz

Note: Monitor the application for the next few minutes to ensure stability.
EOF

# Notify team (customize as needed)
if [ "$DEPLOY_ENV" = "production" ]; then
    echo "Remember to notify the team about the production deployment!"
fi
