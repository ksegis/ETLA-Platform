import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { UserInvitationData } from '@/lib/supabase';

// Get environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_TOKEN || '';

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

    const invitationData: UserInvitationData = await request.json();

    const invitations = [];
    const errors = [];

    for (const email of invitationData.emails) {
      try {
        // Create invitation record
        const { data: invitation, error: inviteError } = await supabaseAdmin
          .from('user_invitations')
          .insert({
            email,
            role: invitationData.role,
            role_level: invitationData.role_level,
            tenant_id: invitationData.tenant_id,
            message: invitationData.message,
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

        // In a real implementation, you would send an email here
        // For now, we'll just create the invitation record
        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        
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

