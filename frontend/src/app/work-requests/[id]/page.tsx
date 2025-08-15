'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MessageSquare, Paperclip, Calendar, User, Building, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
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
  tags: string[]
  attachments: Array<{
    id: string
    name: string
    size: number
    type: string
    url: string
  }>
  customer: {
    name: string
    email: string
    company: string
  }
  assignedTo?: {
    name: string
    email: string
  }
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  type: 'customer' | 'internal'
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

// Mock data
const mockRequest: WorkRequest = {
  id: '1',
  title: 'Payroll System Integration',
  description: 'Need to integrate new payroll system with existing HR database. This includes setting up data synchronization, user authentication, and ensuring compliance with current security protocols.',
  category: 'system_integration',
  priority: 'high',
  urgency: 'medium',
  status: 'in_progress',
  submittedAt: '2024-08-10',
  updatedAt: '2024-08-14',
  estimatedHours: 40,
  budget: 8000,
  requiredCompletionDate: '2024-08-30',
  tags: ['payroll', 'integration', 'hr-system', 'security'],
  attachments: [
    {
      id: '1',
      name: 'system-requirements.pdf',
      size: 2048000,
      type: 'application/pdf',
      url: '#'
    },
    {
      id: '2',
      name: 'current-database-schema.xlsx',
      size: 1024000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      url: '#'
    }
  ],
  customer: {
    name: 'John Smith',
    email: 'john.smith@acme.com',
    company: 'Acme Corporation'
  },
  assignedTo: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@etla.com'
  }
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'John Smith',
    content: 'We need this integration completed before the end of the month for our Q3 payroll processing.',
    timestamp: '2024-08-10T10:30:00Z',
    type: 'customer'
  },
  {
    id: '2',
    author: 'Sarah Johnson',
    content: 'I\'ve reviewed the requirements and started the initial analysis. Will provide an updated timeline by end of week.',
    timestamp: '2024-08-12T14:15:00Z',
    type: 'internal'
  },
  {
    id: '3',
    author: 'John Smith',
    content: 'Thanks for the update. Please let me know if you need any additional information from our IT team.',
    timestamp: '2024-08-13T09:45:00Z',
    type: 'customer'
  }
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WorkRequestDetailsPage({ params }: PageProps) {
  const [request, setRequest] = useState<WorkRequest | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const requestId = resolvedParams.id
      
      // Simulate API call
      setTimeout(() => {
        setRequest(mockRequest)
        setComments(mockComments)
        setIsLoading(false)
      }, 500)
    }

    loadData()
  }, [params])

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      content: newComment,
      timestamp: new Date().toISOString(),
      type: 'customer'
    }

    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
          <p className="text-gray-600 mb-4">The work request you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = '/work-requests'}>
            Back to Requests
          </Button>
        </div>
      </div>
    )
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
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[request.status].color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {formatStatus(request.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                {request.priority.toUpperCase()} PRIORITY
              </span>
              <span className="text-sm text-gray-600">
                Request #{request.id}
              </span>
            </div>
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
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900">{request.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Category</h3>
                  <p className="text-gray-900">{formatCategory(request.category)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Urgency</h3>
                  <p className="text-gray-900 capitalize">{request.urgency}</p>
                </div>
              </div>

              {request.estimatedHours && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Estimated Hours</h3>
                    <p className="text-gray-900">{request.estimatedHours}h</p>
                  </div>
                  {request.budget && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Budget</h3>
                      <p className="text-gray-900">${request.budget.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              {request.requiredCompletionDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Required Completion</h3>
                  <p className="text-gray-900">{new Date(request.requiredCompletionDate).toLocaleDateString()}</p>
                </div>
              )}

              {request.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
                      <p className="font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(attachment.size)}</p>
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
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Comments
            </h2>
            
            <div className="space-y-4 mb-6">
              {comments.map(comment => (
                <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <User className="h-5 w-5 inline mr-2" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-gray-900">{request.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{request.customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Company</p>
                <p className="text-gray-900">{request.customer.company}</p>
              </div>
            </div>
          </div>

          {/* Assignment Info */}
          {request.assignedTo && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Building className="h-5 w-5 inline mr-2" />
                Assignment
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To</p>
                  <p className="text-gray-900">{request.assignedTo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{request.assignedTo.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Calendar className="h-5 w-5 inline mr-2" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Submitted</p>
                <p className="text-gray-900">{new Date(request.submittedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <p className="text-gray-900">{new Date(request.updatedAt).toLocaleDateString()}</p>
              </div>
              {request.requiredCompletionDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Due Date</p>
                  <p className="text-gray-900">{new Date(request.requiredCompletionDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

