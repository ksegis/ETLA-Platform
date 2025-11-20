# Final Migration Plan - Tenant Hierarchy Enhancement

## Executive Summary

Based on schema discovery, your system already has **90% of what we need**! 

**Current State:**
- ✅ Tenant hierarchy structure exists (`parent_tenant_id`, `tenant_path`)
- ✅ Hierarchy functions exist (`get_tenant_hierarchy()`, `create_tenant()`)
- ✅ Two user-tenant tables: `tenant_users` (13 rows, primary) and `user_tenant_permissions` (1 row, test)
- ✅ Permission scopes partially implemented

**What We Need to Add:**
- 4 columns to `tenants` (quotas and flags)
- 2 columns to `tenant_users` (monitoring permissions)
- 3 indexes for performance
- 2 helper tables (templates and audit)
- A few simplified helper functions
- Consolidate the two user-tenant tables

---

## Migration Steps (Simplified)

### **Step 1: Add Missing Columns to tenants**
```sql
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS tenant_tier INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS can_have_children BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_child_tenants INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS current_child_count INTEGER DEFAULT 0;
```

### **Step 2: Add Missing Columns to tenant_users**
```sql
ALTER TABLE tenant_users 
ADD COLUMN IF NOT EXISTS can_view_child_tenants BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_exclusive_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_granted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS access_granted_at TIMESTAMPTZ DEFAULT NOW();
```

### **Step 3: Add Performance Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_tenants_parent ON tenants(parent_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tenant_tier);
CREATE INDEX IF NOT EXISTS idx_tenants_path ON tenants(tenant_path);
CREATE INDEX IF NOT EXISTS idx_tenant_users_can_view_children ON tenant_users(can_view_child_tenants);
```

### **Step 4: Create tenant_relationships Audit Table**
```sql
CREATE TABLE IF NOT EXISTS tenant_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  child_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'parent_child',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT
);
```

### **Step 5: Create tenant_templates Table**
```sql
CREATE TABLE IF NOT EXISTS tenant_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  tenant_tier INTEGER NOT NULL,
  default_settings JSONB DEFAULT '{}',
  max_users INTEGER DEFAULT 25,
  max_projects INTEGER DEFAULT 50,
  can_have_children BOOLEAN DEFAULT false,
  max_child_tenants INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Step 6: Add Helper Functions**
```sql
-- Function to get all child tenants
CREATE OR REPLACE FUNCTION get_child_tenants(p_parent_id UUID)
RETURNS TABLE(tenant_id UUID, tenant_name TEXT, tenant_tier INTEGER) AS $$
  SELECT id, name, tenant_tier
  FROM tenants
  WHERE parent_tenant_id = p_parent_id
  ORDER BY name;
$$ LANGUAGE sql STABLE;

-- Function to check user access
CREATE OR REPLACE FUNCTION user_can_access_tenant(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_users
    WHERE user_id = p_user_id 
      AND tenant_id = p_tenant_id 
      AND is_active = true
  );
$$ LANGUAGE sql STABLE;
```

### **Step 7: Populate Initial Data**
```sql
-- Set tenant_tier based on tenant_level
UPDATE tenants 
SET tenant_tier = tenant_level
WHERE tenant_tier IS NULL;

-- Set can_have_children based on whether tenant has children
UPDATE tenants 
SET can_have_children = EXISTS (
  SELECT 1 FROM tenants t2 WHERE t2.parent_tenant_id = tenants.id
);

-- Update current_child_count
UPDATE tenants 
SET current_child_count = (
  SELECT COUNT(*) FROM tenants t2 WHERE t2.parent_tenant_id = tenants.id
);

-- Insert default templates
INSERT INTO tenant_templates (name, tenant_tier, max_users, max_projects, can_have_children, max_child_tenants) VALUES
('Primary Customer - Standard', 2, 50, 100, true, 25),
('Sub-Client - Basic', 3, 10, 25, false, 0);
```

---

## Decision: Consolidate or Keep Both Tables?

### **Option A: Keep Both Tables (Recommended)**
- `tenant_users` = Primary user-tenant assignments
- `user_tenant_permissions` = Temporary/delegated permissions with expiration
- Update functions to check both tables

### **Option B: Consolidate into tenant_users**
- Migrate the 1 row from `user_tenant_permissions` to `tenant_users`
- Drop `user_tenant_permissions` table
- Update all functions to use `tenant_users` only

**Recommendation:** Option A - Keep both tables for flexibility

---

## Estimated Time

- **Schema changes:** 15 minutes
- **Testing:** 30 minutes
- **Total:** ~1 hour

**Much faster than original 1-2 weeks estimate!**
