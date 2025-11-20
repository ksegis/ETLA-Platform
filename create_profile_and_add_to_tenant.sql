-- =====================================================
-- CREATE PROFILE AND ADD TO TENANT_USERS
-- =====================================================
-- The user needs a profile record before being added to tenant_users
-- =====================================================

-- Step 1: Check what columns profiles table has
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 2: Check if profile already exists
SELECT id, email, full_name, created_at
FROM profiles
WHERE id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';

-- Step 3: Get user info from auth.users to populate profile
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
WHERE id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';

-- Step 4: Create profile record
-- Adjust columns based on what Step 1 shows
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE id = '8ded1ace-ca55-488d-a00b-934dbb7e1589'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Step 5: Verify profile was created
SELECT id, email, full_name, created_at
FROM profiles
WHERE id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';

-- Step 6: Now add to tenant_users
INSERT INTO tenant_users (user_id, tenant_id, role, is_active)
VALUES (
  '8ded1ace-ca55-488d-a00b-934dbb7e1589'::uuid,
  '99883779-9517-4ca9-a3f8-7fdc59051f0e'::uuid,
  'host_admin',
  true
)
ON CONFLICT (user_id, tenant_id) DO UPDATE
SET 
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Step 7: Final verification - user should now appear in the list
SELECT 
  tu.user_id,
  tu.tenant_id,
  tu.role,
  tu.is_active,
  p.email,
  p.full_name
FROM tenant_users tu
JOIN profiles p ON p.id = tu.user_id
WHERE tu.user_id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';
