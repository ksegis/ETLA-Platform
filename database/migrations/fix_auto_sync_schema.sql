-- Fix auto_sync_invitation_on_login() to use correct schema for user_invitations table

CREATE OR REPLACE FUNCTION public.auto_sync_invitation_on_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation RECORD;
    v_result JSON;
BEGIN
    -- Only process if this is a login (last_sign_in_at changed)
    IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
        
        -- Check if there's a pending invitation for this user
        SELECT id, email, status
        INTO v_invitation
        FROM public.user_invitations  -- ✅ FIX: Explicitly use public schema
        WHERE LOWER(email) = LOWER(NEW.email)
          AND status = 'pending'
        LIMIT 1;
        
        -- If pending invitation found, accept it
        IF v_invitation.id IS NOT NULL THEN
            -- Call the accept_user_invitation function
            SELECT public.accept_user_invitation(NEW.id, NEW.email)
            INTO v_result;
            
            -- Log the result
            IF v_result->>'success' = 'true' THEN
                RAISE NOTICE 'Auto-synced invitation for user %', NEW.email;
            ELSE
                RAISE WARNING 'Failed to auto-sync invitation for user %: %', 
                    NEW.email, v_result->>'error';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the login
        RAISE WARNING 'Error in auto_sync_invitation_on_login for user %: %', 
            NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.auto_sync_invitation_on_login() IS
'Trigger function that auto-syncs pending invitations when user logs in.
Fixes invitation status if user somehow logged in without accepting invitation.
Fixed: 2025-11-20 - Added explicit public schema to user_invitations query.';
