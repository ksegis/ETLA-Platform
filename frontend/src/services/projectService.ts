import { createClient } from '@/lib/supabase'

export interface Project {
  id: string
  tenant_id: string
  work_request_id: string
  project_code: string
  title: string
  description?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_team_lead: string
  estimated_hours: number
  actual_hours: number
  budget?: number
  start_date: string
  end_date: string
  actual_start_date?: string
  actual_completion_date?: string
  completion_percentage: number
  client_satisfaction_score?: number
  on_time_delivery?: boolean
  budget_variance?: number
  created_at: string
  updated_at: string
  
  // Joined data
  work_request_title?: string
  team_lead_name?: string
  customer_name?: string
}

export interface CreateProjectData {
  work_request_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_team_lead: string
  estimated_hours: number
  budget?: number
  start_date: string
  end_date: string
}

export interface UpdateProjectData {
  title?: string
  description?: string
  status?: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assigned_team_lead?: string
  estimated_hours?: number
  actual_hours?: number
  budget?: number
  start_date?: string
  end_date?: string
  actual_start_date?: string
  actual_completion_date?: string
  completion_percentage?: number
  client_satisfaction_score?: number
  on_time_delivery?: boolean
  budget_variance?: number
}

export interface ProjectMilestone {
  id: string
  project_id: string
  title: string
  description?: string
  due_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'at_risk'
  completion_percentage: number
  created_at: string
  updated_at: string
}

export interface ProjectDeliverable {
  id: string
  project_id: string
  milestone_id?: string
  title: string
  description?: string
  file_path?: string
  due_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  submitted_at?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

class ProjectService {
  private supabase = createClient()

  // Get all projects for a tenant
  async getProjects(tenantId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        work_request:work_requests!work_request_id(title, customer_id, customer:users!customer_id(first_name, last_name)),
        team_lead:team_members!assigned_team_lead(name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      throw new Error('Failed to fetch projects')
    }

    return data.map(item => ({
      ...item,
      work_request_title: item.work_request?.title || '',
      team_lead_name: item.team_lead?.name || '',
      customer_name: item.work_request?.customer ? 
        `${item.work_request.customer.first_name} ${item.work_request.customer.last_name}` : 'Unknown'
    }))
  }

  // Get a single project by ID
  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        work_request:work_requests!work_request_id(title, customer_id, customer:users!customer_id(first_name, last_name)),
        team_lead:team_members!assigned_team_lead(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return {
      ...data,
      work_request_title: data.work_request?.title || '',
      team_lead_name: data.team_lead?.name || '',
      customer_name: data.work_request?.customer ? 
        `${data.work_request.customer.first_name} ${data.work_request.customer.last_name}` : 'Unknown'
    }
  }

  // Create a new project from work request
  async createProject(projectData: CreateProjectData, tenantId: string): Promise<Project> {
    // Generate project code
    const projectCode = await this.generateProjectCode(tenantId)
    
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        ...projectData,
        tenant_id: tenantId,
        project_code: projectCode,
        status: 'scheduled',
        actual_hours: 0,
        completion_percentage: 0
      })
      .select(`
        *,
        work_request:work_requests!work_request_id(title, customer_id, customer:users!customer_id(first_name, last_name)),
        team_lead:team_members!assigned_team_lead(name)
      `)
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw new Error('Failed to create project')
    }

    return {
      ...data,
      work_request_title: data.work_request?.title || '',
      team_lead_name: data.team_lead?.name || '',
      customer_name: data.work_request?.customer ? 
        `${data.work_request.customer.first_name} ${data.work_request.customer.last_name}` : 'Unknown'
    }
  }

  // Update a project
  async updateProject(id: string, updateData: UpdateProjectData): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        work_request:work_requests!work_request_id(title, customer_id, customer:users!customer_id(first_name, last_name)),
        team_lead:team_members!assigned_team_lead(name)
      `)
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw new Error('Failed to update project')
    }

    return {
      ...data,
      work_request_title: data.work_request?.title || '',
      team_lead_name: data.team_lead?.name || '',
      customer_name: data.work_request?.customer ? 
        `${data.work_request.customer.first_name} ${data.work_request.customer.last_name}` : 'Unknown'
    }
  }

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      throw new Error('Failed to delete project')
    }
  }

  // Get project statistics
  async getProjectStats(tenantId: string): Promise<{
    total: number
    scheduled: number
    in_progress: number
    completed: number
    on_hold: number
    cancelled: number
  }> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('status')
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error fetching project stats:', error)
      throw new Error('Failed to fetch project statistics')
    }

    const stats = {
      total: data.length,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0,
      cancelled: 0
    }

    data.forEach(item => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats]++
      }
    })

    return stats
  }

  // Generate unique project code
  private async generateProjectCode(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const { data, error } = await this.supabase
      .from('projects')
      .select('project_code')
      .eq('tenant_id', tenantId)
      .like('project_code', `PRJ-${year}-%`)
      .order('project_code', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error generating project code:', error)
      return `PRJ-${year}-001`
    }

    if (data.length === 0) {
      return `PRJ-${year}-001`
    }

    const lastCode = data[0].project_code
    const lastNumber = parseInt(lastCode.split('-')[2]) || 0
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0')
    
    return `PRJ-${year}-${nextNumber}`
  }

  // Get project milestones
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    const { data, error } = await this.supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date')

    if (error) {
      console.error('Error fetching project milestones:', error)
      throw new Error('Failed to fetch project milestones')
    }

    return data || []
  }

  // Get project deliverables
  async getProjectDeliverables(projectId: string): Promise<ProjectDeliverable[]> {
    const { data, error } = await this.supabase
      .from('project_deliverables')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date')

    if (error) {
      console.error('Error fetching project deliverables:', error)
      throw new Error('Failed to fetch project deliverables')
    }

    return data || []
  }
}

export const projectService = new ProjectService()

