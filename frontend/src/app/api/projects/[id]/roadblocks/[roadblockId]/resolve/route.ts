import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roadblockId: string }> }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { id, roadblockId } = await params
    const body = await request.json()
    const { resolution_notes } = body

    // Update roadblock status to resolved
    const { data, error } = await supabase
      .from('project_roadblocks')
      .update({
        status: 'resolved',
        resolution_notes,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', roadblockId)
      .eq('project_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error resolving roadblock:', error)
      return NextResponse.json(
        { error: 'Failed to resolve roadblock' },
        { status: 500 }
      )
    }

    // If customer-visible, create a notification
    if (data.customer_visible) {
      await supabase
        .from('customer_project_notifications')
        .insert({
          project_id: id,
          tenant_id: data.tenant_id,
          notification_type: 'roadblock_resolved',
          title: `Roadblock Resolved: ${data.title}`,
          message: resolution_notes,
          severity: 'low',
          is_read: false,
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in resolve roadblock route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
