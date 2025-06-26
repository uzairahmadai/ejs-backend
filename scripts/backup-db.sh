#!/bin/bash

# Configuration
BACKUP_DIR="backups/mongodb"
MONGODB_URI="mongodb://localhost:27017/autovault"
DATE=$(date +"%Y%m%d_%H%M%S")
MAX_BACKUPS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting MongoDB backup..."

# Create backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Create compressed archive
    cd $BACKUP_DIR
    tar -czf "backup_$DATE.tar.gz" "backup_$DATE"
    
    # Remove uncompressed backup directory
    rm -rf "backup_$DATE"
    
    echo "Backup archived as backup_$DATE.tar.gz"
    
    # Remove old backups (keep last MAX_BACKUPS)
    echo "Cleaning up old backups..."
    ls -t *.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
    
    # List remaining backups
    echo "Current backups:"
    ls -lh *.tar.gz
else
    echo "Backup failed!"
    exit 1
fi

# Create backup report
echo "Creating backup report..."
cat << EOF > "$BACKUP_DIR/backup_report_$DATE.txt"
Backup Report
============

Date: $(date)
Backup File: backup_$DATE.tar.gz
Size: $(ls -lh "$BACKUP_DIR/backup_$DATE.tar.gz" | awk '{print $5}')
MongoDB URI: $MONGODB_URI

Collections backed up:
$(mongosh "$MONGODB_URI" --quiet --eval "db.getCollectionNames()")

EOF

echo "Backup process completed!"
echo "Backup location: $BACKUP_DIR/backup_$DATE.tar.gz"
echo "Report location: $BACKUP_DIR/backup_report_$DATE.txt"

# Restore instructions
cat << EOF

To restore this backup, use:
1. Extract the archive:
   tar -xzf $BACKUP_DIR/backup_$DATE.tar.gz

2. Restore the database:
   mongorestore --uri="$MONGODB_URI" --dir="backup_$DATE/autovault"

Note: Make sure to stop the application before restoring the database.
EOF
