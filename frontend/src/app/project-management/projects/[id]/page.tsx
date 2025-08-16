'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Users,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  FileText,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Plus,
  Edit,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Project {
  id: string
  title: string
  description: string
  customerName: string
  customerEmail: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  assignedTo: string
  startDate: string
  endDate: string
  actualStartDate?: string
  actualEndDate?: string
  estimatedHours: number
  actualHours: number
  budget: number
  actualCost: number
  completionPercentage: number
  milestones: Array<{
    id: string
    title: string
    description: string
    dueDate: string
    status: 'pending' | 'in_progress' | 'completed' | 'overdue'
    completedDate?: string
    assignedTo: string
  }>
  timeEntries: Array<{
    id: string
    date: string
    hours: number
    description: string
    teamMember: string
    billable: boolean
  }>
  comments: Array<{
    id: string
    authorName: string
    authorRole: 'customer' | 'program_manager' | 'team_member'
    content: string
    createdAt: string
    isInternal: boolean
  }>
  attachments: Array<{
    id: string
    filename: string
    uploadedBy: string
    uploadedAt: string
    size: number
  }>
}

const mockProject: Project = {
  id: '1',
  title: 'Payroll System Integration',
  description: 'Integration of existing payroll system with new HRIS platform including data migration, API setup, and testing.',
  customerName: 'Acme Corporation',
  customerEmail: 'john.doe@acme.com',
  category: 'system_integration',
  priority: 'high',
  status: 'in_progress',
  assignedTo: 'Sarah Johnson',
  startDate: '2024-08-12',
  endDate: '2024-08-30',
  actualStartDate: '2024-08-12',
  estimatedHours: 40,
  actualHours: 24,
  budget: 8000,
  actualCost: 4800,
  completionPercentage: 60,
  milestones: [
    {
      id: '1',
      title: 'Requirements Analysis',
      description: 'Analyze current payroll system and HRIS requirements',
      dueDate: '2024-08-15',
      status: 'completed',
      completedDate: '2024-08-14',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: '2',
      title: 'API Development',
      description: 'Develop integration APIs between systems',
      dueDate: '2024-08-22',
      status: 'in_progress',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: '3',
      title: 'Data Migration',
      description: 'Migrate existing payroll data to new system',
      dueDate: '2024-08-26',
      status: 'pending',
      assignedTo: 'Mike Chen'
    },
    {
      id: '4',
      title: 'Testing & Validation',
      description: 'Comprehensive testing and validation of integration',
      dueDate: '2024-08-29',
      status: 'pending',
      assignedTo: 'Sarah Johnson'
    }
  ],
  timeEntries: [
    {
      id: '1',
      date: '2024-08-12',
      hours: 8,
      description: 'Initial requirements gathering and system analysis',
      teamMember: 'Sarah Johnson',
      billable: true
    },
    {
      id: '2',
      date: '2024-08-13',
      hours: 6,
      description: 'API design and documentation',
      teamMember: 'Sarah Johnson',
      billable: true
    },
    {
      id: '3',
      date: '2024-08-14',
      hours: 8,
      description: 'API development - authentication module',
      teamMember: 'Sarah Johnson',
      billable: true
    },
    {
      id: '4',
      date: '2024-08-15',
      hours: 2,
      description: 'Client meeting and requirements clarification',
      teamMember: 'Sarah Johnson',
      billable: false
    }
  ],
  comments: [
    {
      id: '1',
      authorName: 'Sarah Johnson',
      authorRole: 'program_manager',
      content: 'Project started on schedule. Requirements analysis completed ahead of time.',
      createdAt: '2024-08-14T16:30:00Z',
      isInternal: true
    },
    {
      id: '2',
      authorName: 'John Doe',
      authorRole: 'customer',
      content: 'Great progress so far! Looking forward to the API development phase.',
      createdAt: '2024-08-15T09:15:00Z',
      isInternal: false
    }
  ],
  attachments: [
    {
      id: '1',
      filename: 'api_specification.pdf',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2024-08-13T14:20:00Z',
      size: 1024000
    },
    {
      id: '2',
      filename: 'test_plan.docx',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2024-08-14T11:45:00Z',
      size: 512000
    }
  ]
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const milestoneStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<Project>(mockProject)
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'time' | 'comments'>('overview')
  const [newComment, setNewComment] = useState('')
  const [isInternalComment, setIsInternalComment] = useState(false)
  const [newTimeEntry, setNewTimeEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    billable: true
  })
  const [showTimeEntryForm, setShowTimeEntryForm] = useState(false)

  const handleStatusChange = (newStatus: Project['status']) => {
    setProject(prev => ({
      ...prev,
      status: newStatus,
      actualStartDate: newStatus === 'in_progress' && !prev.actualStartDate ? new Date().toISOString().split('T')[0] : prev.actualStartDate,
      actualEndDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
    }))
    alert(`Project status updated to: ${newStatus.replace('_', ' ').toUpperCase()}`)
  }

  const handleMilestoneStatusChange = (milestoneId: string, newStatus: string) => {
    setProject(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              status: newStatus as any,
              completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
            }
          : milestone
      )
    }))
    alert(`Milestone status updated`)
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        authorName: 'Program Manager',
        authorRole: 'program_manager' as const,
        content: newComment,
        createdAt: new Date().toISOString(),
        isInternal: isInternalComment
      }
      
      setProject(prev => ({
        ...prev,
        comments: [...prev.comments, comment]
      }))
      
      setNewComment('')
      setIsInternalComment(false)
    }
  }

  const handleAddTimeEntry = () => {
    if (newTimeEntry.hours && newTimeEntry.description) {
      const timeEntry = {
        id: Date.now().toString(),
        date: newTimeEntry.date,
        hours: parseFloat(newTimeEntry.hours),
        description: newTimeEntry.description,
        teamMember: project.assignedTo,
        billable: newTimeEntry.billable
      }
      
      setProject(prev => ({
        ...prev,
        timeEntries: [...prev.timeEntries, timeEntry],
        actualHours: prev.actualHours + timeEntry.hours,
        actualCost: prev.actualCost + (timeEntry.hours * (timeEntry.billable ? 200 : 0))
      }))
      
      setNewTimeEntry({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        billable: true
      })
      setShowTimeEntryForm(false)
      alert('Time entry added successfully')
    }
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProjectHealth = () => {
    const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const progressVsTime = project.completionPercentage / (1 - (daysRemaining / ((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))))
    
    if (progressVsTime >= 1) return { status: 'on_track', color: 'text-green-600', label: 'On Track' }
    if (progressVsTime >= 0.8) return { status: 'at_risk', color: 'text-yellow-600', label: 'At Risk' }
    return { status: 'behind', color: 'text-red-600', label: 'Behind Schedule' }
  }

  const projectHealth = getProjectHealth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/project-management'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                  {project.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`text-sm font-medium ${projectHealth.color}`}>
                  {projectHealth.label}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {project.status === 'scheduled' && (
                <Button 
                  onClick={() => handleStatusChange('in_progress')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Project
                </Button>
              )}
              {project.status === 'in_progress' && (
                <>
                  <Button 
                    onClick={() => handleStatusChange('on_hold')}
                    variant="outline"
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Put on Hold
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange('completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </>
              )}
              {project.status === 'on_hold' && (
                <Button 
                  onClick={() => handleStatusChange('in_progress')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Resume Project
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Project Progress</span>
              <span className="text-sm font-medium text-gray-900">{project.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${project.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Hours</p>
                <p className="text-lg font-bold text-gray-900">{project.actualHours}/{project.estimatedHours}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-lg font-bold text-gray-900">${project.actualCost.toLocaleString()}/${project.budget.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Milestones</p>
                <p className="text-lg font-bold text-gray-900">
                  {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Timeline</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'milestones', label: 'Milestones', icon: Target },
                { id: 'time', label: 'Time Tracking', icon: Clock },
                { id: 'comments', label: 'Comments', icon: MessageCircle }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-gray-900">{project.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Customer</p>
                        <p className="text-gray-900">{project.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Assigned To</p>
                        <p className="text-gray-900">{project.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Category</p>
                        <p className="text-gray-900">{project.category.replace('_', ' ').toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {project.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Files</h3>
                    <div className="space-y-2">
                      {project.attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                              <p className="text-xs text-gray-600">
                                Uploaded by {attachment.uploadedBy} on {formatDate(attachment.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {project.milestones.map(milestone => (
                    <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{milestone.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${milestoneStatusColors[milestone.status]}`}>
                            {milestone.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <select
                            value={milestone.status}
                            onChange={(e) => handleMilestoneStatusChange(milestone.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Due: {formatDate(milestone.dueDate)}</span>
                        <span>Assigned: {milestone.assignedTo}</span>
                        {milestone.completedDate && (
                          <span>Completed: {formatDate(milestone.completedDate)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Tracking Tab */}
            {activeTab === 'time' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowTimeEntryForm(!showTimeEntryForm)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Time
                  </Button>
                </div>

                {showTimeEntryForm && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Add Time Entry</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={newTimeEntry.date}
                          onChange={(e) => setNewTimeEntry(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={newTimeEntry.hours}
                          onChange={(e) => setNewTimeEntry(prev => ({ ...prev, hours: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Hours worked"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newTimeEntry.billable}
                            onChange={(e) => setNewTimeEntry(prev => ({ ...prev, billable: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Billable</span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={newTimeEntry.description}
                        onChange={(e) => setNewTimeEntry(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="What did you work on?"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowTimeEntryForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTimeEntry} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Entry
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {project.timeEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-1">
                          <span className="text-sm font-medium text-gray-900">{formatDate(entry.date)}</span>
                          <span className="text-sm text-gray-600">{entry.hours}h</span>
                          <span className="text-sm text-gray-600">{entry.teamMember}</span>
                          {entry.billable && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Billable
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{entry.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Comments</h3>
                  
                  <div className="space-y-4 mb-6">
                    {project.comments.map(comment => (
                      <div key={comment.id} className={`border-l-4 pl-4 ${comment.isInternal ? 'border-yellow-400 bg-yellow-50' : 'border-blue-400 bg-blue-50'} p-3 rounded-r-lg`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            comment.authorRole === 'customer' ? 'bg-blue-100 text-blue-800' : 
                            comment.authorRole === 'program_manager' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {comment.authorRole.replace('_', ' ').toUpperCase()}
                          </span>
                          {comment.isInternal && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Internal
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isInternalComment}
                            onChange={(e) => setIsInternalComment(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Internal comment (not visible to customer)</span>
                        </label>
                        <Button 
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

