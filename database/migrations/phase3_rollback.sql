-- Phase 3.2 Rollback Script
-- WARNING: This will delete all data in the new tables!
-- Run this only if you need to completely undo the Phase 3.2 migration

-- ============================================================================
-- 1. DROP DATABASE FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS get_customer_portfolio_summary(UUID);
DROP FUNCTION IF EXISTS get_customer_demand_analysis(UUID);

-- ============================================================================
-- 2. DROP TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS roadblocks_updated_at ON project_roadblocks;
DROP TRIGGER IF EXISTS status_updates_updated_at ON project_status_updates;
DROP TRIGGER IF EXISTS deliverables_updated_at ON project_deliverables;

DROP FUNCTION IF EXISTS update_roadblocks_timestamp();
DROP FUNCTION IF EXISTS update_status_updates_timestamp();
DROP FUNCTION IF EXISTS update_deliverables_timestamp();

-- ============================================================================
-- 3. DROP NEW TABLES
-- ============================================================================

DROP TABLE IF EXISTS tour_progress CASCADE;
DROP TABLE IF EXISTS customer_project_notifications CASCADE;
DROP TABLE IF EXISTS project_deliverables CASCADE;
DROP TABLE IF EXISTS project_status_updates CASCADE;
DROP TABLE IF EXISTS project_roadblocks CASCADE;

-- ============================================================================
-- 4. REMOVE COLUMNS FROM EXISTING TABLES
-- ============================================================================

-- Remove columns from project_charters
ALTER TABLE project_charters
  DROP COLUMN IF EXISTS customer_visible,
  DROP COLUMN IF EXISTS health_status,
  DROP COLUMN IF EXISTS health_status_explanation,
  DROP COLUMN IF EXISTS current_phase,
  DROP COLUMN IF EXISTS next_customer_action,
  DROP COLUMN IF EXISTS budget_variance_percentage,
  DROP COLUMN IF EXISTS timeline_variance_days;

-- Remove columns from project_milestones
ALTER TABLE project_milestones
  DROP COLUMN IF EXISTS customer_visible,
  DROP COLUMN IF EXISTS customer_action_required,
  DROP COLUMN IF EXISTS definition_of_done;

-- Remove columns from risks
ALTER TABLE risks
  DROP COLUMN IF EXISTS customer_visible,
  DROP COLUMN IF EXISTS mitigation_strategy;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

-- Verify rollback with these queries:
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'project_%' OR table_name = 'tour_progress';
-- SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%customer%';
