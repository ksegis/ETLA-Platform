'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users, 
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Check,
  X,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WorkRequest {
  id: string
  title: string
  customerName: string
  customerEmail: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  submittedAt: string
  updatedAt: string
  estimatedHours?: number
  budget?: number
  requiredCompletionDate?: string
  assignedTo?: string
  description: string
}

const mockRequests: WorkRequest[] = [
  {
    id: '1',
    title: 'Payroll System Integration',
    customerName: 'Acme Corporation',
    customerEmail: 'john.smith@acme.com',
    category: 'system_integration',
    priority: 'high',
    urgency: 'medium',
    status: 'in_progress',
    submittedAt: '2024-08-10T09:00:00Z',
    updatedAt: '2024-08-14T14:30:00Z',
    estimatedHours: 40,
    budget: 8000,
    requiredCompletionDate: '2024-09-15',
    assignedTo: 'Sarah Johnson',
    description: 'Need to integrate new payroll system with existing HR database'
  },
  {
    id: '2',
    title: 'Benefits Enrollment Setup',
    customerName: 'TechStart Inc',
    customerEmail: 'hr@techstart.com',
    category: 'benefits_configuration',
    priority: 'medium',
    urgency: 'low',
    status: 'submitted',
    submittedAt: '2024-08-12T10:30:00Z',
    updatedAt: '2024-08-12T10:30:00Z',
    estimatedHours: 20,
    budget: 4000,
    requiredCompletionDate: '2024-09-30',
    description: 'Configure benefits enrollment for Q4 open enrollment period'
  },
  {
    id: '3',
    title: 'Compliance Audit Report',
    customerName: 'Global Enterprises',
    customerEmail: 'compliance@global.com',
    category: 'compliance_audit',
    priority: 'critical',
    urgency: 'urgent',
    status: 'under_review',
    submittedAt: '2024-08-14T08:00:00Z',
    updatedAt: '2024-08-14T08:00:00Z',
    estimatedHours: 60,
    budget: 12000,
    requiredCompletionDate: '2024-08-25',
    description: 'Annual compliance audit and reporting requirements'
  },
  {
    id: '4',
    title: 'Data Migration Project',
    customerName: 'Manufacturing Co',
    customerEmail: 'it@manufacturing.com',
    category: 'data_migration',
    priority: 'high',
    urgency: 'high',
    status: 'approved',
    submittedAt: '2024-08-13T14:00:00Z',
    updatedAt: '2024-08-14T09:00:00Z',
    estimatedHours: 80,
    budget: 15000,
    requiredCompletionDate: '2024-10-01',
    assignedTo: 'Mike Chen',
    description: 'Migrate legacy payroll data to new system'
  },
  {
    id: '5',
    title: 'Custom Reporting Dashboard',
    customerName: 'Retail Chain LLC',
    customerEmail: 'analytics@retail.com',
    category: 'custom_development',
    priority: 'medium',
    urgency: 'medium',
    status: 'scheduled',
    submittedAt: '2024-08-11T16:00:00Z',
    updatedAt: '2024-08-13T11:00:00Z',
    estimatedHours: 50,
    budget: 10000,
    requiredCompletionDate: '2024-09-20',
    assignedTo: 'Lisa Wang',
    description: 'Build custom analytics dashboard for executive reporting'
  }
]

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  scheduled: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const statusIcons = {
  submitted: Clock,
  under_review: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  scheduled: Calendar,
  in_progress: AlertCircle,
  completed: CheckCircle,
  cancelled: XCircle
}

export default function ProjectManagementPage() {
  const [requests, setRequests] = useState<WorkRequest[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: requests.length,
    pending: requests.filter(r => ['submitted', 'under_review'].includes(r.status)).length,
    active: requests.filter(r => ['approved', 'scheduled', 'in_progress'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleStatusUpdate = (requestId: string, newStatus: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: newStatus as any, updatedAt: new Date().toISOString() }
        : req
    ))
  }

  const handleBulkAction = (action: string) => {
    if (selectedRequests.length === 0) return
    
    selectedRequests.forEach(requestId => {
      handleStatusUpdate(requestId, action)
    })
    
    setSelectedRequests([])
  }

  const toggleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const selectAllRequests = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(filteredRequests.map(r => r.id))
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">Review and manage work requests from customers</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/project-management/schedule'}
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule View
            </Button>
            <Button 
              onClick={() => window.location.href = '/project-management/resources'}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Team Resources
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search requests, customers, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedRequests.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedRequests.length} request{selectedRequests.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('approved')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('under_review')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedRequests([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Work Requests</h2>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                onChange={selectAllRequests}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const StatusIcon = statusIcons[request.status]
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.id)}
                          onChange={() => toggleSelectRequest(request.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.title}</div>
                          <div className="text-sm text-gray-500">{formatCategory(request.category)}</div>
                          <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                            {request.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                          <div className="text-sm text-gray-500">{request.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {formatStatus(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `/project-management/requests/${request.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {request.status === 'submitted' && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'scheduled')}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Schedule
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

