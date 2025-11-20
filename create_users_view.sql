-- Create a public view to access auth.users data
-- This allows the frontend to query user information without direct access to auth schema

CREATE OR REPLACE VIEW public.users_view AS
SELECT 
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at
FROM auth.users;

-- Grant access to authenticated users
GRANT SELECT ON public.users_view TO authenticated;
GRANT SELECT ON public.users_view TO service_role;

COMMENT ON VIEW public.users_view IS 'Public view of auth.users table for frontend access';
