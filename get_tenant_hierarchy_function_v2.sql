-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_tenant_hierarchy(UUID);
DROP FUNCTION IF EXISTS public.get_tenant_children(UUID);

-- Create recursive function to get full tenant hierarchy
-- This builds a tree structure starting from a root tenant

CREATE OR REPLACE FUNCTION public.get_tenant_hierarchy(p_tenant_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_root_tenant RECORD;
BEGIN
  -- If no tenant_id provided, get all root tenants (tier 1 or no parent)
  IF p_tenant_id IS NULL THEN
    SELECT jsonb_agg(
      jsonb_build_object(
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
      )
    ) INTO v_result
    FROM tenants t
    WHERE t.parent_tenant_id IS NULL OR t.tenant_tier = 1
    ORDER BY t.name;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
  END IF;

  -- Get specific tenant with its children
  SELECT 
    jsonb_build_object(
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

-- Helper function to recursively get children
CREATE OR REPLACE FUNCTION public.get_tenant_children(p_parent_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_children JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
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
    )
  ) INTO v_children
  FROM tenants t
  WHERE t.parent_tenant_id = p_parent_id
  ORDER BY t.name;

  RETURN COALESCE(v_children, '[]'::jsonb);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_tenant_hierarchy(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tenant_children(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_tenant_hierarchy IS 'Recursively retrieves tenant hierarchy starting from a root tenant';
COMMENT ON FUNCTION public.get_tenant_children IS 'Helper function to recursively get all children of a tenant';
