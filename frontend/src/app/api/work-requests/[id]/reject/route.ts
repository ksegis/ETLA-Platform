import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's tenant and role
    const { data: tenantUser, error: tenantError } = await supabase
      .from('tenant_users')
      .select('role, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (tenantError || !tenantUser) {
      return NextResponse.json(
        { error: 'User tenant information not found' },
        { status: 403 }
      )
    }

    // RBAC Check: Only host_admin and program_manager can reject
    const allowedRoles = ['host_admin', 'program_manager']
    if (!allowedRoles.includes(tenantUser.role)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          message: 'Only Platform Host team members can reject work requests'
        },
        { status: 403 }
      )
    }

    // Get work request to verify it exists
    const { data: workRequest, error: fetchError } = await supabase
      .from('work_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !workRequest) {
      return NextResponse.json(
        { error: 'Work request not found' },
        { status: 404 }
      )
    }

    // Check if already approved or rejected
    if (workRequest.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot reject an approved work request' },
        { status: 400 }
      )
    }

    if (workRequest.status === 'rejected') {
      return NextResponse.json(
        { error: 'Work request is already rejected' },
        { status: 400 }
      )
    }

    // Update work request status to rejected
    const { data: updatedRequest, error: updateError } = await supabase
      .from('work_requests')
      .update({
        status: 'rejected',
        approval_status: 'rejected',
        rejection_reason: reason,
        decline_reason: reason, // Legacy field
        approved_by: user.id, // Track who rejected it
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating work request:', updateError)
      return NextResponse.json(
        { error: 'Failed to reject work request' },
        { status: 500 }
      )
    }

    // TODO: Send notification to requester with rejection reason
    // TODO: Create audit log entry

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: 'Work request rejected successfully'
    })

  } catch (error) {
    console.error('Error in reject endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
