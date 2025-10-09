-- Fix Admin Permissions for Kevin Shelton
-- ============================================================================

-- 1. First, let's check the current user setup
-- Find Kevin Shelton's user ID and current permissions
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.status as profile_status,
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

-- 2. Update Kevin Shelton to have full host_admin privileges
-- ============================================================================

-- Update the user's profile to be active
UPDATE profiles 
SET 
  status = 'active',
  updated_at = NOW()
WHERE email = 'kevin.shelton@egisdynamics.com';

-- Update or insert tenant_users record with full admin privileges
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
)
SELECT 
  p.id,
  t.id,
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
FROM profiles p
CROSS JOIN tenants t
WHERE p.email = 'kevin.shelton@egisdynamics.com'
  AND t.name = 'Demo Company'
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

-- 3. Create additional admin permissions if needed
-- ============================================================================

-- Ensure there's a host_admin role for all tenants if needed
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
  CASE WHEN t.name = 'Demo Company' THEN true ELSE false END,
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

-- 4. Verify the changes
-- ============================================================================
SELECT 
  'After Update:' as status,
  p.id as user_id,
  p.email,
  p.full_name,
  p.status as profile_status,
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

-- 5. Create sample roles and permissions data for testing
-- ============================================================================

-- Create a roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tenant_id UUID REFERENCES tenants(id),
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  feature VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Insert system roles
INSERT INTO roles (name, description, is_system_role) VALUES
('Host Admin', 'Full system administrator with all privileges', true),
('Client Admin', 'Tenant administrator with full tenant privileges', true),
('Manager', 'Department manager with team oversight privileges', true),
('HR', 'Human resources with employee data access', true),
('Employee', 'Standard employee with basic access', true)
ON CONFLICT DO NOTHING;

-- Insert basic permissions
INSERT INTO permissions (name, description, feature, action) VALUES
('View Users', 'View user accounts', 'user_management', 'view'),
('Create Users', 'Create new user accounts', 'user_management', 'create'),
('Update Users', 'Modify user accounts', 'user_management', 'update'),
('Delete Users', 'Delete user accounts', 'user_management', 'delete'),
('Manage Access Control', 'Manage roles and permissions', 'access_control', 'manage'),
('View Reports', 'View reporting data', 'reporting', 'view'),
('Export Data', 'Export system data', 'reporting', 'export'),
('Manage Tenants', 'Manage tenant configurations', 'tenant_management', 'manage')
ON CONFLICT DO NOTHING;

-- Assign all permissions to Host Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Host Admin'
ON CONFLICT DO NOTHING;
