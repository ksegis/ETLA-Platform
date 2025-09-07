-- RBAC Admin Database Procedures
-- These procedures handle RBAC operations with proper transaction management and audit logging

-- Create user_tenant_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_tenant_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL,
    effect TEXT NOT NULL CHECK (effect IN ('allow', 'deny')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, tenant_id, permission_id)
);

-- Create activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID REFERENCES tenants(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE user_tenant_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_tenant_permissions
CREATE POLICY "user_tenant_permissions_admin_access" ON user_tenant_permissions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.tenant_id = user_tenant_permissions.tenant_id
            AND tu.role IN ('host_admin', 'client_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.tenant_id = user_tenant_permissions.tenant_id
            AND tu.role IN ('host_admin', 'client_admin')
        )
    );

-- RLS policies for activity_log
CREATE POLICY "activity_log_admin_access" ON activity_log
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IS NULL OR
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.tenant_id = activity_log.tenant_id
            AND tu.role IN ('host_admin', 'client_admin')
        )
    );

-- Function to apply RBAC changes in a single transaction
CREATE OR REPLACE FUNCTION apply_rbac_changes(
    p_tenant_id UUID,
    p_actor_user_id UUID,
    p_role_assignments JSONB DEFAULT '[]',
    p_user_overrides JSONB DEFAULT '[]',
    p_audit_note TEXT DEFAULT 'RBAC changes applied'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role_assignment JSONB;
    v_user_override JSONB;
    v_changes_count INTEGER := 0;
    v_result JSONB;
BEGIN
    -- Verify actor has admin permissions
    IF NOT EXISTS (
        SELECT 1 FROM tenant_users
        WHERE user_id = p_actor_user_id
        AND tenant_id = p_tenant_id
        AND role IN ('host_admin', 'client_admin')
        AND is_active = true
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient permissions to modify RBAC settings'
        );
    END IF;

    -- Process role assignments
    FOR v_role_assignment IN SELECT * FROM jsonb_array_elements(p_role_assignments)
    LOOP
        -- Update user role in tenant_users
        UPDATE tenant_users
        SET 
            role = v_role_assignment->>'roleId',
            updated_at = NOW()
        WHERE user_id = (v_role_assignment->>'userId')::UUID
        AND tenant_id = p_tenant_id;

        -- Log the change
        INSERT INTO activity_log (
            user_id, tenant_id, action, resource_type, resource_id,
            new_values, metadata
        ) VALUES (
            p_actor_user_id,
            p_tenant_id,
            'rbac_role_assigned',
            'user',
            v_role_assignment->>'userId',
            jsonb_build_object('role', v_role_assignment->>'roleId'),
            jsonb_build_object('note', p_audit_note)
        );

        v_changes_count := v_changes_count + 1;
    END LOOP;

    -- Process user permission overrides
    FOR v_user_override IN SELECT * FROM jsonb_array_elements(p_user_overrides)
    LOOP
        IF v_user_override->>'effect' IS NULL THEN
            -- Clear override
            DELETE FROM user_tenant_permissions
            WHERE user_id = (v_user_override->>'userId')::UUID
            AND tenant_id = p_tenant_id
            AND permission_id = v_user_override->>'permissionId';

            -- Log the change
            INSERT INTO activity_log (
                user_id, tenant_id, action, resource_type, resource_id,
                old_values, metadata
            ) VALUES (
                p_actor_user_id,
                p_tenant_id,
                'rbac_override_cleared',
                'permission',
                v_user_override->>'permissionId',
                jsonb_build_object(
                    'userId', v_user_override->>'userId',
                    'permissionId', v_user_override->>'permissionId'
                ),
                jsonb_build_object('note', p_audit_note)
            );
        ELSE
            -- Set override
            INSERT INTO user_tenant_permissions (
                user_id, tenant_id, permission_id, effect, created_by
            ) VALUES (
                (v_user_override->>'userId')::UUID,
                p_tenant_id,
                v_user_override->>'permissionId',
                v_user_override->>'effect',
                p_actor_user_id
            )
            ON CONFLICT (user_id, tenant_id, permission_id)
            DO UPDATE SET
                effect = EXCLUDED.effect,
                updated_at = NOW(),
                created_by = EXCLUDED.created_by;

            -- Log the change
            INSERT INTO activity_log (
                user_id, tenant_id, action, resource_type, resource_id,
                new_values, metadata
            ) VALUES (
                p_actor_user_id,
                p_tenant_id,
                'rbac_override_set',
                'permission',
                v_user_override->>'permissionId',
                jsonb_build_object(
                    'userId', v_user_override->>'userId',
                    'permissionId', v_user_override->>'permissionId',
                    'effect', v_user_override->>'effect'
                ),
                jsonb_build_object('note', p_audit_note)
            );
        END IF;

        v_changes_count := v_changes_count + 1;
    END LOOP;

    -- Return success result
    RETURN jsonb_build_object(
        'success', true,
        'changes_applied', v_changes_count,
        'timestamp', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$;

-- Function to get effective permissions for a user
CREATE OR REPLACE FUNCTION get_user_effective_permissions(
    p_user_id UUID,
    p_tenant_id UUID
)
RETURNS TABLE (
    permission_id TEXT,
    resource TEXT,
    action TEXT,
    state TEXT,
    origin TEXT,
    role_names TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_permission_record RECORD;
BEGIN
    -- Get user's role in the tenant
    SELECT role INTO v_user_role
    FROM tenant_users
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;

    -- If user not found in tenant, return empty
    IF v_user_role IS NULL THEN
        RETURN;
    END IF;

    -- This is a simplified version - in practice, you'd have a permissions table
    -- For now, we'll return based on role hierarchy
    
    -- Host admin gets all permissions
    IF v_user_role = 'host_admin' THEN
        RETURN QUERY
        SELECT 
            perm.permission_id,
            perm.resource,
            perm.action,
            COALESCE(utp.effect, 'allow') as state,
            CASE WHEN utp.effect IS NOT NULL THEN 'override' ELSE 'role' END as origin,
            ARRAY[v_user_role] as role_names
        FROM (
            -- Generate all possible permissions (this would come from a real permissions table)
            SELECT 
                f.feature || ':' || p.permission as permission_id,
                f.feature as resource,
                p.permission as action
            FROM (
                VALUES 
                ('project-management'), ('work-requests'), ('reporting'), 
                ('access-control'), ('user-management')
            ) f(feature)
            CROSS JOIN (
                VALUES ('view'), ('create'), ('update'), ('delete'), ('manage')
            ) p(permission)
        ) perm
        LEFT JOIN user_tenant_permissions utp ON (
            utp.user_id = p_user_id 
            AND utp.tenant_id = p_tenant_id 
            AND utp.permission_id = perm.permission_id
        );
    END IF;

    -- Add more role-based logic here...
    
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tenant_permissions_user_tenant 
    ON user_tenant_permissions(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_permissions_permission 
    ON user_tenant_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_tenant_timestamp 
    ON activity_log(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_timestamp 
    ON activity_log(user_id, timestamp DESC);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION apply_rbac_changes TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_effective_permissions TO authenticated;

