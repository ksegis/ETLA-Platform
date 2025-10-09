-- CORRECTED Fix Admin Permissions for Kevin Shelton
-- ============================================================================

-- 1. First, let's check the current user setup
-- Find Kevin Shelton's user ID and current permissions
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  tu.role,
  tu.role_level,
  tu.is_primary_tenant,
  tu.permission_scope,
  tu.can_invite_users,
  tu.can_manage_sub_clients,
  tu.is_active,
  t.name as tenant_name
FROM profiles p
LEFT JOIN tenant_users tu ON p.id = tu.user_id
LEFT JOIN tenants t ON tu.tenant_id = t.id
WHERE p.email = 'kevin.shelton@egisdynamics.com';

-- 2. Add status column to profiles if it doesn't exist (from the setup script)
-- ============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Update existing profiles to have active status
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- 3. Update Kevin Shelton to have full host_admin privileges
-- ============================================================================

-- First, ensure Kevin's profile exists and is active
UPDATE profiles 
SET 
  status = 'active',
  updated_at = NOW()
WHERE email = 'kevin.shelton@egisdynamics.com';

-- 4. Update or insert tenant_users record with full admin privileges
-- ============================================================================

-- Get Kevin's user ID for the insert/update
DO $$
DECLARE
    kevin_user_id UUID;
    demo_tenant_id UUID;
BEGIN
    -- Get Kevin's user ID
    SELECT id INTO kevin_user_id 
    FROM profiles 
    WHERE email = 'kevin.shelton@egisdynamics.com';
    
    -- Get the demo tenant ID (or first available tenant)
    SELECT id INTO demo_tenant_id 
    FROM tenants 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If we found both IDs, proceed with the upsert
    IF kevin_user_id IS NOT NULL AND demo_tenant_id IS NOT NULL THEN
        -- Insert or update the tenant_users record
        INSERT INTO tenant_users (
            user_id, 
            tenant_id, 
            role, 
            role_level,
            is_primary_tenant, 
            is_active,
            permission_scope, 
            can_invite_users, 
            can_manage_sub_clients,
            requires_password_change,
            created_at,
            updated_at
        ) VALUES (
            kevin_user_id,
            demo_tenant_id,
            'host_admin',
            'super_admin',
            true,
            true,
            'all',
            true,
            true,
            false,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id, tenant_id) 
        DO UPDATE SET
            role = 'host_admin',
            role_level = 'super_admin',
            is_primary_tenant = true,
            is_active = true,
            permission_scope = 'all',
            can_invite_users = true,
            can_manage_sub_clients = true,
            requires_password_change = false,
            updated_at = NOW();
            
        RAISE NOTICE 'Updated Kevin Shelton with user_id: % for tenant_id: %', kevin_user_id, demo_tenant_id;
    ELSE
        RAISE NOTICE 'Could not find user or tenant. User ID: %, Tenant ID: %', kevin_user_id, demo_tenant_id;
    END IF;
END $$;

-- 5. Ensure Kevin has admin access to ALL tenants (if multiple exist)
-- ============================================================================
INSERT INTO tenant_users (
    user_id, 
    tenant_id, 
    role, 
    role_level,
    is_primary_tenant, 
    is_active,
    permission_scope, 
    can_invite_users, 
    can_manage_sub_clients,
    requires_password_change
)
SELECT 
    p.id,
    t.id,
    'host_admin',
    'super_admin',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) = 1 THEN true ELSE false END,
    true,
    'all',
    true,
    true,
    false
FROM profiles p
CROSS JOIN tenants t
WHERE p.email = 'kevin.shelton@egisdynamics.com'
ON CONFLICT (user_id, tenant_id) 
DO UPDATE SET
    role = 'host_admin',
    role_level = 'super_admin',
    is_active = true,
    permission_scope = 'all',
    can_invite_users = true,
    can_manage_sub_clients = true,
    requires_password_change = false,
    updated_at = NOW();

-- 6. Verify the changes
-- ============================================================================
SELECT 
    'After Update:' as status,
    p.id as user_id,
    p.email,
    p.full_name,
    COALESCE(p.status, 'no status column') as profile_status,
    tu.role,
    tu.role_level,
    tu.is_primary_tenant,
    tu.permission_scope,
    tu.can_invite_users,
    tu.can_manage_sub_clients,
    tu.is_active,
    t.name as tenant_name
FROM profiles p
LEFT JOIN tenant_users tu ON p.id = tu.user_id
LEFT JOIN tenants t ON tu.tenant_id = t.id
WHERE p.email = 'kevin.shelton@egisdynamics.com';

-- 7. Also check what tenants exist
-- ============================================================================
SELECT 
    'Available Tenants:' as info,
    id,
    name,
    created_at
FROM tenants
ORDER BY created_at;

-- 8. Quick check for any existing admin users
-- ============================================================================
SELECT 
    'Existing Admins:' as info,
    p.email,
    p.full_name,
    tu.role,
    t.name as tenant_name
FROM profiles p
JOIN tenant_users tu ON p.id = tu.user_id
JOIN tenants t ON tu.tenant_id = t.id
WHERE tu.role IN ('host_admin', 'client_admin')
ORDER BY tu.role, p.email;
