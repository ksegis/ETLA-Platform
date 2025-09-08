'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Building,
  AlertCircle,
  Loader2,
  List,
  Grid,
  Target,
  Clipboard,
  BarChart3,
  Settings,
  MapPin,
  Timer,
  Award,
  Briefcase,
  Save,
  X,
  Shield,
  Network,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { supabase } from '@/lib/supabase'

// Enhanced interfaces for comprehensive project management
interface ProjectCharter {
  id: string
  title: string
  description: string
  status: string
  priority: string
  start_date: string
  end_date: string
  budget: number
  assigned_team_lead: string
  tenant_id: string
  created_at: string
  updated_at: string
  // PMBOK Framework fields
  project_scope?: string
  success_criteria?: string
  stakeholders?: string[]
  risk_assessment?: string
  quality_metrics?: string
  communication_plan?: string
  resource_requirements?: string
  milestone_schedule?: any[]
  deliverables?: string[]
  constraints?: string
  assumptions?: string
  work_request_id?: string
  project_code?: string
  business_case?: string
  charter_status?: string
  estimated_budget?: number
}

interface WorkRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  customer_id: string
  tenant_id: string
  created_at: string
  updated_at: string
  business_justification?: string
  estimated_budget?: number
  requested_completion_date?: string
  department?: string
  requestor_name?: string
  customer_name?: string
  customer_email?: string
  category?: string
}

interface Risk {
  id: string
  risk_title: string
  risk_description: string
  risk_level: string
  status: string
  project_id?: string
  tenant_id: string
  created_at: string
  updated_at: string
  mitigation_plan?: string
  impact_assessment?: string
  probability?: string
}

interface ProjectFilters {
  searchTerm: string
  status: string
  priority: string
  teamLead: string
  dateRange: string
}

export default function EnhancedProjectManagementPage() {
  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCharter | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'work-requests' | 'risks' | 'charter' | 'wbs' | 'schedule' | 'evm' | 'stakeholders' | 'compliance'>('projects')

  // Enhanced filters
  const [filters, setFilters] = useState<ProjectFilters>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    teamLead: 'all',
    dateRange: 'all'
  })

  // New project form state
  const [newProject, setNewProject] = useState<Partial<ProjectCharter>>({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget: 0,
    assigned_team_lead: '',
    project_scope: '',
    success_criteria: '',
    stakeholders: [],
    risk_assessment: '',
    quality_metrics: '',
    communication_plan: '',
    resource_requirements: '',
    milestone_schedule: [],
    deliverables: [],
    constraints: '',
    assumptions: '',
    work_request_id: '',
    project_code: '',
    business_case: '',
    charter_status: 'draft'
  })

  const { user } = useAuth()
  const { selectedTenant } = useTenant()

  // Load projects, work requests, and risks from database
  const loadData = async () => {
    if (!selectedTenant?.id) {
      console.log('No tenant selected, skipping load')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading project data for tenant:', selectedTenant.id, selectedTenant.name)

      // Load projects
      const { data: projectData, error: projectError } = await supabase
        .from('project_charters')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('created_at', { ascending: false })

      if (projectError) {
        console.error('Project query error:', projectError)
        setError(`Failed to load projects: ${projectError.message}`)
        return
      }

      // Load work requests
      const { data: workRequestData, error: workRequestError } = await supabase
        .from('work_requests')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('created_at', { ascending: false })

      if (workRequestError) {
        console.error('Work request query error:', workRequestError)
        setError(`Failed to load work requests: ${workRequestError.message}`)
        return
      }

      // Load risks
      const { data: riskData, error: riskError } = await supabase
        .from('risks')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('created_at', { ascending: false })

      if (riskError) {
        console.error('Risk query error:', riskError)
        // Don't fail completely if risks table doesn't exist
        console.log('Risks table may not exist, continuing without risks')
      }

      console.log('Loaded projects:', projectData)
      console.log('Loaded work requests:', workRequestData)
      console.log('Loaded risks:', riskData)
      
      setProjects(projectData || [])
      setWorkRequests(workRequestData || [])
      setRisks(riskData || [])
    } catch (err) {
      console.error('Unexpected error loading data:', err)
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Load data when tenant is selected
  useEffect(() => {
    loadData()
  }, [selectedTenant])

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => ['active', 'in_progress', 'planning'].includes(p.status || '')).length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    onHoldProjects: projects.filter((p) => p.status === 'on_hold').length,
    totalWorkRequests: workRequests.length,
    pendingWorkRequests: workRequests.filter((wr) => ['submitted', 'under_review'].includes(wr.status || '')).length,
    approvedWorkRequests: workRequests.filter((wr) => wr.status === 'approved').length,
    totalBudget: projects.reduce((sum, p: any) => sum + (p.budget || 0), 0),
    totalRisks: risks.length,
    highRisks: risks.filter((r) => r.risk_level === 'high').length,
    mitigatedRisks: risks.filter((r) => r.status === 'resolved').length
  }

  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = (project.title || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (project.assigned_team_lead || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (project.project_code || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || project.status === filters.status
    const matchesPriority = filters.priority === 'all' || project.priority === filters.priority
    const matchesTeamLead = filters.teamLead === 'all' || project.assigned_team_lead === filters.teamLead
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTeamLead
  })

  // Filter work requests
  const filteredWorkRequests = workRequests.filter((wr: any) => {
    const matchesSearch = (wr.title || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (wr.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (wr.customer_name || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || wr.status === filters.status
    const matchesPriority = filters.priority === 'all' || wr.priority === filters.priority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Filter risks
  const filteredRisks = risks.filter((risk: any) => {
    const matchesSearch = (risk.risk_title || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (risk.risk_description || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || risk.status === filters.status
    const matchesPriority = filters.priority === 'all' || risk.risk_level === filters.priority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string | null | undefined) => {
    const statusLower = (status || '').toLowerCase()
    switch (statusLower) {
      case 'planning':
      case 'draft':
        return 'bg-purple-100 text-purple-800'
      case 'active':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'resolved':
      case 'mitigated':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string | null | undefined) => {
    const priorityLower = (priority || '').toLowerCase()
    switch (priorityLower) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Create new project
  const handleCreateProject = async () => {
    if (!selectedTenant?.id || !newProject.title) return

    try {
      const projectData = {
        ...newProject,
        tenant_id: selectedTenant.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('project_charters')
        .insert([projectData])
        .select()

      if (error) {
        console.error('Error creating project:', error)
        setError(`Failed to create project: ${error.message}`)
        return
      }

      console.log('Project created:', data)
      setProjects(prev => [data[0], ...prev])
      setShowCreateModal(false)
      resetNewProject()
    } catch (err) {
      console.error('Unexpected error creating project:', err)
      setError('Failed to create project')
    }
  }

  // Reset new project form
  const resetNewProject = () => {
    setNewProject({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      end_date: '',
      budget: 0,
      assigned_team_lead: '',
      project_scope: '',
      success_criteria: '',
      stakeholders: [],
      risk_assessment: '',
      quality_metrics: '',
      communication_plan: '',
      resource_requirements: '',
      milestone_schedule: [],
      deliverables: [],
      constraints: '',
      assumptions: '',
      work_request_id: '',
      project_code: '',
      business_case: '',
      charter_status: 'draft'
    })
  }

  // Update project
  const handleUpdateProject = async () => {
    if (!selectedProject?.id) return

    try {
      const { data, error } = await supabase
        .from('project_charters')
        .update({
          ...selectedProject,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProject.id)
        .select()

      if (error) {
        console.error('Error updating project:', error)
        setError(`Failed to update project: ${error.message}`)
        return
      }

      console.log('Project updated:', data)
      setProjects(prev => prev.map((p: any) => p.id === selectedProject.id ? data[0] : p))
      setShowEditModal(false)
      setSelectedProject(null)
    } catch (err) {
      console.error('Unexpected error updating project:', err)
      setError('Failed to update project')
    }
  }

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('project_charters')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        setError(`Failed to delete project: ${error.message}`)
        return
      }

      setProjects(prev => prev.filter((p: any) => p.id !== projectId))
    } catch (err) {
      console.error('Unexpected error deleting project:', err)
      setError('Failed to delete project')
    }
  }

  // Create project from work request
  const createProjectFromWorkRequest = (workRequest: WorkRequest) => {
    setNewProject({
      title: workRequest.title,
      description: workRequest.description,
      status: 'planning',
      priority: workRequest.priority,
      start_date: '',
      end_date: workRequest.requested_completion_date || '',
      budget: workRequest.estimated_budget || 0,
      assigned_team_lead: '',
      project_scope: workRequest.description,
      success_criteria: '',
      stakeholders: [workRequest.requestor_name || workRequest.customer_name || ''],
      risk_assessment: '',
      quality_metrics: '',
      communication_plan: '',
      resource_requirements: '',
      milestone_schedule: [],
      deliverables: [],
      constraints: '',
      assumptions: workRequest.business_justification || '',
      work_request_id: workRequest.id,
      project_code: `PRJ-${Date.now()}`,
      business_case: workRequest.business_justification || '',
      charter_status: 'draft'
    })
    setShowCreateModal(true)
  }

  // Approve/Decline work request
  const handleWorkRequestAction = async (workRequestId: string, action: 'approve' | 'decline', comments?: string) => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'declined'
      
      const { data, error } = await supabase
        .from('work_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', workRequestId)
        .select()

      if (error) {
        console.error('Error updating work request:', error)
        setError(`Failed to ${action} work request: ${error.message}`)
        return
      }

      setWorkRequests(prev => prev.map((wr: any) => wr.id === workRequestId ? data[0] : wr))
    } catch (err) {
      console.error(`Unexpected error ${action}ing work request:`, err)
      setError(`Failed to ${action} work request`)
    }
  }

  // Render view mode toggle
  const renderViewModeToggle = () => (
    <div className="flex border rounded-md">
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="rounded-r-none"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('grid')}
        className="rounded-l-none"
      >
        <Grid className="w-4 h-4" />
      </Button>
    </div>
  )

  // Render project list view
  const renderProjectListView = () => (
    <div className="space-y-4">
      {filteredProjects.map((project: any) => (
        <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                {project.project_code && (
                  <Badge variant="outline" className="text-xs">
                    {project.project_code}
                  </Badge>
                )}
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {formatDate(project.start_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>End: {formatDate(project.end_date)}</span>
                </div>
                {project.budget && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Budget: {formatCurrency(project.budget)}</span>
                  </div>
                )}
                {project.assigned_team_lead && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Lead: {project.assigned_team_lead}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedProject(project)
                setShowEditModal(true)
              }}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedProject(project)
                setShowEditModal(true)
              }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDeleteProject(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render project grid view
  const renderProjectGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project: any) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                {project.project_code && (
                  <p className="text-sm text-gray-500 mb-2">{project.project_code}</p>
                )}
                <div className="flex gap-2 mb-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
              </div>
              {project.budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>{formatCurrency(project.budget)}</span>
                </div>
              )}
              {project.assigned_team_lead && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{project.assigned_team_lead}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                setSelectedProject(project)
                setShowEditModal(true)
              }}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                setSelectedProject(project)
                setShowEditModal(true)
              }}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Render work requests
  const renderWorkRequests = () => (
    <div className="space-y-4">
      {filteredWorkRequests.map((workRequest: any) => (
        <div key={workRequest.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{workRequest.title}</h3>
                <Badge className={getStatusColor(workRequest.status)}>
                  {workRequest.status}
                </Badge>
                <Badge className={getPriorityColor(workRequest.priority)}>
                  {workRequest.priority}
                </Badge>
                {workRequest.category && (
                  <Badge variant="outline" className="text-xs">
                    {workRequest.category}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-3">{workRequest.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(workRequest.created_at)}</span>
                </div>
                {workRequest.estimated_budget && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Est. Budget: {formatCurrency(workRequest.estimated_budget)}</span>
                  </div>
                )}
                {workRequest.customer_name && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Customer: {workRequest.customer_name}</span>
                  </div>
                )}
                {workRequest.department && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>Dept: {workRequest.department}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              {workRequest.status === 'approved' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => createProjectFromWorkRequest(workRequest)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Project
                </Button>
              )}
              {workRequest.status === 'submitted' && (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleWorkRequestAction(workRequest.id, 'approve')}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleWorkRequestAction(workRequest.id, 'decline')}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render risks
  const renderRisks = () => (
    <div className="space-y-4">
      {filteredRisks.map((risk: any) => (
        <div key={risk.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{risk.risk_title}</h3>
                <Badge className={getStatusColor(risk.status)}>
                  {risk.status}
                </Badge>
                <Badge className={getPriorityColor(risk.risk_level)}>
                  {risk.risk_level} Risk
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">{risk.risk_description}</p>
              {risk.mitigation_plan && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Mitigation Plan:</p>
                  <p className="text-sm text-gray-600">{risk.mitigation_plan}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(risk.created_at)}</span>
                </div>
                {risk.probability && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Probability: {risk.probability}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // PMBOK Navigation Tabs
  const tabs = [
    { id: 'projects', label: 'Projects', icon: Briefcase, count: filteredProjects.length },
    { id: 'work-requests', label: 'Work Requests', icon: FileText, count: filteredWorkRequests.length },
    { id: 'risks', label: 'Risks', icon: Shield, count: filteredRisks.length },
    { id: 'charter', label: 'Charter', icon: Award, count: 0 },
    { id: 'wbs', label: 'WBS', icon: Network, count: 0 },
    { id: 'schedule', label: 'Schedule', icon: Calendar, count: 0 },
    { id: 'evm', label: 'EVM', icon: BarChart3, count: 0 },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users, count: 0 },
    { id: 'compliance', label: 'Compliance', icon: Target, count: 0 },
  ]

  if (!selectedTenant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please select a tenant to view project management.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading project data...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">Comprehensive project lifecycle management with PMBOK framework</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Projects</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalProjects}</p>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeProjects}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completedProjects}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">On Hold</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.onHoldProjects}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Work Requests</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalWorkRequests}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending WR</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pendingWorkRequests}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Approved WR</p>
                  <p className="text-2xl font-bold text-green-900">{stats.approvedWorkRequests}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">High Risks</p>
                  <p className="text-2xl font-bold text-red-900">{stats.highRisks}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700">Total Budget</p>
                  <p className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.totalBudget)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PMBOK Tab Navigation */}
        <div className="flex space-x-1 border-b overflow-x-auto">
          {tabs.map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4 inline mr-2" />
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Enhanced Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search ${activeTab === 'projects' ? 'projects' : activeTab === 'work-requests' ? 'work requests' : 'risks'}...`}
                    value={filters.searchTerm}
                    onChange={(e: any) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filters.status}
                  onChange={(e: any) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {activeTab === 'projects' ? (
                    <>
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  ) : activeTab === 'work-requests' ? (
                    <>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </>
                  ) : (
                    <>
                      <option value="open">Open</option>
                      <option value="mitigated">Mitigated</option>
                      <option value="resolved">Resolved</option>
                    </>
                  )}
                </select>
                <select
                  value={filters.priority}
                  onChange={(e: any) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                {activeTab === 'projects' && renderViewModeToggle()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-gray-900">
                  {activeTab === 'projects' ? 'Projects' : 
                   activeTab === 'work-requests' ? 'Work Requests' : 
                   activeTab === 'risks' ? 'Risks' : 
                   activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {activeTab === 'projects' 
                    ? `${filteredProjects.length} of ${projects.length} projects`
                    : activeTab === 'work-requests'
                    ? `${filteredWorkRequests.length} of ${workRequests.length} work requests`
                    : activeTab === 'risks'
                    ? `${filteredRisks.length} of ${risks.length} risks`
                    : 'Feature coming soon'
                  }
                  {selectedTenant && <span className="ml-2">| Tenant: {selectedTenant.name}</span>}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'projects' ? (
              filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No projects found</p>
                  <p className="text-sm text-gray-500">
                    {projects.length === 0 
                      ? 'Create your first project to get started.' 
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              ) : (
                viewMode === 'list' ? renderProjectListView() : renderProjectGridView()
              )
            ) : activeTab === 'work-requests' ? (
              filteredWorkRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No work requests found</p>
                  <p className="text-sm text-gray-500">
                    {workRequests.length === 0 
                      ? 'No work requests exist yet.' 
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                </div>
              ) : (
                renderWorkRequests()
              )
            ) : activeTab === 'risks' ? (
              filteredRisks.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No risks found</p>
                  <p className="text-sm text-gray-500">
                    {risks.length === 0 
                      ? 'No risks identified yet.' 
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                </div>
              ) : (
                renderRisks()
              )
            ) : (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</p>
                <p className="text-sm text-gray-500">This PMBOK framework module is coming soon.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Create New Project</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetNewProject()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title *
                      </label>
                      <Input
                        value={newProject.title || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Code
                      </label>
                      <Input
                        value={newProject.project_code || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, project_code: e.target.value }))}
                        placeholder="Enter project code (e.g., PRJ-2024-001)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newProject.description || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter project description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={newProject.status || 'planning'}
                          onChange={(e: any) => setNewProject(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="planning">Planning</option>
                          <option value="active">Active</option>
                          <option value="in_progress">In Progress</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={newProject.priority || 'medium'}
                          onChange={(e: any) => setNewProject(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={newProject.start_date || ''}
                          onChange={(e: any) => setNewProject(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={newProject.end_date || ''}
                          onChange={(e: any) => setNewProject(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget
                        </label>
                        <Input
                          type="number"
                          value={newProject.budget || 0}
                          onChange={(e: any) => setNewProject(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Team Lead
                        </label>
                        <Input
                          value={newProject.assigned_team_lead || ''}
                          onChange={(e: any) => setNewProject(prev => ({ ...prev, assigned_team_lead: e.target.value }))}
                          placeholder="Enter team lead name"
                        />
                      </div>
                    </div>

                    {/* Work Request Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link to Work Request (Optional)
                      </label>
                      <select
                        value={newProject.work_request_id || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, work_request_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a work request</option>
                        {workRequests.filter((wr: any) => wr.status === 'approved').map((wr) => (
                          <option key={wr.id} value={wr.id}>{wr.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* PMBOK Framework Fields */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Project Framework</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Case
                      </label>
                      <textarea
                        value={newProject.business_case || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, business_case: e.target.value }))}
                        placeholder="Define business justification and expected benefits"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Scope
                      </label>
                      <textarea
                        value={newProject.project_scope || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, project_scope: e.target.value }))}
                        placeholder="Define project scope and boundaries"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Success Criteria
                      </label>
                      <textarea
                        value={newProject.success_criteria || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, success_criteria: e.target.value }))}
                        placeholder="Define success criteria and acceptance criteria"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Risk Assessment
                      </label>
                      <textarea
                        value={newProject.risk_assessment || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, risk_assessment: e.target.value }))}
                        placeholder="Identify potential risks and mitigation strategies"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Requirements
                      </label>
                      <textarea
                        value={newProject.resource_requirements || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, resource_requirements: e.target.value }))}
                        placeholder="Define required resources (human, material, equipment)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quality Metrics
                      </label>
                      <textarea
                        value={newProject.quality_metrics || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, quality_metrics: e.target.value }))}
                        placeholder="Define quality standards and metrics"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Constraints
                      </label>
                      <textarea
                        value={newProject.constraints || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, constraints: e.target.value }))}
                        placeholder="List project constraints (time, budget, scope, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assumptions
                      </label>
                      <textarea
                        value={newProject.assumptions || ''}
                        onChange={(e: any) => setNewProject(prev => ({ ...prev, assumptions: e.target.value }))}
                        placeholder="List project assumptions"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t">
                  <Button onClick={handleCreateProject} disabled={!newProject.title}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateModal(false)
                      resetNewProject()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showEditModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Edit Project</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedProject(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title *
                      </label>
                      <Input
                        value={selectedProject.title || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Code
                      </label>
                      <Input
                        value={selectedProject.project_code || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, project_code: e.target.value }) : null)}
                        placeholder="Enter project code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={selectedProject.description || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                        placeholder="Enter project description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={selectedProject.status || 'planning'}
                          onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, status: e.target.value }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="planning">Planning</option>
                          <option value="active">Active</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={selectedProject.priority || 'medium'}
                          onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, priority: e.target.value }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={selectedProject.start_date || ''}
                          onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, start_date: e.target.value }) : null)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={selectedProject.end_date || ''}
                          onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, end_date: e.target.value }) : null)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget
                        </label>
                        <Input
                          type="number"
                          value={selectedProject.budget || 0}
                          onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, budget: parseFloat(e.target.value) || 0 }) : null)}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Team Lead
                        </label>
                        <Input
                          value={selectedProject.assigned_team_lead || ''}
                          onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, assigned_team_lead: e.target.value }) : null)}
                          placeholder="Enter team lead name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PMBOK Framework Fields */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Project Framework</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Case
                      </label>
                      <textarea
                        value={selectedProject.business_case || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, business_case: e.target.value }) : null)}
                        placeholder="Define business justification and expected benefits"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Scope
                      </label>
                      <textarea
                        value={selectedProject.project_scope || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, project_scope: e.target.value }) : null)}
                        placeholder="Define project scope and boundaries"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Success Criteria
                      </label>
                      <textarea
                        value={selectedProject.success_criteria || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, success_criteria: e.target.value }) : null)}
                        placeholder="Define success criteria and acceptance criteria"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Risk Assessment
                      </label>
                      <textarea
                        value={selectedProject.risk_assessment || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, risk_assessment: e.target.value }) : null)}
                        placeholder="Identify potential risks and mitigation strategies"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Requirements
                      </label>
                      <textarea
                        value={selectedProject.resource_requirements || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, resource_requirements: e.target.value }) : null)}
                        placeholder="Define required resources (human, material, equipment)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quality Metrics
                      </label>
                      <textarea
                        value={selectedProject.quality_metrics || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, quality_metrics: e.target.value }) : null)}
                        placeholder="Define quality standards and metrics"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Constraints
                      </label>
                      <textarea
                        value={selectedProject.constraints || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, constraints: e.target.value }) : null)}
                        placeholder="List project constraints (time, budget, scope, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assumptions
                      </label>
                      <textarea
                        value={selectedProject.assumptions || ''}
                        onChange={(e: any) => setSelectedProject(prev => prev ? ({ ...prev, assumptions: e.target.value }) : null)}
                        placeholder="List project assumptions"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t">
                  <Button onClick={handleUpdateProject} disabled={!selectedProject.title}>
                    <Save className="h-4 w-4 mr-2" />
                    Update Project
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedProject(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

