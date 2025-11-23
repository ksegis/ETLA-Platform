import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all tenants the user has access to
    const { data: tenantUsers, error: tenantError } = await supabase
      .from('tenant_users')
      .select('tenant_id, role, tenants(id, name)')
      .eq('user_id', user.id)

    if (tenantError) {
      console.error('Error fetching tenant users:', tenantError)
      return NextResponse.json({ error: tenantError.message }, { status: 500 })
    }

    const userTenantIds = tenantUsers?.map(tu => tu.tenant_id) || []
    
    if (userTenantIds.length === 0) {
      return NextResponse.json({
        total_projects: 0,
        active_projects: 0,
        at_risk_projects: 0,
        total_budget: 0,
        budget_spent: 0,
        avg_completion: 0,
        sub_clients: []
      })
    }

    // Fetch all projects for these tenants
    const { data: projects, error: projectError } = await supabase
      .from('project_charters')
      .select(`
        *,
        tenants(id, name)
      `)
      .in('tenant_id', userTenantIds)

    if (projectError) {
      console.error('Error fetching projects:', projectError)
      return NextResponse.json({ error: projectError.message }, { status: 500 })
    }

    // Group projects by tenant
    const tenantProjects = new Map<string, any[]>()
    
    projects?.forEach(project => {
      const tenantId = project.tenant_id
      if (!tenantProjects.has(tenantId)) {
        tenantProjects.set(tenantId, [])
      }
      tenantProjects.get(tenantId)!.push(project)
    })

    // Calculate portfolio summary for each tenant
    const subClients = Array.from(tenantProjects.entries()).map(([tenantId, tenantProjectsList]) => {
      const tenant = tenantUsers?.find(tu => tu.tenant_id === tenantId)
      const activeCount = tenantProjectsList.filter(p => 
        p.health_status !== 'completed' && p.health_status !== 'cancelled'
      ).length
      const atRiskCount = tenantProjectsList.filter(p => p.health_status === 'red').length
      const totalBudget = tenantProjectsList.reduce((sum, p) => sum + (p.budget || 0), 0)
      const avgCompletion = tenantProjectsList.length > 0
        ? tenantProjectsList.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / tenantProjectsList.length
        : 0

      const projectSummaries = tenantProjectsList.map(p => ({
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
      }))

      return {
        tenant_id: tenantId,
        tenant_name: tenant?.tenants?.name || 'Unknown Tenant',
        project_count: tenantProjectsList.length,
        active_count: activeCount,
        at_risk_count: atRiskCount,
        total_budget: totalBudget,
        avg_completion: Math.round(avgCompletion),
        projects: projectSummaries
      }
    })

    // Calculate overall totals
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

    const portfolioData = {
      total_projects: totalProjects,
      active_projects: activeProjects,
      at_risk_projects: atRiskProjects,
      total_budget: totalBudget,
      budget_spent: budgetSpent,
      avg_completion: Math.round(avgCompletion),
      sub_clients: subClients
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
