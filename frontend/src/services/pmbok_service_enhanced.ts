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
  approval_status?: 'submitted' | 'under_review' | 'approved' | 'declined' | 'converted_to_project'
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
  decline_reason?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
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
    this.currentTenantId = tenantId || '54afbd1d-e72a-41e1-9d39-2c8a08a257ff' // Tenant with actual work requests
  }

  // =====================================================
  // WORK REQUESTS
  // =====================================================

  async getWorkRequests(): Promise<WorkRequest[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Get work requests with profile information - customer_id references profiles.id
    const { data, error } = await this.supabase
      .from('work_requests')
      .select(`
        *,
        profiles:customer_id (
          full_name,
          department,
          job_title
        )
      `)
      .eq('tenant_id', this.currentTenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform data to match interface using profiles data
    return (data || []).map((request: any) => ({
      ...request,
      customer_name: request.profiles?.full_name || 'Unknown Customer',
      customer_email: '', // profiles table doesn't have email
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
  // CRUD OPERATIONS
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

  // =====================================================
  // APPROVAL WORKFLOW METHODS
  // =====================================================

  async approveWorkRequest(workRequestId: string, approvedByUserId: string, projectName?: string, projectDescription?: string): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .rpc('approve_work_request_and_create_project', {
          work_request_id: workRequestId,
          approved_by_user_id: approvedByUserId,
          project_name: projectName,
          project_description: projectDescription
        });

      if (error) throw error;
      return data; // Returns the new project ID
    } catch (error) {
      console.error('Error approving work request:', error);
      throw error;
    }
  }

  async declineWorkRequest(workRequestId: string, declinedByUserId: string, declineReason: string): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .rpc('decline_work_request', {
          work_request_id: workRequestId,
          declined_by_user_id: declinedByUserId,
          decline_reason: declineReason
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error declining work request:', error);
      throw error;
    }
  }

  async setWorkRequestUnderReview(workRequestId: string, reviewedByUserId: string): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .rpc('set_work_request_under_review', {
          work_request_id: workRequestId,
          reviewed_by_user_id: reviewedByUserId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting work request under review:', error);
      throw error;
    }
  }

  // Get projects created from work requests
  async getProjectsFromWorkRequests(): Promise<any[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('project_charters')
        .select(`
          *,
          source_work_request:work_requests(
            id,
            title,
            description,
            category,
            priority
          )
        `)
        .eq('tenant_id', this.currentTenantId)
        .not('source_work_request_id', 'is', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects from work requests:', error);
      throw error;
    }
  }

  // Get work request with project information
  async getWorkRequestWithProject(workRequestId: string): Promise<any> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('vw_work_requests_with_projects')
        .select('*')
        .eq('id', workRequestId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching work request with project:', error);
      throw error;
    }
  }

  // =====================================================
  // ADDITIONAL HELPER METHODS
  // =====================================================

  async createWorkRequest(workRequest: Partial<WorkRequest>): Promise<WorkRequest> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await this.supabase
      .from('work_requests')
      .insert([{
        ...workRequest,
        tenant_id: this.currentTenantId,
        status: 'submitted',
        approval_status: 'submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createProjectCharter(charter: Partial<ProjectCharter>): Promise<ProjectCharter> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await this.supabase
      .from('project_charters')
      .insert([{
        ...charter,
        tenant_id: this.currentTenantId,
        charter_status: charter.charter_status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createRisk(risk: Partial<RiskRegister>): Promise<RiskRegister> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await this.supabase
      .from('risk_register')
      .insert([{
        ...risk,
        tenant_id: this.currentTenantId,
        status: risk.status || 'identified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get work request statistics
  async getWorkRequestStats(): Promise<{
    total: number
    pending: number
    approved: number
    declined: number
    converted: number
  }> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await this.supabase
      .from('work_requests')
      .select('approval_status, status')
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error

    const requests = data || []
    return {
      total: requests.length,
      pending: requests.filter((r) => 
        r.approval_status === 'submitted' || 
        r.approval_status === 'under_review' ||
        r.status === 'submitted' || 
        r.status === 'under_review'
      ).length,
      approved: requests.filter((r) => 
        r.approval_status === 'approved' || 
        r.status === 'approved'
      ).length,
      declined: requests.filter((r) => 
        r.approval_status === 'declined'
      ).length,
      converted: requests.filter((r) => 
        r.approval_status === 'converted_to_project'
      ).length
    }
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

export const pmbok = new PMBOKService(supabaseUrl, supabaseKey, '54afbd1d-e72a-41e1-9d39-2c8a08a257ff')

