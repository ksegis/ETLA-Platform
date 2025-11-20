-- =====================================================
-- DIAGNOSTIC QUERIES FOR INVITATION ACCEPTANCE ISSUE
-- =====================================================

-- 1. Check if the user account was created in auth.users
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data->>'invite_accepted' as invite_accepted,
  raw_user_meta_data->>'tenant_id' as tenant_id,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'kevin.shelton+moy@egisdynamics.com';

-- 2. Check the invitation status in user_invitations
SELECT 
  id,
  email,
  role,
  status,
  tenant_id,
  created_at,
  accepted_at,
  updated_at
FROM user_invitations
WHERE email = 'kevin.shelton+moy@egisdynamics.com';

-- 3. Check if there's a user_tenants record
SELECT 
  ut.id,
  ut.user_id,
  ut.tenant_id,
  ut.role,
  ut.created_at,
  u.email
FROM user_tenants ut
JOIN auth.users u ON u.id = ut.user_id
WHERE u.email = 'kevin.shelton+moy@egisdynamics.com';

-- 4. Check Supabase logs for function calls (if available)
-- This would show if the accept_user_invitation function was called
-- Run this in the Logs section of Supabase dashboard

-- 5. Test calling the function manually
-- Replace with the actual user_id from query #1
-- SELECT accept_user_invitation(
--   'USER_ID_HERE'::uuid,
--   'kevin.shelton+moy@egisdynamics.com'
-- );
