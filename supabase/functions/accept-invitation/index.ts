import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { user_id, tenant_id } = await req.json()

    if (!user_id || !tenant_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id or tenant_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with the Service Role Key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Update the user_invitations table status to 'accepted'
    const { error: updateError } = await supabaseClient
      .from('user_invitations')
      .update({ status: 'accepted' })
      .eq('tenant_id', tenant_id)
      .eq('invited_user_id', user_id)

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update invitation status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Insert the user into the tenant_users table (if not already there)
    // This is the core provisioning step
    const { error: insertError } = await supabaseClient
      .from('tenant_users')
      .insert({
        tenant_id: tenant_id,
        user_id: user_id,
        role: 'host_admin', // Assuming the invited user is a host_admin for the new tenant
      })
      .select()
      .maybeSingle()

    if (insertError && insertError.code !== '23505') { // 23505 is duplicate key error, which is fine
      console.error('Supabase insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to provision user to tenant' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('General error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
