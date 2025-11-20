-- =====================================================
-- CORRECTED SQL Migration: User Invitation Acceptance Function
-- =====================================================
-- This fixes the issue where updated_at column doesn't exist
-- =====================================================

-- Drop the existing function first
DROP FUNCTION IF EXISTS accept_user_invitation(UUID, TEXT);

-- Create the corrected function
CREATE OR REPLACE FUNCTION accept_user_invitation(
  p_user_id UUID,
  p_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges to update tables
AS $$
DECLARE
  v_invitation_id UUID;
  v_tenant_id UUID;
  v_role TEXT;
  v_result JSON;
BEGIN
  -- Find the pending invitation for this email
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

  -- Update the invitation status to 'accepted'
  -- FIXED: Removed updated_at column reference
  UPDATE user_invitations
  SET 
    status = 'accepted',
    accepted_at = NOW()
  WHERE id = v_invitation_id;

  -- Return success with the invitation details
  RETURN json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'tenant_id', v_tenant_id,
    'role', v_role
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error if anything goes wrong
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_user_invitation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_user_invitation(UUID, TEXT) TO anon;

-- =====================================================
-- Test the corrected function
-- =====================================================
-- After running this, test with:
-- SELECT accept_user_invitation(
--   'USER_ID_HERE'::uuid,
--   'kevin.shelton+moy@egisdynamics.com'
-- );
-- =====================================================
