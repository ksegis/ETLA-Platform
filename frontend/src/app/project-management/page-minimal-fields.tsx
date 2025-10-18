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
import { Button } from 'components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card'
import { Input } from 'components/ui/input'
import { Badge } from 'components/ui/badge'
import DashboardLayout from 'components/layout/DashboardLayout'
import { useAuth } from 'contexts/AuthContext'
import { useTenant } from 'contexts/TenantContext'
import { createSupabaseBrowserClient } from 'lib/supabase/browser'

const supabase = createSupabaseBrowserClient();

// Minimal interfaces using only confirmed existing fields
interface ProjectCharter {
  id: string
  // Only use basic fields that are likely to exist
  name?: string
  description?: string
  status?: string
  tenant_id: string
  created_at: string
  updated_at?: string
}

interface WorkRequest {
  id: string
  name?: string
  description?: string
  status?: string
  tenant_id: string
  created_at: string
  updated_at?: string
}

interface Risk {
  id: string
  name?: string
  description?: string
  status?: string
  tenant_id: string
  created_at: string
  updated_at?: string
}

interface ProjectFilters {
  searchTerm: string
  status: string
}

export default function MinimalFieldsProjectManagementPage() {
  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setloading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCharter | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'work-requests' | 'risks'>('projects')

  // Minimal filters
  const [filters, setFilters] = useState<ProjectFilters>({
    searchTerm: '',
    status: 'all'
  })

  // Minimal new project form state
  const [newProject, setNewProject] = useState<Partial<ProjectCharter>>({
    name: '',
    description: '',
    status: 'active'
  })

  const { user } = useAuth()
  const { selectedTenant } = useTenant() as { selectedTenant: string | null }

  // Helper function to get display name
  const getDisplayName = (item: ProjectCharter | WorkRequest | Risk): string => {
    return item.name || 'Untitled'
  }

  // Minimal load data function using only basic fields
  const loadData = async () => {
    if (!selectedTenant) {
      console.log('No tenant selected, skipping load')
      setloading(false)
      return
    }

    try {
      setloading(true)
      setError(null)
      
            console.log("loading minimal project data for tenant:", selectedTenant);

      // Load projects with minimal fields only
      try {
        console.log('loading from project_charters table with minimal fields...')
        const { data: projectData, error: projectError } = await supabase
          .from('project_charters')
          .select('id, name, description, status, tenant_id, created_at, updated_at')
          .eq('tenant_id', selectedTenant)  
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

      // Load work requests with minimal fields
      try {
        console.log('loading from work_requests table with minimal fields...')
        const { data: workRequestData, error: workRequestError } = await supabase
          .from('work_requests')
          .select('id, name, description, status, tenant_id, created_at, updated_at')
          .eq('tenant_id', selectedTenant)  
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

      // Load risks with minimal fields
      try {
        console.log('loading from risk_register table with minimal fields...')
        const { data: riskData, error: riskError } = await supabase
          .from('risk_register')
          .select('id, name, description, status, tenant_id, created_at, updated_at')
          .eq('tenant_id', selectedTenant)  
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
      setloading(false)
    }
  }

  // Load data when tenant is selected
  useEffect(() => {
    loadData()
  }, [selectedTenant])

  // Calculate basic statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    totalWorkRequests: workRequests.length,
    totalRisks: risks.length
  }

  // Filter projects with minimal fields
  const filteredProjects = projects.filter((project: any) => {
    const name = project.name || ''
    const description = project.description || ''
    
    const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || project.status === filters.status
    
    return matchesSearch && matchesStatus
  })

  // Filter work requests
  const filteredWorkRequests = workRequests.filter((wr: any) => {
    const name = wr.name || ''
    const description = wr.description || ''
    
    const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || wr.status === filters.status
    
    return matchesSearch && matchesStatus
  })

  // Filter risks
  const filteredRisks = risks.filter((risk: any) => {
    const name = risk.name || ''
    const description = risk.description || ''
    
    const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || risk.status === filters.status
    
    return matchesSearch && matchesStatus
  })

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string | null | undefined) => {
    const statusLower = (status || '').toLowerCase()
    switch (statusLower) {
      case 'active':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Minimal create project function using only confirmed fields
    const handleCreateProject = async () => {
    if (!selectedTenant || !newProject.name) {
      setError('Please provide a project name and ensure a tenant is selected.')
      return
    }

    try {
      setError(null)
      
      // Use only minimal confirmed fields
      const projectData = {
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        tenant_id: selectedTenant as string,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creating project with minimal data:', projectData)

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
      name: '',
      description: '',
      status: 'active'
    })
  }

  // Minimal update project function using only confirmed fields
  const handleUpdateProject = async () => {
    if (!selectedProject?.id) {
      setError('No project selected for update.')
      return
    }

    try {
      setError(null)
      
      // Use only minimal confirmed fields
      const updateData = {
        name: selectedProject.name,
        description: selectedProject.description,
        status: selectedProject.status,
        updated_at: new Date().toISOString()
      }

      console.log('Updating project with minimal data:', updateData)

      const { data, error } = await supabase
        .from('project_charters')
        .update(updateData)
        .eq('id', selectedProject.id as string)
        .select()

      if (error) {
        console.error('Error updating project:', error)
        setError(`Failed to update project: ${error.message}`)
        return
      }

      console.log('Project updated successfully:', data)
      setProjects(prev => prev.map((p: any) => p.id === selectedProject.id ? data[0] : p))
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
        .eq('id', projectId as string)

      if (error) {
        console.error('Error deleting project:', error)
        setError(`Failed to delete project: ${error.message}`)
        return
      }

      setProjects(prev => prev.filter((p: any) => p.id !== projectId))
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

  // Render project list view
  const renderProjectListView = () => (
    <div className="space-y-4">
      {filteredProjects.map((project: any) => (
        <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(project)}</h3>
                <Badge className={getStatusColor(project.status)}>
                  {project.status || 'Unknown'}
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">{project.description || 'No description'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(project.created_at)}</span>
                </div>
                {project.updated_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {formatDate(project.updated_at)}</span>
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
                <CardTitle className="text-lg mb-2">{getDisplayName(project)}</CardTitle>
                <div className="flex gap-2 mb-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description || 'No description'}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Created: {formatDate(project.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                setSelectedProject(project)
                setShowEditModal(true)
              }}>
                <Eye className="h-4 w-4 mr-2" /> View
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                setSelectedProject(project)
                setShowEditModal(true)
              }}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex-1"
                onClick={() => handleDeleteProject(project.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Render work request list view
  const renderWorkRequestListView = () => (
    <div className="space-y-4">
      {filteredWorkRequests.map((wr: any) => (
        <div key={wr.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(wr)}</h3>
                <Badge className={getStatusColor(wr.status)}>
                  {wr.status || 'Unknown'}
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">{wr.description || 'No description'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(wr.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render risk list view
  const renderRiskListView = () => (
    <div className="space-y-4">
      {filteredRisks.map((risk: any) => (
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
          </div>
        </div>
      ))}
    </div>
  )

  // Render create project modal
  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Fill in the details for your new project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
            <Input 
              id="name" 
              value={newProject.name || ''} 
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} 
              placeholder="e.g., Q4 Marketing Campaign"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <Input 
              id="description" 
              value={newProject.description || ''} 
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} 
              placeholder="A brief summary of the project's goals"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select 
              id="status" 
              value={newProject.status || 'active'} 
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value })} 
              className="w-full p-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreateProject}>Create Project</Button>
        </div>
      </Card>
    </div>
  )

  // Render edit project modal
  const renderEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Project: {selectedProject?.name}</CardTitle>
          <CardDescription>Update the details of your project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Project Name</label>
            <Input 
              id="edit-name" 
              value={selectedProject?.name || ''} 
              onChange={(e) => setSelectedProject(prev => prev ? { ...prev, name: e.target.value } : null)} 
            />
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
            <Input 
              id="edit-description" 
              value={selectedProject?.description || ''} 
              onChange={(e) => setSelectedProject(prev => prev ? { ...prev, description: e.target.value } : null)} 
            />
          </div>
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status</label>
            <select 
              id="edit-status" 
              value={selectedProject?.status || 'active'} 
              onChange={(e) => setSelectedProject(prev => prev ? { ...prev, status: e.target.value } : null)} 
              className="w-full p-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={() => {
            setShowEditModal(false)
            setSelectedProject(null)
          }}>Cancel</Button>
          <Button onClick={handleUpdateProject}>Save Changes</Button>
        </div>
      </Card>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Minimal fields view for maximum compatibility.</p>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Requests</CardTitle>
              <Clipboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRisks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex border rounded-md">
                  <Button
                    variant={activeTab === 'projects' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('projects')}
                    className="rounded-r-none"
                  >
                    Projects
                  </Button>
                  <Button
                    variant={activeTab === 'work-requests' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('work-requests')}
                    className="rounded-none"
                  >
                    Work Requests
                  </Button>
                  <Button
                    variant={activeTab === 'risks' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('risks')}
                    className="rounded-l-none"
                  >
                    Risks
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-10" 
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  />
                </div>
                <select 
                  className="p-2 border rounded-md"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {renderViewModeToggle()}
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-4 text-gray-600">Loading data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'projects' && (
                  <>
                    {filteredProjects.length > 0 ? (
                      viewMode === 'list' ? renderProjectListView() : renderProjectGridView()
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No projects found.</p>
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'work-requests' && (
                  <>
                    {filteredWorkRequests.length > 0 ? (
                      renderWorkRequestListView()
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No work requests found.</p>
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'risks' && (
                  <>
                    {filteredRisks.length > 0 ? (
                      renderRiskListView()
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No risks found.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {showCreateModal && renderCreateModal()}
        {showEditModal && renderEditModal()}
      </div>
    </DashboardLayout>
  )
}







