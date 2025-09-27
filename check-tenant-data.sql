-- SQL query to check if there's data in the tenant that kevin.shelton@egisdynamics.com has access to

-- First, find the user and their associated tenant
WITH user_tenant AS (
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
    AND tu.is_active = true
)

-- Now check for data in various tables for this tenant
SELECT
  'User and Tenant Information' AS data_check,
  ut.user_id,
  ut.email,
  ut.tenant_id,
  ut.tenant_name,
  ut.role
FROM
  user_tenant ut

UNION ALL

-- Check for employees in the tenant
SELECT
  'Employees' AS data_check,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE status = 'active' OR status = 'Active') AS active_count,
  NULL AS col3,
  NULL AS col4,
  NULL AS col5
FROM
  employees
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant)

UNION ALL

-- Check for employee demographics in the tenant
SELECT
  'Employee Demographics' AS data_check,
  COUNT(*) AS total_count,
  NULL AS col2,
  NULL AS col3,
  NULL AS col4,
  NULL AS col5
FROM
  employee_demographics
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant)

UNION ALL

-- Check for pay statements in the tenant
SELECT
  'Pay Statements' AS data_check,
  COUNT(*) AS total_count,
  NULL AS col2,
  NULL AS col3,
  NULL AS col4,
  NULL AS col5
FROM
  pay_statements
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant)

UNION ALL

-- Check for tax records in the tenant
SELECT
  'Tax Records' AS data_check,
  COUNT(*) AS total_count,
  NULL AS col2,
  NULL AS col3,
  NULL AS col4,
  NULL AS col5
FROM
  tax_records
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant)

UNION ALL

-- Check for timecards in the tenant
SELECT
  'Timecards' AS data_check,
  COUNT(*) AS total_count,
  NULL AS col2,
  NULL AS col3,
  NULL AS col4,
  NULL AS col5
FROM
  timecards
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant)

UNION ALL

-- Check for benefits in the tenant
SELECT
  'Benefits' AS data_check,
  COUNT(*) AS total_count,
  NULL AS col2,
  NULL AS col3,
  NULL AS col4,
  NULL AS col5
FROM
  benefits
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant)

UNION ALL

-- Check for documents in the tenant
SELECT
  'Documents' AS data_check,
  COUNT(*) AS total_count,
  NULL AS col2,
  NULL AS col3,
  NULL AS col4,
  NULL AS col5
FROM
  documents
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant);

-- Alternative query if documents table doesn't exist
-- SELECT
--   'Documents' AS data_check,
--   COUNT(*) AS total_count,
--   NULL AS col2,
--   NULL AS col3,
--   NULL AS col4,
--   NULL AS col5
-- FROM
--   employee_documents
-- WHERE
--   tenant_id IN (SELECT tenant_id FROM user_tenant);

-- Check for specific employee data that would appear in the cockpit
SELECT
  e.id AS employee_id,
  e.full_name,
  e.employee_code,
  e.department,
  e.job_title,
  e.status,
  COUNT(ps.id) AS pay_statement_count,
  COUNT(tr.id) AS tax_record_count,
  COUNT(tc.id) AS timecard_count
FROM
  employees e
  LEFT JOIN pay_statements ps ON e.id = ps.employee_id AND ps.tenant_id = e.tenant_id
  LEFT JOIN tax_records tr ON e.id = tr.employee_id AND tr.tenant_id = e.tenant_id
  LEFT JOIN timecards tc ON e.id = tc.employee_id AND tc.tenant_id = e.tenant_id
WHERE
  e.tenant_id IN (SELECT tenant_id FROM user_tenant)
  AND (e.status = 'active' OR e.status = 'Active')
GROUP BY
  e.id, e.full_name, e.employee_code, e.department, e.job_title, e.status
LIMIT 10;

-- Check for document categories and types
SELECT
  document_category,
  document_type,
  COUNT(*) AS document_count
FROM
  documents
WHERE
  tenant_id IN (SELECT tenant_id FROM user_tenant)
GROUP BY
  document_category, document_type
ORDER BY
  document_count DESC;

-- Alternative query if documents table doesn't exist
-- SELECT
--   document_category,
--   document_type,
--   COUNT(*) AS document_count
-- FROM
--   employee_documents
-- WHERE
--   tenant_id IN (SELECT tenant_id FROM user_tenant)
-- GROUP BY
--   document_category, document_type
-- ORDER BY
--   document_count DESC;
