# Database Migration Instructions

## Apply Retry & Alerts Migration

**Migration File:** `supabase/migrations/20251122_add_retry_and_alerts.sql`

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/20251122_add_retry_and_alerts.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Via Supabase CLI

```bash
# Make sure you're in the project directory
cd /path/to/ETLA-Platform

# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
npx supabase db push
```

### Option 3: Via psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/20251122_add_retry_and_alerts.sql
```

---

## What This Migration Adds

### 1. Retry Tracking
- `retry_count` - Number of retry attempts
- `max_retries` - Maximum retries allowed
- `retry_at` - Next retry timestamp
- `original_sync_id` - Link to original failed sync
- `is_retry` - Flag indicating if this is a retry

### 2. Alert Configuration
- `alert_on_failure` - Send alert when sync fails
- `alert_on_success` - Send alert when sync succeeds
- `alert_emails` - Email addresses for notifications
- `alert_webhook_url` - Webhook URL for alerts

### 3. Incremental Sync
- `sync_mode` - full, incremental, or delta
- `last_sync_timestamp` - Last successful sync time
- `incremental_key` - Field for tracking changes
- `watermark_value` - Last value from previous sync

### 4. Alert History Table
- Tracks all sent alerts
- Records delivery status
- Stores error messages

### 5. Helper Functions
- `calculate_next_retry()` - Exponential backoff calculation
- `schedule_sync_retry()` - Schedule retry for failed sync
- `update_sync_watermark()` - Update incremental sync watermark

### 6. Views
- `pending_sync_retries` - View of syncs ready for retry

---

## Verify Migration

After applying the migration, verify it worked:

```sql
-- Check new columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'integration_sync_history' 
AND column_name IN ('retry_count', 'max_retries', 'retry_at');

-- Check new table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'integration_alert_history';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('calculate_next_retry', 'schedule_sync_retry', 'update_sync_watermark');
```

Expected output: Should return all the new columns, table, and functions.

---

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Drop new table
DROP TABLE IF EXISTS integration_alert_history CASCADE;

-- Drop new functions
DROP FUNCTION IF EXISTS calculate_next_retry CASCADE;
DROP FUNCTION IF EXISTS schedule_sync_retry CASCADE;
DROP FUNCTION IF EXISTS update_sync_watermark CASCADE;

-- Drop new view
DROP VIEW IF EXISTS pending_sync_retries CASCADE;

-- Remove columns from integration_sync_history
ALTER TABLE integration_sync_history
DROP COLUMN IF EXISTS retry_count,
DROP COLUMN IF EXISTS max_retries,
DROP COLUMN IF EXISTS retry_at,
DROP COLUMN IF EXISTS original_sync_id,
DROP COLUMN IF EXISTS is_retry;

-- Remove columns from integration_configs
ALTER TABLE integration_configs
DROP COLUMN IF EXISTS alert_on_failure,
DROP COLUMN IF EXISTS alert_on_success,
DROP COLUMN IF EXISTS alert_emails,
DROP COLUMN IF EXISTS alert_webhook_url;

-- Remove columns from integration_sync_configs
ALTER TABLE integration_sync_configs
DROP COLUMN IF EXISTS sync_mode,
DROP COLUMN IF EXISTS last_sync_timestamp,
DROP COLUMN IF EXISTS incremental_key,
DROP COLUMN IF EXISTS watermark_value;
```

---

## Next Steps

After applying this migration, the following features will be enabled:

1. ✅ Retry failed syncs with exponential backoff
2. ✅ Email alerts on sync failures/successes
3. ✅ Incremental sync (only sync changed records)
4. ✅ Alert history tracking
5. ✅ Webhook notifications

The UI components for these features are being built and will be available soon!
