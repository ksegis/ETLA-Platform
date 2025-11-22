'use client'

import { useState } from 'react'
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FormData {
  title: string
  description: string
  category: string
  affectedSystems: string[]
  priority: string
  urgency: string
  requiredCompletionDate: string
  estimatedEmployeeImpact: string
  complianceRelated: string
  specificRequirements: string
  attachments: File[]
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

const priorities = [
  { value: 'low', label: 'Low - Can wait for next sprint' },
  { value: 'medium', label: 'Medium - Standard priority' },
  { value: 'high', label: 'High - Important for operations' },
  { value: 'critical', label: 'Critical - Blocking payroll/compliance' }
]

const urgencies = [
  { value: 'low', label: 'Low - No specific timeline' },
  { value: 'medium', label: 'Medium - Within 30 days' },
  { value: 'high', label: 'High - Within 7 days' },
  { value: 'urgent', label: 'Urgent - Within 48 hours' }
]

const employeeImpactOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-100', label: '51-100 employees' },
  { value: '101-500', label: '101-500 employees' },
  { value: '500+', label: '500+ employees' },
  { value: 'all', label: 'All employees' }
]

export default function NewWorkRequestPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    affectedSystems: [],
    priority: '',
    urgency: '',
    requiredCompletionDate: '',
    estimatedEmployeeImpact: '',
    complianceRelated: '',
    specificRequirements: '',
    attachments: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleSystem = (system: string) => {
    setFormData(prev => ({
      ...prev,
      affectedSystems: prev.affectedSystems.includes(system)
        ? prev.affectedSystems.filter(s => s !== system)
        : [...prev.affectedSystems, system]
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
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
    if (formData.affectedSystems.length === 0) newErrors.affectedSystems = 'Select at least one affected system'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Submitting work request:', formData)
      setIsSubmitting(false)
      // Redirect to requests page
      window.location.href = '/work-requests'
    }, 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
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
        <p className="text-gray-600">Provide details about your payroll or HR system request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                spellCheck={true}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Configure year-end payroll tax reporting"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Employee Impact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Employee Impact
                </label>
                <select
                  value={formData.estimatedEmployeeImpact}
                  onChange={(e) => handleInputChange('estimatedEmployeeImpact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select impact range</option>
                  {employeeImpactOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                spellCheck={true}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe the issue, requirement, or change needed. Include relevant context such as current state, desired outcome, and any error messages."
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Specific Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Requirements or Constraints
              </label>
              <textarea
                value={formData.specificRequirements}
                onChange={(e) => handleInputChange('specificRequirements', e.target.value)}
                spellCheck={true}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific technical requirements, business rules, or constraints we should be aware of"
              />
            </div>
          </div>
        </div>

        {/* Systems & Compliance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Systems & Compliance</h2>
          
          <div className="space-y-4">
            {/* Affected Systems */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affected Systems <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {systemOptions.map((system) => (
                  <label
                    key={system.value}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
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
              {errors.affectedSystems && <p className="text-red-600 text-sm mt-1">{errors.affectedSystems}</p>}
            </div>

            {/* Compliance Related */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is this compliance-related?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="compliance"
                    value="yes"
                    checked={formData.complianceRelated === 'yes'}
                    onChange={(e) => handleInputChange('complianceRelated', e.target.value)}
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
                    onChange={(e) => handleInputChange('complianceRelated', e.target.value)}
                    className="rounded"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
              {formData.complianceRelated === 'yes' && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Compliance-related requests will be prioritized and may require additional documentation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Priority & Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority & Timeline</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.priority ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select priority</option>
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
              {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.urgency ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select urgency</option>
                {urgencies.map((urgency) => (
                  <option key={urgency.value} value={urgency.value}>{urgency.label}</option>
                ))}
              </select>
              {errors.urgency && <p className="text-red-600 text-sm mt-1">{errors.urgency}</p>}
            </div>

            {/* Required Completion Date */}
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

        {/* Supporting Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Upload supporting documents, screenshots, or data files</p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button type="button" variant="outline" size="sm">
                Choose Files
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supported: PDF, DOC, DOCX, XLS, XLSX, CSV, PNG, JPG (Max 10MB each)
            </p>
          </div>
          
          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
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
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}
