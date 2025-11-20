import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('project_roadblocks')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching roadblocks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch roadblocks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in roadblocks GET route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get project details for tenant_id
    const { data: project } = await supabase
      .from('project_charters')
      .select('tenant_id')
      .eq('id', id)
      .single()

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const {
      title,
      description,
      severity,
      timeline_impact_days,
      budget_impact,
      resolution_plan,
      customer_visible
    } = body

    const { data, error } = await supabase
      .from('project_roadblocks')
      .insert({
        project_id: id,
        tenant_id: project.tenant_id,
        title,
        description,
        severity,
        status: 'open',
        timeline_impact_days: timeline_impact_days || 0,
        budget_impact: budget_impact || 0,
        resolution_plan,
        customer_visible: customer_visible !== false,
        notify_customer: severity === 'high' || severity === 'critical',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating roadblock:', error)
      return NextResponse.json(
        { error: 'Failed to create roadblock' },
        { status: 500 }
      )
    }

    // If customer-visible, create a notification
    if (customer_visible !== false) {
      await supabase
        .from('customer_project_notifications')
        .insert({
          project_id: id,
          tenant_id: project.tenant_id,
          notification_type: 'roadblock_added',
          title: `New Roadblock: ${title}`,
          message: description,
          severity: severity === 'critical' || severity === 'high' ? 'high' : 'medium',
          is_read: false,
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in roadblocks POST route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
