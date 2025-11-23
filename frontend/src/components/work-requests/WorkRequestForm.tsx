'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, File, Trash2, AlertCircle, Info, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useFormPersist } from '@/hooks/useFormPersist'
import { saveFiles, getFiles, clearFiles } from '@/lib/fileStorage'

// Types matching the database schema with HR/Payroll focus
interface WorkRequestFormData {
  title: string
  description: string
  category: string[]
  categoryOther: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  affectedSystems: string[]
  estimatedEmployeeImpact: string
  complianceRelated: string
  specificRequirements: string
  required_completion_date: string
  // Scope estimation fields
  estimatedDocumentCount: string
  estimatedDataVolume: string
  longTermStorageRequired: string
  ongoingApiMonitoring: string
  ongoingSupportNeeded: string
  expectedFrequency: string
  integrationComplexity: string
  helixBridgeAccess: string
  // Current system fields
  currentPayrollSystem?: string
  currentHRIS?: string
  currentVersion?: string
  currentIntegrationCount?: string
  dataMigrationNeeded?: string
  currentPainPoints?: string
}

interface WorkRequest {
  id: string
  title: string
  description: string
  category: string | string[]
  categoryOther?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  tenant_id: string
  customer_id?: string
  created_at: string
  updated_at: string
  attachments?: WorkRequestAttachment[]
  affectedSystems?: string[]
  estimatedEmployeeImpact?: string
  complianceRelated?: string
  specificRequirements?: string
  required_completion_date?: string
  // Scope estimation fields
  estimatedDocumentCount?: string
  estimatedDataVolume?: string
  longTermStorageRequired?: string
  ongoingApiMonitoring?: string
  ongoingSupportNeeded?: string
  expectedFrequency?: string
  integrationComplexity?: string
  helixBridgeAccess?: string
  // Current system fields
  currentPayrollSystem?: string
  currentHRIS?: string
  currentVersion?: string
  currentIntegrationCount?: string
  dataMigrationNeeded?: string
  currentPainPoints?: string
}

interface WorkRequestAttachment {
  id?: string
  file_name: string
  file_size: number
  file_type: string
  file_url?: string
  uploaded_at?: string
}

interface UploadedFile {
  file: File
  preview?: WorkRequestAttachment
}

interface WorkRequestFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<WorkRequest>, files: File[]) => void
  request?: WorkRequest | null
  title?: string
  userRole?: string
  availableTenants?: Array<{id: string, name: string}>
  selectedCustomerId?: string
  onCustomerChange?: (customerId: string) => void
}

const categories = [
  { value: 'payroll_setup', label: 'Payroll Setup & Configuration' },
  { value: 'payroll_processing', label: 'Payroll Processing Issue' },
  { value: 'benefits_admin', label: 'Benefits Administration' },
  { value: 'time_attendance', label: 'Time & Attendance' },
  { value: 'hr_data_migration', label: 'HR Data Migration' },
  { value: 'compliance_reporting', label: 'Compliance & Reporting' },
  { value: 'system_integration', label: 'System Integration' },
  { value: 'employee_onboarding', label: 'Employee Onboarding/Offboarding' },
  { value: 'training_support', label: 'Training & Support' },
  { value: 'custom_development', label: 'Custom Development' },
  { value: 'other', label: 'Other' }
]

const systemOptions = [
  { value: 'payroll', label: 'Payroll System' },
  { value: 'hris', label: 'HRIS/HCM' },
  { value: 'time_tracking', label: 'Time Tracking' },
  { value: 'benefits', label: 'Benefits Platform' },
  { value: 'ats', label: 'Applicant Tracking (ATS)' },
  { value: 'lms', label: 'Learning Management (LMS)' },
  { value: 'performance', label: 'Performance Management' },
  { value: 'other', label: 'Other System' }
]

const employeeImpactOptions = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-100', label: '51-100 employees' },
  { value: '101-500', label: '101-500 employees' },
  { value: '501-1000', label: '501-1,000 employees' },
  { value: '1001-5000', label: '1,001-5,000 employees' },
  { value: '5001-10000', label: '5,001-10,000 employees' },
  { value: '10000+', label: '10,000+ employees' },
  { value: 'all', label: 'All employees' }
]

const documentCountOptions = [
  { value: '0-100', label: '0-100 documents' },
  { value: '101-500', label: '101-500 documents' },
  { value: '501-1000', label: '501-1,000 documents' },
  { value: '1001-5000', label: '1,001-5,000 documents' },
  { value: '5001-10000', label: '5,001-10,000 documents' },
  { value: '10000+', label: '10,000+ documents' }
]

const dataVolumeOptions = [
  { value: '0-1000', label: '0-1,000 records' },
  { value: '1001-10000', label: '1,001-10,000 records' },
  { value: '10001-50000', label: '10,001-50,000 records' },
  { value: '50001-100000', label: '50,001-100,000 records' },
  { value: '100001-500000', label: '100,001-500,000 records' },
  { value: '500000+', label: '500,000+ records' }
]

const frequencyOptions = [
  { value: 'one-time', label: 'One-time project' },
  { value: 'monthly', label: 'Monthly recurring' },
  { value: 'quarterly', label: 'Quarterly recurring' },
  { value: 'annually', label: 'Annual recurring' },
  { value: 'ongoing', label: 'Ongoing/Continuous' }
]

const integrationComplexityOptions = [
  { value: 'simple', label: 'Simple (1-2 systems)' },
  { value: 'moderate', label: 'Moderate (3-4 systems)' },
  { value: 'complex', label: 'Complex (5-7 systems)' },
  { value: 'very-complex', label: 'Very Complex (8+ systems)' }
]

// Tooltip component
const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block ml-1">
      <Info 
        className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-help inline"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute z-50 w-64 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
        </div>
      )}
    </div>
  )
}

// Field tooltips
const fieldTooltips = {
  title: "Brief, descriptive title for the work request (e.g., 'Configure Q4 2024 payroll tax updates')",
  description: "Detailed description of what needs to be done, including background and context",
  category: "Select one or more categories that best describe this request. Choose 'Other' to specify a custom category.",
  employeeImpact: "Estimated number of employees affected by this request",
  status: "Current status of the work request",
  completionDate: "Target date by which this work should be completed",
  specificRequirements: "Any technical requirements, constraints, or special considerations",
  affectedSystems: "Select all systems that will be impacted by this work",
  complianceRelated: "Indicate if this request involves compliance, regulatory, or legal requirements",
  priority: "Business priority level - how important is this to operations?",
  urgency: "Time sensitivity - how quickly does this need to be completed?",
  currentPayroll: "Name of your current payroll system (e.g., ADP Workforce Now, Paychex Flex)",
  currentHRIS: "Name of your current HR management system (e.g., Workday, SAP SuccessFactors)",
  currentVersion: "Current version or release of your system (e.g., 2024 R1, Version 8.5)",
  currentIntegrations: "Number of systems currently integrated with your payroll/HR system",
  dataMigration: "Will data need to be migrated from another system?",
  painPoints: "Describe current issues or limitations with your existing system",
  documentCount: "Estimated number of documents to be processed, stored, or managed",
  dataVolume: "Estimated number of records to be processed (e.g., employee records, transactions)",
  longTermStorage: "Will this data need to be stored long-term for compliance or historical purposes?",
  apiMonitoring: "Will ongoing API monitoring and management be required?",
  ongoingSupport: "Will ongoing support be needed after initial implementation?",
  frequency: "Is this a one-time project or recurring work?",
  integrationComplexity: "Number of systems that need to be integrated",
  helixBridgeAccess: "Will the organization need access to the HelixBridge platform for self-service or reporting?"
}

const WorkRequestForm: React.FC<WorkRequestFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  request = null, 
  title = "Create New Work Request",
  userRole,
  availableTenants = [],
  selectedCustomerId,
  onCustomerChange
}) => {
  const [formData, setFormData] = useState<WorkRequestFormData>({
    title: '',
    description: '',
    category: [],
    categoryOther: '',
    priority: 'medium',
    urgency: 'medium',
    status: 'submitted',
    affectedSystems: [],
    estimatedEmployeeImpact: '',
    complianceRelated: '',
    specificRequirements: '',
    required_completion_date: '',
    estimatedDocumentCount: '',
    estimatedDataVolume: '',
    longTermStorageRequired: '',
    ongoingApiMonitoring: '',
    ongoingSupportNeeded: '',
    expectedFrequency: '',
    integrationComplexity: '',
    helixBridgeAccess: '',
    currentPayrollSystem: '',
    currentHRIS: '',
    currentVersion: '',
    currentIntegrationCount: '',
    dataMigrationNeeded: '',
    currentPainPoints: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [existingAttachments, setExistingAttachments] = useState<WorkRequestAttachment[]>([])
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([])

  // Auto-save form data to localStorage
  const { clearPersistedData, getPersistedData } = useFormPersist(
    'work_request_form',
    formData,
    isOpen,
    request?.id
  )

  // Reset form when modal opens/closes or request changes
  useEffect(() => {
    if (isOpen) {
      // Try to restore persisted data first
      const persistedData = getPersistedData()
      
      if (persistedData) {
        // Restore from localStorage if available
        setFormData(persistedData)
      } else if (request) {
        // Otherwise load from request data
        setFormData({
          title: request.title || '',
          description: request.description || '',
          category: Array.isArray(request.category) ? request.category : (request.category ? [request.category] : []),
          categoryOther: request.categoryOther || '',
          priority: (request.priority as any) || 'medium',
          urgency: (request.urgency as any) || 'medium',
          status: (request.status as any) || 'submitted',
          affectedSystems: request.affectedSystems || [],
          estimatedEmployeeImpact: request.estimatedEmployeeImpact || '',
          complianceRelated: request.complianceRelated || '',
          specificRequirements: request.specificRequirements || '',
          required_completion_date: request.required_completion_date || '',
          estimatedDocumentCount: request.estimatedDocumentCount || '',
          estimatedDataVolume: request.estimatedDataVolume || '',
          longTermStorageRequired: request.longTermStorageRequired || '',
          ongoingApiMonitoring: request.ongoingApiMonitoring || '',
          ongoingSupportNeeded: request.ongoingSupportNeeded || '',
          expectedFrequency: request.expectedFrequency || '',
          integrationComplexity: request.integrationComplexity || '',
          helixBridgeAccess: request.helixBridgeAccess || '',
          currentPayrollSystem: request.currentPayrollSystem || '',
          currentHRIS: request.currentHRIS || '',
          currentVersion: request.currentVersion || '',
          currentIntegrationCount: request.currentIntegrationCount || '',
          dataMigrationNeeded: request.dataMigrationNeeded || '',
          currentPainPoints: request.currentPainPoints || ''
        })
      }
      
      if (request) {
        setExistingAttachments(request.attachments || [])
      } else {
        setExistingAttachments([])
      }
      
      // Restore persisted files from IndexedDB
      const storageKey = request?.id ? `work_request_form_${request.id}` : 'work_request_form_new'
      getFiles(storageKey).then(files => {
        if (files.length > 0) {
          const restoredFiles: UploadedFile[] = files.map(file => ({
            file,
            preview: {
              file_name: file.name,
              file_size: file.size,
              file_type: file.type
            }
          }))
          setUploadedFiles(restoredFiles)
        } else {
          setUploadedFiles([])
        }
      }).catch(err => {
        console.error('Error restoring files:', err)
        setUploadedFiles([])
      })
    } else {
      setUploadedFiles([])
    }
    setErrors({})
    setDeletedAttachmentIds([])
  }, [request, isOpen])

  const toggleSystem = (system: string) => {
    setFormData(prev => ({
      ...prev,
      affectedSystems: prev.affectedSystems.includes(system)
        ? prev.affectedSystems.filter(s => s !== system)
        : [...prev.affectedSystems, system]
    }))
  }

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      preview: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      }
    }))

    const updatedFiles = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updatedFiles)
    
    // Persist files to IndexedDB
    const storageKey = request?.id ? `work_request_form_${request.id}` : 'work_request_form_new'
    await saveFiles(storageKey, updatedFiles.map(uf => uf.file))
    
    e.target.value = ''
  }

  const handleRemoveUploadedFile = async (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(updatedFiles)
    
    // Update persisted files
    const storageKey = request?.id ? `work_request_form_${request.id}` : 'work_request_form_new'
    await saveFiles(storageKey, updatedFiles.map(uf => uf.file))
  }

  const handleRemoveExistingAttachment = (attachmentId: string) => {
    setDeletedAttachmentIds(prev => [...prev, attachmentId])
  }

  const handleUndoDeleteAttachment = (attachmentId: string) => {
    setDeletedAttachmentIds(prev => prev.filter(id => id !== attachmentId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be 255 characters or less'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.category.length === 0) {
      newErrors.category = 'Select at least one category'
    }

    if (formData.category.includes('other') && !formData.categoryOther.trim()) {
      newErrors.categoryOther = 'Please specify the other category'
    }

    if (formData.affectedSystems.length === 0) {
      newErrors.affectedSystems = 'Select at least one affected system'
    }

    const maxFileSize = 10 * 1024 * 1024
    uploadedFiles.forEach((uploadedFile, index) => {
      if (uploadedFile.file.size > maxFileSize) {
        newErrors[`file_${index}`] = `${uploadedFile.file.name} exceeds 10MB limit`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const submitData: Partial<WorkRequest> = {
      id: request?.id, // Include request ID for updates
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      categoryOther: formData.category.includes('other') ? formData.categoryOther.trim() : undefined,
      priority: formData.priority,
      urgency: formData.urgency,
      status: formData.status,
      affectedSystems: formData.affectedSystems,
      estimatedEmployeeImpact: formData.estimatedEmployeeImpact || undefined,
      complianceRelated: formData.complianceRelated || undefined,
      specificRequirements: formData.specificRequirements?.trim() || undefined,
      required_completion_date: formData.required_completion_date || undefined,
      estimatedDocumentCount: formData.estimatedDocumentCount || undefined,
      estimatedDataVolume: formData.estimatedDataVolume || undefined,
      longTermStorageRequired: formData.longTermStorageRequired || undefined,
      ongoingApiMonitoring: formData.ongoingApiMonitoring || undefined,
      ongoingSupportNeeded: formData.ongoingSupportNeeded || undefined,
      expectedFrequency: formData.expectedFrequency || undefined,
      integrationComplexity: formData.integrationComplexity || undefined,
      helixBridgeAccess: formData.helixBridgeAccess || undefined,
      currentPayrollSystem: formData.currentPayrollSystem?.trim() || undefined,
      currentHRIS: formData.currentHRIS?.trim() || undefined,
      currentVersion: formData.currentVersion?.trim() || undefined,
      currentIntegrationCount: formData.currentIntegrationCount || undefined,
      dataMigrationNeeded: formData.dataMigrationNeeded || undefined,
      currentPainPoints: formData.currentPainPoints?.trim() || undefined
    }

    if (request && deletedAttachmentIds.length > 0) {
      (submitData as any).deletedAttachmentIds = deletedAttachmentIds
    }
    
    const files = uploadedFiles.map(uf => uf.file)
    
    // Clear persisted data after successful save
    clearPersistedData()
    
    // Clear persisted files
    const storageKey = request?.id ? `work_request_form_${request.id}` : 'work_request_form_new'
    clearFiles(storageKey)
    
    onSave(submitData, files)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">Complete all required fields to submit your request</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            
            {/* Section 1: Basic Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Request Details</h3>
              </div>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                    <Tooltip text={fieldTooltips.title} />
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Configure year-end payroll tax reporting"
                    maxLength={255}
                    spellCheck={true}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Customer/Tenant Selection */}
                {(userRole === 'host_admin' || userRole === 'primary_customer_admin') && availableTenants.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer/Tenant <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCustomerId || ''}
                      onChange={(e: any) => onCustomerChange?.(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Customer/Tenant</option>
                      {availableTenants.map((tenant: any) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category - Multi-select */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                    <Tooltip text={fieldTooltips.category} />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <label key={cat.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.category.includes(cat.value)}
                          onChange={() => toggleCategory(cat.value)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  
                  {/* Other Category Text Field */}
                  {formData.category.includes('other') && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Please specify <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.categoryOther}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, categoryOther: e.target.value }))}
                        placeholder="Describe the other category"
                        spellCheck={true}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryOther ? 'border-red-500' : ''}`}
                      />
                      {errors.categoryOther && <p className="text-red-500 text-xs mt-1">{errors.categoryOther}</p>}
                    </div>
                  )}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Employee Impact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Impact
                      <Tooltip text={fieldTooltips.employeeImpact} />
                    </label>
                    <select
                      value={formData.estimatedEmployeeImpact}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, estimatedEmployeeImpact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select impact range</option>
                      {employeeImpactOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                      <Tooltip text={fieldTooltips.status} />
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Required Completion Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Completion Date
                      <Tooltip text={fieldTooltips.completionDate} />
                    </label>
                    <input
                      type="date"
                      value={formData.required_completion_date}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, required_completion_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                    <Tooltip text={fieldTooltips.description} />
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the issue, requirement, or change needed"
                    rows={3}
                    spellCheck={true}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Specific Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Requirements
                    <Tooltip text={fieldTooltips.specificRequirements} />
                  </label>
                  <textarea
                    value={formData.specificRequirements}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, specificRequirements: e.target.value }))}
                    placeholder="Any specific technical requirements or constraints"
                    rows={2}
                    spellCheck={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Systems & Compliance */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Systems & Compliance</h3>
              
              <div className="space-y-4">
                {/* Affected Systems */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affected Systems <span className="text-red-500">*</span>
                    <Tooltip text={fieldTooltips.affectedSystems} />
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {systemOptions.map((system) => (
                      <label
                        key={system.value}
                        className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 ${
                          formData.affectedSystems.includes(system.value) ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.affectedSystems.includes(system.value)}
                          onChange={() => toggleSystem(system.value)}
                          className="rounded"
                        />
                        <span className="text-sm">{system.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.affectedSystems && <p className="text-red-500 text-xs mt-1">{errors.affectedSystems}</p>}
                </div>

                {/* Compliance Related */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is this compliance-related?
                    <Tooltip text={fieldTooltips.complianceRelated} />
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="compliance"
                        value="yes"
                        checked={formData.complianceRelated === 'yes'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, complianceRelated: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">Yes - Compliance requirement</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="compliance"
                        value="no"
                        checked={formData.complianceRelated === 'no'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, complianceRelated: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                  {formData.complianceRelated === 'yes' && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        Compliance-related requests will be prioritized and may require additional documentation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Priority & Urgency */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Priority & Urgency</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority <span className="text-red-500">*</span>
                    <Tooltip text={fieldTooltips.priority} />
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low - Can wait for next sprint</option>
                    <option value="medium">Medium - Standard priority</option>
                    <option value="high">High - Important for operations</option>
                    <option value="critical">Critical - Blocking payroll/compliance</option>
                  </select>
                </div>
                
                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency <span className="text-red-500">*</span>
                    <Tooltip text={fieldTooltips.urgency} />
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low - No specific timeline</option>
                    <option value="medium">Medium - Within 30 days</option>
                    <option value="high">High - Within 7 days</option>
                    <option value="urgent">Urgent - Within 48 hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Current System Environment */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Current System Environment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Payroll System */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Payroll System
                    <Tooltip text={fieldTooltips.currentPayroll} />
                  </label>
                  <input
                    type="text"
                    value={formData.currentPayrollSystem || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, currentPayrollSystem: e.target.value }))}
                    placeholder="e.g., ADP, Paychex, Workday"
                    spellCheck={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Current HRIS/HCM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current HRIS/HCM System
                    <Tooltip text={fieldTooltips.currentHRIS} />
                  </label>
                  <input
                    type="text"
                    value={formData.currentHRIS || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, currentHRIS: e.target.value }))}
                    placeholder="e.g., Workday, SAP SuccessFactors"
                    spellCheck={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Current Version */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Version/Release
                    <Tooltip text={fieldTooltips.currentVersion} />
                  </label>
                  <input
                    type="text"
                    value={formData.currentVersion || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, currentVersion: e.target.value }))}
                    placeholder="e.g., 2024 R1, Version 8.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Number of Current Integrations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Current Integrations
                    <Tooltip text={fieldTooltips.currentIntegrations} />
                  </label>
                  <select
                    value={formData.currentIntegrationCount || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, currentIntegrationCount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select count</option>
                    <option value="0">None</option>
                    <option value="1-2">1-2 integrations</option>
                    <option value="3-5">3-5 integrations</option>
                    <option value="6-10">6-10 integrations</option>
                    <option value="10+">10+ integrations</option>
                  </select>
                </div>

                {/* Data Migration Needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Migration Required?
                    <Tooltip text={fieldTooltips.dataMigration} />
                  </label>
                  <select
                    value={formData.dataMigrationNeeded || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, dataMigrationNeeded: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select option</option>
                    <option value="no">No</option>
                    <option value="partial">Partial migration</option>
                    <option value="full">Full migration</option>
                  </select>
                </div>

                {/* Current Pain Points */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Pain Points
                    <Tooltip text={fieldTooltips.painPoints} />
                  </label>
                  <textarea
                    value={formData.currentPainPoints || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, currentPainPoints: e.target.value }))}
                    placeholder="Describe issues with current system"
                    rows={2}
                    spellCheck={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Scope Estimation */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Scope Estimation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Document Count
                    <Tooltip text={fieldTooltips.documentCount} />
                  </label>
                  <select
                    value={formData.estimatedDocumentCount}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, estimatedDocumentCount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select range</option>
                    {documentCountOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Data Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Data Volume
                    <Tooltip text={fieldTooltips.dataVolume} />
                  </label>
                  <select
                    value={formData.estimatedDataVolume}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, estimatedDataVolume: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select range</option>
                    {dataVolumeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Long-term Storage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long-term Storage Required?
                    <Tooltip text={fieldTooltips.longTermStorage} />
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="storage"
                        value="yes"
                        checked={formData.longTermStorageRequired === 'yes'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, longTermStorageRequired: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="storage"
                        value="no"
                        checked={formData.longTermStorageRequired === 'no'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, longTermStorageRequired: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>

                {/* Ongoing API Monitoring */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ongoing API Monitoring Required?
                    <Tooltip text={fieldTooltips.apiMonitoring} />
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="apiMonitoring"
                        value="yes"
                        checked={formData.ongoingApiMonitoring === 'yes'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, ongoingApiMonitoring: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="apiMonitoring"
                        value="no"
                        checked={formData.ongoingApiMonitoring === 'no'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, ongoingApiMonitoring: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>

                {/* Ongoing Support Needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ongoing Support Needed?
                    <Tooltip text={fieldTooltips.ongoingSupport} />
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ongoingSupport"
                        value="yes"
                        checked={formData.ongoingSupportNeeded === 'yes'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, ongoingSupportNeeded: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ongoingSupport"
                        value="no"
                        checked={formData.ongoingSupportNeeded === 'no'}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, ongoingSupportNeeded: e.target.value }))}
                        className="rounded"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>

                {/* Expected Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Frequency
                    <Tooltip text={fieldTooltips.frequency} />
                  </label>
                  <select
                    value={formData.expectedFrequency}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, expectedFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select frequency</option>
                    {frequencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Integration Complexity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Integration Complexity
                    <Tooltip text={fieldTooltips.integrationComplexity} />
                  </label>
                  <select
                    value={formData.integrationComplexity}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, integrationComplexity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select complexity</option>
                    {integrationComplexityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HelixBridge Access */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Will organization require access to HelixBridge?
                  <Tooltip text={fieldTooltips.helixBridgeAccess} />
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="helixBridgeAccess"
                      value="yes"
                      checked={formData.helixBridgeAccess === 'yes'}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, helixBridgeAccess: e.target.value }))}
                      className="rounded"
                    />
                    <span className="text-sm">Yes - Platform access needed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="helixBridgeAccess"
                      value="no"
                      checked={formData.helixBridgeAccess === 'no'}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, helixBridgeAccess: e.target.value }))}
                      className="rounded"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 6: Attachments */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Supporting Documents</h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload supporting documents or screenshots</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-modal"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('file-upload-modal')?.click()}
                >
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, XLS, XLSX, CSV, PNG, JPG (Max 10MB each)
                </p>
              </div>

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Files</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {existingAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={`flex items-center justify-between p-2 border rounded-md ${
                          deletedAttachmentIds.includes(attachment.id!) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.file_size)}
                            </p>
                          </div>
                        </div>
                        {deletedAttachmentIds.includes(attachment.id!) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUndoDeleteAttachment(attachment.id!)}
                          >
                            Undo
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExistingAttachment(attachment.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Files to Upload</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <File className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadedFile.preview?.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(uploadedFile.preview?.file_size || 0)}
                            </p>
                            {errors[`file_${index}`] && (
                              <p className="text-xs text-red-500 mt-1">{errors[`file_${index}`]}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUploadedFile(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {request ? 'Update Request' : 'Create Request'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default WorkRequestForm
