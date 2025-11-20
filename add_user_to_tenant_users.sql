-- =====================================================
-- ADD USER TO CORRECT TABLE: tenant_users
-- =====================================================
-- The UI looks in tenant_users, not user_tenants!
-- =====================================================

-- Step 1: Check what columns tenant_users has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenant_users' 
ORDER BY ordinal_position;

-- Step 2: Add kevin.shelton+moy to tenant_users
-- Based on the existing users, the table has: user_id, tenant_id, role, is_active
INSERT INTO tenant_users (user_id, tenant_id, role, is_active)
VALUES (
  '8ded1ace-ca55-488d-a00b-934dbb7e1589'::uuid,
  '99883779-9517-4ca9-a3f8-7fdc59051f0e'::uuid,
  'host_admin',  -- Using host_admin to match the admin role
  true
)
ON CONFLICT (user_id, tenant_id) DO UPDATE
SET 
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Step 3: Verify the user was added
SELECT 
  tu.user_id,
  tu.tenant_id,
  tu.role,
  tu.is_active,
  p.email
FROM tenant_users tu
LEFT JOIN profiles p ON p.id = tu.user_id
WHERE tu.user_id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';

-- Step 4: Check if there's a profiles record for this user
SELECT id, email, full_name
FROM profiles
WHERE id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';

-- If no profile exists, we may need to create one
-- (Profiles are usually created automatically, but just in case)
