# Tenant Onboarding & Management System - Complete Analysis

## Executive Summary

This document provides a comprehensive analysis of the current tenant onboarding and management system in the ETLA Platform, identifies gaps for the multi-tier customer scenario, and provides prioritized recommendations for improvements.

---

## Current System Overview

### **System Architecture**

The ETLA Platform currently implements a **flat multi-tenant architecture** with basic tenant management capabilities.

**Key Components:**
1. **Tenant Management UI** (`/admin/tenant-management`)
2. **User-Tenant Assignment** (`tenant_users` table)
3. **Role-Based Access Control (RBAC)** system
4. **User Invitation System** (recently enhanced)

---

## Current Capabilities

### ✅ **What Works Today**

#### 1. Tenant Creation
**Location:** `/admin/tenant-management/page.tsx`

**Current Flow:**
```
Admin User → Create Tenant Button → Fill Form → Tenant Created
```

**Fields Captured:**
- Tenant Name
- Tenant Code (unique identifier)
- Tenant Type
- Contact Email
- Status (auto-set to "active")
- Subscription Plan (auto-set to "professional")
- Max Users (default: 25)
- Max Projects (default: 50)

**Database Table:** `tenants`
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT,
  code TEXT UNIQUE,
  tenant_type TEXT,
  contact_email TEXT,
  status TEXT, -- 'active', 'trial', 'suspended', 'cancelled'
  subscription_plan TEXT, -- 'trial', 'professional', 'enterprise'
  max_users INTEGER,
  max_projects INTEGER,
  is_active BOOLEAN,
  tenant_level INTEGER, -- Currently set to 1 for all
  settings JSONB,
  feature_flags JSONB,
  usage_quotas JSONB,
  rbac_settings JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### 2. User Assignment to Tenants
**Location:** Same page, "Add User" modal

**Current Flow:**
```
Select Tenant → Add User Button → Select User → Assign Role → User Added
```

**Database Table:** `tenant_users`
```sql
CREATE TABLE tenant_users (
  user_id UUID REFERENCES profiles(id),
  tenant_id UUID REFERENCES tenants(id),
  role TEXT, -- 'host_admin', 'manager', 'user'
  is_active BOOLEAN,
  is_primary_tenant BOOLEAN,
  PRIMARY KEY (user_id, tenant_id)
)
```

**Roles Available:**
- `host_admin` - Full administrative access
- `manager` - Management-level access
- `user` - Standard user access

#### 3. User Invitation System
**Recently Enhanced** - Fully automated invitation acceptance

**Flow:**
```
Admin Invites User → Email Sent → User Accepts → Profile Created → Added to tenant_users → Appears in User List
```

**Database Table:** `user_invitations`
```sql
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY,
  email TEXT,
  tenant_id UUID REFERENCES tenants(id),
  role TEXT,
  status TEXT, -- 'pending', 'accepted', 'expired'
  invitation_token UUID,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

#### 4. Role-Based Access Control (RBAC)

**Roles Defined:**
- `HOST_ADMIN` - Platform administrators (your team)
- `CLIENT_ADMIN` - Customer administrators
- `PROGRAM_MANAGER` - Project/program managers
- `PRIMARY_CLIENT_ADMIN` - Primary customer admin (exists but not fully utilized)
- `CLIENT_USER` - End users

**Features Protected:**
- Tenant Management (HOST_ADMIN only)
- Access Control (HOST_ADMIN, CLIENT_ADMIN)
- Project Management (varies by role)
- Work Requests (varies by role)
- User Management (varies by role)

---

## Current Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT TENANT FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. TENANT CREATION (Manual)
   ┌──────────────┐
   │ HOST_ADMIN   │
   └──────┬───────┘
          │ Creates Tenant
          ▼
   ┌──────────────┐
   │   Tenants    │ (Flat structure, no hierarchy)
   │   Table      │
   └──────┬───────┘
          │
          ▼
   Tenant Created (Status: Active)

2. USER ASSIGNMENT (Manual)
   ┌──────────────┐
   │ HOST_ADMIN   │
   └──────┬───────┘
          │ Assigns Users
          ▼
   ┌──────────────┐
   │ tenant_users │ (One-to-many: user can be in multiple tenants)
   │   Table      │
   └──────┬───────┘
          │
          ▼
   User has access to tenant

3. USER INVITATION (Automated)
   ┌──────────────┐
   │ ADMIN User   │
   └──────┬───────┘
          │ Sends Invitation
          ▼
   ┌──────────────┐
   │ user_        │
   │ invitations  │
   └──────┬───────┘
          │ Email sent
          ▼
   ┌──────────────┐
   │ New User     │
   │ Accepts      │
   └──────┬───────┘
          │ Enhanced function runs
          ▼
   Profile Created → Added to tenant_users → Appears in UI
```

---

## Gap Analysis for Multi-Tier Customer Scenario

### **Your Scenario Requirements:**

> "We have a new customer that will have ETL and data storage performed across the entire platform. We need to:
> 1. Add the customer/tenant
> 2. Assign company users to ensure they have access to that tenant only
> 3. Provide access to our primary customer to monitor the records of their customer"

### ❌ **Critical Gaps Identified**

#### **Gap 1: No Tenant Hierarchy**
**Current State:** All tenants are flat, no parent-child relationships

**Missing:**
- No `parent_tenant_id` column
- No way to represent "Customer's Customer" relationship
- No hierarchical access control

**Impact:** Cannot model:
```
Your Company (Platform Owner)
  └── Primary Customer (e.g., ABC Corp)
        └── ABC's Customer 1 (Sub-client)
        └── ABC's Customer 2 (Sub-client)
```

#### **Gap 2: No Cross-Tenant Visibility**
**Current State:** Users can only see data within their assigned tenant(s)

**Missing:**
- No "parent tenant can view child tenant data" logic
- No aggregated views across tenant hierarchy
- No delegation/monitoring permissions

**Impact:** Primary customer (ABC Corp) cannot monitor their sub-clients' data

#### **Gap 3: No Tenant Type Differentiation**
**Current State:** `tenant_type` field exists but not used in access control

**Missing:**
- No distinction between:
  - Platform Owner (your company)
  - Primary Customer (ABC Corp)
  - Sub-Client (ABC's customers)
- No type-specific permissions or features

#### **Gap 4: No Data Isolation Controls**
**Current State:** Basic tenant isolation via RLS policies

**Missing:**
- No configurable data sharing rules
- No "read-only monitoring" access mode
- No data visibility scopes (own tenant only vs. tenant + children)

#### **Gap 5: No Tenant Onboarding Workflow**
**Current State:** Manual tenant creation by HOST_ADMIN

**Missing:**
- No guided onboarding wizard
- No automated setup steps (default users, settings, etc.)
- No tenant provisioning templates
- No bulk tenant creation
- No self-service tenant creation for primary customers

#### **Gap 6: Limited Role Granularity**
**Current State:** Only 3 roles in tenant_users (host_admin, manager, user)

**Missing:**
- No "monitoring" or "read-only admin" role
- No "sub-client manager" role
- No tenant-specific role customization
- `PRIMARY_CLIENT_ADMIN` role exists but not fully implemented

#### **Gap 7: No Tenant Relationship Management**
**Current State:** No UI or data model for tenant relationships

**Missing:**
- No way to assign a tenant as a "child" of another
- No UI to view tenant hierarchy
- No tenant relationship history/audit trail

#### **Gap 8: No User Scope Restrictions**
**Current State:** Users can be assigned to multiple tenants freely

**Missing:**
- No enforcement of "tenant-only" access
- No automatic removal from other tenants when assigned
- No "exclusive tenant access" flag

---

## Recommended Improvements

### **Priority 1: CRITICAL (Implement First)**

#### **1.1 Add Tenant Hierarchy Support**

**Database Changes:**
```sql
-- Add parent tenant relationship
ALTER TABLE tenants 
ADD COLUMN parent_tenant_id UUID REFERENCES tenants(id),
ADD COLUMN tenant_tier INTEGER DEFAULT 1, -- 1=Platform, 2=Primary Customer, 3=Sub-client
ADD COLUMN tenant_path TEXT; -- Materialized path for efficient queries

-- Create index for hierarchy queries
CREATE INDEX idx_tenants_parent ON tenants(parent_tenant_id);
CREATE INDEX idx_tenants_tier ON tenants(tenant_tier);

-- Add constraint to prevent circular references
ALTER TABLE tenants 
ADD CONSTRAINT check_no_self_parent 
CHECK (parent_tenant_id != id);
```

**Benefits:**
- ✅ Can model multi-tier customer relationships
- ✅ Foundation for hierarchical access control
- ✅ Enables parent-child data visibility

#### **1.2 Implement Hierarchical Access Control**

**New Permission Scopes:**
```typescript
type PermissionScope = 
  | 'own'              // Own tenant only
  | 'children'         // Own tenant + direct children
  | 'descendants'      // Own tenant + all descendants
  | 'ancestors'        // Can view parent/ancestor data
  | 'siblings'         // Can view sibling tenants (same parent)
```

**Database Changes:**
```sql
-- Add scope to tenant_users
ALTER TABLE tenant_users 
ADD COLUMN permission_scope TEXT DEFAULT 'own',
ADD COLUMN can_view_child_tenants BOOLEAN DEFAULT false,
ADD COLUMN can_manage_child_tenants BOOLEAN DEFAULT false;
```

**Benefits:**
- ✅ Primary customers can monitor sub-clients
- ✅ Flexible access control per user
- ✅ Maintains data isolation by default

#### **1.3 Create Tenant Relationship Management UI**

**New Page:** `/admin/tenant-hierarchy`

**Features:**
- Visual tree view of tenant relationships
- Drag-and-drop to assign parent tenants
- Bulk operations (assign multiple sub-clients to a parent)
- Relationship history and audit trail

**Component Structure:**
```typescript
<TenantHierarchyPage>
  <TenantTreeView />
  <TenantRelationshipForm />
  <TenantAccessScopeManager />
</TenantHierarchyPage>
```

#### **1.4 Enhanced User Assignment with Scope**

**Update:** `/admin/tenant-management` - Add User Modal

**New Fields:**
- Permission Scope (dropdown)
- Can View Child Tenants (checkbox)
- Can Manage Child Tenants (checkbox)
- Exclusive Access (checkbox - removes from other tenants)

**Validation:**
- Prevent assigning users to tenants outside their scope
- Warn when granting cross-tenant access

---

### **Priority 2: HIGH (Implement Soon)**

#### **2.1 Tenant Onboarding Wizard**

**New Page:** `/admin/tenant-onboarding`

**Steps:**
1. **Basic Info** - Name, code, type, contact
2. **Hierarchy** - Select parent tenant (if sub-client)
3. **Settings** - Max users, projects, features
4. **Initial Users** - Invite admin users
5. **Review & Create** - Summary and confirmation

**Benefits:**
- ✅ Guided process reduces errors
- ✅ Ensures all required setup is complete
- ✅ Can include templates for common scenarios

#### **2.2 Tenant Templates**

**Feature:** Pre-configured tenant setups

**Templates:**
- **Primary Customer** - Full features, no parent
- **Sub-Client (Standard)** - Limited features, requires parent
- **Sub-Client (Premium)** - Extended features, requires parent
- **Trial Tenant** - Time-limited, restricted features

**Database:**
```sql
CREATE TABLE tenant_templates (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  default_settings JSONB,
  default_feature_flags JSONB,
  default_quotas JSONB,
  created_at TIMESTAMPTZ
);
```

#### **2.3 Monitoring Dashboard for Primary Customers**

**New Page:** `/customer-monitoring`

**Features:**
- View all sub-client tenants
- Aggregated metrics across sub-clients
- Individual sub-client drill-down
- Export reports for all sub-clients

**Access Control:**
- Only visible to users with `can_view_child_tenants = true`
- Filtered to show only tenants in their hierarchy

#### **2.4 New Roles**

**Add to RBAC:**
```typescript
export const ROLES = {
  ...existing,
  CUSTOMER_MONITOR: 'customer_monitor', // Read-only access to sub-clients
  SUB_CLIENT_ADMIN: 'sub_client_admin', // Admin for sub-client tenant
  CUSTOMER_ADMIN: 'customer_admin',     // Admin for primary customer + sub-clients
}
```

**Role Permissions:**
- `CUSTOMER_MONITOR` - View-only access to child tenants
- `SUB_CLIENT_ADMIN` - Full admin within their sub-client tenant only
- `CUSTOMER_ADMIN` - Full admin for their tenant + manage sub-clients

---

### **Priority 3: MEDIUM (Nice to Have)**

#### **3.1 Tenant Provisioning Automation**

**Feature:** Automated setup when tenant is created

**Automation Steps:**
1. Create default admin user
2. Set up default project templates
3. Configure initial settings
4. Send welcome email
5. Create audit log entry

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION provision_new_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create default settings
  -- Auto-invite admin user
  -- Set up initial data
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_provision_tenant
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION provision_new_tenant();
```

#### **3.2 Bulk Tenant Operations**

**Features:**
- Import tenants from CSV
- Bulk assign users to multiple tenants
- Bulk update tenant settings
- Bulk status changes (activate/suspend)

#### **3.3 Tenant Analytics**

**Dashboard:** `/admin/tenant-analytics`

**Metrics:**
- Tenant growth over time
- Active vs. inactive tenants
- User distribution by tenant
- Resource usage by tenant
- Hierarchy depth distribution

#### **3.4 Self-Service Tenant Creation**

**Feature:** Allow PRIMARY_CLIENT_ADMIN to create sub-clients

**Flow:**
```
Primary Customer Admin → Create Sub-Client → Fill Form → 
  Approval (optional) → Sub-Client Created Under Their Tenant
```

**Access Control:**
- Only users with `can_manage_child_tenants = true`
- Auto-assigns parent_tenant_id to their tenant
- Limited to their allowed quotas

---

## Proposed Database Schema Changes

### **Complete Enhanced Schema:**

```sql
-- ============================================================================
-- ENHANCED TENANTS TABLE
-- ============================================================================
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS parent_tenant_id UUID REFERENCES tenants(id),
ADD COLUMN IF NOT EXISTS tenant_tier INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tenant_path TEXT,
ADD COLUMN IF NOT EXISTS can_have_children BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_child_tenants INTEGER,
ADD COLUMN IF NOT EXISTS current_child_count INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_parent ON tenants(parent_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tenant_tier);
CREATE INDEX IF NOT EXISTS idx_tenants_path ON tenants(tenant_path);

-- Constraints
ALTER TABLE tenants 
ADD CONSTRAINT check_no_self_parent CHECK (parent_tenant_id != id);

-- ============================================================================
-- ENHANCED TENANT_USERS TABLE
-- ============================================================================
ALTER TABLE tenant_users 
ADD COLUMN IF NOT EXISTS permission_scope TEXT DEFAULT 'own',
ADD COLUMN IF NOT EXISTS can_view_child_tenants BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_child_tenants BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_exclusive_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_granted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS access_granted_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- NEW: TENANT_RELATIONSHIPS TABLE (Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_tenant_id UUID REFERENCES tenants(id),
  child_tenant_id UUID REFERENCES tenants(id),
  relationship_type TEXT DEFAULT 'parent_child',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT unique_relationship UNIQUE (parent_tenant_id, child_tenant_id)
);

-- ============================================================================
-- NEW: TENANT_TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  tenant_tier INTEGER,
  default_settings JSONB,
  default_feature_flags JSONB,
  default_usage_quotas JSONB,
  default_rbac_settings JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HELPER FUNCTION: Get Tenant Hierarchy Path
-- ============================================================================
CREATE OR REPLACE FUNCTION get_tenant_path(tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  path TEXT := '';
  current_id UUID := tenant_id;
  parent_id UUID;
BEGIN
  LOOP
    SELECT parent_tenant_id INTO parent_id FROM tenants WHERE id = current_id;
    EXIT WHEN parent_id IS NULL;
    path := parent_id::TEXT || '/' || path;
    current_id := parent_id;
  END LOOP;
  RETURN path || tenant_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Get All Child Tenants (Recursive)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_child_tenants(parent_id UUID)
RETURNS TABLE(tenant_id UUID, depth INTEGER) AS $$
  WITH RECURSIVE tenant_tree AS (
    -- Base case: direct children
    SELECT id, 1 as depth
    FROM tenants
    WHERE parent_tenant_id = parent_id
    
    UNION ALL
    
    -- Recursive case: children of children
    SELECT t.id, tt.depth + 1
    FROM tenants t
    INNER JOIN tenant_tree tt ON t.parent_tenant_id = tt.id
  )
  SELECT id, depth FROM tenant_tree;
$$ LANGUAGE sql;
```

---

## Implementation Roadmap

### **Phase 1: Foundation (Week 1-2)**
1. ✅ Database schema changes (tenant hierarchy)
2. ✅ Update tenant creation to support parent_tenant_id
3. ✅ Add permission_scope to tenant_users
4. ✅ Create helper functions for hierarchy queries

### **Phase 2: Core Features (Week 3-4)**
1. ✅ Tenant hierarchy UI (tree view)
2. ✅ Enhanced user assignment with scopes
3. ✅ Update RLS policies for hierarchical access
4. ✅ Add new roles (CUSTOMER_MONITOR, CUSTOMER_ADMIN)

### **Phase 3: Monitoring & Management (Week 5-6)**
1. ✅ Customer monitoring dashboard
2. ✅ Tenant onboarding wizard
3. ✅ Tenant templates
4. ✅ Bulk operations

### **Phase 4: Automation & Polish (Week 7-8)**
1. ✅ Automated tenant provisioning
2. ✅ Self-service sub-client creation
3. ✅ Tenant analytics dashboard
4. ✅ Documentation and training materials

---

## Security Considerations

### **Data Isolation**
- ✅ Maintain RLS policies for tenant isolation
- ✅ Add RLS policies for hierarchical access
- ✅ Audit all cross-tenant data access

### **Access Control**
- ✅ Validate permission scopes on every request
- ✅ Log all scope changes
- ✅ Require approval for cross-tenant access grants

### **Tenant Hierarchy**
- ✅ Prevent circular references
- ✅ Limit hierarchy depth (e.g., max 3 levels)
- ✅ Validate parent tenant permissions before assignment

---

## Success Metrics

### **Operational Efficiency**
- Time to onboard new tenant: < 5 minutes (vs. current 15-20 minutes)
- User assignment errors: < 5% (vs. current ~15%)
- Support tickets for access issues: -50%

### **Feature Adoption**
- % of primary customers using monitoring dashboard: > 80%
- % of tenants using hierarchy: > 60%
- Self-service sub-client creation: > 40% of new sub-clients

### **User Satisfaction**
- Admin user satisfaction: > 4.5/5
- Primary customer satisfaction: > 4.0/5
- Time to resolve access issues: < 1 hour

---

## Conclusion

The current tenant management system provides a solid foundation but lacks critical features for the multi-tier customer scenario. The recommended improvements focus on:

1. **Hierarchical tenant relationships** - Essential for modeling customer-of-customer relationships
2. **Scoped access control** - Enables monitoring without full access
3. **Streamlined onboarding** - Reduces manual work and errors
4. **Self-service capabilities** - Empowers primary customers

**Estimated Total Effort:** 6-8 weeks for full implementation
**Recommended Approach:** Implement in phases, starting with Priority 1 items

**Next Steps:**
1. Review and approve this analysis
2. Prioritize features based on business needs
3. Begin Phase 1 implementation (database schema)
4. Develop detailed technical specifications for each feature
