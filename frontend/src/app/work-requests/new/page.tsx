'use client'

import { useState, useRef } from 'react'
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

// Generate a valid UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

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
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const triggerFileUpload = () => {
    console.log('File upload clicked')
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    console.log('Files selected:', files.length)
    
    if (files.length === 0) return

    // Simple validation
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }))

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 REAL DATABASE SUBMISSION STARTED!')
    console.log('📝 Form data:', formData)

    // Basic validation
    if (!formData.title.trim()) {
      setMessage('Title is required')
      setSubmitStatus('error')
      return
    }

    if (!formData.description.trim()) {
      setMessage('Description is required')
      setSubmitStatus('error')
      return
    }

    if (!formData.category) {
      setMessage('Category is required')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setMessage('Connecting to Supabase database...')

    try {
      console.log('🔗 Attempting Supabase connection...')
      
      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase
        .from('work_requests')
        .select('count', { count: 'exact', head: true })
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError)
        throw new Error(`Database connection failed: ${testError.message}`)
      }
      
      console.log('✅ Supabase connection successful!')
      setMessage('Connected to database, saving request...')

      // Get current user (or generate demo UUID)
      let userId = generateUUID() // Generate a valid UUID for demo user
      let userEmail = 'demo@example.com'
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (user && !userError) {
          userId = user.id
          userEmail = user.email || 'unknown@example.com'
          console.log('👤 Using authenticated user:', userEmail, 'ID:', userId)
        } else {
          console.log('👤 Using demo user with generated UUID:', userId)
        }
      } catch (authError) {
        console.log('👤 Auth failed, using demo user with UUID:', userId, authError)
      }

      // Prepare the work request data
      const workRequestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        urgency: formData.urgency,
        status: 'submitted',
        customer_id: userId, // Now using proper UUID
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        required_completion_date: formData.requiredCompletionDate || null,
        tenant_id: generateUUID(), // Generate UUID for tenant as well
        internal_notes: formData.tags.join(', '), // Store tags as notes for now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('💾 Inserting into work_requests table:', workRequestData)
      console.log('🔑 Using customer_id (UUID):', userId)
      console.log('🏢 Using tenant_id (UUID):', workRequestData.tenant_id)

      // Insert into work_requests table
      const { data: insertedRequest, error: insertError } = await supabase
        .from('work_requests')
        .insert([workRequestData])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Database insert failed:', insertError)
        console.error('❌ Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        throw new Error(`Failed to save request: ${insertError.message}`)
      }

      console.log('✅ Successfully inserted into database:', insertedRequest)
      
      const requestId = insertedRequest.id
      setMessage(`Request saved to database with ID: ${requestId}`)

      // Handle file uploads if any
      if (formData.attachments.length > 0) {
        console.log('📎 Uploading files to Supabase Storage...')
        setMessage(`Request saved! Uploading ${formData.attachments.length} files...`)
        
        for (const file of formData.attachments) {
          try {
            const fileName = `${requestId}/${Date.now()}-${file.name}`
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('work-request-attachments')
              .upload(fileName, file)

            if (uploadError) {
              console.error('⚠️ File upload failed:', uploadError)
              // Continue with other files
            } else {
              console.log('✅ File uploaded:', fileName)
            }
          } catch (fileError) {
            console.error('⚠️ File upload error:', fileError)
            // Continue with other files
          }
        }
      }

      // Success!
      setSubmitStatus('success')
      setMessage(`✅ Work request "${formData.title}" saved to database successfully! Request ID: ${requestId}`)

      console.log('🎉 SUBMISSION COMPLETED SUCCESSFULLY!')
      console.log('📊 Request ID:', requestId)
      console.log('👤 Created by:', userEmail)
      console.log('🔑 Customer UUID:', userId)

      // Redirect after success
      setTimeout(() => {
        console.log('🔄 Redirecting to work requests list...')
        window.location.href = '/work-requests'
      }, 3000)

    } catch (error) {
      console.error('❌ SUBMISSION FAILED:', error)
      setSubmitStatus('error')
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessage(`Database save failed: ${errorMessage}`)
      
      // Also save to localStorage as backup
      try {
        console.log('💾 Saving to localStorage as backup...')
        const backupRequest = {
          id: `backup-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString(),
          createdBy: 'Backup Save',
          source: 'database-failed-backup'
        }
        
        const existing = localStorage.getItem('etla_work_requests')
        const requests = existing ? JSON.parse(existing) : []
        requests.push(backupRequest)
        localStorage.setItem('etla_work_requests', JSON.stringify(requests))
        
        setMessage(`${errorMessage} - Saved to localStorage as backup.`)
      } catch (backupError) {
        console.error('❌ Backup save also failed:', backupError)
      }
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

          {/* Database Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Real Database Integration - UUID Fixed</p>
                <p className="text-green-700">This form saves directly to your Supabase work_requests table with proper UUID format</p>
                <p className="text-xs text-green-600">Using environment variables: NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_TOKEN</p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Database Save Successful!</p>
                <p className="text-sm">{message}</p>
                <p className="text-xs mt-1">Check your Supabase work_requests table. Redirecting...</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Database Save Failed</p>
                <p className="text-sm">{message}</p>
                <p className="text-xs mt-1">Check browser console for detailed error information</p>
              </div>
            </div>
          )}

          {isSubmitting && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <div>
                <p className="font-medium">Saving to Database...</p>
                <p className="text-sm">{message}</p>
                <p className="text-xs mt-1">Check browser console for real-time progress</p>
              </div>
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

          {/* Supporting Documents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload files to support your request</p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
              />
              
              <button
                type="button"
                onClick={triggerFileUpload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                  Saving to Database...
                </>
              ) : (
                'Submit to Database'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

