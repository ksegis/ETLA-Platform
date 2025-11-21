-- ============================================================================
-- ETL Configuration Management System - Verification Script
-- ============================================================================
-- Description: Verify the migration was successful
-- Compatible with: Supabase SQL Editor
-- Date: 2025-11-21
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- 1. CHECK TABLES
-- ============================================================================

SELECT 
  'TABLES' as check_type,
  COUNT(*) as count,
  6 as expected,
  CASE WHEN COUNT(*) = 6 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'integration%';

-- List all integration tables
SELECT 
  'Table: ' || table_name as detail
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'integration%'
ORDER BY table_name;


-- ============================================================================
-- 2. CHECK EXTENSIONS
-- ============================================================================

SELECT 
  'EXTENSIONS' as check_type,
  COUNT(*) as count,
  2 as expected,
  CASE WHEN COUNT(*) = 2 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_extension 
WHERE extname IN ('pgcrypto', 'uuid-ossp');

-- List extensions
SELECT 
  'Extension: ' || extname || ' (v' || extversion || ')' as detail
FROM pg_extension 
WHERE extname IN ('pgcrypto', 'uuid-ossp');


-- ============================================================================
-- 3. CHECK FUNCTIONS
-- ============================================================================

SELECT 
  'FUNCTIONS' as check_type,
  COUNT(*) as count,
  4 as expected,
  CASE WHEN COUNT(*) = 4 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_proc 
WHERE proname IN ('encrypt_credential', 'decrypt_credential', 'log_integration_audit', 'update_updated_at_column');

-- List functions
SELECT 
  'Function: ' || proname as detail
FROM pg_proc 
WHERE proname IN ('encrypt_credential', 'decrypt_credential', 'log_integration_audit', 'update_updated_at_column')
ORDER BY proname;


-- ============================================================================
-- 4. TEST ENCRYPTION/DECRYPTION
-- ============================================================================

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
  'ENCRYPTION TEST' as check_type,
  CASE 
    WHEN decrypted_text = original_text 
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status,
  'Original: ' || original_text as detail1,
  'Decrypted: ' || COALESCE(decrypted_text, 'NULL') as detail2
FROM decrypted;


-- ============================================================================
-- 5. CHECK ROW LEVEL SECURITY (RLS)
-- ============================================================================

SELECT 
  'RLS ENABLED' as check_type,
  COUNT(*) as count,
  6 as expected,
  CASE WHEN COUNT(*) = 6 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%'
AND rowsecurity = true;

-- List RLS status per table
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


-- ============================================================================
-- 6. CHECK RLS POLICIES
-- ============================================================================

SELECT 
  'RLS POLICIES' as check_type,
  COUNT(*) as count,
  '15+' as expected,
  CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'integration%';

-- Count policies per table
SELECT 
  tablename as table_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'integration%'
GROUP BY tablename
ORDER BY tablename;


-- ============================================================================
-- 7. CHECK INDEXES
-- ============================================================================

SELECT 
  'INDEXES' as check_type,
  COUNT(*) as count,
  '15+' as expected,
  CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%';

-- Count indexes per table
SELECT 
  tablename as table_name,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'integration%'
GROUP BY tablename
ORDER BY tablename;


-- ============================================================================
-- 8. CHECK TRIGGERS
-- ============================================================================

SELECT 
  'TRIGGERS' as check_type,
  COUNT(*) as count,
  3 as expected,
  CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table LIKE 'integration%';

-- List triggers
SELECT 
  event_object_table as table_name,
  trigger_name,
  event_manipulation as event
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table LIKE 'integration%'
ORDER BY event_object_table, trigger_name;


-- ============================================================================
-- 9. CHECK INTEGRATION TYPES (SEED DATA)
-- ============================================================================

SELECT 
  'INTEGRATION TYPES' as check_type,
  COUNT(*) as count,
  10 as expected,
  CASE WHEN COUNT(*) >= 10 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM integration_types;

-- List integration types
SELECT 
  id,
  display_name,
  category,
  sort_order
FROM integration_types 
ORDER BY sort_order;


-- ============================================================================
-- 10. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================================================

SELECT 
  'FOREIGN KEYS' as check_type,
  COUNT(*) as count,
  '5+' as expected,
  CASE WHEN COUNT(*) >= 5 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name LIKE 'integration%';

-- List foreign keys
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
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


-- ============================================================================
-- 11. CHECK UNIQUE CONSTRAINTS
-- ============================================================================

SELECT 
  'UNIQUE CONSTRAINTS' as check_type,
  COUNT(*) as count,
  '2+' as expected,
  CASE WHEN COUNT(*) >= 2 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
AND tc.table_name LIKE 'integration%';

-- List unique constraints
SELECT 
  tc.table_name,
  STRING_AGG(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
AND tc.table_name LIKE 'integration%'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;


-- ============================================================================
-- 12. OVERALL SUMMARY
-- ============================================================================

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
    'RLS Policies' as component,
    COUNT(*) as count,
    15 as expected,
    CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename LIKE 'integration%'
  
  UNION ALL
  
  SELECT 
    'Indexes' as component,
    COUNT(*) as count,
    15 as expected,
    CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename LIKE 'integration%'
  
  UNION ALL
  
  SELECT 
    'Triggers' as component,
    COUNT(*) as count,
    3 as expected,
    CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM information_schema.triggers
  WHERE event_object_schema = 'public'
  AND event_object_table LIKE 'integration%'
  
  UNION ALL
  
  SELECT 
    'Integration Types' as component,
    COUNT(*) as count,
    10 as expected,
    CASE WHEN COUNT(*) >= 10 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM integration_types
)
SELECT 
  '========================================' as separator
UNION ALL
SELECT 
  'VERIFICATION SUMMARY' as separator
UNION ALL
SELECT 
  '========================================' as separator
UNION ALL
SELECT 
  component || ': ' || count::text || '/' || expected::text || ' - ' || status as separator
FROM verification_summary
UNION ALL
SELECT 
  '========================================' as separator
UNION ALL
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM verification_summary WHERE status LIKE '%FAIL%') = 0
    THEN '✅ ALL CHECKS PASSED! Migration successful!'
    ELSE '❌ SOME CHECKS FAILED. Review errors above.'
  END as separator;


-- ============================================================================
-- VERIFICATION COMPLETE
-- ============================================================================
