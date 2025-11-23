import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!
  )

  const searchParams = request.nextUrl.searchParams
  const tenantId = searchParams.get('tenant_id')

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
  }

  try {
    // Fetch all projects for the tenant
    const { data: projects, error } = await supabase
      .from('project_charters')
      .select('*')
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate portfolio summary
    const totalProjects = projects?.length || 0
    const activeProjects = projects?.filter(p => 
      p.health_status !== 'completed' && p.health_status !== 'cancelled'
    ).length || 0
    const atRiskProjects = projects?.filter(p => p.health_status === 'red').length || 0
    const totalBudget = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0
    const budgetSpent = projects?.reduce((sum, p) => sum + (p.budget_spent || 0), 0) || 0
    const avgCompletion = totalProjects > 0
      ? projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / totalProjects
      : 0

    // Transform projects into portfolio format
    const portfolioProjects = projects?.map(p => ({
      id: p.id,
      project_name: p.project_name || p.title || 'Untitled Project',
      project_code: p.project_code || 'N/A',
      health_status: p.health_status || 'yellow',
      completion_percentage: p.completion_percentage || 0,
      budget: p.budget || 0,
      budget_spent: p.budget_spent || 0,
      start_date: p.start_date || p.created_at,
      end_date: p.end_date || p.target_completion_date,
      next_milestone: p.next_milestone || 'No milestone set',
      at_risk: p.health_status === 'red'
    })) || []

    const portfolioData = {
      total_projects: totalProjects,
      active_projects: activeProjects,
      at_risk_projects: atRiskProjects,
      total_budget: totalBudget,
      budget_spent: budgetSpent,
      avg_completion: Math.round(avgCompletion),
      sub_clients: [{
        tenant_id: tenantId,
        tenant_name: 'Current Tenant',
        project_count: totalProjects,
        active_count: activeProjects,
        at_risk_count: atRiskProjects,
        total_budget: totalBudget,
        avg_completion: Math.round(avgCompletion),
        projects: portfolioProjects
      }]
    }

    return NextResponse.json(portfolioData)
  } catch (error: any) {
    console.error('Error in portfolio API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
