# Phase 2 Testing Guide: Multi-Tier Tenant Hierarchy

## Overview
This guide will help you test all the Phase 2 hierarchy features that have been implemented.

---

## Prerequisites
- You should be logged in as a user with `TENANT_READ` and `TENANT_WRITE` permissions
- You're on the **Tenant Management** page: `/admin/tenant-management`

---

## Test 1: View Tenant Hierarchy Tree

**What to Test:**
The hierarchy tree visualization at the top of the page.

**Steps:**
1. Look for the "Tenant Hierarchy" card at the top of the page
2. You should see a tree structure showing your existing tenants
3. Check for these elements:
   - Tenant names displayed
   - Tier badges (Platform, Primary Customer, Sub-Client)
   - Child count indicators (if any tenant has sub-clients)
   - Expand/collapse arrows for tenants with children

**Expected Results:**
- Tree displays all tenants in hierarchical structure
- Root tenants (Tier 1 or no parent) appear at the top level
- Sub-clients appear nested under their parent tenants
- Clicking expand/collapse arrows works
- Clicking a tenant highlights it in blue

**Current Data:**
You should see:
- 5 Primary Customers (Tier 2)
- 1 Sub-Client (Tier 3): "Invictus BPO (Sub Client)" under "Demo Company (Primary)"

---

## Test 2: Create a Primary Customer (Tier 2)

**What to Test:**
Creating a new Primary Customer tenant using a template.

**Steps:**
1. Click the **"Create Tenant"** button (top right)
2. Fill in the form:
   - **Name:** "Test Primary Customer"
   - **Code:** "test-primary"
   - **Tenant Type:** "primary"
   - **Contact Email:** "test@example.com"
   - **Tenant Tier:** Select "2 - Primary Customer"
   - **Template:** Select "Standard Primary Customer"
   - **Parent Tenant:** Leave blank (Primary Customers have no parent)
3. Click **Create** or **Submit**

**Expected Results:**
- Modal closes
- New tenant appears in the tenant list
- Tenant shows "Primary Customer" tier badge
- Hierarchy tree updates to show the new tenant
- Tenant has `can_have_children: true`
- Tenant has `max_child_tenants: 50`

---

## Test 3: Create a Sub-Client (Tier 3)

**What to Test:**
Creating a Sub-Client under a Primary Customer.

**Steps:**
1. Click the **"Create Tenant"** button
2. Fill in the form:
   - **Name:** "Test Sub-Client"
   - **Code:** "test-subclient"
   - **Tenant Type:** "subclient"
   - **Contact Email:** "subclient@example.com"
   - **Tenant Tier:** Select "3 - Sub-Client"
   - **Template:** Select "Standard Sub-Client"
   - **Parent Tenant:** Select "Test Primary Customer" (or any existing Primary Customer)
3. Click **Create** or **Submit**

**Expected Results:**
- Modal closes
- New sub-client appears in the tenant list
- Sub-client shows "Sub-Client" tier badge
- Hierarchy tree updates showing sub-client nested under parent
- Parent tenant's child count increases by 1
- Sub-client has `can_have_children: false`
- Sub-client has `max_child_tenants: 0`

---

## Test 4: Verify Parent Selection Dropdown

**What to Test:**
The parent tenant dropdown only shows eligible parents.

**Steps:**
1. Click **"Create Tenant"**
2. Select **Tenant Tier: "3 - Sub-Client"**
3. Look at the **Parent Tenant** dropdown

**Expected Results:**
- Dropdown only shows Tier 2 (Primary Customer) tenants
- Tier 3 (Sub-Client) tenants are NOT in the dropdown
- Tier 1 (Platform) tenants may or may not appear (depends on business rules)
- Dropdown is disabled if Tier 2 is selected (Primary Customers have no parent)

---

## Test 5: Verify Template Selection

**What to Test:**
Templates filter based on selected tier.

**Steps:**
1. Click **"Create Tenant"**
2. Select **Tenant Tier: "2 - Primary Customer"**
3. Check the **Template** dropdown
4. Note which templates are available
5. Change to **Tenant Tier: "3 - Sub-Client"**
6. Check the **Template** dropdown again

**Expected Results:**
- When Tier 2 is selected:
  - "Standard Primary Customer" template available
  - "Enterprise Primary Customer" template available
  - Sub-Client templates NOT available
- When Tier 3 is selected:
  - "Basic Sub-Client" template available
  - "Standard Sub-Client" template available
  - Primary Customer templates NOT available

---

## Test 6: Hierarchy Tree Interaction

**What to Test:**
Interactive features of the hierarchy tree.

**Steps:**
1. Find a tenant with children in the hierarchy tree
2. Click the expand arrow (▶) next to the tenant name
3. Observe the children appearing
4. Click the collapse arrow (▼) to hide children
5. Click on a tenant name to select it
6. Check if the tenant list on the right updates

**Expected Results:**
- Expand/collapse works smoothly
- Children appear indented under parent
- Selected tenant highlights in blue
- Tenant details may update in the right panel (if implemented)

---

## Test 7: Verify Tier Badges and Child Counts

**What to Test:**
Visual indicators display correctly.

**Steps:**
1. Look at the tenant list (right side of page)
2. Check each tenant for:
   - Tier badge color and text
   - Child count display (if tenant has children)

**Expected Results:**
- **Tier 1 (Platform):** Red badge
- **Tier 2 (Primary Customer):** Blue badge
- **Tier 3 (Sub-Client):** Purple badge
- Child count shows as: "X sub-client(s)" in orange badge
- Count matches actual number of children

---

## Test 8: Verify Tenant Cannot Have Invalid Parent

**What to Test:**
Business rules prevent invalid hierarchies.

**Steps:**
1. Try to create a Sub-Client (Tier 3) with another Sub-Client as parent
   - This should be prevented by the dropdown only showing Tier 2 tenants
2. Try to create a Primary Customer (Tier 2) with a parent
   - The parent dropdown should be disabled

**Expected Results:**
- Cannot select invalid parent tenants
- System enforces hierarchy rules at UI level
- (Backend should also validate, but UI prevents the attempt)

---

## Test 9: Search and Filter Tenants

**What to Test:**
Search functionality works with hierarchy.

**Steps:**
1. Use the search box above the tenant list
2. Type part of a tenant name
3. Observe the filtered results

**Expected Results:**
- Tenant list filters based on search term
- Hierarchy tree may or may not filter (depends on implementation)
- Search is case-insensitive
- Clears when search box is emptied

---

## Test 10: Verify Database Consistency

**What to Test:**
Data is correctly stored in the database.

**Steps:**
1. After creating tenants, go to Supabase Dashboard
2. Open SQL Editor
3. Run this query:
```sql
SELECT 
  id,
  name,
  tenant_tier,
  parent_tenant_id,
  can_have_children,
  max_child_tenants,
  current_child_count
FROM tenants
ORDER BY tenant_tier, name;
```

**Expected Results:**
- All tenants appear with correct tier numbers
- Primary Customers (Tier 2) have:
  - `parent_tenant_id: NULL`
  - `can_have_children: true`
  - `max_child_tenants: 50`
- Sub-Clients (Tier 3) have:
  - `parent_tenant_id: [UUID of parent]`
  - `can_have_children: false`
  - `max_child_tenants: 0`
- `current_child_count` matches actual number of children

---

## Test 11: Check Tenant Relationships Table

**What to Test:**
Audit trail is maintained.

**Steps:**
1. In Supabase SQL Editor, run:
```sql
SELECT 
  parent_tenant_id,
  child_tenant_id,
  relationship_type,
  created_at,
  created_by
FROM tenant_relationships
ORDER BY created_at DESC;
```

**Expected Results:**
- Each parent-child relationship has a record
- `relationship_type` is 'direct_child'
- `created_at` timestamp is accurate
- `created_by` contains user ID who created the relationship

---

## Test 12: Template Application

**What to Test:**
Templates apply correct settings.

**Steps:**
1. Create a tenant using "Enterprise Primary Customer" template
2. Check the tenant's settings in the database:
```sql
SELECT 
  name,
  max_users,
  max_projects,
  feature_flags,
  usage_quotas
FROM tenants
WHERE name = 'your-tenant-name';
```

**Expected Results:**
- Settings match the template configuration
- `max_users`, `max_projects` set according to template
- `feature_flags` and `usage_quotas` populated from template

---

## Known Limitations (To Be Fixed in Future)

1. **User Email Display:** Currently shows user IDs instead of emails in tenant user list
   - Requires database view or RPC function to access auth.users
   - Functionality works, just display is not ideal

2. **All Users List:** Disabled temporarily
   - Same auth.users access issue
   - Not critical for hierarchy testing

---

## Troubleshooting

### Issue: Hierarchy tree not loading
**Solution:** Check browser console for errors. The `get_tenant_hierarchy` function must exist in database.

### Issue: Cannot create sub-client
**Solution:** Ensure parent tenant has `can_have_children: true` and hasn't reached `max_child_tenants` limit.

### Issue: Template dropdown empty
**Solution:** Run this query to verify templates exist:
```sql
SELECT * FROM tenant_templates WHERE is_active = true;
```

### Issue: Page stuck loading
**Solution:** Check browser console for errors. Clear browser cache and hard refresh (Ctrl+Shift+R).

---

## Success Criteria

✅ Phase 2 is complete when:
- [ ] Hierarchy tree displays correctly
- [ ] Can create Primary Customers (Tier 2)
- [ ] Can create Sub-Clients (Tier 3) under Primary Customers
- [ ] Parent selection dropdown works
- [ ] Template selection works
- [ ] Tier badges display correctly
- [ ] Child counts update automatically
- [ ] Hierarchy tree is interactive (expand/collapse)
- [ ] Database maintains correct relationships
- [ ] Audit trail is created in tenant_relationships

---

## Next Steps: Phase 3

Once Phase 2 testing is complete, Phase 3 will add:
- **Sub-Client Dashboard** for Primary Customers
- **Monitoring capabilities** (activity logs, usage metrics)
- **Management tools** (enable/disable, modify settings)
- **Reporting features** (export data, activity summaries)

---

*Testing Guide Created: November 19, 2025*  
*Last Updated: After commit 3804e98*
