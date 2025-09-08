'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck,
  Building,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WorkRequestApprovalModal from '@/components/WorkRequestApprovalModal'
import MissingCustomerModal from '@/components/MissingCustomerModal'
import { useAuthStable } from '@/hooks/useAuthStable'
import { pmbok } from '@/services/pmbok_service'
import type { WorkRequest, ProjectCharter, Risk } from '@/types'

export default function ProjectManagementPage() {
  const router = useRouter()
  const auth = useAuthStable()
  
  // Data state
  const [dashboardData, setDashboardData] = useState<{
    workRequests: WorkRequest[]
    projectCharters: ProjectCharter[]
    risks: Risk[]
  }>({
    workRequests: [],
    projectCharters: [],
    risks: []
  })
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('work-requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  
  // Modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<WorkRequest | null>(null)
  const [showMissingCustomerModal, setShowMissingCustomerModal] = useState(false)
  
  // Load data when auth is stable
  useEffect(() => {
    if (auth.isStable) {
      loadDashboardData()
    }
  }, [auth.isStable])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Loading dashboard data with stable auth:', auth.isStable)

      // Load all data in parallel
      const [workRequests, projectCharters, risks] = await Promise.all([
        pmbok.getWorkRequests(),
        pmbok.getProjects(),
        pmbok.getRisks()
      ])

      setDashboardData({
        workRequests,
        projectCharters,
        risks
      })

      console.log('✅ Dashboard data loaded:', {
        workRequests: workRequests.length,
        projectCharters: projectCharters.length,
        risks: risks.length,
        missingCustomers: workRequests.filter((wr: any) => (wr as any).customer_missing || wr.customer_name === 'Missing Customer').length
      })

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Check for missing customers
  const missingCustomerRequests = dashboardData.workRequests.filter((wr: any) => wr.customer_missing)
  const hasMissingCustomers = missingCustomerRequests.length > 0

  // Filter functions
  const getFilteredWorkRequests = () => {
    return dashboardData.workRequests.filter((request: any) => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (request.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const effectiveStatus = request.approval_status || request.status
      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter
      
      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }

  const getFilteredProjects = () => {
    return dashboardData.projectCharters.filter((project: any) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }

  const getFilteredRisks = () => {
    return dashboardData.risks.filter((risk: any) => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || risk.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }

  // Metrics calculations
  const workRequestMetrics = {
    total: dashboardData.workRequests.length,
    pending: dashboardData.workRequests.filter((r: any) => 
      r.approval_status === 'submitted' || 
      r.approval_status === 'under_review' ||
      r.status === 'submitted' ||
      r.status === 'under_review'
    ).length,
    active: dashboardData.workRequests.filter((r: any) => 
      r.approval_status === 'approved' || 
      r.approval_status === 'converted_to_project' ||
      r.status === 'in_progress' ||
      r.status === 'scheduled'
    ).length,
    completed: dashboardData.workRequests.filter((r: any) => 
      r.status === 'completed'
    ).length
  }

  const projectMetrics = {
    total: dashboardData.projectCharters.length,
    planning: dashboardData.projectCharters.filter((p: any) => p.status === 'planning').length,
    active: dashboardData.projectCharters.filter((p: any) => p.status === 'active' || p.status === 'in_progress').length,
    completed: dashboardData.projectCharters.filter((p: any) => p.status === 'completed').length
  }

  // Action handlers
  const handleViewRequest = (id: string) => {
    console.log('👁️ Viewing work request:', id)
    router.push(`/work-requests/${id}`)
  }

  const handleEditRequest = (id: string) => {
    console.log('✏️ Editing work request:', id)
    router.push('/work-requests')
  }

  const handleDeleteRequest = async (id: string) => {
    if (confirm('Are you sure you want to delete this work request?')) {
      console.log('🗑️ Deleting work request:', id)
      // TODO: Implement delete functionality
      alert('Delete functionality not yet implemented')
    }
  }

  const handleApproveRequest = (request: WorkRequest) => {
    console.log('✅ Opening approval modal for:', request.id)
    setSelectedWorkRequest(request)
    setShowApprovalModal(true)
  }

  const handleApprovalComplete = () => {
    setShowApprovalModal(false)
    setSelectedWorkRequest(null)
    loadDashboardData() // Refresh data
  }

  const handleFixCustomers = () => {
    setShowMissingCustomerModal(true)
  }

  const handleCustomersFixed = () => {
    setShowMissingCustomerModal(false)
    loadDashboardData() // Refresh data
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      converted_to_project: 'bg-green-100 text-green-800',
      planning: 'bg-purple-100 text-purple-800',
      active: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const canApproveRequest = (request: WorkRequest) => {
    const status = request.approval_status || request.status
    return status === 'submitted' || status === 'under_review'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading project management data...</p>
            <p className="text-sm text-gray-500 mt-2">
              User: {auth.user?.email} | Tenant: {auth.currentTenantId}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadDashboardData}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">PMBOK 7th Edition Compliant Project Management System</p>
            <p className="text-sm text-gray-500">
              User: {auth.user?.email} | Tenant: {auth.tenant?.name || 'Demo Company'}
            </p>
          </div>
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Work Request
          </Button>
        </div>

        {/* Missing Customer Alert */}
        {hasMissingCustomers && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-orange-800">Customer Data Issues Found</h4>
                    <p className="text-sm text-orange-700">
                      {missingCustomerRequests.length} work request(s) have missing customer information.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleFixCustomers}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Fix Customers
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workRequestMetrics.total}</div>
              <p className="text-xs text-muted-foreground">
                {workRequestMetrics.pending} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics.active}</div>
              <p className="text-xs text-muted-foreground">
                {projectMetrics.planning} in planning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.risks.filter((r: any) => (r.risk_score || 0) >= 15).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workRequestMetrics.total > 0 
                  ? Math.round((workRequestMetrics.completed / workRequestMetrics.total) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {workRequestMetrics.completed} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'work-requests', label: 'Work Requests', icon: FileText },
              { id: 'projects', label: 'Projects', icon: TrendingUp },
              { id: 'charter', label: 'Charter', icon: FileText },
              { id: 'wbs', label: 'WBS', icon: Users },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'evm', label: 'EVM', icon: DollarSign },
              { id: 'risks', label: 'Risks', icon: AlertTriangle },
              { id: 'stakeholders', label: 'Stakeholders', icon: Users },
              { id: 'compliance', label: 'Compliance', icon: CheckCircle }
            ].map((tab: any) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="converted_to_project">Converted to Project</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e: any) => setPriorityFilter(e.target.value)}
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

        {/* Content based on active tab */}
        {activeTab === 'work-requests' && (
          <Card>
            <CardHeader>
              <CardTitle>Work Requests</CardTitle>
              <CardDescription>
                Manage and track work requests through the approval workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                    {getFilteredWorkRequests().map((request: any) => (
                      <tr key={request.id} className={request.customer_missing ? 'bg-orange-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {request.title}
                                {request.customer_missing && (
                                  <AlertTriangle className="h-4 w-4 text-orange-500 ml-2" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.customer_name || 'Unknown Customer'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.category?.replace('_', ' ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            request.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(request.approval_status || request.status)
                          }`}>
                            {(request.approval_status || request.status).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewRequest(request.id)}
                              className="flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRequest(request.id)}
                              className="flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            {canApproveRequest(request) && !request.customer_missing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveRequest(request)}
                                className="flex items-center text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {canApproveRequest(request) && request.customer_missing && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="flex items-center text-orange-600 border-orange-300"
                                title="Fix customer data first"
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Fix Customer
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredWorkRequests().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No work requests found matching your criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'work-requests' && (
          <Card>
            <CardHeader>
              <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>This section is under development.</p>
                <p className="text-sm mt-2">Coming soon with full PMBOK 7th Edition compliance.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedWorkRequest && (
          <WorkRequestApprovalModal
            workRequest={selectedWorkRequest}
            isOpen={showApprovalModal}
            onClose={() => setShowApprovalModal(false)}
            onApprovalComplete={handleApprovalComplete}
          />
        )}

        {/* Missing Customer Modal */}
        {showMissingCustomerModal && selectedWorkRequest && (
          <MissingCustomerModal
            workRequestId={selectedWorkRequest.id}
            workRequestTitle={selectedWorkRequest.title}
            isOpen={showMissingCustomerModal}
            onClose={() => setShowMissingCustomerModal(false)}
            onCustomerFixed={handleCustomersFixed}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

