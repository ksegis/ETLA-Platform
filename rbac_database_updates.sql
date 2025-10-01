-- RBAC Database Updates for ETLA-Platform
-- Execute these SQL statements to ensure proper RBAC functionality

-- =====================================================
-- 1. TENANTS TABLE
-- =====================================================
-- Ensure tenants table exists with proper structure
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    tenant_type VARCHAR(50) NOT NULL CHECK (tenant_type IN ('host', 'primary', 'sub')),
    contact_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Host admins can see all tenants, others see only their own
CREATE POLICY "tenants_select_policy" ON public.tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND (tu.role = 'host_admin' OR tu.tenant_id = tenants.id)
        )
    );

-- RLS Policy: Only host admins can insert new tenants
CREATE POLICY "tenants_insert_policy" ON public.tenants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.role = 'host_admin'
        )
    );

-- RLS Policy: Host admins and tenant admins can update their tenants
CREATE POLICY "tenants_update_policy" ON public.tenants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND (tu.role = 'host_admin' OR (tu.tenant_id = tenants.id AND tu.role = 'tenant_admin'))
        )
    );

-- =====================================================
-- 2. TENANT_USERS TABLE (Junction table for user-tenant-role mapping)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('host_admin', 'tenant_admin', 'program_manager', 'client_user')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(tenant_id, user_id)
);

-- Enable RLS on tenant_users table
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own memberships, host admins see all
CREATE POLICY "tenant_users_select_policy" ON public.tenant_users
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.role = 'host_admin'
        )
    );

-- RLS Policy: Host admins and tenant admins can insert new user assignments
CREATE POLICY "tenant_users_insert_policy" ON public.tenant_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND (tu.role = 'host_admin' OR (tu.tenant_id = tenant_users.tenant_id AND tu.role = 'tenant_admin'))
        )
    );

-- RLS Policy: Host admins and tenant admins can update user assignments
CREATE POLICY "tenant_users_update_policy" ON public.tenant_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND (tu.role = 'host_admin' OR (tu.tenant_id = tenant_users.tenant_id AND tu.role = 'tenant_admin'))
        )
    );

-- =====================================================
-- 3. USER PROFILES TABLE
-- =====================================================
-- Extend user profiles with additional RBAC fields
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own profile, host admins see all
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
    FOR SELECT USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.role = 'host_admin'
        )
    );

-- =====================================================
-- 4. ACTIVITY LOG TABLE (For audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity_log table
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see logs for their tenants, host admins see all
CREATE POLICY "activity_log_select_policy" ON public.activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND (tu.role = 'host_admin' OR tu.tenant_id = activity_log.tenant_id)
        )
    );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is member of tenant
CREATE OR REPLACE FUNCTION public.is_member_of(tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users tu
        WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = $1
        AND tu.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in tenant
CREATE OR REPLACE FUNCTION public.get_user_role(tenant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = $1
    AND tu.status = 'active';
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role VARCHAR, tenant_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    IF tenant_id IS NULL THEN
        -- Check if user has role in any tenant
        RETURN EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.role = required_role
            AND tu.status = 'active'
        );
    ELSE
        -- Check if user has role in specific tenant
        RETURN EXISTS (
            SELECT 1 FROM public.tenant_users tu
            WHERE tu.user_id = auth.uid()
            AND tu.tenant_id = $2
            AND tu.role = required_role
            AND tu.status = 'active'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_log (
        tenant_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS tenants_audit_trigger ON public.tenants;
CREATE TRIGGER tenants_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS tenant_users_audit_trigger ON public.tenant_users;
CREATE TRIGGER tenant_users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tenant_users
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for tenant_users table
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON public.tenant_users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON public.tenant_users(status);

-- Indexes for tenants table
CREATE INDEX IF NOT EXISTS idx_tenants_code ON public.tenants(code);
CREATE INDEX IF NOT EXISTS idx_tenants_type ON public.tenants(tenant_type);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);

-- Indexes for activity_log table
CREATE INDEX IF NOT EXISTS idx_activity_log_tenant_id ON public.activity_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON public.activity_log(resource_type, resource_id);

-- =====================================================
-- 8. INITIAL DATA (Optional)
-- =====================================================

-- Insert host tenant if it doesn't exist
INSERT INTO public.tenants (name, code, tenant_type, contact_email, status)
VALUES ('Host Organization', 'HOST', 'host', 'admin@company.com', 'active')
ON CONFLICT (code) DO NOTHING;

-- Grant host admin role to the initial user (replace with actual user ID)
-- INSERT INTO public.tenant_users (tenant_id, user_id, role, status)
-- SELECT t.id, 'USER_ID_HERE', 'host_admin', 'active'
-- FROM public.tenants t
-- WHERE t.code = 'HOST'
-- ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- =====================================================
-- 9. GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.activity_log TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Replace 'USER_ID_HERE' with the actual UUID of the initial host admin user
-- 2. Adjust tenant types and roles as needed for your specific requirements
-- 3. Consider adding additional indexes based on your query patterns
-- 4. Review and test all RLS policies in your environment
-- 5. Ensure proper backup procedures are in place before executing
