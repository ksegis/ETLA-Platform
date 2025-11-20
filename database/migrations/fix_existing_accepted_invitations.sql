-- =====================================================
-- MANUAL FIX: Update existing invitations that should be 'accepted'
-- =====================================================
-- This script fixes invitations that are still marked as 'pending'
-- even though the user has already accepted and logged in
-- =====================================================

-- Step 1: Find all invitations where the user exists in tenant_users but invitation is still pending
-- This query shows what will be updated
SELECT 
    ui.id as invitation_id,
    ui.email,
    ui.role as invitation_role,
    ui.status as current_status,
    ui.created_at as invited_at,
    tu.user_id,
    tu.role as tenant_role,
    tu.created_at as joined_at,
    au.email as auth_email
FROM user_invitations ui
INNER JOIN auth.users au ON LOWER(au.email) = LOWER(ui.email)
INNER JOIN tenant_users tu ON tu.user_id = au.id AND tu.tenant_id = ui.tenant_id
WHERE ui.status = 'pending';

-- Step 2: Update these invitations to 'accepted'
UPDATE user_invitations ui
SET 
    status = 'accepted',
    accepted_at = COALESCE(
        (SELECT tu.created_at 
         FROM tenant_users tu 
         INNER JOIN auth.users au ON tu.user_id = au.id
         WHERE LOWER(au.email) = LOWER(ui.email) 
         AND tu.tenant_id = ui.tenant_id
         LIMIT 1),
        NOW()
    )
FROM auth.users au
INNER JOIN tenant_users tu ON tu.user_id = au.id AND tu.tenant_id = ui.tenant_id
WHERE ui.status = 'pending'
  AND LOWER(au.email) = LOWER(ui.email);

-- Step 3: Verify the update
SELECT 
    COUNT(*) as total_invitations,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
    SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_count
FROM user_invitations;

-- =====================================================
-- INSTRUCTIONS FOR USE:
-- =====================================================
-- 1. Run Step 1 first to see which invitations will be updated
-- 2. Review the results to ensure they are correct
-- 3. Run Step 2 to perform the update
-- 4. Run Step 3 to verify the counts
-- 5. Refresh the Invitations tab in the UI to see the changes
-- =====================================================
