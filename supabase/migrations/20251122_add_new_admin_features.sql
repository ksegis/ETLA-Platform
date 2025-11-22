-- ============================================================================
-- Add New Administration Features to RBAC
-- Date: 2025-11-22
-- Purpose: Add RBAC permissions for tenant-storage, system-health, and employee-directory
-- ============================================================================

DO $$
DECLARE
  v_host_admin_id uuid;
  v_client_admin_id uuid;
  v_program_manager_id uuid;
  v_client_user_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO v_host_admin_id FROM role_definitions WHERE role_key = 'host_admin' LIMIT 1;
  SELECT id INTO v_client_admin_id FROM role_definitions WHERE role_key = 'client_admin' LIMIT 1;
  SELECT id INTO v_program_manager_id FROM role_definitions WHERE role_key = 'program_manager' LIMIT 1;
  SELECT id INTO v_client_user_id FROM role_definitions WHERE role_key = 'client_user' LIMIT 1;

  -- ============================================================================
  -- HOST_ADMIN: Full access to all new features
  -- ============================================================================
  
  IF v_host_admin_id IS NOT NULL THEN
    -- Tenant Storage Monitoring
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'tenant-storage', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- System Health Monitoring
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'system-health', false, true, false, false, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_read = true, can_manage = true;

    -- Employee Directory
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'employee-directory', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;
  END IF;

  -- ============================================================================
  -- CLIENT_ADMIN: Limited access
  -- ============================================================================
  
  IF v_client_admin_id IS NOT NULL THEN
    -- Tenant Storage: Full CRUD for their own tenant
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'tenant-storage', true, true, true, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = false, can_manage = false;

    -- System Health: Read-only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'system-health', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = false, can_read = true, can_update = false, can_delete = false, can_manage = false;

    -- Employee Directory: Read-only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'employee-directory', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = false, can_read = true, can_update = false, can_delete = false, can_manage = false;
  END IF;

  -- ============================================================================
  -- PROGRAM_MANAGER: Read-only access to employee directory
  -- ============================================================================
  
  IF v_program_manager_id IS NOT NULL THEN
    -- Employee Directory: Read-only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_program_manager_id, 'employee-directory', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = false, can_read = true, can_update = false, can_delete = false, can_manage = false;
  END IF;

  -- ============================================================================
  -- CLIENT_USER: No access to these admin features
  -- ============================================================================
  -- (No permissions needed - default deny)

END $$;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the permissions were set correctly:

SELECT 
  rd.role_name,
  rfp.feature_key,
  rfp.can_read,
  rfp.can_create,
  rfp.can_update,
  rfp.can_delete,
  rfp.can_manage
FROM role_feature_permissions rfp
JOIN role_definitions rd ON rfp.role_id = rd.id
WHERE rfp.feature_key IN ('tenant-storage', 'system-health', 'employee-directory')
ORDER BY rd.role_name, rfp.feature_key;
