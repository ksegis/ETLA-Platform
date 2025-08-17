'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Plus, AlertCircle, CheckCircle, Database, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'

interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  file: File
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    urgency: 'medium',
    estimatedHours: '',
    budget: '',
    requiredCompletionDate: '',
    tags: [] as string[],
    attachments: [] as FileUpload[]
  })

  const [currentTag, setCurrentTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [userTenantId, setUserTenantId] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Generate UUID for demo purposes when not authenticated
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Handle authentication and tenant lookup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...')
        setAuthStatus('loading')
        
        // First, check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setAuthStatus('unauthenticated')
          setSubmitMessage('Session error. Please try logging in again.')
          return
        }

        if (!session) {
          console.warn('⚠️ No active session found')
          setAuthStatus('unauthenticated')
          setSubmitMessage('No active session. Please log in to submit work requests.')
          return
        }

        console.log('✅ Active session found')
        
        // Now get the user from the session
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('❌ User error:', userError)
          setAuthStatus('unauthenticated')
          setSubmitMessage('Authentication error. Please log in again.')
          return
        }

        if (!user) {
          console.warn('⚠️ No user found in session')
          setAuthStatus('unauthenticated')
          setSubmitMessage('No user found. Please log in to submit work requests.')
          return
        }

        console.log('👤 Authenticated user:', user.email, 'ID:', user.id)
        setCurrentUser(user)
        setAuthStatus('authenticated')

        // Now look up tenant_id for authenticated user
        console.log('🔍 Looking up user tenant_id...')
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenant_users')
          .select('tenant_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (tenantError) {
          console.error('❌ Error fetching tenant_id:', tenantError)
          setSubmitMessage('Warning: Could not determine tenant association. Please contact support.')
        } else if (tenantData) {
          console.log('🏢 User tenant_id:', tenantData.tenant_id)
          setUserTenantId(tenantData.tenant_id)
          console.log('✅ Tenant lookup completed successfully')
          setSubmitMessage('') // Clear any previous error messages
        } else {
          console.warn('⚠️ User not associated with any tenant')
          setSubmitMessage('Warning: User not associated with any tenant. Please contact support.')
        }

      } catch (error) {
        console.error('❌ Error in authentication/tenant lookup:', error)
        setAuthStatus('unauthenticated')
        setSubmitMessage('Unexpected error during authentication. Please refresh and try again.')
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        initializeAuth()
      } else if (event === 'SIGNED_OUT') {
        setAuthStatus('unauthenticated')
        setCurrentUser(null)
        setUserTenantId(null)
        setSubmitMessage('Please log in to submit work requests.')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePriorityChange = (priority: string) => {
    setFormData(prev => ({
      ...prev,
      priority
    }))
  }

  const handleUrgencyChange = (urgency: string) => {
    setFormData(prev => ({
      ...prev,
      urgency
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles: FileUpload[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }))

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles]
    }))
  }

  const removeFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== fileId)
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleLogin = async () => {
    try {
      // Redirect to login page or trigger login modal
      window.location.href = '/login'
    } catch (error) {
      console.error('❌ Login redirect failed:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setSubmitStatus('error')
      setSubmitMessage('Please fill in all required fields.')
      return
    }

    if (authStatus !== 'authenticated') {
      setSubmitStatus('error')
      setSubmitMessage('Please log in to submit work requests.')
      return
    }

    if (!currentUser) {
      setSubmitStatus('error')
      setSubmitMessage('User authentication required. Please log in.')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      console.log('🚀 REAL DATABASE SUBMISSION STARTED!')
      console.log('📝 Form data:', formData)

      console.log('🔗 Attempting Supabase connection...')
      
      // Test connection
      const { error: connectionError } = await supabase.from('work_requests').select('count').limit(1)
      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`)
      }
      
      console.log('✅ Supabase connection successful!')
      console.log('👤 Using authenticated user:', currentUser.email, 'ID:', currentUser.id)

      // Use tenant_id if available, otherwise generate one for demo
      let finalTenantId = userTenantId
      if (!finalTenantId) {
        finalTenantId = generateUUID()
        console.log('⚠️ No tenant_id found, using generated UUID for demo:', finalTenantId)
      }

      // Prepare the data for insertion
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        urgency: formData.urgency,
        customer_id: currentUser.id, // Use authenticated user's ID
        tenant_id: finalTenantId, // Use tenant_id from lookup or generated UUID
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        required_completion_date: formData.requiredCompletionDate || null,
        internal_notes: formData.tags.length > 0 ? formData.tags.join(', ') : null,
        status: 'submitted'
      }

      console.log('💾 Inserting into work_requests table:', requestData)
      console.log('🔑 Using customer_id (UUID):', currentUser.id)
      console.log('🏢 Using tenant_id (UUID):', finalTenantId)

      // Insert into Supabase
      const { data: insertData, error: insertError } = await supabase
        .from('work_requests')
        .insert([requestData])
        .select()

      if (insertError) {
        console.error('❌ Database insert failed:', insertError)
        console.error('❌ Insert error details:', insertError)
        throw new Error(`Failed to save request: ${insertError.message}`)
      }

      console.log('✅ DATABASE INSERT SUCCESSFUL!')
      console.log('📋 Inserted data:', insertData)

      // Handle file uploads if any
      if (formData.attachments.length > 0) {
        console.log('📎 Processing file uploads...')
        // File upload logic would go here
        // For now, we'll just log that files were attached
        console.log('📁 Files to upload:', formData.attachments.map(f => f.name))
      }

      setSubmitStatus('success')
      setSubmitMessage(`Work request submitted successfully! Request ID: ${insertData[0]?.id}`)
      
      // Reset form
      setFormData({
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

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/work-requests'
      }, 2000)

    } catch (error) {
      console.error('❌ SUBMISSION FAILED:', error)
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
      
      // Save to localStorage as backup
      console.log('💾 Saving to localStorage as backup...')
      const backupData = {
        ...formData,
        id: `backup-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.email || 'Unknown User',
        source: 'database-failed-backup'
      }
      
      const existingRequests = JSON.parse(localStorage.getItem('etla_work_requests') || '[]')
      existingRequests.push(backupData)
      localStorage.setItem('etla_work_requests', JSON.stringify(existingRequests))
      console.log('💾 Backup saved to localStorage')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine submit button state
  const isSubmitDisabled = isSubmitting || authStatus !== 'authenticated' || !currentUser

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/work-requests'}
              className="flex items-center gap-2"
            >
              ← Back to Requests
            </Button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">New Work Request</h1>
          <p className="text-gray-600">Submit a new work request for processing</p>
        </div>

        {/* Authentication Status */}
        <div className={`mb-6 p-4 rounded-lg border ${
          authStatus === 'authenticated' ? 'bg-green-50 border-green-200' :
          authStatus === 'unauthenticated' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            {authStatus === 'authenticated' ? (
              <Database className="h-5 w-5 text-green-600" />
            ) : authStatus === 'unauthenticated' ? (
              <LogIn className="h-5 w-5 text-red-600" />
            ) : (
              <Database className="h-5 w-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                authStatus === 'authenticated' ? 'text-green-900' :
                authStatus === 'unauthenticated' ? 'text-red-900' :
                'text-yellow-900'
              }`}>
                {authStatus === 'authenticated' && 'Authenticated - Database Ready'}
                {authStatus === 'unauthenticated' && 'Authentication Required'}
                {authStatus === 'loading' && 'Checking Authentication...'}
              </p>
              <p className={`text-xs ${
                authStatus === 'authenticated' ? 'text-green-700' :
                authStatus === 'unauthenticated' ? 'text-red-700' :
                'text-yellow-700'
              }`}>
                {authStatus === 'authenticated' && `Logged in as: ${currentUser?.email}`}
                {authStatus === 'unauthenticated' && 'Please log in to submit work requests'}
                {authStatus === 'loading' && 'Verifying your authentication status...'}
              </p>
              {userTenantId && authStatus === 'authenticated' && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Tenant ID: {userTenantId}
                </p>
              )}
            </div>
            {authStatus === 'unauthenticated' && (
              <Button onClick={handleLogin} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </Button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            submitStatus === 'success' ? 'bg-green-50 border-green-200' :
            submitStatus === 'error' ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {submitStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className={`h-5 w-5 ${
                  submitStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  submitStatus === 'success' ? 'text-green-900' :
                  submitStatus === 'error' ? 'text-red-900' :
                  'text-yellow-900'
                }`}>
                  {submitStatus === 'success' ? 'Success!' : 
                   submitStatus === 'error' ? 'Error' : 'Warning'}
                </p>
                <p className={`text-xs ${
                  submitStatus === 'success' ? 'text-green-700' :
                  submitStatus === 'error' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {submitMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief description of your request"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Provide detailed information about your request..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority and Urgency</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low', description: 'Standard business priority' },
                    { value: 'medium', label: 'Medium', description: 'Important for business operations' },
                    { value: 'high', label: 'High', description: 'Important for business operations' },
                    { value: 'critical', label: 'Critical', description: 'Urgent business need' }
                  ].map(priority => (
                    <label key={priority.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => handlePriorityChange(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level</label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low', description: 'Within next month' },
                    { value: 'medium', label: 'Medium', description: 'Within next two weeks' },
                    { value: 'high', label: 'High', description: 'Within next week' },
                    { value: 'urgent', label: 'Urgent', description: 'Within 24-48 hours' }
                  ].map(urgency => (
                    <label key={urgency.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value={urgency.value}
                        checked={formData.urgency === urgency.value}
                        onChange={(e) => handleUrgencyChange(e.target.value)}
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

          {/* Additional Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  id="estimatedHours"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  placeholder="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="4000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="requiredCompletionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Required Completion
                </label>
                <input
                  type="date"
                  id="requiredCompletionDate"
                  name="requiredCompletionDate"
                  value={formData.requiredCompletionDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="migration"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
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

          {/* Supporting Documents */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload files to support your request</p>
              
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
              />
              <label htmlFor="file-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </label>
              
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, TXT (Max 10MB each)
              </p>
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className={`${
                isSubmitDisabled 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title={
                authStatus === 'loading' ? 'Checking authentication...' :
                authStatus === 'unauthenticated' ? 'Please log in first' :
                !currentUser ? 'Authentication required' :
                isSubmitting ? 'Submitting...' :
                'Ready to submit'
              }
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : authStatus === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking Auth...
                </>
              ) : authStatus === 'unauthenticated' ? (
                'Log In Required'
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

