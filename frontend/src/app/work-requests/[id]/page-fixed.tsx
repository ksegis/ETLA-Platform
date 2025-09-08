'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, DollarSign, User, MessageCircle, Paperclip, Edit, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { pmbok } from '@/services/pmbok_service'
import type { WorkRequest } from '@/types'

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

export default function WorkRequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [request, setRequest] = useState<WorkRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  useEffect(() => {
    loadWorkRequest()
  }, [params.id])

  const loadWorkRequest = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Loading work request:', params.id)

      // Get all work requests and find the specific one
      const workRequests = await pmbok.getWorkRequests()
      const foundRequest = workRequests.find(wr => wr.id === params.id)

      if (!foundRequest) {
        setError('Work request not found')
        console.error('❌ Work request not found:', params.id)
        return
      }

      setRequest(foundRequest)
      console.log('✅ Work request loaded:', foundRequest)

    } catch (error) {
      console.error('❌ Error loading work request:', error)
      setError('Failed to load work request')
    } finally {
      setLoading(false)
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

  const getStatusDisplay = (request: WorkRequest) => {
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
                      {(request as any).customer_missing && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Missing Customer Data
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {request.decline_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-900 mb-2">Decline Reason</h3>
                    <p className="text-red-700">{request.decline_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comments & Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No comments yet. Be the first to add an update!</p>
                  </div>
                  
                  {/* Add Comment Form */}
                  <div className="border-t pt-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment or update..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <Button 
                        onClick={() => {
                          // TODO: Implement comment functionality
                          alert('Comment functionality coming soon!')
                        }}
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
                  <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                </div>
                {request.required_completion_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Required Completion</h3>
                    <p className="text-sm text-gray-600">{formatDate(request.required_completion_date)}</p>
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
                  <p className="text-sm text-gray-600">{formatDate(request.updated_at)}</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}

