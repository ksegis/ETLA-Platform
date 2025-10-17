'use client';


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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

// Database-aligned interfaces based on discovered table structure
interface ProjectCharter {
  id: string
  // Try multiple possible field names for title
  name?: string
  title?: string
  project_name?: string
  project_title?: string
  description?: string
  status?: string
  priority?: string
  start_date?: string
  end_date?: string
  budget?: number
  // Try multiple possible field names for team lead
  assigned_team_lead?: string
  team_lead?: string
  project_manager?: string
  manager?: string
  tenant_id: string
  created_at: string
  updated_at: string
  // PMBOK Framework fields (all optional for compatibility)
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
  // Try multiple possible field names
  name?: string
  title?: string
  request_title?: string
  description?: string
  status?: string
  priority?: string
  customer_id?: string
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
  // Try multiple possible field names for risk title
  name?: string
  title?: string
  risk_title?: string
  risk_name?: string
  description?: string
  risk_description?: string
  // Try multiple possible field names for risk level
  risk_level?: string
  level?: string
  severity?: string
  priority?: string
  status?: string
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

export default function DatabaseAlignedProjectManagementPage() {
  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setloading] = useState(true)
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
    name: '',
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

  // Helper function to get display title from project (try multiple field names)
  const getProjectTitle = (project: ProjectCharter): string => {
    return project.title || project.name || project.project_name || project.project_title || 'Untitled Project'
  }

  // Helper function to get display name from work request
  const getWorkRequestTitle = (workRequest: WorkRequest): string => {
    return workRequest.title || workRequest.name || workRequest.request_title || 'Untitled Request'
  }

  // Helper function to get display name from risk
  const getRiskTitle = (risk: Risk): string => {
    return risk.risk_title || risk.title || risk.name || risk.risk_name || 'Untitled Risk'
  }

  // Helper function to get team lead (try multiple field names)
  const getTeamLead = (project: ProjectCharter): string => {
    return project.assigned_team_lead || project.team_lead || project.project_manager || project.manager || ''
  }

  // Helper function to get risk level (try multiple field names)
  const getRiskLevel = (risk: Risk): string => {
    return risk.risk_level || risk.level || risk.severity || risk.priority || 'medium'
  }

  // Enhanced load data function with database-aligned queries
  const loadData = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!selectedTenant) {
      console.log('No tenant selected, skipping load')
      setloading(false)
      return
    }

    try {
      setloading(true)
      setError(null)
      
      console.log('loading project data for tenant:', selectedTenant)
      // Load projects from project_charters table
      try {
        console.log('loading from project_charters table...');
        const { data: projectData, error: projectError } = await supabase
          .from('project_charters')
        .select('*')
          .eq('tenant_id', selectedTenant)
          .order('created_at', { ascending: false });

        if (projectError) {
          console.error('Project charters query error:', projectError)
          setError(`Failed to load projects: ${projectError.message}`)
        } else {
          console.log('Successfully loaded projects from project_charters:', projectData?.length || 0)
          setProjects(projectData || [])
        }
      } catch (projectErr) {
        console.error('Error loading projects:', projectErr)
        setProjects([])
        setError('Failed to load projects. Please check database connection.')
      }

      // Load work requests
      try {
        console.log('loading from work_requests table...')
        const { data: workRequestData, error: workRequestError } = await supabase
          .from('work_requests')
          .select('*')
          .eq('tenant_id', selectedTenant)
          .order('created_at', { ascending: false })

        if (workRequestError) {
          console.error('Work requests query error:', workRequestError)
          console.log('Work requests table may not be accessible, continuing without work requests')
          setWorkRequests([])
        } else {
          console.log('Successfully loaded work requests:', workRequestData?.length || 0)
          setWorkRequests(workRequestData || [])
        }
      } catch (workRequestErr) {
        console.error('Error loading work requests:', workRequestErr)
        setWorkRequests([])
      }

      // Load risks from risk_register table
      try {
        console.log("loading from risk_register table...")
        const { data: riskData, error: riskError } = await supabase
          .from('risk_register')
          .select('*')
          .eq('tenant_id', selectedTenant)
          .order('created_at', { ascending: false })

        if (riskError) {
          console.error('Risk register query error:', riskError)
          console.log('Risk register table may not be accessible, continuing without risks')
          setRisks([])
        } else {
          console.log('Successfully loaded risks from risk_register:', riskData?.length || 0)
          setRisks(riskData || [])
        }
      } catch (riskErr) {
        console.error('Error loading risks:', riskErr)
        setRisks([])
      }

    } catch (err) {
      console.error('Unexpected error loading data:', err)
      setError('Failed to load project management data. Please check your database connection.')
    } finally {
      setloading(false)
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
    highRisks: risks.filter((r) => getRiskLevel(r) === 'high').length,
    mitigatedRisks: risks.filter((r) => r.status === 'resolved').length
  }

  // Filter projects with database compatibility
  const filteredProjects = projects.filter((project: any) => {
    const title = getProjectTitle(project)
    const description = project.description || ''
    const teamLead = getTeamLead(project)
    const projectCode = project.project_code || ''
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         teamLead.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         projectCode.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || project.status === filters.status
    const matchesPriority = filters.priority === 'all' || project.priority === filters.priority
    const matchesTeamLead = filters.teamLead === 'all' || teamLead === filters.teamLead
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTeamLead
  })

  // Filter work requests with database compatibility
  const filteredWorkRequests = workRequests.filter((wr: any) => {
    const title = getWorkRequestTitle(wr)
    const description = wr.description || ''
    const customerName = wr.customer_name || ''
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || wr.status === filters.status
    const matchesPriority = filters.priority === 'all' || wr.priority === filters.priority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Filter risks with database compatibility
  const filteredRisks = risks.filter((risk: any) => {
    const title = getRiskTitle(risk)
    const description = risk.risk_description || risk.description || ''
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || risk.status === filters.status
    const matchesPriority = filters.priority === 'all' || getRiskLevel(risk) === filters.priority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
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

  // Database-aligned create project function
  const handleCreateProject = async () => {
    const supabase = createSupabaseBrowserClient();
  if (!selectedTenant || (!newProject.title && !newProject.name)) {
      setError('Please provide a project title and ensure a tenant is selected.')
      return
    }

    try {
      setError(null)
      
      // Prepare data with multiple field variations for maximum compatibility
      const projectData = {
        // Include both title and name fields
        title: newProject.title || newProject.name,
        name: newProject.name || newProject.title,
        project_name: newProject.name || newProject.title,
        project_title: newProject.title || newProject.name,
        
        description: newProject.description,
        status: newProject.status,
        priority: newProject.priority,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        budget: newProject.budget,
        
        // Include multiple team lead field variations
ssigned_team_lead: newProject.assigned_team_lead,
        team_lead: newProject.assigned_team_lead,
        project_manager: newProject.assigned_team_lead,
        manager: newProject.assigned_team_lead,
        
        tenant_id: selectedTenant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // PMBOK fields
        project_scope: newProject.project_scope,
        success_criteria: newProject.success_criteria,
        stakeholders: newProject.stakeholders,
        risk_assessment: newProject.risk_assessment,
        quality_metrics: newProject.quality_metrics,
        communication_plan: newProject.communication_plan,
        resource_requirements: newProject.resource_requirements,
        milestone_schedule: newProject.milestone_schedule,
        deliverables: newProject.deliverables,
        constraints: newProject.constraints,
        assumptions: newProject.assumptions,
        work_request_id: newProject.work_request_id,
        project_code: newProject.project_code,
        business_case: newProject.business_case,
        charter_status: newProject.charter_status
      }

      const { data, error } = await supabase
        .from('project_charters')
        .insert([projectData])
        .select()

      if (error) {
        console.error('Error creating project:', error)
        setError(`Failed to create project: ${error.message}`)
      } else {
        console.log('Successfully created project:', data)
        setProjects([data[0], ...projects])
        setShowCreateModal(false)
        setNewProject({})
      }
    } catch (err) {
      console.error('Unexpected error creating project:', err)
      setError('An unexpected error occurred while creating the project.')
    }
  }

  // Database-aligned update project function
  const handleUpdateProject = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!selectedProject?.id) return

    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('project_charters')
        .update(selectedProject)
        .eq('id', selectedProject.id)
        .select()

      if (error) {
        console.error('Error updating project:', error)
        setError(`Failed to update project: ${error.message}`)
      } else {
        console.log('Successfully updated project:', data)
        setProjects(projects.map((p) => (p.id === selectedProject.id ? data[0] : p)))
        setShowEditModal(false)
        setSelectedProject(null)
      }
    } catch (err) {
      console.error('Unexpected error updating project:', err)
      setError('An unexpected error occurred while updating the project.')
    }
  }

  // Database-aligned delete project function
  const handleDeleteProject = async (projectId: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      setError(null)
      
      const { error } = await supabase
        .from('project_charters')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        setError(`Failed to delete project: ${error.message}`)
      } else {
        console.log('Successfully deleted project:', projectId)
        setProjects(projects.filter((p) => p.id !== projectId))
      }
    } catch (err) {
      console.error('Unexpected error deleting project:', err)
      setError('An unexpected error occurred while deleting the project.')
    }
  }

  // Render functions for different tabs
  const renderProjects = () => (
    <div className="space-y-4">
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{getProjectTitle(project)}</h3>
                  <p className="text-sm text-gray-500">{project.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    <span className="text-sm text-gray-600">{formatDate(project.end_date || '')}</span>
                    <span className="text-sm font-semibold">{formatCurrency(project.budget || 0)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => { setSelectedProject(project); setShowEditModal(true) }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteProject(project.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{getProjectTitle(project)}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="font-semibold">Status:</span> <Badge className={getStatusColor(project.status)}>{project.status}</Badge></div>
                  <div className="flex justify-between"><span className="font-semibold">Priority:</span> <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge></div>
                  <div className="flex justify-between"><span className="font-semibold">End Date:</span> {formatDate(project.end_date || '')}</div>
                  <div className="flex justify-between"><span className="font-semibold">Budget:</span> {formatCurrency(project.budget || 0)}</div>
                </div>
              </CardContent>
              <div className="p-4 border-t flex justify-end space-x-2">
                <Button variant="outline" size="icon" onClick={() => { setSelectedProject(project); setShowEditModal(true) }}><Edit className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteProject(project.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderWorkRequests = () => (
    <div className="space-y-4">
      {filteredWorkRequests.map((wr) => (
        <Card key={wr.id}>
          <CardContent className="p-4">
            <h3 className="font-bold">{getWorkRequestTitle(wr)}</h3>
            <p className="text-sm text-gray-500">{wr.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getStatusColor(wr.status)}>{wr.status}</Badge>
              <Badge className={getPriorityColor(wr.priority)}>{wr.priority}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderRisks = () => (
    <div className="space-y-4">
      {filteredRisks.map((risk) => (
        <Card key={risk.id}>
          <CardContent className="p-4">
            <h3 className="font-bold">{getRiskTitle(risk)}</h3>
            <p className="text-sm text-gray-500">{risk.description || risk.risk_description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getStatusColor(risk.status)}>{risk.status}</Badge>
              <Badge className={getPriorityColor(getRiskLevel(risk))}>{getRiskLevel(risk)}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Main render
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search..." 
              value={filters.searchTerm} 
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-64"
            />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border-gray-300 rounded-md">
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Button onClick={() => setShowCreateModal(true)}><Plus className="mr-2 h-4 w-4" /> New Project</Button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('projects')} className={`py-4 px-1 border-b-2 ${activeTab === 'projects' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Projects</button>
            <button onClick={() => setActiveTab('work-requests')} className={`py-4 px-1 border-b-2 ${activeTab === 'work-requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Work Requests</button>
            <button onClick={() => setActiveTab('risks')} className={`py-4 px-1 border-b-2 ${activeTab === 'risks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Risks</button>
          </nav>
        </div>

        {/* Content based on tab */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : error ? (
            <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">{error}</div>
          ) : (
            <div>
              {activeTab === 'projects' && renderProjects()}
              {activeTab === 'work-requests' && renderWorkRequests()}
              {activeTab === 'risks' && renderRisks()}
            </div>
          )}
        </div>

        {/* Create/Edit Modals */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg w-1/2">
              <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
              <div className="space-y-4">
                <Input placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="w-full border-gray-300 rounded-md" />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button onClick={handleCreateProject}>Create</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg w-1/2">
              <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
              <div className="space-y-4">
                <Input placeholder="Project Title" value={selectedProject.title} onChange={(e) => setSelectedProject({ ...selectedProject, title: e.target.value })} />
                <textarea placeholder="Description" value={selectedProject.description} onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })} className="w-full border-gray-300 rounded-md" />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button onClick={handleUpdateProject}>Save Changes</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}







