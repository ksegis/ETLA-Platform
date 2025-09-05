import { supabase } from '@/lib/supabase'

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
  actual_hours: number
  budget?: number
  required_completion_date?: string
  scheduled_start_date?: string
  scheduled_end_date?: string
  actual_start_date?: string
  actual_completion_date?: string
  rejection_reason?: string
  internal_notes?: string
  created_at: string
  updated_at: string
  
  // Joined data
  customer_name?: string
  customer_email?: string
  assigned_name?: string
}

export interface CreateWorkRequestData {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  estimated_hours?: number
  budget?: number
  required_completion_date?: string
}

export interface UpdateWorkRequestData {
  title?: string
  description?: string
  category?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  urgency?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
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
}

class WorkRequestService {
  private supabaseClient = supabase

  // Get all work requests for a tenant
  async getWorkRequests(tenantId: string): Promise<WorkRequest[]> {
    const { data, error } = await this.supabaseClient
      .from('work_requests')
      .select(`
        *,
        customer:users!customer_id(first_name, last_name, email),
        assigned:team_members!assigned_to(name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching work requests:', error)
      throw new Error('Failed to fetch work requests')
    }

    return data.map(item => ({
      ...item,
      customer_name: item.customer ? `${item.customer.first_name} ${item.customer.last_name}` : 'Unknown',
      customer_email: item.customer?.email || '',
      assigned_name: item.assigned?.name || ''
    }))
  }

  // Get work requests for a specific user (customer)
  async getWorkRequestsForUser(userId: string, tenantId: string): Promise<WorkRequest[]> {
    const { data, error } = await this.supabaseClient
      .from('work_requests')
      .select(`
        *,
        customer:users!customer_id(first_name, last_name, email),
        assigned:team_members!assigned_to(name)
      `)
      .eq('customer_id', userId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user work requests:', error)
      throw new Error('Failed to fetch work requests')
    }

    return data.map(item => ({
      ...item,
      customer_name: item.customer ? `${item.customer.first_name} ${item.customer.last_name}` : 'Unknown',
      customer_email: item.customer?.email || '',
      assigned_name: item.assigned?.name || ''
    }))
  }

  // Get a single work request by ID
  async getWorkRequest(id: string): Promise<WorkRequest | null> {
    const { data, error } = await this.supabaseClient
      .from('work_requests')
      .select(`
        *,
        customer:users!customer_id(first_name, last_name, email),
        assigned:team_members!assigned_to(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching work request:', error)
      return null
    }

    return {
      ...data,
      customer_name: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : 'Unknown',
      customer_email: data.customer?.email || '',
      assigned_name: data.assigned?.name || ''
    }
  }

  // Create a new work request
  async createWorkRequest(requestData: CreateWorkRequestData, customerId: string, tenantId: string): Promise<WorkRequest> {
    const { data, error } = await this.supabaseClient
      .from('work_requests')
      .insert({
        ...requestData,
        customer_id: customerId,
        tenant_id: tenantId,
        status: 'submitted'
      })
      .select(`
        *,
        customer:users!customer_id(first_name, last_name, email),
        assigned:team_members!assigned_to(name)
      `)
      .single()

    if (error) {
      console.error('Error creating work request:', error)
      throw new Error('Failed to create work request')
    }

    return {
      ...data,
      customer_name: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : 'Unknown',
      customer_email: data.customer?.email || '',
      assigned_name: data.assigned?.name || ''
    }
  }

  // Update a work request
  async updateWorkRequest(id: string, updateData: UpdateWorkRequestData): Promise<WorkRequest> {
    const { data, error } = await this.supabaseClient
      .from('work_requests')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customer:users!customer_id(first_name, last_name, email),
        assigned:team_members!assigned_to(name)
      `)
      .single()

    if (error) {
      console.error('Error updating work request:', error)
      throw new Error('Failed to update work request')
    }

    return {
      ...data,
      customer_name: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : 'Unknown',
      customer_email: data.customer?.email || '',
      assigned_name: data.assigned?.name || ''
    }
  }

  // Delete a work request
  async deleteWorkRequest(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('work_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting work request:', error)
      throw new Error('Failed to delete work request')
    }
  }

  // Get work request statistics
  async getWorkRequestStats(tenantId: string): Promise<{
    total: number
    submitted: number
    under_review: number
    approved: number
    rejected: number
    in_progress: number
    completed: number
  }> {
    const { data, error } = await this.supabaseClient
      .from('work_requests')
      .select('status')
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error fetching work request stats:', error)
      throw new Error('Failed to fetch work request statistics')
    }

    const stats = {
      total: data.length,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      in_progress: 0,
      completed: 0
    }

    data.forEach(item => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats]++
      }
    })

    return stats
  }

  // Get team members for assignment
  async getTeamMembers(tenantId: string): Promise<Array<{id: string, name: string, role: string}>> {
    const { data, error } = await this.supabaseClient
      .from('team_members')
      .select('id, name, role')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching team members:', error)
      return []
    }

    return data || []
  }
}

export const workRequestService = new WorkRequestService()

