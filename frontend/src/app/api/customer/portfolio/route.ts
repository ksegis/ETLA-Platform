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
    // Call the database function to get portfolio summary
    const { data, error } = await supabase
      .rpc('get_customer_portfolio_summary', {
        p_customer_tenant_id: tenantId
      })

    if (error) {
      console.error('Error fetching portfolio:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no data returned, create empty structure
    if (!data || data.length === 0) {
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

    // Transform the data into the expected format
    const portfolioData = {
      total_projects: data[0]?.total_projects || 0,
      active_projects: data[0]?.active_projects || 0,
      at_risk_projects: data[0]?.at_risk_projects || 0,
      total_budget: data[0]?.total_budget || 0,
      budget_spent: data[0]?.budget_spent || 0,
      avg_completion: data[0]?.avg_completion || 0,
      sub_clients: data[0]?.sub_clients || []
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
