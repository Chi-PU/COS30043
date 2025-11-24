#!/bin/bash

# Database Restore Script from Cloud Backup

set -e

# Load environment variables
source .env

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="ecommerce_db"

echo "🔄 Starting database restore..."

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide a backup file name or 'latest'"
    echo "Usage: ./restore-database.sh <backup_file.sql.gz> OR ./restore-database.sh latest"
    exit 1
fi

BACKUP_FILE=$1

# If 'latest' is specified, download from cloud
if [ "$BACKUP_FILE" == "latest" ]; then
    echo "📥 Downloading latest backup from cloud..."
    
    if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
        # Download from S3
        LATEST_BACKUP=$(aws s3 ls s3://$S3_BUCKET_NAME/backups/ | sort | tail -n 1 | awk '{print $4}')
        aws s3 cp "s3://$S3_BUCKET_NAME/backups/$LATEST_BACKUP" "$BACKUP_DIR/"
        BACKUP_FILE="$BACKUP_DIR/$LATEST_BACKUP"
        
    elif [ ! -z "$GCS_PROJECT_ID" ]; then
        # Download from GCS
        LATEST_BACKUP=$(gsutil ls gs://$GCS_BUCKET_NAME/backups/ | sort | tail -n 1 | xargs basename)
        gsutil cp "gs://$GCS_BUCKET_NAME/backups/$LATEST_BACKUP" "$BACKUP_DIR/"
        BACKUP_FILE="$BACKUP_DIR/$LATEST_BACKUP"
    else
        echo "❌ No cloud storage configured!"
        exit 1
    fi
else
    # Use provided local file
    if [ ! -f "$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

echo "📂 Using backup file: $BACKUP_FILE"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
    SQL_FILE="${BACKUP_FILE%.gz}"
else
    SQL_FILE="$BACKUP_FILE"
fi

# Confirm restore
read -p "⚠️  This will overwrite the current database. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled."
    exit 1
fi

# Drop existing database and recreate
echo "🗑️  Dropping existing database..."
docker exec $CONTAINER_NAME psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker exec $CONTAINER_NAME psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Restore database
echo "📥 Restoring database..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME < "$SQL_FILE"

# Clean up decompressed file
if [[ $BACKUP_FILE == *.gz ]]; then
    rm "$SQL_FILE"
fi

echo "✅ Database restored successfully!"
echo "🔄 Restarting services..."
docker-compose restart backend recommendation

echo "✅ Restore process completed!"