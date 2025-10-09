-- Simplified SQL query to check for data in the tenant accessible by kevin.shelton@egisdynamics.com

-- Find the user's tenant ID
SELECT 
  p.id AS user_id,
  p.email,
  tu.tenant_id,
  t.name AS tenant_name,
  tu.role
FROM 
  profiles p
  JOIN tenant_users tu ON p.id = tu.user_id
  JOIN tenants t ON tu.tenant_id = t.id
WHERE 
  p.email = 'kevin.shelton@egisdynamics.com'
  AND tu.is_active = true;

-- Check for data counts in key tables for this tenant
-- Replace 'tenant_id_here' with the actual tenant ID from the query above
SELECT 'employees' AS table_name, COUNT(*) AS record_count FROM employees WHERE tenant_id = 'tenant_id_here'
UNION ALL
SELECT 'employee_demographics' AS table_name, COUNT(*) AS record_count FROM employee_demographics WHERE tenant_id = 'tenant_id_here'
UNION ALL
SELECT 'pay_statements' AS table_name, COUNT(*) AS record_count FROM pay_statements WHERE tenant_id = 'tenant_id_here'
UNION ALL
SELECT 'tax_records' AS table_name, COUNT(*) AS record_count FROM tax_records WHERE tenant_id = 'tenant_id_here'
UNION ALL
SELECT 'timecards' AS table_name, COUNT(*) AS record_count FROM timecards WHERE tenant_id = 'tenant_id_here'
UNION ALL
SELECT 'benefits' AS table_name, COUNT(*) AS record_count FROM benefits WHERE tenant_id = 'tenant_id_here'
UNION ALL
SELECT 'documents' AS table_name, COUNT(*) AS record_count FROM documents WHERE tenant_id = 'tenant_id_here';

-- Sample data from employees table (first 5 records)
SELECT 
  id, 
  employee_id, 
  full_name, 
  department, 
  job_title, 
  status
FROM 
  employees 
WHERE 
  tenant_id = 'tenant_id_here'
LIMIT 5;
