import { createClient, SupabaseClient } from '@supabase/supabase-js'

// =====================================================
// TYPESCRIPT INTERFACES (Same as before)
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
// DEBUG PMBOK SERVICE CLASS
// =====================================================

export class PMBOKService {
  private supabase: SupabaseClient
  private currentTenantId: string

  constructor(supabaseUrl?: string, supabaseKey?: string, tenantId?: string) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key are required. No mock data allowed.')
    }
    console.log('🔧 Initializing PMBOK Service with:', { supabaseUrl, tenantId })
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.currentTenantId = tenantId || '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
    console.log('✅ PMBOK Service initialized with tenant:', this.currentTenantId)
  }

  // =====================================================
  // DEBUG WORK REQUESTS METHOD
  // =====================================================

  async getWorkRequests(): Promise<WorkRequest[]> {
    console.log('🔍 Starting getWorkRequests...')
    console.log('🏢 Using tenant ID:', this.currentTenantId)
    
    if (!this.supabase) {
      console.error('❌ Supabase client not initialized')
      throw new Error('Supabase client not initialized')
    }

    try {
      // Step 1: Test basic connection
      console.log('🔌 Testing Supabase connection...')
      const { data: testData, error: testError } = await Promise.race([
        this.supabase.from('work_requests').select('count', { count: 'exact', head: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
      ]) as any
      
      if (testError) {
        console.error('❌ Connection test failed:', testError)
        throw testError
      }
      console.log('✅ Connection test passed, total rows:', testData)

      // Step 2: Test simple query without joins
      console.log('📊 Fetching work requests (simple query)...')
      const { data: simpleData, error: simpleError } = await Promise.race([
        this.supabase
          .from('work_requests')
          .select('*')
          .eq('tenant_id', this.currentTenantId)
          .order('created_at', { ascending: false })
          .limit(10), // Limit for debugging
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 10000))
      ]) as any

      if (simpleError) {
        console.error('❌ Simple query failed:', simpleError)
        throw simpleError
      }

      console.log('✅ Simple query succeeded, found', simpleData?.length || 0, 'work requests')
      console.log('📋 Sample data:', simpleData?.[0])

      // Step 3: Try to get customer names (if simple query worked)
      if (simpleData && simpleData.length > 0) {
        console.log('👥 Attempting to fetch customer information...')
        
        try {
          const { data: profileData, error: profileError } = await Promise.race([
            this.supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', simpleData.map((r: any: any) => r.customer_id).filter(Boolean))
              .limit(10),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile query timeout')), 5000))
          ]) as any

          if (profileError) {
            console.warn('⚠️ Profile query failed, using fallback:', profileError)
          } else {
            console.log('✅ Profile query succeeded, found', profileData?.length || 0, 'profiles')
            
            // Create a map for quick lookup
            const profileMap = new Map(profileData?.map((p: any: any) => [p.id, p.full_name]) || [])
            
            // Transform data with customer names
            const transformedData = simpleData.map((request: any: any) => ({
              ...request,
              customer_name: profileMap.get(request.customer_id) || 'Unknown Customer',
              customer_email: '', // profiles table doesn't have email
              submitted_at: request.created_at
            }))

            console.log('✅ Data transformation completed successfully')
            return transformedData
          }
        } catch (profileErr) {
          console.warn('⚠️ Profile lookup failed, using fallback names:', profileErr)
        }
      }

      // Fallback: Return simple data without customer names
      const fallbackData = (simpleData || []).map((request: any: any) => ({
        ...request,
        customer_name: 'Customer ID: ' + request.customer_id,
        customer_email: '',
        submitted_at: request.created_at
      }))

      console.log('✅ Returning fallback data with', fallbackData.length, 'records')
      return fallbackData

    } catch (error) {
      console.error('❌ getWorkRequests failed:', error)
      console.error('🔍 Error details:', {
        message: (error as any).message,
        stack: (error as any).stack,
        tenantId: this.currentTenantId
      })
      throw error
    }
  }

  // =====================================================
  // SIMPLIFIED OTHER METHODS
  // =====================================================

  async getProjectCharters(): Promise<ProjectCharter[]> {
    console.log('📊 Fetching project charters...')
    
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await Promise.race([
        this.supabase
          .from('project_charters')
          .select('*')
          .eq('tenant_id', this.currentTenantId)
          .order('created_at', { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Project charters timeout')), 10000))
      ]) as any

      if (error) {
        console.error('❌ Project charters query failed:', error)
        throw error
      }

      console.log('✅ Project charters fetched:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ getProjectCharters failed:', error)
      throw error
    }
  }

  async getRisksByProject(projectId?: string): Promise<RiskRegister[]> {
    console.log('🛡️ Fetching risks...')
    
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

      const { data, error } = await Promise.race([
        query.order('created_at', { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Risks timeout')), 10000))
      ]) as any

      if (error) {
        console.error('❌ Risks query failed:', error)
        throw error
      }

      console.log('✅ Risks fetched:', data?.length || 0)
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
  // PLACEHOLDER APPROVAL METHODS (for compatibility)
  // =====================================================

  async approveWorkRequest(workRequestId: string, approvedByUserId: string, projectName?: string, projectDescription?: string): Promise<string> {
    console.log('⏳ approveWorkRequest called - placeholder implementation')
    throw new Error('Approval workflow not implemented in debug version')
  }

  async declineWorkRequest(workRequestId: string, declinedByUserId: string, declineReason: string): Promise<boolean> {
    console.log('⏳ declineWorkRequest called - placeholder implementation')
    throw new Error('Approval workflow not implemented in debug version')
  }

  async setWorkRequestUnderReview(workRequestId: string, reviewedByUserId: string): Promise<boolean> {
    console.log('⏳ setWorkRequestUnderReview called - placeholder implementation')
    throw new Error('Approval workflow not implemented in debug version')
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN

console.log('🔧 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing'
})

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_TOKEN environment variables are required')
}

export const pmbok = new PMBOKService(supabaseUrl, supabaseKey, '54afbd1d-e72a-41e1-9d39-2c8a08a257ff')

