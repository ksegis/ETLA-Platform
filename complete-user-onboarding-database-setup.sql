-- ============================================================================
-- COMPLETE USER ONBOARDING DATABASE SETUP
-- ============================================================================

-- 1. CREATE AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    status,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'pending_assignment', -- New status for unassigned users
    NOW(), 
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 2. ADD STATUS COLUMN TO PROFILES (if not exists)
-- ============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_assignment';

-- Update existing profiles to have active status
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- 3. ENHANCE TENANT_USERS TABLE
-- ============================================================================
-- Add primary tenant tracking
ALTER TABLE tenant_users ADD COLUMN IF NOT EXISTS is_primary_tenant BOOLEAN DEFAULT false;

-- Add password change requirement tracking
ALTER TABLE tenant_users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT false;

-- Create unique constraint for primary tenant (only one per user)
DROP INDEX IF EXISTS idx_user_primary_tenant;
CREATE UNIQUE INDEX idx_user_primary_tenant 
ON tenant_users (user_id) 
WHERE is_primary_tenant = true;

-- 4. CREATE USER INVITATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  job_title VARCHAR(255),
  department VARCHAR(255),
  invited_by UUID REFERENCES profiles(id),
  tenant_id UUID REFERENCES tenants(id),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  role_level VARCHAR(50),
  permission_scope VARCHAR(50) DEFAULT 'own',
  can_invite_users BOOLEAN DEFAULT false,
  can_manage_sub_clients BOOLEAN DEFAULT false,
  temporary_password VARCHAR(255),
  invitation_token UUID DEFAULT uuid_generate_v4(),
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);

-- 5. CREATE FUNCTION TO HANDLE USER ASSIGNMENT
-- ============================================================================
CREATE OR REPLACE FUNCTION assign_user_to_tenant(
  p_user_id UUID,
  p_tenant_id UUID,
  p_role VARCHAR(50) DEFAULT 'user',
  p_role_level VARCHAR(50) DEFAULT NULL,
  p_is_primary BOOLEAN DEFAULT false,
  p_permission_scope VARCHAR(50) DEFAULT 'own',
  p_can_invite_users BOOLEAN DEFAULT false,
  p_can_manage_sub_clients BOOLEAN DEFAULT false,
  p_requires_password_change BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  assignment_exists BOOLEAN;
BEGIN
  -- Check if assignment already exists
  SELECT EXISTS(
    SELECT 1 FROM tenant_users 
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id
  ) INTO assignment_exists;
  
  IF assignment_exists THEN
    -- Update existing assignment
    UPDATE tenant_users SET
      role = p_role,
      role_level = p_role_level,
      is_primary_tenant = p_is_primary,
      permission_scope = p_permission_scope,
      can_invite_users = p_can_invite_users,
      can_manage_sub_clients = p_can_manage_sub_clients,
      requires_password_change = p_requires_password_change,
      is_active = true,
      updated_at = NOW()
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
  ELSE
    -- Create new assignment
    INSERT INTO tenant_users (
      user_id, tenant_id, role, role_level, is_primary_tenant,
      permission_scope, can_invite_users, can_manage_sub_clients,
      requires_password_change, is_active
    ) VALUES (
      p_user_id, p_tenant_id, p_role, p_role_level, p_is_primary,
      p_permission_scope, p_can_invite_users, p_can_manage_sub_clients,
      p_requires_password_change, true
    );
  END IF;
  
  -- Update profile status to active
  UPDATE profiles SET 
    status = 'active',
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE FUNCTION TO HANDLE INVITATION ACCEPTANCE
-- ============================================================================
CREATE OR REPLACE FUNCTION accept_invitation(
  p_invitation_token UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record user_invitations%ROWTYPE;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM user_invitations
  WHERE invitation_token = p_invitation_token
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Assign user to tenant with invitation details
  PERFORM assign_user_to_tenant(
    p_user_id,
    invitation_record.tenant_id,
    invitation_record.role,
    invitation_record.role_level,
    true, -- First assignment is primary
    invitation_record.permission_scope,
    invitation_record.can_invite_users,
    invitation_record.can_manage_sub_clients,
    true -- Require password change
  );
  
  -- Update invitation status
  UPDATE user_invitations SET
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE invitation_token = p_invitation_token;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE ADMIN NOTIFICATION SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- 'new_user', 'invitation_sent', 'user_assigned', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  user_id UUID REFERENCES profiles(id),
  admin_id UUID REFERENCES profiles(id),
  tenant_id UUID REFERENCES tenants(id),
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin ON admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(admin_id, is_read);

-- 8. CREATE FUNCTION TO SEND ADMIN NOTIFICATIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION send_admin_notification(
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_user_id UUID DEFAULT NULL,
  p_tenant_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Send notification to all host admins and relevant tenant admins
  FOR admin_record IN
    SELECT DISTINCT p.id as admin_id
    FROM profiles p
    JOIN tenant_users tu ON p.id = tu.user_id
    WHERE tu.role IN ('host_admin', 'client_admin')
      AND tu.is_active = true
      AND (p_tenant_id IS NULL OR tu.tenant_id = p_tenant_id)
  LOOP
    INSERT INTO admin_notifications (
      type, title, message, user_id, admin_id, tenant_id, data
    ) VALUES (
      p_type, p_title, p_message, p_user_id, admin_record.admin_id, p_tenant_id, p_data
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. CREATE TRIGGER FOR NEW USER NOTIFICATIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification when new profile is created
  PERFORM send_admin_notification(
    'new_user',
    'New User Requires Assignment',
    'A new user "' || NEW.full_name || '" (' || NEW.email || ') has signed up and requires tenant assignment.',
    NEW.id,
    NULL,
    jsonb_build_object('email', NEW.email, 'full_name', NEW.full_name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS notify_new_user_trigger ON profiles;

-- Create the trigger
CREATE TRIGGER notify_new_user_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW 
  WHEN (NEW.status = 'pending_assignment')
  EXECUTE FUNCTION notify_new_user();

-- 10. FIX EXISTING DEMO USERS
-- ============================================================================
-- Create missing profiles for existing auth users
INSERT INTO profiles (id, email, full_name, status, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  'active',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Ensure demo user has proper tenant assignment
INSERT INTO tenant_users (
  user_id, tenant_id, role, is_primary_tenant, is_active, 
  permission_scope, can_invite_users, can_manage_sub_clients
)
SELECT 
  '3c1028ec-3b29-4a12-a881-f153ebf9406f'::uuid,
  '99883779-9517-4ca9-a3f8-7fdc59051f0e'::uuid,
  'host_admin',
  true,
  true,
  'all',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_users 
  WHERE user_id = '3c1028ec-3b29-4a12-a881-f153ebf9406f'::uuid
    AND tenant_id = '99883779-9517-4ca9-a3f8-7fdc59051f0e'::uuid
);

-- 11. DISABLE RLS ON WORK_REQUESTS (as discussed)
-- ============================================================================
ALTER TABLE work_requests DISABLE ROW LEVEL SECURITY;

-- 12. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_tenant ON tenant_users(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_primary ON tenant_users(user_id, is_primary_tenant);

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- This setup provides:
-- 1. Automatic profile creation when users sign up
-- 2. User invitation system with email tokens
-- 3. Admin notification system for new users
-- 4. Functions for user-tenant assignment
-- 5. Password change requirement tracking
-- 6. Primary tenant designation
-- 7. Performance indexes
-- 8. Fixed demo user setup

