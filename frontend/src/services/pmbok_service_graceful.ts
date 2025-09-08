import { createClient } from '@supabase/supabase-js'

// Build-safe environment check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN

console.log('🔧 Environment variables check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined'
})

// Build-safe Supabase client creation
let supabase: any = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ Supabase client initialized successfully')
} else {
  console.warn('⚠️ Supabase environment variables not available - running in build mode')
}

// Enhanced interfaces with missing customer handling
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
  customer_name?: string
  customer_email?: string
  estimated_hours?: number
  estimated_budget?: number
  required_completion_date?: string
  submitted_at?: string
  created_at: string
  updated_at: string
  decline_reason?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
  // Missing customer handling
  customer_missing?: boolean
  customer_error?: string
}

export interface ProjectCharter {
  id: string
  tenant_id: string
  work_request_id?: string
  project_name: string
  project_code: string
  project_description: string
  project_sponsor: string
  project_manager?: string
  charter_status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled'
  estimated_budget?: number
  planned_start_date?: string
  planned_end_date?: string
  created_at: string
  updated_at: string
}

export interface RiskRegister {
  id: string
  tenant_id: string
  project_charter_id?: string
  risk_title: string
  risk_description: string
  risk_category: 'technical' | 'operational' | 'financial' | 'strategic' | 'compliance'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  impact: number
  risk_score: number
  risk_owner: string
  mitigation_plan?: string
  status: 'identified' | 'assessed' | 'mitigated' | 'resolved' | 'accepted'
  created_at: string
  updated_at: string
}

export interface MissingCustomer {
  customer_id: string
  work_request_ids: string[]
  suggested_name?: string
  suggested_email?: string
  count: number
}

class PMBOKService {
  private tenantId: string

  constructor() {
    // For demo purposes, use a fixed tenant ID
    this.tenantId = '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
    console.log('🔧 Initializing PMBOK Service...')
    console.log('✅ PMBOK Service initialized with tenant:', this.tenantId)
  }

  // GRACEFUL work requests loading with missing customer handling
  async getWorkRequests(): Promise<WorkRequest[]> {
    try {
      console.log('🔍 Loading work requests from database (graceful mode)...')
      console.log('🏢 Tenant ID:', this.tenantId)

      // Build-safe check
      if (!supabase) {
        console.warn('⚠️ Supabase not available - returning empty array')
        return []
      }

      // Step 1: Get all work requests without customer join (to avoid failures)
      console.log('📊 Fetching work requests (no customer join)...')
      const { data: workRequestsData, error: workRequestsError } = await supabase
        .from('work_requests')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('created_at', { ascending: false })

      if (workRequestsError) {
        console.error('❌ Work requests query failed:', workRequestsError)
        throw workRequestsError
      }

      console.log('✅ Work requests query succeeded, found:', workRequestsData?.length || 0, 'records')
      
      if (!workRequestsData || workRequestsData.length === 0) {
        console.log('ℹ️ No work requests found')
        return []
      }

      // Step 2: Get all customers separately
      console.log('👥 Fetching customer information...')
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, company_name, contact_email')
        .eq('tenant_id', this.tenantId)

      if (customersError) {
        console.warn('⚠️ Customer query failed, proceeding without customer data:', customersError)
      }

      console.log('✅ Customer query completed, found:', customersData?.length || 0, 'customers')

      // Step 3: Create customer lookup map
      const customerMap = new Map()
      if (customersData) {
        customersData.forEach((customer: any) => {
          customerMap.set(customer.id, customer)
        })
      }

      // Step 4: Merge data gracefully, marking missing customers
      const workRequests: WorkRequest[] = workRequestsData.map((request: any) => {
        const customer = customerMap.get(request.customer_id)
        
        if (!customer) {
          console.warn('⚠️ Missing customer for work request:', request.id, 'customer_id:', request.customer_id)
          return {
            ...request,
            customer_name: `Missing Customer (${request.customer_id.substring(0, 8)}...)`,
            customer_email: 'missing@customer.com',
            customer_missing: true,
            customer_error: `Customer ID ${request.customer_id} not found in customers table`
          }
        }

        return {
          ...request,
          customer_name: customer.company_name,
          customer_email: customer.contact_email,
          customer_missing: false
        }
      })

      console.log('✅ Data transformation completed successfully')
      console.log('📋 Sample work request:', workRequests[0])

      return workRequests

    } catch (error) {
      console.error('❌ Error in getWorkRequests:', error)
      // Return empty array instead of throwing during build
      if (!supabase) {
        return []
      }
      throw error
    }
  }

  // Get missing customers summary for UI correction
  async getMissingCustomers(): Promise<MissingCustomer[]> {
    try {
      console.log('🔍 Analyzing missing customers...')

      if (!supabase) {
        console.warn('⚠️ Supabase not available - returning empty array')
        return []
      }

      const workRequests = await this.getWorkRequests()
      const missingCustomers = new Map<string, MissingCustomer>()

      workRequests.forEach((request: any) => {
        if (request.customer_missing) {
          const existing = missingCustomers.get(request.customer_id)
          if (existing) {
            existing.work_request_ids.push(request.id)
            existing.count++
          } else {
            missingCustomers.set(request.customer_id, {
              customer_id: request.customer_id,
              work_request_ids: [request.id],
              suggested_name: request.customer_name?.replace('Missing Customer', '').trim() || 'Unknown Company',
              suggested_email: request.customer_email !== 'missing@customer.com' ? request.customer_email : undefined,
              count: 1
            })
          }
        }
      })

      const result = Array.from(missingCustomers.values())
      console.log('📊 Missing customers analysis:', result.length, 'missing customers found')
      return result

    } catch (error) {
      console.error('❌ Error analyzing missing customers:', error)
      return []
    }
  }

  // Create missing customer from UI
  async createMissingCustomer(customerData: {
    id: string
    company_name: string
    contact_email: string
    contact_name?: string
    phone?: string
  }): Promise<void> {
    try {
      console.log('🔧 Creating missing customer:', customerData.id)

      if (!supabase) {
        throw new Error('Supabase not available')
      }

      const { error } = await supabase
        .from('customers')
        .insert({
          id: customerData.id,
          tenant_id: this.tenantId,
          company_name: customerData.company_name,
          contact_email: customerData.contact_email,
          contact_name: customerData.contact_name || customerData.company_name,
          phone: customerData.phone || '+1-555-0000',
          address: '123 Business St',
          city: 'Business City',
          state: 'CA',
          zip_code: '90210',
          country: 'United States',
          industry: 'Technology',
          company_size: 'medium',
          annual_revenue: 500000,
          customer_status: 'active',
          onboarding_status: 'completed',
          assigned_account_manager: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Failed to create customer:', error)
        throw error
      }

      console.log('✅ Customer created successfully:', customerData.id)

    } catch (error) {
      console.error('❌ Error creating customer:', error)
      throw error
    }
  }

  // Update work request to use different customer
  async updateWorkRequestCustomer(workRequestId: string, newCustomerId: string): Promise<void> {
    try {
      console.log('🔧 Updating work request customer:', workRequestId, '→', newCustomerId)

      if (!supabase) {
        throw new Error('Supabase not available')
      }

      const { error } = await supabase
        .from('work_requests')
        .update({
          customer_id: newCustomerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.tenantId)

      if (error) {
        console.error('❌ Failed to update work request customer:', error)
        throw error
      }

      console.log('✅ Work request customer updated successfully')

    } catch (error) {
      console.error('❌ Error updating work request customer:', error)
      throw error
    }
  }

  // Get existing customers for selection
  async getExistingCustomers(): Promise<Array<{id: string, company_name: string, contact_email: string}>> {
    try {
      console.log('👥 Fetching existing customers...')

      if (!supabase) {
        console.warn('⚠️ Supabase not available - returning empty array')
        return []
      }

      const { data, error } = await supabase
        .from('customers')
        .select('id, company_name, contact_email')
        .eq('tenant_id', this.tenantId)
        .order('company_name')

      if (error) {
        console.error('❌ Failed to fetch customers:', error)
        throw error
      }

      console.log('✅ Existing customers loaded:', data?.length || 0)
      return data || []

    } catch (error) {
      console.error('❌ Error fetching customers:', error)
      return []
    }
  }

  // Rest of the PMBOK service methods (build-safe)
  async getProjectCharters(): Promise<ProjectCharter[]> {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not available - returning empty array')
        return []
      }

      const { data, error } = await supabase
        .from('project_charters')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project charters:', error)
      return []
    }
  }

  async getRisksByProject(): Promise<RiskRegister[]> {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not available - returning empty array')
        return []
      }

      const { data, error } = await supabase
        .from('risk_register')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('risk_score', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching risks:', error)
      return []
    }
  }

  // Approval workflow methods
  async approveWorkRequest(workRequestId: string, userId: string, createProject: boolean = true): Promise<void> {
    try {
      console.log('🎯 Approving work request:', workRequestId)

      const { error } = await supabase
        .from('work_requests')
        .update({
          approval_status: createProject ? 'converted_to_project' : 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.tenantId)

      if (error) throw error

      if (createProject) {
        // Create project charter from work request
        const workRequests = await this.getWorkRequests()
        const workRequest = workRequests.find((wr: any) => wr.id === workRequestId)
        
        if (workRequest) {
          await this.createProjectCharter({
            work_request_id: workRequestId,
            project_name: workRequest.title,
            project_code: `PRJ-${Date.now()}`,
            project_description: workRequest.description,
            project_sponsor: workRequest.customer_name || 'Unknown Sponsor',
            charter_status: 'approved',
            estimated_budget: workRequest.estimated_budget,
            planned_start_date: new Date().toISOString(),
            planned_end_date: workRequest.required_completion_date
          })
        }
      }

      console.log('✅ Work request approved successfully')
    } catch (error) {
      console.error('❌ Error approving work request:', error)
      throw error
    }
  }

  async declineWorkRequest(workRequestId: string, userId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_requests')
        .update({
          approval_status: 'declined',
          decline_reason: reason,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.tenantId)

      if (error) throw error
      console.log('✅ Work request declined successfully')
    } catch (error) {
      console.error('❌ Error declining work request:', error)
      throw error
    }
  }

  async setWorkRequestUnderReview(workRequestId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_requests')
        .update({
          approval_status: 'under_review',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .eq('tenant_id', this.tenantId)

      if (error) throw error
      console.log('✅ Work request set under review successfully')
    } catch (error) {
      console.error('❌ Error setting work request under review:', error)
      throw error
    }
  }

  async createProjectCharter(charter: Omit<ProjectCharter, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_charters')
        .insert({
          ...charter,
          tenant_id: this.tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      console.log('✅ Project charter created successfully')
    } catch (error) {
      console.error('❌ Error creating project charter:', error)
      throw error
    }
  }

  async deleteWorkRequest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_requests')
        .delete()
        .eq('id', id)
        .eq('tenant_id', this.tenantId)

      if (error) throw error
      console.log('✅ Work request deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting work request:', error)
      throw error
    }
  }

  async updateRisk(id: string, updates: Partial<RiskRegister>): Promise<void> {
    try {
      const { error } = await supabase
        .from('risk_register')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', this.tenantId)

      if (error) throw error
      console.log('✅ Risk updated successfully')
    } catch (error) {
      console.error('❌ Error updating risk:', error)
      throw error
    }
  }
}

// Export singleton instance
export const pmbok = new PMBOKService()
export default pmbok

