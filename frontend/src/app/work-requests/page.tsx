'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  DollarSign, 
  Eye, 
  Edit, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  PlayCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface WorkRequest {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'
  estimatedHours?: number
  budget?: number
  requiredCompletionDate?: string
  submittedAt: string
  updatedAt: string
  assignedTo?: string
}

// Mock data for demonstration
const mockRequests: WorkRequest[] = [
  {
    id: '1',
    title: 'Payroll System Integration',
    description: 'Integration of existing payroll system with new HRIS platform including data migration, API setup, and testing.',
    category: 'system_integration',
    priority: 'high',
    urgency: 'medium',
    status: 'in_progress',
    estimatedHours: 40,
    budget: 8000,
    requiredCompletionDate: '2024-08-30',
    submittedAt: '2024-08-10T09:00:00Z',
    updatedAt: '2024-08-15T14:30:00Z',
    assignedTo: 'Sarah Johnson'
  },
  {
    id: '2',
    title: 'Benefits Audit & Compliance Review',
    description: 'Comprehensive audit of current benefits structure and compliance with new regulations.',
    category: 'compliance_audit',
    priority: 'medium',
    urgency: 'low',
    status: 'approved',
    estimatedHours: 30,
    budget: 6000,
    requiredCompletionDate: '2024-09-15',
    submittedAt: '2024-08-08T14:20:00Z',
    updatedAt: '2024-08-12T10:15:00Z',
    assignedTo: 'Mike Chen'
  },
  {
    id: '3',
    title: 'Custom Reporting Dashboard',
    description: 'Development of custom analytics dashboard for HR metrics and KPI tracking.',
    category: 'custom_development',
    priority: 'medium',
    urgency: 'medium',
    status: 'completed',
    estimatedHours: 50,
    budget: 10000,
    requiredCompletionDate: '2024-08-05',
    submittedAt: '2024-07-10T11:30:00Z',
    updatedAt: '2024-08-05T17:00:00Z',
    assignedTo: 'Lisa Wang'
  },
  {
    id: '4',
    title: 'Employee Onboarding Automation',
    description: 'Automate the employee onboarding process with digital forms and workflow management.',
    category: 'process_automation',
    priority: 'low',
    urgency: 'low',
    status: 'under_review',
    estimatedHours: 25,
    budget: 4500,
    requiredCompletionDate: '2024-09-30',
    submittedAt: '2024-08-14T16:45:00Z',
    updatedAt: '2024-08-14T16:45:00Z'
  },
  {
    id: '5',
    title: 'Data Migration from Legacy System',
    description: 'Migrate employee data from legacy HR system to new cloud-based platform.',
    category: 'data_migration',
    priority: 'critical',
    urgency: 'high',
    status: 'submitted',
    estimatedHours: 60,
    budget: 12000,
    requiredCompletionDate: '2024-08-25',
    submittedAt: '2024-08-16T09:15:00Z',
    updatedAt: '2024-08-16T09:15:00Z'
  }
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const statusIcons = {
  draft: Edit,
  submitted: PlayCircle,
  under_review: Clock,
  approved: CheckCircle,
  in_progress: PlayCircle,
  completed: CheckCircle,
  rejected: XCircle,
  cancelled: Pause
}

const categoryLabels: Record<string, string> = {
  payroll_setup: 'Payroll Setup',
  data_migration: 'Data Migration',
  system_integration: 'System Integration',
  reporting_setup: 'Reporting Setup',
  benefits_configuration: 'Benefits Configuration',
  compliance_audit: 'Compliance Audit',
  training_support: 'Training Support',
  custom_development: 'Custom Development',
  process_automation: 'Process Automation',
  other: 'Other'
}

export default function WorkRequestsPage() {
  const [requests, setRequests] = useState<WorkRequest[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getRequestStats = () => {
    const totalRequests = requests.length
    const pendingRequests = requests.filter(r => ['submitted', 'under_review'].includes(r.status)).length
    const activeRequests = requests.filter(r => ['approved', 'in_progress'].includes(r.status)).length
    const completedRequests = requests.filter(r => r.status === 'completed').length

    return { totalRequests, pendingRequests, activeRequests, completedRequests }
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

  const canEdit = (status: string) => {
    return ['draft', 'submitted', 'under_review'].includes(status)
  }

  const stats = getRequestStats()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
              <p className="text-gray-600">Submit and track your work requests</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/work-requests/new'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <PlayCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRequests}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.completedRequests}</p>
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
                placeholder="Search requests..."
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
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
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
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No work requests found matching your criteria.</p>
              <Button 
                onClick={() => window.location.href = '/work-requests/new'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Request
              </Button>
            </div>
          ) : (
            filteredRequests.map(request => {
              const StatusIcon = statusIcons[request.status]
              return (
                <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {categoryLabels[request.category] || request.category}</span>
                        {request.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {request.estimatedHours}h
                          </span>
                        )}
                        {request.budget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${request.budget.toLocaleString()}
                          </span>
                        )}
                        {request.requiredCompletionDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {formatDate(request.requiredCompletionDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>Submitted: {formatDateTime(request.submittedAt)}</p>
                      {request.assignedTo && (
                        <p>Assigned to: {request.assignedTo}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/work-requests/${request.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {canEdit(request.status) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/work-requests/${request.id}/edit`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
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

