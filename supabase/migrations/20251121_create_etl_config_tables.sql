-- ============================================================================
-- ETL Configuration Management System - Database Migration
-- ============================================================================
-- Description: Creates tables, functions, and policies for managing ETL
--              integrations (HRIS/Payroll systems like Paycom, ADP, etc.)
-- Date: 2025-11-21
-- Version: 1.0
-- ============================================================================

-- Enable required extensions
-- ============================================================================

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable uuid-ossp for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- ENCRYPTION FUNCTIONS
-- ============================================================================

-- Function to encrypt sensitive data
-- Uses AES-256 encryption with a master key from environment
CREATE OR REPLACE FUNCTION encrypt_credential(plaintext TEXT)
RETURNS TEXT AS $$
DECLARE
  -- In production, this should come from a secure environment variable
  -- For now, using a placeholder that should be replaced
  encryption_key TEXT := current_setting('app.encryption_key', true);
BEGIN
  -- If no encryption key is set, use a default (NOT RECOMMENDED FOR PRODUCTION)
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := 'helixbridge_default_key_change_in_production';
  END IF;
  
  RETURN encode(
    pgp_sym_encrypt(plaintext, encryption_key, 'cipher-algo=aes256'),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_credential(ciphertext TEXT)
RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT := current_setting('app.encryption_key', true);
BEGIN
  -- If no encryption key is set, use a default (NOT RECOMMENDED FOR PRODUCTION)
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := 'helixbridge_default_key_change_in_production';
  END IF;
  
  RETURN pgp_sym_decrypt(
    decode(ciphertext, 'base64'),
    encryption_key
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL if decryption fails
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION encrypt_credential(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_credential(TEXT) TO authenticated;


-- ============================================================================
-- TABLE 1: integration_configs
-- ============================================================================
-- Stores non-sensitive configuration data for each integration

CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Integration details
  integration_type VARCHAR(50) NOT NULL, -- 'paycom', 'adp', 'workday', 'bamboohr', etc.
  integration_name VARCHAR(100), -- User-friendly name (e.g., "Paycom Production")
  environment VARCHAR(20) NOT NULL DEFAULT 'production', -- 'production', 'sandbox', 'staging'
  base_url TEXT, -- API base URL
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  connection_status VARCHAR(20) DEFAULT 'not_configured', -- 'connected', 'failed', 'not_configured'
  last_connection_test TIMESTAMP,
  last_connection_error TEXT,
  
  -- Metadata
  configuration_metadata JSONB DEFAULT '{}', -- Additional non-sensitive config
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID, -- References auth.users(id)
  updated_by UUID, -- References auth.users(id)
  
  -- Ensure unique integration per tenant/environment
  UNIQUE(tenant_id, integration_type, environment)
);

-- Create indexes for performance
CREATE INDEX idx_integration_configs_tenant ON integration_configs(tenant_id);
CREATE INDEX idx_integration_configs_type ON integration_configs(integration_type);
CREATE INDEX idx_integration_configs_active ON integration_configs(is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE integration_configs IS 'Stores non-sensitive configuration for HRIS/Payroll integrations';
COMMENT ON COLUMN integration_configs.integration_type IS 'Type of integration: paycom, adp, workday, bamboohr, etc.';
COMMENT ON COLUMN integration_configs.environment IS 'Environment: production, sandbox, staging';
COMMENT ON COLUMN integration_configs.configuration_metadata IS 'Additional non-sensitive configuration as JSON';


-- ============================================================================
-- TABLE 2: integration_credentials
-- ============================================================================
-- Stores encrypted credentials separately for enhanced security

CREATE TABLE IF NOT EXISTS integration_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  
  -- Credential type
  credential_type VARCHAR(50) NOT NULL, -- 'api_key', 'oauth', 'basic_auth', 'sftp'
  
  -- Encrypted fields (using pgcrypto)
  encrypted_username TEXT, -- For Basic Auth (e.g., Paycom SID)
  encrypted_password TEXT, -- For Basic Auth (e.g., Paycom Token)
  encrypted_api_key TEXT, -- For API Key auth
  encrypted_client_id TEXT, -- For OAuth
  encrypted_client_secret TEXT, -- For OAuth
  encrypted_oauth_refresh_token TEXT, -- For OAuth token refresh
  encrypted_sftp_private_key TEXT, -- For SFTP authentication
  encrypted_additional_data JSONB, -- Other encrypted fields as JSON
  
  -- Credential lifecycle
  last_rotated_at TIMESTAMP,
  expires_at TIMESTAMP,
  rotation_reminder_sent BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP,
  accessed_by UUID, -- References auth.users(id)
  
  -- Ensure unique credential type per integration
  UNIQUE(integration_config_id, credential_type)
);

-- Create indexes
CREATE INDEX idx_integration_credentials_config ON integration_credentials(integration_config_id);
CREATE INDEX idx_integration_credentials_expires ON integration_credentials(expires_at) WHERE expires_at IS NOT NULL;

-- Add comments
COMMENT ON TABLE integration_credentials IS 'Stores encrypted credentials for integrations (separate table for security)';
COMMENT ON COLUMN integration_credentials.credential_type IS 'Type: api_key, oauth, basic_auth, sftp';
COMMENT ON COLUMN integration_credentials.encrypted_username IS 'Encrypted username (e.g., Paycom SID)';
COMMENT ON COLUMN integration_credentials.encrypted_password IS 'Encrypted password/token (e.g., Paycom Token)';


-- ============================================================================
-- TABLE 3: integration_sync_configs
-- ============================================================================
-- Stores data synchronization settings for each endpoint

CREATE TABLE IF NOT EXISTS integration_sync_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  
  -- Endpoint details
  endpoint_name VARCHAR(100) NOT NULL, -- 'employee_directory', 'new_hires', 'payroll', 'time_attendance', etc.
  endpoint_display_name VARCHAR(200), -- User-friendly name
  endpoint_url TEXT, -- Specific endpoint URL (if different from base)
  
  -- Sync settings
  sync_frequency VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'real_time', 'every_15_min', 'hourly', 'daily', 'weekly', 'manual'
  is_enabled BOOLEAN DEFAULT false,
  
  -- Configuration
  filter_criteria JSONB DEFAULT '{}', -- e.g., {"employee_status": "active", "date_range": "last_30_days"}
  field_mapping JSONB DEFAULT '{}', -- e.g., {"paycom_field": "helixbridge_field"}
  transformation_rules JSONB DEFAULT '{}', -- Data transformation logic
  
  -- Scheduling
  last_sync_at TIMESTAMP,
  last_sync_status VARCHAR(20), -- 'success', 'failed', 'partial', 'running'
  last_sync_error TEXT,
  next_sync_at TIMESTAMP,
  sync_schedule_cron VARCHAR(100), -- Cron expression for advanced scheduling
  
  -- Performance metrics
  average_sync_duration_seconds INTEGER,
  average_records_per_sync INTEGER,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique endpoint per integration
  UNIQUE(integration_config_id, endpoint_name)
);

-- Create indexes
CREATE INDEX idx_integration_sync_configs_config ON integration_sync_configs(integration_config_id);
CREATE INDEX idx_integration_sync_configs_enabled ON integration_sync_configs(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_integration_sync_configs_next_sync ON integration_sync_configs(next_sync_at) WHERE next_sync_at IS NOT NULL;

-- Add comments
COMMENT ON TABLE integration_sync_configs IS 'Stores sync configuration for each integration endpoint';
COMMENT ON COLUMN integration_sync_configs.endpoint_name IS 'Endpoint identifier: employee_directory, new_hires, payroll, etc.';
COMMENT ON COLUMN integration_sync_configs.sync_frequency IS 'Frequency: real_time, every_15_min, hourly, daily, weekly, manual';
COMMENT ON COLUMN integration_sync_configs.field_mapping IS 'Maps source fields to destination fields';


-- ============================================================================
-- TABLE 4: integration_sync_history
-- ============================================================================
-- Audit trail of all synchronization attempts

CREATE TABLE IF NOT EXISTS integration_sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  integration_sync_config_id UUID REFERENCES integration_sync_configs(id) ON DELETE SET NULL,
  
  -- Sync details
  endpoint_name VARCHAR(100) NOT NULL,
  sync_started_at TIMESTAMP NOT NULL,
  sync_completed_at TIMESTAMP,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (sync_completed_at - sync_started_at))::INTEGER
  ) STORED,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'running', -- 'success', 'failed', 'partial', 'running', 'cancelled'
  
  -- Metrics
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  
  -- Error handling
  error_message TEXT,
  error_details JSONB,
  error_stack_trace TEXT,
  
  -- Trigger information
  triggered_by VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'scheduled', 'manual', 'webhook', 'api'
  triggered_by_user UUID, -- References auth.users(id)
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_sync_history_config ON integration_sync_history(integration_config_id, sync_started_at DESC);
CREATE INDEX idx_sync_history_status ON integration_sync_history(status);
CREATE INDEX idx_sync_history_started_at ON integration_sync_history(sync_started_at DESC);
CREATE INDEX idx_sync_history_endpoint ON integration_sync_history(endpoint_name);

-- Add comments
COMMENT ON TABLE integration_sync_history IS 'Audit trail of all data synchronization attempts';
COMMENT ON COLUMN integration_sync_history.status IS 'Status: success, failed, partial, running, cancelled';
COMMENT ON COLUMN integration_sync_history.triggered_by IS 'Trigger: scheduled, manual, webhook, api';


-- ============================================================================
-- TABLE 5: integration_audit_log
-- ============================================================================
-- Comprehensive audit trail for compliance (SOC 2, GDPR)

CREATE TABLE IF NOT EXISTS integration_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
  
  -- Action details
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'credential_viewed', 'credential_updated', 'connection_tested'
  entity_type VARCHAR(50), -- 'config', 'credential', 'sync_config', 'sync_history'
  entity_id UUID,
  
  -- Change tracking
  old_value JSONB,
  new_value JSONB,
  changed_fields TEXT[], -- Array of field names that changed
  
  -- User context
  user_id UUID, -- References auth.users(id)
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  
  -- Additional context
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for audit queries
CREATE INDEX idx_audit_log_config ON integration_audit_log(integration_config_id, created_at DESC);
CREATE INDEX idx_audit_log_user ON integration_audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON integration_audit_log(action, created_at DESC);
CREATE INDEX idx_audit_log_created_at ON integration_audit_log(created_at DESC);

-- Add comments
COMMENT ON TABLE integration_audit_log IS 'Comprehensive audit trail for compliance (SOC 2, GDPR)';
COMMENT ON COLUMN integration_audit_log.action IS 'Action: created, updated, deleted, credential_viewed, credential_updated, connection_tested';
COMMENT ON COLUMN integration_audit_log.entity_type IS 'Entity type: config, credential, sync_config, sync_history';


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_audit_log ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- RLS POLICIES: integration_configs
-- ============================================================================

-- Policy: Users can view integrations for their tenant
CREATE POLICY "Users can view their tenant's integrations"
  ON integration_configs FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Policy: Admins can insert integrations for their tenant
CREATE POLICY "Admins can create integrations"
  ON integration_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE user_id = auth.uid()
      AND tenant_id = integration_configs.tenant_id
      AND role IN ('host_admin', 'client_admin')
    )
  );

-- Policy: Admins can update integrations for their tenant
CREATE POLICY "Admins can update integrations"
  ON integration_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE user_id = auth.uid()
      AND tenant_id = integration_configs.tenant_id
      AND role IN ('host_admin', 'client_admin')
    )
  );

-- Policy: Admins can delete integrations for their tenant
CREATE POLICY "Admins can delete integrations"
  ON integration_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE user_id = auth.uid()
      AND tenant_id = integration_configs.tenant_id
      AND role IN ('host_admin', 'client_admin')
    )
  );


-- ============================================================================
-- RLS POLICIES: integration_credentials
-- ============================================================================

-- Policy: Only admins can view credentials (more restrictive)
CREATE POLICY "Only admins can view credentials"
  ON integration_credentials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_credentials.integration_config_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('host_admin', 'client_admin')
    )
  );

-- Policy: Only admins can insert credentials
CREATE POLICY "Only admins can create credentials"
  ON integration_credentials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_credentials.integration_config_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('host_admin', 'client_admin')
    )
  );

-- Policy: Only admins can update credentials
CREATE POLICY "Only admins can update credentials"
  ON integration_credentials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_credentials.integration_config_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('host_admin', 'client_admin')
    )
  );

-- Policy: Only admins can delete credentials
CREATE POLICY "Only admins can delete credentials"
  ON integration_credentials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_credentials.integration_config_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('host_admin', 'client_admin')
    )
  );


-- ============================================================================
-- RLS POLICIES: integration_sync_configs
-- ============================================================================

-- Policy: Users can view sync configs for their tenant
CREATE POLICY "Users can view sync configs"
  ON integration_sync_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_sync_configs.integration_config_id
      AND tu.user_id = auth.uid()
    )
  );

-- Policy: Admins can manage sync configs
CREATE POLICY "Admins can manage sync configs"
  ON integration_sync_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_sync_configs.integration_config_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('host_admin', 'client_admin')
    )
  );


-- ============================================================================
-- RLS POLICIES: integration_sync_history
-- ============================================================================

-- Policy: Users can view sync history for their tenant
CREATE POLICY "Users can view sync history"
  ON integration_sync_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_sync_history.integration_config_id
      AND tu.user_id = auth.uid()
    )
  );

-- Policy: System can insert sync history (for background jobs)
CREATE POLICY "System can insert sync history"
  ON integration_sync_history FOR INSERT
  WITH CHECK (true); -- Allow inserts from system/background jobs

-- Policy: System can update sync history (for background jobs)
CREATE POLICY "System can update sync history"
  ON integration_sync_history FOR UPDATE
  USING (true); -- Allow updates from system/background jobs


-- ============================================================================
-- RLS POLICIES: integration_audit_log
-- ============================================================================

-- Policy: Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON integration_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN tenant_users tu ON tu.tenant_id = ic.tenant_id
      WHERE ic.id = integration_audit_log.integration_config_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('host_admin', 'client_admin')
    )
    OR
    -- Host admins can view all audit logs
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE user_id = auth.uid()
      AND role = 'host_admin'
    )
  );

-- Policy: System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON integration_audit_log FOR INSERT
  WITH CHECK (true); -- Allow inserts from system


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_integration_audit(
  p_integration_config_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_user_email VARCHAR(255);
  v_user_role VARCHAR(50);
BEGIN
  -- Get user details
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  SELECT role INTO v_user_role FROM tenant_users WHERE user_id = auth.uid() LIMIT 1;
  
  -- Insert audit log
  INSERT INTO integration_audit_log (
    integration_config_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value,
    user_id,
    user_email,
    user_role,
    ip_address,
    notes
  ) VALUES (
    p_integration_config_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_value,
    p_new_value,
    auth.uid(),
    v_user_email,
    v_user_role,
    inet_client_addr(),
    p_notes
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_integration_audit TO authenticated;


-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_credentials_updated_at
  BEFORE UPDATE ON integration_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_sync_configs_updated_at
  BEFORE UPDATE ON integration_sync_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- INITIAL DATA / SEED DATA
-- ============================================================================

-- Insert supported integration types (for reference)
-- This can be used by the UI to populate dropdowns
CREATE TABLE IF NOT EXISTS integration_types (
  id VARCHAR(50) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'hris', 'payroll', 'benefits', 'time_tracking'
  description TEXT,
  logo_url TEXT,
  documentation_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE integration_types IS 'Reference table for supported integration types';

-- Insert initial integration types
INSERT INTO integration_types (id, display_name, category, description, sort_order) VALUES
  ('paycom', 'Paycom', 'hris', 'Paycom HRIS and Payroll System', 1),
  ('adp', 'ADP Workforce Now', 'hris', 'ADP Workforce Now HRIS and Payroll', 2),
  ('workday', 'Workday', 'hris', 'Workday HCM and Payroll', 3),
  ('bamboohr', 'BambooHR', 'hris', 'BambooHR Human Resources Software', 4),
  ('namely', 'Namely', 'hris', 'Namely HR Platform', 5),
  ('rippling', 'Rippling', 'hris', 'Rippling HR and IT Management', 6),
  ('gusto', 'Gusto', 'payroll', 'Gusto Payroll and Benefits', 7),
  ('paychex', 'Paychex', 'payroll', 'Paychex Payroll Services', 8),
  ('quickbooks_payroll', 'QuickBooks Payroll', 'payroll', 'QuickBooks Payroll', 9),
  ('zenefits', 'Zenefits', 'benefits', 'Zenefits Benefits Administration', 10)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'ETL Configuration Management System migration completed successfully!';
  RAISE NOTICE 'Created tables: integration_configs, integration_credentials, integration_sync_configs, integration_sync_history, integration_audit_log, integration_types';
  RAISE NOTICE 'Created encryption functions: encrypt_credential, decrypt_credential';
  RAISE NOTICE 'Created helper functions: log_integration_audit, update_updated_at_column';
  RAISE NOTICE 'Enabled RLS policies for all tables';
  RAISE NOTICE 'Next steps: Run verification queries to test the setup';
END $$;
