-- ============================================================================
-- Migration: Add Retry Tracking and Alert Configuration (v2 - Schema Verified)
-- ============================================================================
-- Description: Adds fields for retry logic, email alerts, and incremental sync
-- Date: 2025-11-22
-- Version: 1.1
-- Based on actual schema verification
-- ============================================================================

-- ============================================================================
-- 1. Add retry tracking fields to integration_sync_history
-- ============================================================================

ALTER TABLE integration_sync_history
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS retry_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS original_sync_id UUID REFERENCES integration_sync_history(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_retry BOOLEAN DEFAULT false;

-- Add index for retry scheduling
CREATE INDEX IF NOT EXISTS idx_sync_history_retry_at 
ON integration_sync_history(retry_at) 
WHERE retry_at IS NOT NULL AND status = 'failed';

COMMENT ON COLUMN integration_sync_history.retry_count IS 'Number of retry attempts made';
COMMENT ON COLUMN integration_sync_history.max_retries IS 'Maximum number of retries allowed';
COMMENT ON COLUMN integration_sync_history.retry_at IS 'Timestamp for next retry attempt';
COMMENT ON COLUMN integration_sync_history.original_sync_id IS 'Reference to original failed sync if this is a retry';
COMMENT ON COLUMN integration_sync_history.is_retry IS 'True if this sync is a retry of a previous failed sync';


-- ============================================================================
-- 2. Add alert configuration to integration_configs
-- ============================================================================

ALTER TABLE integration_configs
ADD COLUMN IF NOT EXISTS alert_on_failure BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS alert_on_success BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alert_emails TEXT[], -- Array of email addresses
ADD COLUMN IF NOT EXISTS alert_webhook_url TEXT;

COMMENT ON COLUMN integration_configs.alert_on_failure IS 'Send alert when sync fails';
COMMENT ON COLUMN integration_configs.alert_on_success IS 'Send alert when sync succeeds';
COMMENT ON COLUMN integration_configs.alert_emails IS 'Email addresses to notify on alerts';
COMMENT ON COLUMN integration_configs.alert_webhook_url IS 'Webhook URL to call on alerts';


-- ============================================================================
-- 3. Add incremental sync tracking to integration_sync_configs
-- ============================================================================

ALTER TABLE integration_sync_configs
ADD COLUMN IF NOT EXISTS sync_mode VARCHAR(20) DEFAULT 'full', -- 'full', 'incremental', 'delta'
ADD COLUMN IF NOT EXISTS last_sync_timestamp TIMESTAMP,
ADD COLUMN IF NOT EXISTS incremental_key VARCHAR(100), -- Field to use for incremental sync (e.g., 'updated_at')
ADD COLUMN IF NOT EXISTS watermark_value TEXT; -- Last value of incremental key

COMMENT ON COLUMN integration_sync_configs.sync_mode IS 'Sync mode: full (all records), incremental (changed only), delta (new only)';
COMMENT ON COLUMN integration_sync_configs.last_sync_timestamp IS 'Timestamp of last successful sync';
COMMENT ON COLUMN integration_sync_configs.incremental_key IS 'Field name to use for incremental sync tracking';
COMMENT ON COLUMN integration_sync_configs.watermark_value IS 'Last value of incremental key from previous sync';


-- ============================================================================
-- 4. Create alert_history table for tracking sent alerts
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  sync_history_id UUID REFERENCES integration_sync_history(id) ON DELETE SET NULL,
  
  -- Alert details
  alert_type VARCHAR(20) NOT NULL, -- 'failure', 'success', 'warning'
  alert_channel VARCHAR(20) NOT NULL, -- 'email', 'webhook', 'sms'
  recipients TEXT[], -- Email addresses or phone numbers
  
  -- Message
  subject TEXT,
  message TEXT,
  
  -- Status
  sent_at TIMESTAMP DEFAULT NOW(),
  delivery_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
  delivery_error TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alert_history_config ON integration_alert_history(integration_config_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_sync ON integration_alert_history(sync_history_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_status ON integration_alert_history(delivery_status);

COMMENT ON TABLE integration_alert_history IS 'History of all alerts sent for sync events';


-- ============================================================================
-- 5. Create function to calculate next retry time (exponential backoff)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_next_retry(
  retry_count INTEGER,
  base_delay_seconds INTEGER DEFAULT 60
)
RETURNS TIMESTAMP AS $$
BEGIN
  -- Exponential backoff: base_delay * 2^retry_count
  -- Max delay capped at 1 hour (3600 seconds)
  RETURN NOW() + (LEAST(base_delay_seconds * POWER(2, retry_count), 3600) || ' seconds')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

GRANT EXECUTE ON FUNCTION calculate_next_retry TO authenticated;

COMMENT ON FUNCTION calculate_next_retry IS 'Calculates next retry timestamp using exponential backoff';


-- ============================================================================
-- 6. Create function to trigger retry for failed sync
-- ============================================================================

CREATE OR REPLACE FUNCTION schedule_sync_retry(
  sync_id UUID,
  max_retry_attempts INTEGER DEFAULT 3
)
RETURNS BOOLEAN AS $$
DECLARE
  current_retry_count INTEGER;
  next_retry_time TIMESTAMP;
BEGIN
  -- Get current retry count
  SELECT retry_count INTO current_retry_count
  FROM integration_sync_history
  WHERE id = sync_id;
  
  -- Check if we've exceeded max retries
  IF current_retry_count >= max_retry_attempts THEN
    RETURN false;
  END IF;
  
  -- Calculate next retry time
  next_retry_time := calculate_next_retry(current_retry_count + 1);
  
  -- Update sync history with retry schedule
  UPDATE integration_sync_history
  SET 
    retry_at = next_retry_time,
    max_retries = max_retry_attempts
  WHERE id = sync_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION schedule_sync_retry TO authenticated;

COMMENT ON FUNCTION schedule_sync_retry IS 'Schedules a retry for a failed sync with exponential backoff';


-- ============================================================================
-- 7. Create function to update watermark after successful incremental sync
-- ============================================================================

CREATE OR REPLACE FUNCTION update_sync_watermark(
  sync_config_id UUID,
  new_watermark_value TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE integration_sync_configs
  SET 
    last_sync_timestamp = NOW(),
    watermark_value = new_watermark_value,
    updated_at = NOW()
  WHERE id = sync_config_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_sync_watermark TO authenticated;

COMMENT ON FUNCTION update_sync_watermark IS 'Updates watermark value after successful incremental sync';


-- ============================================================================
-- 8. Add RLS policies for new tables
-- ============================================================================

-- Enable RLS on alert_history table
ALTER TABLE integration_alert_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view alerts for their tenant's integrations
CREATE POLICY alert_history_select_policy ON integration_alert_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM integration_configs ic
    WHERE ic.id = integration_alert_history.integration_config_id
    AND ic.tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM tenant_users
    WHERE user_id = auth.uid()
    AND role IN ('host_admin', 'super_admin')
  )
);

-- Policy: Only admins can insert alert history
CREATE POLICY alert_history_insert_policy ON integration_alert_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenant_users
    WHERE user_id = auth.uid()
    AND role IN ('host_admin', 'super_admin', 'tenant_admin')
  )
);


-- ============================================================================
-- 9. Create view for pending retries
-- ============================================================================

CREATE OR REPLACE VIEW pending_sync_retries AS
SELECT 
  sh.id,
  sh.integration_config_id,
  sh.endpoint_name,
  sh.retry_count,
  sh.max_retries,
  sh.retry_at,
  sh.error_message,
  ic.integration_name,
  ic.tenant_id
FROM integration_sync_history sh
JOIN integration_configs ic ON sh.integration_config_id = ic.id
WHERE sh.status = 'failed'
  AND sh.retry_at IS NOT NULL
  AND sh.retry_at <= NOW()
  AND sh.retry_count < sh.max_retries
ORDER BY sh.retry_at ASC;

COMMENT ON VIEW pending_sync_retries IS 'View of failed syncs that are ready for retry';

GRANT SELECT ON pending_sync_retries TO authenticated;
