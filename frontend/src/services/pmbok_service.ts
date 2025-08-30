import { createClient, SupabaseClient } from '@supabase/supabase-js'

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export interface Tenant {
  id: string
  name: string
  code: string
  tenant_type: 'host' | 'direct_client' | 'sub_customer'
  parent_tenant_id?: string
  contact_email: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface WorkRequest {
  id: string
  tenant_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  customer_id: string
  assigned_to?: string
  estimated_hours?: number
  actual_hours?: number
  budget?: number
  required_completion_date?: string
  scheduled_start_date?: string
  scheduled_end_date?: string
  actual_start_date?: string
  actual_completion_date?: string
  rejection_reason?: string
  internal_notes?: string
  customer_notes?: string
  tags?: string[]
  attachments?: any
  created_at: string
  updated_at: string
  request_id?: string
  // Computed fields for display
  customer_name?: string
  customer_email?: string
  submitted_at?: string
}

export interface ProjectCharter {
  id: string
  tenant_id: string
  project_code: string
  project_name: string
  business_case: string
  project_justification?: string
  success_criteria: string
  project_objectives: string
  measurable_objectives?: any
  project_scope?: string
  scope_inclusions?: string
  scope_exclusions?: string
  project_sponsor: string
  project_manager: string
  key_stakeholders?: any
  planned_start_date?: string
  planned_end_date?: string
  estimated_budget?: number
  approved_budget?: number
  charter_status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled' | 'on_hold' | 'planning' | 'archived'
  authorized_by?: string
  authorization_date?: string
  high_level_risks?: string
  key_assumptions?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface RiskRegister {
  id: string
  tenant_id: string
  project_id: string
  risk_code?: string
  risk_title: string
  risk_description: string
  risk_category: 'technical' | 'organizational' | 'external' | 'project_management'
  risk_source?: string
  probability_rating: number
  impact_rating: number
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  response_strategy: 'avoid' | 'mitigate' | 'transfer' | 'accept'
  response_actions?: string
  contingency_plan?: string
  risk_owner: string
  assigned_to?: string
  identified_date?: string
  target_resolution_date?: string
  actual_resolution_date?: string
  status: 'identified' | 'assessed' | 'mitigated' | 'resolved' | 'closed'
  last_review_date?: string
  next_review_date?: string
  review_notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

// =====================================================
// PMBOK SERVICE CLASS
// =====================================================

export class PMBOKService {
  private supabase: SupabaseClient
  private currentTenantId: string

  constructor(supabaseUrl?: string, supabaseKey?: string, tenantId?: string) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key are required. No mock data allowed.')
    }
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.currentTenantId = tenantId || '99883779-9517-4ca9-a3f8-7fdc59051f0e' // DEMO001 actual ID
  }

  // =====================================================
  // WORK REQUESTS
  // =====================================================

  async getWorkRequests(): Promise<WorkRequest[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Get work requests with customer information
    const { data, error } = await this.supabase
      .from('work_requests')
      .select(`
        *,
        customers:customer_id (
          company_name,
          contact_email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform data to match interface
    return (data || []).map(request => ({
      ...request,
      customer_name: request.customers?.company_name || 'Unknown Customer',
      customer_email: request.customers?.contact_email || '',
      submitted_at: request.created_at
    }))
  }

  async getProjectCharters(): Promise<ProjectCharter[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await this.supabase
      .from('project_charters')
      .select('*')
      .eq('tenant_id', this.currentTenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getRisksByProject(projectId?: string): Promise<RiskRegister[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    let query = this.supabase
      .from('risk_register')
      .select('*')
      .eq('tenant_id', this.currentTenantId)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // =====================================================
  // CRUD OPERATIONS (Placeholder implementations)
  // =====================================================

  async deleteWorkRequest(id: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await this.supabase
      .from('work_requests')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error
  }

  async updateWorkRequestStatus(id: string, status: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await this.supabase
      .from('work_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error
  }

  async updateProjectCharter(id: string, updates: Partial<ProjectCharter>): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await this.supabase
      .from('project_charters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error
  }

  async updateRisk(id: string, updates: Partial<RiskRegister>): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await this.supabase
      .from('risk_register')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

// Create singleton instance - requires environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN

if (!supabaseUrl || !supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_TOKEN environment variables are required')
}

export const pmbok = new PMBOKService(supabaseUrl, supabaseKey, '99883779-9517-4ca9-a3f8-7fdc59051f0e')

