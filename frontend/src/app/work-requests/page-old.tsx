'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface WorkRequest {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  submittedAt: string
  updatedAt: string
  description: string
}

const mockRequests: WorkRequest[] = [
  {
    id: '1',
    title: 'Payroll System Integration',
    category: 'system_integration',
    priority: 'high',
    status: 'in_progress',
    submittedAt: '2024-08-10',
    updatedAt: '2024-08-14',
    description: 'Need to integrate new payroll system with existing HR database'
  },
  {
    id: '2',
    title: 'Employee Onboarding Portal',
    category: 'web_development',
    priority: 'medium',
    status: 'under_review',
    submittedAt: '2024-08-12',
    updatedAt: '2024-08-13',
    description: 'Create a self-service portal for new employee onboarding'
  },
  {
    id: '3',
    title: 'Data Migration Tool',
    category: 'data_migration',
    priority: 'critical',
    status: 'approved',
    submittedAt: '2024-08-08',
    updatedAt: '2024-08-11',
    description: 'Tool to migrate legacy employee data to new system'
  },
  {
    id: '4',
    title: 'Performance Dashboard',
    category: 'analytics',
    priority: 'low',
    status: 'completed',
    submittedAt: '2024-07-25',
    updatedAt: '2024-08-05',
    description: 'Real-time dashboard for employee performance metrics'
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
  scheduled: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle,
  cancelled: XCircle
}

function WorkRequestsContent() {
  const [requests, setRequests] = useState<WorkRequest[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredRequests = requests.filter((request: any: any) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const formatStatus = (status: string) => {
    return status.split('_').map((word: any: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map((word: any: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Requests</h1>
          <p className="text-gray-600 mt-1">Manage and track your work requests</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r: any: any) => r.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r: any: any) => r.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r: any: any) => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e: any) => setPriorityFilter(e.target.value)}
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

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Requests</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No requests found matching your criteria.</p>
            </div>
          ) : (
            filteredRequests.map((request: any) => {
              const StatusIcon = statusIcons[request.status as keyof typeof statusIcons]
              return (
                <div key={request.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status as keyof typeof statusColors as keyof typeof statusColors]}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {formatStatus(request.status)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority as keyof typeof priorityColors as keyof typeof priorityColors]}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {formatCategory(request.category)}</span>
                        <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/work-requests/${request.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function WorkRequestsPage() {
  return (
    <DashboardLayout>
      <WorkRequestsContent />
    </DashboardLayout>
  )
}

