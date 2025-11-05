-- Migration: Create candidate_saved_filters table
-- Purpose: Store user-specific saved filter configurations for candidate management
-- Date: 2025-11-05

-- Create the candidate_saved_filters table
CREATE TABLE IF NOT EXISTS candidate_saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_filter_name_per_user_tenant UNIQUE (user_id, tenant_id, name),
    CONSTRAINT filters_not_empty CHECK (filters != '{}'::jsonb)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_saved_filters_user_id ON candidate_saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_saved_filters_tenant_id ON candidate_saved_filters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_candidate_saved_filters_user_tenant ON candidate_saved_filters(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_candidate_saved_filters_is_default ON candidate_saved_filters(user_id, tenant_id, is_default) WHERE is_default = TRUE;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_candidate_saved_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidate_saved_filters_updated_at
    BEFORE UPDATE ON candidate_saved_filters
    FOR EACH ROW
    EXECUTE FUNCTION update_candidate_saved_filters_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE candidate_saved_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view their own saved filters within their tenant
CREATE POLICY "Users can view own saved filters"
    ON candidate_saved_filters
    FOR SELECT
    USING (
        auth.uid() = user_id
        AND tenant_id IN (
            SELECT tenant_id 
            FROM tenant_users 
            WHERE user_id = auth.uid() 
            AND is_active = TRUE
        )
    );

-- Policy: Users can create their own saved filters within their tenant
CREATE POLICY "Users can create own saved filters"
    ON candidate_saved_filters
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND tenant_id IN (
            SELECT tenant_id 
            FROM tenant_users 
            WHERE user_id = auth.uid() 
            AND is_active = TRUE
        )
    );

-- Policy: Users can update their own saved filters
CREATE POLICY "Users can update own saved filters"
    ON candidate_saved_filters
    FOR UPDATE
    USING (
        auth.uid() = user_id
        AND tenant_id IN (
            SELECT tenant_id 
            FROM tenant_users 
            WHERE user_id = auth.uid() 
            AND is_active = TRUE
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        AND tenant_id IN (
            SELECT tenant_id 
            FROM tenant_users 
            WHERE user_id = auth.uid() 
            AND is_active = TRUE
        )
    );

-- Policy: Users can delete their own saved filters
CREATE POLICY "Users can delete own saved filters"
    ON candidate_saved_filters
    FOR DELETE
    USING (
        auth.uid() = user_id
        AND tenant_id IN (
            SELECT tenant_id 
            FROM tenant_users 
            WHERE user_id = auth.uid() 
            AND is_active = TRUE
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON candidate_saved_filters TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE candidate_saved_filters IS 'Stores user-specific saved filter configurations for candidate management';
COMMENT ON COLUMN candidate_saved_filters.id IS 'Unique identifier for the saved filter';
COMMENT ON COLUMN candidate_saved_filters.user_id IS 'Reference to the user who created the filter';
COMMENT ON COLUMN candidate_saved_filters.tenant_id IS 'Reference to the tenant (for multi-tenancy)';
COMMENT ON COLUMN candidate_saved_filters.name IS 'User-defined name for the saved filter';
COMMENT ON COLUMN candidate_saved_filters.description IS 'Optional description of what the filter does';
COMMENT ON COLUMN candidate_saved_filters.filters IS 'JSON object containing the filter configuration';
COMMENT ON COLUMN candidate_saved_filters.is_default IS 'Whether this filter should be applied by default when the user opens the candidates page';
COMMENT ON COLUMN candidate_saved_filters.created_at IS 'Timestamp when the filter was created';
COMMENT ON COLUMN candidate_saved_filters.updated_at IS 'Timestamp when the filter was last updated';
