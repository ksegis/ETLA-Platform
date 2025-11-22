-- Migration: Add new feature keys for reorganized navigation
-- Date: 2025-11-22
-- Purpose: Support new navigation structure with ETL & Data Platform and Administration sub-groups

-- ============================================================================
-- 1. Add New Feature Keys to role_feature_permissions
-- ============================================================================

-- Get the host_admin role_id (we'll use this as the base)
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
    -- ETL Progress Monitor
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'etl-progress-monitor', false, true, false, false, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_read = true, can_manage = true;

    -- Talent Data Import
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'talent-data-import', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- ETL Scheduling
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'etl-scheduling', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- Data Transformations
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'data-transformations', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- Role Management
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'role-management', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- Tenant Features
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'tenant-features', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- Data Validation (if not exists)
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'data-validation', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    -- File Upload (if not exists)
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_host_admin_id, 'file-upload', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    RAISE NOTICE 'Added HOST_ADMIN permissions for new features';
  END IF;

  -- ============================================================================
  -- CLIENT_ADMIN: Selective access
  -- ============================================================================
  
  IF v_client_admin_id IS NOT NULL THEN
    -- ETL Progress Monitor: VIEW only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'etl-progress-monitor', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_read = true;

    -- Talent Data Import: FULL ACCESS
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'talent-data-import', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- ETL Scheduling: FULL ACCESS
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'etl-scheduling', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- Data Transformations: FULL ACCESS
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'data-transformations', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- Role Management: MANAGE (own tenant)
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'role-management', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true, can_update = true, can_delete = true, can_manage = true;

    -- Tenant Features: VIEW only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'tenant-features', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_read = true;

    -- Data Validation: FULL ACCESS
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'data-validation', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    -- File Upload: FULL ACCESS
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_admin_id, 'file-upload', true, true, true, true, true)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    RAISE NOTICE 'Added CLIENT_ADMIN permissions for new features';
  END IF;

  -- ============================================================================
  -- PROGRAM_MANAGER: Limited access
  -- ============================================================================
  
  IF v_program_manager_id IS NOT NULL THEN
    -- ETL Progress Monitor: VIEW only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_program_manager_id, 'etl-progress-monitor', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_read = true;

    -- Talent Data Import: VIEW + CREATE
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_program_manager_id, 'talent-data-import', true, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_create = true, can_read = true;

    -- Data Validation: VIEW only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_program_manager_id, 'data-validation', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    RAISE NOTICE 'Added PROGRAM_MANAGER permissions for new features';
  END IF;

  -- ============================================================================
  -- CLIENT_USER: View-only for monitoring
  -- ============================================================================
  
  IF v_client_user_id IS NOT NULL THEN
    -- ETL Progress Monitor: VIEW only
    INSERT INTO role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES (v_client_user_id, 'etl-progress-monitor', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO UPDATE
    SET can_read = true;

    RAISE NOTICE 'Added CLIENT_USER permissions for new features';
  END IF;

  RAISE NOTICE 'RBAC migration completed successfully!';
  RAISE NOTICE 'Added 6 new feature keys: etl-progress-monitor, talent-data-import, etl-scheduling, data-transformations, role-management, tenant-features';
END $$;

-- ============================================================================
-- 2. Verify the migration
-- ============================================================================

-- Show summary of new features
SELECT 
  rd.role_name,
  rfp.feature_key,
  rfp.can_read,
  rfp.can_create,
  rfp.can_update,
  rfp.can_delete,
  rfp.can_manage
FROM role_feature_permissions rfp
JOIN role_definitions rd ON rd.id = rfp.role_id
WHERE rfp.feature_key IN (
  'etl-progress-monitor',
  'talent-data-import',
  'etl-scheduling',
  'data-transformations',
  'role-management',
  'tenant-features',
  'data-validation',
  'file-upload'
)
ORDER BY rd.role_name, rfp.feature_key;
