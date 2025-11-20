-- Create a view that joins tenant_users with auth.users to get emails
-- This allows querying user information without directly accessing auth.users from the client

CREATE OR REPLACE VIEW public.tenant_users_with_email AS
SELECT 
  tu.id,
  tu.tenant_id,
  tu.user_id,
  tu.role,
  tu.created_at,
  tu.updated_at,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name
FROM tenant_users tu
LEFT JOIN auth.users au ON tu.user_id = au.id;

-- Grant access to authenticated users
GRANT SELECT ON public.tenant_users_with_email TO authenticated;

COMMENT ON VIEW public.tenant_users_with_email IS 'View that combines tenant_users with user email from auth.users';
