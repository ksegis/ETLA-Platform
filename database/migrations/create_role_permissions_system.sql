-- =====================================================
-- Role Permissions System - Database Schema
-- =====================================================
-- This migration creates tables and functions for storing
-- and managing custom role permissions that can be configured
-- through the Role Management UI.
--
-- Tables:
-- - role_definitions: Stores role metadata
-- - role_feature_permissions: Stores feature-level permissions per role
-- - role_permission_overrides: Stores user-specific permission overrides
--
-- =====================================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS public.role_permission_overrides CASCADE;
DROP TABLE IF EXISTS public.role_feature_permissions CASCADE;
DROP TABLE IF EXISTS public.role_definitions CASCADE;

-- =====================================================
-- Table: role_definitions
-- Stores metadata about roles (both system and custom)
-- =====================================================
CREATE TABLE public.role_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_key VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'host_admin', 'primary_client_admin'
    role_name VARCHAR(100) NOT NULL, -- Display name
    description TEXT,
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL for system roles
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Index for faster lookups
CREATE INDEX idx_role_definitions_role_key ON public.role_definitions(role_key);
CREATE INDEX idx_role_definitions_tenant_id ON public.role_definitions(tenant_id);

-- =====================================================
-- Table: role_feature_permissions
-- Stores which features each role can access and with what permissions
-- =====================================================
CREATE TABLE public.role_feature_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.role_definitions(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL, -- e.g., 'project-management', 'work-requests'
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_manage BOOLEAN DEFAULT false, -- Shortcut for full CRUD + special permissions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique combination of role + feature
    UNIQUE(role_id, feature_key)
);

-- Indexes for faster lookups
CREATE INDEX idx_role_feature_permissions_role_id ON public.role_feature_permissions(role_id);
CREATE INDEX idx_role_feature_permissions_feature_key ON public.role_feature_permissions(feature_key);

-- =====================================================
-- Table: role_permission_overrides
-- Stores user-specific permission overrides
-- (Optional: for future use when you need to grant specific users
-- permissions beyond their role)
-- =====================================================
CREATE TABLE public.role_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    can_create BOOLEAN DEFAULT NULL, -- NULL means use role default
    can_read BOOLEAN DEFAULT NULL,
    can_update BOOLEAN DEFAULT NULL,
    can_delete BOOLEAN DEFAULT NULL,
    can_manage BOOLEAN DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Ensure unique combination of user + tenant + feature
    UNIQUE(user_id, tenant_id, feature_key)
);

-- Indexes
CREATE INDEX idx_role_permission_overrides_user_id ON public.role_permission_overrides(user_id);
CREATE INDEX idx_role_permission_overrides_tenant_id ON public.role_permission_overrides(tenant_id);

-- =====================================================
-- Trigger: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_role_definitions_updated_at
    BEFORE UPDATE ON public.role_definitions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_role_permissions_updated_at();

CREATE TRIGGER trigger_role_feature_permissions_updated_at
    BEFORE UPDATE ON public.role_feature_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_role_permissions_updated_at();

CREATE TRIGGER trigger_role_permission_overrides_updated_at
    BEFORE UPDATE ON public.role_permission_overrides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_role_permissions_updated_at();

-- =====================================================
-- Function: get_user_permissions
-- Returns all permissions for a specific user
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_permissions(
    p_user_id UUID,
    p_tenant_id UUID
)
RETURNS TABLE (
    feature_key VARCHAR,
    can_create BOOLEAN,
    can_read BOOLEAN,
    can_update BOOLEAN,
    can_delete BOOLEAN,
    can_manage BOOLEAN,
    source VARCHAR -- 'role' or 'override'
) AS $$
BEGIN
    RETURN QUERY
    WITH user_role AS (
        -- Get user's role in the tenant
        SELECT tu.role
        FROM public.tenant_users tu
        WHERE tu.user_id = p_user_id
          AND tu.tenant_id = p_tenant_id
        LIMIT 1
    ),
    role_permissions AS (
        -- Get permissions from role
        SELECT 
            rfp.feature_key,
            rfp.can_create,
            rfp.can_read,
            rfp.can_update,
            rfp.can_delete,
            rfp.can_manage,
            'role'::VARCHAR as source
        FROM public.role_feature_permissions rfp
        JOIN public.role_definitions rd ON rd.id = rfp.role_id
        WHERE rd.role_key = (SELECT role FROM user_role)
          AND rd.is_active = true
    ),
    override_permissions AS (
        -- Get user-specific overrides
        SELECT 
            rpo.feature_key,
            COALESCE(rpo.can_create, rp.can_create) as can_create,
            COALESCE(rpo.can_read, rp.can_read) as can_read,
            COALESCE(rpo.can_update, rp.can_update) as can_update,
            COALESCE(rpo.can_delete, rp.can_delete) as can_delete,
            COALESCE(rpo.can_manage, rp.can_manage) as can_manage,
            'override'::VARCHAR as source
        FROM public.role_permission_overrides rpo
        LEFT JOIN role_permissions rp ON rp.feature_key = rpo.feature_key
        WHERE rpo.user_id = p_user_id
          AND rpo.tenant_id = p_tenant_id
    )
    -- Combine role permissions and overrides (overrides take precedence)
    SELECT * FROM override_permissions
    UNION
    SELECT * FROM role_permissions
    WHERE feature_key NOT IN (SELECT feature_key FROM override_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: seed_default_roles
-- Seeds the database with default system roles
-- =====================================================
CREATE OR REPLACE FUNCTION public.seed_default_roles()
RETURNS VOID AS $$
DECLARE
    v_host_admin_id UUID;
    v_client_admin_id UUID;
    v_primary_client_admin_id UUID;
    v_program_manager_id UUID;
    v_client_user_id UUID;
BEGIN
    -- Insert default roles
    INSERT INTO public.role_definitions (role_key, role_name, description, is_system_role, tenant_id)
    VALUES 
        ('host_admin', 'Host Admin', 'Full system administrator with all privileges', true, NULL),
        ('client_admin', 'Client Admin', 'Tenant administrator with full tenant privileges', true, NULL),
        ('primary_client_admin', 'Primary Client Admin', 'Primary customer administrator with full customer portal access', true, NULL),
        ('program_manager', 'Program Manager', 'Project and program management with team oversight', true, NULL),
        ('client_user', 'Client User', 'Standard user with basic access to work requests and reporting', true, NULL)
    ON CONFLICT (role_key) DO NOTHING;

    -- Get role IDs
    SELECT id INTO v_host_admin_id FROM public.role_definitions WHERE role_key = 'host_admin';
    SELECT id INTO v_client_admin_id FROM public.role_definitions WHERE role_key = 'client_admin';
    SELECT id INTO v_primary_client_admin_id FROM public.role_definitions WHERE role_key = 'primary_client_admin';
    SELECT id INTO v_program_manager_id FROM public.role_definitions WHERE role_key = 'program_manager';
    SELECT id INTO v_client_user_id FROM public.role_definitions WHERE role_key = 'client_user';

    -- Seed Host Admin permissions (full access to everything)
    -- We'll use can_manage = true as shortcut for all permissions
    INSERT INTO public.role_feature_permissions (role_id, feature_key, can_manage, can_create, can_read, can_update, can_delete)
    SELECT v_host_admin_id, feature_key, true, true, true, true, true
    FROM (VALUES 
        ('dashboards'), ('project-management'), ('work-requests'), ('access-control'),
        ('user-management'), ('reporting'), ('analytics'), ('benefits-management'),
        ('employee-records'), ('file-upload'), ('data-validation'), ('migration-workbench'),
        ('project-charter'), ('risk-management'), ('resource-management'), ('tenant-management'),
        ('system-settings')
    ) AS features(feature_key)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    -- Seed Primary Client Admin permissions
    INSERT INTO public.role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES 
        (v_primary_client_admin_id, 'user-management', false, false, false, false, true),
        (v_primary_client_admin_id, 'access-control', false, true, false, false, false),
        (v_primary_client_admin_id, 'project-management', false, false, false, false, true),
        (v_primary_client_admin_id, 'work-requests', false, false, false, false, true),
        (v_primary_client_admin_id, 'dashboards', false, true, false, false, false),
        (v_primary_client_admin_id, 'benefits-management', false, false, false, false, true),
        (v_primary_client_admin_id, 'employee-records', false, false, false, false, true),
        (v_primary_client_admin_id, 'file-upload', true, false, false, false, false),
        (v_primary_client_admin_id, 'data-validation', false, true, false, false, false),
        (v_primary_client_admin_id, 'migration-workbench', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    -- Seed Client Admin permissions (similar to Primary Client Admin but tenant-scoped)
    INSERT INTO public.role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    SELECT v_client_admin_id, feature_key, can_create, can_read, can_update, can_delete, can_manage
    FROM public.role_feature_permissions
    WHERE role_id = v_primary_client_admin_id
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    -- Seed Program Manager permissions
    INSERT INTO public.role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES 
        (v_program_manager_id, 'project-management', false, false, false, false, true),
        (v_program_manager_id, 'work-requests', false, false, false, false, true),
        (v_program_manager_id, 'project-charter', false, false, false, false, true),
        (v_program_manager_id, 'risk-management', false, false, false, false, true),
        (v_program_manager_id, 'resource-management', false, false, false, false, true),
        (v_program_manager_id, 'dashboards', false, true, false, false, false),
        (v_program_manager_id, 'analytics', false, true, false, false, false),
        (v_program_manager_id, 'user-management', false, true, false, false, false),
        (v_program_manager_id, 'migration-workbench', false, true, false, false, false),
        (v_program_manager_id, 'data-validation', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    -- Seed Client User permissions
    INSERT INTO public.role_feature_permissions (role_id, feature_key, can_create, can_read, can_update, can_delete, can_manage)
    VALUES 
        (v_client_user_id, 'work-requests', true, true, true, false, false),
        (v_client_user_id, 'project-management', false, true, false, false, false),
        (v_client_user_id, 'dashboards', false, true, false, false, false),
        (v_client_user_id, 'benefits-management', false, true, false, false, false),
        (v_client_user_id, 'file-upload', true, false, false, false, false),
        (v_client_user_id, 'access-control', false, true, false, false, false),
        (v_client_user_id, 'user-management', false, true, false, false, false)
    ON CONFLICT (role_id, feature_key) DO NOTHING;

    RAISE NOTICE 'Default roles seeded successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_feature_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permission_overrides ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY role_definitions_service_role ON public.role_definitions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY role_feature_permissions_service_role ON public.role_feature_permissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY role_permission_overrides_service_role ON public.role_permission_overrides
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Allow authenticated users to read role definitions
CREATE POLICY role_definitions_read ON public.role_definitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to read role permissions
CREATE POLICY role_feature_permissions_read ON public.role_feature_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow platform admins to manage roles
CREATE POLICY role_definitions_admin_manage ON public.role_definitions
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        COALESCE(is_platform_admin(), false)
    );

CREATE POLICY role_feature_permissions_admin_manage ON public.role_feature_permissions
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        COALESCE(is_platform_admin(), false)
    );

-- =====================================================
-- Seed default roles
-- =====================================================
SELECT public.seed_default_roles();

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT ON public.role_definitions TO authenticated;
GRANT SELECT ON public.role_feature_permissions TO authenticated;
GRANT SELECT ON public.role_permission_overrides TO authenticated;

GRANT ALL ON public.role_definitions TO service_role;
GRANT ALL ON public.role_feature_permissions TO service_role;
GRANT ALL ON public.role_permission_overrides TO service_role;

-- =====================================================
-- Success message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Role Permissions System created successfully!';
    RAISE NOTICE 'Tables created: role_definitions, role_feature_permissions, role_permission_overrides';
    RAISE NOTICE 'Default roles seeded: host_admin, client_admin, primary_client_admin, program_manager, client_user';
END $$;
