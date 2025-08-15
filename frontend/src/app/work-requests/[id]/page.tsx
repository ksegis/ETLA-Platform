'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, DollarSign, User, MessageCircle, Paperclip, Edit, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WorkRequest {
  id: string
  title: string
  description: string
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
  scheduledStartDate?: string
  scheduledEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  tags: string[]
  attachments: Array<{
    id: string
    filename: string
    size: number
    uploadedAt: string
  }>
  comments: Array<{
    id: string
    authorName: string
    authorRole: 'customer' | 'program_manager'
    content: string
    createdAt: string
    isInternal: boolean
  }>
}

const mockRequest: WorkRequest = {
  id: '1',
  title: 'Payroll System Integration',
  description: 'Need to integrate new payroll system with existing HR database. This includes mapping employee data, setting up automated data sync, and ensuring compliance with current reporting requirements. The integration should support bi-directional data flow and include error handling for data validation.',
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
  scheduledStartDate: '2024-08-12',
  scheduledEndDate: '2024-08-30',
  actualStartDate: '2024-08-12',
  tags: ['payroll', 'integration', 'hr-system', 'urgent'],
  attachments: [
    {
      id: '1',
      filename: 'current_hr_schema.pdf',
      size: 2048000,
      uploadedAt: '2024-08-10T09:15:00Z'
    },
    {
      id: '2',
      filename: 'payroll_requirements.docx',
      size: 1024000,
      uploadedAt: '2024-08-10T09:16:00Z'
    }
  ],
  comments: [
    {
      id: '1',
      authorName: 'John Smith',
      authorRole: 'customer',
      content: 'Initial request submitted. Looking forward to getting this integration completed before the next payroll cycle.',
      createdAt: '2024-08-10T09:00:00Z',
      isInternal: false
    },
    {
      id: '2',
      authorName: 'Sarah Johnson',
      authorRole: 'program_manager',
      content: 'Request approved and assigned to our integration team. We\'ll begin analysis of the current HR schema this week.',
      createdAt: '2024-08-12T10:30:00Z',
      isInternal: false
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
  critical: 'bg-red-100 text-red-800'
}

export default function WorkRequestDetailsPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<WorkRequest>(mockRequest)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsAddingComment(true)
    
    // Simulate API call
    setTimeout(() => {
      const comment = {
        id: Date.now().toString(),
        authorName: 'John Smith',
        authorRole: 'customer' as const,
        content: newComment,
        createdAt: new Date().toISOString(),
        isInternal: false
      }
      
      setRequest(prev => ({
        ...prev,
        comments: [...prev.comments, comment]
      }))
      
      setNewComment('')
      setIsAddingComment(false)
    }, 1000)
  }

  const StatusIcon = statusConfig[request.status].icon

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/work-requests'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[request.status].color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {formatStatus(request.status)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[request.priority]}`}>
                {request.priority.toUpperCase()} PRIORITY
              </span>
              <span className="text-sm text-gray-600">
                Request #{request.id}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Request
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{request.description}</p>
          </div>

          {/* Tags */}
          {request.tags.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {request.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Paperclip className="h-5 w-5 inline mr-2" />
                Attachments
              </h2>
              <div className="space-y-3">
                {request.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{attachment.filename}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(attachment.size)} • Uploaded {formatDate(attachment.uploadedAt)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <MessageCircle className="h-5 w-5 inline mr-2" />
              Comments & Updates
            </h2>
            
            <div className="space-y-4 mb-6">
              {request.comments.map(comment => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      comment.authorRole === 'customer' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {comment.authorRole === 'customer' ? 'Customer' : 'Program Manager'}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="border-t pt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or update..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  size="sm"
                >
                  {isAddingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-gray-900">{formatCategory(request.category)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <p className="text-gray-900 capitalize">{request.priority}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Urgency</label>
                <p className="text-gray-900 capitalize">{request.urgency}</p>
              </div>

              {request.estimatedHours && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Estimated Hours
                  </label>
                  <p className="text-gray-900">{request.estimatedHours} hours</p>
                </div>
              )}

              {request.budget && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Budget
                  </label>
                  <p className="text-gray-900">${request.budget.toLocaleString()}</p>
                </div>
              )}

              {request.requiredCompletionDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Required Completion
                  </label>
                  <p className="text-gray-900">
                    {new Date(request.requiredCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Submitted</label>
                <p className="text-gray-900">{formatDate(request.submittedAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{formatDate(request.updatedAt)}</p>
              </div>

              {request.scheduledStartDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Scheduled Start</label>
                  <p className="text-gray-900">
                    {new Date(request.scheduledStartDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {request.scheduledEndDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Scheduled End</label>
                  <p className="text-gray-900">
                    {new Date(request.scheduledEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {request.actualStartDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Actual Start</label>
                  <p className="text-gray-900">
                    {new Date(request.actualStartDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Assignment */}
          {request.assignedTo && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{request.assignedTo}</p>
                  <p className="text-sm text-gray-600">Program Manager</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

