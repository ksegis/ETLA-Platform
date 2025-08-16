'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
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
  status: string
  estimatedHours?: number
  budget?: number
  requiredCompletionDate?: string
  tags: string[]
  attachments?: any[]
  createdAt: string
  createdBy: string
  source?: string
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
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800'
}

export default function WorkRequestsPage() {
  const [requests, setRequests] = useState<WorkRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<WorkRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRequests = () => {
    console.log('🔄 Loading work requests...')
    setLoading(true)
    setError('')

    try {
      // Load from localStorage
      const storedRequests = localStorage.getItem('etla_work_requests')
      console.log('📂 Raw localStorage data:', storedRequests)

      let loadedRequests: WorkRequest[] = []

      if (storedRequests) {
        try {
          loadedRequests = JSON.parse(storedRequests)
          console.log('✅ Parsed requests from localStorage:', loadedRequests.length)
        } catch (parseError) {
          console.error('❌ Failed to parse localStorage data:', parseError)
          setError('Failed to parse stored requests')
          loadedRequests = []
        }
      } else {
        console.log('📭 No requests found in localStorage, creating sample data')
        // Create some sample data if nothing exists
        loadedRequests = [
          {
            id: 'sample-1',
            title: 'Sample Payroll Setup Request',
            description: 'This is a sample request to demonstrate the system',
            category: 'payroll_setup',
            priority: 'medium',
            urgency: 'medium',
            status: 'submitted',
            estimatedHours: 40,
            budget: 2000,
            tags: ['sample', 'demo'],
            createdAt: new Date().toISOString(),
            createdBy: 'Demo User',
            source: 'sample-data'
          },
          {
            id: 'sample-2',
            title: 'Sample Data Migration Request',
            description: 'Another sample request for testing',
            category: 'data_migration',
            priority: 'high',
            urgency: 'high',
            status: 'under_review',
            estimatedHours: 80,
            budget: 5000,
            tags: ['migration', 'urgent'],
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            createdBy: 'Demo User',
            source: 'sample-data'
          }
        ]
        
        // Save sample data to localStorage
        localStorage.setItem('etla_work_requests', JSON.stringify(loadedRequests))
        console.log('💾 Saved sample data to localStorage')
      }

      console.log('📊 Final loaded requests:', loadedRequests)
      setRequests(loadedRequests)
      setFilteredRequests(loadedRequests)

    } catch (error) {
      console.error('❌ Error loading requests:', error)
      setError(`Failed to load requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setRequests([])
      setFilteredRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    let filtered = requests

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.category.toLowerCase().includes(searchTerm.toLowerCase())
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

    console.log('🔍 Filtered requests:', filtered.length, 'of', requests.length)
    setFilteredRequests(filtered)
  }, [requests, searchTerm, statusFilter, priorityFilter])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  const getStats = () => {
    const total = requests.length
    const submitted = requests.filter(r => r.status === 'submitted').length
    const inProgress = requests.filter(r => r.status === 'in_progress').length
    const completed = requests.filter(r => r.status === 'completed').length

    return { total, submitted, inProgress, completed }
  }

  const stats = getStats()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading work requests...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
              <p className="text-gray-600">Manage and track your work requests</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={loadRequests}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button 
                onClick={() => window.location.href = '/work-requests/new'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>📊 Total requests loaded: {requests.length}</p>
              <p>🔍 Filtered requests shown: {filteredRequests.length}</p>
              <p>💾 Storage key: etla_work_requests</p>
              <p>🔄 Last loaded: {new Date().toLocaleTimeString()}</p>
              <p>📂 Check browser console for detailed logs</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Error Loading Requests</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                <option value="approved">Approved</option>
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
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work requests found</h3>
              <p className="text-gray-600 mb-4">
                {requests.length === 0 
                  ? "You haven't submitted any work requests yet."
                  : "No requests match your current filters."
                }
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
                <thead className="bg-gray-50 border-b border-gray-200">
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
                          <div className="text-sm font-medium text-gray-900">{request.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {request.description}
                          </div>
                          {request.tags && request.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {tag}
                                </span>
                              ))}
                              {request.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{request.tags.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {request.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColors[request.urgency]}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(request.createdAt)}</div>
                        <div className="text-xs text-gray-400">{request.createdBy}</div>
                        {request.source && (
                          <div className="text-xs text-blue-500">({request.source})</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/work-requests/${request.id}`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/work-requests/${request.id}/edit`}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
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

