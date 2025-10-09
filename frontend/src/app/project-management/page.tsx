'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react'

interface WorkRequest {
  id: string
  title: string
  category: string
  customer: string
  customer_email: string
  priority: string
  status: string
  submitted_date: string
  description: string
}

export default function ProjectManagementPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<WorkRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<WorkRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])

  useEffect(() => {
    fetchWorkRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, priorityFilter])

  const fetchWorkRequests = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('work_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const transformedRequests = data.map(request => ({
          id: request.id,
          title: request.title,
          category: request.category,
          customer: request.customer_name,
          customer_email: request.customer_email,
          priority: request.priority,
          status: request.status,
          submitted_date: request.created_at,
          description: request.description
        }))
        setRequests(transformedRequests)
      } else {
        setRequests(mockRequests)
      }
    } catch (error) {
      console.error('Error fetching work requests:', error)
      setRequests(mockRequests)
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter)
    }

    setFilteredRequests(filtered)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedRequests.length === 0) return

    try {
      if (action === 'approve') {
        const { error } = await supabase
          .from('work_requests')
          .update({ status: 'approved' })
          .in('id', selectedRequests)
        
        if (!error) {
          setRequests(prev => prev.map(req => 
            selectedRequests.includes(req.id) 
              ? { ...req, status: 'approved' }
              : req
          ))
        }
      } else if (action === 'reject') {
        const { error } = await supabase
          .from('work_requests')
          .update({ status: 'rejected' })
          .in('id', selectedRequests)
        
        if (!error) {
          setRequests(prev => prev.map(req => 
            selectedRequests.includes(req.id) 
              ? { ...req, status: 'rejected' }
              : req
          ))
        }
      }
      
      setSelectedRequests([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
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
      setSelectedRequests(filteredRequests.map(req => req.id))
    }
  }

  // Mock data
  const mockRequests: WorkRequest[] = [
    {
      id: '1',
      title: 'Payroll System Integration',
      category: 'System Integration',
      customer: 'Acme Corporation',
      customer_email: 'john.smith@acme.com',
      priority: 'high',
      status: 'in_progress',
      submitted_date: '2024-01-10T08:00:00Z',
      description: 'Need to integrate new payroll system with existing infrastructure'
    },
    {
      id: '2',
      title: 'Benefits Enrollment Setup',
      category: 'Benefits Configuration',
      customer: 'TechStart Inc',
      customer_email: 'hr@techstart.com',
      priority: 'medium',
      status: 'submitted',
      submitted_date: '2024-01-12T10:30:00Z',
      description: 'Configure benefits enrollment for Q4 open enrollment'
    },
    {
      id: '3',
      title: 'Compliance Audit Report',
      category: 'Compliance Audit',
      customer: 'Global Enterprises',
      customer_email: 'compliance@global.com',
      priority: 'critical',
      status: 'under_review',
      submitted_date: '2024-01-14T14:15:00Z',
      description: 'Annual compliance audit and reporting requirements'
    },
    {
      id: '4',
      title: 'Data Migration Project',
      category: 'Data Migration',
      customer: 'Manufacturing Co',
      customer_email: 'it@manufacturing.com',
      priority: 'high',
      status: 'approved',
      submitted_date: '2024-01-13T09:45:00Z',
      description: 'Migrate legacy payroll data to new system'
    },
    {
      id: '5',
      title: 'Custom Reporting Dashboard',
      category: 'Custom Development',
      customer: 'Retail Chain LLC',
      customer_email: 'analytics@retail.com',
      priority: 'medium',
      status: 'scheduled',
      submitted_date: '2024-01-11T16:20:00Z',
      description: 'Build custom analytics dashboard for executive reporting'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'submitted').length,
    active: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="mt-2 text-gray-600">
                Review and manage work requests from customers
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/project-management/schedule')}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule View
              </button>
              <button
                onClick={() => router.push('/project-management/resources')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Team Resources
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Work Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Work Requests</h2>
              {selectedRequests.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve ({selectedRequests.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject ({selectedRequests.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests, customers, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
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
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                        onChange={selectAllRequests}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
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
                  {filteredRequests.map((request) => (
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
                          <div className="text-sm text-gray-500">{request.category}</div>
                          <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                            {request.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.customer}</div>
                          <div className="text-sm text-gray-500">{request.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status === 'in_progress' ? 'In Progress' : 
                           request.status === 'under_review' ? 'Under Review' :
                           request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.submitted_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/work-requests/${request.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {request.status === 'approved' && (
                            <button
                              onClick={() => router.push(`/project-management/schedule?request=${request.id}`)}
                              className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded text-xs bg-purple-50 hover:bg-purple-100 transition-colors"
                            >
                              Schedule
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

