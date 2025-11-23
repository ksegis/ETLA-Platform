-- Migration: Remove character length limits from work_requests table fields

-- Change VARCHAR(100) fields to TEXT for fields that need longer content
ALTER TABLE work_requests ALTER COLUMN title TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN description TYPE TEXT;

-- Change any other VARCHAR fields that might have limits
ALTER TABLE work_requests ALTER COLUMN rejection_reason TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN internal_notes TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN customer_notes TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN business_justification TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN impact_assessment TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN risk_level TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN impact_level TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN dependencies TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN stakeholders TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN success_criteria TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN decline_reason TYPE TEXT;

-- Ensure all comprehensive fields are TEXT (no limits)
ALTER TABLE work_requests ALTER COLUMN category_other TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN estimated_employee_impact TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN compliance_related TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN specific_requirements TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN estimated_document_count TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN estimated_data_volume TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN long_term_storage_required TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN ongoing_api_monitoring TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN ongoing_support_needed TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN expected_frequency TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN integration_complexity TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN helix_bridge_access TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN current_payroll_system TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN current_hris TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN current_version TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN current_integration_count TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN data_migration_needed TYPE TEXT;
ALTER TABLE work_requests ALTER COLUMN current_pain_points TYPE TEXT;

-- Add comment
COMMENT ON TABLE work_requests IS 'Updated to use TEXT type for all text fields to remove character limits';
