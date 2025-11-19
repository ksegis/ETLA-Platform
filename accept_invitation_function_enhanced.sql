-- =====================================================
-- ENHANCED SQL Migration: Complete Invitation Acceptance
-- =====================================================
-- This function automatically handles ALL steps:
-- 1. Updates invitation status to 'accepted'
-- 2. Creates profile record if missing
-- 3. Adds user to tenant_users table
-- =====================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS accept_user_invitation(UUID, TEXT);

-- Create the enhanced function
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
  v_profile_exists BOOLEAN;
  v_user_email TEXT;
  v_user_full_name TEXT;
  v_user_created_at TIMESTAMPTZ;
BEGIN
  -- Step 1: Find the pending invitation
  SELECT id, tenant_id, role
  INTO v_invitation_id, v_tenant_id, v_role
  FROM user_invitations
  WHERE email = p_email
    AND status = 'pending'
  LIMIT 1;

  -- If no pending invitation found, return error
  IF v_invitation_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No pending invitation found for this email'
    );
  END IF;

  -- Step 2: Get user info from auth.users
  SELECT 
    email,
    raw_user_meta_data->>'full_name',
    created_at
  INTO v_user_email, v_user_full_name, v_user_created_at
  FROM auth.users
  WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found in auth.users'
    );
  END IF;

  -- Step 3: Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id)
  INTO v_profile_exists;

  -- Step 4: Create profile if it doesn't exist
  IF NOT v_profile_exists THEN
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
      full_name = EXCLUDED.full_name,
      updated_at = NOW();
  END IF;

  -- Step 5: Add user to tenant_users table
  -- Map invitation role to tenant role
  -- 'admin' from invitation -> 'host_admin' in tenant_users
  INSERT INTO tenant_users (user_id, tenant_id, role, is_active)
  VALUES (
    p_user_id,
    v_tenant_id,
    CASE 
      WHEN v_role = 'admin' THEN 'host_admin'
      WHEN v_role = 'manager' THEN 'manager'
      ELSE 'user'
    END,
    true
  )
  ON CONFLICT (user_id, tenant_id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

  -- Step 6: Update invitation status to 'accepted'
  UPDATE user_invitations
  SET 
    status = 'accepted',
    accepted_at = NOW()
  WHERE id = v_invitation_id;

  -- Step 7: Return success with details
  RETURN json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'tenant_id', v_tenant_id,
    'role', v_role,
    'profile_created', NOT v_profile_exists,
    'message', 'Invitation accepted successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return detailed error information
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
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
'Handles complete invitation acceptance workflow:
1. Validates pending invitation exists
2. Retrieves user data from auth.users
3. Creates profile record if missing
4. Adds user to tenant_users table with appropriate role
5. Updates invitation status to accepted
Returns JSON with success status and details.';

-- =====================================================
-- Test the enhanced function
-- =====================================================
-- After running this, test with a new invitation:
-- 1. Create a new invitation in the UI
-- 2. Accept the invitation
-- 3. Verify:
--    - Invitation status changes to 'accepted'
--    - User appears in user list immediately
--    - User has correct role and permissions
-- =====================================================
