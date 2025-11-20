-- Phase 3.2 Pre-Migration Verification Script
-- Run this BEFORE running phase3_customer_project_board.sql

-- CHECK 1: Verify Required Tables Exist
SELECT 
  'Required Tables' AS check_type,
  required.table_name,
  CASE 
    WHEN t.table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
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
  AND t.table_schema = 'public';

-- CHECK 2: Check if New Tables Already Exist (Should NOT exist)
SELECT 
  'New Tables' AS check_type,
  new_tables.table_name,
  CASE 
    WHEN t.table_name IS NOT NULL THEN 'ALREADY EXISTS - CONFLICT'
    ELSE 'Safe to create'
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
  AND t.table_schema = 'public';

-- CHECK 3: project_charters - New Columns
SELECT 
  'project_charters' AS check_type,
  new_cols.column_name,
  CASE 
    WHEN c.column_name IS NOT NULL THEN 'ALREADY EXISTS'
    ELSE 'Safe to add'
  END AS status
FROM (
  VALUES 
    ('customer_visible'),
    ('health_status'),
    ('next_customer_action')
) AS new_cols(column_name)
LEFT JOIN information_schema.columns c
  ON c.column_name = new_cols.column_name
  AND c.table_name = 'project_charters'
  AND c.table_schema = 'public';

-- CHECK 4: Current project_charters columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'project_charters'
  AND table_schema = 'public'
ORDER BY ordinal_position;
