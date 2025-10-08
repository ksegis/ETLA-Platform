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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { supabase } from '@/lib/supabase'

// Types for our data
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
}

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [loading, setloading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { user } = useAuth()
  const { selectedTenant } = useTenant()

  // Load projects and work requests from database
  const loadData = async () => {
    if (!selectedTenant?.id) {
      console.log('No tenant selected, skipping load')
      setloading(false)
      return
    }

    try {
      setloading(true)
      setError(null)
      
      console.log('loading project data for tenant:', selectedTenant.id, selectedTenant.name)

      // Load projects
      const { data: projectData, error: projectError } = await supabase
        .from('project_charters')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('created_at', { ascending: false })

      if (projectError) {
        console.error('Project query error:', projectError)
        console.error('Error details:', JSON.stringify(projectError, null, 2))
        setError(`Failed to load projects: ${projectError.message || projectError.details || 'Unknown error'}`)
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
        console.error('Error details:', JSON.stringify(workRequestError, null, 2))
        setError(`Failed to load work requests: ${workRequestError.message || workRequestError.details || 'Unknown error'}`)
        return
      }

      console.log('Loaded projects:', projectData)
      console.log('Loaded work requests:', workRequestData)
      
      setProjects(projectData || [])
      setWorkRequests(workRequestData || [])
    } catch (err) {
      console.error('Unexpected error loading data:', err)
      setError('Unexpected error occurred')
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
    activeProjects: projects.filter((p) => (p.status || '') === 'active' || (p.status || '') === 'in_progress').length,
    completedProjects: projects.filter((p) => (p.status || '') === 'completed').length,
    totalWorkRequests: workRequests.length,
    pendingWorkRequests: workRequests.filter((wr) => (wr.status || '') === 'submitted' || (wr.status || '') === 'under_review').length,
    approvedWorkRequests: workRequests.filter((wr) => (wr.status || '') === 'approved').length
  }

  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = (project.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (project.status || '') === statusFilter
    return matchesSearch && matchesStatus
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
          <span className="ml-2 text-gray-600">loading project data...</span>
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
            <p className="text-gray-600">Manage and track your projects with comprehensive workflow tools</p>
          </div>
          <Button onClick={() => console.log('Create new project')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Active</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.activeProjects}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
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
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Projects</CardTitle>
            <CardDescription className="text-gray-600">
              {filteredProjects.length} of {projects.length} projects
              {selectedTenant && <span className="ml-2">| Tenant: {selectedTenant.name}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">loading project data...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No projects found</p>
                <p className="text-sm text-gray-500">
                  {projects.length === 0 
                    ? 'No projects exist in the database yet.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project: any) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.title || 'Untitled Project'}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status || 'Unknown'}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority || 'Unknown'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{project.description || 'No description available'}</p>
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
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>ID: {project.id.substring(0, 8)}...</span>
                          </div>
                          {project.assigned_team_lead && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>Lead: {project.assigned_team_lead}</span>
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
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

