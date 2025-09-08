'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, DollarSign, User, MessageCircle, Paperclip, Edit, CheckCircle, XCircle, AlertCircle, Loader2, Building, Phone, Mail, MapPin, Tag, FileText, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { pmbok } from '@/services/pmbok_service'
import type { WorkRequest } from '@/types'

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

// PRESERVE EXISTING MOCK DATA AS FALLBACK
const mockRequest: WorkRequest & { 
  tags: string[]
  attachments: WorkRequestAttachment[]
  comments: WorkRequestComment[]
  submittedAt: string
  updatedAt: string
  assignedTo?: string
  scheduledStartDate?: string
  scheduledEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
} = {
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
  estimated_hours: 120,
  estimated_budget: 25000,
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

// NEXT.JS 15 COMPATIBLE COMPONENT WITH ASYNC PARAMS
export default function WorkRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [request, setRequest] = useState<typeof mockRequest | null>(null)
  const [loading, setLoading] = useState(true)
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
      setLoading(true)
      setError(null)
      console.log('🔍 Loading work request:', requestId)

      if (useRealData) {
        // TRY TO LOAD REAL DATA FIRST
        try {
          const workRequests = await pmbok.getWorkRequests()
          const foundRequest = workRequests.find((wr: any) => wr.id === requestId)

          if (foundRequest) {
            // MERGE REAL DATA WITH MOCK DATA STRUCTURE TO PRESERVE FUNCTIONALITY
            const enhancedRequest = {
              ...mockRequest, // Start with mock structure
              ...foundRequest, // Override with real data
              // Preserve mock data for features not yet implemented in real data
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
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsAddingComment(true)
    try {
      // TODO: Implement real comment functionality
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
    return status.split('_').map((word: any: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map((word: any: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

  const getStatusDisplay = (request: typeof mockRequest) => {
    // Use approval_status if available, otherwise use regular status
    const status = request.approval_status || request.status
    const config = statusConfig[status as keyof typeof statusConfig as keyof typeof statusConfig] || statusConfig.submitted
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
                    <p className="text-gray-700">{formatCategory(request.category || 'unknown')}</p>
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
                      <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)} • Uploaded {formatDateTime(attachment.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comments & Updates ({request.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.comments && request.comments.length > 0 ? (
                    request.comments.map((comment: any) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleColors[comment.authorRole as keyof typeof roleColors]}`}>
                                {comment.authorRole.replace('_', ' ')}
                              </span>
                              {comment.isInternal && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Internal
                                </span>
                              )}
                              <p className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</p>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No comments yet. Be the first to add an update!</p>
                    </div>
                  )}
                  
                  {/* Add Comment Form */}
                  <div className="border-t pt-4">
                    <textarea
                      value={newComment}
                      onChange={(e: any) => setNewComment(e.target.value)}
                      placeholder="Add a comment or update..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isAddingComment}
                        className="flex items-center"
                      >
                        {isAddingComment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Priority & Urgency */}
            <Card>
              <CardHeader>
                <CardTitle>Priority & Urgency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Priority</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority as keyof typeof priorityColors as keyof typeof priorityColors]}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Urgency</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.urgency as keyof typeof priorityColors as keyof typeof priorityColors as keyof typeof priorityColors] || priorityColors.medium}`}>
                    {request.urgency ? request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1) : 'Medium'}
                  </span>
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
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Submitted</h3>
                  <p className="text-sm text-gray-600">{formatDate(request.submittedAt || request.created_at)}</p>
                </div>
                {request.required_completion_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Required Completion</h3>
                    <p className="text-sm text-gray-600">{formatDate(request.required_completion_date)}</p>
                  </div>
                )}
                {request.scheduledStartDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Scheduled Start</h3>
                    <p className="text-sm text-gray-600">{formatDate(request.scheduledStartDate)}</p>
                  </div>
                )}
                {request.scheduledEndDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Scheduled End</h3>
                    <p className="text-sm text-gray-600">{formatDate(request.scheduledEndDate)}</p>
                  </div>
                )}
                {request.approved_at && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Approved</h3>
                    <p className="text-sm text-gray-600">{formatDate(request.approved_at)}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Last Updated</h3>
                  <p className="text-sm text-gray-600">{formatDate(request.updatedAt || request.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Budget Information */}
            {(request.estimated_budget || request.estimated_hours) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Budget & Estimates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.estimated_budget && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Estimated Budget</h3>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(request.estimated_budget)}
                      </p>
                    </div>
                  )}
                  {request.estimated_hours && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Estimated Hours</h3>
                      <p className="text-lg font-semibold text-blue-600">
                        {request.estimated_hours} hours
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Approval Information */}
            {(request.approved_by || request.reviewed_by) && (
              <Card>
                <CardHeader>
                  <CardTitle>Approval Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.reviewed_by && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Reviewed By</h3>
                      <p className="text-sm text-gray-600">{request.reviewed_by}</p>
                      {request.reviewed_at && (
                        <p className="text-xs text-gray-500">{formatDate(request.reviewed_at)}</p>
                      )}
                    </div>
                  )}
                  {request.approved_by && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Approved By</h3>
                      <p className="text-sm text-gray-600">{request.approved_by}</p>
                      {request.approved_at && (
                        <p className="text-xs text-gray-500">{formatDate(request.approved_at)}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Debug Info */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-500 space-y-1">
                <p>Request ID: {request.id}</p>
                <p>Data Source: {useRealData ? 'Database + Mock' : 'Mock Only'}</p>
                <p>Customer Missing: {request.customer_missing ? 'Yes' : 'No'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setUseRealData(!useRealData)
                    loadWorkRequest()
                  }}
                  className="mt-2"
                >
                  Toggle Data Source
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

