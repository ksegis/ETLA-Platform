'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, DollarSign, User, MessageCircle, Paperclip, Edit, CheckCircle, XCircle, AlertCircle, Loader2, Building, Phone, Mail, MapPin, Tag, FileText, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { pmbok } from '@/services/pmbok_service'
import type { WorkRequest } from '@/services/pmbok_service'

// PRESERVE ALL EXISTING INTERFACES AND MOCK DATA STRUCTURE
interface WorkRequestComment {
  id: string
  authorName: string
  authorRole: 'customer' | 'project_manager' | 'developer' | 'admin' | 'program_manager'
  content: string
  createdAt: string
  isInternal: boolean
}

interface WorkRequestAttachment {
  id: string
  filename: string
  size: number
  uploadedAt: string
  downloadUrl: string
}

// STANDALONE INTERFACE - NO INHERITANCE TO AVOID TYPE CONFLICTS
interface ExtendedWorkRequest {
  // Core WorkRequest properties
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'declined' | 'in_progress' | 'completed' | 'cancelled'
  approval_status?: 'submitted' | 'under_review' | 'approved' | 'declined' | 'converted_to_project'
  decline_reason?: string
  approved_by?: string
  approved_at?: string
  reviewed_by?: string
  reviewed_at?: string
  customer_id: string
  customer_name?: string
  customer_email?: string
  requested_by: string
  requested_by_name?: string
  created_at: string
  updated_at: string
  due_date?: string
  estimated_hours?: number
  estimated_cost?: number
  actual_hours?: number
  actual_cost?: number
  tenant_id: string
  category?: string
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  business_justification?: string
  expected_benefits?: string
  risk_assessment?: string
  resource_requirements?: string
  stakeholders?: string[]
  
  // Extended UI properties with proper types
  tags: string[]
  attachments: WorkRequestAttachment[]  // UI attachment type
  comments: WorkRequestComment[]        // UI comment type
  submittedAt: string
  updatedAt: string
  assignedTo?: string
  scheduledStartDate?: string
  scheduledEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  customer_missing?: boolean
  customer_error?: string
  required_completion_date?: string
}

// PRESERVE EXISTING MOCK DATA AS FALLBACK
const mockRequest: ExtendedWorkRequest = {
  id: '1',
  tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
  title: 'Payroll System Integration',
  description: 'Need to integrate new payroll system with existing HR database. This includes mapping employee data, setting up automated data sync, and ensuring compliance with current reporting requirements. The integration should support bi-directional data flow and include error handling for data validation.',
  category: 'system_integration',
  priority: 'high',
  urgency: 'medium',
  status: 'under_review',
  customer_id: 'customer-1',
  customer_name: 'TechCorp Solutions',
  customer_email: 'contact@techcorp.com',
  submittedAt: '2024-08-15T10:30:00Z',
  updatedAt: '2024-08-15T14:45:00Z',
  created_at: '2024-08-15T10:30:00Z',
  updated_at: '2024-08-15T14:45:00Z',
  requested_by: 'alice.johnson@techcorp.com',
  estimated_hours: 120,
  estimated_cost: 25000,
  required_completion_date: '2024-09-30T00:00:00Z',
  assignedTo: 'John Smith',
  scheduledStartDate: '2024-08-20T09:00:00Z',
  scheduledEndDate: '2024-09-15T17:00:00Z',
  tags: ['integration', 'payroll', 'hr', 'database'],
  attachments: [
    {
      id: '1',
      filename: 'payroll_requirements.pdf',
      size: 2048576,
      uploadedAt: '2024-08-15T10:35:00Z',
      downloadUrl: '#'
    },
    {
      id: '2',
      filename: 'hr_database_schema.sql',
      size: 512000,
      uploadedAt: '2024-08-15T10:40:00Z',
      downloadUrl: '#'
    }
  ],
  comments: [
    {
      id: '1',
      authorName: 'Alice Johnson',
      authorRole: 'customer',
      content: 'We need this integration completed by end of September to align with our Q4 payroll processing. Please prioritize data accuracy and security.',
      createdAt: '2024-08-15T11:00:00Z',
      isInternal: false
    },
    {
      id: '2',
      authorName: 'John Smith',
      authorRole: 'project_manager',
      content: 'Initial assessment completed. The scope looks manageable within the timeline. Will need access to the HR database schema and test environment.',
      createdAt: '2024-08-15T13:15:00Z',
      isInternal: true
    },
    {
      id: '3',
      authorName: 'Sarah Johnson',
      authorRole: 'program_manager',
      content: 'Initial analysis complete. The integration is more complex than initially estimated due to custom fields in the HR system.',
      createdAt: '2024-08-14T14:30:00Z',
      isInternal: false
    }
  ]
}

const statusConfig = {
  submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  under_review: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  declined: { color: 'bg-red-100 text-red-800', icon: XCircle },
  converted_to_project: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  scheduled: { color: 'bg-purple-100 text-purple-800', icon: Calendar },
  in_progress: { color: 'bg-indigo-100 text-indigo-800', icon: AlertCircle },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
}

// FIXED PRIORITY COLORS - INCLUDES ALL POSSIBLE VALUES
const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
  critical: 'bg-red-100 text-red-800'
}

const roleColors = {
  customer: 'bg-blue-100 text-blue-800',
  project_manager: 'bg-green-100 text-green-800',
  developer: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  program_manager: 'bg-orange-100 text-orange-800'
}

// HELPER FUNCTION TO GET PRIORITY COLOR SAFELY
const getPriorityColor = (priority: string) => {
  return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium
}

// NEXT.JS 15 COMPATIBLE COMPONENT WITH ASYNC PARAMS
export default function WorkRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [request, setRequest] = useState<ExtendedWorkRequest | null>(null)
  const [loading, setloading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [useRealData, setUseRealData] = useState(true)
  const [requestId, setRequestId] = useState<string>('')

  // Handle async params in Next.js 15
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setRequestId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (requestId) {
      loadWorkRequest()
    }
  }, [requestId])

  const loadWorkRequest = async () => {
    try {
      setloading(true)
      setError(null)
      console.log('🔍 loading work request:', requestId)

      if (useRealData) {
        // TRY TO LOAD REAL DATA FIRST
        try {
          const workRequests = await pmbok.getWorkRequests()
          const foundRequest = workRequests.find((wr: any) => wr.id === requestId)

          if (foundRequest) {
            // MERGE REAL DATA WITH MOCK DATA STRUCTURE TO PRESERVE FUNCTIONALITY
            const enhancedRequest: ExtendedWorkRequest = {
              ...mockRequest,
              ...foundRequest,
              tags: mockRequest.tags,
              attachments: mockRequest.attachments,
              comments: mockRequest.comments,
              submittedAt: foundRequest.created_at,
              updatedAt: foundRequest.updated_at,
              assignedTo: mockRequest.assignedTo,
              scheduledStartDate: mockRequest.scheduledStartDate,
              scheduledEndDate: mockRequest.scheduledEndDate
            }

            setRequest(enhancedRequest)
            console.log('✅ Real work request loaded and enhanced:', enhancedRequest)
            return
          }
        } catch (realDataError) {
          console.warn('⚠️ Failed to load real data, falling back to mock:', realDataError)
        }
      }

      // FALLBACK TO MOCK DATA IF REAL DATA FAILS OR NOT FOUND
      if (requestId === '1' || !useRealData) {
        setRequest(mockRequest)
        console.log('✅ Mock work request loaded:', mockRequest)
      } else {
        setError('Work request not found')
        console.error('❌ Work request not found:', requestId)
      }

    } catch (error) {
      console.error('❌ Error loading work request:', error)
      setError('Failed to load work request')
    } finally {
      setloading(false)
    }
  }

  const handleProcessRequest = async (action: 'approve' | 'reject') => {
    if (!request) return

    // TODO: Replace with actual user data from AuthContext
    const user_id = 'current_user_id'
    const user_role = 'host_admin'

    if (user_role !== 'host_admin') {
      alert('You do not have permission to approve or reject work requests.')
      return
    }

    if (request.status !== 'submitted' && request.status !== 'under_review') {
      alert(`Request status is ${request.status}. Cannot ${action}.`)
      return
    }

    setloading(true)
    try {
      const response = await fetch('/api/work-requests/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          work_request_id: request.id,
          action,
          user_id,
          user_role,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Work Request ${action}d successfully!`)
        loadWorkRequest()
      } else {
        setError(result.error || `Failed to ${action} work request.`)
        alert(`Error: ${result.error || `Failed to ${action} work request.`}`)
      }
    } catch (err) {
      console.error(`Error processing request:`, err)
      setError(`An unexpected error occurred while processing the request.`)
      alert(`An unexpected error occurred while processing the request.`)
    } finally {
      setloading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsAddingComment(true)
    try {
      const comment: WorkRequestComment = {
        id: Date.now().toString(),
        authorName: 'Current User',
        authorRole: 'project_manager',
        content: newComment,
        createdAt: new Date().toISOString(),
        isInternal: false
      }

      setRequest(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null)

      setNewComment('')
      console.log('✅ Comment added successfully')
    } catch (error) {
      console.error('❌ Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    } finally {
      setIsAddingComment(false)
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusDisplay = (request: ExtendedWorkRequest) => {
    const status = request.approval_status || request.status
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted
    const StatusIcon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {formatStatus(status)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading work request...</p>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Work Request Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested work request could not be found.'}</p>
          <Button onClick={() => router.push('/project-management')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project Management
          </Button>
          <Button onClick={() => router.push('/work-requests')} variant="outline">
            View All Work Requests
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/project-management')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project Management
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                <p className="text-gray-600 mt-1">Work Request #{request.id.substring(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Approval/Rejection Buttons */}
              {request && (request.status === 'submitted' || request.status === 'under_review') && (
                <div className="flex space-x-3">
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleProcessRequest('approve')}
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {loading ? 'Approving...' : 'Approve Request'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleProcessRequest('reject')}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {loading ? 'Rejecting...' : 'Reject Request'}
                  </Button>
                </div>
              )}
              {getStatusDisplay(request)}
              <Button variant="outline" className="flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                Edit Request
              </Button>
            </div>
          </div>
        </div>

        {/* Missing Customer Alert */}
        {request.customer_missing && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Customer Data Issue</h4>
                  <p className="text-sm text-orange-700">
                    {request.customer_error || 'Customer information is missing or incomplete.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{request.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
                    <p className="text-gray-700">{formatCategory(request.category || '')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Customer</h3>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">{request.customer_name || 'Unknown Customer'}</span>
                      {request.customer_missing && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Missing Data
                        </span>
                      )}
                    </div>
                    {request.customer_email && (
                      <div className="flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">{request.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {request.assignedTo && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Assigned To</h3>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">{request.assignedTo}</span>
                    </div>
                  </div>
                )}

                {request.decline_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-900 mb-2">Decline Reason</h3>
                    <p className="text-red-700">{request.decline_reason}</p>
                  </div>
                )}

                {/* Tags */}
                {request.tags && request.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {request.tags.map((tag, index: any) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Priority</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {request.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Urgency</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.urgency || 'medium')}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {(request.urgency || 'medium').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Estimated Hours</h3>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">{request.estimated_hours || 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Estimated Budget</h3>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">
                        {request.estimated_cost ? formatCurrency(request.estimated_cost) : 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Required Completion</h3>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">
                        {request.required_completion_date ? formatDate(request.required_completion_date) : 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Requested By</h3>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">{request.requested_by || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Request Submitted</p>
                      <p className="text-sm text-gray-500">{formatDateTime(request.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-500">{formatDateTime(request.updatedAt)}</p>
                    </div>
                  </div>

                  {request.scheduledStartDate && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Scheduled Start</p>
                        <p className="text-sm text-gray-500">{formatDateTime(request.scheduledStartDate)}</p>
                      </div>
                    </div>
                  )}

                  {request.scheduledEndDate && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Scheduled End</p>
                        <p className="text-sm text-gray-500">{formatDateTime(request.scheduledEndDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {request.attachments && request.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Paperclip className="w-5 h-5 mr-2" />
                    Attachments ({request.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {request.attachments.map((attachment: any) => (
                      <div key={attachment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Paperclip className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{attachment.filename}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(attachment.size)} • Uploaded {formatDate(attachment.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comments ({request.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {request.comments.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.authorName}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[comment.authorRole as keyof typeof roleColors]}`}>
                            {formatStatus(comment.authorRole)}
                          </span>
                          {comment.isInternal && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Internal
                            </span>
                          )}
                          <span className="text-sm text-gray-500">{formatDateTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment Form */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <textarea
                      value={newComment}
                      onChange={(e: any) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <label className="flex items-center space-x-2 text-sm text-gray-600">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span>Internal comment (not visible to customer)</span>
                      </label>
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isAddingComment}
                        className="flex items-center"
                      >
                        {isAddingComment ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4 mr-2" />
                        )}
                        {isAddingComment ? 'Adding...' : 'Add Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Request
                </Button>
                
                {(request.status === 'under_review' || request.approval_status === 'under_review') && (
                  <>
                    <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline Request
                    </Button>
                  </>
                )}
                
                {(request.status === 'approved' || request.approval_status === 'approved') && (
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Work
                  </Button>
                )}

                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Request Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Request Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Hours</span>
                  <span className="font-medium">{request.estimated_hours || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Budget</span>
                  <span className="font-medium">
                    {request.estimated_cost ? formatCurrency(request.estimated_cost) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days Since Submitted</span>
                  <span className="font-medium">
                    {Math.floor((new Date().getTime() - new Date(request.submittedAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="font-medium">{request.comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Attachments</span>
                  <span className="font-medium">{request.attachments.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Customer Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-700">{request.customer_name || 'Unknown Customer'}</span>
                    </div>
                    {request.customer_email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-700">{request.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {request.assignedTo && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Assigned Project Manager</h3>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-700">{request.assignedTo}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debug Panel */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Request ID:</span>
                    <span className="font-mono">{request.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tenant ID:</span>
                    <span className="font-mono">{request.tenant_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Source:</span>
                    <span className={useRealData ? 'text-green-600' : 'text-orange-600'}>
                      {useRealData ? 'Real Data' : 'Mock Data'}
                    </span>
                  </div>
                  <Button 
                    onClick={() => setUseRealData(!useRealData)}
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2"
                  >
                    Switch to {useRealData ? 'Mock' : 'Real'} Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}