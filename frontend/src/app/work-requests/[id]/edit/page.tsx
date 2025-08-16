'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, X, Calendar, DollarSign, Clock, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface FormData {
  title: string
  description: string
  category: string
  priority: string
  urgency: string
  estimatedHours: string
  budget: string
  requiredCompletionDate: string
  tags: string[]
  attachments: File[]
}

interface WorkRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  urgency: string
  status: string
  estimatedHours?: number
  budget?: number
  requiredCompletionDate?: string
  tags: string[]
  attachments: Array<{
    id: string
    filename: string
    size: number
  }>
  submittedAt: string
  updatedAt: string
}

const categories = [
  { value: 'payroll_setup', label: 'Payroll Setup' },
  { value: 'data_migration', label: 'Data Migration' },
  { value: 'system_integration', label: 'System Integration' },
  { value: 'reporting_setup', label: 'Reporting Setup' },
  { value: 'benefits_configuration', label: 'Benefits Configuration' },
  { value: 'compliance_audit', label: 'Compliance Audit' },
  { value: 'training_support', label: 'Training Support' },
  { value: 'custom_development', label: 'Custom Development' },
  { value: 'other', label: 'Other' }
]

const priorities = [
  { value: 'low', label: 'Low', description: 'Can be completed when resources are available' },
  { value: 'medium', label: 'Medium', description: 'Standard business priority' },
  { value: 'high', label: 'High', description: 'Important for business operations' },
  { value: 'critical', label: 'Critical', description: 'Urgent business need' }
]

const urgencies = [
  { value: 'low', label: 'Low', description: 'No specific timeline' },
  { value: 'medium', label: 'Medium', description: 'Within next month' },
  { value: 'high', label: 'High', description: 'Within next week' },
  { value: 'urgent', label: 'Urgent', description: 'Within 24-48 hours' }
]

// Mock data for demonstration
const mockRequest: WorkRequest = {
  id: '1',
  title: 'Payroll System Integration',
  description: 'We need to integrate our existing payroll system with the new HRIS platform. This includes data migration, API setup, and testing to ensure seamless operation.',
  category: 'system_integration',
  priority: 'high',
  urgency: 'medium',
  status: 'submitted',
  estimatedHours: 40,
  budget: 8000,
  requiredCompletionDate: '2024-08-30',
  tags: ['payroll', 'integration', 'hris', 'api'],
  attachments: [
    { id: '1', filename: 'system_requirements.pdf', size: 2048000 },
    { id: '2', filename: 'current_payroll_schema.xlsx', size: 512000 }
  ],
  submittedAt: '2024-08-10T09:00:00Z',
  updatedAt: '2024-08-12T14:30:00Z'
}

export default function EditWorkRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const [request, setRequest] = useState<WorkRequest>(mockRequest)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    priority: '',
    urgency: '',
    estimatedHours: '',
    budget: '',
    requiredCompletionDate: '',
    tags: [],
    attachments: []
  })
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canEdit, setCanEdit] = useState(true)

  useEffect(() => {
    // Load request data and populate form
    if (request) {
      setFormData({
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority,
        urgency: request.urgency,
        estimatedHours: request.estimatedHours?.toString() || '',
        budget: request.budget?.toString() || '',
        requiredCompletionDate: request.requiredCompletionDate || '',
        tags: [...request.tags],
        attachments: []
      })
      
      // Check if request can be edited (only submitted or under_review)
      setCanEdit(['submitted', 'under_review'].includes(request.status))
    }
  }, [request])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const removeExistingAttachment = (attachmentId: string) => {
    // In real implementation, this would mark for deletion
    alert(`Remove attachment ${attachmentId} - would be implemented with API call`)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canEdit) {
      alert('This request cannot be edited in its current status')
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the request - FIX: Don't spread formData.attachments into request.attachments
      setRequest(prev => ({
        ...prev,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        urgency: formData.urgency,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        requiredCompletionDate: formData.requiredCompletionDate,
        tags: formData.tags,
        // Keep existing attachments structure - don't mix with File objects
        updatedAt: new Date().toISOString()
      }))
      
      alert('Work request updated successfully!')
      
      // Redirect back to request details
      window.location.href = `/work-requests/${request.id}`
      
    } catch (error) {
      alert('Error updating request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!canEdit) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/work-requests/${request.id}`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Request
              </Button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Cannot Edit Request</h2>
              <p className="text-gray-600 mb-4">
                This request cannot be edited because it has status: <strong>{request.status.replace('_', ' ').toUpperCase()}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Requests can only be edited when they have "Submitted" or "Under Review" status.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = `/work-requests/${request.id}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Request
            </Button>
          </div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Work Request</h1>
            <p className="text-gray-600">Update your work request details. Changes will be saved and reviewed by our team.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief, descriptive title for your request"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Provide detailed information about what you need, including any specific requirements, constraints, or expectations"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Completion Date
                    </label>
                    <input
                      type="date"
                      value={formData.requiredCompletionDate}
                      onChange={(e) => handleInputChange('requiredCompletionDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Priority and Urgency */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority & Urgency</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level *</label>
                  <div className="space-y-2">
                    {priorities.map(priority => (
                      <label key={priority.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{priority.label}</div>
                          <div className="text-sm text-gray-600">{priority.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level *</label>
                  <div className="space-y-2">
                    {urgencies.map(urgency => (
                      <label key={urgency.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="urgency"
                          value={urgency.value}
                          checked={formData.urgency === urgency.value}
                          onChange={(e) => handleInputChange('urgency', e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{urgency.label}</div>
                          <div className="text-sm text-gray-600">{urgency.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget and Time Estimates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Time Estimates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="number"
                      min="1"
                      value={formData.estimatedHours}
                      onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How many hours do you estimate?"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your budget for this project"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add tags to help categorize your request"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add Tag
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Existing Attachments */}
            {request.attachments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Attachments</h2>
                
                <div className="space-y-3">
                  {request.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Upload className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-xs text-gray-600">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExistingAttachment(attachment.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Attachments */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Attachments</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG. Max 10MB per file.
                  </p>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">New files to upload:</p>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Upload className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `/work-requests/${request.id}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

