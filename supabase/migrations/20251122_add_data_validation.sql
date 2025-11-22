-- ============================================================================
-- Migration: Add Data Validation and Quality Checks
-- ============================================================================
-- Description: Adds validation rules, quality scoring, and error tracking
-- Date: 2025-11-22
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- 1. Add validation configuration to integration_sync_configs
-- ============================================================================

ALTER TABLE integration_sync_configs
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS validation_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS validation_action VARCHAR(20) DEFAULT 'skip', -- 'skip', 'fail', 'fix'
ADD COLUMN IF NOT EXISTS required_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS unique_fields TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN integration_sync_configs.validation_rules IS 'Array of validation rules: [{field, type, rule, params}]';
COMMENT ON COLUMN integration_sync_configs.validation_enabled IS 'Enable/disable validation for this endpoint';
COMMENT ON COLUMN integration_sync_configs.validation_action IS 'Action on validation failure: skip (ignore record), fail (stop sync), fix (auto-correct)';
COMMENT ON COLUMN integration_sync_configs.required_fields IS 'Array of field names that must be present';
COMMENT ON COLUMN integration_sync_configs.unique_fields IS 'Array of field names that must be unique';


-- ============================================================================
-- 2. Add validation metrics to integration_sync_history
-- ============================================================================

ALTER TABLE integration_sync_history
ADD COLUMN IF NOT EXISTS records_validated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS records_invalid INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC(5,2); -- 0.00 to 100.00

COMMENT ON COLUMN integration_sync_history.records_validated IS 'Total number of records validated';
COMMENT ON COLUMN integration_sync_history.records_invalid IS 'Number of records that failed validation';
COMMENT ON COLUMN integration_sync_history.validation_errors IS 'Array of validation errors: [{record_id, field, error, value}]';
COMMENT ON COLUMN integration_sync_history.data_quality_score IS 'Data quality score (0-100%)';


-- ============================================================================
-- 3. Create validation_error_log table for detailed error tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_validation_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_history_id UUID NOT NULL REFERENCES integration_sync_history(id) ON DELETE CASCADE,
  integration_config_id UUID NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  
  -- Record info
  record_identifier TEXT, -- External ID or unique identifier
  record_data JSONB, -- The actual record that failed
  
  -- Validation error details
  field_name TEXT NOT NULL,
  validation_type VARCHAR(50) NOT NULL, -- 'required', 'type', 'format', 'range', 'unique', 'custom'
  error_message TEXT NOT NULL,
  expected_value TEXT,
  actual_value TEXT,
  
  -- Resolution
  resolution_action VARCHAR(20), -- 'skipped', 'fixed', 'manual'
  resolved_at TIMESTAMP,
  resolved_by UUID,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_validation_errors_sync ON integration_validation_errors(sync_history_id);
CREATE INDEX IF NOT EXISTS idx_validation_errors_config ON integration_validation_errors(integration_config_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_validation_errors_field ON integration_validation_errors(field_name);
CREATE INDEX IF NOT EXISTS idx_validation_errors_type ON integration_validation_errors(validation_type);
CREATE INDEX IF NOT EXISTS idx_validation_errors_unresolved ON integration_validation_errors(resolved_at) WHERE resolved_at IS NULL;

COMMENT ON TABLE integration_validation_errors IS 'Detailed log of all validation errors for troubleshooting and data quality monitoring';


-- ============================================================================
-- 4. Create function to validate a record against rules
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_record(
  record_data JSONB,
  validation_rules JSONB,
  required_fields TEXT[]
)
RETURNS JSONB AS $$
DECLARE
  errors JSONB := '[]'::jsonb;
  rule JSONB;
  field_name TEXT;
  field_value TEXT;
  rule_type TEXT;
  rule_params JSONB;
BEGIN
  -- Check required fields
  FOREACH field_name IN ARRAY required_fields
  LOOP
    IF NOT (record_data ? field_name) OR record_data->>field_name IS NULL OR record_data->>field_name = '' THEN
      errors := errors || jsonb_build_object(
        'field', field_name,
        'type', 'required',
        'message', 'Field is required but missing or empty'
      );
    END IF;
  END LOOP;
  
  -- Check validation rules
  FOR rule IN SELECT * FROM jsonb_array_elements(validation_rules)
  LOOP
    field_name := rule->>'field';
    rule_type := rule->>'type';
    rule_params := rule->'params';
    field_value := record_data->>field_name;
    
    -- Skip if field doesn't exist (already caught by required check if needed)
    CONTINUE WHEN field_value IS NULL;
    
    -- Type validations
    CASE rule_type
      WHEN 'email' THEN
        IF field_value !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
          errors := errors || jsonb_build_object(
            'field', field_name,
            'type', 'email',
            'message', 'Invalid email format',
            'value', field_value
          );
        END IF;
        
      WHEN 'phone' THEN
        IF field_value !~ '^\+?[1-9]\d{1,14}$' THEN
          errors := errors || jsonb_build_object(
            'field', field_name,
            'type', 'phone',
            'message', 'Invalid phone number format',
            'value', field_value
          );
        END IF;
        
      WHEN 'number' THEN
        IF field_value !~ '^-?\d+\.?\d*$' THEN
          errors := errors || jsonb_build_object(
            'field', field_name,
            'type', 'number',
            'message', 'Value must be a number',
            'value', field_value
          );
        END IF;
        
      WHEN 'date' THEN
        BEGIN
          PERFORM field_value::date;
        EXCEPTION WHEN OTHERS THEN
          errors := errors || jsonb_build_object(
            'field', field_name,
            'type', 'date',
            'message', 'Invalid date format',
            'value', field_value
          );
        END;
        
      WHEN 'min_length' THEN
        IF length(field_value) < (rule_params->>'value')::integer THEN
          errors := errors || jsonb_build_object(
            'field', field_name,
            'type', 'min_length',
            'message', format('Minimum length is %s characters', rule_params->>'value'),
            'value', field_value
          );
        END IF;
        
      WHEN 'max_length' THEN
        IF length(field_value) > (rule_params->>'value')::integer THEN
          errors := errors || jsonb_build_object(
            'field', field_name,
            'type', 'max_length',
            'message', format('Maximum length is %s characters', rule_params->>'value'),
            'value', field_value
          );
        END IF;
        
      WHEN 'regex' THEN
        IF field_value !~ (rule_params->>'pattern') THEN
          errors := errors || jsonb_build_object(
            'field', field_name,
            'type', 'regex',
            'message', COALESCE(rule_params->>'message', 'Value does not match required pattern'),
            'value', field_value
          );
        END IF;
        
      ELSE
        -- Unknown validation type, skip
        NULL;
    END CASE;
  END LOOP;
  
  RETURN jsonb_build_object(
    'valid', jsonb_array_length(errors) = 0,
    'errors', errors
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

GRANT EXECUTE ON FUNCTION validate_record TO authenticated;

COMMENT ON FUNCTION validate_record IS 'Validates a record against validation rules and returns errors';


-- ============================================================================
-- 5. Create function to calculate data quality score
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_data_quality_score(
  total_records INTEGER,
  valid_records INTEGER,
  invalid_records INTEGER,
  failed_records INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
  quality_score NUMERIC;
BEGIN
  IF total_records = 0 THEN
    RETURN 0;
  END IF;
  
  -- Quality score = (valid records / total records) * 100
  -- Penalize failed records more than invalid records
  quality_score := (valid_records::NUMERIC / total_records::NUMERIC) * 100;
  
  RETURN ROUND(quality_score, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

GRANT EXECUTE ON FUNCTION calculate_data_quality_score TO authenticated;

COMMENT ON FUNCTION calculate_data_quality_score IS 'Calculates data quality score (0-100%) based on validation results';


-- ============================================================================
-- 6. Add RLS policies for validation_errors table
-- ============================================================================

ALTER TABLE integration_validation_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view validation errors for their tenant's integrations
CREATE POLICY validation_errors_select_policy ON integration_validation_errors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM integration_configs ic
    WHERE ic.id = integration_validation_errors.integration_config_id
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

-- Policy: Only admins can insert validation errors
CREATE POLICY validation_errors_insert_policy ON integration_validation_errors
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenant_users
    WHERE user_id = auth.uid()
    AND role IN ('host_admin', 'super_admin', 'tenant_admin')
  )
);

-- Policy: Only admins can update validation errors (for resolution)
CREATE POLICY validation_errors_update_policy ON integration_validation_errors
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tenant_users
    WHERE user_id = auth.uid()
    AND role IN ('host_admin', 'super_admin', 'tenant_admin')
  )
);


-- ============================================================================
-- 7. Create view for data quality summary
-- ============================================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS data_quality_summary;

CREATE VIEW data_quality_summary AS
SELECT 
  ic.id AS integration_config_id,
  ic.tenant_id,
  ic.integration_name,
  isc.endpoint_name,
  COUNT(DISTINCT sh.id) AS total_syncs,
  SUM(sh.records_synced) AS total_records,
  SUM(sh.records_validated) AS total_validated,
  SUM(sh.records_invalid) AS total_invalid,
  AVG(sh.data_quality_score) AS avg_quality_score,
  MAX(sh.sync_started_at) AS last_sync_at
FROM integration_configs ic
LEFT JOIN integration_sync_configs isc ON ic.id = isc.integration_config_id
LEFT JOIN integration_sync_history sh ON ic.id = sh.integration_config_id 
  AND isc.endpoint_name = sh.endpoint_name
WHERE sh.sync_started_at >= NOW() - INTERVAL '30 days'
GROUP BY ic.id, ic.tenant_id, ic.integration_name, isc.endpoint_name
ORDER BY avg_quality_score ASC NULLS LAST;

COMMENT ON VIEW data_quality_summary IS 'Summary of data quality metrics per integration and endpoint (last 30 days)';

GRANT SELECT ON data_quality_summary TO authenticated;
