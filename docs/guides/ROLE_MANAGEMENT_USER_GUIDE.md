# Role Management User Guide

## Overview
The Role Management page allows administrators to visually configure which screens each role can access and what CRUD (Create, Read, Update, Delete) permissions they have for each feature.

**Access**: Administration → Role Management  
**URL**: https://www.helixbridge.cloud/role-management  
**Required Permission**: Admin Access

---

## Quick Start

### Step 1: Select a Role
Click on one of the role cards at the top:
- **Host Admin** - Full system access
- **Client Admin** - Tenant administration
- **Primary Client Admin** - Primary customer contact
- **Program Manager** - Project oversight
- **Client User** - Standard customer user

### Step 2: Toggle Features On/Off
For each feature, use the green/gray toggle switch:
- **Green** = Feature enabled for this role
- **Gray** = Feature disabled for this role

### Step 3: Configure CRUD Permissions
When a feature is enabled (green), you'll see four buttons:
- **C** = Create (can add new records)
- **R** = Read (can view records)
- **U** = Update (can edit records)
- **D** = Delete (can remove records)

Click each button to toggle it on (blue) or off (gray).

### Step 4: Save Changes
Click the **Save Changes** button at the top right to apply your changes.

---

## Feature Categories

### Core
- **Dashboard** - Main dashboard view

### Operations
- **Work Requests** - Manage work requests
- **Project Management** - Manage projects
- **Reporting** - View and generate reports

### Talent Management
- **Talent Dashboard** - Overview of talent pipeline
- **Job Management** - Post and manage job listings
- **Candidates** - Manage candidate profiles
- **Pipeline** - Track recruitment pipeline
- **Interviews** - Schedule and manage interviews
- **Offers** - Create and manage job offers

### ETL Cockpit
- **ETL Dashboard** - Monitor ETL jobs
- **ETL Job Management** - Configure and run ETL jobs

### Analytics
- **HR Analytics Dashboard** - HR metrics and insights

### Customer Portal
- **My Projects** - Customer view of their projects
- **Portfolio Overview** - Customer portfolio dashboard

### Administration
- **User Management** - Manage users and invitations
- **Access Control & Security** - Configure access control
- **Role Management** - This page

---

## Recommended Permissions by Role

### Host Admin
**Purpose**: Full system administrator  
**Recommended Access**: Everything (all features, all CRUD)

**Default Configuration**:
- ✅ All features enabled
- ✅ Full CRUD permissions on everything

---

### Client Admin
**Purpose**: Tenant administrator who manages their organization  
**Recommended Access**: Customer portal + user management

**Default Configuration**:
- ✅ Dashboard (Read)
- ✅ My Projects (Read, Update)
- ✅ Portfolio Overview (Read, Update)
- ✅ User Management (Create, Read, Update)
- ❌ All internal operations features disabled

**Use Case**: Client Admin can view and update their projects, invite new users, but cannot access internal operations like Work Requests or Talent Management.

---

### Primary Client Admin
**Purpose**: Primary customer contact (read-only access)  
**Recommended Access**: Customer portal only (read-only)

**Default Configuration**:
- ✅ Dashboard (Read only)
- ✅ My Projects (Read only)
- ✅ Portfolio Overview (Read only)
- ❌ All other features disabled

**Use Case**: Primary Client Admin can view project status and portfolio but cannot make changes or access internal operations.

**⚠️ IMPORTANT**: This role should NOT have access to:
- ❌ Work Requests
- ❌ Talent Management
- ❌ ETL Cockpit
- ❌ Job Management
- ❌ Candidates
- ❌ Pipeline
- ❌ Interviews
- ❌ Offers
- ❌ User Management
- ❌ Access Control

---

### Program Manager
**Purpose**: Manages projects and work requests  
**Recommended Access**: Operations features

**Default Configuration**:
- ✅ Dashboard (Read)
- ✅ Work Requests (Create, Read, Update)
- ✅ Project Management (Create, Read, Update)
- ✅ Reporting (Read)
- ❌ Talent Management disabled
- ❌ ETL Cockpit disabled
- ❌ Administration disabled

**Use Case**: Program Manager can manage work requests and projects but cannot access talent management or administrative functions.

---

### Client User
**Purpose**: Standard customer user (read-only)  
**Recommended Access**: Limited customer portal

**Default Configuration**:
- ✅ Dashboard (Read only)
- ✅ My Projects (Read only)
- ❌ All other features disabled

**Use Case**: Client User can view their projects but cannot make any changes.

---

## Common Scenarios

### Scenario 1: Restrict Primary Client Admin Access
**Problem**: Primary Client Admin has too much access (can see Work Requests, Talent Management, etc.)

**Solution**:
1. Select **Primary Client Admin** role
2. Disable all features except:
   - Dashboard (Read only)
   - My Projects (Read only)
   - Portfolio Overview (Read only)
3. Click **Save Changes**

**Result**: Primary Client Admin can only view customer portal, nothing else.

---

### Scenario 2: Give Client Admin User Management
**Problem**: Client Admin needs to invite new users to their organization

**Solution**:
1. Select **Client Admin** role
2. Enable **User Management** feature
3. Set CRUD permissions:
   - ✅ Create (can invite users)
   - ✅ Read (can view users)
   - ✅ Update (can edit user roles)
   - ❌ Delete (cannot delete users)
4. Click **Save Changes**

**Result**: Client Admin can invite and manage users but cannot delete them.

---

### Scenario 3: Create Read-Only Analyst Role
**Problem**: Need a role that can view analytics but not make changes

**Solution**:
1. Select appropriate role (e.g., Client User)
2. Enable analytics features:
   - HR Analytics Dashboard
   - Reporting
3. Set CRUD permissions:
   - ❌ Create
   - ✅ Read (only)
   - ❌ Update
   - ❌ Delete
4. Click **Save Changes**

**Result**: User can view analytics and reports but cannot modify anything.

---

## Tips & Best Practices

### 1. Start Restrictive, Add as Needed
- Begin with minimal permissions
- Add features only when users need them
- It's easier to grant access than revoke it

### 2. Use Read Permission Wisely
- Read permission is required to view a feature
- Without Read, users won't see the menu item
- Always enable Read when enabling other CRUD permissions

### 3. Test Before Deploying
- Make changes for one role at a time
- Test with a test user account
- Verify navigation menu updates correctly

### 4. Document Custom Configurations
- Keep notes on why certain permissions were granted
- Document any deviations from defaults
- Helps with troubleshooting and audits

### 5. Review Regularly
- Audit permissions quarterly
- Remove access for users who changed roles
- Ensure least-privilege principle

---

## Troubleshooting

### Issue: Changes Not Saving
**Symptoms**: Click "Save Changes" but permissions don't update

**Solutions**:
1. Check browser console for errors
2. Verify you have admin permissions
3. Try refreshing the page and making changes again
4. Contact support if issue persists

---

### Issue: User Still Sees Disabled Features
**Symptoms**: Disabled a feature but user still sees it in navigation

**Solutions**:
1. Have user hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Have user log out and log back in
3. Wait a few minutes for changes to propagate
4. Verify the correct role is assigned to the user

---

### Issue: Can't Find Role Management Page
**Symptoms**: Role Management not appearing in navigation

**Solutions**:
1. Verify you have admin permissions
2. Check you're logged in as Host Admin or Client Admin
3. Look in Administration menu group
4. Try accessing directly: /role-management

---

## Security Considerations

### Principle of Least Privilege
- Grant minimum permissions needed for job function
- Don't give admin access unless absolutely necessary
- Review and revoke unused permissions regularly

### Separation of Duties
- Don't give one role both create and approve permissions
- Separate financial permissions from operational permissions
- Use different roles for different responsibilities

### Customer Data Protection
- Primary Client Admin should ONLY see their own data
- Never grant customers access to internal operations
- Audit customer access logs regularly

### Audit Trail
- All permission changes should be logged
- Review who made changes and when
- Investigate unexpected permission changes

---

## Keyboard Shortcuts

- **Ctrl+S** / **Cmd+S** - Save changes (when changes exist)
- **Esc** - Cancel unsaved changes (with confirmation)

---

## Support

If you need help with role management:
1. Check this guide first
2. Review the permission legend on the page
3. Contact support at https://help.manus.im

---

## Changelog

**Version 1.0** (November 20, 2025)
- Initial release
- Visual permission matrix
- CRUD permission toggles
- Default role configurations
- Category-based feature organization

---

*Last updated: November 20, 2025*  
*Document version: 1.0*
