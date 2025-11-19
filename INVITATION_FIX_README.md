# User Invitation System Fix - Implementation Guide

## Problem Summary

The user invitation system had two critical issues:
1. **Invitation status not updating**: When users accepted invitations and set passwords, the `user_invitations` table status remained "pending" instead of updating to "accepted"
2. **Admin role access**: New users with admin roles had minimal access after login due to role metadata not being properly loaded

The original fix attempted to use a Next.js API route (`/api/user/accept-invite/route.ts`) but encountered persistent TypeScript build failures with "File is not a module" errors.

## Solution: Database Function Approach

Instead of using a Next.js API route, we're implementing a **Supabase database function (RPC)** that handles the invitation acceptance logic directly in the database. This approach:
- Bypasses Next.js build issues entirely
- Provides better performance (no HTTP round-trip)
- Ensures transactional integrity
- Simplifies the codebase

## Implementation Steps

### Step 1: Run the SQL Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `accept_invitation_function.sql` (included in this directory)
4. Copy and paste the entire SQL content into the SQL Editor
5. Click **Run** to execute the migration

This will create a database function called `accept_user_invitation` that:
- Finds the pending invitation for the user's email
- Updates the invitation status to "accepted"
- Records the acceptance timestamp
- Returns the tenant_id and role information

### Step 2: Update the Frontend Code

The frontend code needs to be updated to call the database function instead of the failed API route.

**File to modify**: `frontend/src/app/accept-invite/page.tsx`

**Current problematic code** (lines 196-215):
```typescript
// --- NEW LOGIC: Update invitation status via Supabase Edge Function ---
// Call refreshSession to ensure the AuthContext picks up the new role from the database
await supabase.auth.refreshSession();

const userId = (await supabase.auth.getUser()).data.user?.id;
const tenantId = searchParams.get('tenant_id'); // Assuming tenant_id is passed in the URL

if (userId && tenantId) {
  const functionResponse = await fetch('/functions/v1/accept-invitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, tenant_id: tenantId }),
  });

  if (!functionResponse.ok) {
    console.error('Failed to update invitation status via Edge Function.');
    // Log error but continue with success state
  }
}
// --- END NEW LOGIC ---
```

**Replace with**:
```typescript
// --- UPDATE INVITATION STATUS: Call database function ---
const { data: userData } = await supabase.auth.getUser();
const userId = userData.user?.id;
const userEmail = userData.user?.email;

if (userId && userEmail) {
  // Call the database function to update invitation status
  const { data: inviteResult, error: inviteError } = await supabase
    .rpc('accept_user_invitation', {
      p_user_id: userId,
      p_email: userEmail
    });

  if (inviteError) {
    console.error('Failed to update invitation status:', inviteError);
  } else if (inviteResult?.success) {
    // Update user metadata with tenant and role from invitation
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        tenant_id: inviteResult.tenant_id,
        role: inviteResult.role,
        invite_accepted: true,
        invite_accepted_at: new Date().toISOString()
      }
    });

    if (metadataError) {
      console.warn('Failed to update user metadata:', metadataError);
    }

    // Refresh session to ensure role is loaded
    await supabase.auth.refreshSession();
  }
}
// --- END UPDATE ---
```

### Step 3: Remove Failed API Route

Delete the problematic API route file:
```bash
rm frontend/src/app/api/user/accept-invite/route.ts
```

### Step 4: Test the Flow

1. **Create a test invitation**:
   - Log in as an admin user
   - Navigate to User Management
   - Invite a new user with admin role

2. **Accept the invitation**:
   - Open the invitation email
   - Click the invitation link
   - Set a password and full name
   - Submit the form

3. **Verify the results**:
   - Check that the invitation status updated to "accepted" in the database:
     ```sql
     SELECT * FROM user_invitations WHERE email = 'test@example.com';
     ```
   - Log in with the new account
   - Verify that admin users have full access to all features

### Step 5: Verify Database Changes

Run these verification queries in the Supabase SQL Editor:

```sql
-- Check if the function was created
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'accept_user_invitation';

-- Check pending invitations
SELECT id, email, status, role, tenant_id, created_at 
FROM user_invitations 
WHERE status = 'pending';

-- Check accepted invitations
SELECT id, email, status, role, tenant_id, accepted_at 
FROM user_invitations 
WHERE status = 'accepted'
ORDER BY accepted_at DESC;
```

## Alternative: Trigger-Based Approach

If you prefer a fully automated approach, uncomment the trigger code in the SQL file. This will automatically update invitation status whenever a user's metadata indicates they've accepted an invite.

**Pros**:
- Fully automatic, no client-side code needed
- Guaranteed to run on every metadata update

**Cons**:
- Less explicit control
- Harder to debug if issues arise

## Rollback Plan

If you need to rollback this change:

```sql
-- Drop the function
DROP FUNCTION IF EXISTS accept_user_invitation(UUID, TEXT);

-- Drop the trigger (if you enabled it)
DROP TRIGGER IF EXISTS trigger_auto_accept_invitation ON auth.users;
DROP FUNCTION IF EXISTS auto_accept_invitation();
```

## Security Considerations

- The function uses `SECURITY DEFINER` to run with elevated privileges
- Only authenticated users can execute the function (via `GRANT EXECUTE`)
- The function validates that an invitation exists before updating
- All database operations are transactional

## Troubleshooting

### Issue: Function not found
**Solution**: Verify the function was created by running:
```sql
SELECT proname FROM pg_proc WHERE proname = 'accept_user_invitation';
```

### Issue: Permission denied
**Solution**: Ensure the function has proper grants:
```sql
GRANT EXECUTE ON FUNCTION accept_user_invitation(UUID, TEXT) TO authenticated;
```

### Issue: Invitation status not updating
**Solution**: Check that the invitation exists and is in "pending" status:
```sql
SELECT * FROM user_invitations WHERE email = 'user@example.com';
```

## Next Steps After Implementation

1. Monitor the invitation acceptance flow for any errors
2. Check Supabase logs for any function execution errors
3. Verify that new admin users have proper access after login
4. Consider adding additional logging to track invitation acceptance metrics

## Files Included

- `accept_invitation_function.sql` - The database migration SQL
- `INVITATION_FIX_README.md` - This implementation guide

## Support

If you encounter any issues during implementation, check:
1. Supabase project logs (Dashboard → Logs)
2. Browser console for client-side errors
3. Database function execution logs
