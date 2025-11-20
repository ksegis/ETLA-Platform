-- =====================================================
-- VALIDATION QUERIES FOR INVITATION ACCEPTANCE MIGRATION
-- =====================================================
-- Run these queries in your Supabase SQL Editor to verify
-- that the migration was successful
-- =====================================================

-- =====================================================
-- 1. VERIFY FUNCTION EXISTS
-- =====================================================
-- This should return 1 row showing the function details
SELECT 
  proname as function_name,
  pronargs as number_of_arguments,
  proargnames as argument_names,
  pg_get_function_result(oid) as return_type,
  prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'accept_user_invitation';

-- Expected result:
-- function_name: accept_user_invitation
-- number_of_arguments: 2
-- argument_names: {p_user_id, p_email}
-- return_type: json
-- is_security_definer: true (t)


-- =====================================================
-- 2. VERIFY FUNCTION PERMISSIONS
-- =====================================================
-- This checks that authenticated users can execute the function
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'accept_user_invitation';

-- Expected result should include:
-- grantee: authenticated
-- privilege_type: EXECUTE


-- =====================================================
-- 3. CHECK CURRENT INVITATION STATUS
-- =====================================================
-- View all invitations and their current status
SELECT 
  id,
  email,
  role,
  status,
  tenant_id,
  created_at,
  accepted_at,
  CASE 
    WHEN status = 'pending' THEN 'Awaiting acceptance'
    WHEN status = 'accepted' THEN 'Completed'
    ELSE status
  END as status_description
FROM user_invitations
ORDER BY created_at DESC
LIMIT 10;

-- This shows you the current state of invitations


-- =====================================================
-- 4. TEST THE FUNCTION (DRY RUN)
-- =====================================================
-- Replace with actual values from a pending invitation
-- This will test if the function works without actually running it

-- First, get a pending invitation to test with:
SELECT 
  id as invitation_id,
  email,
  tenant_id,
  role,
  status
FROM user_invitations
WHERE status = 'pending'
LIMIT 1;

-- Then test the function with those values:
-- IMPORTANT: Replace 'test@example.com' with an actual pending invitation email
-- Replace '00000000-0000-0000-0000-000000000000' with an actual user_id if testing

-- SELECT accept_user_invitation(
--   '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with actual user_id
--   'test@example.com'                              -- Replace with actual email
-- );

-- Expected successful result:
-- {"success": true, "invitation_id": "...", "tenant_id": "...", "role": "..."}


-- =====================================================
-- 5. COUNT INVITATIONS BY STATUS
-- =====================================================
-- Summary view of all invitation statuses
SELECT 
  status,
  COUNT(*) as count,
  ARRAY_AGG(email ORDER BY created_at DESC) as recent_emails
FROM user_invitations
GROUP BY status
ORDER BY status;

-- This gives you a quick overview of invitation distribution


-- =====================================================
-- 6. CHECK FOR ORPHANED INVITATIONS
-- =====================================================
-- Find invitations that might need attention
SELECT 
  email,
  status,
  role,
  created_at,
  EXTRACT(DAY FROM NOW() - created_at) as days_old
FROM user_invitations
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at ASC;

-- Shows pending invitations older than 7 days


-- =====================================================
-- 7. VERIFY USER METADATA AFTER ACCEPTANCE
-- =====================================================
-- Check if users have proper metadata after accepting invitations
-- This query checks the auth.users table (if you have access)

SELECT 
  u.email,
  u.created_at as user_created_at,
  u.raw_user_meta_data->>'invite_accepted' as invite_accepted,
  u.raw_user_meta_data->>'tenant_id' as tenant_id,
  u.raw_user_meta_data->>'role' as role,
  ui.status as invitation_status,
  ui.accepted_at
FROM auth.users u
LEFT JOIN user_invitations ui ON ui.email = u.email
WHERE ui.id IS NOT NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- Shows correlation between user accounts and invitations


-- =====================================================
-- 8. CHECK FUNCTION SOURCE CODE
-- =====================================================
-- View the actual function implementation to verify it's correct
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'accept_user_invitation';

-- This shows the complete function source code


-- =====================================================
-- TROUBLESHOOTING QUERIES
-- =====================================================

-- If function is not found, check all functions in the public schema:
-- SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;

-- If permissions are missing, grant them manually:
-- GRANT EXECUTE ON FUNCTION accept_user_invitation(UUID, TEXT) TO authenticated;

-- If you need to drop and recreate the function:
-- DROP FUNCTION IF EXISTS accept_user_invitation(UUID, TEXT);
-- Then re-run the migration SQL

-- =====================================================
-- END OF VALIDATION QUERIES
-- =====================================================
