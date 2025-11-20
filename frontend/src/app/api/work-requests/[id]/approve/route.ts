import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // RBAC Check: Only host_admin and program_manager can approve
    const allowedRoles = ['host_admin', 'program_manager']
    if (!allowedRoles.includes(tenantUser.role)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          message: 'Only Platform Host team members can approve work requests'
        },
        { status: 403 }
      )
    }

    // Await params in Next.js 15
    const { id } = await params

    // Get work request to verify it exists
    const { data: workRequest, error: fetchError } = await supabase
      .from('work_requests')
      .select('*')
      .eq('id', id)
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
        { error: 'Work request is already approved' },
        { status: 400 }
      )
    }

    if (workRequest.status === 'rejected') {
      return NextResponse.json(
        { error: 'Work request is already rejected' },
        { status: 400 }
      )
    }

    // Update work request status to approved
    const { data: updatedRequest, error: updateError } = await supabase
      .from('work_requests')
      .update({
        status: 'approved',
        approval_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating work request:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve work request' },
        { status: 500 }
      )
    }

    // TODO: Send notification to requester
    // TODO: Create audit log entry

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: 'Work request approved successfully'
    })

  } catch (error) {
    console.error('Error in approve endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
