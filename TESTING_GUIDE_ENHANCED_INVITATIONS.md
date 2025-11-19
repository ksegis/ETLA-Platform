# Testing Guide: Enhanced Invitation Acceptance Flow

## Overview

The enhanced invitation acceptance system now automatically handles:
1. ✅ Updates invitation status from 'pending' to 'accepted'
2. ✅ Creates user profile record if missing
3. ✅ Adds user to `tenant_users` table with correct role
4. ✅ Maps invitation roles to tenant roles properly

---

## Prerequisites

Before testing, ensure:
- ✅ Enhanced database function is deployed in Supabase
- ✅ Frontend code is deployed to Vercel (already correct)
- ✅ You have admin access to create invitations

---

## Test Plan

### **Test 1: New Admin User Invitation**

#### Step 1: Create Invitation
1. Log in as admin to ETLA Platform
2. Go to **Admin** → **Access Control** → **Invitations** tab
3. Click **Invite User**
4. Fill in:
   - Email: `test-admin@example.com` (use a real email you can access)
   - Role: **Admin**
5. Click **Send Invitation**

#### Step 2: Accept Invitation
1. Check the email inbox for `test-admin@example.com`
2. Click the invitation link
3. Fill in:
   - Full Name: `Test Admin User`
   - Password: (meet requirements)
   - Confirm Password: (same)
4. Click **Accept Invitation**

#### Step 3: Verify Results
**Expected Outcomes:**

✅ **Invitation Status**
- Go to Invitations tab
- Invitation for `test-admin@example.com` shows as **"Accepted"**
- `accepted_at` timestamp is set

✅ **User Appears in List**
- Go to Users tab
- `test-admin@example.com` appears in the user list
- Role shows as **"host_admin"**
- User is **active**

✅ **User Can Log In**
- Log out
- Log in with `test-admin@example.com` and the password
- User should have full admin access

✅ **Database Records**
Run these queries to verify:

```sql
-- Check invitation status
SELECT id, email, status, accepted_at
FROM user_invitations
WHERE email = 'test-admin@example.com';

-- Check profile was created
SELECT id, email, full_name
FROM profiles
WHERE email = 'test-admin@example.com';

-- Check tenant_users record
SELECT user_id, tenant_id, role, is_active
FROM tenant_users tu
JOIN profiles p ON p.id = tu.user_id
WHERE p.email = 'test-admin@example.com';
```

---

### **Test 2: New Regular User Invitation**

#### Step 1: Create Invitation
1. Invite another user with **User** role (not admin)
2. Email: `test-user@example.com`

#### Step 2: Accept Invitation
1. Accept the invitation following the same process

#### Step 3: Verify Results
**Expected:**
- ✅ Invitation status: **"Accepted"**
- ✅ User appears in user list
- ✅ Role shows as **"user"** (not host_admin)
- ✅ User can log in with limited permissions

---

### **Test 3: Role Mapping Verification**

The function maps invitation roles to tenant roles:

| Invitation Role | Tenant Role | Expected Access |
|-----------------|-------------|-----------------|
| `admin` | `host_admin` | Full admin access |
| `manager` | `manager` | Manager-level access |
| `user` | `user` | Standard user access |

Verify each role maps correctly by checking the `tenant_users.role` column.

---

## Troubleshooting

### Issue: Invitation status not updating
**Check:**
```sql
-- See if function was called (check Supabase logs)
-- Or manually test the function:
SELECT accept_user_invitation(
  'USER_ID_HERE'::uuid,
  'test-admin@example.com'
);
```

### Issue: User not appearing in list
**Check:**
```sql
-- Verify user is in tenant_users
SELECT * FROM tenant_users tu
JOIN profiles p ON p.id = tu.user_id
WHERE p.email = 'test-admin@example.com';
```

### Issue: Profile not created
**Check:**
```sql
-- Verify profile exists
SELECT * FROM profiles WHERE email = 'test-admin@example.com';

-- If missing, the function should have created it
-- Check function return value for errors
```

---

## Success Criteria

All tests pass when:
- ✅ Invitations change from "Pending" to "Accepted" automatically
- ✅ Users appear in user list immediately after acceptance
- ✅ Users can log in with correct permissions
- ✅ No manual database fixes required
- ✅ Profile records are created automatically
- ✅ Roles map correctly (admin → host_admin, etc.)

---

## Cleanup After Testing

To remove test users:

```sql
-- Delete from tenant_users
DELETE FROM tenant_users 
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE email IN ('test-admin@example.com', 'test-user@example.com')
);

-- Delete profiles
DELETE FROM profiles 
WHERE email IN ('test-admin@example.com', 'test-user@example.com');

-- Delete from auth.users (use Supabase dashboard)
-- Go to Authentication → Users → Delete user

-- Mark invitations as deleted (optional)
UPDATE user_invitations
SET status = 'deleted'
WHERE email IN ('test-admin@example.com', 'test-user@example.com');
```

---

## Next Steps After Successful Testing

1. Monitor production invitations for any issues
2. Check Supabase logs for function execution errors
3. Gather user feedback on the invitation flow
4. Consider adding email notifications for successful acceptance
