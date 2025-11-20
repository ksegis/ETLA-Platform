# Phase 2 Implementation Guide - Frontend Development

## Overview

This guide provides step-by-step instructions for implementing the frontend components for the tenant hierarchy system.

---

## Step 1: TypeScript Types (✅ COMPLETED)

### Files Modified:
- `frontend/src/types/index.ts`

### Changes Made:
1. Updated `Tenant` interface with hierarchy fields
2. Added `TenantUser` interface with permission scope fields
3. Added `TenantTemplate` interface
4. Added `TenantRelationship` interface
5. Added type aliases for `TenantTier` and `PermissionScope`

---

## Step 2: Create Tenant Service Helper Functions

### File to Create: `frontend/src/services/tenant_hierarchy_service.ts`

```typescript
import { supabase } from '@/lib/supabase';
import { Tenant, TenantTemplate } from '@/types';

export class TenantHierarchyService {
  /**
   * Get all child tenants of a parent
   */
  static async getChildTenants(parentId: string): Promise<Tenant[]> {
    const { data, error } = await supabase
      .rpc('get_child_tenants', { p_parent_id: parentId });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Check if user can access a specific tenant
   */
  static async canUserAccessTenant(
    userId: string, 
    tenantId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('user_can_access_tenant', { 
        p_user_id: userId, 
        p_tenant_id: tenantId 
      });
    
    if (error) throw error;
    return data || false;
  }

  /**
   * Get full tenant hierarchy starting from a root tenant
   */
  static async getTenantHierarchy(rootId: string): Promise<any> {
    const { data, error} = await supabase
      .rpc('get_tenant_hierarchy', { p_tenant_id: rootId });
    
    if (error) throw error;
    return data;
  }

  /**
   * Get all available tenant templates
   */
  static async getTenantTemplates(tier?: number): Promise<TenantTemplate[]> {
    let query = supabase
      .from('tenant_templates')
      .select('*')
      .eq('is_active', true);
    
    if (tier) {
      query = query.eq('tenant_tier', tier);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Create tenant from template
   */
  static async createTenantFromTemplate(
    templateId: string,
    tenantData: {
      name: string;
      code: string;
      parent_tenant_id?: string;
      contact_email?: string;
    }
  ): Promise<Tenant> {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('tenant_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (templateError) throw templateError;

    // Create tenant with template defaults
    const insertData = {
      ...tenantData,
      tenant_tier: template.tenant_tier,
      max_users: template.max_users,
      max_projects: template.max_projects,
      can_have_children: template.can_have_children,
      max_child_tenants: template.max_child_tenants,
      settings: template.default_settings || {},
      feature_flags: template.default_feature_flags || {},
      usage_quotas: template.default_usage_quotas || {},
      rbac_settings: template.default_rbac_settings || {},
      status: 'active',
      subscription_plan: 'professional',
      is_active: true,
    };

    const { data, error } = await supabase
      .from('tenants')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Get tenant tier name
   */
  static getTierName(tier: number): string {
    switch (tier) {
      case 1: return 'Platform';
      case 2: return 'Primary Customer';
      case 3: return 'Sub-Client';
      default: return 'Unknown';
    }
  }

  /**
   * Get tenants that can be parents (have can_have_children = true)
   */
  static async getAvailableParentTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('can_have_children', true)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
}
```

---

## Step 3: Update Tenant Management Page

### File to Modify: `frontend/src/app/admin/tenant-management/page.tsx`

### Changes Needed:

#### 1. Add State for Templates and Parent Tenants

```typescript
const [templates, setTemplates] = useState<TenantTemplate[]>([]);
const [parentTenants, setParentTenants] = useState<Tenant[]>([]);
const [selectedTemplate, setSelectedTemplate] = useState<string>('');
```

#### 2. Update newTenant State

```typescript
const [newTenant, setNewTenant] = useState({
  name: '',
  code: '',
  tenant_type: '',
  contact_email: '',
  parent_tenant_id: '',  // NEW
  tenant_tier: 2,        // NEW: Default to Primary Customer
  template_id: '',       // NEW
});
```

#### 3. Load Templates and Parent Tenants

```typescript
useEffect(() => {
  if (isAuthenticated && hasAdminAccess) {
    loadTenants();
    loadAllUsers();
    loadTemplates();      // NEW
    loadParentTenants();  // NEW
  }
}, [isAuthenticated, hasAdminAccess]);

const loadTemplates = async () => {
  try {
    const data = await TenantHierarchyService.getTenantTemplates();
    setTemplates(data);
  } catch (error) {
    console.error('Error loading templates:', error);
  }
};

const loadParentTenants = async () => {
  try {
    const data = await TenantHierarchyService.getAvailableParentTenants();
    setParentTenants(data);
  } catch (error) {
    console.error('Error loading parent tenants:', error);
  }
};
```

#### 4. Update createTenant Function

```typescript
const createTenant = async () => {
  try {
    let tenantData;
    
    if (newTenant.template_id) {
      // Create from template
      tenantData = await TenantHierarchyService.createTenantFromTemplate(
        newTenant.template_id,
        {
          name: newTenant.name,
          code: newTenant.code,
          parent_tenant_id: newTenant.parent_tenant_id || undefined,
          contact_email: newTenant.contact_email,
        }
      );
    } else {
      // Create manually
      const insertData = {
        name: newTenant.name,
        code: newTenant.code,
        tenant_type: newTenant.tenant_type,
        contact_email: newTenant.contact_email,
        parent_tenant_id: newTenant.parent_tenant_id || null,
        tenant_tier: newTenant.tenant_tier,
        status: 'active',
        subscription_plan: 'professional',
        max_users: newTenant.tenant_tier === 2 ? 50 : 25,
        max_projects: newTenant.tenant_tier === 2 ? 100 : 50,
        can_have_children: newTenant.tenant_tier === 2,
        max_child_tenants: newTenant.tenant_tier === 2 ? 50 : 0,
        is_active: true,
        settings: {},
        feature_flags: {},
        usage_quotas: {},
        rbac_settings: {},
      };

      const { data, error } = await supabase
        .from('tenants')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      tenantData = data;
    }

    setShowCreateTenantModal(false);
    await loadTenants();
    
    // Reset form
    setNewTenant({
      name: '',
      code: '',
      tenant_type: '',
      contact_email: '',
      parent_tenant_id: '',
      tenant_tier: 2,
      template_id: '',
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
  }
};
```

#### 5. Update Create Tenant Modal UI

Add these fields to the modal (after the existing fields):

```tsx
{/* Tenant Tier Selection */}
<div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="tenant-tier" className="text-right">
    Tier
  </Label>
  <Select
    value={newTenant.tenant_tier.toString()}
    onValueChange={(value) =>
      setNewTenant({ ...newTenant, tenant_tier: parseInt(value) })
    }
  >
    <SelectTrigger className="col-span-3">
      <SelectValue placeholder="Select tier" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="2">Primary Customer</SelectItem>
      <SelectItem value="3">Sub-Client</SelectItem>
    </SelectContent>
  </Select>
</div>

{/* Parent Tenant Selection (only for Sub-Clients) */}
{newTenant.tenant_tier === 3 && (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="parent-tenant" className="text-right">
      Parent Tenant
    </Label>
    <Select
      value={newTenant.parent_tenant_id}
      onValueChange={(value) =>
        setNewTenant({ ...newTenant, parent_tenant_id: value })
      }
    >
      <SelectTrigger className="col-span-3">
        <SelectValue placeholder="Select parent tenant" />
      </SelectTrigger>
      <SelectContent>
        {parentTenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.name} ({tenant.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}

{/* Template Selection */}
<div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="template" className="text-right">
    Template (Optional)
  </Label>
  <Select
    value={newTenant.template_id}
    onValueChange={(value) => {
      setNewTenant({ ...newTenant, template_id: value });
      // Auto-fill from template
      const template = templates.find(t => t.id === value);
      if (template) {
        setNewTenant(prev => ({
          ...prev,
          template_id: value,
          tenant_tier: template.tenant_tier,
        }));
      }
    }}
  >
    <SelectTrigger className="col-span-3">
      <SelectValue placeholder="Select template (optional)" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">None (Manual Setup)</SelectItem>
      {templates
        .filter(t => t.tenant_tier === newTenant.tenant_tier)
        .map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
            {template.description && ` - ${template.description}`}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>
```

#### 6. Update Tenant List Display

Add hierarchy indicators to the tenant list:

```tsx
<div className="flex justify-between items-start">
  <div>
    <div className="flex items-center gap-2">
      <h3 className="font-medium text-gray-900">
        {tenant.name || 'Unnamed Tenant'}
      </h3>
      <Badge variant="outline">
        {TenantHierarchyService.getTierName(tenant.tenant_tier)}
      </Badge>
    </div>
    <p className="text-sm text-gray-500">
      Code: {tenant.code || 'No code'}
    </p>
    {tenant.parent_tenant_id && (
      <p className="text-sm text-blue-600">
        ↳ Sub-client of {parentTenants.find(p => p.id === tenant.parent_tenant_id)?.name}
      </p>
    )}
    {tenant.current_child_count > 0 && (
      <p className="text-sm text-green-600">
        {tenant.current_child_count} sub-client(s)
      </p>
    )}
  </div>
  <Badge className={tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
    {tenant.is_active ? 'Active' : 'Inactive'}
  </Badge>
</div>
```

---

## Step 4: Enhance User Assignment with Monitoring Permissions

### Update Add User Modal

Add these fields to the user assignment modal:

```tsx
{/* Permission Scope */}
<div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="permission-scope" className="text-right">
    Permission Scope
  </Label>
  <Select
    value={newUserAssignment.permission_scope || 'own'}
    onValueChange={(value) =>
      setNewUserAssignment({ ...newUserAssignment, permission_scope: value })
    }
  >
    <SelectTrigger className="col-span-3">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="own">Own Tenant Only</SelectItem>
      <SelectItem value="children">Own + Child Tenants (Read-Only)</SelectItem>
      <SelectItem value="descendants">Own + All Descendants (Read-Only)</SelectItem>
    </SelectContent>
  </Select>
</div>

{/* Can View Child Tenants */}
<div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="can-view-children" className="text-right">
    Monitor Sub-Clients
  </Label>
  <div className="col-span-3 flex items-center space-x-2">
    <input
      type="checkbox"
      id="can-view-children"
      checked={newUserAssignment.can_view_child_tenants || false}
      onChange={(e) =>
        setNewUserAssignment({ 
          ...newUserAssignment, 
          can_view_child_tenants: e.target.checked 
        })
      }
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <Label htmlFor="can-view-children" className="text-sm text-gray-600">
      Allow user to view data from sub-client tenants
    </Label>
  </div>
</div>

{/* Exclusive Access */}
<div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="exclusive-access" className="text-right">
    Exclusive Access
  </Label>
  <div className="col-span-3 flex items-center space-x-2">
    <input
      type="checkbox"
      id="exclusive-access"
      checked={newUserAssignment.is_exclusive_access || false}
      onChange={(e) =>
        setNewUserAssignment({ 
          ...newUserAssignment, 
          is_exclusive_access: e.target.checked 
        })
      }
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <Label htmlFor="exclusive-access" className="text-sm text-gray-600">
      Lock user to this tenant only (no multi-tenant access)
    </Label>
  </div>
</div>
```

### Update addUserToTenant Function

```typescript
const addUserToTenant = async () => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    
    const insertData = {
      user_id: selectedUserId,
      tenant_id: selectedTenantId,
      role: selectedRole,
      is_active: true,
      permission_scope: newUserAssignment.permission_scope || 'own',
      can_view_child_tenants: newUserAssignment.can_view_child_tenants || false,
      is_exclusive_access: newUserAssignment.is_exclusive_access || false,
      access_granted_by: authUser?.user?.id,
      access_granted_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('tenant_users')
      .insert(insertData);

    if (error) throw error;

    setShowAddUserModal(false);
    await loadTenantUsers(selectedTenantId);
  } catch (error) {
    console.error('Error adding user to tenant:', error);
  }
};
```

---

## Step 5: Create Tenant Hierarchy Visualization Component

### File to Create: `frontend/src/components/tenant/TenantHierarchyTree.tsx`

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Building2, Users } from 'lucide-react';
import { Tenant } from '@/types';
import { TenantHierarchyService } from '@/services/tenant_hierarchy_service';
import { Badge } from '@/components/ui/badge';

interface TenantNode extends Tenant {
  children?: TenantNode[];
}

interface Props {
  rootTenantId?: string;
  onTenantSelect?: (tenant: Tenant) => void;
}

export function TenantHierarchyTree({ rootTenantId, onTenantSelect }: Props) {
  const [hierarchy, setHierarchy] = useState<TenantNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHierarchy();
  }, [rootTenantId]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await TenantHierarchyService.getTenantHierarchy(
        rootTenantId || ''
      );
      setHierarchy(data);
    } catch (error) {
      console.error('Error loading hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TenantNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer`}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => {
            if (hasChildren) toggleNode(node.id);
            if (onTenantSelect) onTenantSelect(node);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )
          ) : (
            <div className="w-4" />
          )}
          
          <Building2 className="h-4 w-4 text-blue-600" />
          
          <span className="font-medium text-gray-900">{node.name}</span>
          
          <Badge variant="outline" className="text-xs">
            {TenantHierarchyService.getTierName(node.tenant_tier)}
          </Badge>
          
          {node.current_child_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {node.current_child_count}
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <div className="text-center p-8 text-gray-500">
        No hierarchy data available
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-semibold text-lg mb-4">Tenant Hierarchy</h3>
      {renderNode(hierarchy)}
    </div>
  );
}
```

---

## Step 6: Testing Checklist

### Database Functions
- [ ] Test `get_child_tenants()` returns correct children
- [ ] Test `user_can_access_tenant()` with direct and inherited access
- [ ] Test `get_tenant_hierarchy()` returns full tree

### Create Tenant Flow
- [ ] Create Primary Customer without template
- [ ] Create Primary Customer with template
- [ ] Create Sub-Client under Primary Customer
- [ ] Verify child count updates automatically
- [ ] Verify tier is set correctly

### User Assignment
- [ ] Assign user with "Own Tenant Only" scope
- [ ] Assign user with "Own + Child Tenants" scope
- [ ] Verify monitoring permissions work
- [ ] Verify exclusive access prevents multi-tenant access

### UI Components
- [ ] Tenant list shows hierarchy indicators
- [ ] Tier badges display correctly
- [ ] Parent tenant dropdown only shows eligible parents
- [ ] Template dropdown filters by tier
- [ ] Hierarchy tree expands/collapses correctly

---

## Step 7: Deployment

1. Commit all changes:
```bash
git add .
git commit -m "feat: Phase 2 - Tenant hierarchy frontend implementation"
git push origin main
```

2. Verify Vercel deployment succeeds

3. Test in production environment

---

## Next Steps (Phase 3)

After Phase 2 is complete:

1. **Monitoring Dashboard**
   - Customer view of all sub-clients
   - Consolidated reporting across hierarchy
   - Usage quotas and limits visualization

2. **Advanced Features**
   - Bulk tenant creation
   - Tenant migration/reassignment
   - Hierarchy depth limits
   - Circular reference prevention

3. **Automation**
   - Auto-provisioning from templates
   - Workflow approvals for sub-client creation
   - Automated notifications

---

## Support

If you encounter issues:
- Check browser console for errors
- Verify database functions are deployed
- Check Supabase logs for RPC errors
- Ensure RLS policies allow hierarchy queries
