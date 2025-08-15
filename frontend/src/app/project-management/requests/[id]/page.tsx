'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Calendar, User, Building, MessageSquare, Paperclip, Clock, AlertTriangle } from 'lucide-react'
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

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  availability: 'available' | 'busy' | 'vacation'
  currentWorkload: number
  weeklyCapacity: number
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@etla.com',
    role: 'Senior Consultant',
    availability: 'busy',
    currentWorkload: 35,
    weeklyCapacity: 40
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@etla.com',
    role: 'Technical Lead',
    availability: 'available',
    currentWorkload: 25,
    weeklyCapacity: 40
  },
  {
    id: '3',
    name: 'Lisa Wang',
    email: 'lisa.wang@etla.com',
    role: 'Project Manager',
    availability: 'available',
    currentWorkload: 20,
    weeklyCapacity: 40
  }
]

const mockRequest: WorkRequest = {
  id: '1',
  title: 'Payroll System Integration',
  description: 'Need to integrate new payroll system with existing HR database. This includes setting up data synchronization, user authentication, and ensuring compliance with current security protocols.',
  category: 'system_integration',
  priority: 'high',
  urgency: 'medium',
  status: 'under_review',
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
    }
  ],
  customer: {
    name: 'John Smith',
    email: 'john.smith@acme.com',
    company: 'Acme Corporation'
  }
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'John Smith',
    content: 'We need this integration completed before the end of the month for our Q3 payroll processing.',
    timestamp: '2024-08-10T10:30:00Z',
    type: 'customer'
  }
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function RequestReviewPage({ params }: PageProps) {
  const [request, setRequest] = useState<WorkRequest | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [internalComment, setInternalComment] = useState('')
  const [customerComment, setCustomerComment] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [scheduledStartDate, setScheduledStartDate] = useState('')
  const [scheduledEndDate, setScheduledEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleApprove = async () => {
    if (!selectedAssignee || !estimatedHours) {
      alert('Please select an assignee and provide estimated hours')
      return
    }

    setIsProcessing(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Approving request with:', {
        assignee: selectedAssignee,
        estimatedHours,
        scheduledStartDate,
        scheduledEndDate,
        customerComment
      })
      setIsProcessing(false)
      window.location.href = '/project-management'
    }, 2000)
  }

  const handleReject = async () => {
    if (!customerComment.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setIsProcessing(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Rejecting request with reason:', customerComment)
      setIsProcessing(false)
      window.location.href = '/project-management'
    }, 2000)
  }

  const addInternalComment = () => {
    if (!internalComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Program Manager',
      content: internalComment,
      timestamp: new Date().toISOString(),
      type: 'internal'
    }

    setComments(prev => [...prev, comment])
    setInternalComment('')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCategory = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600'
      case 'busy': return 'text-orange-600'
      case 'vacation': return 'text-blue-600'
      default: return 'text-gray-600'
    }
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
          <Button onClick={() => window.location.href = '/project-management'}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/project-management'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Work Request</h1>
            <p className="text-gray-600">Evaluate and process customer work request</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4 inline mr-1" />
              Under Review
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{request.title}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Priority:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  request.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  request.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.priority.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Urgency:</span>
                <span className="text-sm text-gray-900 capitalize">{request.urgency}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Category:</span>
                <span className="text-sm text-gray-900">{formatCategory(request.category)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Budget:</span>
                <span className="text-sm text-gray-900">${request.budget?.toLocaleString() || 'Not specified'}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900">{request.description}</p>
            </div>

            {request.tags.length > 0 && (
              <div className="mb-4">
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

            {request.requiredCompletionDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Required by:</span>
                <span className="text-gray-900">{new Date(request.requiredCompletionDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Paperclip className="h-5 w-5 inline mr-2" />
                Attachments
              </h3>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Communication
            </h3>
            
            <div className="space-y-4 mb-6">
              {comments.map(comment => (
                <div key={comment.id} className={`border-l-4 pl-4 ${
                  comment.type === 'internal' ? 'border-orange-500 bg-orange-50' : 'border-blue-500'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{comment.author}</span>
                      {comment.type === 'internal' && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                          Internal
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Add Internal Note</h4>
              <textarea
                value={internalComment}
                onChange={(e) => setInternalComment(e.target.value)}
                placeholder="Add internal notes for team members..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />
              <Button onClick={addInternalComment} disabled={!internalComment.trim()} size="sm">
                Add Internal Note
              </Button>
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

          {/* Assignment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Building className="h-5 w-5 inline mr-2" />
              Assignment
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Team Member *
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team member</option>
                  {mockTeamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAssignee && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {(() => {
                    const member = mockTeamMembers.find(m => m.id === selectedAssignee)
                    return member ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Availability:</span>
                          <span className={`text-sm font-medium capitalize ${getAvailabilityColor(member.availability)}`}>
                            {member.availability}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Workload:</span>
                          <span className="text-sm text-gray-900">
                            {member.currentWorkload}h / {member.weeklyCapacity}h
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(member.currentWorkload / member.weeklyCapacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours *
                </label>
                <input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 40"
                  min="0"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Start Date
                  </label>
                  <input
                    type="date"
                    value={scheduledStartDate}
                    onChange={(e) => setScheduledStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled End Date
                  </label>
                  <input
                    type="date"
                    value={scheduledEndDate}
                    onChange={(e) => setScheduledEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decision */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Customer
                </label>
                <textarea
                  value={customerComment}
                  onChange={(e) => setCustomerComment(e.target.value)}
                  placeholder="Provide feedback or next steps to the customer..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing || !selectedAssignee || !estimatedHours}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Approve Request'}
                </Button>
                
                <Button 
                  onClick={handleReject}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Reject Request'}
                </Button>
              </div>

              {(!selectedAssignee || !estimatedHours) && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Please assign team member and estimated hours to approve</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

