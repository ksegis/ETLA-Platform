import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN || ''

// Build-safe Supabase client
let supabase: any = null
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client initialized')
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error)
  }
} else {
  console.warn('⚠️ Supabase environment variables not available')
}

// Enhanced interfaces with approval workflow
export interface WorkRequest {
  id: string
  tenant_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: string
  approval_status?: 'submitted' | 'under_review' | 'approved' | 'declined' | 'converted_to_project'
  customer_id: string
  customer_name?: string
  customer_email?: string
  customer_missing?: boolean
  customer_error?: string
  estimated_hours?: number
  estimated_budget?: number
  required_completion_date?: string
  decline_reason?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface ProjectCharter {
  id: string
  tenant_id: string
  work_request_id?: string
  title: string
  description: string
  budget: number
  start_date: string
  end_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface Risk {
  id: string
  tenant_id: string
  project_id?: string
  title: string
  description: string
  probability: number
  impact: number
  risk_score: number
  mitigation_plan?: string
  status: string
  created_at: string
  updated_at: string
}

// Auth-stable PMBOK Service
class PMBOKService {
  private currentUserId: string | null = null
  private currentTenantId: string | null = null
  private authCallbacks: Array<(userId: string | null, tenantId: string | null) => void> = []

  constructor() {
    // Initialize with demo user as fallback
    this.currentUserId = '1'
    this.currentTenantId = '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
    
    console.log('🔧 PMBOK Service initialized with demo fallback:', {
      userId: this.currentUserId,
      tenantId: this.currentTenantId
    })
  }

  // Set user context from auth provider
  setUserContext(userId: string | null, tenantId: string | null) {
    const previousUserId = this.currentUserId
    const previousTenantId = this.currentTenantId
    
    // Always use demo user as fallback
    this.currentUserId = userId || '1'
    this.currentTenantId = tenantId || '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
    
    if (previousUserId !== this.currentUserId || previousTenantId !== this.currentTenantId) {
      console.log('🔄 PMBOK Service user context updated:', {
        from: { userId: previousUserId, tenantId: previousTenantId },
        to: { userId: this.currentUserId, tenantId: this.currentTenantId }
      })
      
      // Notify callbacks of context change
      this.authCallbacks.forEach(callback => {
        try {
          callback(this.currentUserId, this.currentTenantId)
        } catch (error) {
          console.error('❌ Error in auth callback:', error)
        }
      })
    }
  }

  // Subscribe to auth context changes
  onAuthChange(callback: (userId: string | null, tenantId: string | null) => void) {
    this.authCallbacks.push(callback)
    
    // Immediately call with current context
    callback(this.currentUserId, this.currentTenantId)
    
    // Return unsubscribe function
    return () => {
      const index = this.authCallbacks.indexOf(callback)
      if (index > -1) {
        this.authCallbacks.splice(index, 1)
      }
    }
  }

  // Get current user context
  getCurrentContext() {
    return {
      userId: this.currentUserId,
      tenantId: this.currentTenantId
    }
  }

  // Helper to check if Supabase is available
  private isSupabaseAvailable(): boolean {
    return !!supabase && !!this.currentTenantId
  }

  // Helper for timeout wrapper
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ])
  }

  // Get work requests with stable auth context
  async getWorkRequests(): Promise<WorkRequest[]> {
    console.log('🔍 Loading work requests with context:', {
      userId: this.currentUserId,
      tenantId: this.currentTenantId,
      hasSupabase: this.isSupabaseAvailable()
    })

    if (!this.isSupabaseAvailable()) {
      console.warn('⚠️ Supabase not available, returning empty array')
      return []
    }

    try {
      // Step 1: Get work requests for current tenant
      console.log('📊 Fetching work requests for tenant:', this.currentTenantId)
      
      const workRequestsQuery = supabase
        .from('work_requests')
        .select('*')
        .eq('tenant_id', this.currentTenantId)
        .order('created_at', { ascending: false })

      const { data: workRequestsData, error: workRequestsError } = await this.withTimeout(
        workRequestsQuery,
        10000,
        'Work requests query timeout'
      ) as any

      if (workRequestsError) {
        console.error('❌ Error fetching work requests:', workRequestsError)
        return []
      }

      if (!workRequestsData || workRequestsData.length === 0) {
        console.log('ℹ️ No work requests found for tenant:', this.currentTenantId)
        return []
      }

      console.log('✅ Work requests fetched:', workRequestsData.length)

      // Step 2: Get customer information
      const customerIds = Array.from(new Set(workRequestsData.map((wr: any) => wr.customer_id).filter(Boolean)))
      console.log('👥 Fetching customer info for IDs:', customerIds)

      let customerMap = new Map()
      if (customerIds.length > 0) {
        try {
          const { data: customersData, error: customersError } = await this.withTimeout(
            supabase
              .from('profiles')
              .select('id, company_name, email')
              .in('id', customerIds),
            5000,
            'Customers query timeout'
          ) as any

          if (customersError) {
            console.warn('⚠️ Error fetching customers:', customersError)
          } else if (customersData) {
            customersData.forEach((customer: any) => {
              customerMap.set(customer.id, customer)
            })
            console.log('✅ Customer data loaded:', customersData.length)
          }
        } catch (customerError) {
          console.warn('⚠️ Customer query failed:', customerError)
        }
      }

      // Step 3: Merge data gracefully
      const workRequests: WorkRequest[] = workRequestsData.map((request: any) => {
        const customer = customerMap.get(request.customer_id)
        const customerMissing = !customer && !!request.customer_id

        if (customerMissing) {
          console.warn('⚠️ Missing customer for work request:', {
            requestId: request.id,
            customerId: request.customer_id
          })
        }

        return {
          ...request,
          customer_name: customer?.company_name || customer?.email || 'Unknown Customer',
          customer_email: customer?.email || undefined,
          customer_missing: customerMissing,
          customer_error: customerMissing ? `Customer not found: ${request.customer_id}` : undefined
        }
      })

      console.log('✅ Work requests processed successfully:', {
        total: workRequests.length,
        withCustomers: workRequests.filter(wr => !wr.customer_missing).length,
        missingCustomers: workRequests.filter(wr => wr.customer_missing).length
      })

      return workRequests

    } catch (error) {
      console.error('❌ Error in getWorkRequests:', error)
      return []
    }
  }

  // Get project charters with stable auth context
  async getProjectCharters(): Promise<ProjectCharter[]> {
    console.log('🔍 Loading project charters with context:', {
      userId: this.currentUserId,
      tenantId: this.currentTenantId
    })

    if (!this.isSupabaseAvailable()) {
      console.warn('⚠️ Supabase not available, returning empty array')
      return []
    }

    try {
      const { data, error } = await this.withTimeout(
        supabase
          .from('project_charters')
          .select('*')
          .eq('tenant_id', this.currentTenantId)
          .order('created_at', { ascending: false }),
        10000,
        'Project charters query timeout'
      ) as any

      if (error) {
        console.error('❌ Error fetching project charters:', error)
        return []
      }

      console.log('✅ Project charters loaded:', data?.length || 0)
      return data || []

    } catch (error) {
      console.error('❌ Error in getProjectCharters:', error)
      return []
    }
  }

  // Get risks with stable auth context
  async getRisks(): Promise<Risk[]> {
    console.log('🔍 Loading risks with context:', {
      userId: this.currentUserId,
      tenantId: this.currentTenantId
    })

    if (!this.isSupabaseAvailable()) {
      console.warn('⚠️ Supabase not available, returning empty array')
      return []
    }

    try {
      const { data, error } = await this.withTimeout(
        supabase
          .from('risk_register')
          .select('*')
          .eq('tenant_id', this.currentTenantId)
          .order('risk_score', { ascending: false }),
        10000,
        'Risks query timeout'
      ) as any

      if (error) {
        console.error('❌ Error fetching risks:', error)
        return []
      }

      console.log('✅ Risks loaded:', data?.length || 0)
      return data || []

    } catch (error) {
      console.error('❌ Error in getRisks:', error)
      return []
    }
  }

  // Approval workflow methods with stable auth context
  async approveWorkRequest(workRequestId: string, createProject: boolean = true): Promise<void> {
    console.log('✅ Approving work request:', {
      workRequestId,
      createProject,
      userId: this.currentUserId,
      tenantId: this.currentTenantId
    })

    if (!this.isSupabaseAvailable()) {
      throw new Error('Database not available')
    }

    try {
      // Update work request status
      const { error: updateError } = await supabase
        .from('work_requests')
        .update({
          approval_status: createProject ? 'converted_to_project' : 'approved',
          approved_by: this.currentUserId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (updateError) {
        throw updateError
      }

      // Create project charter if requested
      if (createProject) {
        const workRequest = await this.getWorkRequestById(workRequestId)
        if (workRequest) {
          await this.createProjectCharter({
            work_request_id: workRequestId,
            title: `Project: ${workRequest.title}`,
            description: workRequest.description,
            budget: workRequest.estimated_budget || 0,
            start_date: new Date().toISOString(),
            end_date: workRequest.required_completion_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'planning'
          })
        }
      }

      console.log('✅ Work request approved successfully')

    } catch (error) {
      console.error('❌ Error approving work request:', error)
      throw error
    }
  }

  async declineWorkRequest(workRequestId: string, reason: string): Promise<void> {
    console.log('❌ Declining work request:', {
      workRequestId,
      reason,
      userId: this.currentUserId,
      tenantId: this.currentTenantId
    })

    if (!this.isSupabaseAvailable()) {
      throw new Error('Database not available')
    }

    try {
      const { error } = await supabase
        .from('work_requests')
        .update({
          approval_status: 'declined',
          decline_reason: reason,
          reviewed_by: this.currentUserId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (error) {
        throw error
      }

      console.log('✅ Work request declined successfully')

    } catch (error) {
      console.error('❌ Error declining work request:', error)
      throw error
    }
  }

  async setWorkRequestUnderReview(workRequestId: string): Promise<void> {
    console.log('🔄 Setting work request under review:', {
      workRequestId,
      userId: this.currentUserId,
      tenantId: this.currentTenantId
    })

    if (!this.isSupabaseAvailable()) {
      throw new Error('Database not available')
    }

    try {
      const { error } = await supabase
        .from('work_requests')
        .update({
          approval_status: 'under_review',
          reviewed_by: this.currentUserId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (error) {
        throw error
      }

      console.log('✅ Work request set under review successfully')

    } catch (error) {
      console.error('❌ Error setting work request under review:', error)
      throw error
    }
  }

  // Helper methods
  private async getWorkRequestById(id: string): Promise<WorkRequest | null> {
    if (!this.isSupabaseAvailable()) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('work_requests')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', this.currentTenantId)
        .single()

      if (error) {
        console.error('❌ Error fetching work request by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error in getWorkRequestById:', error)
      return null
    }
  }

  private async createProjectCharter(charter: Omit<ProjectCharter, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<ProjectCharter | null> {
    if (!this.isSupabaseAvailable()) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('project_charters')
        .insert({
          ...charter,
          tenant_id: this.currentTenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating project charter:', error)
        return null
      }

      console.log('✅ Project charter created:', data)
      return data
    } catch (error) {
      console.error('❌ Error in createProjectCharter:', error)
      return null
    }
  }

  // Customer management methods
  async createCustomer(customerData: { company_name: string; email: string; phone?: string }): Promise<any> {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Database not available')
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          ...customerData,
          tenant_id: this.currentTenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('✅ Customer created:', data)
      return data
    } catch (error) {
      console.error('❌ Error creating customer:', error)
      throw error
    }
  }

  async linkWorkRequestToCustomer(workRequestId: string, customerId: string): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Database not available')
    }

    try {
      const { error } = await supabase
        .from('work_requests')
        .update({
          customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.currentTenantId)

      if (error) {
        throw error
      }

      console.log('✅ Work request linked to customer successfully')
    } catch (error) {
      console.error('❌ Error linking work request to customer:', error)
      throw error
    }
  }

  async getCustomers(): Promise<any[]> {
    if (!this.isSupabaseAvailable()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, email, phone')
        .eq('tenant_id', this.currentTenantId)
        .order('company_name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching customers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error in getCustomers:', error)
      return []
    }
  }
}

// Create singleton instance
export const pmbok = new PMBOKService()

// Export for use in auth context
export default pmbok

