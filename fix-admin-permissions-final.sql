-- FINAL Fix Admin Permissions for Kevin Shelton
-- ============================================================================
-- Based on actual database values:
-- Valid roles: 'host_admin', 'admin', 'manager'
-- Valid role_levels: NULL, 'sub_client'
-- Valid permission_scopes: 'own'

-- 1. Add status column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 2. Update existing profiles to have active status
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- 3. Grant Kevin Shelton full admin access with valid values
DO $$
DECLARE
    kevin_user_id UUID;
    demo_tenant_id UUID;
BEGIN
    -- Get Kevin's user ID
    SELECT id INTO kevin_user_id 
    FROM profiles 
    WHERE email = 'kevin.shelton@egisdynamics.com';
    
    -- Get the first available tenant
    SELECT id INTO demo_tenant_id 
    FROM tenants 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If we found both IDs, proceed with the upsert
    IF kevin_user_id IS NOT NULL AND demo_tenant_id IS NOT NULL THEN
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
        ) VALUES (
            kevin_user_id,
            demo_tenant_id,
            'host_admin',  -- Valid role from your data
            NULL,          -- Valid role_level from your data (NULL is valid)
            true,
            true,
            'own',         -- Valid permission_scope from your data
            true,
            true,
            false
        )
        ON CONFLICT (user_id, tenant_id) 
        DO UPDATE SET
            role = 'host_admin',
            role_level = NULL,
            is_primary_tenant = true,
            is_active = true,
            permission_scope = 'own',
            can_invite_users = true,
            can_manage_sub_clients = true,
            requires_password_change = false,
            updated_at = NOW();
            
        RAISE NOTICE 'Updated Kevin Shelton with user_id: % for tenant_id: %', kevin_user_id, demo_tenant_id;
    ELSE
        RAISE NOTICE 'Could not find user or tenant. User ID: %, Tenant ID: %', kevin_user_id, demo_tenant_id;
    END IF;
END $$;

-- 4. Verify the changes
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
