-- ============================================================================
-- Fix: Enable RLS on integration_types table
-- ============================================================================
-- Description: Enable Row Level Security on integration_types and add policies
-- Date: 2025-11-21
-- Version: 1.0
-- ============================================================================

-- Enable RLS on integration_types table
ALTER TABLE integration_types ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read integration types
-- This is a reference/lookup table that everyone needs access to
CREATE POLICY "integration_types_select_all"
  ON integration_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only host admins can insert integration types
CREATE POLICY "integration_types_insert_host_admin"
  ON integration_types
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
      AND tu.role = 'host_admin'
    )
  );

-- Policy: Only host admins can update integration types
CREATE POLICY "integration_types_update_host_admin"
  ON integration_types
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
      AND tu.role = 'host_admin'
    )
  );

-- Policy: Only host admins can delete integration types
CREATE POLICY "integration_types_delete_host_admin"
  ON integration_types
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
      AND tu.role = 'host_admin'
    )
  );

-- ============================================================================
-- Verification
-- ============================================================================

-- Check RLS is enabled
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'integration_types';

-- Check policies exist
SELECT 
  policyname,
  cmd as command,
  '✅ Policy exists' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'integration_types'
ORDER BY policyname;

-- ============================================================================
-- Fix Complete
-- ============================================================================
