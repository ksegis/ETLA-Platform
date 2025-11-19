'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, File, Trash2, AlertCircle, Calendar, DollarSign, Clock, Users, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Types matching the database schema with new fields
interface WorkRequestFormData {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  business_justification: string
  impact_assessment: string
  budget: string
  estimated_budget: string
  required_completion_date: string
  requested_completion_date: string
  estimated_hours: string
  risk_level?: 'low' | 'medium' | 'high'
  impact_level?: 'operational' | 'customer' | 'financial' | 'compliance' | 'security'
  dependencies?: string
  stakeholders?: string
  success_criteria?: string
}

interface WorkRequest {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  business_justification?: string
  impact_assessment?: string
  budget?: number
  estimated_budget?: number
  required_completion_date?: string
  requested_completion_date?: string
  estimated_hours?: number
  tenant_id: string
  customer_id?: string
  created_at: string
  updated_at: string
  attachments?: WorkRequestAttachment[]
  risk_level?: string
  impact_level?: string
  dependencies?: string
  stakeholders?: string
  success_criteria?: string
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
    category: '',
    priority: 'medium',
    urgency: 'medium',
    status: 'submitted',
    business_justification: '',
    impact_assessment: '',
    budget: '',
    estimated_budget: '',
    required_completion_date: '',
    requested_completion_date: '',
    estimated_hours: '',
    risk_level: 'low',
    impact_level: 'operational',
    dependencies: '',
    stakeholders: '',
    success_criteria: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [existingAttachments, setExistingAttachments] = useState<WorkRequestAttachment[]>([])
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([])

  // Reset form when modal opens/closes or request changes
  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || '',
        description: request.description || '',
        category: request.category || '',
        priority: (request.priority as any) || 'medium',
        urgency: (request.urgency as any) || 'medium',
        status: (request.status as any) || 'submitted',
        business_justification: request.business_justification || '',
        impact_assessment: request.impact_assessment || '',
        budget: request.budget?.toString() || '',
        estimated_budget: request.estimated_budget?.toString() || '',
        required_completion_date: request.required_completion_date || '',
        requested_completion_date: request.requested_completion_date || '',
        estimated_hours: request.estimated_hours?.toString() || '',
        risk_level: (request.risk_level as any) || 'low',
        impact_level: (request.impact_level as any) || 'operational',
        dependencies: request.dependencies || '',
        stakeholders: request.stakeholders || '',
        success_criteria: request.success_criteria || ''
      })
      setExistingAttachments(request.attachments || [])
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        urgency: 'medium',
        status: 'submitted',
        business_justification: '',
        impact_assessment: '',
        budget: '',
        estimated_budget: '',
        required_completion_date: '',
        requested_completion_date: '',
        estimated_hours: '',
        risk_level: 'low',
        impact_level: 'operational',
        dependencies: '',
        stakeholders: '',
        success_criteria: ''
      })
      setExistingAttachments([])
    }
    setErrors({})
    setUploadedFiles([])
    setDeletedAttachmentIds([])
  }, [request, isOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadedFiles(prev => [...prev, ...newFiles])
    e.target.value = ''
  }

  const handleRemoveUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
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

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number'
    }

    if (formData.estimated_budget && isNaN(parseFloat(formData.estimated_budget))) {
      newErrors.estimated_budget = 'Estimated budget must be a valid number'
    }

    if (formData.estimated_hours && isNaN(parseInt(formData.estimated_hours))) {
      newErrors.estimated_hours = 'Estimated hours must be a valid number'
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
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      priority: formData.priority,
      urgency: formData.urgency,
      status: formData.status,
      business_justification: formData.business_justification.trim() || undefined,
      impact_assessment: formData.impact_assessment.trim() || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : undefined,
      required_completion_date: formData.required_completion_date || undefined,
      requested_completion_date: formData.requested_completion_date || undefined,
      estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
      risk_level: formData.risk_level,
      impact_level: formData.impact_level,
      dependencies: formData.dependencies?.trim() || undefined,
      stakeholders: formData.stakeholders?.trim() || undefined,
      success_criteria: formData.success_criteria?.trim() || undefined
    }

    if (request && deletedAttachmentIds.length > 0) {
      (submitData as any).deletedAttachmentIds = deletedAttachmentIds
    }
    
    const files = uploadedFiles.map(uf => uf.file)
    onSave(submitData, files)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">Complete all required fields to submit your request</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-8 py-6">
          <div className="space-y-8">
            
            {/* Section 1: Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief, descriptive title for the work request"
                    maxLength={255}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {(userRole === 'host_admin' || userRole === 'primary_customer_admin') && availableTenants.length > 0 && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Category</option>
                    <option value="development">Development</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="security">Security</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="enhancement">Enhancement</option>
                    <option value="support">Support</option>
                    <option value="training_support">Training Support</option>
                    <option value="database">Database</option>
                    <option value="web_development">Web Development</option>
                    <option value="request_for_quote">Request for Quote</option>
                    <option value="general">General</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
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
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of what needs to be done"
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Priority and Risk */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Priority and Risk Assessment</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={formData.risk_level}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, risk_level: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impact Area
                  </label>
                  <select
                    value={formData.impact_level}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, impact_level: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="operational">Operational</option>
                    <option value="customer">Customer-Facing</option>
                    <option value="financial">Financial</option>
                    <option value="compliance">Compliance</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impact Assessment
                  </label>
                  <textarea
                    value={formData.impact_assessment}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, impact_assessment: e.target.value }))}
                    placeholder="Describe the potential impact if this request is not fulfilled"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Scope and Requirements */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Scope and Requirements</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Justification
                  </label>
                  <textarea
                    value={formData.business_justification}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, business_justification: e.target.value }))}
                    placeholder="Explain the business need and expected benefits"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dependencies
                  </label>
                  <textarea
                    value={formData.dependencies}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, dependencies: e.target.value }))}
                    placeholder="List any dependencies or prerequisites (systems, approvals, other projects)"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stakeholders
                  </label>
                  <Input
                    value={formData.stakeholders}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, stakeholders: e.target.value }))}
                    placeholder="Key stakeholders or departments involved"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Criteria
                  </label>
                  <textarea
                    value={formData.success_criteria}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, success_criteria: e.target.value }))}
                    placeholder="What determines this request is successfully completed?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Budget and Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Budget and Timeline</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={errors.budget ? 'border-red-500' : ''}
                  />
                  {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Budget
                  </label>
                  <Input
                    type="number"
                    value={formData.estimated_budget}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, estimated_budget: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={errors.estimated_budget ? 'border-red-500' : ''}
                  />
                  {errors.estimated_budget && <p className="text-red-500 text-xs mt-1">{errors.estimated_budget}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <Input
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="1"
                    className={errors.estimated_hours ? 'border-red-500' : ''}
                  />
                  {errors.estimated_hours && <p className="text-red-500 text-xs mt-1">{errors.estimated_hours}</p>}
                </div>
                
                <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Completion Date
                    </label>
                    <Input
                      type="date"
                      value={formData.required_completion_date}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, required_completion_date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requested Completion Date
                    </label>
                    <Input
                      type="date"
                      value={formData.requested_completion_date}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, requested_completion_date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Attachments */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <File className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Document Attachments</h3>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Maximum file size: 10MB per file
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    id="file-upload-input"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                </div>
              </div>

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Attachments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {existingAttachments.map((attachment) => {
                      const isMarkedForDeletion = deletedAttachmentIds.includes(attachment.id!)
                      return (
                        <div
                          key={attachment.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            isMarkedForDeletion ? 'bg-red-50 border-red-300 opacity-50' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <File className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isMarkedForDeletion ? 'line-through' : ''}`}>
                                {attachment.file_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.file_size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {isMarkedForDeletion ? (
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
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Newly Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">New Files to Upload</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <File className="h-5 w-5 text-green-500 flex-shrink-0" />
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
                          className="ml-2"
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
        <div className="flex justify-end space-x-3 px-8 py-6 border-t bg-gray-50">
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