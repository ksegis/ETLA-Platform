-- =====================================================
-- DIAGNOSTIC SCRIPT: Invitation Synchronization Issue
-- =====================================================
-- Purpose: Identify why accept_user_invitation is not populating tenant_users
-- Run each section and share results for analysis
-- =====================================================

-- =====================================================
-- SECTION 1: Check if function exists and view definition
-- =====================================================
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'accept_user_invitation'
AND n.nspname = 'public';

-- =====================================================
-- SECTION 2: Check user existence in auth.users
-- =====================================================
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users
WHERE email = 'kevin.shelton+marissa2@egisdynamics.com';

-- =====================================================
-- SECTION 3: Check if profile exists
-- =====================================================
SELECT 
    id,
    email,
    full_name,
    created_at,
    updated_at
FROM profiles
WHERE email = 'kevin.shelton+marissa2@egisdynamics.com';

-- =====================================================
-- SECTION 4: Check tenant_users for this user
-- =====================================================
SELECT 
    tu.user_id,
    tu.tenant_id,
    tu.role,
    tu.is_active,
    tu.created_at,
    t.name as tenant_name
FROM tenant_users tu
LEFT JOIN tenants t ON t.id = tu.tenant_id
WHERE tu.user_id IN (
    SELECT id FROM auth.users WHERE email = 'kevin.shelton+marissa2@egisdynamics.com'
);

-- =====================================================
-- SECTION 5: Check RLS policies on tenant_users
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'tenant_users';

-- =====================================================
-- SECTION 6: Test function execution manually
-- =====================================================
-- Get the user ID first
DO $$
DECLARE
    v_user_id UUID;
    v_result JSON;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'kevin.shelton+marissa2@egisdynamics.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found in auth.users';
    ELSE
        RAISE NOTICE 'User ID: %', v_user_id;
        
        -- Try calling the function
        SELECT accept_user_invitation(
            v_user_id,
            'kevin.shelton+marissa2@egisdynamics.com'
        ) INTO v_result;
        
        RAISE NOTICE 'Function result: %', v_result;
    END IF;
END $$;

-- =====================================================
-- SECTION 7: Check for any errors in Postgres logs
-- =====================================================
-- Note: This may not work in Supabase, but worth trying
SELECT 
    *
FROM pg_stat_statements
WHERE query LIKE '%accept_user_invitation%'
ORDER BY calls DESC
LIMIT 10;

-- =====================================================
-- SECTION 8: Verify invitation details
-- =====================================================
SELECT 
    ui.id,
    ui.email,
    ui.role,
    ui.status,
    ui.tenant_id,
    ui.created_at,
    ui.accepted_at,
    ui.expires_at,
    t.name as tenant_name,
    t.type as tenant_type
FROM user_invitations ui
LEFT JOIN tenants t ON t.id = ui.tenant_id
WHERE ui.email = 'kevin.shelton+marissa2@egisdynamics.com'
ORDER BY ui.created_at DESC;

-- =====================================================
-- SECTION 9: Check if SECURITY DEFINER is set
-- =====================================================
SELECT 
    p.proname,
    p.prosecdef as is_security_definer,
    pg_get_userbyid(p.proowner) as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'accept_user_invitation'
AND n.nspname = 'public';

-- =====================================================
-- SECTION 10: Check grants on the function
-- =====================================================
SELECT 
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'accept_user_invitation'
AND routine_schema = 'public';

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Run each section separately
-- 2. Copy the results
-- 3. Share all results for analysis
-- 4. Pay special attention to:
--    - Section 1: Does function exist? What's the code?
--    - Section 2: Does user exist in auth.users?
--    - Section 3: Does profile exist?
--    - Section 4: Is user in tenant_users? (Should be NO currently)
--    - Section 5: Are RLS policies blocking inserts?
--    - Section 6: What does manual function call return?
-- =====================================================
