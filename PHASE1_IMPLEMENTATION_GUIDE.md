# Phase 1 Implementation Guide: Tenant Hierarchy Foundation

## Overview

This guide provides step-by-step instructions to implement Phase 1 of the multi-tier tenant system: the database foundation for tenant hierarchy.

**Estimated Time:** 1-2 weeks
**Complexity:** Medium
**Prerequisites:** Database admin access to Supabase

---

## Phase 1 Goals

1. ✅ Add tenant hierarchy columns to database
2. ✅ Create helper functions for hierarchy queries
3. ✅ Update tenant creation to support parent tenants
4. ✅ Add permission scopes to user-tenant relationships
5. ✅ Test basic hierarchy functionality

---

## Step 1: Database Schema Migration

### **1.1 Run the Enhanced Schema SQL**

Copy and run this SQL in your Supabase SQL Editor:

```sql
-- ============================================================================
-- PHASE 1: TENANT HIERARCHY FOUNDATION
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: Add Tenant Hierarchy Columns
-- ============================================================================

-- Add parent tenant relationship and hierarchy fields
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS parent_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tenant_tier INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tenant_path TEXT,
ADD COLUMN IF NOT EXISTS can_have_children BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_child_tenants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_child_count INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN tenants.parent_tenant_id IS 'References parent tenant for hierarchical relationships';
COMMENT ON COLUMN tenants.tenant_tier IS '1=Platform, 2=Primary Customer, 3=Sub-Client';
COMMENT ON COLUMN tenants.tenant_path IS 'Materialized path for efficient hierarchy queries (e.g., parent_id/child_id)';
COMMENT ON COLUMN tenants.can_have_children IS 'Whether this tenant can have sub-tenants';
COMMENT ON COLUMN tenants.max_child_tenants IS 'Maximum number of child tenants allowed (0=unlimited)';
COMMENT ON COLUMN tenants.current_child_count IS 'Current number of direct child tenants';

-- ============================================================================
-- STEP 2: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tenants_parent ON tenants(parent_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tenant_tier);
CREATE INDEX IF NOT EXISTS idx_tenants_path ON tenants(tenant_path);
CREATE INDEX IF NOT EXISTS idx_tenants_can_have_children ON tenants(can_have_children);

-- ============================================================================
-- STEP 3: Add Constraints
-- ============================================================================

-- Prevent self-referencing (tenant cannot be its own parent)
ALTER TABLE tenants 
ADD CONSTRAINT check_no_self_parent CHECK (parent_tenant_id != id);

-- Ensure tenant_tier is valid (1-5)
ALTER TABLE tenants 
ADD CONSTRAINT check_valid_tier CHECK (tenant_tier BETWEEN 1 AND 5);

-- ============================================================================
-- STEP 4: Update Existing Tenants
-- ============================================================================

-- Set existing tenants as Tier 2 (Primary Customers) if not platform
UPDATE tenants 
SET 
  tenant_tier = 2,
  can_have_children = true,
  max_child_tenants = 50,
  tenant_path = id::TEXT
WHERE parent_tenant_id IS NULL;

-- ============================================================================
-- STEP 5: Enhance tenant_users Table
-- ============================================================================

ALTER TABLE tenant_users 
ADD COLUMN IF NOT EXISTS permission_scope TEXT DEFAULT 'own',
ADD COLUMN IF NOT EXISTS can_view_child_tenants BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_child_tenants BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_exclusive_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_granted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS access_granted_at TIMESTAMPTZ DEFAULT NOW();

-- Add comments
COMMENT ON COLUMN tenant_users.permission_scope IS 'Access scope: own, children, descendants, ancestors, siblings';
COMMENT ON COLUMN tenant_users.can_view_child_tenants IS 'Can view data from child tenants (read-only)';
COMMENT ON COLUMN tenant_users.can_manage_child_tenants IS 'Can create and manage child tenants';
COMMENT ON COLUMN tenant_users.is_exclusive_access IS 'User can only access this tenant (no multi-tenant access)';

-- Create index for scope queries
CREATE INDEX IF NOT EXISTS idx_tenant_users_scope ON tenant_users(permission_scope);
CREATE INDEX IF NOT EXISTS idx_tenant_users_can_view_children ON tenant_users(can_view_child_tenants);

-- ============================================================================
-- STEP 6: Create Tenant Relationships Audit Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  child_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'parent_child',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT unique_active_relationship UNIQUE (parent_tenant_id, child_tenant_id, ended_at)
);

-- Index for relationship queries
CREATE INDEX IF NOT EXISTS idx_tenant_rel_parent ON tenant_relationships(parent_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_rel_child ON tenant_relationships(child_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_rel_active ON tenant_relationships(ended_at) WHERE ended_at IS NULL;

COMMENT ON TABLE tenant_relationships IS 'Audit trail of tenant parent-child relationships';

-- ============================================================================
-- STEP 7: Helper Functions
-- ============================================================================

-- Function: Calculate and update tenant path
CREATE OR REPLACE FUNCTION update_tenant_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT;
BEGIN
  IF NEW.parent_tenant_id IS NULL THEN
    -- Top-level tenant
    NEW.tenant_path := NEW.id::TEXT;
  ELSE
    -- Get parent's path
    SELECT tenant_path INTO parent_path 
    FROM tenants 
    WHERE id = NEW.parent_tenant_id;
    
    -- Append this tenant's ID to parent path
    NEW.tenant_path := parent_path || '/' || NEW.id::TEXT;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tenant_path
DROP TRIGGER IF EXISTS trigger_update_tenant_path ON tenants;
CREATE TRIGGER trigger_update_tenant_path
  BEFORE INSERT OR UPDATE OF parent_tenant_id ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_path();

-- Function: Update child count when parent changes
CREATE OR REPLACE FUNCTION update_child_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement old parent's count
  IF OLD.parent_tenant_id IS NOT NULL THEN
    UPDATE tenants 
    SET current_child_count = current_child_count - 1
    WHERE id = OLD.parent_tenant_id;
  END IF;
  
  -- Increment new parent's count
  IF NEW.parent_tenant_id IS NOT NULL THEN
    UPDATE tenants 
    SET current_child_count = current_child_count + 1
    WHERE id = NEW.parent_tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update child counts
DROP TRIGGER IF EXISTS trigger_update_child_count ON tenants;
CREATE TRIGGER trigger_update_child_count
  AFTER UPDATE OF parent_tenant_id ON tenants
  FOR EACH ROW
  WHEN (OLD.parent_tenant_id IS DISTINCT FROM NEW.parent_tenant_id)
  EXECUTE FUNCTION update_child_count();

-- Function: Get all child tenants recursively
CREATE OR REPLACE FUNCTION get_child_tenants(p_parent_id UUID, p_max_depth INTEGER DEFAULT 10)
RETURNS TABLE(tenant_id UUID, depth INTEGER, tenant_name TEXT, tenant_tier INTEGER) AS $$
  WITH RECURSIVE tenant_tree AS (
    -- Base case: direct children
    SELECT 
      id,
      1 as depth,
      name,
      tenant_tier
    FROM tenants
    WHERE parent_tenant_id = p_parent_id
    
    UNION ALL
    
    -- Recursive case: children of children
    SELECT 
      t.id,
      tt.depth + 1,
      t.name,
      t.tenant_tier
    FROM tenants t
    INNER JOIN tenant_tree tt ON t.parent_tenant_id = tt.id
    WHERE tt.depth < p_max_depth
  )
  SELECT id, depth, name, tenant_tier FROM tenant_tree;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION get_child_tenants IS 'Recursively get all child tenants up to max_depth levels deep';

-- Function: Get all parent tenants (ancestors)
CREATE OR REPLACE FUNCTION get_parent_tenants(p_child_id UUID)
RETURNS TABLE(tenant_id UUID, depth INTEGER, tenant_name TEXT, tenant_tier INTEGER) AS $$
  WITH RECURSIVE tenant_tree AS (
    -- Base case: direct parent
    SELECT 
      t.id,
      1 as depth,
      t.name,
      t.tenant_tier
    FROM tenants t
    WHERE t.id = (SELECT parent_tenant_id FROM tenants WHERE id = p_child_id)
    
    UNION ALL
    
    -- Recursive case: parent's parent
    SELECT 
      t.id,
      tt.depth + 1,
      t.name,
      t.tenant_tier
    FROM tenants t
    INNER JOIN tenant_tree tt ON t.id = (SELECT parent_tenant_id FROM tenants WHERE id = tt.id)
  )
  SELECT id, depth, name, tenant_tier FROM tenant_tree;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION get_parent_tenants IS 'Get all parent tenants (ancestors) up the hierarchy';

-- Function: Check if user can access tenant
CREATE OR REPLACE FUNCTION user_can_access_tenant(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_can_access BOOLEAN := false;
BEGIN
  -- Check direct access
  SELECT EXISTS (
    SELECT 1 FROM tenant_users
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id AND is_active = true
  ) INTO v_can_access;
  
  IF v_can_access THEN
    RETURN true;
  END IF;
  
  -- Check if user has access to parent with child viewing permissions
  SELECT EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.user_id = p_user_id
      AND tu.is_active = true
      AND tu.can_view_child_tenants = true
      AND p_tenant_id IN (
        SELECT tenant_id FROM get_child_tenants(tu.tenant_id)
      )
  ) INTO v_can_access;
  
  RETURN v_can_access;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION user_can_access_tenant IS 'Check if user has access to tenant (direct or via parent)';

-- ============================================================================
-- STEP 8: Create Tenant Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  tenant_tier INTEGER NOT NULL,
  default_settings JSONB DEFAULT '{}',
  default_feature_flags JSONB DEFAULT '{}',
  default_usage_quotas JSONB DEFAULT '{}',
  default_rbac_settings JSONB DEFAULT '{}',
  max_users INTEGER DEFAULT 25,
  max_projects INTEGER DEFAULT 50,
  can_have_children BOOLEAN DEFAULT false,
  max_child_tenants INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_templates_tier ON tenant_templates(tenant_tier);
CREATE INDEX IF NOT EXISTS idx_tenant_templates_active ON tenant_templates(is_active);

COMMENT ON TABLE tenant_templates IS 'Pre-configured templates for creating tenants';

-- Insert default templates
INSERT INTO tenant_templates (name, description, tenant_tier, max_users, max_projects, can_have_children, max_child_tenants) VALUES
('Primary Customer - Standard', 'Standard primary customer with basic features', 2, 50, 100, true, 25),
('Primary Customer - Enterprise', 'Enterprise primary customer with all features', 2, 200, 500, true, 100),
('Sub-Client - Basic', 'Basic sub-client with limited features', 3, 10, 25, false, 0),
('Sub-Client - Standard', 'Standard sub-client with moderate features', 3, 25, 50, false, 0),
('Sub-Client - Premium', 'Premium sub-client with extended features', 3, 50, 100, false, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tenants' 
  AND column_name IN ('parent_tenant_id', 'tenant_tier', 'tenant_path', 'can_have_children')
ORDER BY ordinal_position;

-- Check tenant_users enhancements
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenant_users' 
  AND column_name IN ('permission_scope', 'can_view_child_tenants', 'can_manage_child_tenants')
ORDER BY ordinal_position;

-- Check functions were created
SELECT 
  proname as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname IN ('get_child_tenants', 'get_parent_tenants', 'user_can_access_tenant', 'update_tenant_path')
ORDER BY proname;

-- Check templates were inserted
SELECT id, name, tenant_tier, max_users, can_have_children FROM tenant_templates ORDER BY tenant_tier, max_users;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1 Database Migration Complete!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run verification queries above';
  RAISE NOTICE '2. Test helper functions';
  RAISE NOTICE '3. Update frontend to use new fields';
END $$;
```

### **1.2 Verify Migration Success**

Run these verification queries:

```sql
-- 1. Check tenant columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name LIKE '%tenant%'
ORDER BY column_name;

-- 2. Check tenant_users columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tenant_users' AND column_name LIKE '%can_%'
ORDER BY column_name;

-- 3. Test helper function
SELECT * FROM get_child_tenants('YOUR_TENANT_ID_HERE');

-- 4. Check templates
SELECT * FROM tenant_templates;
```

**Expected Results:**
- ✅ All new columns exist in both tables
- ✅ Helper functions return results without errors
- ✅ 5 default templates are created

---

## Step 2: Update Backend Services

### **2.1 Update Tenant Creation Logic**

File: `frontend/src/app/admin/tenant-management/page.tsx`

Find the `createTenant` function and update it:

```typescript
const createTenant = async (tenantData: {
  name: string;
  code: string;
  tenant_type: string;
  contact_email: string;
  parent_tenant_id?: string;  // NEW
  tenant_tier?: number;       // NEW
  can_have_children?: boolean; // NEW
  max_child_tenants?: number;  // NEW
}) => {
  try {
    const insertData = {
      ...tenantData,
      status: "active",
      subscription_plan: "professional",
      max_users: 25,
      max_projects: 50,
      is_active: true,
      tenant_level: tenantData.tenant_tier || 2, // Default to Tier 2
      tenant_tier: tenantData.tenant_tier || 2,
      can_have_children: tenantData.can_have_children ?? true,
      max_child_tenants: tenantData.max_child_tenants || 50,
      parent_tenant_id: tenantData.parent_tenant_id || null,
      settings: {},
      feature_flags: {},
      usage_quotas: {},
      rbac_settings: {},
    };

    const { data, error } = await supabase
      .from("tenants")
      .insert(insertData)
      .select();

    if (error) throw error;

    // If parent tenant specified, create relationship record
    if (tenantData.parent_tenant_id && data?.[0]) {
      await supabase.from("tenant_relationships").insert({
        parent_tenant_id: tenantData.parent_tenant_id,
        child_tenant_id: data[0].id,
        relationship_type: 'parent_child',
        created_by: user?.id,
      });
    }

    setShowCreateTenantModal(false);
    await loadTenants();
  } catch (error) {
    console.error("Error creating tenant:", error);
  }
};
```

### **2.2 Update User Assignment Logic**

Find the `addUserToTenant` function and update it:

```typescript
const addUserToTenant = async (
  userId: string, 
  role: string,
  permissionScope: string = 'own',      // NEW
  canViewChildren: boolean = false,     // NEW
  canManageChildren: boolean = false    // NEW
) => {
  if (!selectedTenantId) return;

  try {
    const { error } = await supabase.from("tenant_users").insert({
      user_id: userId,
      tenant_id: selectedTenantId,
      role: role,
      is_active: true,
      permission_scope: permissionScope,           // NEW
      can_view_child_tenants: canViewChildren,     // NEW
      can_manage_child_tenants: canManageChildren, // NEW
      access_granted_by: user?.id,                 // NEW
      access_granted_at: new Date().toISOString(), // NEW
    });

    if (error) throw error;

    setShowAddUserModal(false);
    loadTenantUsers(selectedTenantId);
  } catch (error) {
    console.error("Error adding user to tenant:", error);
  }
};
```

---

## Step 3: Test Basic Functionality

### **3.1 Test Tenant Creation with Parent**

```sql
-- Create a primary customer tenant
INSERT INTO tenants (name, code, tenant_type, contact_email, tenant_tier, can_have_children, max_child_tenants)
VALUES ('Test Primary Customer', 'TEST-PRIMARY', 'primary_customer', 'test@primary.com', 2, true, 50)
RETURNING id;

-- Note the returned ID (e.g., 'abc-123')

-- Create a sub-client under the primary customer
INSERT INTO tenants (name, code, tenant_type, contact_email, parent_tenant_id, tenant_tier, can_have_children)
VALUES ('Test Sub-Client', 'TEST-SUB', 'sub_client', 'test@sub.com', 'abc-123', 3, false)
RETURNING id, tenant_path;

-- Verify the hierarchy
SELECT id, name, parent_tenant_id, tenant_tier, tenant_path, current_child_count
FROM tenants
WHERE id IN ('abc-123', 'xyz-456')
ORDER BY tenant_tier;
```

**Expected Results:**
- ✅ Sub-client has `parent_tenant_id = 'abc-123'`
- ✅ Sub-client has `tenant_path = 'abc-123/xyz-456'`
- ✅ Primary customer has `current_child_count = 1`

### **3.2 Test Helper Functions**

```sql
-- Get all children of primary customer
SELECT * FROM get_child_tenants('abc-123');

-- Expected: Returns the sub-client with depth=1

-- Get parents of sub-client
SELECT * FROM get_parent_tenants('xyz-456');

-- Expected: Returns the primary customer with depth=1
```

### **3.3 Test User Access**

```sql
-- Add user to primary customer with child viewing permissions
INSERT INTO tenant_users (user_id, tenant_id, role, permission_scope, can_view_child_tenants)
VALUES ('user-111', 'abc-123', 'customer_admin', 'descendants', true);

-- Check if user can access sub-client
SELECT user_can_access_tenant('user-111', 'xyz-456');

-- Expected: Returns true (user has access via parent tenant)

-- Check if user can access unrelated tenant
SELECT user_can_access_tenant('user-111', 'other-tenant-id');

-- Expected: Returns false
```

---

## Step 4: Update RLS Policies (Optional for Phase 1)

If you want to enforce hierarchical access at the database level:

```sql
-- Drop existing RLS policy (if any)
DROP POLICY IF EXISTS tenant_isolation ON tenants;

-- Create new hierarchical RLS policy
CREATE POLICY tenant_hierarchical_access ON tenants
  FOR SELECT
  USING (
    -- User has direct access to tenant
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    -- User has access to parent tenant with child viewing permissions
    id IN (
      SELECT tenant_id FROM get_child_tenants(
        (SELECT tenant_id FROM tenant_users 
         WHERE user_id = auth.uid() 
           AND can_view_child_tenants = true 
         LIMIT 1)
      )
    )
  );
```

---

## Step 5: Documentation

### **5.1 Update Type Definitions**

File: `frontend/src/types/index.ts`

```typescript
export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  status: TenantStatus;
  subscription_plan: SubscriptionPlan;
  subscription_start_date: string;
  subscription_end_date?: string;
  max_users: number;
  current_users: number;
  settings: Record<string, any>;
  billing_email?: string;
  billing_address?: string;
  
  // NEW: Hierarchy fields
  parent_tenant_id?: string;
  tenant_tier: number;
  tenant_path?: string;
  can_have_children: boolean;
  max_child_tenants: number;
  current_child_count: number;
}

export interface TenantUser {
  id: string;
  user_id: string;
  tenant_id: string;
  role: string;
  is_active: boolean;
  is_primary_tenant?: boolean;
  
  // NEW: Permission scope fields
  permission_scope: 'own' | 'children' | 'descendants' | 'ancestors' | 'siblings';
  can_view_child_tenants: boolean;
  can_manage_child_tenants: boolean;
  is_exclusive_access: boolean;
  access_granted_by?: string;
  access_granted_at?: string;
}
```

---

## Verification Checklist

Before moving to Phase 2, verify:

- [ ] All database columns added successfully
- [ ] Indexes created for performance
- [ ] Helper functions work correctly
- [ ] Triggers auto-update tenant_path and child counts
- [ ] Tenant templates exist and are usable
- [ ] Can create tenant with parent_tenant_id
- [ ] Can assign users with permission scopes
- [ ] Helper functions return correct results
- [ ] Type definitions updated in frontend
- [ ] No errors in Supabase logs

---

## Troubleshooting

### Issue: "Column already exists" error
**Solution:** The column was added in a previous run. Check if the column exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'parent_tenant_id';
```

### Issue: Trigger not firing
**Solution:** Check trigger exists and is enabled:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_tenant_path';
```

### Issue: Helper function returns no results
**Solution:** Ensure tenant has children:
```sql
SELECT id, name, parent_tenant_id FROM tenants WHERE parent_tenant_id IS NOT NULL;
```

---

## Next Steps

Once Phase 1 is complete:
1. ✅ Move to Phase 2: Build tenant hierarchy UI
2. ✅ Create tenant tree view component
3. ✅ Add parent tenant selector to create tenant form
4. ✅ Build monitoring dashboard for primary customers

---

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify all SQL ran successfully
3. Test helper functions individually
4. Review the verification checklist

**Estimated completion time:** 1-2 weeks including testing
