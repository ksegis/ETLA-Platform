-- Check current constraint on tenant_type to see what values are allowed
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tenants'::regclass
  AND conname LIKE '%tenant_type%';
