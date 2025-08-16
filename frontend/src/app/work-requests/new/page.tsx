'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'

interface FormData {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  estimatedHours: string
  budget: string
  requiredCompletionDate: string
  tags: string[]
  attachments: File[]
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

export default function NewWorkRequestPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    urgency: 'medium',
    estimatedHours: '',
    budget: '',
    requiredCompletionDate: '',
    tags: [],
    attachments: []
  })

  const [currentTag, setCurrentTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
      } else {
        // Demo user for testing
        setUser({
          id: 'demo-user-' + Date.now(),
          email: 'demo@company.com',
          user_metadata: {
            first_name: 'Demo',
            last_name: 'User'
          }
        })
      }
    } catch (error) {
      console.error('Error loading user:', error)
      // Fallback to demo user
      setUser({
        id: 'demo-user-' + Date.now(),
        email: 'demo@company.com',
        user_metadata: {
          first_name: 'Demo',
          last_name: 'User'
        }
      })
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const triggerFileUpload = () => {
    console.log('Triggering file upload...')
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered', event.target.files)
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) {
      return
    }

    // Validate files
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'text/plain'
      ]
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported format.`)
        return false
      }
      
      return true
    })

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }))

    // Clear the input
    if (event.target) {
      event.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required'
    if (!formData.description.trim()) return 'Description is required'
    if (!formData.category) return 'Category is required'
    if (formData.estimatedHours && isNaN(Number(formData.estimatedHours))) {
      return 'Estimated hours must be a valid number'
    }
    if (formData.budget && isNaN(Number(formData.budget))) {
      return 'Budget must be a valid number'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setErrorMessage(validationError)
      setSubmitStatus('error')
      return
    }

    if (!user) {
      setErrorMessage('User not found. Please refresh the page.')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    setSuccessMessage('')

    try {
      console.log('Starting form submission...')
      
      // Create the work request data
      const workRequestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        urgency: formData.urgency,
        status: 'submitted',
        customer_id: user.id,
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        budget: formData.budget ? parseInt(formData.budget) : null,
        required_completion_date: formData.requiredCompletionDate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Submitting work request data:', workRequestData)

      // Insert into database
      const { data: workRequest, error: insertError } = await supabase
        .from('work_requests')
        .insert([workRequestData])
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        throw new Error(`Database error: ${insertError.message}`)
      }

      console.log('Work request created successfully:', workRequest)

      // Handle tags if any
      if (formData.tags.length > 0 && workRequest) {
        console.log('Inserting tags...')
        const tagData = formData.tags.map(tag => ({
          work_request_id: workRequest.id,
          tag_name: tag
        }))

        const { error: tagError } = await supabase
          .from('work_request_tags')
          .insert(tagData)

        if (tagError) {
          console.warn('Tag insertion failed:', tagError)
          // Don't fail the whole submission for tag errors
        }
      }

      // Handle file attachments if any
      if (formData.attachments.length > 0 && workRequest) {
        console.log('Processing file attachments...')
        for (const file of formData.attachments) {
          try {
            const fileName = `${workRequest.id}/${Date.now()}-${file.name}`
            
            const { error: uploadError } = await supabase.storage
              .from('work-request-attachments')
              .upload(fileName, file)

            if (uploadError) {
              console.warn('File upload failed:', uploadError)
              continue // Skip this file but don't fail the submission
            }

            // Save file metadata
            const { error: metadataError } = await supabase
              .from('work_request_attachments')
              .insert([{
                work_request_id: workRequest.id,
                filename: file.name,
                file_path: fileName,
                file_size: file.size,
                mime_type: file.type
              }])

            if (metadataError) {
              console.warn('File metadata save failed:', metadataError)
            }
          } catch (fileError) {
            console.warn('File processing error:', fileError)
          }
        }
      }

      // Success!
      setSubmitStatus('success')
      setSuccessMessage(`Work request "${formData.title}" has been submitted successfully! Request ID: ${workRequest.id}`)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/work-requests'
      }, 3000)

    } catch (error) {
      console.error('Submission error:', error)
      let errorMsg = 'Failed to submit work request. Please try again.'
      
      if (error instanceof Error) {
        errorMsg = error.message
      }
      
      setErrorMessage(errorMsg)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/work-requests'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Work Request</h1>
              <p className="text-gray-600">Submit a new work request for processing</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Created by</p>
                  <p className="text-blue-700">
                    {user.user_metadata?.first_name} {user.user_metadata?.last_name} ({user.email})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {submitStatus === 'success' && successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Success!</p>
                <p className="text-sm">{successMessage}</p>
                <p className="text-sm mt-1">Redirecting to requests list in 3 seconds...</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {isSubmitting && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2 flex-shrink-0"></div>
              <p>Submitting your work request to the database...</p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your request"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed information about your request"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Priority and Urgency */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority and Urgency</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low', desc: 'Standard business priority' },
                    { value: 'medium', label: 'Medium', desc: 'Important for business operations' },
                    { value: 'high', label: 'High', desc: 'Important for business operations' },
                    { value: 'critical', label: 'Critical', desc: 'Urgent business need' }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={option.value}
                        checked={formData.priority === option.value}
                        onChange={(e) => handleInputChange('priority', e.target.value as any)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level</label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low', desc: 'Within next month' },
                    { value: 'medium', label: 'Medium', desc: 'Within next two weeks' },
                    { value: 'high', label: 'High', desc: 'Within next week' },
                    { value: 'urgent', label: 'Urgent', desc: 'Within 24-48 hours' }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value={option.value}
                        checked={formData.urgency === option.value}
                        onChange={(e) => handleInputChange('urgency', e.target.value as any)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Estimated Hours
                </label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Budget Range
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="4000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Required Completion
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

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="migration"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Supporting Documents - SINGLE UPLOAD BUTTON */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload files to support your request</p>
              
              {/* SINGLE FILE INPUT - Hidden */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
              />
              
              {/* SINGLE UPLOAD BUTTON */}
              <button
                type="button"
                onClick={triggerFileUpload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, TXT (Max 10MB each)
              </p>
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Selected Files ({formData.attachments.length}):</h3>
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.location.href = '/work-requests'}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

