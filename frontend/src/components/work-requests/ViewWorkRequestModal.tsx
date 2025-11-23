'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { X, Download, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface WorkRequest {
  id: string
  title: string
  description: string
  category: string | string[]
  categoryOther?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency?: 'low' | 'medium' | 'high' | 'urgent'
  status: string
  tenant_id: string
  customer_id?: string
  created_at: string
  updated_at: string
  required_completion_date?: string
  attachments?: WorkRequestAttachment[]
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

interface WorkRequestAttachment {
  id: string
  file_name: string
  file_size: number
  file_type: string
  file_url: string
  uploaded_at: string
}

interface ViewWorkRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: WorkRequest
}

export function ViewWorkRequestModal({ isOpen, onClose, request }: ViewWorkRequestModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'system'>('overview')
  
  if (!isOpen) return null

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const downloadAttachment = async (attachment: WorkRequestAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('work-request-attachments')
        .download(attachment.file_url)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  // Parse categories - handle both array and PostgreSQL array string format
  const parseCategories = (cat: string | string[] | undefined): string[] => {
    if (!cat) return []
    if (Array.isArray(cat)) return cat
    if (typeof cat === 'string') {
      // Handle PostgreSQL array format: {"value1","value2"}
      if (cat.startsWith('{') && cat.endsWith('}')) {
        return cat
          .slice(1, -1) // Remove { }
          .split(',')
          .map(item => item.replace(/^"|"$/g, '').trim()) // Remove quotes
          .filter(item => item.length > 0)
      }
      // Handle JSON array string
      try {
        const parsed = JSON.parse(cat)
        return Array.isArray(parsed) ? parsed : [cat]
      } catch {
        return [cat]
      }
    }
    return []
  }

  const categories = parseCategories(request.category)
  const affectedSystems = parseCategories(request.affectedSystems as any)
  const hasComprehensiveData = affectedSystems.length > 0 || request.estimatedEmployeeImpact || request.estimatedDocumentCount
  const hasSystemData = request.currentPayrollSystem || request.currentHRIS || request.currentPainPoints

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{request.title}</h2>
              <p className="text-sm text-gray-500 mt-1">Work Request Details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            {hasComprehensiveData && (
              <button
                onClick={() => setActiveTab('scope')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'scope'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Scope & Impact
              </button>
            )}
            {hasSystemData && (
              <button
                onClick={() => setActiveTab('system')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'system'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Current System
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-xs font-medium text-blue-700 uppercase mb-1">Status</label>
                  <p className="text-sm font-semibold text-blue-900">{request.status}</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-xs font-medium text-orange-700 uppercase mb-1">Priority</label>
                  <p className="text-sm font-semibold text-orange-900">{request.priority}</p>
                </div>
                
                {request.urgency && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="block text-xs font-medium text-red-700 uppercase mb-1">Urgency</label>
                    <p className="text-sm font-semibold text-red-900">{request.urgency}</p>
                  </div>
                )}
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Budget</label>
                  <p className="text-sm font-semibold text-gray-900">$0</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, idx) => (
                    <span key={idx} className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {cat}
                    </span>
                  ))}
                  {request.categoryOther && (
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                      {request.categoryOther}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {request.description}
                </p>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(request.created_at)}</p>
                </div>
                
                {request.required_completion_date && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Completion Date</label>
                    <p className="text-sm text-gray-900">{formatDate(request.required_completion_date)}</p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Attachments</label>
                {request.attachments && request.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {request.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{attachment.file_name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadAttachment(attachment)}
                          className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No attachments</p>
                  </div>
                )}
              </div>

              {/* Specific Requirements */}
              {request.specificRequirements && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Requirements</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {request.specificRequirements}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Scope & Impact Tab */}
          {activeTab === 'scope' && hasComprehensiveData && (
            <div className="space-y-6">
              {/* Affected Systems */}
              {affectedSystems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Affected Systems</label>
                  <div className="flex flex-wrap gap-2">
                    {affectedSystems.map((system, idx) => (
                      <span key={idx} className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Impact & Compliance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.estimatedEmployeeImpact && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Impact</label>
                    <p className="text-sm text-gray-900">{request.estimatedEmployeeImpact}</p>
                  </div>
                )}
                
                {request.complianceRelated && (
                  <div className={`p-4 rounded-lg border ${
                    request.complianceRelated === 'yes' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Related</label>
                    <p className={`text-sm font-semibold ${
                      request.complianceRelated === 'yes' ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      {request.complianceRelated === 'yes' ? '⚠️ YES' : 'No'}
                    </p>
                  </div>
                )}
              </div>

              {/* Scope Estimation */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Scope Estimation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.estimatedDocumentCount && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Count</label>
                      <p className="text-sm text-gray-900">{request.estimatedDocumentCount}</p>
                    </div>
                  )}
                  
                  {request.estimatedDataVolume && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Volume</label>
                      <p className="text-sm text-gray-900">{request.estimatedDataVolume}</p>
                    </div>
                  )}
                  
                  {request.integrationComplexity && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Integration Complexity</label>
                      <p className="text-sm text-gray-900">{request.integrationComplexity}</p>
                    </div>
                  )}
                  
                  {request.expectedFrequency && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Frequency</label>
                      <p className="text-sm text-gray-900">{request.expectedFrequency}</p>
                    </div>
                  )}
                  
                  {request.longTermStorageRequired && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Long-term Storage</label>
                      <p className="text-sm text-gray-900">{request.longTermStorageRequired}</p>
                    </div>
                  )}
                  
                  {request.ongoingApiMonitoring && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Monitoring</label>
                      <p className="text-sm text-gray-900">{request.ongoingApiMonitoring}</p>
                    </div>
                  )}
                  
                  {request.ongoingSupportNeeded && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ongoing Support</label>
                      <p className="text-sm text-gray-900">{request.ongoingSupportNeeded}</p>
                    </div>
                  )}
                  
                  {request.helixBridgeAccess && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">HelixBridge Access</label>
                      <p className="text-sm text-gray-900">{request.helixBridgeAccess}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Current System Tab */}
          {activeTab === 'system' && hasSystemData && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">Current System Environment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.currentPayrollSystem && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payroll System</label>
                    <p className="text-sm text-gray-900">{request.currentPayrollSystem}</p>
                  </div>
                )}
                
                {request.currentHRIS && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">HRIS</label>
                    <p className="text-sm text-gray-900">{request.currentHRIS}</p>
                  </div>
                )}
                
                {request.currentVersion && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <p className="text-sm text-gray-900">{request.currentVersion}</p>
                  </div>
                )}
                
                {request.currentIntegrationCount && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Integration Count</label>
                    <p className="text-sm text-gray-900">{request.currentIntegrationCount}</p>
                  </div>
                )}
                
                {request.dataMigrationNeeded && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Migration Needed</label>
                    <p className="text-sm text-gray-900">{request.dataMigrationNeeded}</p>
                  </div>
                )}
              </div>
              
              {request.currentPainPoints && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Pain Points</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {request.currentPainPoints}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Request ID: {request.id.substring(0, 8)}...</p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
