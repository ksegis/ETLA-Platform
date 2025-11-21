-- ============================================================================
-- ETL Configuration Management System - Verification Script
-- ============================================================================
-- Description: Run these queries to verify the migration was successful
-- Date: 2025-11-21
-- Version: 1.0
-- ============================================================================

-- Set output formatting for better readability
\pset border 2
\pset format wrapped

-- ============================================================================
-- SECTION 1: TABLE VERIFICATION
-- ============================================================================

\echo ''
\echo '========================================='
\echo '1. CHECKING TABLES'
\echo '========================================='
\echo ''

-- Check if all integration tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'integration%'
ORDER BY table_name;

\echo ''
\echo 'Expected: 6 tables (integration_audit_log, integration_configs, integration_credentials, integration_sync_configs, integration_sync_history, integration_types)'
\echo ''

-- ============================================================================
-- SECTION 2: EXTENSION VERIFICATION
-- ============================================================================

\echo ''
\echo '========================================='
\echo '2. CHECKING EXTENSIONS'
\echo '========================================='
\echo ''

SELECT 
  extname as extension_name,
  extversion as version,
  '✅ ENABLED' as status
FROM pg_extension 
WHERE extname IN ('pgcrypto', 'uuid-ossp')
ORDER BY extname;

\echo ''
\echo 'Expected: 2 extensions (pgcrypto, uuid-ossp)'
\echo ''

-- ============================================================================
-- SECTION 3: FUNCTION VERIFICATION
-- ============================================================================

\echo ''
\echo '========================================='
\echo '3. CHECKING FUNCTIONS'
\echo '========================================='
\echo ''

SELECT 
  proname as function_name,
  pronargs as num_arguments,
  '✅ EXISTS' as status
FROM pg_proc 
WHERE proname IN ('encrypt_credential', 'decrypt_credential', 'log_integration_audit', 'update_updated_at_column')
ORDER BY proname;

\echo ''
\echo 'Expected: 4 functions'
\echo ''

-- ============================================================================
-- SECTION 4: ENCRYPTION TEST
-- ============================================================================

\echo ''
\echo '========================================='
\echo '4. TESTING ENCRYPTION/DECRYPTION'
\echo '========================================='
\echo ''

-- Test encryption
WITH test_data AS (
  SELECT 'test_password_123' as original_text
),
encrypted AS (
  SELECT 
    original_text,
    encrypt_credential(original_text) as encrypted_text
  FROM test_data
),
decrypted AS (
  SELECT 
    original_text,
    encrypted_text,
    decrypt_credential(encrypted_text) as decrypted_text
  FROM encrypted
)
SELECT 
  original_text,
  CASE 
    WHEN encrypted_text IS NOT NULL AND encrypted_text != original_text 
    THEN '✅ ENCRYPTED' 
    ELSE '❌ FAILED' 
  END as encryption_status,
  CASE 
    WHEN decrypted_text = original_text 
    THEN '✅ DECRYPTED' 
    ELSE '❌ FAILED' 
  END as decryption_status,
  CASE 
    WHEN decrypted_text = original_text 
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as overall_result
FROM decrypted;

\echo ''
\echo 'Expected: Encryption and decryption should both show ✅ PASS'
\echo ''

-- ============================================================================
-- SECTION 5: RLS VERIFICATION
-- ============================================================================

\echo ''
\echo '========================================='
\echo '5. CHECKING ROW LEVEL SECURITY (RLS)'
\echo '========================================='
\echo ''

SELECT 
  tablename as table_name,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%'
ORDER BY tablename;

\echo ''
\echo 'Expected: All 6 tables should have RLS ENABLED'
\echo ''

-- Count RLS policies
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'integration%'
GROUP BY schemaname, tablename
ORDER BY tablename;

\echo ''
\echo 'Expected: Multiple policies per table (15+ total)'
\echo ''

-- ============================================================================
-- SECTION 6: INDEX VERIFICATION
-- ============================================================================

\echo ''
\echo '========================================='
\echo '6. CHECKING INDEXES'
\echo '========================================='
\echo ''

SELECT 
  tablename as table_name,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%'
GROUP BY tablename
ORDER BY tablename;

\echo ''
\echo 'Expected: 15+ indexes across all tables'
\echo ''

-- Detailed index list
SELECT 
  tablename as table_name,
  indexname as index_name,
  '✅ EXISTS' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%'
ORDER BY tablename, indexname;

-- ============================================================================
-- SECTION 7: TRIGGER VERIFICATION
-- ============================================================================

\echo ''
\echo '========================================='
\echo '7. CHECKING TRIGGERS'
\echo '========================================='
\echo ''

SELECT 
  event_object_table as table_name,
  trigger_name,
  event_manipulation as event,
  '✅ EXISTS' as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table LIKE 'integration%'
ORDER BY event_object_table, trigger_name;

\echo ''
\echo 'Expected: 3 triggers for updated_at columns'
\echo ''

-- ============================================================================
-- SECTION 8: INTEGRATION TYPES SEED DATA
-- ============================================================================

\echo ''
\echo '========================================='
\echo '8. CHECKING INTEGRATION TYPES (SEED DATA)'
\echo '========================================='
\echo ''

SELECT 
  id,
  display_name,
  category,
  is_active,
  sort_order
FROM integration_types 
ORDER BY sort_order;

\echo ''
\echo 'Expected: 10 integration types (Paycom, ADP, Workday, BambooHR, etc.)'
\echo ''

-- Count by category
SELECT 
  category,
  COUNT(*) as count
FROM integration_types
GROUP BY category
ORDER BY category;

-- ============================================================================
-- SECTION 9: TABLE STRUCTURE DETAILS
-- ============================================================================

\echo ''
\echo '========================================='
\echo '9. TABLE STRUCTURE DETAILS'
\echo '========================================='
\echo ''

-- integration_configs columns
\echo 'integration_configs columns:'
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'integration_configs'
ORDER BY ordinal_position;

\echo ''

-- integration_credentials columns
\echo 'integration_credentials columns:'
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'integration_credentials'
ORDER BY ordinal_position;

\echo ''

-- integration_sync_configs columns
\echo 'integration_sync_configs columns:'
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'integration_sync_configs'
ORDER BY ordinal_position;

-- ============================================================================
-- SECTION 10: FOREIGN KEY CONSTRAINTS
-- ============================================================================

\echo ''
\echo '========================================='
\echo '10. CHECKING FOREIGN KEY CONSTRAINTS'
\echo '========================================='
\echo ''

SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✅ EXISTS' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name LIKE 'integration%'
ORDER BY tc.table_name, kcu.column_name;

\echo ''
\echo 'Expected: Multiple foreign key constraints linking tables'
\echo ''

-- ============================================================================
-- SECTION 11: UNIQUE CONSTRAINTS
-- ============================================================================

\echo ''
\echo '========================================='
\echo '11. CHECKING UNIQUE CONSTRAINTS'
\echo '========================================='
\echo ''

SELECT 
  tc.table_name,
  STRING_AGG(kcu.column_name, ', ') as columns,
  '✅ EXISTS' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
AND tc.table_name LIKE 'integration%'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

\echo ''
\echo 'Expected: Unique constraints on integration_configs and integration_credentials'
\echo ''

-- ============================================================================
-- SECTION 12: SUMMARY
-- ============================================================================

\echo ''
\echo '========================================='
\echo '12. VERIFICATION SUMMARY'
\echo '========================================='
\echo ''

WITH verification_summary AS (
  SELECT 
    'Tables' as component,
    COUNT(*) as count,
    6 as expected,
    CASE WHEN COUNT(*) = 6 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name LIKE 'integration%'
  
  UNION ALL
  
  SELECT 
    'Extensions' as component,
    COUNT(*) as count,
    2 as expected,
    CASE WHEN COUNT(*) = 2 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM pg_extension 
  WHERE extname IN ('pgcrypto', 'uuid-ossp')
  
  UNION ALL
  
  SELECT 
    'Functions' as component,
    COUNT(*) as count,
    4 as expected,
    CASE WHEN COUNT(*) = 4 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM pg_proc 
  WHERE proname IN ('encrypt_credential', 'decrypt_credential', 'log_integration_audit', 'update_updated_at_column')
  
  UNION ALL
  
  SELECT 
    'RLS Enabled Tables' as component,
    COUNT(*) as count,
    6 as expected,
    CASE WHEN COUNT(*) = 6 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename LIKE 'integration%'
  AND rowsecurity = true
  
  UNION ALL
  
  SELECT 
    'Integration Types' as component,
    COUNT(*) as count,
    10 as expected,
    CASE WHEN COUNT(*) >= 10 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM integration_types
)
SELECT * FROM verification_summary;

\echo ''
\echo '========================================='
\echo 'VERIFICATION COMPLETE!'
\echo '========================================='
\echo ''
\echo 'If all checks show ✅ PASS, the migration was successful!'
\echo 'If any checks show ❌ FAIL, review the error messages above.'
\echo ''

-- ============================================================================
-- OPTIONAL: SAMPLE DATA TEST
-- ============================================================================

\echo ''
\echo '========================================='
\echo 'OPTIONAL: SAMPLE DATA TEST'
\echo '========================================='
\echo ''
\echo 'To test with sample data, run the queries in SETUP_INSTRUCTIONS.md'
\echo 'under the "Test Data (Optional)" section.'
\echo ''
