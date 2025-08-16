'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MessageCircle, 
  Paperclip, 
  Check, 
  X,
  AlertTriangle,
  Users,
  FileText,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface WorkRequest {
  id: string
  title: string
  description: string
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
  scheduledStartDate?: string
  scheduledEndDate?: string
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
  }>
}

const mockRequest: WorkRequest = {
  id: '1',
  title: 'Payroll System Integration',
  description: 'We need to integrate our existing payroll system with the new HRIS platform. This includes data migration, API setup, and testing to ensure seamless operation.',
  customerName: 'Acme Corporation',
  customerEmail: 'john.doe@acme.com',
  category: 'system_integration',
  priority: 'high',
  urgency: 'medium',
  status: 'under_review',
  submittedAt: '2024-08-10T09:00:00Z',
  updatedAt: '2024-08-12T14:30:00Z',
  estimatedHours: 40,
  budget: 8000,
  requiredCompletionDate: '2024-08-30',
  tags: ['payroll', 'integration', 'hris', 'api'],
  attachments: [
    {
      id: '1',
      filename: 'system_requirements.pdf',
      size: 2048000,
      uploadedAt: '2024-08-10T09:00:00Z'
    },
    {
      id: '2',
      filename: 'current_payroll_schema.xlsx',
      size: 512000,
      uploadedAt: '2024-08-10T09:05:00Z'
    }
  ],
  comments: [
    {
      id: '1',
      authorName: 'John Doe',
      authorRole: 'customer',
      content: 'This is a high priority project for us. We need to complete this before the end of the month.',
      createdAt: '2024-08-10T09:30:00Z'
    },
    {
      id: '2',
      authorName: 'Sarah Johnson',
      authorRole: 'program_manager',
      content: 'I\'ve reviewed the requirements. This looks feasible within the timeline. I\'ll need to coordinate with our technical team.',
      createdAt: '2024-08-12T10:15:00Z'
    }
  ]
}

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

export default function RequestReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const [request, setRequest] = useState<WorkRequest>(mockRequest)
  const [newComment, setNewComment] = useState('')
  const [estimatedHours, setEstimatedHours] = useState(request.estimatedHours?.toString() || '')
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || '')
  const [scheduledStart, setScheduledStart] = useState(request.scheduledStartDate || '')
  const [scheduledEnd, setScheduledEnd] = useState(request.scheduledEndDate || '')

  const teamMembers = ['Sarah Johnson', 'Mike Chen', 'Lisa Wang', 'David Kim']

  const handleApprove = () => {
    setRequest(prev => ({
      ...prev,
      status: 'approved',
      estimatedHours: parseInt(estimatedHours) || prev.estimatedHours,
      assignedTo,
      scheduledStartDate: scheduledStart,
      scheduledEndDate: scheduledEnd,
      updatedAt: new Date().toISOString()
    }))
    alert('Request approved successfully!')
  }

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      setRequest(prev => ({
        ...prev,
        status: 'rejected',
        updatedAt: new Date().toISOString(),
        comments: [...prev.comments, {
          id: Date.now().toString(),
          authorName: 'Program Manager',
          authorRole: 'program_manager',
          content: `Request rejected: ${reason}`,
          createdAt: new Date().toISOString()
        }]
      }))
      alert('Request rejected')
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      setRequest(prev => ({
        ...prev,
        comments: [...prev.comments, {
          id: Date.now().toString(),
          authorName: 'Program Manager',
          authorRole: 'program_manager',
          content: newComment,
          createdAt: new Date().toISOString()
        }],
        updatedAt: new Date().toISOString()
      }))
      setNewComment('')
    }
  }

  const handleSchedule = () => {
    if (!assignedTo || !scheduledStart || !scheduledEnd) {
      alert('Please fill in all scheduling fields')
      return
    }
    
    setRequest(prev => ({
      ...prev,
      status: 'scheduled',
      assignedTo,
      scheduledStartDate: scheduledStart,
      scheduledEndDate: scheduledEnd,
      estimatedHours: parseInt(estimatedHours) || prev.estimatedHours,
      updatedAt: new Date().toISOString()
    }))
    alert('Request scheduled successfully!')
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/project-management'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                  {request.priority.toUpperCase()} PRIORITY
                </span>
                <span className="text-sm text-gray-600">
                  Submitted: {formatDate(request.submittedAt)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {request.status === 'under_review' && (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleReject}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {request.status === 'approved' && (
                <Button 
                  onClick={handleSchedule}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Project
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{request.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <p className="text-gray-900">{request.customerName}</p>
                    <p className="text-sm text-gray-600">{request.customerEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-gray-900">{request.category.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
                
                {request.requiredCompletionDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Completion Date</label>
                    <p className="text-gray-900">{new Date(request.requiredCompletionDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {request.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Planning */}
            {(request.status === 'under_review' || request.status === 'approved') && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Planning</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter estimated hours"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select team member</option>
                      {teamMembers.map(member => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Start Date</label>
                    <input
                      type="date"
                      value={scheduledStart}
                      onChange={(e) => setScheduledStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled End Date</label>
                    <input
                      type="date"
                      value={scheduledEnd}
                      onChange={(e) => setScheduledEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {request.attachments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
                
                <div className="space-y-3">
                  {request.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-xs text-gray-600">
                            {formatFileSize(attachment.size)} • {formatDate(attachment.uploadedAt)}
                          </p>
                        </div>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
              
              <div className="space-y-4 mb-6">
                {request.comments.map(comment => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        comment.authorRole === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {comment.authorRole === 'customer' ? 'Customer' : 'Program Manager'}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimated Hours</p>
                    <p className="text-sm text-gray-600">{request.estimatedHours || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Budget</p>
                    <p className="text-sm text-gray-600">${request.budget?.toLocaleString() || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned To</p>
                    <p className="text-sm text-gray-600">{request.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>
                
                {request.scheduledStartDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Scheduled</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.scheduledStartDate).toLocaleDateString()} - {new Date(request.scheduledEndDate!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Request Submitted</p>
                    <p className="text-xs text-gray-600">{formatDate(request.submittedAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Under Review</p>
                    <p className="text-xs text-gray-600">{formatDate(request.updatedAt)}</p>
                  </div>
                </div>
                
                {request.status === 'approved' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Approved</p>
                      <p className="text-xs text-gray-600">{formatDate(request.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

