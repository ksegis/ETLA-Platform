import { supabase } from '@/lib/supabase'

// Enhanced WorkRequest interface with approval workflow fields
export interface WorkRequest {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'declined' | 'in_progress' | 'completed' | 'cancelled'
  approval_status?: 'submitted' | 'under_review' | 'approved' | 'declined' | 'converted_to_project'
  decline_reason?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
  customer_id: string
  customer_name?: string
  requested_by: string
  requested_by_name?: string
  created_at: string
  updated_at: string
  due_date?: string
  estimated_hours?: number
  estimated_cost?: number
  actual_hours?: number
  actual_cost?: number
  tenant_id: string
  category?: string
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  business_justification?: string
  expected_benefits?: string
  risk_assessment?: string
  resource_requirements?: string
  stakeholders?: string[]
  attachments?: string[]
  comments?: Array<{
    id: string
    content: string
    author: string
    created_at: string
  }>
}

export interface ProjectCharter {
  id: string
  work_request_id?: string
  title: string
  description: string
  objectives: string[]
  scope: string
  deliverables: string[]
  success_criteria: string[]
  assumptions: string[]
  constraints: string[]
  risks: string[]
  stakeholders: Array<{
    name: string
    role: string
    responsibility: string
    contact: string
  }>
  timeline: {
    start_date: string
    end_date: string
    milestones: Array<{
      name: string
      date: string
      description: string
    }>
  }
  budget: {
    total_budget: number
    labor_cost: number
    material_cost: number
    other_costs: number
  }
  project_manager: string
  sponsor: string
  status: 'draft' | 'approved' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  tenant_id: string
}

export interface Risk {
  id: string
  project_id?: string
  work_request_id?: string
  title: string
  description: string
  category: 'technical' | 'business' | 'operational' | 'financial' | 'legal' | 'external'
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  risk_score: number
  mitigation_strategy: string
  contingency_plan: string
  owner: string
  status: 'identified' | 'assessed' | 'mitigated' | 'closed' | 'occurred'
  created_at: string
  updated_at: string
  tenant_id: string
}

class PMBOKService {
  private supabase
  private currentUserId: string | null = null
  private currentTenantId: string = '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
  private isInitialized: boolean = false

  constructor() {
    // Use singleton Supabase client
    this.supabase = supabase
    console.log('🔧 PMBOK Service: Created with default demo context')
  }

  // Get current user ID from auth context
  private getCurrentUserId(): string | null {
    // First check if we have a cached user ID
    if (this.currentUserId) {
      return this.currentUserId
    }
    
    // Otherwise get from auth context
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('etla-auth-context')
        if (authData) {
          const context = JSON.parse(authData)
          return context.userId
        }
      } catch (error) {
        console.warn('Failed to get user ID from auth context:', error)
      }
    }
    return null
  }

  async initialize(userId?: string, tenantId?: string) {
    if (userId && tenantId) {
      this.currentUserId = userId
      this.currentTenantId = tenantId
      this.isInitialized = true
      console.log('✅ PMBOK Service: Initialized with user context:', { userId, tenantId })
    } else {
      console.log('⚠️ PMBOK Service: Using demo context - no user/tenant provided')
    }
  }

  // Update user context when auth changes
  updateUserContext(userId: string, tenantId: string) {
    if (this.currentUserId !== userId || this.currentTenantId !== tenantId) {
      console.log('🔄 PMBOK Service: Updating user context:', { 
        from: { userId: this.currentUserId, tenantId: this.currentTenantId },
        to: { userId, tenantId }
      })
      this.currentUserId = userId
      this.currentTenantId = tenantId
      this.isInitialized = true
    }
  }

  // Helper function to handle missing customers gracefully
  private async handleMissingCustomers(workRequests: any[]): Promise<WorkRequest[]> {
    const customerIds = Array.from(new Set(workRequests.map(wr => wr.customer_id).filter(Boolean)))
    
    if (customerIds.length === 0) {
      console.log('⚠️ No customer IDs found in work requests')
      return workRequests.map(wr => ({
        ...wr,
        customer_name: 'Unknown Customer'
      }))
    }

    try {
      console.log('👥 Fetching customer information for IDs:', customerIds)
      const { data: profiles, error } = await this.supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', customerIds)

      if (error) {
        console.error('❌ Error fetching customer profiles:', error)
        return workRequests.map(wr => ({
          ...wr,
          customer_name: 'Unknown Customer'
        }))
      }

      console.log('✅ Profile query succeeded, found:', profiles?.length || 0, 'profiles')
      
      // Create customer lookup map
      const customerMap = new Map()
      profiles?.forEach(profile => {
        customerMap.set(profile.id, profile.name || profile.email || 'Unknown Customer')
      })

      // Transform work requests with customer names
      return workRequests.map(wr => ({
        ...wr,
        customer_name: customerMap.get(wr.customer_id) || 'Missing Customer'
      }))

    } catch (error) {
      console.error('❌ Exception during customer lookup:', error)
      return workRequests.map(wr => ({
        ...wr,
        customer_name: 'Unknown Customer'
      }))
    }
  }

  async getWorkRequests(): Promise<WorkRequest[]> {
    try {
      console.log('🔍 Loading work requests from database...')
      const currentUserId = this.getCurrentUserId()
      console.log('🏢 Current context:', { 
        userId: currentUserId, 
        tenantId: this.currentTenantId,
        initialized: this.isInitialized 
      })

      // Query work requests for current tenant
      const { data: workRequests, error } = await this.supabase
        .from('work_requests')
        .select('*')
        .eq('tenant_id', this.currentTenantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching work requests:', error)
        throw error
      }

      console.log('✅ Work requests query succeeded, found:', workRequests?.length || 0, 'records')
      
      if (workRequests && workRequests.length > 0) {
        console.log('📋 Sample work request:', workRequests[0])
        
        // Handle missing customers gracefully
        const workRequestsWithCustomers = await this.handleMissingCustomers(workRequests)
        console.log('✅ Data transformation completed, returning', workRequestsWithCustomers.length, 'records')
        return workRequestsWithCustomers
      }

      return []
    } catch (error) {
      console.error('❌ Error in getWorkRequests:', error)
      return []
    }
  }

  async getProjects(): Promise<ProjectCharter[]> {
    try {
      console.log('📊 Loading projects from database...')
      
      const { data: projects, error } = await this.supabase
        .from('project_charters')
        .select('*')
        .eq('tenant_id', this.currentTenantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching projects:', error)
        throw error
      }

      console.log('✅ Projects query succeeded, found:', projects?.length || 0, 'records')
      return projects || []
    } catch (error) {
      console.error('❌ Error in getProjects:', error)
      return []
    }
  }

  async getRisks(): Promise<Risk[]> {
    try {
      console.log('⚠️ Loading risks from database...')
      
      const { data: risks, error } = await this.supabase
        .from('risks')
        .select('*')
        .eq('tenant_id', this.currentTenantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching risks:', error)
        throw error
      }

      console.log('✅ Risks query succeeded, found:', risks?.length || 0, 'records')
      return risks || []
    } catch (error) {
      console.error('❌ Error in getRisks:', error)
      return []
    }
  }

  // Approval workflow methods
  async approveWorkRequest(workRequestId: string, approverComments?: string): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      console.log('✅ Approving work request:', workRequestId)
      
      // Update work request status
      const { error: updateError } = await this.supabase
        .from('work_requests')
        .update({
          approval_status: 'converted_to_project',
          approved_by: this.getCurrentUserId(),
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (updateError) {
        console.error('❌ Error updating work request:', updateError)
        return { success: false, error: updateError.message }
      }

      console.log('✅ Work request approved successfully')
      return { success: true, projectId: `proj_${Date.now()}` }

    } catch (error) {
      console.error('❌ Error in approveWorkRequest:', error)
      return { success: false, error: 'Failed to approve work request' }
    }
  }

  async declineWorkRequest(workRequestId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('❌ Declining work request:', workRequestId, 'Reason:', reason)
      
      const { error } = await this.supabase
        .from('work_requests')
        .update({
          approval_status: 'declined',
          decline_reason: reason,
          reviewed_by: this.getCurrentUserId(),
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (error) {
        console.error('❌ Error declining work request:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Work request declined successfully')
      return { success: true }

    } catch (error) {
      console.error('❌ Error in declineWorkRequest:', error)
      return { success: false, error: 'Failed to decline work request' }
    }
  }

  async setWorkRequestUnderReview(workRequestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Setting work request under review:', workRequestId)
      
      const { error } = await this.supabase
        .from('work_requests')
        .update({
          approval_status: 'under_review',
          reviewed_by: this.getCurrentUserId(),
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (error) {
        console.error('❌ Error setting work request under review:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Work request set under review successfully')
      return { success: true }

    } catch (error) {
      console.error('❌ Error in setWorkRequestUnderReview:', error)
      return { success: false, error: 'Failed to set work request under review' }
    }
  }

  // Method to create missing customers
  async createMissingCustomer(name: string, email: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      console.log('👤 Creating missing customer:', { name, email })
      
      const customerId = `cust_${Date.now()}`
      const { data: customer, error } = await this.supabase
        .from('profiles')
        .insert({
          id: customerId,
          name: name,
          email: email,
          tenant_id: this.currentTenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating customer:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Customer created successfully:', customerId)
      return { success: true, customerId }

    } catch (error) {
      console.error('❌ Error in createMissingCustomer:', error)
      return { success: false, error: 'Failed to create customer' }
    }
  }

  // Method to link work request to existing customer
  async linkWorkRequestToCustomer(workRequestId: string, customerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔗 Linking work request to customer:', { workRequestId, customerId })
      
      const { error } = await this.supabase
        .from('work_requests')
        .update({
          customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (error) {
        console.error('❌ Error linking work request to customer:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Work request linked to customer successfully')
      return { success: true }

    } catch (error) {
      console.error('❌ Error in linkWorkRequestToCustomer:', error)
      return { success: false, error: 'Failed to link work request to customer' }
    }
  }

  // Method to get available customers for linking
  async getAvailableCustomers(): Promise<Array<{ id: string; name: string; email: string }>> {
    try {
      const { data: customers, error } = await this.supabase
        .from('profiles')
        .select('id, name, email')
        .eq('tenant_id', this.currentTenantId)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching available customers:', error)
        return []
      }

      return customers || []
    } catch (error) {
      console.error('❌ Error in getAvailableCustomers:', error)
      return []
    }
  }

  async getWorkRequestStats(): Promise<{
    total: number
    pending: number
    approved: number
    declined: number
    converted: number
  }> {
    try {
      const workRequests = await this.getWorkRequests()
      
      return {
        total: workRequests.length,
        pending: workRequests.filter(r => 
          r.approval_status === 'submitted' || 
          r.approval_status === 'under_review' ||
          r.status === 'submitted' ||
          r.status === 'under_review'
        ).length,
        approved: workRequests.filter(r => r.approval_status === 'approved').length,
        declined: workRequests.filter(r => r.approval_status === 'declined').length,
        converted: workRequests.filter(r => r.approval_status === 'converted_to_project').length
      }
    } catch (error) {
      console.error('❌ Error getting work request stats:', error)
      return { total: 0, pending: 0, approved: 0, declined: 0, converted: 0 }
    }
  }
}

// Create singleton instance
export const pmbok = new PMBOKService()

// Export the service class for type checking
export default PMBOKService

