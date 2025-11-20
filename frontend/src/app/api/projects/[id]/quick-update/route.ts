import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const {
      health_status,
      health_status_explanation,
      completion_percentage,
      budget_variance_percentage,
      timeline_variance_days,
      next_customer_action
    } = body

    // Update project charter with new values
    const { data, error } = await supabase
      .from('project_charters')
      .update({
        health_status,
        health_status_explanation,
        completion_percentage,
        budget_variance_percentage,
        timeline_variance_days,
        next_customer_action,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    // Create a status update entry for the activity feed
    await supabase
      .from('project_status_updates')
      .insert({
        project_id: id,
        tenant_id: data.tenant_id,
        update_type: 'status_change',
        title: 'Project Status Updated',
        description: health_status_explanation,
        customer_visible: true,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in quick-update route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
