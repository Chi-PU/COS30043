#!/bin/bash

# Database Backup Script with Cloud Sync
# Supports AWS S3 and Google Cloud Storage

set -e

# Load environment variables
source ../.env

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="ecommerce_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="ecommerce_db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "📦 Starting database backup..."

# Create database dump
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_DIR/$BACKUP_FILE"
COMPRESSED_FILE="$BACKUP_DIR/${BACKUP_FILE}.gz"

echo "✅ Backup created: $COMPRESSED_FILE"

# Upload to cloud storage
if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "☁️  Uploading to AWS S3..."
    
    # Install AWS CLI if not present
    if ! command -v aws &> /dev/null; then
        echo "Installing AWS CLI..."
        pip install awscli
    fi
    
    # Upload to S3
    aws s3 cp "$COMPRESSED_FILE" "s3://$S3_BUCKET_NAME/backups/" \
        --region $AWS_REGION
    
    echo "✅ Uploaded to S3: s3://$S3_BUCKET_NAME/backups/${BACKUP_FILE}.gz"
    
elif [ ! -z "$GCS_PROJECT_ID" ]; then
    echo "☁️  Uploading to Google Cloud Storage..."
    
    # Install gsutil if not present
    if ! command -v gsutil &> /dev/null; then
        echo "Installing Google Cloud SDK..."
        curl https://sdk.cloud.google.com | bash
        exec -l $SHELL
    fi
    
    # Authenticate if key file exists
    if [ -f "$GCS_KEY_FILE" ]; then
        gcloud auth activate-service-account --key-file=$GCS_KEY_FILE
    fi
    
    # Upload to GCS
    gsutil cp "$COMPRESSED_FILE" "gs://$GCS_BUCKET_NAME/backups/"
    
    echo "✅ Uploaded to GCS: gs://$GCS_BUCKET_NAME/backups/${BACKUP_FILE}.gz"
else
    echo "⚠️  No cloud storage configured. Backup saved locally only."
fi

# Clean up old local backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup process completed!"
echo "📊 Backup size: $(du -h $COMPRESSED_FILE | cut -f1)"