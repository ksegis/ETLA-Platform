-- =====================================================
-- SQL Migration: User Invitation Acceptance Function
-- =====================================================
-- Purpose: Create a database function to handle invitation acceptance
-- This bypasses Next.js API route issues by handling logic in the database
-- =====================================================

-- Create or replace the function to accept user invitations
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
  UPDATE user_invitations
  SET 
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = v_invitation_id;

  -- Update the user's app_metadata with tenant and role information
  -- Note: This requires the auth.users table to be accessible
  -- If using Supabase Auth, you may need to use the Supabase Management API instead
  -- For now, we'll return the data and let the client handle the metadata update
  
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

-- =====================================================
-- Usage Example:
-- =====================================================
-- SELECT accept_user_invitation(
--   'user-uuid-here',
--   'user@example.com'
-- );
-- =====================================================

-- =====================================================
-- Alternative: Create a trigger-based approach
-- =====================================================
-- This automatically updates invitation status when user metadata changes
-- Uncomment if you prefer a trigger-based approach

/*
CREATE OR REPLACE FUNCTION auto_accept_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a user's metadata indicates they've accepted an invite
  IF NEW.raw_user_meta_data->>'invite_accepted' = 'true' THEN
    UPDATE user_invitations
    SET 
      status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
    WHERE email = NEW.email
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS trigger_auto_accept_invitation ON auth.users;
CREATE TRIGGER trigger_auto_accept_invitation
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_accept_invitation();
*/

-- =====================================================
-- Verification Queries
-- =====================================================
-- Check pending invitations:
-- SELECT * FROM user_invitations WHERE status = 'pending';

-- Check if function exists:
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'accept_user_invitation';
-- =====================================================
