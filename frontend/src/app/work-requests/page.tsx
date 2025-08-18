'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, RefreshCw, Plus, Eye, Edit, MoreHorizontal, Database, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'

interface WorkRequest {
  id: string
  request_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'in_progress' | 'completed' | 'cancelled'
  customer_id: string
  tenant_id: string
  estimated_hours?: number
  budget?: number
  required_completion_date?: string
  internal_notes?: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name?: string
    phone?: string
    department?: string
    job_title?: string
  }
  customers?: {
    email: string
    first_name?: string
    last_name?: string
    company_name?: string
  }
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const urgencyColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const categoryLabels: { [key: string]: string } = {
  payroll_setup: 'Payroll Setup',
  data_migration: 'Data Migration',
  system_integration: 'System Integration',
  reporting_setup: 'Reporting Setup',
  benefits_configuration: 'Benefits Configuration',
  compliance_audit: 'Compliance Audit',
  training_support: 'Training Support',
  custom_development: 'Custom Development',
  other: 'Other'
}

export default function WorkRequestsPage() {
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<WorkRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dataSource, setDataSource] = useState<'database' | 'localStorage' | 'none'>('none')
  const [lastLoaded, setLastLoaded] = useState<string>('')

  // Load work requests from database
  const loadWorkRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔍 Loading work requests from database...')

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.warn('⚠️ No authenticated user, falling back to localStorage')
        loadFromLocalStorage()
        return
      }

      setCurrentUser(user)
      console.log('👤 Loading requests for user:', user.email, 'ID:', user.id)

      // First, try to query work_requests with profiles (since foreign key points to profiles)
      console.log('🔍 Attempting to query work_requests with profiles relationship...')
      const { data: workRequestsData, error: requestsError } = await supabase
        .from('work_requests')
        .select(`
          *,
          profiles!work_requests_customer_id_fkey (
            full_name, phone, department, job_title
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (requestsError) {
        console.error('❌ Error loading work requests with profiles:', requestsError)
        
        // If profiles relationship fails, try without relationships
        console.log('🔍 Falling back to simple work_requests query...')
        const { data: simpleData, error: simpleError } = await supabase
          .from('work_requests')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (simpleError) {
          console.error('❌ Error loading simple work requests:', simpleError)
          setError(`Database error: ${simpleError.message}`)
          loadFromLocalStorage()
          return
        }

        console.log('✅ Successfully loaded work requests (simple query):', simpleData?.length || 0)
        const requests = simpleData || []
        setWorkRequests(requests)
        setFilteredRequests(requests)
        setDataSource('database')
        setLastLoaded(new Date().toLocaleTimeString())

        // Try to get customer info separately
        if (requests.length > 0) {
          await loadCustomerInfo(requests)
        }

        return
      }

      console.log('✅ Successfully loaded work requests with profiles:', workRequestsData?.length || 0)
      console.log('📋 Work requests data:', workRequestsData)

      const requests = workRequestsData || []
      setWorkRequests(requests)
      setFilteredRequests(requests)
      setDataSource('database')
      setLastLoaded(new Date().toLocaleTimeString())

      // If no database records, also check localStorage
      if (requests.length === 0) {
        console.log('📦 No database records found, checking localStorage...')
        loadFromLocalStorage(true) // true = append to database results
      }

    } catch (error) {
      console.error('❌ Error in loadWorkRequests:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  // Load customer info separately if needed
  const loadCustomerInfo = async (requests: WorkRequest[]) => {
    try {
      console.log('🔍 Loading customer info separately...')
      
      // Get unique customer IDs
      const customerIds = [...new Set(requests.map(r => r.customer_id))]
      
      // Try to get from customers table
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, email, first_name, last_name, company_name')
        .in('id', customerIds)

      if (!customersError && customersData) {
        console.log('✅ Successfully loaded customer info:', customersData.length)
        
        // Merge customer info with requests
        const updatedRequests = requests.map(request => ({
          ...request,
          customers: customersData.find(c => c.id === request.customer_id)
        }))
        
        setWorkRequests(updatedRequests)
        setFilteredRequests(updatedRequests)
      } else {
        console.warn('⚠️ Could not load customer info:', customersError?.message)
      }
    } catch (error) {
      console.error('❌ Error loading customer info:', error)
    }
  }

  // Load work requests from localStorage as fallback
  const loadFromLocalStorage = (append = false) => {
    try {
      console.log('📦 Loading work requests from localStorage...')
      const stored = localStorage.getItem('etla_work_requests')
      const localRequests = stored ? JSON.parse(stored) : []
      
      console.log('📦 Found localStorage requests:', localRequests.length)

      if (localRequests.length > 0) {
        // Convert localStorage format to match database format
        const convertedRequests = localRequests.map((req: any) => ({
          id: req.id || `local-${Date.now()}-${Math.random()}`,
          request_id: req.request_id || req.id || 'LOCAL-REQUEST',
          title: req.title || 'Untitled Request',
          description: req.description || '',
          category: req.category || 'other',
          priority: req.priority || 'medium',
          urgency: req.urgency || 'medium',
          status: req.status || 'submitted',
          customer_id: req.customer_id || 'unknown',
          tenant_id: req.tenant_id || 'unknown',
          estimated_hours: req.estimatedHours ? parseInt(req.estimatedHours) : null,
          budget: req.budget ? parseFloat(req.budget) : null,
          required_completion_date: req.requiredCompletionDate || null,
          internal_notes: req.tags ? req.tags.join(', ') : null,
          created_at: req.createdAt || new Date().toISOString(),
          updated_at: req.updatedAt || new Date().toISOString(),
          customers: {
            email: req.createdBy || 'Unknown User',
            first_name: 'Local',
            last_name: 'User',
            company_name: 'Local Storage'
          }
        }))

        if (append) {
          setWorkRequests(prev => [...prev, ...convertedRequests])
          setFilteredRequests(prev => [...prev, ...convertedRequests])
          setDataSource('database') // Keep as database since we have both
        } else {
          setWorkRequests(convertedRequests)
          setFilteredRequests(convertedRequests)
          setDataSource('localStorage')
        }
        
        setLastLoaded(new Date().toLocaleTimeString())
        console.log('✅ Successfully loaded from localStorage')
      } else {
        if (!append) {
          setWorkRequests([])
          setFilteredRequests([])
          setDataSource('none')
        }
        console.log('📦 No localStorage requests found')
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error)
      if (!append) {
        setWorkRequests([])
        setFilteredRequests([])
        setDataSource('none')
      }
    }
  }

  // Initial load
  useEffect(() => {
    loadWorkRequests()
  }, [])

  // Filter and search
  useEffect(() => {
    let filtered = workRequests

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.customers?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter)
    }

    setFilteredRequests(filtered)
  }, [workRequests, searchTerm, statusFilter, priorityFilter])

  // Calculate statistics
  const stats = {
    total: workRequests.length,
    submitted: workRequests.filter(r => r.status === 'submitted').length,
    inProgress: workRequests.filter(r => r.status === 'in_progress').length,
    completed: workRequests.filter(r => r.status === 'completed').length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getCustomerName = (request: WorkRequest) => {
    // Try profiles first
    if (request.profiles?.full_name) {
      return request.profiles.full_name
    }
    
    // Then try customers
    if (request.customers) {
      const { first_name, last_name, email, company_name } = request.customers
      if (first_name && last_name) {
        return `${first_name} ${last_name}`
      }
      if (company_name) {
        return company_name
      }
      return email
    }
    
    // Fallback to current user
    if (currentUser?.email) {
      return currentUser.email
    }
    
    return 'Unknown User'
  }

  const handleRefresh = () => {
    loadWorkRequests()
  }

  const handleViewRequest = (requestId: string) => {
    window.location.href = `/work-requests/${requestId}`
  }

  const handleEditRequest = (requestId: string) => {
    window.location.href = `/work-requests/${requestId}/edit`
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
            <p className="text-gray-600">Manage and track your work requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => window.location.href = '/work-requests/new'}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">📊 Total requests loaded:</span> {workRequests.length}
            </div>
            <div>
              <span className="font-medium">🔍 Filtered requests shown:</span> {filteredRequests.length}
            </div>
            <div>
              <span className="font-medium">📦 Data source:</span> {dataSource}
            </div>
            <div>
              <span className="font-medium">🕒 Last loaded:</span> {lastLoaded}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Check browser console for detailed logs
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Database Error</p>
                <p className="text-xs text-red-700">{error}</p>
                <p className="text-xs text-gray-600 mt-1">Falling back to localStorage data if available</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
            </div>
          </div>
        </div>

        {/* Work Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading work requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work requests found</h3>
              <p className="text-gray-600 mb-4">
                {workRequests.length === 0
                  ? "You haven't submitted any work requests yet."
                  : "No requests match your current filters."}
              </p>
              <Button
                onClick={() => window.location.href = '/work-requests/new'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                          <div className="text-sm font-medium text-gray-900">
                            {request.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {request.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {request.request_id}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getCustomerName(request)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {categoryLabels[request.category] || request.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[request.priority]}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${urgencyColors[request.urgency]}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request.id)}
                            className="p-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRequest(request.id)}
                            className="p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

