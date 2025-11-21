import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Accept a user invitation and create all necessary records
 * This replaces the broken accept_user_invitation database function
 */
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing userId or email' 
      }, { status: 400 });
    }

    console.log(`[Accept Invitation] Processing for user: ${email} (${userId})`);

    // Step 1: Find pending invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('user_invitations')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (inviteError || !invitation) {
      console.error('[Accept Invitation] No pending invitation found:', inviteError);
      return NextResponse.json({ 
        success: false, 
        error: 'No pending invitation found for this email' 
      }, { status: 404 });
    }

    console.log(`[Accept Invitation] Found invitation:`, {
      id: invitation.id,
      role: invitation.role,
      role_level: invitation.role_level,
      tenant_id: invitation.tenant_id
    });

    // Step 2: Map role_level + role to correct tenant role
    let mappedRole = 'client_user'; // Default

    const roleLevel = (invitation.role_level || '').toLowerCase();
    const role = (invitation.role || '').toLowerCase();

    if (roleLevel === 'host') {
      mappedRole = 'host_admin';
    } else if (roleLevel === 'primary_client') {
      if (role === 'admin') mappedRole = 'primary_client_admin';
      else if (role === 'manager') mappedRole = 'program_manager';
      else if (role === 'user') mappedRole = 'client_user';
      else mappedRole = 'primary_client_admin'; // Default for primary_client
    } else if (roleLevel === 'sub_client') {
      if (role === 'admin') mappedRole = 'client_admin';
      else if (role === 'manager') mappedRole = 'program_manager';
      else if (role === 'user') mappedRole = 'client_user';
      else mappedRole = 'client_user'; // Default for sub_client
    }

    console.log(`[Accept Invitation] Mapped role: ${roleLevel} + ${role} → ${mappedRole}`);

    // Step 3: Create or update profile
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: authUser?.user?.user_metadata?.full_name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('[Accept Invitation] Profile creation failed:', profileError);
      // Don't fail the entire process for profile errors
    } else {
      console.log('[Accept Invitation] Profile created/updated');
    }

    // Step 4: Create tenant_users record (THE CRITICAL STEP)
    const { error: tenantUserError } = await supabaseAdmin
      .from('tenant_users')
      .upsert({
        user_id: userId,
        tenant_id: invitation.tenant_id,
        role: mappedRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,tenant_id'
      });

    if (tenantUserError) {
      console.error('[Accept Invitation] tenant_users creation FAILED:', tenantUserError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create tenant user: ${tenantUserError.message}` 
      }, { status: 500 });
    }

    console.log('[Accept Invitation] tenant_users record created successfully');

    // Step 5: Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from('user_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('[Accept Invitation] Failed to update invitation status:', updateError);
      // Don't fail - tenant_users is already created
    } else {
      console.log('[Accept Invitation] Invitation marked as accepted');
    }

    // Success!
    return NextResponse.json({ 
      success: true,
      data: {
        tenant_id: invitation.tenant_id,
        role: mappedRole,
        invitation_id: invitation.id
      }
    });

  } catch (error) {
    console.error('[Accept Invitation] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}
