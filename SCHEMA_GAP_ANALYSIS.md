# Schema Gap Analysis - What Exists vs What We Need

## Summary

Your database already has **significant hierarchy support** built in! This is great news - it means less work and lower risk.

---

## ✅ What Already Exists

### **Tenants Table - Existing Columns:**
- ✅ `parent_tenant_id` - Parent tenant reference
- ✅ `tenant_level` - Hierarchy level (similar to tenant_tier)
- ✅ `tenant_path` - Materialized path
- ✅ `root_tenant_id` - Root tenant reference
- ✅ `is_active` - Active status
- ✅ `host_customer_id` - Host customer reference
- ✅ `feature_flags`, `usage_quotas`, `rbac_settings` - Configuration

### **tenant_users Table - Existing Columns:**
- ✅ `permission_scope` - Already set to 'own' by default
- ✅ `can_manage_sub_clients` - Sub-client management flag
- ✅ `is_primary_tenant` - Primary tenant tracking
- ✅ `role_level` - Role hierarchy
- ✅ `can_invite_users` - Invitation permissions
- ✅ `feature_permissions` - Granular permissions

### **Existing Functions:**
- ✅ `create_tenant()` - Creates tenant with parent support
- ✅ `get_tenant_hierarchy()` - Recursive hierarchy query
- ✅ `get_user_accessible_tenants()` - User's accessible tenants
- ✅ `grant_user_tenant_access()` - Grant tenant access
- ✅ `is_tenant_admin()` - Check if user is tenant admin
- ✅ `update_tenant_hierarchy()` - Update hierarchy (called by create_tenant)

### **Existing Indexes:**
- ✅ Unique constraint on tenant code
- ✅ Unique constraint on (tenant_id, user_id)
- ✅ Indexes on permission flags

---

## ❌ What's Missing (Need to Add)

### **Tenants Table - Missing Columns:**
1. `tenant_tier` - More semantic naming (1=Platform, 2=Primary, 3=Sub-client)
   - Note: `tenant_level` exists but we'll add `tenant_tier` for clarity
2. `can_have_children` - Boolean flag for whether tenant can have sub-tenants
3. `max_child_tenants` - Quota for maximum sub-tenants
4. `current_child_count` - Counter for current children

### **tenant_users Table - Missing Columns:**
1. `can_view_child_tenants` - Specific flag for read-only monitoring
2. `is_exclusive_access` - Lock user to single tenant
3. `access_granted_by` - Audit trail (who granted access)
4. `access_granted_at` - Audit trail (when granted) - **Already exists as created_at**

### **Missing Indexes:**
1. Index on `parent_tenant_id` (for hierarchy queries)
2. Index on `tenant_tier` (for filtering by tier)
3. Index on `tenant_path` (for path-based queries)
4. Index on `can_view_child_tenants` (for monitoring queries)

### **Missing Tables:**
1. `tenant_relationships` - Audit trail of tenant relationships
2. `tenant_templates` - Pre-configured tenant templates

### **Missing/Enhanced Functions:**
1. `get_child_tenants()` - Get all children recursively (simpler than get_tenant_hierarchy)
2. `get_parent_tenants()` - Get all parents/ancestors
3. `user_can_access_tenant()` - Check if user can access specific tenant
4. Triggers for auto-updating `tenant_path` and `current_child_count`

---

## 📊 Comparison: Existing vs Proposed

| Feature | Existing | Proposed | Status |
|---------|----------|----------|--------|
| Parent-child relationships | ✅ parent_tenant_id | Same | Already exists |
| Hierarchy queries | ✅ get_tenant_hierarchy() | Enhanced functions | Enhance |
| User access control | ✅ Basic | ✅ Enhanced with scopes | Enhance |
| Tenant creation | ✅ create_tenant() | Same | Already exists |
| Materialized path | ✅ tenant_path | Same | Already exists |
| Child tenant limits | ❌ None | ✅ max_child_tenants | Add |
| Monitoring permissions | ❌ None | ✅ can_view_child_tenants | Add |
| Tenant templates | ❌ None | ✅ tenant_templates table | Add |
| Audit trail | ❌ Limited | ✅ tenant_relationships | Add |

---

## 🎯 Simplified Migration Plan

Since so much already exists, our migration is **much simpler**:

### **Phase 1A: Add Missing Columns (Low Risk)**
- Add 4 columns to `tenants`
- Add 2 columns to `tenant_users`
- Add 3 indexes

### **Phase 1B: Create Helper Tables (Low Risk)**
- Create `tenant_relationships` table
- Create `tenant_templates` table

### **Phase 1C: Add Helper Functions (Low Risk)**
- Create simplified helper functions
- Create auto-update triggers

### **Phase 1D: Populate Initial Data (Low Risk)**
- Update existing tenants with new column values
- Insert default templates

---

## ⚠️ Important Notes

1. **tenant_level vs tenant_tier**: 
   - `tenant_level` already exists and works
   - We'll add `tenant_tier` as an alias for semantic clarity
   - Both can coexist

2. **Existing Functions**:
   - `get_tenant_hierarchy()` already does what we need
   - We'll add simpler helper functions for specific use cases
   - Won't break existing functionality

3. **user_tenant_permissions Table**:
   - Some functions reference `user_tenant_permissions` table
   - Need to check if this is different from `tenant_users`
   - May need to consolidate or clarify relationship

---

## 🚀 Next Steps

1. ✅ Schema discovery complete
2. ⏭️ Check if `user_tenant_permissions` table exists
3. ⏭️ Start adding missing columns (safe, non-breaking)
4. ⏭️ Create helper tables
5. ⏭️ Add helper functions
6. ⏭️ Test everything

**Estimated Time: 2-3 days** (much faster than original 1-2 weeks!)
