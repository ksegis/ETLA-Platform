'use client'

import { useState, useEffect } from 'react'
import { 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  X,
  Calendar,
  User,
  DollarSign,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase, WorkRequest } from '@/lib/supabase'
import { useTenant } from '@/contexts/TenantContext'

interface WorkRequestWithDetails extends WorkRequest {
  customer: {
    first_name: string
    last_name: string
    email: string
  }
  assigned_member?: {
    name: string
  }
}

export default function WorkRequestsPage() {
  const { currentTenant } = useTenant()
  const [requests, setRequests] = useState<WorkRequestWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (currentTenant) {
      fetchWorkRequests()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('work_requests')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'work_requests',
            filter: `tenant_id=eq.${currentTenant}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              fetchWorkRequests() // Refetch to get joined data
            } else if (payload.eventType === 'UPDATE') {
              setRequests(prev => prev.map(req => 
                req.id === payload.new.id ? { ...req, ...payload.new } : req
              ))
            } else if (payload.eventType === 'DELETE') {
              setRequests(prev => prev.filter(req => req.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [currentTenant])

  const fetchWorkRequests = async () => {
    if (!currentTenant) return

    try {
      const { data, error } = await supabase
        .from('work_requests')
        .select(`
          *,
          customer:users!customer_id(first_name, last_name, email),
          assigned_member:team_members(name)
        `)
        .eq('tenant_id', currentTenant)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching work requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = () => {
    window.location.href = '/work-requests/new'
  }

  const handleViewRequest = (requestId: string) => {
    window.location.href = `/work-requests/${requestId}`
  }

  const handleEditRequest = async (requestId: string) => {
    // In a real app, this would open an edit modal or navigate to edit page
    alert(`Edit request ${requestId} - This would open an edit form`)
  }

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return

    try {
      const { error } = await supabase
        .from('work_requests')
        .delete()
        .eq('id', requestId)
        .eq('tenant_id', currentTenant)

      if (error) throw error

      setRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('Error deleting request')
    }
  }

  const handleDuplicateRequest = async (request: WorkRequestWithDetails) => {
    try {
      const { data, error } = await supabase
        .from('work_requests')
        .insert({
          tenant_id: currentTenant,
          title: `${request.title} (Copy)`,
          description: request.description,
          category: request.category,
          priority: request.priority,
          urgency: request.urgency,
          customer_id: request.customer_id,
          estimated_hours: request.estimated_hours,
          budget: request.budget,
          required_completion_date: request.required_completion_date
        })
        .select()
        .single()

      if (error) throw error

      // Refetch to get the new request with joined data
      fetchWorkRequests()
    } catch (error) {
      console.error('Error duplicating request:', error)
      alert('Error duplicating request')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setCategoryFilter('all')
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${request.customer.first_name} ${request.customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      case 'in_progress': return 'bg-indigo-100 text-indigo-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
              <p className="text-gray-600">Manage and track your project requests</p>
            </div>
            <Button 
              onClick={handleCreateRequest}
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
                  <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {requests.filter(r => r.status === 'submitted' || r.status === 'under_review').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {requests.filter(r => r.status === 'in_progress' || r.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(requests.reduce((sum, r) => sum + (r.budget || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="system_integration">System Integration</option>
                  <option value="benefits_configuration">Benefits Configuration</option>
                  <option value="compliance_audit">Compliance Audit</option>
                  <option value="data_migration">Data Migration</option>
                  <option value="custom_development">Custom Development</option>
                  <option value="training">Training</option>
                  <option value="support">Support</option>
                  <option value="consulting">Consulting</option>
                </select>
                
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
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
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {request.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {request.category.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.customer.first_name} {request.customer.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{request.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.budget ? formatCurrency(request.budget) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleViewRequest(request.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditRequest(request.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDuplicateRequest(request)}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteRequest(request.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
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
          
          {filteredRequests.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No work requests found matching your criteria.</p>
              <Button 
                onClick={handleCreateRequest}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

