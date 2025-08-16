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
  PlayCircle,
  RefreshCw,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'

interface WorkRequest {
  id: string
  tenant_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  customer_id: string
  assigned_to?: string
  estimated_hours?: number
  actual_hours: number
  budget?: number
  required_completion_date?: string
  created_at: string
  updated_at: string
}

interface WorkRequestWithTags extends WorkRequest {
  work_request_tags?: Array<{ tag_name: string }>
  work_request_attachments?: Array<{ id: string; filename: string; file_size: number }>
}

// Mock data for demonstration
const mockRequests: WorkRequestWithTags[] = [
  {
    id: '1',
    tenant_id: 'demo',
    title: 'Payroll System Integration',
    description: 'Need to integrate our existing payroll system with the new ETLA platform for automated data processing.',
    category: 'system_integration',
    priority: 'high',
    urgency: 'medium',
    status: 'submitted',
    customer_id: 'demo-user',
    estimated_hours: 40,
    actual_hours: 0,
    budget: 5000,
    required_completion_date: '2024-02-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    work_request_tags: [
      { tag_name: 'integration' },
      { tag_name: 'payroll' },
      { tag_name: 'urgent' }
    ],
    work_request_attachments: [
      { id: '1', filename: 'requirements.pdf', file_size: 1024000 }
    ]
  },
  {
    id: '2',
    tenant_id: 'demo',
    title: 'Employee Data Migration',
    description: 'Migrate employee data from legacy system to new platform with data validation and cleanup.',
    category: 'data_migration',
    priority: 'medium',
    urgency: 'low',
    status: 'under_review',
    customer_id: 'demo-user',
    estimated_hours: 24,
    actual_hours: 0,
    budget: 3000,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-12T09:15:00Z',
    work_request_tags: [
      { tag_name: 'migration' },
      { tag_name: 'data-cleanup' }
    ]
  },
  {
    id: '3',
    tenant_id: 'demo',
    title: 'Custom Reporting Dashboard',
    description: 'Create custom reporting dashboard for executive team with real-time payroll metrics and KPIs.',
    category: 'custom_development',
    priority: 'low',
    urgency: 'low',
    status: 'approved',
    customer_id: 'demo-user',
    estimated_hours: 60,
    actual_hours: 15,
    budget: 8000,
    required_completion_date: '2024-03-01',
    created_at: '2024-01-05T11:20:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    work_request_tags: [
      { tag_name: 'reporting' },
      { tag_name: 'dashboard' },
      { tag_name: 'executive' }
    ]
  },
  {
    id: '4',
    tenant_id: 'demo',
    title: 'Benefits Configuration Setup',
    description: 'Configure benefits packages and enrollment workflows for Q1 open enrollment period.',
    category: 'benefits_configuration',
    priority: 'critical',
    urgency: 'high',
    status: 'in_progress',
    customer_id: 'demo-user',
    estimated_hours: 32,
    actual_hours: 20,
    budget: 4500,
    required_completion_date: '2024-01-31',
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-15T13:30:00Z',
    work_request_tags: [
      { tag_name: 'benefits' },
      { tag_name: 'enrollment' },
      { tag_name: 'q1' }
    ],
    work_request_attachments: [
      { id: '2', filename: 'benefits_plan.xlsx', file_size: 512000 },
      { id: '3', filename: 'enrollment_rules.docx', file_size: 256000 }
    ]
  },
  {
    id: '5',
    tenant_id: 'demo',
    title: 'Compliance Audit Preparation',
    description: 'Prepare documentation and reports for upcoming compliance audit, ensure all payroll records are audit-ready.',
    category: 'compliance_audit',
    priority: 'high',
    urgency: 'urgent',
    status: 'completed',
    customer_id: 'demo-user',
    estimated_hours: 16,
    actual_hours: 18,
    budget: 2500,
    required_completion_date: '2024-01-20',
    created_at: '2024-01-02T08:15:00Z',
    updated_at: '2024-01-18T17:00:00Z',
    work_request_tags: [
      { tag_name: 'compliance' },
      { tag_name: 'audit' },
      { tag_name: 'documentation' }
    ]
  }
]

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  scheduled: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const statusIcons = {
  submitted: PlayCircle,
  under_review: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  scheduled: Calendar,
  in_progress: PlayCircle,
  completed: CheckCircle,
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
  other: 'Other'
}

export default function WorkRequestsPage() {
  const [requests, setRequests] = useState<WorkRequestWithTags[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserAndRequests()
  }, [])

  const loadUserAndRequests = async () => {
    try {
      // Try to get current user
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (authUser) {
        // User is logged in, try to load real data
        setUser(authUser)
        await loadRealRequests(authUser.id)
      } else {
        // No user logged in, use mock data and demo user
        setUser({
          id: 'demo-user',
          email: 'demo@example.com',
          user_metadata: {
            first_name: 'Demo',
            last_name: 'User'
          }
        })
        // Keep mock data
        setRequests(mockRequests)
      }
    } catch (error) {
      console.error('Error loading user and requests:', error)
      // Fallback to demo mode
      setUser({
        id: 'demo-user',
        email: 'demo@example.com',
        user_metadata: {
          first_name: 'Demo',
          last_name: 'User'
        }
      })
      setRequests(mockRequests)
    }
  }

  const loadRealRequests = async (userId: string) => {
    try {
      const { data: workRequests, error } = await supabase
        .from('work_requests')
        .select(`
          *,
          work_request_tags (
            tag_name
          ),
          work_request_attachments (
            id,
            filename,
            file_size
          )
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading work requests:', error)
        // Keep mock data on error
      } else if (workRequests && workRequests.length > 0) {
        setRequests(workRequests)
      }
      // If no real requests, keep mock data for demo
    } catch (error) {
      console.error('Error loading requests:', error)
      // Keep mock data on error
    }
  }

  const refreshRequests = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    if (user.id !== 'demo-user') {
      await loadRealRequests(user.id)
    }
    setIsLoading(false)
  }

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
    const activeRequests = requests.filter(r => ['approved', 'scheduled', 'in_progress'].includes(r.status)).length
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
    return ['submitted', 'under_review'].includes(status)
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
              {user && user.id === 'demo-user' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <User className="h-4 w-4" />
                  <span>Demo Mode - Showing sample data</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    Login for Real Data
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={refreshRequests}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
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
            </div>
          ) : (
            filteredRequests.map(request => {
              const StatusIcon = statusIcons[request.status]
              const tags = request.work_request_tags?.map(t => t.tag_name) || []
              
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
                        {request.estimated_hours && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {request.estimated_hours}h
                          </span>
                        )}
                        {request.budget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${request.budget.toLocaleString()}
                          </span>
                        )}
                        {request.required_completion_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {formatDate(request.required_completion_date)}
                          </span>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>Submitted: {formatDateTime(request.created_at)}</p>
                      {request.assigned_to && (
                        <p>Assigned to: {request.assigned_to}</p>
                      )}
                      {request.work_request_attachments && request.work_request_attachments.length > 0 && (
                        <p>{request.work_request_attachments.length} attachment(s)</p>
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

