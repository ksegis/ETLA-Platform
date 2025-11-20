-- Check current constraint on tenant_type
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tenants'::regclass
  AND conname LIKE '%tenant_type%';

-- Drop the restrictive check constraint
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_tenant_type_check;

-- Make tenant_type nullable and remove constraint (allow any value)
ALTER TABLE tenants ALTER COLUMN tenant_type DROP NOT NULL;

-- Or if you want to keep a constraint with more values, use this instead:
-- ALTER TABLE tenants ADD CONSTRAINT tenants_tenant_type_check 
--   CHECK (tenant_type IN ('enterprise', 'professional', 'standard', 'basic', 'trial', 'retail', 'healthcare', 'education', 'government', 'nonprofit'));

COMMENT ON COLUMN tenants.tenant_type IS 'Optional business type or category - can be any string value';
