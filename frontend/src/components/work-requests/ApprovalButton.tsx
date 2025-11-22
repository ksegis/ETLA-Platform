'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import { canApproveWorkRequests, getApprovalDenialReason } from '@/lib/rbac-helpers'
import { supabase } from '@/lib/supabase'

interface ApprovalButtonProps {
  workRequestId: string
  currentStatus: string
  onApprove: (id: string, tenantId?: string, projectManagerId?: string) => Promise<{ projectCode?: string }>
  onReject: (id: string, reason: string) => Promise<void>
  className?: string
}

interface Tenant {
  id: string
  name: string
}

interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
}

export function ApprovalButton({
  workRequestId,
  currentStatus,
  onApprove,
  onReject,
  className = ''
}: ApprovalButtonProps) {
  const { hasPermission, currentRole, loading } = usePermissions()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [createdProjectCode, setCreatedProjectCode] = useState('')
  
  // Approval form state
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [selectedProjectManagerId, setSelectedProjectManagerId] = useState('')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Check if user can approve work requests
  const canApprove = hasPermission(FEATURES.WORK_REQUESTS, PERMISSIONS.APPROVE) && 
                     canApproveWorkRequests(currentRole || '')

  // Load tenants and employees when approval modal opens
  useEffect(() => {
    if (showApprovalModal) {
      loadApprovalData()
    }
  }, [showApprovalModal])

  const loadApprovalData = async () => {
    setLoadingData(true)
    
    try {
      // Load tenants
      const { data: tenantsData } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name')
      
      if (tenantsData) {
        setTenants(tenantsData)
        if (tenantsData.length > 0) {
          setSelectedTenantId(tenantsData[0].id)
        }
      }

      // Load employees
      const { data: employeesData } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .order('last_name')
      
      if (employeesData) {
        setEmployees(employeesData)
      }
    } catch (error) {
      console.error('Error loading approval data:', error)
    } finally {
      setLoadingData(false)
    }
  }

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
            content={getApprovalDenialReason(currentRole || '')}
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

  const handleApproveClick = () => {
    setShowApprovalModal(true)
  }

  const handleApproveConfirm = async () => {
    if (!canApprove) return
    
    setIsApproving(true)
    try {
      const result = await onApprove(workRequestId, selectedTenantId, selectedProjectManagerId)
      setShowApprovalModal(false)
      
      // Show success modal with project code
      if (result?.projectCode) {
        setCreatedProjectCode(result.projectCode)
        setShowSuccessModal(true)
      }
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
          onClick={handleApproveClick}
          disabled={isApproving}
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Approve
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

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Approve Work Request
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Please provide the following information to create the project:
              </p>

              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tenant Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Tenant *
                    </label>
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Tenant</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Manager Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Project Manager (Optional)
                    </label>
                    <select
                      value={selectedProjectManagerId}
                      onChange={(e) => setSelectedProjectManagerId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.last_name}, {employee.first_name} ({employee.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowApprovalModal(false)
                    setSelectedTenantId('')
                    setSelectedProjectManagerId('')
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isApproving || loadingData}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveConfirm}
                  disabled={isApproving || loadingData || !selectedTenantId}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isApproving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Approving...
                    </>
                  ) : (
                    'Confirm Approval'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Created Successfully!
                </h3>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  The work request has been approved and a project has been created.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Project Number:</span>
                  <span className="text-lg font-bold text-green-600">{createdProjectCode}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
