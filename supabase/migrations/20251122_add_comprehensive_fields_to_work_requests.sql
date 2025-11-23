-- Migration: Add comprehensive work request fields to work_requests table

-- Add category_other field
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS category_other TEXT;

-- Add affected systems and impact fields
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS affected_systems TEXT[];
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS estimated_employee_impact TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS compliance_related TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS specific_requirements TEXT;

-- Add scope estimation fields
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS estimated_document_count TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS estimated_data_volume TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS long_term_storage_required TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS ongoing_api_monitoring TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS ongoing_support_needed TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS expected_frequency TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS integration_complexity TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS helix_bridge_access TEXT;

-- Add current system environment fields
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS current_payroll_system TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS current_hris TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS current_version TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS current_integration_count TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS data_migration_needed TEXT;
ALTER TABLE work_requests ADD COLUMN IF NOT EXISTS current_pain_points TEXT;

-- Create indexes for array fields to improve query performance
CREATE INDEX IF NOT EXISTS idx_work_requests_affected_systems ON work_requests USING GIN (affected_systems);

-- Add comment
COMMENT ON COLUMN work_requests.affected_systems IS 'Array of systems affected by this work request';
COMMENT ON COLUMN work_requests.category_other IS 'Custom category when "Other" is selected';
COMMENT ON COLUMN work_requests.estimated_employee_impact IS 'Estimated number of employees impacted';
COMMENT ON COLUMN work_requests.compliance_related IS 'Whether this request is compliance-related (yes/no)';
COMMENT ON COLUMN work_requests.specific_requirements IS 'Detailed specific requirements for the work request';
