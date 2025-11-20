-- =====================================================
-- MANUAL FIX FOR kevin.shelton+moy@egisdynamics.com
-- =====================================================
-- This user accepted the invitation but the status wasn't updated
-- and they weren't added to user_tenants table
-- =====================================================

-- Step 1: Get the user_id from auth.users
-- Run this first to get the user_id
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'kevin.shelton+moy@egisdynamics.com';

-- Copy the user_id from the result above, then continue with Step 2

-- =====================================================
-- Step 2: Update invitation status to 'accepted'
-- =====================================================
UPDATE user_invitations
SET 
  status = 'accepted',
  accepted_at = NOW()
WHERE email = 'kevin.shelton+moy@egisdynamics.com'
  AND status = 'pending';

-- Verify the update
SELECT 
  id, email, role, status, tenant_id, accepted_at
FROM user_invitations
WHERE email = 'kevin.shelton+moy@egisdynamics.com';

-- =====================================================
-- Step 3: Add user to user_tenants table
-- REPLACE 'USER_ID_HERE' with the actual user_id from Step 1
-- =====================================================
INSERT INTO user_tenants (user_id, tenant_id, role, is_primary_tenant)
VALUES (
  'USER_ID_HERE'::uuid,  -- Replace with actual user_id
  '99883779-9517-4ca9-a3f8-7fdc59051f0e'::uuid,  -- tenant_id from invitation
  'admin',  -- role from invitation
  true  -- This is their primary tenant
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Verify the user_tenants record was created
SELECT 
  ut.user_id, 
  ut.tenant_id, 
  ut.role, 
  ut.is_primary_tenant,
  u.email
FROM user_tenants ut
JOIN auth.users u ON u.id = ut.user_id
WHERE u.email = 'kevin.shelton+moy@egisdynamics.com';

-- =====================================================
-- Step 4: Verify the user now appears in the user list
-- =====================================================
-- This query simulates what the user list probably does
SELECT 
  u.id,
  u.email,
  ut.role,
  ut.tenant_id,
  u.created_at
FROM auth.users u
JOIN user_tenants ut ON ut.user_id = u.id
WHERE ut.tenant_id = '99883779-9517-4ca9-a3f8-7fdc59051f0e'
ORDER BY u.created_at DESC;

-- =====================================================
-- SUMMARY OF WHAT THIS FIXES:
-- 1. Updates invitation status from 'pending' to 'accepted'
-- 2. Sets the accepted_at timestamp
-- 3. Adds user to user_tenants table (this is why they weren't in user list)
-- 4. Sets them as admin role in the tenant
-- =====================================================
