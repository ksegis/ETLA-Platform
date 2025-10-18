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

  // Enhanced load data function with better error handling
  const loadData = async () => {
    if (!selectedTenant) {
      console.log('No tenant selected, skipping load')
      setloading(false)
      return
    }

    try {
      setloading(true)
      setError(null)

      const supabase = createSupabaseBrowserClient();
     console.log("loading project data for tenant:", selectedTenant);
      // Load projects with enhanced error handling
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('project_charters')
          .select('*')
          .eq('tenant_id', selectedTenant)
          .order('created_at', { ascending: false })

        if (projectError) {
          console.error('Project query error:', projectError)
          // Check if table doesn't exist
          if (projectError.message.includes('relation "project_charters" does not exist')) {
            console.log('Project charters table does not exist, using empty array')
            setProjects([])
          } else {
            throw projectError
          }
        } else {
          console.log('Loaded projects:', projectData)
          setProjects(projectData || [])
        }
      } catch (projectErr) {
        console.error('Error loading projects:', projectErr)
        setProjects([])
      }

      // Load work requests with enhanced error handling
      try {
        const { data: workRequestData, error: workRequestError } = await supabase
          .from('work_requests')
          .select('*')
          .eq('tenant_id', selectedTenant)
          .order('created_at', { ascending: false })

        if (workRequestError) {
          console.error('Work request query error:', workRequestError)
          // Check if table doesn't exist
          if (workRequestError.message.includes('relation "work_requests" does not exist')) {
            console.log('Work requests table does not exist, using empty array')
            setWorkRequests([])
          } else {
            throw workRequestError
          }
        } else {
          console.log('Loaded work requests:', workRequestData)
          setWorkRequests(workRequestData || [])
        }
      } catch (workRequestErr) {
        console.error('Error loading work requests:', workRequestErr)
        setWorkRequests([])
      }

      // Load risks with enhanced error handling
      try {
        const { data: riskData, error: riskError } = await supabase
          .from('risks')
          .select('*')
          .eq('tenant_id', selectedTenant)
          .order('created_at', { ascending: false })

        if (riskError) {
          console.error('Risk query error:', riskError)
          // Check if table doesn't exist
          if (riskError.message.includes('relation "risks" does not exist')) {
            console.log('Risks table does not exist, using empty array')
            setRisks([])
          } else {
            console.log('Risk query failed, continuing without risks:', riskError.message)
            setRisks([])
          }
        } else {
          console.log('Loaded risks:', riskData)
          setRisks(riskData || [])
        }
      } catch (riskErr) {
        console.error('Error loading risks:', riskErr)
        setRisks([])
      }

    } catch (err) {
      console.error('Unexpected error loading data:', err)
      setError('Failed to load project management data. Some features may not be available.')
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

  // Enhanced create new project with better error handling
  const handleCreateProject = async () => {
    if (!selectedTenant || !newProject.title) {
      setError('Please provide a project title and ensure a tenant is selected.')
      return
    }

    const supabase = createSupabaseBrowserClient();

    try {
      setError(null)

      const projectData = {
        ...newProject,
                tenant_id: selectedTenant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('project_charters')
        .insert([projectData])
        .select()

      if (error) {
        console.error('Error creating project:', error)
        if (error.message.includes('relation "project_charters" does not exist')) {
          setError('Project management tables are not set up. Please contact your administrator.')
        } else {
          setError(`Failed to create project: ${error.message}`)
        }
        return
      }

      console.log('Project created:', data)
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

  // Enhanced update project with better error handling
  const handleUpdateProject = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!selectedProject?.id) {
      setError('No project selected for update.')
      return
    }

    try {
      setError(null)

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
        if (error.message.includes('relation "project_charters" does not exist')) {
          setError('Project management tables are not set up. Please contact your administrator.')
        } else {
          setError(`Failed to update project: ${error.message}`)
        }
        return
      }

      console.log('Project updated:', data)
      setProjects(prev => prev.map((p: any) => p.id === selectedProject.id ? data[0] : p))
      setShowEditModal(false)
      setSelectedProject(null)
    } catch (err) {
      console.error('Unexpected error updating project:', err)
      setError('Failed to update project due to an unexpected error.')
    }
  }

  // Enhanced delete project with better error handling
  const handleDeleteProject = async (projectId: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      setError(null)

      const { data, error } = await supabase
        .from('project_charters')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        if (error.message.includes('relation "project_charters" does not exist')) {
          setError('Project management tables are not set up. Please contact your administrator.')
        } else {
          setError(`Failed to delete project: ${error.message}`)
        }
        return
      }

      console.log('Project deleted:', projectId)
      setProjects(prev => prev.filter((p: any) => p.id !== projectId))
    } catch (err) {
      console.error('Unexpected error deleting project:', err)
      setError('Failed to delete project due to an unexpected error.')
    }
  }

  // Handle work request actions
  const handleWorkRequestAction = async (workRequestId: string, action: 'approve' | 'decline') => {
    const supabase = createSupabaseBrowserClient();
    try {
      const supabase = createSupabaseBrowserClient();
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
        console.error(`Error ${action}ing work request:`, error)
        setError(`Failed to ${action} work request: ${error.message}`)
        return
      }

      console.log(`Work request ${action}d:`, data)
      setWorkRequests(prev => prev.map((wr: any) => wr.id === workRequestId ? data[0] : wr))
    } catch (err) {
      console.error(`Unexpected error ${action}ing work request:`, err)
      setError(`Failed to ${action} work request due to an unexpected error.`)
    }
  }

  // Render functions for different views
  const renderProjectList = () => (
    <div className="space-y-4">
      {filteredProjects.map((project: any) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-lg">{project.title}</h3>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1 ml-8">{project.description}</p>
              <div className="flex items-center space-x-4 mt-2 ml-8 text-sm text-gray-500">
                <span><Users className="h-4 w-4 inline-block mr-1" />{project.assigned_team_lead}</span>
                <span><Calendar className="h-4 w-4 inline-block mr-1" />{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                <span><DollarSign className="h-4 w-4 inline-block mr-1" />{formatCurrency(project.budget)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => { setSelectedProject(project); setActiveTab('charter'); }}><Eye className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => { setSelectedProject(project); setShowEditModal(true); }}><Edit className="h-4 w-4" /></Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderProjectGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project: any) => (
        <Card key={project.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Briefcase className="h-8 w-8 text-gray-400" />
              <div className="flex space-x-2">
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
              </div>
            </div>
            <CardTitle className="mt-2">{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center"><Users className="h-4 w-4 mr-2" /><span>{project.assigned_team_lead}</span></div>
              <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /><span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span></div>
              <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2" /><span>{formatCurrency(project.budget)}</span></div>
            </div>
          </CardContent>
          <div className="p-4 border-t flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => { setSelectedProject(project); setActiveTab('charter'); }}><Eye className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => { setSelectedProject(project); setShowEditModal(true); }}><Edit className="h-4 w-4" /></Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderWorkRequestList = () => (
    <div className="space-y-4">
      {filteredWorkRequests.map((wr: any) => (
        <Card key={wr.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-lg">{wr.title}</h3>
                <Badge className={getStatusColor(wr.status)}>{wr.status}</Badge>
                <Badge className={getPriorityColor(wr.priority)}>{wr.priority}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1 ml-8">{wr.description}</p>
              <div className="flex items-center space-x-4 mt-2 ml-8 text-sm text-gray-500">
                <span><Users className="h-4 w-4 inline-block mr-1" />{wr.customer_name}</span>
                <span><Calendar className="h-4 w-4 inline-block mr-1" />Requested: {formatDate(wr.requested_completion_date)}</span>
                <span><DollarSign className="h-4 w-4 inline-block mr-1" />Est. Budget: {formatCurrency(wr.estimated_budget)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {wr.status === 'submitted' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleWorkRequestAction(wr.id, 'approve')}><ThumbsUp className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleWorkRequestAction(wr.id, 'decline')}><ThumbsDown className="h-4 w-4" /></Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderRiskList = () => (
    <div className="space-y-4">
      {filteredRisks.map((risk: any) => (
        <Card key={risk.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-lg">{risk.risk_title}</h3>
                <Badge className={getStatusColor(risk.status)}>{risk.status}</Badge>
                <Badge className={getPriorityColor(risk.risk_level)}>{risk.risk_level}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1 ml-8">{risk.risk_description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderProjectCharter = () => (
    <Card>
      <CardHeader>
        <CardTitle>Project Charter: {selectedProject?.title}</CardTitle>
        <CardDescription>A comprehensive overview of the project's objectives, scope, and stakeholders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold">Business Case</h4>
          <p className="text-gray-600">{selectedProject?.business_case || 'Not defined'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Project Scope</h4>
          <p className="text-gray-600">{selectedProject?.project_scope || 'Not defined'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Success Criteria</h4>
          <p className="text-gray-600">{selectedProject?.success_criteria || 'Not defined'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Key Stakeholders</h4>
          <ul className="list-disc list-inside text-gray-600">
            {(selectedProject?.stakeholders || []).map((sh: string, i: number) => <li key={i}>{sh}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Risk Assessment</h4>
          <p className="text-gray-600">{selectedProject?.risk_assessment || 'Not defined'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Quality Metrics</h4>
          <p className="text-gray-600">{selectedProject?.quality_metrics || 'Not defined'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Communication Plan</h4>
          <p className="text-gray-600">{selectedProject?.communication_plan || 'Not defined'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Resource Requirements</h4>
          <p className="text-gray-600">{selectedProject?.resource_requirements || 'Not defined'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Constraints & Assumptions</h4>
          <p className="text-gray-600"><strong>Constraints:</strong> {selectedProject?.constraints || 'Not defined'}</p>
          <p className="text-gray-600"><strong>Assumptions:</strong> {selectedProject?.assumptions || 'Not defined'}</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Fill in the details to create a new project charter.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label>Project Title</label>
            <Input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label>Description</label>
            <Input value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
          </div>
          <div>
            <label>Status</label>
            <Input value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value })} />
          </div>
          <div>
            <label>Priority</label>
            <Input value={newProject.priority} onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })} />
          </div>
          <div>
            <label>Start Date</label>
            <Input type="date" value={newProject.start_date} onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })} />
          </div>
          <div>
            <label>End Date</label>
            <Input type="date" value={newProject.end_date} onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })} />
          </div>
          <div>
            <label>Budget</label>
            <Input type="number" value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })} />
          </div>
          <div>
            <label>Team Lead</label>
            <Input value={newProject.assigned_team_lead} onChange={(e) => setNewProject({ ...newProject, assigned_team_lead: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label>Project Scope</label>
            <Input value={newProject.project_scope} onChange={(e) => setNewProject({ ...newProject, project_scope: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label>Success Criteria</label>
            <Input value={newProject.success_criteria} onChange={(e) => setNewProject({ ...newProject, success_criteria: e.target.value })} />
          </div>
        </CardContent>
        <div className="p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreateProject}>Create Project</Button>
        </div>
      </Card>
    </div>
  )

  const renderEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Project: {selectedProject?.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label>Project Title</label>
            <Input value={selectedProject?.title || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, title: e.target.value } : null)} />

            <label>Description</label>
            <Input value={selectedProject?.description || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, description: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Status</label>
            <Input value={selectedProject?.status || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, status: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Priority</label>
            <Input value={selectedProject?.priority || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, priority: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Start Date</label>
            <Input type="date" value={selectedProject?.start_date || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, start_date: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>End Date</label>
            <Input type="date" value={selectedProject?.end_date || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, end_date: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Budget</label>
            <Input type="number" value={selectedProject?.budget || 0} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, budget: parseFloat(e.target.value) } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Assigned Team Lead</label>
            <Input value={selectedProject?.assigned_team_lead || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, assigned_team_lead: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Project Scope</label>
            <Input value={selectedProject?.project_scope || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, project_scope: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Success Criteria</label>
            <Input value={selectedProject?.success_criteria || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, success_criteria: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Risk Assessment</label>
            <Input value={selectedProject?.risk_assessment || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, risk_assessment: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Quality Metrics</label>
            <Input value={selectedProject?.quality_metrics || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, quality_metrics: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Communication Plan</label>
            <Input value={selectedProject?.communication_plan || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, communication_plan: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Resource Requirements</label>
            <Input value={selectedProject?.resource_requirements || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, resource_requirements: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Constraints</label>
            <Input value={selectedProject?.constraints || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, constraints: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Assumptions</label>
            <Input value={selectedProject?.assumptions || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, assumptions: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Work Request ID</label>
            <Input value={selectedProject?.work_request_id || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, work_request_id: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Project Code</label>
            <Input value={selectedProject?.project_code || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, project_code: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Business Case</label>
            <Input value={selectedProject?.business_case || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, business_case: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Charter Status</label>
            <Input value={selectedProject?.charter_status || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, charter_status: e.target.value } : null)} />
          </div>
          <div className="md:col-span-2">
            <label>Description</label>
            <Input value={selectedProject?.description || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, description: e.target.value } : null)} />
          </div>
          <div>
            <label>Status</label>
            <Input value={selectedProject?.status || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, status: e.target.value } : null)} />
          </div>
          <div>
            <label>Priority</label>
            <Input value={selectedProject?.priority || ''} onChange={(e) => setSelectedProject(prev => prev ? { ...prev, priority: e.target.value } : null)} />
          </div>
        </CardContent>
        <div className="p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedProject(null); }}>Cancel</Button>
          <Button onClick={handleUpdateProject}>Save Changes</Button>
        </div>
      </Card>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" /> Create Project</Button>
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
              {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">{stats.activeProjects} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkRequests}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingWorkRequests} pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Level Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highRisks}</div>
              <p className="text-xs text-muted-foreground">out of {stats.totalRisks} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
              <p className="text-xs text-muted-foreground">projects finished</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex border-b">
                <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'projects' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Projects</button>
                <button onClick={() => setActiveTab('work-requests')} className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'work-requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Work Requests</button>
                <button onClick={() => setActiveTab('risks')} className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'risks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Risks</button>
              </div>
              <div className="flex items-center space-x-2">

                <Input
                  placeholder="Search..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="w-64"
                />
                <Button variant="outline" onClick={() => { /* Implement advanced filters */ }}><Filter className="h-4 w-4 mr-2" /> Filters</Button>
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  {activeTab === 'projects' && (viewMode === 'list' ? renderProjectList() : renderProjectGrid())}
                  {activeTab === 'work-requests' && renderWorkRequestList()}
                  {activeTab === 'risks' && renderRiskList()}
                  {activeTab === 'charter' && selectedProject && renderProjectCharter()}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {showCreateModal && renderCreateModal()}
        {showEditModal && renderEditModal()}
      </div>
    </DashboardLayout>
  )
}








