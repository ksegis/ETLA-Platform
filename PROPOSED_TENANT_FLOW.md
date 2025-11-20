# Proposed Multi-Tier Tenant Onboarding Flow

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROPOSED MULTI-TIER TENANT SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
TIER 1: PLATFORM OWNER (Your Company - HelixBridge)
═══════════════════════════════════════════════════════════════════════════════

┌──────────────────┐
│  HOST_ADMIN      │ (Your team)
│  (Platform)      │
└────────┬─────────┘
         │
         │ Creates Primary Customer Tenant
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PRIMARY CUSTOMER TENANT (Tier 2)                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Tenant: ABC Corporation                                      │  │
│  │  Type: Primary Customer                                       │  │
│  │  Parent: None (top-level customer)                           │  │
│  │  Can Have Children: YES                                       │  │
│  │  Max Sub-Clients: 50                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Assigned Users:                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ • john@abc.com (CUSTOMER_ADMIN)                             │   │
│  │   - Permission Scope: descendants                           │   │
│  │   - Can View Child Tenants: YES                             │   │
│  │   - Can Manage Child Tenants: YES                           │   │
│  │                                                              │   │
│  │ • sarah@abc.com (CUSTOMER_MONITOR)                          │   │
│  │   - Permission Scope: children                              │   │
│  │   - Can View Child Tenants: YES                             │   │
│  │   - Can Manage Child Tenants: NO (read-only)                │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ Creates Sub-Client Tenants
                               │ (Either via HOST_ADMIN or self-service)
                               ▼
        ┌──────────────────────┴───────────────────────┐
        │                                               │
        ▼                                               ▼

═══════════════════════════════════════════════════════════════════════════════
TIER 3: SUB-CLIENTS (ABC's Customers)
═══════════════════════════════════════════════════════════════════════════════

┌────────────────────────────────┐      ┌────────────────────────────────┐
│ SUB-CLIENT TENANT 1            │      │ SUB-CLIENT TENANT 2            │
│ ┌────────────────────────────┐ │      │ ┌────────────────────────────┐ │
│ │ Tenant: Acme Industries    │ │      │ │ Tenant: XYZ Services       │ │
│ │ Type: Sub-Client           │ │      │ │ Type: Sub-Client           │ │
│ │ Parent: ABC Corporation    │ │      │ │ Parent: ABC Corporation    │ │
│ │ Can Have Children: NO      │ │      │ │ Can Have Children: NO      │ │
│ └────────────────────────────┘ │      │ └────────────────────────────┘ │
│                                 │      │                                 │
│ Assigned Users:                 │      │ Assigned Users:                 │
│ ┌─────────────────────────────┐│      │ ┌─────────────────────────────┐│
│ │ • admin@acme.com            ││      │ │ • admin@xyz.com             ││
│ │   (SUB_CLIENT_ADMIN)        ││      │ │   (SUB_CLIENT_ADMIN)        ││
│ │   - Scope: own (tenant only)││      │ │   - Scope: own              ││
│ │   - Exclusive Access: YES   ││      │ │   - Exclusive Access: YES   ││
│ │                             ││      │ │                             ││
│ │ • user1@acme.com (USER)     ││      │ │ • user1@xyz.com (USER)      ││
│ │ • user2@acme.com (USER)     ││      │ │ • user2@xyz.com (USER)      ││
│ └─────────────────────────────┘│      │ └─────────────────────────────┘│
└─────────────────────────────────┘      └─────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
DATA VISIBILITY & ACCESS CONTROL
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ WHO CAN SEE WHAT?                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ HOST_ADMIN (HelixBridge Team):                                              │
│   ✅ Can see ALL tenants (Platform + ABC + Acme + XYZ)                      │
│   ✅ Can manage ALL tenants                                                 │
│   ✅ Full administrative access across entire platform                      │
│                                                                              │
│ CUSTOMER_ADMIN (john@abc.com):                                              │
│   ✅ Can see ABC Corporation data                                           │
│   ✅ Can see Acme Industries data (child tenant)                            │
│   ✅ Can see XYZ Services data (child tenant)                               │
│   ✅ Can create new sub-client tenants                                      │
│   ✅ Can manage users in ABC and all sub-clients                            │
│   ❌ Cannot see HelixBridge platform data                                   │
│   ❌ Cannot see other primary customers                                     │
│                                                                              │
│ CUSTOMER_MONITOR (sarah@abc.com):                                           │
│   ✅ Can VIEW ABC Corporation data                                          │
│   ✅ Can VIEW Acme Industries data (read-only)                              │
│   ✅ Can VIEW XYZ Services data (read-only)                                 │
│   ✅ Can generate reports across all sub-clients                            │
│   ❌ Cannot modify any data                                                 │
│   ❌ Cannot create tenants or manage users                                  │
│                                                                              │
│ SUB_CLIENT_ADMIN (admin@acme.com):                                          │
│   ✅ Can see Acme Industries data ONLY                                      │
│   ✅ Can manage users within Acme Industries                                │
│   ✅ Full admin within their tenant                                         │
│   ❌ Cannot see ABC Corporation data                                        │
│   ❌ Cannot see XYZ Services data (sibling tenant)                          │
│   ❌ Cannot see HelixBridge platform data                                   │
│                                                                              │
│ USER (user1@acme.com):                                                      │
│   ✅ Can see Acme Industries data (based on role permissions)               │
│   ❌ Cannot see any other tenant data                                       │
│   ❌ Limited permissions within their tenant                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Onboarding Flow: Step-by-Step

### **Scenario: Onboard ABC Corporation as Primary Customer with Sub-Clients**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE PRIMARY CUSTOMER TENANT                                      │
└─────────────────────────────────────────────────────────────────────────────┘

HOST_ADMIN logs in → Navigates to /admin/tenant-onboarding

┌──────────────────────────────────────────────────────────────────┐
│ Tenant Onboarding Wizard                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Step 1: Basic Information                                       │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Tenant Name: ABC Corporation                             │   │
│ │ Tenant Code: ABC-CORP                                    │   │
│ │ Tenant Type: [Primary Customer ▼]                        │   │
│ │ Contact Email: contact@abc.com                           │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ Step 2: Hierarchy                                               │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Parent Tenant: [None - Top Level Customer]              │   │
│ │ Can Have Sub-Clients: [✓] Yes                           │   │
│ │ Max Sub-Clients: [50]                                    │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ Step 3: Settings & Quotas                                       │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Subscription Plan: [Enterprise ▼]                        │   │
│ │ Max Users: [100]                                         │   │
│ │ Max Projects: [500]                                      │   │
│ │ Features: [✓] ETL  [✓] Data Storage  [✓] Analytics      │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ Step 4: Initial Admin User                                      │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Email: john@abc.com                                      │   │
│ │ Full Name: John Smith                                    │   │
│ │ Role: [Customer Admin ▼]                                 │   │
│ │ Permission Scope: [All Sub-Clients ▼]                    │   │
│ │ [✓] Can manage sub-clients                               │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ [← Back]                              [Create Tenant →]         │
└──────────────────────────────────────────────────────────────────┘

Result:
✅ ABC Corporation tenant created (Tier 2)
✅ Invitation sent to john@abc.com
✅ john@abc.com can now create sub-clients

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: PRIMARY CUSTOMER CREATES SUB-CLIENT                                 │
└─────────────────────────────────────────────────────────────────────────────┘

john@abc.com (CUSTOMER_ADMIN) logs in → Navigates to /customer-management

┌──────────────────────────────────────────────────────────────────┐
│ My Sub-Clients                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ [+ Create Sub-Client]                                           │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ No sub-clients yet. Create your first sub-client to get   │ │
│ │ started with multi-tenant management.                      │ │
│ └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

Clicks [+ Create Sub-Client]

┌──────────────────────────────────────────────────────────────────┐
│ Create Sub-Client Tenant                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Sub-Client Name: Acme Industries                         │   │
│ │ Sub-Client Code: ACME-IND                                │   │
│ │ Contact Email: contact@acme.com                          │   │
│ │                                                          │   │
│ │ Template: [Standard Sub-Client ▼]                        │   │
│ │   - Max Users: 25                                        │   │
│ │   - Max Projects: 50                                     │   │
│ │   - Features: Basic ETL, Data Storage                    │   │
│ │                                                          │   │
│ │ Admin User:                                              │   │
│ │   Email: admin@acme.com                                  │   │
│ │   Full Name: Jane Doe                                    │   │
│ │   Role: Sub-Client Admin                                 │   │
│ │   [✓] Exclusive access (cannot access ABC Corp data)     │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ [Cancel]                              [Create Sub-Client]        │
└──────────────────────────────────────────────────────────────────┘

Result:
✅ Acme Industries tenant created (Tier 3)
✅ Parent set to ABC Corporation
✅ Invitation sent to admin@acme.com
✅ john@abc.com can now monitor Acme's data

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: MONITORING SUB-CLIENT DATA                                          │
└─────────────────────────────────────────────────────────────────────────────┘

john@abc.com navigates to /customer-monitoring

┌──────────────────────────────────────────────────────────────────┐
│ Sub-Client Monitoring Dashboard                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Overview (All Sub-Clients)                                       │
│ ┌────────────────┬────────────────┬────────────────────────┐   │
│ │ Total Clients  │ Active Users   │ Projects in Progress   │   │
│ │      2         │      15        │         8              │   │
│ └────────────────┴────────────────┴────────────────────────┘   │
│                                                                  │
│ Sub-Clients                                                      │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ ▼ Acme Industries                           [View Details]│   │
│ │   Status: Active  │  Users: 8  │  Projects: 5            │   │
│ │   Last Activity: 2 hours ago                             │   │
│ │                                                          │   │
│ │   Recent Activity:                                       │   │
│ │   • ETL Job completed - 1,500 records processed          │   │
│ │   • New project created: "Q4 Data Migration"             │   │
│ │   • 2 new users added                                    │   │
│ │                                                          │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ ▼ XYZ Services                              [View Details]│   │
│ │   Status: Active  │  Users: 7  │  Projects: 3            │   │
│ │   Last Activity: 5 hours ago                             │   │
│ │                                                          │   │
│ │   Recent Activity:                                       │   │
│ │   • Data validation completed - 98% accuracy             │   │
│ │   • Work request approved                                │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ [Export Report]  [Add Monitoring User]                          │
└──────────────────────────────────────────────────────────────────┘

Features:
✅ See all sub-clients at a glance
✅ Drill down into individual sub-client data
✅ Export consolidated reports
✅ Real-time activity monitoring
❌ Cannot modify sub-client data (read-only monitoring)

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: SUB-CLIENT ADMIN MANAGES THEIR TENANT                               │
└─────────────────────────────────────────────────────────────────────────────┘

admin@acme.com logs in → Sees only Acme Industries data

┌──────────────────────────────────────────────────────────────────┐
│ Dashboard - Acme Industries                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ My Projects  │  Work Requests  │  Users  │  Reports             │
│                                                                  │
│ ✅ Full access to Acme Industries features                       │
│ ❌ Cannot see ABC Corporation                                    │
│ ❌ Cannot see XYZ Services                                       │
│ ❌ Cannot create sub-tenants                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TENANT HIERARCHY IN DATABASE                         │
└─────────────────────────────────────────────────────────────────────────────┘

TENANTS TABLE:
┌────────────┬──────────────────┬────────────────┬─────────────┬──────────────┐
│ id         │ name             │ parent_tenant  │ tenant_tier │ tenant_path  │
│            │                  │ _id            │             │              │
├────────────┼──────────────────┼────────────────┼─────────────┼──────────────┤
│ platform-1 │ HelixBridge      │ NULL           │ 1           │ platform-1   │
│ abc-123    │ ABC Corporation  │ NULL           │ 2           │ abc-123      │
│ acme-456   │ Acme Industries  │ abc-123        │ 3           │ abc-123/     │
│            │                  │                │             │ acme-456     │
│ xyz-789    │ XYZ Services     │ abc-123        │ 3           │ abc-123/     │
│            │                  │                │             │ xyz-789      │
└────────────┴──────────────────┴────────────────┴─────────────┴──────────────┘

TENANT_USERS TABLE:
┌─────────────┬─────────────┬──────────────┬────────────┬─────────────────────┐
│ user_id     │ tenant_id   │ role         │ permission │ can_view_child_     │
│             │             │              │ _scope     │ tenants             │
├─────────────┼─────────────┼──────────────┼────────────┼─────────────────────┤
│ john-111    │ abc-123     │ customer_    │ descendants│ true                │
│             │             │ admin        │            │                     │
│ sarah-222   │ abc-123     │ customer_    │ children   │ true (read-only)    │
│             │             │ monitor      │            │                     │
│ jane-333    │ acme-456    │ sub_client_  │ own        │ false               │
│             │             │ admin        │            │                     │
│ user1-444   │ acme-456    │ user         │ own        │ false               │
│ admin-555   │ xyz-789     │ sub_client_  │ own        │ false               │
│             │             │ admin        │            │                     │
└─────────────┴─────────────┴──────────────┴────────────┴─────────────────────┘

QUERY EXAMPLES:

-- Get all sub-clients of ABC Corporation
SELECT * FROM tenants WHERE parent_tenant_id = 'abc-123';

-- Get all tenants john@abc.com can view (including children)
SELECT t.* FROM tenants t
WHERE t.id IN (
  SELECT tenant_id FROM tenant_users WHERE user_id = 'john-111'
  UNION
  SELECT id FROM get_child_tenants('abc-123') -- Recursive function
);

-- Check if user can view a specific tenant
SELECT EXISTS (
  SELECT 1 FROM tenant_users tu
  WHERE tu.user_id = 'sarah-222'
    AND (
      tu.tenant_id = 'acme-456' -- Direct access
      OR (
        tu.can_view_child_tenants = true 
        AND 'acme-456' IN (SELECT id FROM get_child_tenants(tu.tenant_id))
      )
    )
);
```

---

## Access Control Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PERMISSION MATRIX                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                    │ View   │ View   │ Create │ Manage │ Manage │ Create  │
                    │ Own    │ Child  │ Sub-   │ Users  │ Sub-   │ Tenants │
Role                │ Tenant │ Tenants│ Client │ in Own │ Client │ at Top  │
                    │        │        │ Tenant │ Tenant │ Users  │ Level   │
────────────────────┼────────┼────────┼────────┼────────┼────────┼─────────┤
HOST_ADMIN          │   ✅   │   ✅   │   ✅   │   ✅   │   ✅   │   ✅    │
(Platform)          │   ALL  │   ALL  │   YES  │   ALL  │   YES  │   YES   │
────────────────────┼────────┼────────┼────────┼────────┼────────┼─────────┤
CUSTOMER_ADMIN      │   ✅   │   ✅   │   ✅   │   ✅   │   ✅   │   ❌    │
(Primary Customer)  │   YES  │   YES  │   YES  │   YES  │   YES  │   NO    │
────────────────────┼────────┼────────┼────────┼────────┼────────┼─────────┤
CUSTOMER_MONITOR    │   ✅   │   ✅   │   ❌   │   ❌   │   ❌   │   ❌    │
(Read-Only Monitor) │   YES  │  VIEW  │   NO   │   NO   │   NO   │   NO    │
────────────────────┼────────┼────────┼────────┼────────┼────────┼─────────┤
SUB_CLIENT_ADMIN    │   ✅   │   ❌   │   ❌   │   ✅   │   ❌   │   ❌    │
(Sub-Client Admin)  │   YES  │   NO   │   NO   │   YES  │   NO   │   NO    │
────────────────────┼────────┼────────┼────────┼────────┼────────┼─────────┤
USER                │   ✅   │   ❌   │   ❌   │   ❌   │   ❌   │   ❌    │
(Regular User)      │  LIMIT │   NO   │   NO   │   NO   │   NO   │   NO    │
────────────────────┴────────┴────────┴────────┴────────┴────────┴─────────┘

Legend:
✅ YES    = Full access
✅ VIEW   = Read-only access
✅ LIMIT  = Limited by feature permissions
✅ ALL    = All tenants across platform
❌ NO     = No access
```

---

## Summary

This proposed system enables:

1. ✅ **Multi-tier tenant hierarchy** - Platform → Primary Customer → Sub-Clients
2. ✅ **Flexible access control** - Different permission scopes per user
3. ✅ **Monitoring capabilities** - Primary customers can monitor sub-clients
4. ✅ **Data isolation** - Sub-clients cannot see each other's data
5. ✅ **Self-service** - Primary customers can create their own sub-clients
6. ✅ **Scalability** - Supports unlimited hierarchy depth (with configurable limits)

**Next Steps:**
1. Implement database schema changes
2. Build tenant hierarchy UI
3. Update RBAC system for hierarchical permissions
4. Create monitoring dashboard
5. Test with real multi-tier scenario
