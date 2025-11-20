-- =====================================================
-- FAILSAFE: Auto-sync invitation on user login
-- =====================================================
-- This trigger automatically calls accept_user_invitation when a user
-- logs in for the first time after accepting an invitation.
-- This ensures synchronization even if the frontend code fails.
-- =====================================================

-- Create a function to handle auto-sync on login
CREATE OR REPLACE FUNCTION auto_sync_invitation_on_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pending_invitation RECORD;
    v_result JSON;
BEGIN
    -- Only process if this is a new login (last_sign_in_at was just updated)
    IF NEW.last_sign_in_at IS NOT NULL AND 
       (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
        
        -- Check if there's a pending invitation for this user's email
        SELECT id, email, status
        INTO v_pending_invitation
        FROM user_invitations
        WHERE LOWER(email) = LOWER(NEW.email)
          AND status = 'pending'
        LIMIT 1;
        
        -- If found, auto-accept it
        IF v_pending_invitation.id IS NOT NULL THEN
            RAISE NOTICE 'Auto-syncing pending invitation for user: % (email: %)', NEW.id, NEW.email;
            
            -- Call the accept_user_invitation function
            SELECT accept_user_invitation(NEW.id, NEW.email)
            INTO v_result;
            
            -- Log the result
            IF (v_result->>'success')::boolean THEN
                RAISE NOTICE 'Auto-sync successful for user %: %', NEW.email, v_result;
            ELSE
                RAISE WARNING 'Auto-sync failed for user %: %', NEW.email, v_result;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger on auth.users table
-- This fires AFTER each login (when last_sign_in_at is updated)
DROP TRIGGER IF EXISTS trigger_auto_sync_invitation ON auth.users;
CREATE TRIGGER trigger_auto_sync_invitation
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_sync_invitation_on_login();

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================
COMMENT ON FUNCTION auto_sync_invitation_on_login() IS 
'Failsafe trigger function that automatically accepts pending invitations
when a user logs in. This ensures synchronization even if the frontend
invitation acceptance code fails or is skipped.

Triggered on: auth.users UPDATE of last_sign_in_at
Conditions: User has a pending invitation matching their email
Action: Calls accept_user_invitation() to sync the invitation

This provides a safety net to ensure users are always properly added
to tenant_users even if something goes wrong in the frontend flow.';

-- =====================================================
-- TESTING
-- =====================================================
-- To test this trigger:
-- 1. Create a new invitation
-- 2. Have the user sign up with the invitation link
-- 3. Set their password (but skip calling accept_user_invitation)
-- 4. Sign out
-- 5. Sign in again
-- 6. The trigger should fire and auto-sync the invitation
-- 7. Check that invitation status = 'accepted' and user is in tenant_users
-- =====================================================

-- =====================================================
-- NOTES
-- =====================================================
-- This trigger provides defense-in-depth:
-- 1. Primary: Frontend calls accept_user_invitation during signup
-- 2. Failsafe: Trigger calls it on first login if frontend failed
-- 3. Manual: Admins can call it manually if both fail
--
-- The trigger only fires on login (last_sign_in_at update), so it won't
-- cause performance issues or run unnecessarily.
-- =====================================================
