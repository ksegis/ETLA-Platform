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
// SIMPLE PMBOK SERVICE CLASS
// =====================================================

export class PMBOKService {
  private supabase: SupabaseClient
  private currentTenantId: string

  constructor(supabaseUrl?: string, supabaseKey?: string, tenantId?: string) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key are required. No mock data allowed.')
    }
    console.log('🔧 Initializing PMBOK Service...')
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.currentTenantId = tenantId || '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
    console.log('✅ PMBOK Service initialized with tenant:', this.currentTenantId)
  }

  // =====================================================
  // SIMPLIFIED WORK REQUESTS METHOD
  // =====================================================

  async getWorkRequests(): Promise<WorkRequest[]> {
    console.log('🔍 Loading work requests from database...')
    console.log('🏢 Tenant ID:', this.currentTenantId)
    
    if (!this.supabase) {
      console.error('❌ Supabase client not initialized')
      throw new Error('Supabase client not initialized')
    }

    try {
      // Simple query without complex timeout handling
      console.log('📊 Executing work requests query...')
      const { data, error } = await this.supabase
        .from('work_requests')
        .select('*')
        .eq('tenant_id', this.currentTenantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Work requests query failed:', error)
        throw error
      }

      console.log('✅ Work requests query succeeded, found:', data?.length || 0, 'records')

      if (!data || data.length === 0) {
        console.log('📝 No work requests found for tenant:', this.currentTenantId)
        return []
      }

      // Log sample data
      console.log('📋 Sample work request:', data[0])

      // Try to get customer names
      console.log('👥 Fetching customer information...')
      const customerIds = data.map((r: any: any) => r.customer_id).filter(Boolean)
      console.log('🔍 Customer IDs to lookup:', customerIds)

      let profileMap = new Map()

      if (customerIds.length > 0) {
        try {
          const { data: profiles, error: profileError } = await this.supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', customerIds)

          if (profileError) {
            console.warn('⚠️ Profile query failed:', profileError)
          } else {
            console.log('✅ Profile query succeeded, found:', profiles?.length || 0, 'profiles')
            profileMap = new Map(profiles?.map((p: any: any) => [p.id, p.full_name]) || [])
          }
        } catch (profileErr) {
          console.warn('⚠️ Profile lookup error:', profileErr)
        }
      }

      // Transform data
      const transformedData = data.map((request: any: any) => ({
        ...request,
        customer_name: profileMap.get(request.customer_id) || `Customer ${request.customer_id}`,
        customer_email: '',
        submitted_at: request.created_at
      }))

      console.log('✅ Data transformation completed, returning', transformedData.length, 'records')
      return transformedData

    } catch (error) {
      console.error('❌ getWorkRequests failed:', error)
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.currentTenantId
      })
      throw error
    }
  }

  // =====================================================
  // SIMPLIFIED OTHER METHODS
  // =====================================================

  async getProjectCharters(): Promise<ProjectCharter[]> {
    console.log('📊 Loading project charters...')
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('project_charters')
        .select('*')
        .eq('tenant_id', this.currentTenantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Project charters query failed:', error)
        throw error
      }

      console.log('✅ Project charters loaded:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ getProjectCharters failed:', error)
      throw error
    }
  }

  async getRisksByProject(projectId?: string): Promise<RiskRegister[]> {
    console.log('🛡️ Loading risks...')
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      let query = this.supabase
        .from('risk_register')
        .select('*')
        .eq('tenant_id', this.currentTenantId)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Risks query failed:', error)
        throw error
      }

      console.log('✅ Risks loaded:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ getRisksByProject failed:', error)
      throw error
    }
  }

  // =====================================================
  // BASIC CRUD OPERATIONS
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
  // SIMPLIFIED APPROVAL WORKFLOW METHODS
  // =====================================================

  async approveWorkRequest(workRequestId: string, approvedByUserId: string, projectName?: string, projectDescription?: string): Promise<string> {
    console.log('✅ Approving work request:', workRequestId)
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Simple approval - just update the status
    const { error } = await this.supabase
      .from('work_requests')
      .update({ 
        approval_status: 'approved',
        approved_by: approvedByUserId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', workRequestId)
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error

    console.log('✅ Work request approved successfully')
    return 'approved-' + workRequestId
  }

  async declineWorkRequest(workRequestId: string, declinedByUserId: string, declineReason: string): Promise<boolean> {
    console.log('❌ Declining work request:', workRequestId)
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await this.supabase
      .from('work_requests')
      .update({ 
        approval_status: 'declined',
        decline_reason: declineReason,
        reviewed_by: declinedByUserId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', workRequestId)
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error

    console.log('✅ Work request declined successfully')
    return true
  }

  async setWorkRequestUnderReview(workRequestId: string, reviewedByUserId: string): Promise<boolean> {
    console.log('👀 Setting work request under review:', workRequestId)
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await this.supabase
      .from('work_requests')
      .update({ 
        approval_status: 'under_review',
        reviewed_by: reviewedByUserId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', workRequestId)
      .eq('tenant_id', this.currentTenantId)

    if (error) throw error

    console.log('✅ Work request set under review successfully')
    return true
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN

console.log('🔧 Environment variables check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey
})

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_TOKEN environment variables are required')
}

export const pmbok = new PMBOKService(supabaseUrl, supabaseKey, '54afbd1d-e72a-41e1-9d39-2c8a08a257ff')

