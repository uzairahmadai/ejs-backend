#!/bin/bash

# Configuration
APP_NAME="autovault"
DEPLOY_ENV=$1
BACKUP_FILE=$2
BACKUP_DIR="backups/deployments"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ROLLBACK_DIR="rollbacks"

# Check if required arguments are provided
if [ -z "$DEPLOY_ENV" ] || [ -z "$BACKUP_FILE" ]; then
    echo "Error: Missing required arguments"
    echo "Usage: ./rollback.sh [production|staging] [backup_file.tar.gz]"
    exit 1
fi

# Validate environment
if [ "$DEPLOY_ENV" != "production" ] && [ "$DEPLOY_ENV" != "staging" ]; then
    echo "Error: Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    echo "Available backups:"
    ls -l $BACKUP_DIR
    exit 1
fi

# Function to handle errors
handle_error() {
    echo "Error: Rollback failed at step: $1"
    echo "Please check the logs and resolve manually"
    exit 1
}

echo "Starting rollback to previous version..."
echo "Environment: $DEPLOY_ENV"
echo "Backup file: $BACKUP_FILE"

# Create rollback directory
mkdir -p $ROLLBACK_DIR

# Backup current state before rollback
echo "Backing up current state..."
tar -czf "$ROLLBACK_DIR/${APP_NAME}_${DEPLOY_ENV}_pre_rollback_${TIMESTAMP}.tar.gz" . \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="logs" \
    --exclude="uploads" \
    || handle_error "backup current state"

# Stop current application
echo "Stopping current application..."
if [ "$DEPLOY_ENV" = "production" ]; then
    docker-compose -f docker-compose.yml down || handle_error "docker compose down"
else
    docker-compose -f docker-compose.staging.yml down || handle_error "docker compose down"
fi

# Create temporary directory for rollback
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Extract backup to temporary directory
echo "Extracting backup..."
tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C "$TEMP_DIR" || handle_error "extract backup"

# Preserve current uploads and logs
echo "Preserving uploads and logs..."
cp -r uploads/* "$TEMP_DIR/uploads/" 2>/dev/null || true
cp -r logs/* "$TEMP_DIR/logs/" 2>/dev/null || true

# Remove current application files (preserve certain directories)
echo "Removing current application files..."
find . -maxdepth 1 -not -name "." \
       -not -name "uploads" \
       -not -name "logs" \
       -not -name "node_modules" \
       -not -name ".git" \
       -exec rm -rf {} \;

# Copy files from backup
echo "Restoring files from backup..."
cp -r "$TEMP_DIR"/* . || handle_error "restore files"

# Install dependencies
echo "Installing dependencies..."
npm ci || handle_error "npm install"

# Database rollback (if backup contains database dump)
if [ -f "$TEMP_DIR/database/dump.gz" ]; then
    echo "Rolling back database..."
    mongorestore --gzip --archive="$TEMP_DIR/database/dump.gz" || handle_error "database rollback"
fi

# Start application with rolled back version
echo "Starting application..."
if [ "$DEPLOY_ENV" = "production" ]; then
    docker-compose -f docker-compose.yml up -d || handle_error "docker compose up"
else
    docker-compose -f docker-compose.staging.yml up -d || handle_error "docker compose up"
fi

# Verify rollback
echo "Verifying rollback..."
sleep 10  # Wait for application to start

# Check if application is responding
curl -f http://localhost:3000/health || handle_error "health check"

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

# Create rollback report
echo "Creating rollback report..."
cat << EOF > "$ROLLBACK_DIR/rollback_report_${TIMESTAMP}.txt"
Rollback Report
==============

Date: $(date)
Environment: $DEPLOY_ENV
Rolled back to: $BACKUP_FILE
Pre-rollback backup: ${APP_NAME}_${DEPLOY_ENV}_pre_rollback_${TIMESTAMP}.tar.gz

Application Status:
$(docker-compose ps)

Note: If you need to roll forward again, use:
./scripts/deploy.sh $DEPLOY_ENV

Pre-rollback backup is available at:
$ROLLBACK_DIR/${APP_NAME}_${DEPLOY_ENV}_pre_rollback_${TIMESTAMP}.tar.gz
EOF

echo "Rollback completed successfully!"
echo "Rollback report: $ROLLBACK_DIR/rollback_report_${TIMESTAMP}.txt"

# Monitoring instructions
cat << EOF

Post-Rollback Instructions:
1. Verify application functionality
2. Check application logs:
   docker-compose logs -f app
3. Monitor for any issues
4. Notify team members about the rollback

To roll forward again:
./scripts/deploy.sh $DEPLOY_ENV

EOF

# Notify team (customize as needed)
if [ "$DEPLOY_ENV" = "production" ]; then
    echo "Remember to notify the team about the production rollback!"
fi
