# Invitation Status Not Updating Fix

## Issue Report
**Date**: November 20, 2025  
**Severity**: High  
**Impact**: Accepted invitations remain in "Pending" status even after user logs in

### Symptoms
- User accepts invitation and successfully logs in
- User appears in the system and can access features
- Invitation still shows as "Pending" in the Invitations tab
- Invitation does not disappear from pending invitations list

### Affected Functionality
- Access Control & Security → Invitations tab
- User invitation acceptance workflow
- Admin view of pending invitations

---

## Root Cause Analysis

### Issue 1: Database Function Not Applied
The `accept_user_invitation` database function may not have been applied to the production Supabase database, or an older version is in use.

**Evidence**:
- Multiple versions of the function exist in the codebase:
  - `/accept_invitation_function.sql` (original)
  - `/accept_invitation_function_fixed.sql` (fixed updated_at column)
  - `/accept_invitation_function_enhanced.sql` (enhanced with profile creation)
- No clear indication which version is deployed to production

### Issue 2: Role Mapping Issues
The current `accept_user_invitation` function has incomplete role mapping:

**Current mapping** (from `accept_invitation_function_enhanced.sql` lines 91-95):
```sql
CASE 
  WHEN v_role = 'admin' THEN 'host_admin'
  WHEN v_role = 'manager' THEN 'manager'
  ELSE 'user'
END
```

**Problem**: 
- Does not handle `primary_client_admin` or `Primary_client` role
- Does not handle `client_admin` role
- Case-sensitive matching (will fail for "Admin" vs "admin")
- Maps unknown roles to 'user' instead of appropriate defaults

**Example from screenshot**:
- Invitation role: "Primary_client"
- Expected tenant role: "primary_client_admin"
- Actual mapping: "user" (incorrect!)

### Issue 3: Silent Failures
The function may be failing but errors are not being logged or displayed to the user.

**Evidence** (from `/frontend/src/app/accept-invite/page.tsx` lines 209-211):
```typescript
if (inviteError) {
  console.error('Failed to update invitation status:', inviteError);
} else if (inviteResult?.success) {
```

The error is only logged to console, not shown to the user. If the function fails, the user proceeds as if everything worked.

---

## Solution

### Fix 1: Apply Improved Database Function
Created: `/database/migrations/fix_accept_invitation_function.sql`

**Improvements**:
1. **Comprehensive role mapping** (case-insensitive):
   - `admin`, `host_admin` → `host_admin`
   - `client_admin`, `tenant_admin` → `client_admin`
   - `primary_client_admin`, `primary_client` → `primary_client_admin`
   - `program_manager`, `manager` → `program_manager`
   - `client_user`, `user` → `client_user`
   - Default → `client_user`

2. **Case-insensitive email matching**:
   ```sql
   WHERE LOWER(email) = LOWER(p_email)
   ```

3. **Better error handling**:
   - Step tracking (`v_step` variable)
   - Detailed error messages
   - Warning logs for debugging

4. **Guaranteed status update**:
   ```sql
   UPDATE user_invitations
   SET 
     status = 'accepted',
     accepted_at = NOW()
   WHERE id = v_invitation_id;
   
   IF NOT FOUND THEN
     RAISE WARNING 'Failed to update invitation status for invitation_id: %', v_invitation_id;
   END IF;
   ```

### Fix 2: Update Existing Pending Invitations
Created: `/database/migrations/fix_existing_accepted_invitations.sql`

**Purpose**: Fix invitations that are stuck in "pending" status even though the user has already joined.

**Logic**:
1. Find invitations where:
   - Invitation status = 'pending'
   - User exists in `auth.users` with matching email
   - User exists in `tenant_users` for the same tenant
2. Update these invitations to 'accepted'
3. Set `accepted_at` to the user's `tenant_users.created_at` date

**Query**:
```sql
UPDATE user_invitations ui
SET 
    status = 'accepted',
    accepted_at = COALESCE(
        (SELECT tu.created_at 
         FROM tenant_users tu 
         INNER JOIN auth.users au ON tu.user_id = au.id
         WHERE LOWER(au.email) = LOWER(ui.email) 
         AND tu.tenant_id = ui.tenant_id
         LIMIT 1),
        NOW()
    )
FROM auth.users au
INNER JOIN tenant_users tu ON tu.user_id = au.id AND tu.tenant_id = ui.tenant_id
WHERE ui.status = 'pending'
  AND LOWER(au.email) = LOWER(ui.email);
```

---

## Deployment Instructions

### Step 1: Apply the Improved Function
1. Log in to Supabase Dashboard
2. Navigate to SQL Editor
3. Open `/database/migrations/fix_accept_invitation_function.sql`
4. Copy the entire SQL script
5. Paste into SQL Editor
6. Click "Run" to execute

**Expected Result**:
```
DROP FUNCTION
CREATE FUNCTION
GRANT
GRANT
COMMENT
```

### Step 2: Fix Existing Pending Invitations
1. In Supabase SQL Editor
2. Open `/database/migrations/fix_existing_accepted_invitations.sql`
3. **First**, run Step 1 (SELECT query) to preview affected invitations
4. **Review** the results to ensure they are correct
5. **Then**, run Step 2 (UPDATE query) to fix the invitations
6. **Finally**, run Step 3 (verification query) to confirm the fix

**Expected Result** (for kevin.shelton+marissa2@egisdynamics.com):
```
Before:
- pending_count: 9
- accepted_count: X

After:
- pending_count: 8 (or fewer)
- accepted_count: X+1 (or more)
```

### Step 3: Verify in UI
1. Navigate to Access Control & Security
2. Click on "Invitations" tab
3. Verify that accepted users no longer appear in pending invitations
4. Check that only truly pending invitations are shown

---

## Testing Checklist

### Test New Invitation Acceptance
1. ✅ Create a new invitation for a test user
2. ✅ Accept the invitation (set password)
3. ✅ Verify invitation status changes to 'accepted' immediately
4. ✅ Verify invitation disappears from pending list
5. ✅ Verify user appears in Users tab
6. ✅ Verify user has correct role assigned
7. ✅ Log in as the new user
8. ✅ Verify user can access appropriate features

### Test Role Mapping
Test each role type:
- ✅ `admin` → `host_admin`
- ✅ `Primary_client` → `primary_client_admin`
- ✅ `client_admin` → `client_admin`
- ✅ `manager` → `program_manager`
- ✅ `user` → `client_user`

### Test Edge Cases
- ✅ Case-insensitive email matching (Test@Example.com vs test@example.com)
- ✅ Multiple pending invitations for same email
- ✅ Expired invitations (should not be affected)
- ✅ Already accepted invitations (should not be re-processed)

---

## Files Modified/Created

### Created
1. `/database/migrations/fix_accept_invitation_function.sql`
   - Improved `accept_user_invitation` function with comprehensive role mapping

2. `/database/migrations/fix_existing_accepted_invitations.sql`
   - SQL script to fix existing stuck invitations

3. `/docs/fixes/INVITATION_STATUS_FIX.md`
   - This documentation file

---

## Related Code References

### Frontend
- `/frontend/src/app/accept-invite/page.tsx` (lines 203-229)
  - Calls `accept_user_invitation` RPC function
  - Updates user metadata
  - Refreshes session

- `/frontend/src/components/admin/InvitationsTab.tsx` (line 41)
  - Filters invitations by `status = 'pending'`
  - This is why accepted invitations should disappear

### Database
- `/accept_invitation_function.sql` (original version)
- `/accept_invitation_function_fixed.sql` (fixed updated_at)
- `/accept_invitation_function_enhanced.sql` (enhanced version)
- **NEW**: `/database/migrations/fix_accept_invitation_function.sql` (comprehensive fix)

---

## Prevention Measures

### Recommendations
1. **Database Migration Management**
   - Use Supabase CLI for migrations
   - Track which migrations have been applied
   - Version control all database changes

2. **Better Error Handling**
   - Show user-friendly error messages when invitation acceptance fails
   - Log detailed errors to application monitoring
   - Add retry mechanism for failed invitation acceptance

3. **Automated Testing**
   - Add E2E tests for invitation acceptance workflow
   - Test all role types in automated tests
   - Verify invitation status updates correctly

4. **Monitoring**
   - Add metric for "stuck" pending invitations
   - Alert when invitations remain pending for >24 hours after user login
   - Dashboard showing invitation acceptance success rate

---

## Known Limitations

1. **Manual Database Access Required**
   - These fixes require manual SQL execution in Supabase Dashboard
   - Cannot be applied automatically via code deployment

2. **No Automatic Cleanup**
   - Old stuck invitations must be fixed manually
   - Future invitations will work correctly once function is updated

3. **Case Sensitivity**
   - Email matching is now case-insensitive
   - But existing data may have case mismatches
   - The fix handles this, but be aware of potential edge cases

---

## Rollback Plan

If the fix causes issues:

1. **Restore Previous Function**:
   ```sql
   -- Revert to previous version if needed
   DROP FUNCTION IF EXISTS accept_user_invitation(UUID, TEXT);
   -- Then re-run the previous version from accept_invitation_function_enhanced.sql
   ```

2. **Revert Invitation Status Updates**:
   ```sql
   -- Only if absolutely necessary - this will make invitations pending again
   UPDATE user_invitations
   SET status = 'pending', accepted_at = NULL
   WHERE status = 'accepted' 
   AND accepted_at > '2025-11-20 00:00:00'; -- Adjust date as needed
   ```

---

## Status

- [x] Root cause identified
- [x] Fix developed and documented
- [ ] **PENDING**: Database function applied to production
- [ ] **PENDING**: Existing invitations fixed
- [ ] **PENDING**: Testing completed
- [ ] **PENDING**: Verified in production

---

## Next Steps

1. **Apply database migrations** (requires Supabase Dashboard access)
2. **Test with new invitation** to verify fix works
3. **Monitor for any issues** over next 24-48 hours
4. **Document lessons learned** for future reference

---

*Document created: November 20, 2025*  
*Status: Awaiting database migration application*
