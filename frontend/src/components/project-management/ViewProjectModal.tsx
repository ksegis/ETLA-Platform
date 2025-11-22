'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface ProjectCharter {
  id: string
  tenant_id: string
  title?: string
  project_name?: string
  project_title?: string
  project_code?: string
  description?: string
  priority?: string
  urgency?: string
  project_type?: string
  project_category?: string
  start_date?: string
  end_date?: string
  required_completion_date?: string
  actual_start_date?: string
  actual_end_date?: string
  budget?: number
  estimated_budget?: number
  actual_budget?: number
  budget_variance?: number
  assigned_team_lead?: string
  team_lead?: string
  project_manager?: string
  manager?: string
  sponsor?: string
  resource_requirements?: string
  project_scope?: string
  success_criteria?: string
  stakeholders?: any[]
  risk_assessment?: string
  quality_metrics?: string
  communication_plan?: string
  milestone_schedule?: any[]
  deliverables?: any[]
  constraints?: string
  assumptions?: string
  business_case?: string
  charter_status?: string
  status?: string
  work_request_id?: string
  completion_percentage?: number
  approved_by?: string
  approved_at?: string
  department?: string
  division?: string
  cost_center?: string
  customer_id?: string
  external_project_id?: string
  contract_number?: string
  billing_type?: string
  objectives?: string
  scope?: string
  team_members?: string
  
  // Comprehensive work request fields
  category?: string[]
  category_other?: string
  affected_systems?: string[]
  estimated_employee_impact?: string
  compliance_related?: string
  specific_requirements?: string
  
  // Scope estimation fields
  estimated_document_count?: string
  estimated_data_volume?: string
  long_term_storage_required?: string
  ongoing_api_monitoring?: string
  ongoing_support_needed?: string
  expected_frequency?: string
  integration_complexity?: string
  helix_bridge_access?: string
  
  // Current system environment fields
  current_payroll_system?: string
  current_hris?: string
  current_version?: string
  current_integration_count?: string
  data_migration_needed?: string
  current_pain_points?: string
  
  created_at?: string
  updated_at?: string
}

interface ViewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: ProjectCharter
}

export function ViewProjectModal({ isOpen, onClose, project }: ViewProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'work_request'>('overview')
  
  if (!isOpen) return null

  const getProjectName = (project: ProjectCharter) => {
    return project.title || project.project_name || project.project_title || 'Untitled Project'
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0.00'
    return `$${amount.toLocaleString()}`
  }
  
  const hasWorkRequestData = project.work_request_id || project.category || project.affected_systems

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
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
            {hasWorkRequestData && (
              <button
                onClick={() => setActiveTab('work_request')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'work_request'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Work Request Details
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <p className="mt-1 text-sm text-gray-900">{getProjectName(project)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Code</label>
                  <p className="mt-1 text-sm text-gray-900">{project.project_code || 'Not assigned'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tenant</label>
                  <p className="mt-1 text-sm text-gray-900">{project.tenant_id || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{project.description || 'No description provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    project.priority === 'high' || project.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    project.priority === 'low' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.priority || 'Not set'}
                  </span>
                </div>
                
                {project.urgency && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                      project.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                      project.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {project.urgency}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status || 'Not set'}
                  </span>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(project.start_date)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(project.end_date)}</p>
                </div>
                
                {project.required_completion_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Required Completion Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(project.required_completion_date)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(project.budget || project.estimated_budget)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Manager</label>
                  <p className="mt-1 text-sm text-gray-900">{project.project_manager || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sponsor</label>
                  <p className="mt-1 text-sm text-gray-900">{project.sponsor || 'Not assigned'}</p>
                </div>
              </div>

              {/* Stakeholders & Team */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Team & Stakeholders</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stakeholders</label>
                  <p className="mt-1 text-sm text-gray-900">{project.stakeholders || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Members</label>
                  <p className="mt-1 text-sm text-gray-900">{project.team_members || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="mt-1 text-sm text-gray-900">{project.department || 'Not specified'}</p>
                </div>
              </div>

              {/* Objectives & Scope */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Objectives & Scope</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Objectives</label>
                  <p className="mt-1 text-sm text-gray-900">{project.objectives || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Scope</label>
                  <p className="mt-1 text-sm text-gray-900">{project.scope || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deliverables</label>
                  <p className="mt-1 text-sm text-gray-900">{project.deliverables || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Work Request Details Tab */}
          {activeTab === 'work_request' && hasWorkRequestData && (
            <div className="space-y-6">
              {/* Categories & Systems */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Categories & Systems</h3>
                  
                  {project.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categories</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Array.isArray(project.category) ? (
                          project.category.map((cat, idx) => (
                            <span key={idx} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {project.category}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {project.category_other && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Other Category Details</label>
                      <p className="mt-1 text-sm text-gray-900">{project.category_other}</p>
                    </div>
                  )}
                  
                  {project.affected_systems && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Affected Systems</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Array.isArray(project.affected_systems) ? (
                          project.affected_systems.map((sys, idx) => (
                            <span key={idx} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {sys}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {project.affected_systems}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {project.estimated_employee_impact && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee Impact</label>
                      <p className="mt-1 text-sm text-gray-900">{project.estimated_employee_impact}</p>
                    </div>
                  )}
                  
                  {project.compliance_related && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Compliance Related</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        project.compliance_related === 'yes' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.compliance_related === 'yes' ? '⚠️ YES' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Scope Estimation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Scope Estimation</h3>
                  
                  {project.estimated_document_count && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Document Count</label>
                      <p className="mt-1 text-sm text-gray-900">{project.estimated_document_count}</p>
                    </div>
                  )}
                  
                  {project.estimated_data_volume && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data Volume</label>
                      <p className="mt-1 text-sm text-gray-900">{project.estimated_data_volume}</p>
                    </div>
                  )}
                  
                  {project.integration_complexity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Integration Complexity</label>
                      <p className="mt-1 text-sm text-gray-900">{project.integration_complexity}</p>
                    </div>
                  )}
                  
                  {project.expected_frequency && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Frequency</label>
                      <p className="mt-1 text-sm text-gray-900">{project.expected_frequency}</p>
                    </div>
                  )}
                  
                  {project.long_term_storage_required && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Long-term Storage Required</label>
                      <p className="mt-1 text-sm text-gray-900">{project.long_term_storage_required}</p>
                    </div>
                  )}
                  
                  {project.ongoing_api_monitoring && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ongoing API Monitoring</label>
                      <p className="mt-1 text-sm text-gray-900">{project.ongoing_api_monitoring}</p>
                    </div>
                  )}
                  
                  {project.ongoing_support_needed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ongoing Support Needed</label>
                      <p className="mt-1 text-sm text-gray-900">{project.ongoing_support_needed}</p>
                    </div>
                  )}
                  
                  {project.helix_bridge_access && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">HelixBridge Access</label>
                      <p className="mt-1 text-sm text-gray-900">{project.helix_bridge_access}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Current System Environment */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Current System Environment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.current_payroll_system && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Payroll System</label>
                      <p className="mt-1 text-sm text-gray-900">{project.current_payroll_system}</p>
                    </div>
                  )}
                  
                  {project.current_hris && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current HRIS</label>
                      <p className="mt-1 text-sm text-gray-900">{project.current_hris}</p>
                    </div>
                  )}
                  
                  {project.current_version && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Version</label>
                      <p className="mt-1 text-sm text-gray-900">{project.current_version}</p>
                    </div>
                  )}
                  
                  {project.current_integration_count && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Integration Count</label>
                      <p className="mt-1 text-sm text-gray-900">{project.current_integration_count}</p>
                    </div>
                  )}
                  
                  {project.data_migration_needed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data Migration Needed</label>
                      <p className="mt-1 text-sm text-gray-900">{project.data_migration_needed}</p>
                    </div>
                  )}
                </div>
                
                {project.current_pain_points && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Pain Points</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{project.current_pain_points}</p>
                  </div>
                )}
              </div>
              
              {/* Specific Requirements */}
              {project.specific_requirements && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Specific Requirements</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{project.specific_requirements}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
