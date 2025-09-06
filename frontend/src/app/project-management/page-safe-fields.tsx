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
  ThumbsDown,
  Star,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Percent,
  Calculator,
  Tag,
  Building2,
  CreditCard,
  FileCheck,
  UserCheck,
  Clock3,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { supabase } from '@/lib/supabase'

// Safe interfaces using only confirmed existing fields
interface ProjectCharter {
  id: string
  tenant_id: string
  
  // Basic fields that we know exist from the CSV
  project_code?: string
  project_name?: string
  business_case?: string
  project_justification?: string
  success_criteria?: string
  project_objectives?: string
  project_scope?: string
  scope_inclusions?: string
  scope_exclusions?: string
  project_sponsor?: string
  project_manager?: string
  planned_start_date?: string
  planned_end_date?: string
  estimated_budget?: number
  approved_budget?: number
  charter_status?: string
  authorized_by?: string
  authorization_date?: string
  high_level_risks?: string
  key_assumptions?: string
  
  // New fields we added
  title?: string
  project_title?: string
  priority?: string
  start_date?: string
  end_date?: string
  budget?: number
  assigned_team_lead?: string
  team_lead?: string
  manager?: string
  sponsor?: string
  department?: string
  division?: string
  completion_percentage?: number
  
  // Timestamps
  created_at: string
  updated_at?: string
}

interface WorkRequest {
  id: string
  name?: string
  title?: string
  description?: string
  status?: string
  priority?: string
  tenant_id: string
  created_at: string
  updated_at?: string
}

interface Risk {
  id: string
  name?: string
  title?: string
  description?: string
  status?: string
  tenant_id: string
  created_at: string
  updated_at?: string
}

interface ProjectFilters {
  searchTerm: string
  status: string
  priority: string
  department: string
}

export default function SafeFieldsProjectManagementPage() {
  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCharter | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'work-requests' | 'risks'>('projects')

  // Enhanced filters
  const [filters, setFilters] = useState<ProjectFilters>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    department: 'all'
  })

  // Safe new project form state using only confirmed fields
  const [newProject, setNewProject] = useState<Partial<ProjectCharter>>({
    title: '',
    project_name: '',
    project_code: '',
    description: '',
    priority: 'medium',
    charter_status: 'draft',
    completion_percentage: 0,
    budget: 0,
    estimated_budget: 0
  })

  const { user } = useAuth()
  const { selectedTenant } = useTenant()

  // Helper function to get display name with fallbacks
  const getDisplayName = (item: ProjectCharter | WorkRequest | Risk): string => {
    if ('title' in item && item.title) return item.title
    if ('project_name' in item && item.project_name) return item.project_name
    if ('name' in item && item.name) return item.name
    return 'Untitled'
  }

  // Safe load data function using only confirmed existing fields
  const loadData = async () => {
    if (!selectedTenant?.id) {
      console.log('No tenant selected, skipping load')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading safe project data for tenant:', selectedTenant.id, selectedTenant.name)

      // Load projects with only confirmed existing fields
      try {
        console.log('Loading from project_charters table with safe fields...')
        const { data: projectData, error: projectError } = await supabase
          .from('project_charters')
          .select(`
            id, tenant_id, project_code, project_name, business_case, project_justification,
            success_criteria, project_objectives, project_scope, scope_inclusions, scope_exclusions,
            project_sponsor, project_manager, planned_start_date, planned_end_date, estimated_budget,
            approved_budget, charter_status, authorized_by, authorization_date, high_level_risks,
            key_assumptions, title, project_title, priority, start_date, end_date, budget,
            assigned_team_lead, team_lead, manager, sponsor, department, division,
            completion_percentage, created_at, updated_at
          `)
          .eq('tenant_id', selectedTenant.id)
          .order('created_at', { ascending: false })

        if (projectError) {
          console.error('Project charters query error:', projectError)
          setError(`Failed to load projects: ${projectError.message}`)
        } else {
          console.log('Successfully loaded projects:', projectData?.length || 0)
          setProjects(projectData || [])
        }
      } catch (projectErr) {
        console.error('Error loading projects:', projectErr)
        setProjects([])
        setError('Failed to load projects. Please check database connection.')
      }

      // Load work requests with basic fields
      try {
        console.log('Loading from work_requests table...')
        const { data: workRequestData, error: workRequestError } = await supabase
          .from('work_requests')
          .select('id, name, title, description, status, priority, tenant_id, created_at, updated_at')
          .eq('tenant_id', selectedTenant.id)
          .order('created_at', { ascending: false })

        if (workRequestError) {
          console.error('Work requests query error:', workRequestError)
          setWorkRequests([])
        } else {
          console.log('Successfully loaded work requests:', workRequestData?.length || 0)
          setWorkRequests(workRequestData || [])
        }
      } catch (workRequestErr) {
        console.error('Error loading work requests:', workRequestErr)
        setWorkRequests([])
      }

      // Load risks with basic fields
      try {
        console.log('Loading from risk_register table...')
        const { data: riskData, error: riskError } = await supabase
          .from('risk_register')
          .select('id, name, title, description, status, tenant_id, created_at, updated_at')
          .eq('tenant_id', selectedTenant.id)
          .order('created_at', { ascending: false })

        if (riskError) {
          console.error('Risk register query error:', riskError)
          setRisks([])
        } else {
          console.log('Successfully loaded risks:', riskData?.length || 0)
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
    activeProjects: projects.filter(p => p.charter_status === 'active' || p.charter_status === 'approved').length,
    completedProjects: projects.filter(p => p.completion_percentage === 100).length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || p.estimated_budget || 0), 0),
    totalWorkRequests: workRequests.length,
    totalRisks: risks.length,
    averageCompletion: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length)
      : 0
  }

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const title = project.title || project.project_name || ''
    const description = project.business_case || project.project_justification || ''
    const projectCode = project.project_code || ''
    const teamLead = project.assigned_team_lead || project.team_lead || project.project_manager || ''
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         projectCode.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         teamLead.toLowerCase().includes(filters.searchTerm.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || project.charter_status === filters.status
    const matchesPriority = filters.priority === 'all' || project.priority === filters.priority
    const matchesDepartment = filters.department === 'all' || project.department === filters.department
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment
  })

  // Filter work requests and risks
  const filteredWorkRequests = workRequests.filter(wr => {
    const name = wr.name || wr.title || ''
    const description = wr.description || ''
    
    const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || wr.status === filters.status
    
    return matchesSearch && matchesStatus
  })

  const filteredRisks = risks.filter(risk => {
    const name = risk.name || risk.title || ''
    const description = risk.description || ''
    
    const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || risk.status === filters.status
    
    return matchesSearch && matchesStatus
  })

  // Helper functions
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string | null | undefined) => {
    const statusLower = (status || '').toLowerCase()
    switch (statusLower) {
      case 'active':
      case 'approved':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'draft':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'on_hold':
        return 'bg-orange-100 text-orange-800'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string | null | undefined) => {
    const priorityLower = (priority || '').toLowerCase()
    switch (priorityLower) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Safe create project function using only confirmed fields
  const handleCreateProject = async () => {
    if (!selectedTenant?.id || !newProject.title) {
      setError('Please provide a project title and ensure a tenant is selected.')
      return
    }

    try {
      setError(null)
      
      // Use only confirmed existing fields
      const projectData = {
        title: newProject.title,
        project_name: newProject.project_name || newProject.title,
        project_code: newProject.project_code,
        business_case: newProject.business_case,
        priority: newProject.priority,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        budget: newProject.budget,
        estimated_budget: newProject.estimated_budget,
        assigned_team_lead: newProject.assigned_team_lead,
        sponsor: newProject.sponsor,
        department: newProject.department,
        charter_status: newProject.charter_status,
        completion_percentage: newProject.completion_percentage,
        tenant_id: selectedTenant.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creating project with safe fields:', projectData)

      const { data, error } = await supabase
        .from('project_charters')
        .insert([projectData])
        .select()

      if (error) {
        console.error('Error creating project:', error)
        setError(`Failed to create project: ${error.message}`)
        return
      }

      console.log('Project created successfully:', data)
      setProjects(prev => [data[0], ...prev])
      setShowCreateModal(false)
      resetNewProject()
    } catch (err) {
      console.error('Unexpected error creating project:', err)
      setError('Failed to create project due to an unexpected error.')
    }
  }

  // Reset new project form
  const resetNewProject = () => {
    setNewProject({
      title: '',
      project_name: '',
      project_code: '',
      description: '',
      priority: 'medium',
      charter_status: 'draft',
      completion_percentage: 0,
      budget: 0,
      estimated_budget: 0
    })
  }

  // Safe update project function using only confirmed fields
  const handleUpdateProject = async () => {
    if (!selectedProject?.id) {
      setError('No project selected for update.')
      return
    }

    try {
      setError(null)
      
      // Use only confirmed existing fields
      const updateData = {
        title: selectedProject.title,
        project_name: selectedProject.project_name,
        project_code: selectedProject.project_code,
        business_case: selectedProject.business_case,
        priority: selectedProject.priority,
        start_date: selectedProject.start_date,
        end_date: selectedProject.end_date,
        budget: selectedProject.budget,
        estimated_budget: selectedProject.estimated_budget,
        assigned_team_lead: selectedProject.assigned_team_lead,
        sponsor: selectedProject.sponsor,
        department: selectedProject.department,
        charter_status: selectedProject.charter_status,
        completion_percentage: selectedProject.completion_percentage,
        updated_at: new Date().toISOString()
      }

      console.log('Updating project with safe fields:', updateData)

      const { data, error } = await supabase
        .from('project_charters')
        .update(updateData)
        .eq('id', selectedProject.id)
        .select()

      if (error) {
        console.error('Error updating project:', error)
        setError(`Failed to update project: ${error.message}`)
        return
      }

      console.log('Project updated successfully:', data)
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? data[0] : p))
      setShowEditModal(false)
      setSelectedProject(null)
    } catch (err) {
      console.error('Unexpected error updating project:', err)
      setError('Failed to update project due to an unexpected error.')
    }
  }

  // Delete project function
  const handleDeleteProject = async (projectId: string) => {
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
        return
      }

      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      console.error('Unexpected error deleting project:', err)
      setError('Failed to delete project due to an unexpected error.')
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

  // Project list view with safe fields
  const renderProjectListView = () => (
    <div className="space-y-4">
      {filteredProjects.map((project) => (
        <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(project)}</h3>
                {project.project_code && (
                  <Badge variant="outline" className="text-xs">
                    {project.project_code}
                  </Badge>
                )}
                <Badge className={getStatusColor(project.charter_status)}>
                  {project.charter_status || 'Draft'}
                </Badge>
                {project.priority && (
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{project.business_case || project.project_justification || 'No description'}</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Team Lead:</span>
                  </div>
                  <p className="text-gray-600">{project.assigned_team_lead || project.team_lead || project.project_manager || 'Not assigned'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Timeline:</span>
                  </div>
                  <p className="text-gray-600">
                    {formatDate(project.start_date || project.planned_start_date)} - {formatDate(project.end_date || project.planned_end_date)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Budget:</span>
                  </div>
                  <p className="text-gray-600">{formatCurrency(project.budget || project.estimated_budget)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Progress:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${project.completion_percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600">{project.completion_percentage || 0}%</span>
                  </div>
                </div>
              </div>
              
              {(project.department || project.sponsor) && (
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                  {project.department && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>Dept: {project.department}</span>
                    </div>
                  )}
                  {project.sponsor && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>Sponsor: {project.sponsor}</span>
                    </div>
                  )}
                </div>
              )}
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

  // Project grid view with safe fields
  const renderProjectGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{getDisplayName(project)}</CardTitle>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {project.project_code && (
                    <Badge variant="outline" className="text-xs">
                      {project.project_code}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(project.charter_status)}>
                    {project.charter_status || 'Draft'}
                  </Badge>
                  {project.priority && (
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.business_case || project.project_justification || 'No description'}</p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>{project.assigned_team_lead || project.team_lead || project.project_manager || 'Not assigned'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(project.start_date || project.planned_start_date) || 'Not scheduled'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>{formatCurrency(project.budget || project.estimated_budget)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-gray-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${project.completion_percentage || 0}%` }}
                  ></div>
                </div>
                <span>{project.completion_percentage || 0}%</span>
              </div>
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

  // Render work requests (unchanged)
  const renderWorkRequests = () => (
    <div className="space-y-4">
      {filteredWorkRequests.map((workRequest) => (
        <div key={workRequest.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(workRequest)}</h3>
                <Badge className={getStatusColor(workRequest.status)}>
                  {workRequest.status || 'Unknown'}
                </Badge>
                {workRequest.priority && (
                  <Badge className={getPriorityColor(workRequest.priority)}>
                    {workRequest.priority}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-3">{workRequest.description || 'No description'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(workRequest.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render risks (unchanged)
  const renderRisks = () => (
    <div className="space-y-4">
      {filteredRisks.map((risk) => (
        <div key={risk.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(risk)}</h3>
                <Badge className={getStatusColor(risk.status)}>
                  {risk.status || 'Unknown'}
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">{risk.description || 'No description'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(risk.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Navigation Tabs
  const tabs = [
    { id: 'projects', label: 'Projects', icon: Briefcase, count: filteredProjects.length },
    { id: 'work-requests', label: 'Work Requests', icon: FileText, count: filteredWorkRequests.length },
    { id: 'risks', label: 'Risks', icon: Shield, count: filteredRisks.length }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">Comprehensive project lifecycle management with enhanced database integration</p>
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Projects</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalProjects}</p>
                  <p className="text-xs text-blue-600">{stats.activeProjects} active</p>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Avg Completion</p>
                  <p className="text-2xl font-bold text-green-900">{stats.averageCompletion}%</p>
                  <p className="text-xs text-green-600">{stats.completedProjects} completed</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Budget</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalBudget)}</p>
                  <p className="text-xs text-purple-600">Across all projects</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Work Requests</p>
                  <p className="text-2xl font-bold text-red-900">{stats.totalWorkRequests}</p>
                  <p className="text-xs text-red-600">{stats.totalRisks} risks</p>
                </div>
                <FileText className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b overflow-x-auto">
          {tabs.map((tab) => (
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

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                {activeTab === 'projects' && (
                  <>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    
                    {renderViewModeToggle()}
                  </>
                )}
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
                   'Risks'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {activeTab === 'projects' 
                    ? `${filteredProjects.length} of ${projects.length} projects`
                    : activeTab === 'work-requests'
                    ? `${filteredWorkRequests.length} of ${workRequests.length} work requests`
                    : `${filteredRisks.length} of ${risks.length} risks`
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
                </div>
              ) : (
                renderWorkRequests()
              )
            ) : (
              filteredRisks.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No risks found</p>
                </div>
              ) : (
                renderRisks()
              )
            )}
          </CardContent>
        </Card>

        {/* Create Project Modal with safe fields */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title *
                      </label>
                      <Input
                        value={newProject.title || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Code
                      </label>
                      <Input
                        value={newProject.project_code || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, project_code: e.target.value }))}
                        placeholder="Enter project code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Case
                      </label>
                      <textarea
                        value={newProject.business_case || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, business_case: e.target.value }))}
                        placeholder="Enter business case"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={newProject.priority || 'medium'}
                          onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={newProject.charter_status || 'draft'}
                          onChange={(e) => setNewProject(prev => ({ ...prev, charter_status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="under_review">Under Review</option>
                          <option value="approved">Approved</option>
                          <option value="active">Active</option>
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
                          onChange={(e) => setNewProject(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={newProject.end_date || ''}
                          onChange={(e) => setNewProject(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Team & Budget</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Lead
                      </label>
                      <Input
                        value={newProject.assigned_team_lead || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, assigned_team_lead: e.target.value }))}
                        placeholder="Enter team lead name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sponsor
                      </label>
                      <Input
                        value={newProject.sponsor || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, sponsor: e.target.value }))}
                        placeholder="Enter project sponsor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <Input
                        value={newProject.department || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Enter department"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget
                        </label>
                        <Input
                          type="number"
                          value={newProject.budget || ''}
                          onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Budget
                        </label>
                        <Input
                          type="number"
                          value={newProject.estimated_budget || ''}
                          onChange={(e) => setNewProject(prev => ({ ...prev, estimated_budget: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completion Percentage
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newProject.completion_percentage || ''}
                        onChange={(e) => setNewProject(prev => ({ ...prev, completion_percentage: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
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

        {/* Edit Project Modal with safe fields */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title *
                      </label>
                      <Input
                        value={selectedProject.title || ''}
                        onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Code
                      </label>
                      <Input
                        value={selectedProject.project_code || ''}
                        onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, project_code: e.target.value }) : null)}
                        placeholder="Enter project code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Case
                      </label>
                      <textarea
                        value={selectedProject.business_case || ''}
                        onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, business_case: e.target.value }) : null)}
                        placeholder="Enter business case"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={selectedProject.priority || 'medium'}
                          onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, priority: e.target.value }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={selectedProject.charter_status || 'draft'}
                          onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, charter_status: e.target.value }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="under_review">Under Review</option>
                          <option value="approved">Approved</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                          <option value="cancelled">Cancelled</option>
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
                          onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, start_date: e.target.value }) : null)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={selectedProject.end_date || ''}
                          onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, end_date: e.target.value }) : null)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Team & Budget</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Lead
                      </label>
                      <Input
                        value={selectedProject.assigned_team_lead || ''}
                        onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, assigned_team_lead: e.target.value }) : null)}
                        placeholder="Enter team lead name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sponsor
                      </label>
                      <Input
                        value={selectedProject.sponsor || ''}
                        onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, sponsor: e.target.value }) : null)}
                        placeholder="Enter project sponsor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <Input
                        value={selectedProject.department || ''}
                        onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, department: e.target.value }) : null)}
                        placeholder="Enter department"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget
                        </label>
                        <Input
                          type="number"
                          value={selectedProject.budget || ''}
                          onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, budget: parseFloat(e.target.value) || 0 }) : null)}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Budget
                        </label>
                        <Input
                          type="number"
                          value={selectedProject.estimated_budget || ''}
                          onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, estimated_budget: parseFloat(e.target.value) || 0 }) : null)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completion Percentage
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedProject.completion_percentage || ''}
                        onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, completion_percentage: parseInt(e.target.value) || 0 }) : null)}
                        placeholder="0"
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

