-- =====================================================
-- FIX: Role Mapping Bug in accept_user_invitation
-- =====================================================
-- Issue: Function only looks at 'role' field, ignores 'role_level'
-- Result: Primary Client + Admin = host_admin (WRONG!)
-- Should be: Primary Client + Admin = primary_client_admin
-- =====================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS accept_user_invitation(UUID, TEXT);

-- Create the CORRECTED function
CREATE OR REPLACE FUNCTION accept_user_invitation(
  p_user_id UUID,
  p_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
DECLARE
  v_invitation_id UUID;
  v_tenant_id UUID;
  v_role TEXT;
  v_role_level TEXT;  -- ✅ NEW: Added role_level variable
  v_mapped_role TEXT;
  v_profile_exists BOOLEAN;
  v_user_email TEXT;
  v_user_full_name TEXT;
  v_user_created_at TIMESTAMPTZ;
  v_step TEXT;
BEGIN
  v_step := 'Finding invitation';
  
  -- Step 1: Find the pending invitation (case-insensitive email match)
  -- ✅ FIXED: Now fetches BOTH role AND role_level
  SELECT id, tenant_id, role, role_level
  INTO v_invitation_id, v_tenant_id, v_role, v_role_level
  FROM user_invitations
  WHERE LOWER(email) = LOWER(p_email)
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no pending invitation found, return error
  IF v_invitation_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No pending invitation found for this email',
      'email', p_email
    );
  END IF;

  v_step := 'Getting user info';
  
  -- Step 2: Get user info from auth.users
  SELECT 
    email,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    created_at
  INTO v_user_email, v_user_full_name, v_user_created_at
  FROM auth.users
  WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found in auth.users',
      'user_id', p_user_id
    );
  END IF;

  v_step := 'Mapping role';
  
  -- ✅ FIXED: Step 3: Map role_level + role to correct tenant role
  -- Combines role_level and role to create the proper role key
  v_mapped_role := CASE 
    -- Host Admin (role_level = 'host')
    WHEN LOWER(v_role_level) = 'host' THEN 'host_admin'
    
    -- Primary Client roles (role_level = 'primary_client')
    WHEN LOWER(v_role_level) = 'primary_client' AND LOWER(v_role) = 'admin' THEN 'primary_client_admin'
    WHEN LOWER(v_role_level) = 'primary_client' AND LOWER(v_role) = 'manager' THEN 'program_manager'
    WHEN LOWER(v_role_level) = 'primary_client' AND LOWER(v_role) = 'user' THEN 'client_user'
    WHEN LOWER(v_role_level) = 'primary_client' THEN 'primary_client_admin' -- Default for primary_client
    
    -- Sub Client roles (role_level = 'sub_client')
    WHEN LOWER(v_role_level) = 'sub_client' AND LOWER(v_role) = 'admin' THEN 'client_admin'
    WHEN LOWER(v_role_level) = 'sub_client' AND LOWER(v_role) = 'manager' THEN 'program_manager'
    WHEN LOWER(v_role_level) = 'sub_client' AND LOWER(v_role) = 'user' THEN 'client_user'
    WHEN LOWER(v_role_level) = 'sub_client' THEN 'client_user' -- Default for sub_client
    
    -- Fallback: Try to match just the role (for backwards compatibility)
    WHEN LOWER(v_role) = 'host_admin' THEN 'host_admin'
    WHEN LOWER(v_role) = 'primary_client_admin' THEN 'primary_client_admin'
    WHEN LOWER(v_role) = 'client_admin' THEN 'client_admin'
    WHEN LOWER(v_role) = 'program_manager' THEN 'program_manager'
    WHEN LOWER(v_role) = 'client_user' THEN 'client_user'
    
    -- Ultimate fallback
    ELSE 'client_user'
  END;

  v_step := 'Checking profile';
  
  -- Step 4: Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id)
  INTO v_profile_exists;

  v_step := 'Creating/updating profile';
  
  -- Step 5: Create or update profile
  INSERT INTO profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    p_user_id,
    v_user_email,
    v_user_full_name,
    v_user_created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    updated_at = NOW();

  v_step := 'Adding to tenant_users';
  
  -- Step 6: Add user to tenant_users table
  INSERT INTO tenant_users (user_id, tenant_id, role, is_active)
  VALUES (
    p_user_id,
    v_tenant_id,
    v_mapped_role,
    true
  )
  ON CONFLICT (user_id, tenant_id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

  v_step := 'Updating invitation status';
  
  -- Step 7: Update invitation status to 'accepted'
  UPDATE user_invitations
  SET 
    status = 'accepted',
    accepted_at = NOW()
  WHERE id = v_invitation_id;

  -- Verify the update worked
  IF NOT FOUND THEN
    RAISE WARNING 'Failed to update invitation status for invitation_id: %', v_invitation_id;
  END IF;

  v_step := 'Returning success';
  
  -- Step 8: Return success with details
  RETURN json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'tenant_id', v_tenant_id,
    'role', v_mapped_role,
    'original_role', v_role,
    'original_role_level', v_role_level,
    'profile_created', NOT v_profile_exists,
    'message', 'Invitation accepted successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log error details
    RAISE WARNING 'Error in accept_user_invitation at step %: % (SQLSTATE: %)', v_step, SQLERRM, SQLSTATE;
    
    -- Return detailed error information
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE,
      'step', v_step,
      'invitation_id', v_invitation_id,
      'user_id', p_user_id,
      'email', p_email,
      'role_level', v_role_level,
      'role', v_role
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION accept_user_invitation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_user_invitation(UUID, TEXT) TO anon;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================
COMMENT ON FUNCTION accept_user_invitation(UUID, TEXT) IS 
'FIXED VERSION (2024-11-21): Properly handles role_level + role combination

Role Mapping Logic:
┌──────────────────┬──────────┬─────────────────────────┐
│ Role Level       │ Role     │ Mapped Tenant Role      │
├──────────────────┼──────────┼─────────────────────────┤
│ host             │ (any)    │ host_admin              │
│ primary_client   │ admin    │ primary_client_admin ✅ │
│ primary_client   │ manager  │ program_manager         │
│ primary_client   │ user     │ client_user             │
│ sub_client       │ admin    │ client_admin            │
│ sub_client       │ manager  │ program_manager         │
│ sub_client       │ user     │ client_user             │
└──────────────────┴──────────┴─────────────────────────┘

Bug Fixed:
- BEFORE: Only looked at role field → "admin" = host_admin (WRONG!)
- AFTER: Combines role_level + role → "primary_client" + "admin" = primary_client_admin (CORRECT!)

This ensures users get the correct permissions based on BOTH fields.';

-- =====================================================
-- TESTING
-- =====================================================
-- To verify the fix:
-- 1. Create a new invitation with Role Level = "Primary Client", Role = "Admin"
-- 2. Accept the invitation
-- 3. Check tenant_users table:
--    SELECT user_id, role FROM tenant_users WHERE user_id = 'USER_ID_HERE';
-- 4. Should show role = 'primary_client_admin' (NOT 'host_admin')
-- =====================================================
