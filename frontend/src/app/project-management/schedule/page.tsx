'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Project {
  id: string
  title: string
  customerName: string
  assignedTo: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold'
  startDate: string
  endDate: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  estimatedHours: number
  completedHours?: number
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Payroll System Integration',
    customerName: 'Acme Corporation',
    assignedTo: 'Sarah Johnson',
    status: 'in_progress',
    startDate: '2024-08-12',
    endDate: '2024-08-30',
    priority: 'high',
    category: 'system_integration',
    estimatedHours: 40,
    completedHours: 24
  },
  {
    id: '4',
    title: 'Data Migration Project',
    customerName: 'Manufacturing Co',
    assignedTo: 'Mike Chen',
    status: 'scheduled',
    startDate: '2024-08-20',
    endDate: '2024-09-10',
    priority: 'high',
    category: 'data_migration',
    estimatedHours: 80
  },
  {
    id: '5',
    title: 'Custom Reporting Dashboard',
    customerName: 'Retail Chain LLC',
    assignedTo: 'Lisa Wang',
    status: 'scheduled',
    startDate: '2024-08-25',
    endDate: '2024-09-15',
    priority: 'medium',
    category: 'custom_development',
    estimatedHours: 50
  },
  {
    id: '6',
    title: 'Benefits Configuration',
    customerName: 'TechStart Inc',
    assignedTo: 'David Kim',
    status: 'scheduled',
    startDate: '2024-09-01',
    endDate: '2024-09-12',
    priority: 'medium',
    category: 'benefits_configuration',
    estimatedHours: 20
  }
]

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  critical: 'border-l-red-400'
}

export default function ProjectSchedulePage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedTeamMember, setSelectedTeamMember] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const teamMembers = ['Sarah Johnson', 'Mike Chen', 'Lisa Wang', 'David Kim']

  const filteredProjects = projects.filter((project: any) => {
    const matchesTeamMember = selectedTeamMember === 'all' || project.assignedTo === selectedTeamMember
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    return matchesTeamMember && matchesStatus
  })

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getProjectsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredProjects.filter((project: any) => {
      const startDate = new Date(project.startDate)
      const endDate = new Date(project.endDate)
      return date >= startDate && date <= endDate
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-200"></div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayProjects = getProjectsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={day} className={`h-32 border border-gray-200 p-2 overflow-y-auto ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayProjects.slice(0, 3).map((project: any) => (
              <div
                key={`${project.id}-${day}`}
                className={`text-xs p-1 rounded border-l-2 ${statusColors[project.status as keyof typeof statusColors as keyof typeof statusColors as keyof typeof statusColors]} ${priorityColors[project.priority as keyof typeof priorityColors as keyof typeof priorityColors as keyof typeof priorityColors]} cursor-pointer hover:opacity-80`}
                title={`${project.title} - ${project.assignedTo}`}
              >
                <div className="font-medium truncate">{project.title}</div>
                <div className="text-xs opacity-75">{project.assignedTo}</div>
              </div>
            ))}
            {dayProjects.length > 3 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayProjects.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const getWorkloadStats = () => {
    const totalHours = filteredProjects.reduce((sum: any, project: any) => sum + project.estimatedHours, 0)
    const completedHours = filteredProjects.reduce((sum: any, project: any) => sum + (project.completedHours || 0), 0)
    const activeProjects = filteredProjects.filter((p: any) => p.status === 'in_progress').length
    const scheduledProjects = filteredProjects.filter((p: any) => p.status === 'scheduled').length

    return { totalHours, completedHours, activeProjects, scheduledProjects }
  }

  const stats = getWorkloadStats()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/project-management'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Schedule</h1>
            <p className="text-gray-600">Manage project timelines and team workload</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/project-management/resources'}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Team Resources
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduledProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={selectedTeamMember}
            onChange={(e: any) => setSelectedTeamMember(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Team Members</option>
            {teamMembers.map((member: any) => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e: any) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                viewMode === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: any) => (
            <div key={day} className="p-3 text-sm font-medium text-gray-500 bg-gray-50 border-b border-gray-200 text-center">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Project List */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Project Timeline</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredProjects.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No projects found matching your criteria.</p>
            </div>
          ) : (
            filteredProjects.map((project: any) => (
              <div key={project.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status as keyof typeof statusColors as keyof typeof statusColors as keyof typeof statusColors]}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        project.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Customer: {project.customerName}</span>
                      <span>Assigned: {project.assignedTo}</span>
                      <span>Duration: {formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                      <span>Hours: {project.completedHours || 0}/{project.estimatedHours}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    {project.completedHours && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((project.completedHours / project.estimatedHours) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

