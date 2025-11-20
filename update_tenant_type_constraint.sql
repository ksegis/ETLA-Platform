-- Drop the old constraint
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_tenant_type_check;

-- Add new constraint with modern business type values
ALTER TABLE tenants ADD CONSTRAINT tenants_tenant_type_check 
  CHECK (tenant_type IN (
    'enterprise',
    'professional', 
    'standard',
    'basic',
    'trial',
    'retail',
    'healthcare',
    'education',
    'government',
    'nonprofit',
    'technology',
    'manufacturing',
    'financial',
    'other'
  ));

-- Make tenant_type nullable since it's optional
ALTER TABLE tenants ALTER COLUMN tenant_type DROP NOT NULL;

COMMENT ON COLUMN tenants.tenant_type IS 'Business type or industry category';
