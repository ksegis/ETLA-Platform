-- =====================================================
-- CHECK TENANT TABLES - THERE ARE TWO DIFFERENT TABLES!
-- =====================================================

-- 1. Check if both tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('user_tenants', 'tenant_users')
  AND table_schema = 'public';

-- 2. Check columns in user_tenants (where we added the user)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_tenants' 
ORDER BY ordinal_position;

-- 3. Check columns in tenant_users (where the UI is looking)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenant_users' 
ORDER BY ordinal_position;

-- 4. Check if kevin.shelton+moy is in user_tenants
SELECT * FROM user_tenants 
WHERE user_id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';

-- 5. Check if kevin.shelton+moy is in tenant_users
SELECT * FROM tenant_users 
WHERE user_id = '8ded1ace-ca55-488d-a00b-934dbb7e1589';

-- 6. See what users ARE in tenant_users for comparison
SELECT 
  tu.user_id,
  tu.tenant_id,
  tu.role,
  tu.is_active,
  p.email
FROM tenant_users tu
LEFT JOIN profiles p ON p.id = tu.user_id
WHERE tu.tenant_id = '99883779-9517-4ca9-a3f8-7fdc59051f0e'
LIMIT 5;
