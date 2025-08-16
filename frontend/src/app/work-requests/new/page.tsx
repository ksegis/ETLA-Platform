'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, X, Calendar, DollarSign, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'

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

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  tenant_id?: string
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

export default function NewWorkRequestPage() {
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

  const [currentTag, setCurrentTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        console.error('No authenticated user:', error)
        setIsLoading(false)
        return
      }

      // Try to get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser(profile)
      } else {
        // Fallback to auth user metadata
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          first_name: authUser.user_metadata?.first_name || 'Unknown',
          last_name: authUser.user_metadata?.last_name || 'User',
          role: 'client_user',
          tenant_id: authUser.user_metadata?.tenant_id
        })
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // Validate file size (10MB max) and type
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      
      // Allow common file types
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'text/plain'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has unsupported format. Please use PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, or TXT files.`)
        return false
      }
      
      return true
    })

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.priority) newErrors.priority = 'Priority is required'
    if (!formData.urgency) newErrors.urgency = 'Urgency is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFiles = async (workRequestId: string) => {
    const uploadedFiles = []

    for (const file of formData.attachments) {
      try {
        // Create a safe filename
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const fileName = `${workRequestId}/${timestamp}_${randomId}.${fileExt}`
        
        console.log(`Uploading file: ${file.name} (${file.type}) as ${fileName}`)
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('work-request-attachments')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('File upload error:', error)
          alert(`Failed to upload ${file.name}: ${error.message}`)
          continue
        }

        console.log('File uploaded successfully:', data)

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('work-request-attachments')
          .getPublicUrl(fileName)

        uploadedFiles.push({
          filename: file.name,
          file_path: fileName,
          file_url: publicUrl,
          file_size: file.size,
          content_type: file.type
        })
      } catch (error) {
        console.error('Error uploading file:', file.name, error)
        alert(`Error uploading ${file.name}: ${error}`)
      }
    }

    return uploadedFiles
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!user) {
      alert('You must be logged in to submit a work request')
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('Submitting work request...')
      
      // Insert work request into database
      const { data: workRequest, error: requestError } = await supabase
        .from('work_requests')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          urgency: formData.urgency,
          estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          required_completion_date: formData.requiredCompletionDate || null,
          status: 'submitted',
          customer_id: user.id,
          tenant_id: user.tenant_id,
          actual_hours: 0
        })
        .select()
        .single()

      if (requestError) {
        console.error('Database error:', requestError)
        throw requestError
      }

      console.log('Work request created:', workRequest)

      // Upload files if any (but don't fail the whole submission if files fail)
      let uploadedFiles = []
      if (formData.attachments.length > 0) {
        try {
          uploadedFiles = await uploadFiles(workRequest.id)
          console.log('Files uploaded:', uploadedFiles)
          
          // Insert file records into database
          if (uploadedFiles.length > 0) {
            const { error: filesError } = await supabase
              .from('work_request_attachments')
              .insert(
                uploadedFiles.map(file => ({
                  work_request_id: workRequest.id,
                  ...file
                }))
              )

            if (filesError) {
              console.error('Error saving file records:', filesError)
            }
          }
        } catch (fileError) {
          console.error('File upload failed, but continuing with submission:', fileError)
        }
      }

      // Insert tags if any
      if (formData.tags.length > 0) {
        try {
          const { error: tagsError } = await supabase
            .from('work_request_tags')
            .insert(
              formData.tags.map(tag => ({
                work_request_id: workRequest.id,
                tag_name: tag
              }))
            )

          if (tagsError) {
            console.error('Error saving tags:', tagsError)
          }
        } catch (tagError) {
          console.error('Tag save failed, but continuing:', tagError)
        }
      }

      alert('Work request submitted successfully!')
      
      // Redirect to requests page
      window.location.href = '/work-requests'
      
    } catch (error) {
      console.error('Error submitting work request:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert(`Error submitting work request: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">You must be logged in to submit a work request.</p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
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
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/work-requests'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Submit New Work Request</h1>
            <p className="text-gray-600">Provide details about the work you need completed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Created by: {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">Role: {user.role.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Brief, descriptive title for your request"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Provide detailed information about what you need, including specific requirements, goals, and any relevant background information"
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
            </div>

            {/* Priority and Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority and Timeline</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Priority Level *
                  </label>
                  <div className="space-y-2">
                    {priorities.map(priority => (
                      <label key={priority.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
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
                  {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Urgency *
                  </label>
                  <div className="space-y-2">
                    {urgencies.map(urgency => (
                      <label key={urgency.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
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
                  {errors.urgency && <p className="text-red-600 text-sm mt-1">{errors.urgency}</p>}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 40"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Budget Range
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
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

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add tags to help categorize your request"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add Tag
                  </Button>
                </div>
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
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload files to support your request</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, TXT (Max 10MB each)
                  </p>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">{formatFileSize(file.size)} • {file.type}</p>
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
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.location.href = '/work-requests'}
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
      </div>
    </DashboardLayout>
  )
}

