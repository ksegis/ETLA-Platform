-- Migration: Add comprehensive work request fields to projects table
-- This ensures all work request information is inherited by projects

-- Add comprehensive scope and system fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_other TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS affected_systems TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_employee_impact TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS compliance_related TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS specific_requirements TEXT;

-- Scope estimation fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_document_count TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_data_volume TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS long_term_storage_required TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ongoing_api_monitoring TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ongoing_support_needed TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_frequency TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS integration_complexity TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS helix_bridge_access TEXT;

-- Current system environment fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_payroll_system TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_hris TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_version TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_integration_count TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_migration_needed TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_pain_points TEXT;

-- Additional work request fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS urgency TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS required_completion_date TIMESTAMP WITH TIME ZONE;

-- Add comment to document the purpose
COMMENT ON COLUMN projects.category IS 'Categories from work request (HR, Payroll, Benefits, etc.)';
COMMENT ON COLUMN projects.affected_systems IS 'List of systems affected by this project';
COMMENT ON COLUMN projects.estimated_employee_impact IS 'Estimated number of employees impacted';
COMMENT ON COLUMN projects.compliance_related IS 'Whether project is compliance-related';
COMMENT ON COLUMN projects.specific_requirements IS 'Specific requirements from work request';
COMMENT ON COLUMN projects.estimated_document_count IS 'Estimated number of documents to process';
COMMENT ON COLUMN projects.estimated_data_volume IS 'Estimated volume of data to process';
COMMENT ON COLUMN projects.long_term_storage_required IS 'Whether long-term storage is required';
COMMENT ON COLUMN projects.ongoing_api_monitoring IS 'Whether ongoing API monitoring is needed';
COMMENT ON COLUMN projects.ongoing_support_needed IS 'Whether ongoing support is needed';
COMMENT ON COLUMN projects.expected_frequency IS 'Expected frequency of operations';
COMMENT ON COLUMN projects.integration_complexity IS 'Complexity level of integrations';
COMMENT ON COLUMN projects.helix_bridge_access IS 'Whether HelixBridge access is required';
COMMENT ON COLUMN projects.current_payroll_system IS 'Current payroll system in use';
COMMENT ON COLUMN projects.current_hris IS 'Current HRIS system in use';
COMMENT ON COLUMN projects.current_version IS 'Current system version';
COMMENT ON COLUMN projects.current_integration_count IS 'Number of current integrations';
COMMENT ON COLUMN projects.data_migration_needed IS 'Whether data migration is needed';
COMMENT ON COLUMN projects.current_pain_points IS 'Current system pain points';
COMMENT ON COLUMN projects.urgency IS 'Urgency level (low, medium, high, urgent)';
COMMENT ON COLUMN projects.required_completion_date IS 'Required completion date from work request';

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects USING GIN (category);

-- Create index on affected_systems for filtering
CREATE INDEX IF NOT EXISTS idx_projects_affected_systems ON projects USING GIN (affected_systems);
