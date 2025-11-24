#!/bin/bash

# Setup automated daily backups using cron

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-database.sh"

echo "🕐 Setting up automated daily backups..."

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

# Create cron job (runs daily at 2 AM)
CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> $SCRIPT_DIR/../logs/backup.log 2>&1"

# Check if cron job already exists
(crontab -l 2>/dev/null | grep -F "$BACKUP_SCRIPT") && {
    echo "⚠️  Cron job already exists. Removing old entry..."
    crontab -l | grep -v "$BACKUP_SCRIPT" | crontab -
}

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added successfully!"
echo "📅 Backups will run daily at 2:00 AM"
echo ""
echo "To view cron jobs: crontab -l"
echo "To remove cron job: crontab -e"
echo ""
echo "Logs will be saved to: $SCRIPT_DIR/../logs/backup.log"

# Create logs directory
mkdir -p "$SCRIPT_DIR/../logs"