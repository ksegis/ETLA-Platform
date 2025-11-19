import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_TOKEN || '';

// Create the server-side Supabase client
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase configuration error' },
        { status: 500 }
      );
    }

    const { token, userId } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Verify the invitation token exists and is valid
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('user_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }

    // Update the tenant_users table with the accepted invitation
    const { error: updateError } = await supabaseAdmin
      .from('tenant_users')
      .update({
        status: 'active',
        role: invitation.role,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('tenant_id', invitation.tenant_id);

    if (updateError) {
      console.error('Error updating tenant user:', updateError);
      return NextResponse.json(
        { error: 'Failed to activate user account' },
        { status: 500 }
      );
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabaseAdmin
      .from('user_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('token', token);

    if (acceptError) {
      console.error('Error updating invitation status:', acceptError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Invitation accepted successfully',
        tenantId: invitation.tenant_id,
        role: invitation.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}