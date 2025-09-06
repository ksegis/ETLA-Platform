'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Grid3X3,
  List,
  Building,
  User,
  Target,
  TrendingUp,
  Shield,
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

// Complete PMBOK interface with all fields
interface ProjectCharter {
  id: string
  tenant_id: string
  
  // Basic project information
  title?: string
  project_name?: string
  project_title?: string
  project_code?: string
  description?: string
  priority?: string
  project_type?: string
  project_category?: string
  
  // Timeline
  start_date?: string
  end_date?: string
  actual_start_date?: string
  actual_end_date?: string
  
  // Budget and financials
  budget?: number
  estimated_budget?: number
  actual_budget?: number
  budget_variance?: number
  
  // Team and resources
  assigned_team_lead?: string
  team_lead?: string
  project_manager?: string
  manager?: string
  sponsor?: string
  resource_requirements?: string
  
  // PMBOK framework fields
  project_scope?: string
  success_criteria?: string
  stakeholders?: any[]
  risk_assessment?: string
  quality_metrics?: string
  communication_plan?: string
  milestone_schedule?: any[]
  deliverables?: any[]
  constraints?: string
  assumptions?: string
  business_case?: string
  charter_status?: string
  work_request_id?: string
  completion_percentage?: number
  approved_by?: string
  approved_at?: string
  department?: string
  division?: string
  cost_center?: string
  customer_id?: string
  external_project_id?: string
  contract_number?: string
  billing_type?: string
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

interface WorkRequest {
  id: string
  title?: string
  description?: string
  status?: string
  priority?: string
  created_at?: string
}

interface Risk {
  id: string
  risk_title?: string
  title?: string
  name?: string
  risk_level?: string
  level?: string
  severity?: string
  priority?: string
  status?: string
  created_at?: string
}

interface Statistics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  workRequests: number
  pendingWorkRequests: number
  approvedWorkRequests: number
  highRisks: number
  totalBudget: number
  averageCompletion: number
}

export default function ProjectManagementPage() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  
  // State management
  const [activeTab, setActiveTab] = useState('projects')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    workRequests: 0,
    pendingWorkRequests: 0,
    approvedWorkRequests: 0,
    highRisks: 0,
    totalBudget: 0,
    averageCompletion: 0
  })
  
  // Form and UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCharter | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [projectTypeFilter, setProjectTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    if (currentTenant?.id) {
      loadData()
    }
  }, [currentTenant?.id])

  const loadData = async () => {
    if (!currentTenant?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Load projects with error handling
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('project_charters')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('created_at', { ascending: false })
        
        if (projectsError) {
          console.error('Project charters query error:', projectsError)
          setProjects([])
        } else {
          setProjects(projectsData || [])
        }
      } catch (err) {
        console.error('Project charters query error:', err)
        setProjects([])
      }

      // Load work requests with error handling
      try {
        const { data: workRequestsData, error: workRequestsError } = await supabase
          .from('work_requests')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('created_at', { ascending: false })
        
        if (workRequestsError) {
          console.error('Work requests query error:', workRequestsError)
          setWorkRequests([])
        } else {
          setWorkRequests(workRequestsData || [])
        }
      } catch (err) {
        console.error('Work requests query error:', err)
        setWorkRequests([])
      }

      // Load risks with error handling
      try {
        const { data: risksData, error: risksError } = await supabase
          .from('risk_register')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('created_at', { ascending: false })
        
        if (risksError) {
          console.error('Risk register query error:', risksError)
          setRisks([])
        } else {
          setRisks(risksData || [])
        }
      } catch (err) {
        console.error('Risk register query error:', err)
        setRisks([])
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load project management data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  useEffect(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => 
      p.charter_status !== 'completed' && p.charter_status !== 'cancelled'
    ).length
    const completedProjects = projects.filter(p => p.charter_status === 'completed').length
    const onHoldProjects = projects.filter(p => p.charter_status === 'on_hold').length
    
    const totalWorkRequests = workRequests.length
    const pendingWorkRequests = workRequests.filter(wr => wr.status === 'pending').length
    const approvedWorkRequests = workRequests.filter(wr => wr.status === 'approved').length
    
    const highRisks = risks.filter(r => 
      r.risk_level === 'high' || r.level === 'high' || r.severity === 'high'
    ).length
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || p.estimated_budget || 0), 0)
    const averageCompletion = projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length 
      : 0

    setStatistics({
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      workRequests: totalWorkRequests,
      pendingWorkRequests,
      approvedWorkRequests,
      highRisks,
      totalBudget,
      averageCompletion
    })
  }, [projects, workRequests, risks])

  // Create new project
  const handleCreateProject = async (projectData: Partial<ProjectCharter>) => {
    if (!currentTenant?.id || !user?.id) return

    try {
      const newProject = {
        ...projectData,
        tenant_id: currentTenant.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('project_charters')
        .insert([newProject])
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        setError('Failed to create project. Please try again.')
        return
      }

      setProjects(prev => [data, ...prev])
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Failed to create project. Please try again.')
    }
  }

  // Update project
  const handleUpdateProject = async (projectId: string, updates: Partial<ProjectCharter>) => {
    try {
      const { data, error } = await supabase
        .from('project_charters')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        setError('Failed to update project. Please try again.')
        return
      }

      setProjects(prev => prev.map(p => p.id === projectId ? data : p))
      setIsEditModalOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      setError('Failed to update project. Please try again.')
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
        setError('Failed to delete project. Please try again.')
        return
      }

      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Failed to delete project. Please try again.')
    }
  }

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      (project.title || project.project_name || project.project_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.project_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.assigned_team_lead || project.team_lead || project.manager || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.charter_status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    const matchesDepartment = departmentFilter === 'all' || project.department === departmentFilter
    const matchesProjectType = projectTypeFilter === 'all' || project.project_type === projectTypeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesProjectType
  })

  // Get project display name
  const getProjectName = (project: ProjectCharter) => {
    return project.title || project.project_name || project.project_title || `Project ${project.id?.slice(0, 8)}`
  }

  // Get project team lead
  const getProjectTeamLead = (project: ProjectCharter) => {
    return project.assigned_team_lead || project.team_lead || project.project_manager || project.manager || 'Unassigned'
  }

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Projects',
      value: statistics.totalProjects,
      icon: Building,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active',
      value: statistics.activeProjects,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Completed',
      value: statistics.completedProjects,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'On Hold',
      value: statistics.onHoldProjects,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Work Requests',
      value: statistics.workRequests,
      icon: FileText,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pending WR',
      value: statistics.pendingWorkRequests,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Approved WR',
      value: statistics.approvedWorkRequests,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'High Risks',
      value: statistics.highRisks,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Total Budget',
      value: `$${statistics.totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }
  ]

  // Tab configuration
  const tabs = [
    { id: 'projects', label: 'Projects', count: statistics.totalProjects, icon: Building },
    { id: 'work-requests', label: 'Work Requests', count: statistics.workRequests, icon: FileText },
    { id: 'risks', label: 'Risks', count: risks.length, icon: AlertTriangle },
    { id: 'charter', label: 'Charter', icon: FileText },
    { id: 'wbs', label: 'WBS', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'evm', label: 'EVM', icon: TrendingUp },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project management data...</p>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive project lifecycle management with PMBOK framework</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
          {statisticsCards.map((stat, index) => (
            <Card key={index} className={`${stat.bgColor} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Filters & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setPriorityFilter('all')
                    setDepartmentFilter('all')
                    setProjectTypeFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Project List Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Enhanced Projects ({filteredProjects.length} records)
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>

            {/* Projects Display */}
            {viewMode === 'list' ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{getProjectName(project)}</div>
                              {project.project_code && (
                                <div className="text-sm text-gray-500">{project.project_code}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{getProjectTeamLead(project)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={project.charter_status === 'active' ? 'default' : 'secondary'}>
                              {project.charter_status || 'draft'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                              {project.priority || 'medium'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${project.completion_percentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{project.completion_percentage || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(project.budget || project.estimated_budget || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project)
                                  setIsEditModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{getProjectName(project)}</CardTitle>
                          {project.project_code && (
                            <CardDescription>{project.project_code}</CardDescription>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge variant={project.charter_status === 'active' ? 'default' : 'secondary'}>
                            {project.charter_status || 'draft'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Priority:</span>
                          <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                            {project.priority || 'medium'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Team Lead:</span>
                          <span className="text-sm font-medium">{getProjectTeamLead(project)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Budget:</span>
                          <span className="text-sm font-medium">
                            ${(project.budget || project.estimated_budget || 0).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Progress:</span>
                            <span className="text-sm font-medium">{project.completion_percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.completion_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tab content placeholders */}
        {activeTab === 'work-requests' && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Work Requests</h3>
            <p className="text-gray-600">Work request management functionality coming soon.</p>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Management</h3>
            <p className="text-gray-600">Risk register and management functionality coming soon.</p>
          </div>
        )}

        {activeTab === 'charter' && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Charter</h3>
            <p className="text-gray-600">Project charter management functionality coming soon.</p>
          </div>
        )}

        {activeTab === 'wbs' && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Work Breakdown Structure</h3>
            <p className="text-gray-600">WBS management functionality coming soon.</p>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Schedule</h3>
            <p className="text-gray-600">Schedule management functionality coming soon.</p>
          </div>
        )}

        {activeTab === 'evm' && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Earned Value Management</h3>
            <p className="text-gray-600">EVM functionality coming soon.</p>
          </div>
        )}

        {activeTab === 'stakeholders' && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Stakeholder Management</h3>
            <p className="text-gray-600">Stakeholder management functionality coming soon.</p>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Management</h3>
            <p className="text-gray-600">Compliance tracking functionality coming soon.</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          workRequests={workRequests}
        />
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && selectedProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProject(null)
          }}
          onSubmit={(updates) => handleUpdateProject(selectedProject.id, updates)}
          project={selectedProject}
          workRequests={workRequests}
        />
      )}
    </DashboardLayout>
  )
}

// Create Project Modal Component
function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  workRequests 
}: { 
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<ProjectCharter>) => void
  workRequests: WorkRequest[]
}) {
  const [formData, setFormData] = useState<Partial<ProjectCharter>>({
    title: '',
    project_name: '',
    project_code: '',
    priority: 'medium',
    charter_status: 'draft',
    completion_percentage: 0,
    project_type: 'internal',
    billing_type: 'fixed'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                <Input
                  value={formData.project_code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_code: e.target.value }))}
                  placeholder="e.g., PROJ-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select
                    value={formData.project_type || 'internal'}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="customer">Customer</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team & Organization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Team & Organization</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                <Input
                  value={formData.assigned_team_lead || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigned_team_lead: e.target.value }))}
                  placeholder="Assigned team lead"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                <Input
                  value={formData.sponsor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsor: e.target.value }))}
                  placeholder="Project sponsor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <Input
                    value={formData.division || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="Division"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Request Reference</label>
                <select
                  value={formData.work_request_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, work_request_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Create without work request</option>
                  {workRequests.filter(wr => wr.status === 'approved').map(wr => (
                    <option key={wr.id} value={wr.id}>
                      {wr.title || `Work Request ${wr.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PMBOK Framework Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">PMBOK Framework</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Scope</label>
                <textarea
                  value={formData.project_scope || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_scope: e.target.value }))}
                  placeholder="Define project scope and boundaries"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Success Criteria</label>
                <textarea
                  value={formData.success_criteria || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, success_criteria: e.target.value }))}
                  placeholder="Define success criteria and acceptance criteria"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Case</label>
                <textarea
                  value={formData.business_case || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_case: e.target.value }))}
                  placeholder="Business justification for the project"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Assessment</label>
                <textarea
                  value={formData.risk_assessment || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, risk_assessment: e.target.value }))}
                  placeholder="Initial risk assessment and mitigation strategies"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Metrics</label>
                <textarea
                  value={formData.quality_metrics || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quality_metrics: e.target.value }))}
                  placeholder="Quality standards and metrics"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Project Modal Component
function EditProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project,
  workRequests 
}: { 
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<ProjectCharter>) => void
  project: ProjectCharter
  workRequests: WorkRequest[]
}) {
  const [formData, setFormData] = useState<Partial<ProjectCharter>>(project)

  useEffect(() => {
    setFormData(project)
  }, [project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                <Input
                  value={formData.project_code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_code: e.target.value }))}
                  placeholder="e.g., PROJ-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.charter_status || 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, charter_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Percentage</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completion_percentage || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, completion_percentage: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Team & Organization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Team & Organization</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                <Input
                  value={formData.assigned_team_lead || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigned_team_lead: e.target.value }))}
                  placeholder="Assigned team lead"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                <Input
                  value={formData.sponsor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsor: e.target.value }))}
                  placeholder="Project sponsor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <Input
                    value={formData.division || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="Division"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

