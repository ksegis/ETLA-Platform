'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Plus, AlertCircle, CheckCircle, Database, LogIn, Copy, ExternalLink } from 'lucide-react'
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
  const [successData, setSuccessData] = useState<{
    requestId: string
    userFriendlyId: string
    databaseId: string
  } | null>(null)

  // Safe categories array - no complex operations
  const categoryOptions = [
    'Payroll Setup',
    'Data Migration', 
    'System Integration',
    'Reporting Setup',
    'Benefits Configuration',
    'Compliance Audit',
    'Training Support',
    'Custom Development',
    'Other'
  ]

  // Ultra-safe request ID generator
  const createRequestId = () => {
    const now = new Date()
    const timestamp = now.getTime().toString()
    const random = Math.floor(Math.random() * 1000).toString()
    return 'WR-' + timestamp.slice(-8) + '-' + random.padStart(3, '0')
  }

  // Handle authentication and tenant lookup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...')
        setAuthStatus('loading')
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setAuthStatus('unauthenticated')
          return
        }

        if (!session) {
          console.warn('⚠️ No active session found')
          setAuthStatus('unauthenticated')
          return
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('❌ User error:', userError)
          setAuthStatus('unauthenticated')
          return
        }

        console.log('👤 Authenticated user:', user.email, 'ID:', user.id)
        setCurrentUser(user)
        setAuthStatus('authenticated')

        // Look up tenant_id
        console.log('🔍 Looking up user tenant_id...')
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenant_users')
          .select('tenant_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (tenantError) {
          console.error('❌ Error fetching tenant_id:', tenantError)
        } else if (tenantData && tenantData.tenant_id) {
          console.log('🏢 User tenant_id:', tenantData.tenant_id)
          setUserTenantId(tenantData.tenant_id)
          console.log('✅ Tenant lookup completed successfully')
        } else {
          console.warn('⚠️ User not associated with any tenant')
        }

      } catch (error) {
        console.error('❌ Error in authentication/tenant lookup:', error)
        setAuthStatus('unauthenticated')
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        initializeAuth()
      } else if (event === 'SIGNED_OUT') {
        setAuthStatus('unauthenticated')
        setCurrentUser(null)
        setUserTenantId(null)
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
      window.location.href = '/login'
    } catch (error) {
      console.error('❌ Login redirect failed:', error)
    }
  }

  const copyRequestId = (id: string) => {
    navigator.clipboard.writeText(id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setSubmitStatus('error')
      setSubmitMessage('Please fill in all required fields.')
      return
    }

    if (authStatus !== 'authenticated' || !currentUser) {
      setSubmitStatus('error')
      setSubmitMessage('Please log in to submit work requests.')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      console.log('🚀 REAL DATABASE SUBMISSION STARTED!')

      // Test connection
      const { error: connectionError } = await supabase.from('work_requests').select('count').limit(1)
      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`)
      }
      
      console.log('✅ Supabase connection successful!')
      console.log('👤 Using authenticated user:', currentUser.email, 'ID:', currentUser.id)

      // Use tenant_id if available, otherwise use fallback
      let finalTenantId = userTenantId
      if (!finalTenantId) {
        finalTenantId = '54afbd1d-e72a-41e1-9d39-2c8a08a257ff'
        console.log('⚠️ No tenant_id found, using fallback tenant_id:', finalTenantId)
      }

      // Generate user-friendly request ID
      const userFriendlyId = createRequestId()
      console.log('🎯 Generated user-friendly ID:', userFriendlyId)

      // DEBUG: Check if customer exists before inserting
      console.log('🔍 DEBUG: Checking if customer exists in customers table...')
      console.log('🔑 DEBUG: Looking for customer_id:', currentUser.id)

      const { data: customerCheck, error: customerCheckError } = await supabase
        .from('customers')
        .select('id, email')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (customerCheckError) {
        console.error('❌ DEBUG: Error checking customer:', customerCheckError)
        throw new Error(`Error checking customer: ${customerCheckError.message}`)
      } else if (customerCheck) {
        console.log('✅ DEBUG: Customer exists:', customerCheck)
      } else {
        console.error('❌ DEBUG: Customer NOT found in customers table for ID:', currentUser.id)
        throw new Error(`Customer not found in customers table for ID: ${currentUser.id}`)
      }

      console.log('📋 DEBUG: About to insert with customer_id:', currentUser.id)

      // Prepare the data for insertion
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        urgency: formData.urgency,
        customer_id: currentUser.id,
        tenant_id: finalTenantId,
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        required_completion_date: formData.requiredCompletionDate || null,
        internal_notes: formData.tags.length > 0 ? formData.tags.join(', ') : null,
        status: 'submitted',
        request_id: userFriendlyId
      }

      console.log('💾 Inserting into work_requests table:', requestData)

      // Insert into Supabase
      const { data: insertData, error: insertError } = await supabase
        .from('work_requests')
        .insert([requestData])
        .select()

      if (insertError) {
        console.error('❌ Database insert failed:', insertError)
        throw new Error(`Failed to save request: ${insertError.message}`)
      }

      console.log('✅ DATABASE INSERT SUCCESSFUL!')
      console.log('📋 Inserted data:', insertData)

      // Set success data for enhanced confirmation
      setSuccessData({
        requestId: userFriendlyId,
        userFriendlyId: userFriendlyId,
        databaseId: insertData[0]?.id || 'Unknown'
      })

      setSubmitStatus('success')
      setSubmitMessage('')
      
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
      
      try {
        const existingRequests = JSON.parse(localStorage.getItem('etla_work_requests') || '[]')
        existingRequests.push(backupData)
        localStorage.setItem('etla_work_requests', JSON.stringify(existingRequests))
        console.log('💾 Backup saved to localStorage')
      } catch (storageError) {
        console.error('❌ Failed to save backup to localStorage:', storageError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success confirmation component
  if (submitStatus === 'success' && successData) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h1>
              <p className="text-gray-600">Your work request has been created and assigned to our team.</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4">Request Details</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Request ID</div>
                    <div className="text-sm text-gray-600">Use this ID to track your request</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-green-700">{successData.userFriendlyId}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyRequestId(successData.userFriendlyId)}
                      className="p-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Status</div>
                    <div className="text-sm text-gray-600">Current request status</div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Submitted
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Submitted By</div>
                    <div className="text-sm text-gray-600">Request creator</div>
                  </div>
                  <span className="text-gray-900 font-medium">{currentUser?.email}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Submitted At</div>
                    <div className="text-sm text-gray-600">Request creation time</div>
                  </div>
                  <span className="text-gray-900 font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Your request will be reviewed by our team within 24 hours</li>
                <li>• You'll receive email notifications about status updates</li>
                <li>• You can track progress using your Request ID: <strong>{successData.userFriendlyId}</strong></li>
                <li>• Our team may contact you for additional information if needed</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/work-requests'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Requests
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitStatus('idle')
                  setSuccessData(null)
                }}
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

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
                  {categoryOptions.map((category, index) => (
                    <option key={index} value={category.toLowerCase().replace(/\s+/g, '_')}>
                      {category}
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
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="low"
                      checked={formData.priority === 'low'}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Low</div>
                      <div className="text-sm text-gray-600">Standard business priority</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="medium"
                      checked={formData.priority === 'medium'}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Medium</div>
                      <div className="text-sm text-gray-600">Important for business operations</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="high"
                      checked={formData.priority === 'high'}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">High</div>
                      <div className="text-sm text-gray-600">Important for business operations</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="critical"
                      checked={formData.priority === 'critical'}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Critical</div>
                      <div className="text-sm text-gray-600">Urgent business need</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value="low"
                      checked={formData.urgency === 'low'}
                      onChange={(e) => handleUrgencyChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Low</div>
                      <div className="text-sm text-gray-600">Within next month</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value="medium"
                      checked={formData.urgency === 'medium'}
                      onChange={(e) => handleUrgencyChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Medium</div>
                      <div className="text-sm text-gray-600">Within next two weeks</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value="high"
                      checked={formData.urgency === 'high'}
                      onChange={(e) => handleUrgencyChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">High</div>
                      <div className="text-sm text-gray-600">Within next week</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value="urgent"
                      checked={formData.urgency === 'urgent'}
                      onChange={(e) => handleUrgencyChange(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Urgent</div>
                      <div className="text-sm text-gray-600">Within 24-48 hours</div>
                    </div>
                  </label>
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
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
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
              disabled={isSubmitting || authStatus !== 'authenticated' || !currentUser}
              className={`${
                isSubmitting || authStatus !== 'authenticated' || !currentUser
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
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

