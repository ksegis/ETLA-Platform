-- Drop and recreate the hierarchy functions with proper aggregation

DROP FUNCTION IF EXISTS public.get_tenant_hierarchy(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_tenant_children(UUID) CASCADE;

-- Helper function to recursively get children (fixed)
CREATE OR REPLACE FUNCTION public.get_tenant_children(p_parent_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_children JSONB;
BEGIN
  -- Use a subquery to properly aggregate
  SELECT COALESCE(jsonb_agg(child_data), '[]'::jsonb)
  INTO v_children
  FROM (
    SELECT jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'code', t.code,
      'tenant_tier', t.tenant_tier,
      'parent_tenant_id', t.parent_tenant_id,
      'can_have_children', t.can_have_children,
      'max_child_tenants', t.max_child_tenants,
      'current_child_count', t.current_child_count,
      'is_active', t.is_active,
      'created_at', t.created_at,
      'children', get_tenant_children(t.id)
    ) as child_data
    FROM tenants t
    WHERE t.parent_tenant_id = p_parent_id
    ORDER BY t.name
  ) children;

  RETURN v_children;
END;
$$;

-- Main function to get full tenant hierarchy (fixed)
CREATE OR REPLACE FUNCTION public.get_tenant_hierarchy(p_tenant_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- If no tenant_id provided, get all root tenants (tier 1, 2 or no parent)
  IF p_tenant_id IS NULL THEN
    SELECT COALESCE(jsonb_agg(tenant_data), '[]'::jsonb)
    INTO v_result
    FROM (
      SELECT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'code', t.code,
        'tenant_tier', t.tenant_tier,
        'parent_tenant_id', t.parent_tenant_id,
        'can_have_children', t.can_have_children,
        'max_child_tenants', t.max_child_tenants,
        'current_child_count', t.current_child_count,
        'is_active', t.is_active,
        'created_at', t.created_at,
        'children', get_tenant_children(t.id)
      ) as tenant_data
      FROM tenants t
      WHERE t.parent_tenant_id IS NULL OR t.tenant_tier IN (1, 2)
      ORDER BY t.name
    ) root_tenants;
    
    RETURN v_result;
  END IF;

  -- Get specific tenant with its children
  SELECT jsonb_build_object(
    'id', t.id,
    'name', t.name,
    'code', t.code,
    'tenant_tier', t.tenant_tier,
    'parent_tenant_id', t.parent_tenant_id,
    'can_have_children', t.can_have_children,
    'max_child_tenants', t.max_child_tenants,
    'current_child_count', t.current_child_count,
    'is_active', t.is_active,
    'created_at', t.created_at,
    'children', get_tenant_children(t.id)
  ) INTO v_result
  FROM tenants t
  WHERE t.id = p_tenant_id;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_tenant_hierarchy(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tenant_children(UUID) TO authenticated;

-- Test the function
SELECT get_tenant_hierarchy(NULL);
