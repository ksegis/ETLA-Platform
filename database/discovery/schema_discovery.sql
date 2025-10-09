-- ETLA Platform Database Schema Discovery Script
-- This script analyzes the existing database structure to understand what we're working with
-- before implementing new features for ATS and Questionnaire systems

-- =====================================================
-- SECTION 1: TABLE INVENTORY
-- =====================================================

-- Get all tables in the public schema
SELECT 'TABLE_INVENTORY' as discovery_type,
       table_name,
       table_type,
       CASE WHEN table_type = 'BASE TABLE' THEN 'TABLE' ELSE 'VIEW' END as object_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- SECTION 2: COLUMN ANALYSIS FOR KEY TABLES
-- =====================================================

-- Analyze columns for potential ATS-related tables
SELECT 'COLUMN_ANALYSIS' as discovery_type,
       'POTENTIAL_ATS_TABLES' as category,
       table_name,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name ~ '(job|candidate|application|interview|offer|requisition|hire|recruit)'
ORDER BY table_name, ordinal_position;

-- Analyze work_requests table structure
SELECT 'COLUMN_ANALYSIS' as discovery_type,
       'WORK_REQUESTS' as category,
       table_name,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'work_requests'
ORDER BY ordinal_position;

-- Analyze documents/files tables
SELECT 'COLUMN_ANALYSIS' as discovery_type,
       'DOCUMENT_TABLES' as category,
       table_name,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name ~ '(document|file|attachment|upload)'
ORDER BY table_name, ordinal_position;

-- Analyze timecard-related tables
SELECT 'COLUMN_ANALYSIS' as discovery_type,
       'TIMECARD_TABLES' as category,
       table_name,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name ~ '(timecard|time_entry|punch|clock)'
ORDER BY table_name, ordinal_position;

-- Analyze tax-related tables for local tax requirements
SELECT 'COLUMN_ANALYSIS' as discovery_type,
       'TAX_TABLES' as category,
       table_name,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name ~ '(tax|w2|1099)'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- SECTION 3: FOREIGN KEY RELATIONSHIPS
-- =====================================================

SELECT 'FOREIGN_KEY_ANALYSIS' as discovery_type,
       tc.table_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name,
       tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- SECTION 4: INDEXES ANALYSIS
-- =====================================================

SELECT 'INDEX_ANALYSIS' as discovery_type,
       schemaname,
       tablename,
       indexname,
       indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- SECTION 5: RLS POLICIES
-- =====================================================

SELECT 'RLS_POLICY_ANALYSIS' as discovery_type,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual,
       with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check which tables have RLS enabled
SELECT 'RLS_STATUS' as discovery_type,
       schemaname,
       tablename,
       rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- SECTION 6: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Get all functions in public schema
SELECT 'FUNCTION_ANALYSIS' as discovery_type,
       routine_name,
       routine_type,
       data_type as return_type,
       routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Get all triggers
SELECT 'TRIGGER_ANALYSIS' as discovery_type,
       trigger_name,
       event_manipulation,
       event_object_table,
       action_statement,
       action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- SECTION 7: ENUM TYPES
-- =====================================================

SELECT 'ENUM_ANALYSIS' as discovery_type,
       t.typname as enum_name,
       e.enumlabel as enum_value,
       e.enumsortorder
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- =====================================================
-- SECTION 8: STORAGE BUCKETS (SUPABASE SPECIFIC)
-- =====================================================

-- Check for existing storage buckets
SELECT 'STORAGE_ANALYSIS' as discovery_type,
       id as bucket_id,
       name as bucket_name,
       public,
       file_size_limit,
       allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- =====================================================
-- SECTION 9: SPECIFIC FEATURE ANALYSIS
-- =====================================================

-- Check for existing questionnaire/survey related tables
SELECT 'FEATURE_ANALYSIS' as discovery_type,
       'QUESTIONNAIRE_RELATED' as feature,
       table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ~ '(questionnaire|survey|form|template|response|answer)'
ORDER BY table_name;

-- Check for existing ATS/recruitment related tables
SELECT 'FEATURE_ANALYSIS' as discovery_type,
       'ATS_RELATED' as feature,
       table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ~ '(job|candidate|application|interview|offer|stage|pipeline|recruit|hire)'
ORDER BY table_name;

-- Check for notification/email related tables
SELECT 'FEATURE_ANALYSIS' as discovery_type,
       'NOTIFICATION_RELATED' as feature,
       table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ~ '(notification|email|message|template|alert)'
ORDER BY table_name;

-- Check for audit/activity related tables
SELECT 'FEATURE_ANALYSIS' as discovery_type,
       'AUDIT_RELATED' as feature,
       table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ~ '(audit|activity|log|history|event)'
ORDER BY table_name;

-- =====================================================
-- SECTION 10: DATA VOLUME ANALYSIS
-- =====================================================

-- Get row counts for all tables (this might be slow on large databases)
DO $$
DECLARE
    table_record RECORD;
    row_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_record.table_name) INTO row_count;
        RAISE NOTICE 'DATA_VOLUME_ANALYSIS: % has % rows', table_record.table_name, row_count;
    END LOOP;
END;
$$;

-- =====================================================
-- SECTION 11: TENANT STRUCTURE ANALYSIS
-- =====================================================

-- Analyze tenant structure
SELECT 'TENANT_ANALYSIS' as discovery_type,
       'TENANT_STRUCTURE' as category,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tenants'
ORDER BY ordinal_position;

-- Check tenant_users structure
SELECT 'TENANT_ANALYSIS' as discovery_type,
       'TENANT_USERS_STRUCTURE' as category,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tenant_users'
ORDER BY ordinal_position;

-- =====================================================
-- SECTION 12: RBAC STRUCTURE ANALYSIS
-- =====================================================

-- Check profiles table structure
SELECT 'RBAC_ANALYSIS' as discovery_type,
       'PROFILES_STRUCTURE' as category,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check for permission-related tables
SELECT 'RBAC_ANALYSIS' as discovery_type,
       'PERMISSION_TABLES' as category,
       table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ~ '(permission|role|access|rbac)'
ORDER BY table_name;
