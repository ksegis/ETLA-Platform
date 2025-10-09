-- Consolidate Admin Permissions for Kevin Shelton
-- ============================================================================

-- 1. Remove conflicting 'admin' and 'sub_client' roles for Kevin Shelton
DELETE FROM tenant_users
WHERE user_id = (SELECT id FROM profiles WHERE email = 'kevin.shelton@egisdynamics.com')
  AND role IN ('admin', 'sub_client');

-- 2. Ensure the 'host_admin' role has the correct permissions
UPDATE tenant_users
SET
  role = 'host_admin',
  role_level = NULL, -- Set to NULL as per your schema
  is_primary_tenant = true,
  is_active = true,
  permission_scope = 'all', -- Set to 'all' for full access
  can_invite_users = true,
  can_manage_sub_clients = true,
  requires_password_change = false,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM profiles WHERE email = 'kevin.shelton@egisdynamics.com')
  AND tenant_id = (SELECT id FROM tenants WHERE name = 'Demo Company');

-- 3. Verify the final permissions for Kevin Shelton
SELECT 
    p.email,
    p.full_name,
    tu.role,
    tu.role_level,
    tu.is_primary_tenant,
    tu.permission_scope,
    tu.is_active,
    t.name as tenant_name
FROM profiles p
LEFT JOIN tenant_users tu ON p.id = tu.user_id
LEFT JOIN tenants t ON tu.tenant_id = t.id
WHERE p.email = 'kevin.shelton@egisdynamics.com';

