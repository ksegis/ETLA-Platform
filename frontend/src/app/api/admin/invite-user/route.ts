import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { UserInvitationData } from '@/lib/supabase';

// Get environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_TOKEN || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN || '';

// Only create admin client if both URL and key are available
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Handles sending user invitations via email.
 * This is a server-side operation using the Service Role Key.
 * @param request The incoming Next.js request
 * @returns A JSON response indicating success or failure
 */
export async function POST(request: Request) {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('API: Supabase admin client not configured. Missing SUPABASE_SERVICE_ROLE_TOKEN.');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error: Admin client not available' 
      }, { status: 500 });
    }

    // Get the current user from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify the user with admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      console.error('API: Failed to get current user:', userError);
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const invitationData: UserInvitationData = await request.json();

    const invitations = [];
    const errors = [];

    // For host admins, if no tenant_id provided, use the first available tenant
    // (Host admins have access to all tenants via RLS policies)
    let effectiveTenantId = invitationData.tenant_id;
    
    if (!effectiveTenantId && invitationData.role_level === 'host') {
      const { data: firstTenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .limit(1)
        .single();
      
      if (firstTenant) {
        effectiveTenantId = firstTenant.id;
        console.log(`API: Host admin invitation - using first tenant ${effectiveTenantId}`);
      }
    }

    // Fetch tenant name
    const { data: tenant, error: tenantError } = effectiveTenantId
      ? await supabaseAdmin
          .from('tenants')
          .select('name, type')
          .eq('id', effectiveTenantId)
          .single()
      : { data: null, error: null };

    const tenantName = tenant?.name || 'HelixBridge';
    const tenantType = tenant?.type || 'organization';

    for (const email of invitationData.emails) {
      try {
        // Create invitation record
        const { data: invitation, error: inviteError } = await supabaseAdmin
          .from('user_invitations')
          .insert({
            email,
            role: invitationData.role,
            role_level: invitationData.role_level,
            tenant_id: effectiveTenantId,
            message: invitationData.message,
            invited_by: user.id, // Add the current user's ID
            expires_at: new Date(Date.now() + invitationData.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (inviteError) {
          console.error(`API: Failed to create invitation for ${email}:`, inviteError);
          errors.push({ email, error: inviteError.message });
          continue;
        }

        // Use Supabase Auth to invite the user and send email
        const { data: authInvite, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          email,
          {
            data: {
              role: invitationData.role,
              role_level: invitationData.role_level,
              tenant_id: effectiveTenantId,
              tenant_name: tenantName,
              tenant_type: tenantType,
              invitation_id: invitation.id,
              custom_message: invitationData.message,
              is_host_admin: invitationData.role_level === 'host'
            },
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.helixbridge.cloud'}/auth/set-password`
          }
        );

        if (authError) {
          console.error(`API: Failed to send auth invitation for ${email}:`, authError);
          // Delete the invitation record if auth invite fails
          await supabaseAdmin.from('user_invitations').delete().eq('id', invitation.id);
          errors.push({ email, error: authError.message });
          continue;
        }

        console.log(`API: Successfully invited ${email}`);
        invitations.push(invitation);
      } catch (error) {
        console.error(`API: Unexpected error inviting ${email}:`, error);
        errors.push({ email, error: 'Unexpected error' });
      }
    }

    if (invitations.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create any invitations',
        errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        invitations,
        total: invitationData.emails.length,
        successful: invitations.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('API: Invite User Unexpected Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred during invitation creation.' 
    }, { status: 500 });
  }
}

