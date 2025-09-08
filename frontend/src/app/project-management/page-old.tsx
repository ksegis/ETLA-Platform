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
import { useAuth } from '@/contexts/AuthContext'
import { pmbok } from '@/services/pmbok_service'
import type { WorkRequest, ProjectCharter, Risk } from '@/services/pmbok_service'

export default function ProjectManagementPage() {
  const router = useRouter()
  const auth = useAuth()
  
  // Data state
  const [dashboardData, setDashboardData] = useState<{
    workRequests: WorkRequest[]
    projects: ProjectCharter[]
    risks: Risk[]
  }>({
    workRequests: [],
    projects: [],
    risks: []
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [activeTab, setActiveTab] = useState('work-requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<WorkRequest | null>(null)
  
  // Missing customer modal state
  const [showMissingCustomerModal, setShowMissingCustomerModal] = useState(false)
  const [missingCustomerWorkRequest, setMissingCustomerWorkRequest] = useState<WorkRequest | null>(null)
  
  // Load data when auth is stable
  useEffect(() => {
    if (auth.isStable && auth.user && auth.tenant) {
      // Update PMBOK service with current user context
      pmbok.updateUserContext(auth.user.id, auth.tenant.id)
      loadDashboardData()
    }
  }, [auth.isStable, auth.user, auth.tenant])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Loading dashboard data with stable auth:', {
        userId: auth.user?.id,
        tenantId: auth.tenant?.id,
        isStable: auth.isStable
      })

      // Load all data in parallel
      const [workRequests, projects, risks] = await Promise.all([
        pmbok.getWorkRequests(),
        pmbok.getProjects(),
        pmbok.getRisks()
      ])

      setDashboardData({
        workRequests,
        projects,
        risks
      })

      console.log('✅ Dashboard data loaded successfully:', {
        workRequests: workRequests.length,
        projects: projects.length,
        risks: risks.length
      })

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to determine if a work request can be approved
  const canApproveRequest = (request: WorkRequest) => {
    const status = request.approval_status || request.status
    const canApprove = status === 'submitted' || status === 'under_review'
    
    console.log(`🔍 Approval check for "${request.title}": {
      id: "${request.id}",
      status: "${request.status}", 
      approval_status: ${request.approval_status || 'undefined'},
      effectiveStatus: "${status}",
      canApprove: ${canApprove}
    }`)
    
    return canApprove
  }

  // Handle approval request
  const handleApproveRequest = (request: WorkRequest) => {
    console.log('🔍 Opening approval modal for request:', request.id)
    setSelectedWorkRequest(request)
    setShowApprovalModal(true)
  }

  // Handle approval completion
  const handleApprovalComplete = () => {
    console.log('✅ Approval completed, refreshing data')
    loadDashboardData()
  }

  // Handle missing customer fix
  const handleFixMissingCustomer = (request: WorkRequest) => {
    console.log('🔧 Opening missing customer modal for request:', request.id)
    setMissingCustomerWorkRequest(request)
    setShowMissingCustomerModal(true)
  }

  // Handle customer fixed
  const handleCustomerFixed = () => {
    console.log('✅ Customer fixed, refreshing data')
    loadDashboardData()
  }

  // Filter functions
  const getFilteredWorkRequests = () => {
    return dashboardData.workRequests.filter((request: any) => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (statusFilter === 'all') return matchesSearch
      
      const effectiveStatus = request.approval_status || request.status
      return matchesSearch && effectiveStatus === statusFilter
    })
  }

  const getFilteredProjects = () => {
    return dashboardData.projects.filter((project: any) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (statusFilter === 'all') return matchesSearch
      return matchesSearch && project.status === statusFilter
    })
  }

  const getFilteredRisks = () => {
    return dashboardData.risks.filter((risk: any) => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (statusFilter === 'all') return matchesSearch
      return matchesSearch && risk.status === statusFilter
    })
  }

  // Calculate metrics
  const calculateMetrics = () => {
    const workRequests = dashboardData.workRequests
    
    return {
      total: workRequests.length,
      pending: workRequests.filter((r: any) => {
        const status = r.approval_status || r.status
        return status === 'submitted' || status === 'under_review'
      }).length,
      active: workRequests.filter((r: any) => {
        const status = r.approval_status || r.status
        return status === 'approved' || status === 'in_progress' || status === 'converted_to_project'
      }).length,
      completed: workRequests.filter((r: any) => {
        const status = r.approval_status || r.status
        return status === 'completed'
      }).length
    }
  }

  const metrics = calculateMetrics()

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'converted_to_project': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard data...</span>
        </div>
      </DashboardLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <span className="ml-2 text-red-600">{error}</span>
          <Button onClick={loadDashboardData} className="ml-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-1">PMBOK-compliant project management dashboard</p>
            </div>
            <Button onClick={() => router.push('/work-requests/new')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Work Request
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.active}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'work-requests', label: 'Work Requests', icon: FileText },
              { id: 'projects', label: 'Projects', icon: Building },
              { id: 'charter', label: 'Charter', icon: FileText },
              { id: 'wbs', label: 'WBS', icon: Building },
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
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'work-requests' && (
          <Card>
            <CardHeader>
              <CardTitle>Work Requests</CardTitle>
              <CardDescription>Manage and review work requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredWorkRequests().map((request: any) => {
                      console.log(`🔍 RENDERING ACTIONS for request: ${request.id} ${request.title}`)
                      const effectiveStatus = request.approval_status || request.status
                      const isMissingCustomer = request.customer_name === 'Missing Customer'
                      
                      return (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{request.title}</div>
                            {request.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {request.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {request.customer_name || 'Unknown'}
                              {isMissingCustomer && (
                                <Button
                                  onClick={() => handleFixMissingCustomer(request)}
                                  size="sm"
                                  variant="outline"
                                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                >
                                  Fix
                                </Button>
                              )}
                            </div>
                            {isMissingCustomer && (
                              <div className="text-xs text-orange-600 mt-1">
                                ⚠️ Customer data missing
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {request.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(effectiveStatus)}`}>
                              {effectiveStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => router.push(`/work-requests/${request.id}`)}
                                size="sm"
                                variant="outline"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => alert('Edit functionality coming soon')}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {canApproveRequest(request) && (
                                <Button
                                  onClick={() => handleApproveRequest(request)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                
                {getFilteredWorkRequests().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No work requests found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'projects' && (
          <Card>
            <CardHeader>
              <CardTitle>Project Charters</CardTitle>
              <CardDescription>Active project charters and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Project Name</th>
                      <th className="text-left py-3 px-4">Manager</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Budget</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredProjects().map((project: any) => (
                      <tr key={project.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {project.description}
                          </div>
                        </td>
                        <td className="py-3 px-4">{project.project_manager}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {project.budget ? `$${project.budget.total_budget.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredProjects().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No projects found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'risks' && (
          <Card>
            <CardHeader>
              <CardTitle>Risk Register</CardTitle>
              <CardDescription>Project risks and mitigation strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Risk</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Probability</th>
                      <th className="text-left py-3 px-4">Impact</th>
                      <th className="text-left py-3 px-4">Score</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredRisks().map((risk: any) => (
                      <tr key={risk.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{risk.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {risk.description}
                          </div>
                        </td>
                        <td className="py-3 px-4">{risk.category}</td>
                        <td className="py-3 px-4">{risk.probability}</td>
                        <td className="py-3 px-4">{risk.impact}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            risk.risk_score >= 15 ? 'bg-red-100 text-red-800' :
                            risk.risk_score >= 10 ? 'bg-orange-100 text-orange-800' :
                            risk.risk_score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {risk.risk_score}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                            {risk.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredRisks().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No risks found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for other tabs */}
        {!['work-requests', 'projects', 'risks'].includes(activeTab) && (
          <Card>
            <CardHeader>
              <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</CardTitle>
              <CardDescription>This section is coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} functionality will be available in a future update.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approval Modal */}
      <WorkRequestApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        workRequest={selectedWorkRequest}
        onApprovalComplete={handleApprovalComplete}
      />

      {/* Missing Customer Modal */}
      <MissingCustomerModal
        isOpen={showMissingCustomerModal}
        onClose={() => setShowMissingCustomerModal(false)}
        workRequestId={missingCustomerWorkRequest?.id || ''}
        workRequestTitle={missingCustomerWorkRequest?.title || ''}
        onCustomerFixed={handleCustomerFixed}
      />
    </DashboardLayout>
  )
}

