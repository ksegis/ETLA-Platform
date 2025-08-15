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
    isInternal: boolean
  }>
}

const mockRequest: WorkRequest = {
  id: '2',
  title: 'Benefits Enrollment Setup',
  description: 'Configure benefits enrollment for Q4 open enrollment period. Need to set up automated enrollment workflows, configure benefit plans, and integrate with existing HRIS system. This includes setting up employee self-service portal and manager approval workflows.',
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
  tags: ['benefits', 'enrollment', 'q4', 'automation'],
  attachments: [
    {
      id: '1',
      filename: 'benefit_plans_overview.pdf',
      size: 1536000,
      uploadedAt: '2024-08-12T10:35:00Z'
    },
    {
      id: '2',
      filename: 'current_enrollment_process.docx',
      size: 768000,
      uploadedAt: '2024-08-12T10:36:00Z'
    }
  ],
  comments: [
    {
      id: '1',
      authorName: 'HR Manager',
      authorRole: 'customer',
      content: 'We need this completed before October 1st for our Q4 open enrollment. Current process is manual and error-prone.',
      createdAt: '2024-08-12T10:30:00Z',
      isInternal: false
    }
  ]
}

const teamMembers = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Consultant', availability: 'Available', expertise: ['Benefits', 'HRIS'] },
  { id: '2', name: 'Mike Chen', role: 'Technical Lead', availability: 'Busy until 8/20', expertise: ['Integration', 'Automation'] },
  { id: '3', name: 'Lisa Wang', role: 'Project Manager', availability: 'Available', expertise: ['Project Management', 'Benefits'] },
  { id: '4', name: 'David Kim', role: 'Developer', availability: 'Available', expertise: ['Frontend', 'Workflows'] }
]

export default function RequestReviewPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<WorkRequest>(mockRequest)
  const [reviewNotes, setReviewNotes] = useState('')
  const [estimatedEffort, setEstimatedEffort] = useState('')
  const [proposedTimeline, setProposedTimeline] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const handleApprove = async () => {
    setIsProcessing(true)
    
    // Simulate API call
    setTimeout(() => {
      const comment = {
        id: Date.now().toString(),
        authorName: 'Program Manager',
        authorRole: 'program_manager' as const,
        content: `Request approved. ${reviewNotes}`,
        createdAt: new Date().toISOString(),
        isInternal: false
      }
      
      setRequest(prev => ({
        ...prev,
        status: 'approved',
        assignedTo: selectedAssignee || undefined,
        comments: [...prev.comments, comment],
        updatedAt: new Date().toISOString()
      }))
      
      setIsProcessing(false)
      setShowApprovalForm(false)
    }, 1500)
  }

  const handleReject = async () => {
    setIsProcessing(true)
    
    // Simulate API call
    setTimeout(() => {
      const comment = {
        id: Date.now().toString(),
        authorName: 'Program Manager',
        authorRole: 'program_manager' as const,
        content: `Request rejected. ${reviewNotes}`,
        createdAt: new Date().toISOString(),
        isInternal: false
      }
      
      setRequest(prev => ({
        ...prev,
        status: 'rejected',
        comments: [...prev.comments, comment],
        updatedAt: new Date().toISOString()
      }))
      
      setIsProcessing(false)
      setShowRejectionForm(false)
    }, 1500)
  }

  const getRiskLevel = () => {
    const risks = []
    
    if (request.priority === 'critical' || request.urgency === 'urgent') {
      risks.push('High priority/urgency')
    }
    
    if (request.budget && request.budget > 10000) {
      risks.push('High budget')
    }
    
    if (request.requiredCompletionDate) {
      const daysUntilDeadline = Math.ceil((new Date(request.requiredCompletionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDeadline < 30) {
        risks.push('Tight deadline')
      }
    }
    
    return risks
  }

  const risks = getRiskLevel()

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
            Back to Queue
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                request.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {request.status.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">Request #{request.id}</span>
            </div>
          </div>
          
          {request.status === 'submitted' && (
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowApprovalForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button 
                onClick={() => setShowRejectionForm(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
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
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1 leading-relaxed">{request.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900">{formatCategory(request.category)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-gray-900">{request.customerName}</p>
                  <p className="text-sm text-gray-600">{request.customerEmail}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className={`text-sm font-medium ${
                    request.priority === 'critical' ? 'text-red-600' :
                    request.priority === 'high' ? 'text-orange-600' :
                    request.priority === 'medium' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {request.priority.toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Urgency</label>
                  <p className={`text-sm font-medium ${
                    request.urgency === 'urgent' ? 'text-red-600' :
                    request.urgency === 'high' ? 'text-orange-600' :
                    request.urgency === 'medium' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {request.urgency.toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <p className="text-gray-900 text-sm">{formatDate(request.submittedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          {risks.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Risk Assessment</h3>
              </div>
              <ul className="space-y-1">
                {risks.map((risk, index) => (
                  <li key={index} className="text-yellow-700 text-sm">• {risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Budget & Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Timeline</h2>
            
            <div className="grid grid-cols-3 gap-4">
              {request.estimatedHours && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Estimated Hours
                  </label>
                  <p className="text-gray-900 text-lg font-semibold">{request.estimatedHours}h</p>
                </div>
              )}
              
              {request.budget && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Budget
                  </label>
                  <p className="text-gray-900 text-lg font-semibold">${request.budget.toLocaleString()}</p>
                </div>
              )}
              
              {request.requiredCompletionDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Required Completion
                  </label>
                  <p className="text-gray-900 text-lg font-semibold">
                    {new Date(request.requiredCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Paperclip className="h-5 w-5 inline mr-2" />
                Supporting Documents
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
                      <FileText className="h-4 w-4 mr-1" />
                      View
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
              Communication History
            </h2>
            
            <div className="space-y-4">
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Assignment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Users className="h-5 w-5 inline mr-2" />
              Team Assignment
            </h2>
            
            <div className="space-y-3">
              {teamMembers.map(member => (
                <div key={member.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.availability === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.availability}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                  <div className="flex flex-wrap gap-1">
                    {member.expertise.map(skill => (
                      <span key={skill} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = `/project-management/schedule?request=${request.id}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Customer
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Proposal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Team Member
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team member</option>
                  {teamMembers.filter(m => m.availability === 'Available').map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about the approval..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline"
                onClick={() => setShowApprovalForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Processing...' : 'Approve Request'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide a clear reason for rejection..."
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline"
                onClick={() => setShowRejectionForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReject}
                disabled={isProcessing || !reviewNotes.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'Processing...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

