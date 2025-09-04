import { createClient } from '@supabase/supabase-js'
import { withPermissionCheck, ServiceAuth, getServiceAuthContext } from '@/utils/serviceAuth'
import { FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import type { WorkRequest, ProjectCharter, Risk } from '@/types'

// Enhanced WorkRequest interface with approval workflow fields
export interface WorkRequestWithApproval extends WorkRequest {
  approval_status?: 'submitted' | 'under_review' | 'approved' | 'declined' | 'converted_to_project'
  decline_reason?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
}

class PMBOKServiceRBAC {
  private supabase
  private currentUserId: string = 'demo-user-id'
  private currentTenantId: string = '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
  private isInitialized: boolean = false

  constructor() {
    // Create Supabase client with environment variables
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN || ''
    )
    console.log('🔧 PMBOK Service RBAC: Created with default demo context')
  }

  // Initialize with user context (called after auth is stable)
  async initialize(userId?: string, tenantId?: string) {
    if (userId && tenantId) {
      this.currentUserId = userId
      this.currentTenantId = tenantId
      this.isInitialized = true
      console.log('✅ PMBOK Service RBAC: Initialized with user context:', { userId, tenantId })
    } else {
      console.log('⚠️ PMBOK Service RBAC: Using demo context - no user/tenant provided')
    }
  }

  // Update user context when auth changes
  updateUserContext(userId: string, tenantId: string) {
    if (this.currentUserId !== userId || this.currentTenantId !== tenantId) {
      console.log('🔄 PMBOK Service RBAC: Updating user context:', { 
        from: { userId: this.currentUserId, tenantId: this.currentTenantId },
        to: { userId, tenantId }
      })
      this.currentUserId = userId
      this.currentTenantId = tenantId
      this.isInitialized = true
    }
  }

  // Work Request Methods with RBAC
  async getWorkRequests(): Promise<WorkRequestWithApproval[]> {
    return withPermissionCheck(
      FEATURES.WORK_REQUESTS,
      PERMISSIONS.VIEW,
      async () => {
        try {
          console.log('🔍 Loading work requests from database...')
          console.log('🏢 Current context:', { 
            userId: this.currentUserId, 
            tenantId: this.currentTenantId,
            initialized: this.isInitialized 
          })

          const { data: workRequests, error } = await this.supabase
            .from('work_requests')
            .select('*')
            .eq('tenant_id', this.currentTenantId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('❌ Error fetching work requests:', error)
            return []
          }

          console.log('✅ Work requests loaded successfully:', workRequests?.length || 0)
          return await this.handleMissingCustomers(workRequests || [])

        } catch (error) {
          console.error('❌ Exception in getWorkRequests:', error)
          return []
        }
      }
    )
  }

  async createWorkRequest(workRequest: Partial<WorkRequestWithApproval>): Promise<WorkRequestWithApproval | null> {
    return withPermissionCheck(
      FEATURES.WORK_REQUESTS,
      PERMISSIONS.CREATE,
      async () => {
        try {
          console.log('📝 Creating new work request:', workRequest.title)

          const newWorkRequest = {
            ...workRequest,
            id: crypto.randomUUID(),
            tenant_id: this.currentTenantId,
            requested_by: this.currentUserId,
            status: 'draft',
            approval_status: 'submitted',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data, error } = await this.supabase
            .from('work_requests')
            .insert([newWorkRequest])
            .select()
            .single()

          if (error) {
            console.error('❌ Error creating work request:', error)
            return null
          }

          console.log('✅ Work request created successfully:', data.id)
          return data

        } catch (error) {
          console.error('❌ Exception in createWorkRequest:', error)
          return null
        }
      }
    )
  }

  async updateWorkRequest(id: string, updates: Partial<WorkRequestWithApproval>): Promise<WorkRequestWithApproval | null> {
    return withPermissionCheck(
      FEATURES.WORK_REQUESTS,
      PERMISSIONS.UPDATE,
      async () => {
        try {
          console.log('📝 Updating work request:', id)

          const { data, error } = await this.supabase
            .from('work_requests')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('tenant_id', this.currentTenantId)
            .select()
            .single()

          if (error) {
            console.error('❌ Error updating work request:', error)
            return null
          }

          console.log('✅ Work request updated successfully:', id)
          return data

        } catch (error) {
          console.error('❌ Exception in updateWorkRequest:', error)
          return null
        }
      }
    )
  }

  async approveWorkRequest(id: string, approvedBy: string): Promise<boolean> {
    return withPermissionCheck(
      FEATURES.WORK_REQUESTS,
      PERMISSIONS.APPROVE,
      async () => {
        try {
          console.log('✅ Approving work request:', id)

          const { error } = await this.supabase
            .from('work_requests')
            .update({
              approval_status: 'approved',
              approved_by: approvedBy,
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('tenant_id', this.currentTenantId)

          if (error) {
            console.error('❌ Error approving work request:', error)
            return false
          }

          console.log('✅ Work request approved successfully:', id)
          return true

        } catch (error) {
          console.error('❌ Exception in approveWorkRequest:', error)
          return false
        }
      }
    )
  }

  async declineWorkRequest(id: string, reason: string, reviewedBy: string): Promise<boolean> {
    return withPermissionCheck(
      FEATURES.WORK_REQUESTS,
      PERMISSIONS.APPROVE,
      async () => {
        try {
          console.log('❌ Declining work request:', id)

          const { error } = await this.supabase
            .from('work_requests')
            .update({
              approval_status: 'declined',
              decline_reason: reason,
              reviewed_by: reviewedBy,
              reviewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('tenant_id', this.currentTenantId)

          if (error) {
            console.error('❌ Error declining work request:', error)
            return false
          }

          console.log('✅ Work request declined successfully:', id)
          return true

        } catch (error) {
          console.error('❌ Exception in declineWorkRequest:', error)
          return false
        }
      }
    )
  }

  // Project Charter Methods with RBAC
  async getProjects(): Promise<ProjectCharter[]> {
    return withPermissionCheck(
      FEATURES.PROJECT_MANAGEMENT,
      PERMISSIONS.VIEW,
      async () => {
        try {
          console.log('🔍 Loading project charters from database...')

          const { data: projects, error } = await this.supabase
            .from('project_charters')
            .select('*')
            .eq('tenant_id', this.currentTenantId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('❌ Error fetching project charters:', error)
            return []
          }

          console.log('✅ Project charters loaded successfully:', projects?.length || 0)
          return projects || []

        } catch (error) {
          console.error('❌ Exception in getProjects:', error)
          return []
        }
      }
    )
  }

  async createProjectCharter(charter: Partial<ProjectCharter>): Promise<ProjectCharter | null> {
    return withPermissionCheck(
      FEATURES.PROJECT_CHARTER,
      PERMISSIONS.CREATE,
      async () => {
        try {
          console.log('📝 Creating new project charter:', charter.title)

          const newCharter = {
            ...charter,
            id: crypto.randomUUID(),
            tenant_id: this.currentTenantId,
            created_by: this.currentUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data, error } = await this.supabase
            .from('project_charters')
            .insert([newCharter])
            .select()
            .single()

          if (error) {
            console.error('❌ Error creating project charter:', error)
            return null
          }

          console.log('✅ Project charter created successfully:', data.id)
          return data

        } catch (error) {
          console.error('❌ Exception in createProjectCharter:', error)
          return null
        }
      }
    )
  }

  // Risk Management Methods with RBAC
  async getRisks(): Promise<Risk[]> {
    return withPermissionCheck(
      FEATURES.RISK_MANAGEMENT,
      PERMISSIONS.VIEW,
      async () => {
        try {
          console.log('🔍 Loading risks from database...')

          const { data: risks, error } = await this.supabase
            .from('risk_register')
            .select('*')
            .eq('tenant_id', this.currentTenantId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('❌ Error fetching risks:', error)
            return []
          }

          console.log('✅ Risks loaded successfully:', risks?.length || 0)
          return risks || []

        } catch (error) {
          console.error('❌ Exception in getRisks:', error)
          return []
        }
      }
    )
  }

  async createRisk(risk: Partial<Risk>): Promise<Risk | null> {
    return withPermissionCheck(
      FEATURES.RISK_MANAGEMENT,
      PERMISSIONS.CREATE,
      async () => {
        try {
          console.log('📝 Creating new risk:', risk.title)

          const newRisk = {
            ...risk,
            id: crypto.randomUUID(),
            tenant_id: this.currentTenantId,
            created_by: this.currentUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data, error } = await this.supabase
            .from('risk_register')
            .insert([newRisk])
            .select()
            .single()

          if (error) {
            console.error('❌ Error creating risk:', error)
            return null
          }

          console.log('✅ Risk created successfully:', data.id)
          return data

        } catch (error) {
          console.error('❌ Exception in createRisk:', error)
          return null
        }
      }
    )
  }

  // User Management Methods with RBAC
  async getUsers(): Promise<any[]> {
    return withPermissionCheck(
      FEATURES.USER_MANAGEMENT,
      PERMISSIONS.VIEW,
      async () => {
        try {
          console.log('🔍 Loading users from database...')

          const { data: users, error } = await this.supabase
            .from('tenant_users')
            .select(`
              *,
              profiles:user_id (
                id,
                name,
                email
              )
            `)
            .eq('tenant_id', this.currentTenantId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('❌ Error fetching users:', error)
            return []
          }

          console.log('✅ Users loaded successfully:', users?.length || 0)
          return users || []

        } catch (error) {
          console.error('❌ Exception in getUsers:', error)
          return []
        }
      }
    )
  }

  // Reporting Methods with RBAC
  async getDashboardData(): Promise<any> {
    return withPermissionCheck(
      FEATURES.DASHBOARDS,
      PERMISSIONS.VIEW,
      async () => {
        try {
          console.log('📊 Loading dashboard data...')

          const [workRequests, projects, risks] = await Promise.all([
            this.getWorkRequests(),
            this.getProjects(),
            this.getRisks()
          ])

          const dashboardData = {
            workRequests: {
              total: workRequests.length,
              pending: workRequests.filter(wr => 
                wr.approval_status === 'submitted' || 
                wr.approval_status === 'under_review'
              ).length,
              approved: workRequests.filter(wr => wr.approval_status === 'approved').length,
              declined: workRequests.filter(wr => wr.approval_status === 'declined').length
            },
            projects: {
              total: projects.length,
              active: projects.filter(p => p.status === 'active').length,
              completed: projects.filter(p => p.status === 'completed').length
            },
            risks: {
              total: risks.length,
              high: risks.filter(r => r.risk_score && r.risk_score >= 15).length,
              medium: risks.filter(r => r.risk_score && r.risk_score >= 8 && r.risk_score < 15).length,
              low: risks.filter(r => r.risk_score && r.risk_score < 8).length
            }
          }

          console.log('✅ Dashboard data loaded successfully')
          return dashboardData

        } catch (error) {
          console.error('❌ Exception in getDashboardData:', error)
          return {
            workRequests: { total: 0, pending: 0, approved: 0, declined: 0 },
            projects: { total: 0, active: 0, completed: 0 },
            risks: { total: 0, high: 0, medium: 0, low: 0 }
          }
        }
      }
    )
  }

  // Helper function to handle missing customers gracefully
  private async handleMissingCustomers(workRequests: any[]): Promise<WorkRequestWithApproval[]> {
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

  // Permission checking utilities
  canViewWorkRequests(): boolean {
    return ServiceAuth.canViewWorkRequests()
  }

  canCreateWorkRequests(): boolean {
    return ServiceAuth.canCreateWorkRequests()
  }

  canApproveWorkRequests(): boolean {
    return ServiceAuth.canApproveWorkRequests()
  }

  canViewProjects(): boolean {
    return ServiceAuth.canViewProjects()
  }

  canCreateProjects(): boolean {
    return ServiceAuth.canCreateProjects()
  }

  canManageRisks(): boolean {
    return ServiceAuth.canManageRisks()
  }

  canManageUsers(): boolean {
    return ServiceAuth.canManageUsers()
  }

  canViewReports(): boolean {
    return ServiceAuth.canViewReports()
  }

  // Get current user permissions summary
  getUserPermissions(): {
    workRequests: { view: boolean; create: boolean; update: boolean; approve: boolean }
    projects: { view: boolean; create: boolean; update: boolean; delete: boolean }
    risks: { view: boolean; manage: boolean }
    users: { view: boolean; manage: boolean }
    reports: { view: boolean; export: boolean }
  } {
    return {
      workRequests: {
        view: this.canViewWorkRequests(),
        create: this.canCreateWorkRequests(),
        update: ServiceAuth.canUpdateWorkRequests(),
        approve: this.canApproveWorkRequests()
      },
      projects: {
        view: this.canViewProjects(),
        create: this.canCreateProjects(),
        update: ServiceAuth.canUpdateProjects(),
        delete: ServiceAuth.canDeleteProjects()
      },
      risks: {
        view: ServiceAuth.canViewRisks(),
        manage: this.canManageRisks()
      },
      users: {
        view: ServiceAuth.canViewUsers(),
        manage: this.canManageUsers()
      },
      reports: {
        view: this.canViewReports(),
        export: ServiceAuth.canExportReports()
      }
    }
  }
}

// Create singleton instance
export const pmbokRBAC = new PMBOKServiceRBAC()

// Export the service class for type checking
export default PMBOKServiceRBAC

