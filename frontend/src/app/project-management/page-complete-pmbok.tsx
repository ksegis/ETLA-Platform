'use client';

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
  LayoutGrid,
  List,
  Building,
  User,
  Target,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

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
  const { selectedTenant } = useTenant()
  
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
  const [loading, setloading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    if (selectedTenant) {
      loadData()
    }
  }, [selectedTenant])

  const loadData = async () => {
    if (!selectedTenant) return
    
    setloading(true)
    setError(null)
    
    try {
      const supabase = createSupabaseBrowserClient();
      // Load projects with error handling
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('project_charters')
          .select('*')
          .eq('tenant_id', selectedTenant)
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
          .eq('tenant_id', selectedTenant)
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
          .eq('tenant_id', selectedTenant)
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
      setloading(false)
    }
  }

  // Calculate statistics
  useEffect(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter((p: any) => 
      p.charter_status !== 'completed' && p.charter_status !== 'cancelled'
    ).length
    const completedProjects = projects.filter((p: any) => p.charter_status === 'completed').length
    const onHoldProjects = projects.filter((p: any) => p.charter_status === 'on_hold').length
    
    const totalWorkRequests = workRequests.length
    const pendingWorkRequests = workRequests.filter((wr: any) => wr.status === 'pending').length
    const approvedWorkRequests = workRequests.filter((wr: any) => wr.status === 'approved').length
    
    const highRisks = risks.filter((r: any) => 
      r.risk_level === 'high' || r.level === 'high' || r.severity === 'high'
    ).length
    
    const totalBudget = projects.reduce((sum: any, p) => sum + (p.budget || p.estimated_budget || 0), 0)
    const averageCompletion = projects.length > 0 
      ? projects.reduce((sum: any, p) => sum + (p.completion_percentage || 0), 0) / projects.length 
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
    if (!selectedTenant || !user?.id) return

    try {
      const newProject = {
        ...projectData,
        tenant_id: selectedTenant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const supabase = createSupabaseBrowserClient();
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
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    }
  }

  const handleUpdateProject = async (projectId: string, updates: Partial<ProjectCharter>) => {
    try {
      const supabase = createSupabaseBrowserClient();
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

      setProjects(prev => prev.map((p: any) => p.id === projectId ? data : p))
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
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('project_charters')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        setError('Failed to delete project. Please try again.')
        return
      }

      setProjects(prev => prev.filter((p: any) => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Failed to delete project. Please try again.')
    }
  }

  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
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
            <p className="mt-4 text-gray-600">loading project management data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management Hub</h1>
            <p className="text-gray-500">Comprehensive overview of all project-related activities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </header>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statisticsCards.map((stat, index) => (
            <Card key={index} className={`${stat.bgColor} border-0`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.iconColor}`}>{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area with Tabs */}
        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      } ml-2 py-0.5 px-2 rounded-full text-xs font-medium`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'projects' && (
              <div>
                {/* Project Filters and View Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border-gray-300 rounded-md"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Project List/Grid */}
                {viewMode === 'list' ? (
                  <div className="space-y-3">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{getProjectName(project)}</h3>
                              <Badge>{project.charter_status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {getProjectTeamLead(project)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.start_date || '').toLocaleDateString()} - {new Date(project.end_date || '').toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {`$${(project.budget || 0).toLocaleString()}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedProject(project);
                              setIsEditModalOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteProject(project.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle>{getProjectName(project)}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">Status</span>
                              <Badge>{project.charter_status}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Team Lead</span>
                              <span>{getProjectTeamLead(project)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Budget</span>
                              <span>{`$${(project.budget || 0).toLocaleString()}`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">End Date</span>
                              <span>{new Date(project.end_date || '').toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                        <div className="p-4 border-t flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedProject(project);
                            setIsEditModalOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Modal for creating/editing a project (simplified)
// A real implementation would use a library like Radix or a separate component
const ProjectModal = ({ isOpen, onClose, project, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectCharter | null;
  onSave: (data: Partial<ProjectCharter>) => void;
}) => {
  const [formData, setFormData] = useState<Partial<ProjectCharter>>({});

  useEffect(() => {
    if (project) {
      setFormData(project);
    } else {
      setFormData({});
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{project ? 'Edit Project' : 'Create Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
              <Input id="start_date" name="start_date" type="date" value={formData.start_date || ''} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
              <Input id="end_date" name="end_date" type="date" value={formData.end_date || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
};








