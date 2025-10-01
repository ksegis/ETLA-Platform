'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Filter, Search, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Trash2, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TenantSelector from '@/components/TenantSelector'
import { workRequestService, type WorkRequest } from '@/services/workRequestService'
import { useTenant, useCurrentTenantId } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'

// Status configuration
const statusConfig = {
  submitted: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Submitted' },
  under_review: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  scheduled: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Scheduled' },
  in_progress: { icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Cancelled' }
}

// Priority configuration
const priorityConfig = {
  low: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Low' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
  critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' }
}

interface WorkRequestModalProps {
  isOpen: boolean
  onClose: () => void
  workRequest?: WorkRequest | null
  onSave: () => void
}

function WorkRequestModal({ isOpen, onClose, workRequest, onSave }: WorkRequestModalProps) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    urgency: 'low' | 'medium' | 'high' | 'urgent'
    estimated_hours: string
    budget: string
    required_completion_date: string
  }>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    urgency: 'medium',
    estimated_hours: '',
    budget: '',
    required_completion_date: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tenantId = useCurrentTenantId()
  const { user } = useAuth()

  useEffect(() => {
    if (workRequest) {
      setFormData({
        title: workRequest.title,
        description: workRequest.description,
        category: workRequest.category,
        priority: workRequest.priority,
        urgency: workRequest.urgency,
        estimated_hours: workRequest.estimated_hours?.toString() || '',
        budget: workRequest.budget?.toString() || '',
        required_completion_date: workRequest.required_completion_date || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        urgency: 'medium',
        estimated_hours: '',
        budget: '',
        required_completion_date: ''
      })
    }
  }, [workRequest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !user) return

    setIsSubmitting(true)
    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        urgency: formData.urgency,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        required_completion_date: formData.required_completion_date || undefined
      }

      if (workRequest) {
        await workRequestService.updateWorkRequest(workRequest.id, requestData)
      } else {
        await workRequestService.createWorkRequest(requestData, user.id, tenantId)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving work request:', error)
      alert('Failed to save work request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {workRequest ? 'Edit Work Request' : 'Create New Work Request'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="system_integration">System Integration</option>
                <option value="web_development">Web Development</option>
                <option value="data_migration">Data Migration</option>
                <option value="reporting">Reporting</option>
                <option value="maintenance">Maintenance</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e: any) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency *
              </label>
              <select
                required
                value={formData.urgency}
                onChange={(e: any) => setFormData({ ...formData, urgency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimated_hours}
                onChange={(e: any) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e: any) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Completion Date
              </label>
              <input
                type="date"
                value={formData.required_completion_date}
                onChange={(e: any) => setFormData({ ...formData, required_completion_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (workRequest ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function WorkRequestsPage() {
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<WorkRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    in_progress: 0,
    completed: 0
  })

  const tenantId = useCurrentTenantId()
  const { user, tenantUser } = useAuth()
  const { canManage, canView } = usePermissions()

  // Load work requests
  const loadWorkRequests = async () => {
    if (!tenantId) return

    setLoading(true)
    try {
      let requests: WorkRequest[]
      
      // If user is client_user, only show their own requests
      if (tenantUser?.role === 'client_user' && user) {
        requests = await workRequestService.getWorkRequestsForUser(user.id, tenantId)
      } else {
        requests = await workRequestService.getWorkRequests(tenantId)
      }
      
      setWorkRequests(requests)
      setFilteredRequests(requests)

      // Load stats
      const requestStats = await workRequestService.getWorkRequestStats(tenantId)
      setStats(requestStats)
    } catch (err) {
      setError('Failed to load work requests')
      console.error('Error loading work requests:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = workRequests

    if (searchTerm) {
      filtered = filtered.filter((request: any) =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((request: any) => request.status === statusFilter)
    }

    if (priorityFilter) {
      filtered = filtered.filter((request: any) => request.priority === priorityFilter)
    }

    setFilteredRequests(filtered)
  }, [workRequests, searchTerm, statusFilter, priorityFilter])

  // Load data when tenant changes
  useEffect(() => {
    if (tenantId) {
      loadWorkRequests()
    }
  }, [tenantId])

  const handleCreateRequest = () => {
    setSelectedRequest(null)
    setIsModalOpen(true)
  }

  const handleEditRequest = (request: WorkRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = async (request: WorkRequest) => {
    if (!confirm('Are you sure you want to delete this work request?')) return

    try {
      await workRequestService.deleteWorkRequest(request.id)
      loadWorkRequests()
    } catch (error) {
      console.error('Error deleting work request:', error)
      alert('Failed to delete work request')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!canView(FEATURES.WORK_REQUESTS)) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view work requests.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
            <p className="text-gray-600">Manage and track work requests</p>
          </div>
          <div className="flex items-center gap-4">
            <TenantSelector />
            {canManage(FEATURES.WORK_REQUESTS, PERMISSIONS.CREATE) && (
              <Button onClick={handleCreateRequest}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
                </div>
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.under_review}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(statusConfig).map(([key, config]: any) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e: any) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {Object.entries(priorityConfig).map(([key, config]: any) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Work Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading work requests...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadWorkRequests} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work requests found</h3>
            <p className="text-gray-600 mb-4">
              {workRequests.length === 0 
                ? "Get started by creating your first work request."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {canCreate(FEATURES.WORK_REQUESTS) && workRequests.length === 0 && (
              <Button onClick={handleCreateRequest}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Request
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request: any) => {
              const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock
              const statusStyle = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.submitted
              const priorityStyle = priorityConfig[request.priority as keyof typeof priorityConfig] || priorityConfig.medium

              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusStyle.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.color}`}>
                            {priorityStyle.label}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {request.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {request.customer_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created {formatDate(request.created_at)}
                          </div>
                          {request.estimated_hours && (
                            <div>
                              Est. {request.estimated_hours}h
                            </div>
                          )}
                          {request.budget && (
                            <div>
                              ${request.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManage(FEATURES.WORK_REQUESTS, PERMISSIONS.EDIT) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditRequest(request)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canManage(FEATURES.WORK_REQUESTS, PERMISSIONS.DELETE) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteRequest(request)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal */}
        <WorkRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workRequest={selectedRequest}
          onSave={loadWorkRequests}
        />
      </div>
    </DashboardLayout>
  )
}

