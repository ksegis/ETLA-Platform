'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { pmbok } from '@/services/pmbok_service'
import type { WorkRequest } from '@/types'

interface WorkRequestApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  workRequest: WorkRequest | null
  onApprovalComplete: () => void
}

export default function WorkRequestApprovalModal({
  isOpen,
  onClose,
  workRequest,
  onApprovalComplete
}: WorkRequestApprovalModalProps) {
  const [action, setAction] = useState<'review' | 'approve' | 'decline' | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [approverComments, setApproverComments] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !workRequest) return null

  const handleAction = async () => {
    if (!action) return

    try {
      setLoading(true)
      let result

      switch (action) {
        case 'review':
          result = await pmbok.setWorkRequestUnderReview(workRequest.id)
          break
        case 'approve':
          result = await pmbok.approveWorkRequest(workRequest.id, approverComments)
          break
        case 'decline':
          if (!declineReason.trim()) {
            alert('Please provide a reason for declining')
            return
          }
          result = await pmbok.declineWorkRequest(workRequest.id, declineReason.trim())
          break
        default:
          return
      }

      if (result.success) {
        console.log(`✅ Work request ${action} successful`)
        onApprovalComplete()
        onClose()
        resetForm()
      } else {
        console.error(`❌ Work request ${action} failed:`, result.error)
        alert(`Failed to ${action} work request: ${result.error}`)
      }

    } catch (error) {
      console.error(`❌ Error during ${action}:`, error)
      alert(`Error during ${action}: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAction(null)
    setDeclineReason('')
    setApproverComments('')
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getActionButtonText = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      )
    }

    switch (action) {
      case 'review':
        return 'Set Under Review'
      case 'approve':
        return 'Approve & Create Project'
      case 'decline':
        return 'Decline Request'
      default:
        return 'Select Action'
    }
  }

  const getActionButtonColor = () => {
    switch (action) {
      case 'approve':
        return 'bg-green-600 hover:bg-green-700'
      case 'decline':
        return 'bg-red-600 hover:bg-red-700'
      case 'review':
        return 'bg-yellow-600 hover:bg-yellow-700'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Work Request Approval
            </CardTitle>
            <CardDescription>
              Review and take action on work request: "{workRequest.title}"
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Work Request Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Request Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {workRequest.title}</div>
                <div><strong>Description:</strong> {workRequest.description}</div>
                <div><strong>Priority:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    workRequest.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    workRequest.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    workRequest.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {workRequest.priority}
                  </span>
                </div>
                <div><strong>Requested By:</strong> {workRequest.requested_by_name || workRequest.requested_by}</div>
                <div><strong>Customer:</strong> {workRequest.customer_name || 'Unknown'}</div>
                {workRequest.estimated_cost && (
                  <div><strong>Estimated Cost:</strong> ${workRequest.estimated_cost.toLocaleString()}</div>
                )}
                {workRequest.estimated_hours && (
                  <div><strong>Estimated Hours:</strong> {workRequest.estimated_hours}</div>
                )}
              </div>
            </div>

            {/* Action Selection */}
            <div>
              <h3 className="font-semibold mb-3">Choose Action</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => setAction('review')}
                  variant={action === 'review' ? 'default' : 'outline'}
                  className="flex items-center gap-2 justify-start p-4 h-auto"
                >
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-medium">Set Under Review</div>
                    <div className="text-sm text-gray-500">Mark for detailed review and analysis</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setAction('approve')}
                  variant={action === 'approve' ? 'default' : 'outline'}
                  className="flex items-center gap-2 justify-start p-4 h-auto"
                >
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Approve & Create Project</div>
                    <div className="text-sm text-gray-500">Approve request and automatically create project charter</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setAction('decline')}
                  variant={action === 'decline' ? 'default' : 'outline'}
                  className="flex items-center gap-2 justify-start p-4 h-auto"
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">Decline Request</div>
                    <div className="text-sm text-gray-500">Reject the request with explanation</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Conditional Input Fields */}
            {action === 'approve' && (
              <div>
                <label className="block text-sm font-medium mb-2">Approver Comments (Optional)</label>
                <textarea
                  value={approverComments}
                  onChange={(e) => setApproverComments(e.target.value)}
                  placeholder="Add any comments about the approval..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            )}

            {action === 'decline' && (
              <div>
                <label className="block text-sm font-medium mb-2">Decline Reason *</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Please explain why this request is being declined..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAction}
                disabled={!action || loading || (action === 'decline' && !declineReason.trim())}
                className={`flex-1 ${getActionButtonColor()}`}
              >
                {getActionButtonText()}
              </Button>
              
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {/* Action Preview */}
            {action && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    {action === 'review' && (
                      <span>This will mark the request as "Under Review" for detailed analysis.</span>
                    )}
                    {action === 'approve' && (
                      <span>This will approve the request and automatically create a project charter. The request status will change to "Converted to Project".</span>
                    )}
                    {action === 'decline' && (
                      <span>This will decline the request with the provided reason. The request status will change to "Declined".</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

