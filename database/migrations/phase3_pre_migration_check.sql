-- Phase 3.2 Pre-Migration Verification Script
-- Run this BEFORE running phase3_customer_project_board.sql
-- This will check for existing tables, columns, and potential conflicts

-- ============================================================================
-- CHECK 1: Verify Required Tables Exist
-- ============================================================================
SELECT 
  'Required Tables Check' AS check_type,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END AS status
FROM (
  VALUES 
    ('project_charters'),
    ('project_milestones'),
    ('risks'),
    ('tenants'),
    ('users'),
    ('work_requests')
) AS required(table_name)
LEFT JOIN information_schema.tables t 
  ON t.table_name = required.table_name 
  AND t.table_schema = 'public'
ORDER BY required.table_name;

-- ============================================================================
-- CHECK 2: Check if New Tables Already Exist (Should NOT exist)
-- ============================================================================
SELECT 
  'New Tables Check' AS check_type,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '⚠ ALREADY EXISTS - May cause conflict'
    ELSE '✓ Does not exist - Safe to create'
  END AS status
FROM (
  VALUES 
    ('project_roadblocks'),
    ('project_status_updates'),
    ('project_deliverables'),
    ('customer_project_notifications'),
    ('tour_progress')
) AS new_tables(table_name)
LEFT JOIN information_schema.tables t 
  ON t.table_name = new_tables.table_name 
  AND t.table_schema = 'public'
ORDER BY new_tables.table_name;

-- ============================================================================
-- CHECK 3: Check if New Columns Already Exist on project_charters
-- ============================================================================
SELECT 
  'project_charters Columns' AS check_type,
  column_name,
  CASE 
    WHEN c.column_name IS NOT NULL THEN '⚠ ALREADY EXISTS'
    ELSE '✓ Does not exist - Safe to add'
  END AS status
FROM (
  VALUES 
    ('customer_visible'),
    ('health_status'),
    ('health_status_explanation'),
    ('current_phase'),
    ('next_customer_action'),
    ('budget_variance_percentage'),
    ('timeline_variance_days')
) AS new_cols(column_name)
LEFT JOIN information_schema.columns c
  ON c.column_name = new_cols.column_name
  AND c.table_name = 'project_charters'
  AND c.table_schema = 'public'
ORDER BY new_cols.column_name;

-- ============================================================================
-- CHECK 4: Check if New Columns Already Exist on project_milestones
-- ============================================================================
SELECT 
  'project_milestones Columns' AS check_type,
  column_name,
  CASE 
    WHEN c.column_name IS NOT NULL THEN '⚠ ALREADY EXISTS'
    ELSE '✓ Does not exist - Safe to add'
  END AS status
FROM (
  VALUES 
    ('customer_visible'),
    ('customer_action_required'),
    ('definition_of_done')
) AS new_cols(column_name)
LEFT JOIN information_schema.columns c
  ON c.column_name = new_cols.column_name
  AND c.table_name = 'project_milestones'
  AND c.table_schema = 'public'
ORDER BY new_cols.column_name;

-- ============================================================================
-- CHECK 5: Check if New Columns Already Exist on risks
-- ============================================================================
SELECT 
  'risks Columns' AS check_type,
  column_name,
  CASE 
    WHEN c.column_name IS NOT NULL THEN '⚠ ALREADY EXISTS'
    ELSE '✓ Does not exist - Safe to add'
  END AS status
FROM (
  VALUES 
    ('customer_visible'),
    ('mitigation_strategy')
) AS new_cols(column_name)
LEFT JOIN information_schema.columns c
  ON c.column_name = new_cols.column_name
  AND c.table_name = 'risks'
  AND c.table_schema = 'public'
ORDER BY new_cols.column_name;

-- ============================================================================
-- CHECK 6: Check if Functions Already Exist
-- ============================================================================
SELECT 
  'Database Functions' AS check_type,
  routine_name,
  CASE 
    WHEN r.routine_name IS NOT NULL THEN '⚠ ALREADY EXISTS'
    ELSE '✓ Does not exist - Safe to create'
  END AS status
FROM (
  VALUES 
    ('get_customer_portfolio_summary'),
    ('get_customer_demand_analysis')
) AS new_funcs(routine_name)
LEFT JOIN information_schema.routines r
  ON r.routine_name = new_funcs.routine_name
  AND r.routine_schema = 'public'
ORDER BY new_funcs.routine_name;

-- ============================================================================
-- CHECK 7: Verify project_charters Structure
-- ============================================================================
SELECT 
  'project_charters Structure' AS check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'project_charters'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK 8: Verify project_milestones Structure
-- ============================================================================
SELECT 
  'project_milestones Structure' AS check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'project_milestones'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK 9: Verify risks Structure
-- ============================================================================
SELECT 
  'risks Structure' AS check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'risks'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK 10: Summary
-- ============================================================================
SELECT 
  '=== SUMMARY ===' AS summary,
  COUNT(CASE WHEN table_name IN ('project_charters', 'project_milestones', 'risks', 'tenants', 'users', 'work_requests') THEN 1 END) AS required_tables_exist,
  COUNT(CASE WHEN table_name IN ('project_roadblocks', 'project_status_updates', 'project_deliverables', 'customer_project_notifications', 'tour_progress') THEN 1 END) AS new_tables_already_exist
FROM information_schema.tables
WHERE table_schema = 'public';

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================
-- 
-- ✓ Safe to proceed - No conflicts detected
-- ⚠ Warning - Item already exists, migration may fail or skip this item
-- ✗ Error - Required table missing, migration will fail
--
-- NEXT STEPS:
-- 1. Review all checks above
-- 2. If all required tables exist and no new tables/columns exist: SAFE TO MIGRATE
-- 3. If any new tables/columns already exist: Review migration script and adjust
-- 4. If any required tables are missing: Create them first before running Phase 3 migration
-- ============================================================================
