'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Trash2, Calendar, LayoutGrid, List, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'

// Types
interface WorkRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category?: string
  tenant_id: string
  customer_id?: string
  created_at: string
  updated_at: string
  business_justification?: string
  estimated_budget?: number
  requested_completion_date?: string
  approval_workflow?: string
  converted_to_project?: boolean
  project_id?: string
  impact_assessment?: string
  customer?: {
    first_name?: string
    last_name?: string
    email?: string
    company_name?: string
  }
}

interface WorkRequestStats {
  total: number
  submitted: number
  under_review: number
  approved: number
  in_progress: number
  completed: number
}

// Status configuration
const statusConfig = {
  draft: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Draft' },
  submitted: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Submitted' },
  under_review: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
  declined: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Declined' },
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

// Work Request Modal Component
const WorkRequestModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  request = null, 
  title = "Create New Work Request" 
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<WorkRequest>) => void
  request?: WorkRequest | null
  title?: string
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'submitted',
    business_justification: '',
    estimated_budget: '',
    requested_completion_date: '',
    impact_assessment: ''
  })

  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || '',
        description: request.description || '',
        category: request.category || '',
        priority: request.priority || 'medium',
        status: request.status || 'submitted',
        business_justification: request.business_justification || '',
        estimated_budget: request.estimated_budget?.toString() || '',
        requested_completion_date: request.requested_completion_date || '',
        impact_assessment: request.impact_assessment || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'submitted',
        business_justification: '',
        estimated_budget: '',
        requested_completion_date: '',
        impact_assessment: ''
      })
    }
  }, [request, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : undefined
    }
    
    onSave(submitData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter work request title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e: any) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="development">Development</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="security">Security</option>
                <option value="maintenance">Maintenance</option>
                <option value="enhancement">Enhancement</option>
                <option value="support">Support</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e: any) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e: any) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Budget
              </label>
              <Input
                type="number"
                value={formData.estimated_budget}
                onChange={(e: any) => setFormData(prev => ({ ...prev, estimated_budget: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Completion Date
              </label>
              <Input
                type="date"
                value={formData.requested_completion_date}
                onChange={(e: any) => setFormData(prev => ({ ...prev, requested_completion_date: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e: any) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the work request in detail"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Justification
            </label>
            <textarea
              value={formData.business_justification}
              onChange={(e: any) => setFormData(prev => ({ ...prev, business_justification: e.target.value }))}
              placeholder="Explain the business need and expected benefits"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact Assessment
            </label>
            <textarea
              value={formData.impact_assessment}
              onChange={(e: any) => setFormData(prev => ({ ...prev, impact_assessment: e.target.value }))}
              placeholder="Describe the potential impact if this request is not fulfilled"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {request ? 'Update Request' : 'Create Request'}
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
  const [loading, setloading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null)
  const [stats, setStats] = useState<WorkRequestStats>({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    in_progress: 0,
    completed: 0
  })

  const { user } = useAuth()
  const { selectedTenant } = useTenant()

  // Load work requests from database
  const loadWorkRequests = async () => {
    if (!selectedTenant?.id) {
      console.log('No tenant selected, skipping load')
      setloading(false)
      return
    }

    try {
      setloading(true)
      setError(null)
      
      console.log('loading work requests for tenant:', selectedTenant.id, selectedTenant.name)

      // Query work requests with error handling
      const { data, error: queryError } = await supabase
        .from('work_requests')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('created_at', { ascending: false })

      if (queryError) {
        console.error('Database query error:', queryError)
        setError(`Failed to load work requests: ${queryError.message || 'Unknown error'}`)
        setWorkRequests([])
        setFilteredRequests([])
        return
      }

      console.log('Loaded work requests:', data)
      setWorkRequests(data || [])
      setFilteredRequests(data || [])

      // Calculate stats
      const requestStats = {
        total: data?.length || 0,
        submitted: data?.filter((r: any) => r.status === 'submitted').length || 0,
        under_review: data?.filter((r: any) => r.status === 'under_review').length || 0,
        approved: data?.filter((r: any) => r.status === 'approved').length || 0,
        in_progress: data?.filter((r: any) => r.status === 'in_progress').length || 0,
        completed: data?.filter((r: any) => r.status === 'completed').length || 0
      }
      setStats(requestStats)

    } catch (err) {
      console.error('Error loading work requests:', err)
      setError('Failed to load work requests')
      setWorkRequests([])
      setFilteredRequests([])
    } finally {
      setloading(false)
    }
  }

  // Create new work request
  const handleCreateRequest = async (requestData: Partial<WorkRequest>) => {
    if (!selectedTenant?.id || !user?.id) {
      setError('Missing tenant or user information')
      return
    }

    try {
      const newRequest = {
        ...requestData,
        tenant_id: selectedTenant.id,
        customer_id: selectedTenant.id, // Using tenant_id as customer_id for now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creating work request:', newRequest)

      const { data, error } = await supabase
        .from('work_requests')
        .insert([newRequest])
        .select()
        .single()

      if (error) {
        console.error('Error creating work request:', error)
        setError(`Failed to create work request: ${error.message}`)
        return
      }

      console.log('Created work request:', data)
      setWorkRequests(prev => [data, ...prev])
      setIsCreateModalOpen(false)
      loadWorkRequests() // Reload to update stats
      setError(null)
    } catch (error) {
      console.error('Error creating work request:', error)
      setError('Failed to create work request. Please try again.')
    }
  }

  // Update work request
  const handleUpdateRequest = async (requestId: string, updates: Partial<WorkRequest>) => {
    try {
      const { data, error } = await supabase
        .from('work_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

      if (error) {
        console.error('Error updating work request:', error)
        setError(`Failed to update work request: ${error.message}`)
        return
      }

      setWorkRequests(prev => prev.map((r: any) => r.id === requestId ? data : r))
      setIsEditModalOpen(false)
      setSelectedRequest(null)
      loadWorkRequests() // Reload to update stats
      setError(null)
    } catch (error) {
      console.error('Error updating work request:', error)
      setError('Failed to update work request. Please try again.')
    }
  }

  // Delete work request
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this work request?')) return

    try {
      const { error } = await supabase
        .from('work_requests')
        .delete()
        .eq('id', requestId)

      if (error) {
        console.error('Error deleting work request:', error)
        setError(`Failed to delete work request: ${error.message}`)
        return
      }

      setWorkRequests(prev => prev.filter((r: any) => r.id !== requestId))
      loadWorkRequests() // Reload to update stats
      setError(null)
    } catch (error) {
      console.error('Error deleting work request:', error)
      setError('Failed to delete work request. Please try again.')
    }
  }

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = workRequests

    if (searchTerm) {
      filtered = filtered.filter((request: any) =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.business_justification?.toLowerCase().includes(searchTerm.toLowerCase())
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
    loadWorkRequests()
  }, [selectedTenant?.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getRequestName = (request: WorkRequest) => {
    return request.title || `Request ${request.id?.slice(0, 8)}`
  }

  if (!selectedTenant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Please select a tenant to view work requests.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 underline text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
            <p className="text-gray-600">Manage and track your work requests</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Submitted</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.submitted}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.under_review}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">In Progress</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.in_progress}</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e: any) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              
              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Work Requests ({filteredRequests.length})</CardTitle>
            <CardDescription>
              {filteredRequests.length} of {workRequests.length} requests
              {selectedTenant && <span className="ml-2">| Tenant: {selectedTenant.name}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">loading work requests...</p>
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
                {workRequests.length === 0 && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Button>
                )}
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request: any) => {
                      const StatusIcon = statusConfig[request.status as keyof typeof statusConfig as keyof typeof statusConfig]?.icon || Clock
                      const statusStyle = statusConfig[request.status as keyof typeof statusConfig as keyof typeof statusConfig] || statusConfig.submitted

                      return (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{getRequestName(request)}</div>
                              <div className="text-sm text-gray-500">{request.description?.slice(0, 100)}...</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusStyle.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={request.priority === 'high' || request.priority === 'critical' ? 'destructive' : 'secondary'}>
                              {request.priority || 'medium'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(request.estimated_budget || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.created_at)}
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
                                  setSelectedRequest(request)
                                  setIsEditModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteRequest(request.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request: any) => {
                  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig as keyof typeof statusConfig]?.icon || Clock
                  const statusStyle = statusConfig[request.status as keyof typeof statusConfig as keyof typeof statusConfig] || statusConfig.submitted

                  return (
                    <Card key={request.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{getRequestName(request)}</CardTitle>
                            <CardDescription>{request.description?.slice(0, 100)}...</CardDescription>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
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
                            <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusStyle.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Priority:</span>
                            <Badge variant={request.priority === 'high' || request.priority === 'critical' ? 'destructive' : 'secondary'}>
                              {request.priority || 'medium'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Budget:</span>
                            <span className="text-sm font-medium">
                              ${(request.estimated_budget || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Created:</span>
                            <span className="text-sm text-gray-500">{formatDate(request.created_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        <WorkRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateRequest}
          title="Create New Work Request"
        />

        {/* Edit Modal */}
        <WorkRequestModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedRequest(null)
          }}
          onSave={(data: any) => selectedRequest && handleUpdateRequest(selectedRequest.id, data)}
          request={selectedRequest}
          title="Edit Work Request"
        />
      </div>
    </DashboardLayout>
  )
}

