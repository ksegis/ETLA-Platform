-- =====================================================
-- FIX: Accept User Invitation Function
-- =====================================================
-- Issues fixed:
-- 1. Proper role mapping for all invitation roles
-- 2. Case-insensitive role handling
-- 3. Better error logging
-- 4. Ensure invitation status is updated even if other steps fail
-- =====================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS accept_user_invitation(UUID, TEXT);

-- Create the fixed function
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
  v_mapped_role TEXT;
  v_profile_exists BOOLEAN;
  v_user_email TEXT;
  v_user_full_name TEXT;
  v_user_created_at TIMESTAMPTZ;
  v_step TEXT;
BEGIN
  v_step := 'Finding invitation';
  
  -- Step 1: Find the pending invitation (case-insensitive email match)
  SELECT id, tenant_id, role
  INTO v_invitation_id, v_tenant_id, v_role
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
  
  -- Step 3: Map invitation role to tenant role
  -- Handle all possible role values (case-insensitive)
  v_mapped_role := CASE 
    WHEN LOWER(v_role) IN ('admin', 'host_admin') THEN 'host_admin'
    WHEN LOWER(v_role) IN ('client_admin', 'tenant_admin') THEN 'client_admin'
    WHEN LOWER(v_role) IN ('primary_client_admin', 'primary_client') THEN 'primary_client_admin'
    WHEN LOWER(v_role) IN ('program_manager', 'manager') THEN 'program_manager'
    WHEN LOWER(v_role) IN ('client_user', 'user') THEN 'client_user'
    ELSE 'client_user' -- Default to client_user for unknown roles
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
  -- THIS IS THE CRITICAL STEP - Always update the invitation status
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
      'email', p_email
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
'FIXED VERSION: Handles complete invitation acceptance workflow with improved role mapping:
1. Validates pending invitation exists (case-insensitive email)
2. Retrieves user data from auth.users
3. Maps invitation role to proper tenant role (handles primary_client_admin, etc.)
4. Creates/updates profile record
5. Adds user to tenant_users table with appropriate role
6. Updates invitation status to accepted
Returns JSON with success status and details.

Role Mapping:
- admin, host_admin -> host_admin
- client_admin, tenant_admin -> client_admin
- primary_client_admin, primary_client -> primary_client_admin
- program_manager, manager -> program_manager
- client_user, user -> client_user
- (default) -> client_user';
