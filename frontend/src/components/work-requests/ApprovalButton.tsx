'use client'

import React, { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import { canApproveWorkRequests, getApprovalDenialReason } from '@/lib/rbac-helpers'

interface ApprovalButtonProps {
  workRequestId: string
  currentStatus: string
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
  className?: string
}

export function ApprovalButton({
  workRequestId,
  currentStatus,
  onApprove,
  onReject,
  className = ''
}: ApprovalButtonProps) {
  const { hasPermission, userRole, loading } = usePermissions()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Check if user can approve work requests
  const canApprove = hasPermission(FEATURES.WORK_REQUESTS, PERMISSIONS.APPROVE) && 
                     canApproveWorkRequests(userRole)

  // Don't show buttons if already approved/rejected or if user can't approve
  if (currentStatus === 'approved' || currentStatus === 'rejected') {
    return null
  }

  if (loading) {
    return (
      <div className="flex gap-2">
        <Button disabled size="sm">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </Button>
      </div>
    )
  }

  // Show disabled button with tooltip for users without permission
  if (!canApprove) {
    return (
      <div className={`flex gap-2 items-center ${className}`}>
        <div className="relative inline-block">
          <Button
            disabled
            size="sm"
            variant="outline"
            className="opacity-50 cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <InfoTooltip 
            content={getApprovalDenialReason(userRole)}
            placement="top"
            className="absolute -top-1 -right-6"
          />
        </div>
        <div className="relative inline-block">
          <Button
            disabled
            size="sm"
            variant="outline"
            className="opacity-50 cursor-not-allowed"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      </div>
    )
  }

  const handleApprove = async () => {
    if (!canApprove) return
    
    setIsApproving(true)
    try {
      await onApprove(workRequestId)
    } catch (error) {
      console.error('Error approving work request:', error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!canApprove || !rejectionReason.trim()) return
    
    setIsRejecting(true)
    try {
      await onReject(workRequestId, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting work request:', error)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isApproving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </>
          )}
        </Button>
        <Button
          onClick={() => setShowRejectModal(true)}
          disabled={isRejecting}
          size="sm"
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reject Work Request
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this work request. This will be visible to the requester.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                autoFocus
              />

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionReason('')
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isRejecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    'Confirm Rejection'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ApprovalButton
