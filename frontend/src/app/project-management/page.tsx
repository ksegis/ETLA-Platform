'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
  MoreHorizontal,
  FileText,
  BarChart3,
  Target,
  Shield,
  Network,
  Award,
  Briefcase,
  Settings
} from 'lucide-react'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

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

// PMBOK interfaces (simplified for build safety)
interface ProjectCharter {
  id: string
  project_code: string
  project_name: string
  business_case: string
  project_sponsor: string
  project_manager: string
  charter_status: string
  planned_start_date: string
  planned_end_date: string
  estimated_budget: number
}

interface RiskRegister {
  id: string
  risk_code: string
  risk_title: string
  risk_description: string
  risk_category: string
  probability_rating: number
  impact_rating: number
  risk_score: number
  risk_level: string
  response_strategy: string
  risk_owner: string
  status: string
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

// Mock PMBOK data for build safety
const mockCharters: ProjectCharter[] = [
  {
    id: '1',
    project_code: 'ETLA001',
    project_name: 'ETLA Platform Enhancement',
    business_case: 'Enhance platform with PMBOK capabilities',
    project_sponsor: 'John Smith',
    project_manager: 'Sarah Johnson',
    charter_status: 'approved',
    planned_start_date: '2025-01-15',
    planned_end_date: '2025-04-15',
    estimated_budget: 75000
  },
  {
    id: '2',
    project_code: 'PORTAL001',
    project_name: 'Customer Self-Service Portal',
    business_case: 'Develop customer portal to reduce support tickets',
    project_sponsor: 'Mike Davis',
    project_manager: 'Emily Chen',
    charter_status: 'under_review',
    planned_start_date: '2025-02-01',
    planned_end_date: '2025-05-30',
    estimated_budget: 95000
  }
]

const mockRisks: RiskRegister[] = [
  {
    id: '1',
    risk_code: 'R001',
    risk_title: 'Database Migration Complexity',
    risk_description: 'Complex migration procedures may impact system availability',
    risk_category: 'Technical',
    probability_rating: 3,
    impact_rating: 4,
    risk_score: 12,
    risk_level: 'medium',
    response_strategy: 'mitigate',
    risk_owner: 'Database Team Lead',
    status: 'response_planned'
  },
  {
    id: '2',
    risk_code: 'R002',
    risk_title: 'Resource Availability',
    risk_description: 'Key developers may be allocated to other projects',
    risk_category: 'Organizational',
    probability_rating: 4,
    impact_rating: 3,
    risk_score: 12,
    risk_level: 'medium',
    response_strategy: 'mitigate',
    risk_owner: 'Sarah Johnson',
    status: 'response_implemented'
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
  const { tenant } = useAuth()
  const [activeTab, setActiveTab] = useState('work-requests')
  const [requests, setRequests] = useState<WorkRequest[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PMBOK data state
  const [charters, setCharters] = useState<ProjectCharter[]>(mockCharters)
  const [risks, setRisks] = useState<RiskRegister[]>(mockRisks)

  // PMBOK Navigation tabs
  const pmTabs = [
    { id: 'work-requests', name: 'Work Requests', icon: Briefcase },
    { id: 'projects', name: 'Projects', icon: Target },
    { id: 'charter', name: 'Charter', icon: FileText },
    { id: 'wbs', name: 'WBS', icon: Network },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'evm', name: 'EVM', icon: BarChart3 },
    { id: 'risks', name: 'Risks', icon: Shield },
    { id: 'stakeholders', name: 'Stakeholders', icon: Users },
    { id: 'compliance', name: 'Compliance', icon: Award }
  ]

  // Load PMBOK service dynamically to avoid SSR issues
  useEffect(() => {
    const loadPMBOKService = async () => {
      try {
        // Only load service on client side
        if (typeof window !== 'undefined') {
          // Dynamic import to avoid build issues
          // const pmbokModule = await import('@/services/pmbok_service')
          // Use the service to load real data here if needed
          // For now, using mock data to avoid build issues
        }
      } catch (error) {
        console.error('Failed to load PMBOK service:', error)
        // Fallback to mock data
      }
    }

    loadPMBOKService()
  }, [])

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

  // Render Work Requests tab (existing functionality preserved)
  const renderWorkRequestsTab = () => (
    <div>
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
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                          <div className="text-sm text-gray-500">{request.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[request.priority]}`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                            {formatStatus(request.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
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

  // Render Projects tab
  const renderProjectsTab = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{charters.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${charters.reduce((sum, c) => sum + c.estimated_budget, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">PMBOK Compliance</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Project Charters</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charters.map((charter) => (
                <tr key={charter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{charter.project_name}</div>
                      <div className="text-sm text-gray-500">{charter.project_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{charter.project_manager}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      charter.charter_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {charter.charter_status.charAt(0).toUpperCase() + charter.charter_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${charter.estimated_budget.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(charter.planned_start_date)} - {formatDate(charter.planned_end_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render Risks tab
  const renderRisksTab = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Register</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Risks</p>
                <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {risks.filter(r => r.risk_level === 'high').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {risks.filter(r => r.risk_level === 'medium').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Mitigated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {risks.filter(r => r.status === 'response_implemented').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Risk Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {risks.map((risk) => (
                <tr key={risk.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{risk.risk_title}</div>
                      <div className="text-sm text-gray-500">{risk.risk_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{risk.risk_category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{risk.risk_score}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        (P:{risk.probability_rating} × I:{risk.impact_rating})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      risk.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                      risk.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{risk.risk_owner}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      risk.status === 'response_implemented' ? 'bg-green-100 text-green-800' :
                      risk.status === 'response_planned' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {risk.status.replace('_', ' ').charAt(0).toUpperCase() + risk.status.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render placeholder tabs for other PMBOK areas
  const renderPlaceholderTab = (tabName: string) => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Settings className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{tabName} Coming Soon</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        This PMBOK-compliant {tabName.toLowerCase()} module is under development and will be available soon.
      </p>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'work-requests':
        return renderWorkRequestsTab()
      case 'projects':
        return renderProjectsTab()
      case 'risks':
        return renderRisksTab()
      case 'charter':
        return renderPlaceholderTab('Project Charter')
      case 'wbs':
        return renderPlaceholderTab('Work Breakdown Structure')
      case 'schedule':
        return renderPlaceholderTab('Schedule Management')
      case 'evm':
        return renderPlaceholderTab('Earned Value Management')
      case 'stakeholders':
        return renderPlaceholderTab('Stakeholder Management')
      case 'compliance':
        return renderPlaceholderTab('PMBOK Compliance')
      default:
        return renderWorkRequestsTab()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">
              PMBOK 7th Edition compliant project management for {tenant?.name || 'Demo Company'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule View
            </Button>
            <Button size="sm">
              <Users className="h-4 w-4 mr-2" />
              Team Resources
            </Button>
          </div>
        </div>

        {/* PMBOK Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {pmTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">Error loading data</div>
              <div className="text-gray-500">{error}</div>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

