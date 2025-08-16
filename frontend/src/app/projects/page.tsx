'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Eye,
  MessageCircle,
  FileText,
  DollarSign,
  Target,
  Activity,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface CustomerProject {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  assignedTo: string
  startDate: string
  endDate: string
  estimatedHours: number
  actualHours: number
  budget: number
  completionPercentage: number
  lastUpdate: string
  nextMilestone?: {
    title: string
    dueDate: string
    status: string
  }
  recentActivity: Array<{
    id: string
    type: 'milestone' | 'comment' | 'status_change' | 'file_upload'
    description: string
    date: string
    author: string
  }>
  unreadComments: number
}

const mockProjects: CustomerProject[] = [
  {
    id: '1',
    title: 'Payroll System Integration',
    description: 'Integration of existing payroll system with new HRIS platform including data migration and API setup.',
    category: 'system_integration',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Sarah Johnson',
    startDate: '2024-08-12',
    endDate: '2024-08-30',
    estimatedHours: 40,
    actualHours: 24,
    budget: 8000,
    completionPercentage: 60,
    lastUpdate: '2024-08-15T14:30:00Z',
    nextMilestone: {
      title: 'API Development',
      dueDate: '2024-08-22',
      status: 'in_progress'
    },
    recentActivity: [
      {
        id: '1',
        type: 'milestone',
        description: 'Requirements Analysis milestone completed',
        date: '2024-08-14T16:30:00Z',
        author: 'Sarah Johnson'
      },
      {
        id: '2',
        type: 'comment',
        description: 'Added update on API development progress',
        date: '2024-08-15T10:15:00Z',
        author: 'Sarah Johnson'
      }
    ],
    unreadComments: 2
  },
  {
    id: '2',
    title: 'Benefits Audit & Compliance Review',
    description: 'Comprehensive audit of current benefits structure and compliance with new regulations.',
    category: 'compliance_audit',
    priority: 'medium',
    status: 'scheduled',
    assignedTo: 'Mike Chen',
    startDate: '2024-08-20',
    endDate: '2024-09-15',
    estimatedHours: 30,
    actualHours: 0,
    budget: 6000,
    completionPercentage: 0,
    lastUpdate: '2024-08-10T09:00:00Z',
    nextMilestone: {
      title: 'Initial Assessment',
      dueDate: '2024-08-25',
      status: 'pending'
    },
    recentActivity: [
      {
        id: '3',
        type: 'status_change',
        description: 'Project approved and scheduled',
        date: '2024-08-10T09:00:00Z',
        author: 'Program Manager'
      }
    ],
    unreadComments: 0
  },
  {
    id: '3',
    title: 'Custom Reporting Dashboard',
    description: 'Development of custom analytics dashboard for HR metrics and KPI tracking.',
    category: 'custom_development',
    priority: 'medium',
    status: 'completed',
    assignedTo: 'Lisa Wang',
    startDate: '2024-07-15',
    endDate: '2024-08-05',
    estimatedHours: 50,
    actualHours: 48,
    budget: 10000,
    completionPercentage: 100,
    lastUpdate: '2024-08-05T17:00:00Z',
    recentActivity: [
      {
        id: '4',
        type: 'status_change',
        description: 'Project completed successfully',
        date: '2024-08-05T17:00:00Z',
        author: 'Lisa Wang'
      },
      {
        id: '5',
        type: 'file_upload',
        description: 'Final documentation and user guide uploaded',
        date: '2024-08-05T16:30:00Z',
        author: 'Lisa Wang'
      }
    ],
    unreadComments: 1
  }
]

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const activityIcons = {
  milestone: Target,
  comment: MessageCircle,
  status_change: Activity,
  file_upload: FileText
}

export default function CustomerProjectsPage() {
  const [projects, setProjects] = useState<CustomerProject[]>(mockProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getProjectStats = () => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'in_progress').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
    const avgCompletion = projects.reduce((sum, p) => sum + p.completionPercentage, 0) / projects.length

    return { totalProjects, activeProjects, completedProjects, totalBudget, avgCompletion }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProjectHealth = (project: CustomerProject) => {
    if (project.status === 'completed') return { color: 'text-green-600', label: 'Completed' }
    if (project.status === 'cancelled') return { color: 'text-red-600', label: 'Cancelled' }
    if (project.status === 'on_hold') return { color: 'text-yellow-600', label: 'On Hold' }
    
    const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const totalDays = Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))
    const expectedProgress = ((totalDays - daysRemaining) / totalDays) * 100
    
    if (project.completionPercentage >= expectedProgress) return { color: 'text-green-600', label: 'On Track' }
    if (project.completionPercentage >= expectedProgress * 0.8) return { color: 'text-yellow-600', label: 'At Risk' }
    return { color: 'text-red-600', label: 'Behind Schedule' }
  }

  const stats = getProjectStats()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600">Track progress and stay updated on your active projects</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/work-requests/new'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Request New Project
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <PlayCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgCompletion.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No projects found matching your criteria.</p>
              <Button 
                onClick={() => window.location.href = '/work-requests/new'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Request Your First Project
              </Button>
            </div>
          ) : (
            filteredProjects.map(project => {
              const health = getProjectHealth(project)
              return (
                <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                          {project.priority.toUpperCase()}
                        </span>
                        <span className={`text-xs font-medium ${health.color}`}>
                          {health.label}
                        </span>
                      </div>
                    </div>
                    {project.unreadComments > 0 && (
                      <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        <MessageCircle className="h-3 w-3" />
                        {project.unreadComments}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{project.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${project.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Assigned To</p>
                      <p className="font-medium text-gray-900">{project.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Timeline</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hours</p>
                      <p className="font-medium text-gray-900">{project.actualHours}/{project.estimatedHours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Budget</p>
                      <p className="font-medium text-gray-900">${project.budget.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  {project.nextMilestone && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Next Milestone</span>
                      </div>
                      <p className="text-sm text-gray-700">{project.nextMilestone.title}</p>
                      <p className="text-xs text-gray-500">Due: {formatDate(project.nextMilestone.dueDate)}</p>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Activity</p>
                    <div className="space-y-2">
                      {project.recentActivity.slice(0, 2).map(activity => {
                        const Icon = activityIcons[activity.type]
                        return (
                          <div key={activity.id} className="flex items-start gap-2">
                            <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate">{activity.description}</p>
                              <p className="text-xs text-gray-500">{formatDateTime(activity.date)} by {activity.author}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.location.href = `/projects/${project.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/projects/${project.id}#comments`}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comments
                      {project.unreadComments > 0 && (
                        <span className="ml-1 bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full text-xs">
                          {project.unreadComments}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

