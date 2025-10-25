import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Get environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_TOKEN || '';

// Only create admin client if both URL and key are available
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Handles resending user invitations.
 * If the user already exists in Supabase Auth, sends a password reset link instead.
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

    const { invitationId } = await request.json();

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('user_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error('API: Failed to get invitation:', invitationError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation not found' 
      }, { status: 404 });
    }

    // Get tenant details separately
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('name, type')
      .eq('id', invitation.tenant_id)
      .single();

    // Check if user already exists in Supabase Auth
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('API: Failed to list users:', listError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check user existence' 
      }, { status: 500 });
    }

    const existingUser = existingUsers.users.find(u => u.email === invitation.email);

    const tenantName = tenant?.name || 'the organization';
    const tenantType = tenant?.type || 'organization';

    if (existingUser) {
      // User exists - send password reset link instead
      console.log(`API: User ${invitation.email} already exists, sending password reset link`);
      
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
        invitation.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.helixbridge.cloud'}/auth/set-password`
        }
      );

      if (resetError) {
        console.error(`API: Failed to send password reset email for ${invitation.email}:`, resetError);
        return NextResponse.json({ 
          success: false, 
          error: resetError.message 
        }, { status: 400 });
      }

      // Update invitation status
      await supabaseAdmin
        .from('user_invitations')
        .update({ 
          status: 'resent',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      return NextResponse.json({ 
        success: true,
        message: 'Password reset email sent successfully',
        method: 'password_reset'
      });
    } else {
      // User doesn't exist - send fresh invitation
      console.log(`API: Resending invitation to ${invitation.email}`);
      
      const { error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        invitation.email,
        {
          data: {
            role: invitation.role,
            role_level: invitation.role_level,
            tenant_id: invitation.tenant_id,
            tenant_name: tenantName,
            tenant_type: tenantType,
            invitation_id: invitation.id,
            custom_message: invitation.message
          },
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.helixbridge.cloud'}/auth/set-password`
        }
      );

      if (authError) {
        console.error(`API: Failed to resend invitation for ${invitation.email}:`, authError);
        return NextResponse.json({ 
          success: false, 
          error: authError.message 
        }, { status: 400 });
      }

      // Update invitation status
      await supabaseAdmin
        .from('user_invitations')
        .update({ 
          status: 'resent',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      return NextResponse.json({ 
        success: true,
        message: 'Invitation resent successfully',
        method: 'invitation'
      });
    }
  } catch (error) {
    console.error('API: Resend Invitation Unexpected Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred while resending invitation.' 
    }, { status: 500 });
  }
}

