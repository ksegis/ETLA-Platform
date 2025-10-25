import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { UserCreationData } from '@/lib/supabase';

// Get environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_TOKEN || '';

// Only create admin client if both URL and key are available
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Handles the creation of a new user with complete RBAC setup.
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

    const userData: UserCreationData = await request.json();

    // 1. First, create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
        role_level: userData.role_level
      }
    });

    if (authError) {
      console.error('API: Create User Auth Error:', authError);
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ success: false, error: 'Failed to create user account' }, { status: 500 });
    }

    const userId = authData.user.id;

    // 2. Create the user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        department: userData.department,
        job_title: userData.job_title,
        role: userData.role,
        role_level: userData.role_level,
        tenant_id: userData.tenant_id,
        is_active: true,
        can_invite_users: userData.can_invite_users,
        can_manage_sub_clients: userData.can_manage_sub_clients,
        permission_scope: userData.permission_scope,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // If profile creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('API: Create User Profile Error:', profileError);
      return NextResponse.json({ success: false, error: `Profile creation failed: ${profileError.message}` }, { status: 500 });
    }

    // 3. Create tenant_users record for RBAC
    const { error: tenantUserError } = await supabaseAdmin
      .from('tenant_users')
      .insert({
        tenant_id: userData.tenant_id,
        user_id: userId,
        role: userData.role,
        role_level: userData.role_level,
        can_invite_users: userData.can_invite_users,
        can_manage_sub_clients: userData.can_manage_sub_clients,
        permission_scope: userData.permission_scope,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (tenantUserError) {
      // If tenant_users creation fails, clean up auth user and profile
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      console.error('API: Create User Tenant User Error:', tenantUserError);
      return NextResponse.json({ success: false, error: `Tenant assignment failed: ${tenantUserError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: authData.user });
  } catch (error) {
    console.error('API: Create User Unexpected Error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred during user creation.' }, { status: 500 });
  }
}

