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
  category: string
  customer_name: string
  customer_email: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'submitted' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled'
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface ProjectCharter {
  id: string
  tenant_id: string
  project_code: string
  project_name: string
  project_sponsor: string
  project_manager: string
  business_case: string
  project_objectives: string
  success_criteria: string
  budget?: number
  start_date?: string
  end_date?: string
  status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled' | 'on_hold' | 'planning' | 'archived'
  created_at: string
  updated_at: string
}

export interface RiskRegister {
  id: string
  tenant_id: string
  project_id: string
  risk_description: string
  risk_category: 'technical' | 'organizational' | 'external' | 'project_management'
  probability_score: number
  impact_score: number
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  response_strategy: 'avoid' | 'mitigate' | 'transfer' | 'accept'
  mitigation_plan?: string
  owner: string
  status: 'identified' | 'assessed' | 'mitigated' | 'resolved' | 'closed'
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
    this.currentTenantId = tenantId || 'DEMO001'
  }

  // =====================================================
  // WORK REQUESTS
  // =====================================================

  async getWorkRequests(): Promise<WorkRequest[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await this.supabase
      .from('work_requests')
      .select('*')
      .eq('tenant_id', this.currentTenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
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

export const pmbok = new PMBOKService(supabaseUrl, supabaseKey, 'DEMO001')

