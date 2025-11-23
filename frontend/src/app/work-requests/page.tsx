'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Copy, Trash2, Calendar, LayoutGrid, List, X, File, DollarSign, Users, Target, TrendingUp, HelpCircle } from 'lucide-react'
import { TourProvider, useTour } from '@/components/tours/TourProvider'
import { workRequestsTour, hostWorkRequestsTour } from '@/components/tours/workRequestsTour'
import { usePermissions, ROLES } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WorkRequestForm from '@/components/work-requests/WorkRequestForm'
import { ViewWorkRequestModal } from '@/components/work-requests/ViewWorkRequestModal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant, useAccessibleTenantIds, useMultiTenantMode } from '@/contexts/TenantContext'

// Types matching the database schema exactly
interface WorkRequest {
  id: string
  tenant_id: string
  title: string
  description: string
  category: string | string[]
  categoryOther?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  customer_id: string
  assigned_to?: string
  estimated_hours?: number
  actual_hours?: number
  budget?: number
  estimated_budget?: number
  required_completion_date?: string
  requested_completion_date?: string
  scheduled_start_date?: string
  scheduled_end_date?: string
  actual_start_date?: string
  actual_completion_date?: string
  rejection_reason?: string
  internal_notes?: string
  customer_notes?: string
  tags?: string[]
  attachments?: any
  created_at: string
  updated_at: string
  request_id?: string
  approval_status?: string
  decline_reason?: string
  approved_by?: string
  approved_at?: string
  project_id?: string
  business_justification?: string
  impact_assessment?: string
  risk_level?: string
  impact_level?: string
  dependencies?: string
  stakeholders?: string
  success_criteria?: string
  // Comprehensive fields
  affectedSystems?: string[]
  estimatedEmployeeImpact?: string
  complianceRelated?: string
  specificRequirements?: string
  estimatedDocumentCount?: string
  estimatedDataVolume?: string
  longTermStorageRequired?: string
  ongoingApiMonitoring?: string
  ongoingSupportNeeded?: string
  expectedFrequency?: string
  integrationComplexity?: string
  helixBridgeAccess?: string
  currentPayrollSystem?: string
  currentHRIS?: string
  currentVersion?: string
  currentIntegrationCount?: string
  dataMigrationNeeded?: string
  currentPainPoints?: string
}

interface WorkRequestStats {
  total: number
  submitted: number
  under_review: number
  approved: number
  in_progress: number
  completed: number
}

// Status configuration
const statusConfig = {
  submitted: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Submitted' },
  under_review: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  scheduled: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Scheduled' },
  in_progress: { icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Cancelled' }
}

// Priority configuration
const priorityConfig = {
  low: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Low' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
  critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' }
}

function WorkRequestsPageContent() {
  const { startTour } = useTour()
  const { currentRole } = usePermissions()
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<WorkRequest[]>([])
  const [loading, setloading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [tenantFilter, setTenantFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdProjectCode, setCreatedProjectCode] = useState('')
  const [approvalTenantId, setApprovalTenantId] = useState('')
  const [approvalPMId, setApprovalPMId] = useState('')
  const [employees, setEmployees] = useState<Array<{id: string, first_name: string, last_name: string, email: string}>>([])
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [availableTenantsForCustomer, setAvailableTenantsForCustomer] = useState<Array<{id: string, name: string}>>([])

  const [stats, setStats] = useState<WorkRequestStats>({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    in_progress: 0,
    completed: 0
  })

  const { user, tenantUser } = useAuth()
  const { selectedTenant } = useTenant()
  const accessibleTenantIds = useAccessibleTenantIds()
  const { isMultiTenant, availableTenants } = useMultiTenantMode()

  // Load available tenants
  const loadAvailableTenants = async () => {
    if (tenantUser?.role === 'host_admin') {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name')
          .order('name')

        if (error) throw error
        setAvailableTenantsForCustomer(data || [])
      } catch (err) {
        console.error('Error loading tenants:', err)
      }
    } else if (tenantUser?.role === 'primary_customer_admin' && selectedTenant) {
      setAvailableTenantsForCustomer([{ id: selectedTenant.id, name: selectedTenant.name }])
      setSelectedCustomerId(selectedTenant.id)
    }
  }

  // Load work requests
  const loadWorkRequests = async () => {
    const tenantIds = accessibleTenantIds
    
    if (!tenantIds || tenantIds.length === 0) {
      console.log('No accessible tenants, skipping load')
      setloading(false)
      return
    }

    try {
      setloading(true)
      setError(null)
      
      console.log('loading work requests for tenants:', tenantIds)

      // Query work requests with attachments
      const { data, error: queryError } = await supabase
        .from('work_requests')
        .select(`
          *
        `)
        .in('tenant_id', tenantIds)
        .order('created_at', { ascending: false })

      if (queryError) {
        console.error('Database query error:', queryError)
        console.error('Error details:', JSON.stringify(queryError, null, 2))
        setError(`Failed to load work requests: ${queryError.message || 'Unknown error'}`)
        setWorkRequests([])
        setFilteredRequests([])
        return
      }

      // Fetch attachments separately for each work request
      const dataWithAttachments = await Promise.all(
        (data || []).map(async (request: any) => {
          const { data: attachments } = await supabase
            .from('work_request_attachments')
            .select('*')
            .eq('work_request_id', request.id)
          
          return {
            ...request,
            attachments: attachments || []
          }
        })
      )

      console.log('Loaded work requests with attachments:', dataWithAttachments)
      
      setWorkRequests(dataWithAttachments)
      setFilteredRequests(dataWithAttachments)
      // Stats will be calculated by the useEffect that watches filteredRequests

    } catch (err) {
      console.error('Error loading work requests:', err)
      setError('Failed to load work requests')
      setWorkRequests([])
      setFilteredRequests([])
    } finally {
      setloading(false)
    }
  }

  // Create new work request with file upload
  const handleCreateRequest = async (requestData: Partial<WorkRequest>, files: File[]) => {
    if (!selectedTenant?.id || !user?.id) {
      setError('Missing tenant or user information')
      return
    }

    try {
      let customerId: string
      
      if (tenantUser?.role === 'host_admin') {
        customerId = user.id
      } else if (tenantUser?.role === 'client_admin' || tenantUser?.role === 'primary_customer_admin') {
        customerId = user.id
      } else {
        customerId = user.id
      }

      const newRequest = {
        tenant_id: selectedTenant.id,
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        category_other: requestData.categoryOther || null,
        priority: requestData.priority,
        urgency: requestData.urgency || 'medium',
        customer_id: customerId,
        status: requestData.status || 'submitted',
        assigned_to: null,
        estimated_hours: requestData.estimated_hours || null,
        actual_hours: 0,
        budget: requestData.budget || null,
        estimated_budget: requestData.estimated_budget || null,
        required_completion_date: requestData.required_completion_date || null,
        requested_completion_date: requestData.requested_completion_date || null,
        scheduled_start_date: null,
        scheduled_end_date: null,
        actual_start_date: null,
        actual_completion_date: null,
        rejection_reason: null,
        internal_notes: null,
        customer_notes: null,
        tags: null,
        attachments: [],
        request_id: null,
        approval_status: 'submitted',
        decline_reason: null,
        approved_by: null,
        approved_at: null,
        project_id: null,
        business_justification: requestData.business_justification || null,
        impact_assessment: requestData.impact_assessment || null,
        // Comprehensive fields
        affected_systems: requestData.affectedSystems || null,
        estimated_employee_impact: requestData.estimatedEmployeeImpact || null,
        compliance_related: requestData.complianceRelated || null,
        specific_requirements: requestData.specificRequirements || null,
        estimated_document_count: requestData.estimatedDocumentCount || null,
        estimated_data_volume: requestData.estimatedDataVolume || null,
        long_term_storage_required: requestData.longTermStorageRequired || null,
        ongoing_api_monitoring: requestData.ongoingApiMonitoring || null,
        ongoing_support_needed: requestData.ongoingSupportNeeded || null,
        expected_frequency: requestData.expectedFrequency || null,
        integration_complexity: requestData.integrationComplexity || null,
        helix_bridge_access: requestData.helixBridgeAccess || null,
        current_payroll_system: requestData.currentPayrollSystem || null,
        current_hris: requestData.currentHRIS || null,
        current_version: requestData.currentVersion || null,
        current_integration_count: requestData.currentIntegrationCount || null,
        data_migration_needed: requestData.dataMigrationNeeded || null,
        current_pain_points: requestData.currentPainPoints || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('work_requests')
        .insert([newRequest])
        .select()
        .single()

      if (error) {
        console.error('Error creating work request:', error)
        setError(`Failed to create work request: ${error.message}`)
        return
      }

      const workRequestId = data.id

      // Upload files if any
      if (files.length > 0) {
        console.log(`Starting upload of ${files.length} files...`)
        for (const file of files) {
          try {
            console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`)
            const timestamp = Date.now()
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            const filePath = `${selectedTenant.id}/${workRequestId}/${timestamp}_${sanitizedFileName}`
            console.log(`File path: ${filePath}`)

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('work-request-attachments')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) {
              console.error('Upload error details:', uploadError)
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
            }

            console.log('Upload successful:', uploadData)

            // Save attachment record to database
            const { error: dbError } = await supabase
              .from('work_request_attachments')
              .insert({
                work_request_id: workRequestId,
                tenant_id: selectedTenant.id,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                file_url: uploadData.path,
                uploaded_by: user?.id
              })

            if (dbError) {
              console.error('Database error details:', dbError)
              // Cleanup: delete uploaded file
              await supabase.storage
                .from('work-request-attachments')
                .remove([filePath])
              throw new Error(`Failed to save ${file.name} record: ${dbError.message}`)
            }

            console.log(`Successfully uploaded and saved: ${file.name}`)
          } catch (fileError: any) {
            console.error('File upload error:', fileError)
            setError(`File upload error: ${fileError.message}`)
            // Continue with other files even if one fails
          }
        }
        console.log('All file uploads completed')
      } else {
        console.log('No files to upload')
      }

      setWorkRequests(prev => [data, ...prev])
      setIsCreateModalOpen(false)
      loadWorkRequests()
      setError(null)
    } catch (error) {
      console.error('Error creating work request:', error)
      setError('Failed to create work request. Please try again.')
    }
  }

  // Update work request with file handling
  const handleUpdateRequest = async (requestData: Partial<WorkRequest>, files: File[]) => {
    // Debug logging
    console.log('handleUpdateRequest called with:', {
      requestDataId: requestData.id,
      selectedRequestId: selectedRequest?.id,
      requestData,
      hasFiles: files.length
    })
    
    // Use requestData.id if selectedRequest is lost
    const requestId = selectedRequest?.id || requestData.id
    
    if (!requestId) {
      console.error('No request ID found!', { selectedRequest, requestData })
      setError('No request selected for update')
      return
    }
    
    console.log('Using requestId:', requestId)

    try {
      const updateData = {
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        category_other: requestData.categoryOther || null,
        priority: requestData.priority,
        urgency: requestData.urgency,
        status: requestData.status,
        budget: requestData.budget || null,
        estimated_budget: requestData.estimated_budget || null,
        estimated_hours: requestData.estimated_hours || null,
        required_completion_date: requestData.required_completion_date || null,
        requested_completion_date: requestData.requested_completion_date || null,
        business_justification: requestData.business_justification || null,
        impact_assessment: requestData.impact_assessment || null,
        // Comprehensive fields
        affected_systems: requestData.affectedSystems || null,
        estimated_employee_impact: requestData.estimatedEmployeeImpact || null,
        compliance_related: requestData.complianceRelated || null,
        specific_requirements: requestData.specificRequirements || null,
        estimated_document_count: requestData.estimatedDocumentCount || null,
        estimated_data_volume: requestData.estimatedDataVolume || null,
        long_term_storage_required: requestData.longTermStorageRequired || null,
        ongoing_api_monitoring: requestData.ongoingApiMonitoring || null,
        ongoing_support_needed: requestData.ongoingSupportNeeded || null,
        expected_frequency: requestData.expectedFrequency || null,
        integration_complexity: requestData.integrationComplexity || null,
        helix_bridge_access: requestData.helixBridgeAccess || null,
        current_payroll_system: requestData.currentPayrollSystem || null,
        current_hris: requestData.currentHRIS || null,
        current_version: requestData.currentVersion || null,
        current_integration_count: requestData.currentIntegrationCount || null,
        data_migration_needed: requestData.dataMigrationNeeded || null,
        current_pain_points: requestData.currentPainPoints || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('work_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single()

      if (error) {
        console.error('Error updating work request:', error)
        setError(`Failed to update work request: ${error.message}`)
        return
      }

      // Upload new files
      if (files.length > 0 && selectedTenant) {
        for (const file of files) {
          try {
            const timestamp = Date.now()
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            const filePath = `${selectedTenant.id}/${requestId}/${timestamp}_${sanitizedFileName}`

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('work-request-attachments')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) throw new Error(`Failed to upload ${file.name}`)

            await supabase
              .from('work_request_attachments')
              .insert({
                work_request_id: requestId,
                tenant_id: selectedTenant.id,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                file_url: uploadData.path,
                uploaded_by: user?.id
              })
          } catch (fileError: any) {
            console.error('File upload error:', fileError)
          }
        }
      }

      // Handle deleted attachments
      if ((requestData as any).deletedAttachmentIds?.length > 0) {
        for (const attachmentId of (requestData as any).deletedAttachmentIds) {
          const { data: attachment } = await supabase
            .from('work_request_attachments')
            .select('file_url')
            .eq('id', attachmentId)
            .single()

          if (attachment) {
            await supabase.storage
              .from('work-request-attachments')
              .remove([attachment.file_url])

            await supabase
              .from('work_request_attachments')
              .delete()
              .eq('id', attachmentId)
          }
        }
      }

      // Reload work requests to get fresh data with all fields
      await loadWorkRequests()
      setIsEditModalOpen(false)
      setSelectedRequest(null)
      setError(null)

    } catch (err) {
      console.error('Error updating work request:', err)
      setError('Failed to update work request. Please try again.')
    }
  }

  // Delete work request
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this work request?')) return

    try {
      const { error } = await supabase
        .from('work_requests')
        .delete()
        .eq('id', requestId)

      if (error) {
        console.error('Error deleting work request:', error)
        setError(`Failed to delete work request: ${error.message}`)
        return
      }

      setWorkRequests(prev => prev.filter((r: any) => r.id !== requestId))
      loadWorkRequests()
      setError(null)
    } catch (error) {
      console.error('Error deleting work request:', error)
      setError('Failed to delete work request. Please try again.')
    }
  }

  // Filter requests
  useEffect(() => {
    let filtered = workRequests

    if (searchTerm) {
      filtered = filtered.filter((request: any) =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.business_justification?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((request: any) => request.status === statusFilter)
    }

    if (priorityFilter) {
      filtered = filtered.filter((request: any) => request.priority === priorityFilter)
    }

    if (tenantFilter) {
      filtered = filtered.filter((request: any) => request.tenant_id === tenantFilter)
    }

    setFilteredRequests(filtered)
  }, [workRequests, searchTerm, statusFilter, priorityFilter, tenantFilter])

  // Update stats based on filtered requests
  useEffect(() => {
    const requestStats = {
      total: filteredRequests.length,
      submitted: filteredRequests.filter((r: any) => r.status === 'submitted').length,
      under_review: filteredRequests.filter((r: any) => r.status === 'under_review').length,
      approved: filteredRequests.filter((r: any) => r.status === 'approved').length,
      in_progress: filteredRequests.filter((r: any) => r.status === 'in_progress').length,
      completed: filteredRequests.filter((r: any) => r.status === 'completed').length
    }
    setStats(requestStats)
  }, [filteredRequests])

  // Load data
  useEffect(() => {
    loadWorkRequests()
    loadAvailableTenants()
  }, [accessibleTenantIds.join(','), tenantUser?.role])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getRequestName = (request: WorkRequest) => {
    return request.title || `Request ${request.id?.slice(0, 8)}`
  }

  const getBudgetAmount = (request: WorkRequest) => {
    return request.budget || request.estimated_budget || 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 underline text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
            <p className="text-gray-600">Manage and track your work requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={startTour}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Start Tour
            </Button>
            <Button id="create-request-btn" onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Submitted</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.submitted}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.under_review}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">In Progress</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.in_progress}</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e: any) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              
              {isMultiTenant && (
                <select
                  value={tenantFilter}
                  onChange={(e: any) => setTenantFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tenants</option>
                  {availableTenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              )}
              
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Work Requests ({filteredRequests.length})</CardTitle>
            <CardDescription>
              {filteredRequests.length} of {workRequests.length} requests
              {isMultiTenant && selectedTenant && <span className="ml-2">| Tenant: {selectedTenant.name}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">loading work requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No work requests found</h3>
                <p className="text-gray-600 mb-4">
                  {workRequests.length === 0 
                    ? "Get started by creating your first work request."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {workRequests.length === 0 && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Button>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <div id="work-requests-list" className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request: any) => {
                      const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock
                      const statusStyle = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.submitted

                      return (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{getRequestName(request)}</div>
                              <div className="text-sm text-gray-500">{request.description?.slice(0, 100)}...</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="status-badge" variant={request.status === 'approved' ? 'default' : 'secondary'}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusStyle.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="priority-badge" variant={request.priority === 'high' || request.priority === 'critical' ? 'destructive' : 'secondary'}>
                              {request.priority || 'medium'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${getBudgetAmount(request).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setIsViewModalOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setIsEditModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  // Create a copy with new ID and reset status
                                  const copiedRequest = {
                                    ...request,
                                    id: undefined,
                                    title: `Copy of ${request.title}`,
                                    status: 'submitted' as const,
                                    created_at: undefined,
                                    updated_at: undefined
                                  }
                                  setSelectedRequest(copiedRequest as any)
                                  setIsEditModalOpen(true)
                                }}
                                title="Copy this work request"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteRequest(request.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request: any) => {
                  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock
                  const statusStyle = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.submitted

                  return (
                    <Card key={request.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{getRequestName(request)}</CardTitle>
                            <CardDescription>{request.description?.slice(0, 100)}...</CardDescription>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsViewModalOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsEditModalOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const copiedRequest = {
                                  ...request,
                                  id: undefined,
                                  title: `Copy of ${request.title}`,
                                  status: 'submitted' as const,
                                  created_at: undefined,
                                  updated_at: undefined
                                }
                                setSelectedRequest(copiedRequest as any)
                                setIsEditModalOpen(true)
                              }}
                              title="Copy this work request"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Status:</span>
                            <Badge className="status-badge" variant={request.status === 'approved' ? 'default' : 'secondary'}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusStyle.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Priority:</span>
                            <Badge className="priority-badge" variant={request.priority === 'high' || request.priority === 'critical' ? 'destructive' : 'secondary'}>
                              {request.priority || 'medium'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Budget:</span>
                            <span className="text-sm font-medium">
                              ${getBudgetAmount(request).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Created:</span>
                            <span className="text-sm text-gray-500">{formatDate(request.created_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <WorkRequestForm
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedCustomerId('')
          }}
          onSave={handleCreateRequest}
          title="Create New Work Request"
          userRole={tenantUser?.role}
          availableTenants={availableTenantsForCustomer}
          selectedCustomerId={selectedCustomerId}
          onCustomerChange={setSelectedCustomerId}
        />

        <WorkRequestForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedRequest(null)
          }}
          onSave={handleUpdateRequest}
          request={selectedRequest ? {
            ...selectedRequest,
            attachments: selectedRequest.attachments?.map((att: any) => ({
              ...att,
              file_url: att.file_url // The form will generate signed URLs when needed
            }))
          } : null}
          title="Edit Work Request"
          userRole={tenantUser?.role}
          availableTenants={availableTenantsForCustomer}
          selectedCustomerId={selectedCustomerId}
          onCustomerChange={setSelectedCustomerId}
        />

        {/* View Modal */}
        {isViewModalOpen && selectedRequest && (
          <ViewWorkRequestModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false)
              setSelectedRequest(null)
            }}
            request={selectedRequest}
          />
        )}

      </div>
    </DashboardLayout>
  )
}

export default function WorkRequestsPage() {
  const { currentRole } = usePermissions()
  
  // Determine which tour to show based on role
  const tourSteps = currentRole === ROLES.HOST_ADMIN || currentRole === ROLES.PROGRAM_MANAGER
    ? hostWorkRequestsTour
    : workRequestsTour
  
  return (
    <TourProvider tourId="work-requests" steps={tourSteps}>
      <WorkRequestsPageContent />
    </TourProvider>
  )
}
