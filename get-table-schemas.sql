-- Get Table Schemas and Constraints
-- ============================================================================

-- 1. Get the tenant_users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'tenant_users' 
ORDER BY ordinal_position;

-- 2. Get all constraints on tenant_users table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'tenant_users';

-- 3. Get the profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Get all constraints on profiles table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles';

-- 5. Get the tenants table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'tenants' 
ORDER BY ordinal_position;

-- 6. Show current data in tenant_users to see valid values
SELECT DISTINCT 
    role,
    role_level,
    permission_scope
FROM tenant_users 
WHERE role IS NOT NULL;

-- 7. Check what Kevin's current record looks like (if exists)
SELECT 
    tu.*,
    p.email,
    p.full_name
FROM tenant_users tu
JOIN profiles p ON tu.user_id = p.id
WHERE p.email = 'kevin.shelton@egisdynamics.com';

-- 8. Show all existing users and their roles for reference
SELECT 
    p.email,
    p.full_name,
    tu.role,
    tu.role_level,
    tu.permission_scope,
    tu.is_active
FROM profiles p
LEFT JOIN tenant_users tu ON p.id = tu.user_id
ORDER BY tu.role, p.email;
