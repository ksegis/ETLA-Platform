-- Step 1: Check what tenant_type values currently exist
SELECT DISTINCT tenant_type, COUNT(*) as count
FROM tenants
GROUP BY tenant_type
ORDER BY tenant_type;

-- Step 2: Drop the old constraint first
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_tenant_type_check;

-- Step 3: Migrate old values to new values
UPDATE tenants SET tenant_type = 'enterprise' WHERE tenant_type = 'host';
UPDATE tenants SET tenant_type = 'professional' WHERE tenant_type = 'direct_client';
UPDATE tenants SET tenant_type = 'standard' WHERE tenant_type = 'sub_customer';

-- Step 4: Set NULL for any other invalid values
UPDATE tenants SET tenant_type = NULL WHERE tenant_type NOT IN (
    'enterprise', 'professional', 'standard', 'basic', 'trial',
    'retail', 'healthcare', 'education', 'government', 'nonprofit',
    'technology', 'manufacturing', 'financial', 'other'
);

-- Step 5: Make tenant_type nullable
ALTER TABLE tenants ALTER COLUMN tenant_type DROP NOT NULL;

-- Step 6: Add new constraint with modern values
ALTER TABLE tenants ADD CONSTRAINT tenants_tenant_type_check 
  CHECK (tenant_type IS NULL OR tenant_type IN (
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

COMMENT ON COLUMN tenants.tenant_type IS 'Business type or industry category (optional)';
