# Phase 3 Customer Project Board - Testing Guide

**Version:** 1.0  
**Date:** November 20, 2025  
**Status:** Ready for Testing

---

## Overview

This guide provides comprehensive testing instructions for all Phase 3 features. Follow these steps to verify functionality and populate the system with test data.

---

## Prerequisites

### Database Setup
✅ Phase 3 migration already run (`phase3_customer_project_board.sql`)

### Required Tables
- `project_charters` (existing, with new columns)
- `project_milestones` (existing, with new columns)
- `risks` (new)
- `project_roadblocks` (new)
- `project_status_updates` (new)
- `project_deliverables` (new)
- `customer_project_notifications` (new)
- `tour_progress` (new)

### User Roles for Testing
- **Platform Host** (host_admin or program_manager)
- **Primary Customer** (client_admin with sub-clients)
- **Sub-Client** (user under a Primary Customer)

---

## Phase 3.1: Work Request Approval RBAC

### Test Scenario 1: Platform Host Can Approve
**User:** Platform Host (host_admin)

1. Navigate to `/work-requests`
2. Find a pending work request
3. **Expected:** Approve and Reject buttons are enabled
4. Click "Approve"
5. **Expected:** Approval modal opens
6. Add approval notes
7. Click "Confirm Approval"
8. **Expected:** Work request status changes to "approved"

### Test Scenario 2: Primary Customer Cannot Approve
**User:** Primary Customer (client_admin)

1. Navigate to `/work-requests`
2. Find a pending work request
3. **Expected:** Approve and Reject buttons are disabled
4. Hover over disabled button
5. **Expected:** Tooltip explains "Only Platform Host can approve work requests"

### Test Scenario 3: API Security
**Test:** Try to call approve API directly as Primary Customer

```bash
curl -X POST https://your-domain.vercel.app/api/work-requests/[id]/approve \
  -H "Authorization: Bearer [primary_customer_token]"
```

**Expected:** 403 Forbidden error

---

## Phase 3.2: Database Schema & Functions

### Test Scenario 1: Portfolio Summary Function
**SQL Query:**

```sql
SELECT * FROM get_customer_portfolio_summary('[primary_customer_tenant_id]');
```

**Expected Output:**
- Summary row with total counts
- Project rows grouped by sub-client
- Correct calculations for budget, progress, etc.

### Test Scenario 2: Demand Analysis Function
**SQL Query:**

```sql
SELECT * FROM get_customer_demand_analysis('[primary_customer_tenant_id]');
```

**Expected Output:**
- Work request pipeline data
- Counts by status
- Demand trends

### Test Scenario 3: RLS Policies
**Test:** Query as different tenants

```sql
-- As Tenant A
SET LOCAL app.current_tenant_id = '[tenant_a_id]';
SELECT * FROM project_roadblocks;
-- Should only see Tenant A's roadblocks

-- As Tenant B
SET LOCAL app.current_tenant_id = '[tenant_b_id]';
SELECT * FROM project_roadblocks;
-- Should only see Tenant B's roadblocks
```

---

## Phase 3.3: Platform Host Project Management UI

### Test Scenario 1: Quick Update Modal
**User:** Platform Host

1. Navigate to `/project-management`
2. Select a project from dropdown
3. Click "Quick Update" button (if visible)
4. **Expected:** Modal opens with current project data
5. Change health status to "yellow"
6. Update completion percentage to 65%
7. Add next customer action: "Review deliverable by Friday"
8. Click "Save"
9. **Expected:** Changes saved to database

**Verification:**
```sql
SELECT health_status, completion_percentage, next_customer_action 
FROM project_charters 
WHERE id = '[project_id]';
```

### Test Scenario 2: Milestone Manager
**User:** Platform Host

1. Go to `/project-management`
2. Select a project
3. Click "Milestones" tab
4. Click "Add Milestone"
5. Fill in:
   - Name: "Phase 1 Kickoff"
   - Due Date: [future date]
   - Status: "in_progress"
   - Customer Action: "Attend kickoff meeting"
   - Definition of Done: "Meeting completed and notes shared"
   - Customer Visible: ✓
6. Click "Save"
7. **Expected:** Milestone appears in list

**Verification:**
```sql
SELECT * FROM project_milestones 
WHERE project_id = '[project_id]' 
ORDER BY created_at DESC LIMIT 1;
```

### Test Scenario 3: Roadblock Manager
**User:** Platform Host

1. Go to `/project-management`
2. Select a project
3. Click "Roadblocks" tab
4. Click "Add Roadblock"
5. Fill in:
   - Title: "Vendor delay"
   - Description: "Key vendor missed delivery deadline"
   - Severity: "high"
   - Impact: "2 week schedule delay"
   - Resolution Plan: "Escalate to vendor management"
6. Click "Save"
7. **Expected:** Roadblock appears in list

**Verification:**
```sql
SELECT * FROM project_roadblocks 
WHERE project_id = '[project_id]' 
AND status != 'resolved'
ORDER BY created_at DESC;
```

### Test Scenario 4: Status Update Form
**User:** Platform Host

1. Go to `/project-management`
2. Select a project
3. Click "Status Updates" tab
4. Fill in new update:
   - Type: "milestone_completed"
   - Title: "Phase 1 Complete"
   - Description: "All Phase 1 deliverables submitted"
   - Customer Visible: ✓
5. Click "Post Update"
6. **Expected:** Update appears in feed
7. **Expected:** Notification created for customer

**Verification:**
```sql
-- Check status update
SELECT * FROM project_status_updates 
WHERE project_id = '[project_id]' 
ORDER BY created_at DESC LIMIT 1;

-- Check notification created
SELECT * FROM customer_project_notifications 
WHERE project_id = '[project_id]' 
ORDER BY created_at DESC LIMIT 1;
```

### Test Scenario 5: Deliverable Tracker
**User:** Platform Host

1. Go to `/project-management`
2. Select a project
3. Click "Deliverables" tab
4. Click "Add Deliverable"
5. Fill in:
   - Name: "Requirements Document"
   - Description: "Detailed requirements specification"
   - Due Date: [future date]
   - Status: "in_progress"
   - File Link: "https://docs.google.com/..."
6. Click "Save"
7. **Expected:** Deliverable appears in list

---

## Phase 3.4: Primary Customer Portfolio Rollup

### Test Scenario 1: Portfolio Dashboard
**User:** Primary Customer (with sub-clients)

1. Navigate to `/customer/portfolio`
2. **Expected:** See summary cards:
   - Total Projects
   - Active Projects
   - At Risk Projects
   - Total Budget
   - Budget Spent
   - Average Progress
3. **Expected:** Projects grouped by sub-client
4. **Expected:** Each project shows:
   - Health status (green/yellow/red)
   - Progress bar
   - Budget info
   - Next milestone

### Test Scenario 2: Search and Filter
**User:** Primary Customer

1. On `/customer/portfolio`
2. Type project name in search box
3. **Expected:** Projects filtered in real-time
4. Click sub-client filter dropdown
5. Select a specific sub-client
6. **Expected:** Only that sub-client's projects shown

### Test Scenario 3: Data Accuracy
**Verification:** Compare UI data with database

```sql
-- Get portfolio summary
SELECT * FROM get_customer_portfolio_summary('[primary_customer_tenant_id]');

-- Compare counts and totals with UI
```

---

## Phase 3.5: Customer Project Board & Dashboard

### Test Scenario 1: Project List
**User:** Any Customer (Primary or Sub-Client)

1. Navigate to `/customer/projects`
2. **Expected:** See summary cards:
   - Active Projects count
   - At Risk count
   - Completed count
3. **Expected:** See project cards with:
   - Health indicator (icon + color)
   - Progress bar
   - Budget info
   - Timeline
   - Next action (if any)
4. Click "View Details" on a project
5. **Expected:** Navigate to project dashboard

### Test Scenario 2: Project Dashboard
**User:** Any Customer

1. Navigate to `/customer/projects/[id]`
2. **Expected:** See 4 summary cards:
   - Progress (with bar)
   - Budget (total and spent)
   - Timeline (variance)
   - Roadblocks (count)
3. **Expected:** See "Your Next Action" callout (if set)
4. **Expected:** See Milestones section with:
   - Only customer-visible milestones
   - Customer actions highlighted
   - Definition of done
5. **Expected:** See Deliverables section with:
   - Status badges
   - Due dates
   - File links (clickable)
6. **Expected:** See Active Roadblocks (if any)
7. **Expected:** See Recent Updates feed

### Test Scenario 3: Customer-Visible Filtering
**Verification:** Ensure only customer-visible data shows

```sql
-- Check what customer sees
SELECT * FROM project_milestones 
WHERE project_id = '[project_id]' 
AND customer_visible = true;

-- Compare with UI - should match exactly
```

---

## Phase 3.6: Notification System

### Test Scenario 1: Notification Bell
**User:** Any Customer

1. Look at top navigation bar
2. **Expected:** See bell icon
3. If there are unread notifications:
   - **Expected:** See red badge with count
4. Click bell icon
5. **Expected:** Dropdown opens with recent notifications
6. **Expected:** Unread notifications have blue background
7. Click a notification
8. **Expected:** Navigate to project page
9. **Expected:** Notification marked as read

### Test Scenario 2: Notification Page
**User:** Any Customer

1. Navigate to `/customer/notifications`
2. **Expected:** See all notifications
3. **Expected:** Unread count in header
4. Click "Unread" filter
5. **Expected:** Only unread notifications shown
6. Click "Mark All as Read"
7. **Expected:** All notifications marked as read
8. **Expected:** Unread count = 0

### Test Scenario 3: Real-Time Updates
**Setup:** Two browser windows - Platform Host and Customer

**Platform Host:**
1. Go to `/project-management`
2. Post a customer-visible status update

**Customer (other window):**
1. On `/customer/notifications` or any page
2. **Expected:** Bell icon badge updates immediately
3. **Expected:** New notification appears in dropdown

### Test Scenario 4: Notification Creation
**Test:** Verify notifications are created automatically

```sql
-- Platform Host posts status update
INSERT INTO project_status_updates (
  project_id, update_type, title, description, customer_visible
) VALUES (
  '[project_id]', 'status_update', 'Test Update', 'Testing notifications', true
);

-- Check notification was created
SELECT * FROM customer_project_notifications 
WHERE project_id = '[project_id]' 
ORDER BY created_at DESC LIMIT 1;
```

---

## Phase 3.7: Navigation & RBAC Integration

### Test Scenario 1: Navigation Items Visible
**User:** Any Customer

1. Open sidebar navigation
2. **Expected:** See in Operations section:
   - My Projects (NEW badge)
   - Portfolio Overview (NEW badge)
   - Notifications (NEW badge)
3. Click each menu item
4. **Expected:** Navigate to correct page

### Test Scenario 2: Notification Bell in Header
**User:** Any Customer

1. Look at top right of page
2. **Expected:** See notification bell between menu and profile
3. **Expected:** Bell is functional (not just icon)

### Test Scenario 3: RBAC Menu Visibility
**Test:** Different roles see different menu items

**Platform Host:**
- Should see: Project Management, Work Requests, etc.

**Primary Customer:**
- Should see: My Projects, Portfolio Overview, Notifications
- Should NOT see: Platform Host-only features

**Sub-Client:**
- Should see: My Projects, Notifications
- Should NOT see: Portfolio Overview (Primary Customer only)

---

## Phase 3.8: End-to-End Testing

### Test Scenario 1: Complete Workflow
**Participants:** Platform Host + Primary Customer

**Step 1: Platform Host Creates Project**
1. Create project in `project_charters` table
2. Set `customer_visible = true`
3. Set `health_status = 'green'`
4. Set `next_customer_action = 'Review project plan'`

**Step 2: Platform Host Adds Milestones**
1. Go to `/project-management`
2. Add 3 milestones with customer actions
3. Mark as customer-visible

**Step 3: Platform Host Posts Update**
1. Go to Status Updates tab
2. Post customer-visible update
3. **Expected:** Notification created

**Step 4: Customer Views Portfolio**
1. Customer logs in
2. Go to `/customer/portfolio`
3. **Expected:** See new project
4. **Expected:** See health status
5. **Expected:** See progress

**Step 5: Customer Views Project**
1. Click "View Details"
2. **Expected:** See milestones
3. **Expected:** See next action
4. **Expected:** See status update

**Step 6: Customer Checks Notifications**
1. Click bell icon
2. **Expected:** See notification about status update
3. Click notification
4. **Expected:** Go to project page

### Test Scenario 2: Roadblock Workflow
**Platform Host:**
1. Add high-severity roadblock
2. **Expected:** Notification created for customer

**Customer:**
1. Check notifications
2. **Expected:** See roadblock notification
3. Go to project dashboard
4. **Expected:** See roadblock in Active Roadblocks section

### Test Scenario 3: Milestone Completion
**Platform Host:**
1. Mark milestone as "completed"
2. Post status update about completion
3. **Expected:** Notification created

**Customer:**
1. Check notifications
2. Go to project dashboard
3. **Expected:** See milestone marked complete

---

## Sample Data Scripts

### Create Test Project
```sql
INSERT INTO project_charters (
  tenant_id,
  project_name,
  project_code,
  health_status,
  completion_percentage,
  budget,
  budget_spent,
  budget_variance,
  timeline_variance,
  start_date,
  end_date,
  next_customer_action,
  customer_visible
) VALUES (
  '[tenant_id]',
  'Website Redesign Project',
  'WEB-2025-001',
  'green',
  35,
  150000,
  52500,
  0,
  2,
  '2025-01-15',
  '2025-06-30',
  'Review homepage mockups by Nov 25',
  true
);
```

### Create Test Milestone
```sql
INSERT INTO project_milestones (
  project_id,
  milestone_name,
  due_date,
  status,
  customer_action,
  definition_of_done,
  customer_visible
) VALUES (
  '[project_id]',
  'Design Phase Complete',
  '2025-12-15',
  'in_progress',
  'Provide feedback on design mockups',
  'All mockups approved and signed off',
  true
);
```

### Create Test Roadblock
```sql
INSERT INTO project_roadblocks (
  project_id,
  title,
  description,
  severity,
  impact,
  resolution_plan,
  status
) VALUES (
  '[project_id]',
  'Designer Resource Conflict',
  'Lead designer allocated to another urgent project',
  'high',
  'May delay design phase by 1 week',
  'Bringing in contractor designer to maintain schedule',
  'open'
);
```

### Create Test Status Update
```sql
INSERT INTO project_status_updates (
  project_id,
  update_type,
  title,
  description,
  customer_visible,
  created_by
) VALUES (
  '[project_id]',
  'status_update',
  'Design Phase Progress Update',
  'Homepage and landing page designs are 80% complete. Awaiting your feedback on color scheme options.',
  true,
  '[host_user_id]'
);
```

### Create Test Deliverable
```sql
INSERT INTO project_deliverables (
  project_id,
  deliverable_name,
  description,
  due_date,
  status,
  file_link
) VALUES (
  '[project_id]',
  'Homepage Design Mockup',
  'High-fidelity mockup of new homepage design',
  '2025-11-30',
  'in_progress',
  'https://www.figma.com/file/example'
);
```

---

## Performance Testing

### Test Scenario 1: Portfolio Load Time
**Metric:** Page load time for portfolio with 50+ projects

1. Create 50+ projects for a Primary Customer
2. Navigate to `/customer/portfolio`
3. Measure time to interactive
4. **Target:** < 2 seconds

### Test Scenario 2: Notification Real-Time
**Metric:** Time from notification creation to UI update

1. Platform Host posts update
2. Measure time until Customer sees badge update
3. **Target:** < 1 second

### Test Scenario 3: Database Function Performance
**Query:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM get_customer_portfolio_summary('[tenant_id]');
```

**Target:** < 500ms execution time

---

## Security Testing

### Test 1: Tenant Isolation
**Verify:** Users can only see their own tenant's data

```sql
-- Try to access another tenant's data
SELECT * FROM project_roadblocks 
WHERE tenant_id != '[current_user_tenant_id]';
-- Should return 0 rows due to RLS
```

### Test 2: RBAC Enforcement
**Verify:** API endpoints enforce permissions

```bash
# Try to approve as Primary Customer (should fail)
curl -X POST /api/work-requests/[id]/approve \
  -H "Authorization: Bearer [primary_customer_token]"
# Expected: 403 Forbidden
```

### Test 3: Customer-Visible Filtering
**Verify:** Customers only see customer-visible data

```sql
-- As customer, try to see non-visible milestone
SELECT * FROM project_milestones 
WHERE customer_visible = false;
-- Should return 0 rows
```

---

## Known Issues & Limitations

### Current Limitations
1. **No Email Notifications** - Only in-app notifications
2. **No Notification Preferences** - All notifications enabled
3. **No Guided Tours** - Tour infrastructure built but tours not activated
4. **Portfolio Limited to Primary Customers** - Sub-clients don't see portfolio view

### Future Enhancements
1. Email notification integration
2. Notification preferences page
3. Activate guided tours
4. Mobile app support
5. Export functionality (PDF reports)
6. Advanced filtering and sorting

---

## Troubleshooting

### Issue: Pages are blank
**Cause:** No data in database  
**Solution:** Run sample data scripts above

### Issue: Notification bell not showing
**Cause:** Component not imported in DashboardLayout  
**Solution:** Verify NotificationBell import and rendering

### Issue: Portfolio shows no projects
**Cause:** No projects with `customer_visible = true`  
**Solution:** Update existing projects:
```sql
UPDATE project_charters 
SET customer_visible = true 
WHERE tenant_id = '[tenant_id]';
```

### Issue: Notifications not appearing
**Cause:** Status updates not marked customer-visible  
**Solution:** Ensure `customer_visible = true` when creating updates

### Issue: Real-time updates not working
**Cause:** Supabase subscriptions not active  
**Solution:** Check Supabase project settings, ensure real-time is enabled

---

## Success Criteria

### Functional Requirements
- ✅ All pages load without errors
- ✅ Data displays correctly
- ✅ CRUD operations work
- ✅ Notifications created automatically
- ✅ Real-time updates functional
- ✅ RBAC enforced
- ✅ Tenant isolation working

### Performance Requirements
- ✅ Portfolio loads in < 2s
- ✅ Notifications update in < 1s
- ✅ Database queries < 500ms

### Security Requirements
- ✅ RLS policies enforced
- ✅ API endpoints protected
- ✅ Customer-visible filtering works
- ✅ No cross-tenant data leakage

---

## Sign-Off Checklist

- [ ] All test scenarios executed
- [ ] Sample data created
- [ ] Performance metrics met
- [ ] Security tests passed
- [ ] Known issues documented
- [ ] User documentation complete
- [ ] Code reviewed
- [ ] Ready for production

---

**End of Testing Guide**
