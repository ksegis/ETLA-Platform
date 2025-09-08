'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  Building,
  User,
  Target,
  TrendingUp,
  Shield,
  Zap,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant, useAccessibleTenantIds, useMultiTenantMode } from '@/contexts/TenantContext'
import { supabase } from '@/lib/supabase'

// Complete PMBOK interface with all fields
interface ProjectCharter {
  id: string
  tenant_id: string
  
  // Basic project information
  title?: string
  project_name?: string
  project_title?: string
  project_code?: string
  description?: string
  priority?: string
  project_type?: string
  project_category?: string
  
  // Timeline
  start_date?: string
  end_date?: string
  actual_start_date?: string
  actual_end_date?: string
  
  // Budget and financials
  budget?: number
  estimated_budget?: number
  actual_budget?: number
  budget_variance?: number
  
  // Team and resources
  assigned_team_lead?: string
  team_lead?: string
  project_manager?: string
  manager?: string
  sponsor?: string
  resource_requirements?: string
  
  // PMBOK framework fields
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
  status?: string // Add status property
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
  
  // Additional properties used in ViewProjectModal
  objectives?: string
  scope?: string
  team_members?: string
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

interface WorkRequest {
  id: string
  title?: string
  description?: string
  status?: string
  priority?: string
  created_at?: string
}

interface Risk {
  id: string
  risk_title?: string
  title?: string
  name?: string
  risk_level?: string
  level?: string
  severity?: string
  priority?: string
  status?: string
  created_at?: string
}

interface Statistics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  workRequests: number
  pendingWorkRequests: number
  approvedWorkRequests: number
  highRisks: number
  totalBudget: number
  averageCompletion: number
}

export default function ProjectManagementPage() {
  const { user } = useAuth()
  const { selectedTenant } = useTenant()
  const accessibleTenantIds = useAccessibleTenantIds()
  const { isMultiTenant, availableTenants } = useMultiTenantMode()
  
  // State management
  const [activeTab, setActiveTab] = useState('projects')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    workRequests: 0,
    pendingWorkRequests: 0,
    approvedWorkRequests: 0,
    highRisks: 0,
    totalBudget: 0,
    averageCompletion: 0
  })
  
  // Form and UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCharter | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [projectTypeFilter, setProjectTypeFilter] = useState('all')
  const [tenantFilter, setTenantFilter] = useState('') // New tenant filter
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Work Requests tab state
  const [isCreateWorkRequestModalOpen, setIsCreateWorkRequestModalOpen] = useState(false)
  const [isEditWorkRequestModalOpen, setIsEditWorkRequestModalOpen] = useState(false)
  const [isViewWorkRequestModalOpen, setIsViewWorkRequestModalOpen] = useState(false)
  const [selectedWorkRequest, setSelectedWorkRequest] = useState<WorkRequest | null>(null)
  const [workRequestSearchTerm, setWorkRequestSearchTerm] = useState('')
  const [workRequestStatusFilter, setWorkRequestStatusFilter] = useState('')
  const [workRequestPriorityFilter, setWorkRequestPriorityFilter] = useState('')

  // Risks tab state
  const [isCreateRiskModalOpen, setIsCreateRiskModalOpen] = useState(false)
  const [isEditRiskModalOpen, setIsEditRiskModalOpen] = useState(false)
  const [isViewRiskModalOpen, setIsViewRiskModalOpen] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [riskSearchTerm, setRiskSearchTerm] = useState('')
  const [riskLevelFilter, setRiskLevelFilter] = useState('')
  const [riskStatusFilter, setRiskStatusFilter] = useState('')

  // Charter tab state
  const [isEditCharterModalOpen, setIsEditCharterModalOpen] = useState(false)
  const [isViewCharterModalOpen, setIsViewCharterModalOpen] = useState(false)

  // WBS tab state
  const [isCreateWbsItemModalOpen, setIsCreateWbsItemModalOpen] = useState(false)
  const [isEditWbsItemModalOpen, setIsEditWbsItemModalOpen] = useState(false)
  const [isViewWbsItemModalOpen, setIsViewWbsItemModalOpen] = useState(false)
  const [selectedWbsItem, setSelectedWbsItem] = useState<any>(null)
  const [wbsSearchTerm, setWbsSearchTerm] = useState('')
  const [wbsStatusFilter, setWbsStatusFilter] = useState('')
  const [wbsLevelFilter, setWbsLevelFilter] = useState('')
  const [wbsViewMode, setWbsViewMode] = useState<'tree' | 'table'>('table')

  // Schedule tab state
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false)
  const [isEditScheduleItemModalOpen, setIsEditScheduleItemModalOpen] = useState(false)
  const [isViewScheduleItemModalOpen, setIsViewScheduleItemModalOpen] = useState(false)
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<any>(null)
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('')
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('')
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState('')
  const [scheduleViewMode, setScheduleViewMode] = useState<'gantt' | 'timeline'>('timeline')

  // EVM tab state
  const [isUpdateEvmModalOpen, setIsUpdateEvmModalOpen] = useState(false)
  const [evmViewMode, setEvmViewMode] = useState<'dashboard' | 'detailed'>('dashboard')

  // Stakeholders tab state
  const [isCreateStakeholderModalOpen, setIsCreateStakeholderModalOpen] = useState(false)
  const [isEditStakeholderModalOpen, setIsEditStakeholderModalOpen] = useState(false)
  const [isViewStakeholderModalOpen, setIsViewStakeholderModalOpen] = useState(false)
  const [selectedStakeholder, setSelectedStakeholder] = useState<any>(null)
  const [stakeholderSearchTerm, setStakeholderSearchTerm] = useState('')
  const [stakeholderInfluenceFilter, setStakeholderInfluenceFilter] = useState('')
  const [stakeholderInterestFilter, setStakeholderInterestFilter] = useState('')
  const [stakeholderViewMode, setStakeholderViewMode] = useState<'grid' | 'list'>('grid')

  // Compliance tab state
  const [isCreateComplianceItemModalOpen, setIsCreateComplianceItemModalOpen] = useState(false)
  const [isEditComplianceItemModalOpen, setIsEditComplianceItemModalOpen] = useState(false)
  const [isViewComplianceItemModalOpen, setIsViewComplianceItemModalOpen] = useState(false)
  const [selectedComplianceItem, setSelectedComplianceItem] = useState<any>(null)
  const [complianceSearchTerm, setComplianceSearchTerm] = useState('')
  const [complianceStatusFilter, setComplianceStatusFilter] = useState('')
  const [complianceCategoryFilter, setComplianceCategoryFilter] = useState('')
  const [complianceViewMode, setComplianceViewMode] = useState<'overview' | 'detailed'>('overview')

  // Mock data arrays for new tabs
  const [workRequestItems] = useState([
    { id: '1', title: 'Database Migration', description: 'Migrate legacy database to modern cloud infrastructure', status: 'submitted', priority: 'high', created_at: '2025-01-15', budget: 25000, assignee: 'John Smith' },
    { id: '2', title: 'Website Redesign', description: 'Complete redesign of company website with modern UI/UX', status: 'in_progress', priority: 'medium', created_at: '2025-01-10', budget: 15000, assignee: 'Sarah Johnson' },
    { id: '3', title: 'Security Audit', description: 'Comprehensive security audit of all systems', status: 'completed', priority: 'critical', created_at: '2025-01-05', budget: 8000, assignee: 'Mike Wilson' }
  ])

  const [riskItems] = useState([
    { id: '1', title: 'Budget Overrun Risk', description: 'Project may exceed allocated budget due to scope creep', level: 'high', probability: 'medium', impact: 'high', status: 'active', mitigation: 'Implement strict change control process', owner: 'Project Manager' },
    { id: '2', title: 'Resource Availability', description: 'Key team members may not be available during critical phases', level: 'medium', probability: 'low', impact: 'high', status: 'mitigated', mitigation: 'Cross-train team members and identify backup resources', owner: 'HR Manager' },
    { id: '3', title: 'Technology Risk', description: 'New technology stack may have compatibility issues', level: 'low', probability: 'low', impact: 'medium', status: 'monitoring', mitigation: 'Conduct proof of concept and testing', owner: 'Technical Lead' }
  ])

  const [wbsItems] = useState([
    { id: '1', code: '1.0', name: 'Project Initiation', level: 1, status: 'completed', progress: 100, start_date: '2025-01-01', end_date: '2025-01-15', assignee: 'Project Manager' },
    { id: '2', code: '1.1', name: 'Project Charter', level: 2, status: 'completed', progress: 100, start_date: '2025-01-01', end_date: '2025-01-05', assignee: 'Project Manager' },
    { id: '3', code: '1.2', name: 'Stakeholder Analysis', level: 2, status: 'completed', progress: 100, start_date: '2025-01-06', end_date: '2025-01-15', assignee: 'Business Analyst' },
    { id: '4', code: '2.0', name: 'Planning Phase', level: 1, status: 'in_progress', progress: 65, start_date: '2025-01-16', end_date: '2025-02-28', assignee: 'Project Manager' },
    { id: '5', code: '2.1', name: 'Requirements Gathering', level: 2, status: 'completed', progress: 100, start_date: '2025-01-16', end_date: '2025-02-05', assignee: 'Business Analyst' },
    { id: '6', code: '2.2', name: 'Technical Design', level: 2, status: 'in_progress', progress: 30, start_date: '2025-02-06', end_date: '2025-02-28', assignee: 'Technical Lead' }
  ])

  const [scheduleItems] = useState([
    { id: '1', name: 'Project Kickoff', type: 'milestone', status: 'completed', start_date: '2025-01-01', end_date: '2025-01-01', progress: 100, assignee: 'Project Manager' },
    { id: '2', name: 'Requirements Phase', type: 'task', status: 'completed', start_date: '2025-01-02', end_date: '2025-01-31', progress: 100, assignee: 'Business Analyst' },
    { id: '3', name: 'Design Phase', type: 'task', status: 'in_progress', start_date: '2025-02-01', end_date: '2025-02-28', progress: 45, assignee: 'Technical Lead' },
    { id: '4', name: 'Development Phase', type: 'task', status: 'not_started', start_date: '2025-03-01', end_date: '2025-05-31', progress: 0, assignee: 'Development Team' },
    { id: '5', name: 'Testing Phase', type: 'task', status: 'not_started', start_date: '2025-06-01', end_date: '2025-06-30', progress: 0, assignee: 'QA Team' },
    { id: '6', name: 'Go-Live', type: 'milestone', status: 'not_started', start_date: '2025-07-01', end_date: '2025-07-01', progress: 0, assignee: 'Project Manager' }
  ])

  const [evmData] = useState({
    budgetAtCompletion: 500000,
    earnedValue: 180000,
    actualCost: 195000,
    plannedValue: 200000,
    costPerformanceIndex: 0.92,
    schedulePerformanceIndex: 0.90,
    costVariance: -15000,
    scheduleVariance: -20000,
    estimateAtCompletion: 543478,
    estimateToComplete: 348478,
    varianceAtCompletion: -43478
  })

  const [stakeholderItems] = useState([
    { id: '1', name: 'CEO', role: 'Executive Sponsor', influence: 'high', interest: 'high', engagement: 'supportive', strategy: 'Manage closely', contact: 'ceo@company.com', email: 'ceo@company.com', department: 'Executive', expectations: 'Project success and ROI', communication_frequency: 'Weekly' },
    { id: '2', name: 'IT Director', role: 'Technical Sponsor', influence: 'high', interest: 'high', engagement: 'leading', strategy: 'Manage closely', contact: 'it.director@company.com', email: 'it.director@company.com', department: 'IT', expectations: 'Technical excellence and delivery', communication_frequency: 'Daily' },
    { id: '3', name: 'End Users', role: 'Primary Users', influence: 'medium', interest: 'high', engagement: 'neutral', strategy: 'Keep satisfied', contact: 'users@company.com', email: 'users@company.com', department: 'Operations', expectations: 'User-friendly solution', communication_frequency: 'Bi-weekly' },
    { id: '4', name: 'Finance Team', role: 'Budget Approver', influence: 'high', interest: 'medium', engagement: 'supportive', strategy: 'Keep informed', contact: 'finance@company.com', email: 'finance@company.com', department: 'Finance', expectations: 'Budget compliance', communication_frequency: 'Monthly' },
    { id: '5', name: 'External Vendor', role: 'Service Provider', influence: 'low', interest: 'high', engagement: 'supportive', strategy: 'Monitor', contact: 'vendor@external.com', email: 'vendor@external.com', department: 'External', expectations: 'Contract fulfillment', communication_frequency: 'As needed' }
  ])

  const [complianceItems] = useState([
    { id: '1', requirement: 'GDPR Data Protection', description: 'Ensure all personal data handling complies with GDPR regulations', category: 'privacy', status: 'compliant', priority: 'high', due_date: '2025-03-01', owner: 'Privacy Officer' },
    { id: '2', requirement: 'SOX Financial Controls', description: 'Implement financial controls as required by Sarbanes-Oxley Act', category: 'regulatory', status: 'in_progress', priority: 'critical', due_date: '2025-02-15', owner: 'Finance Director' },
    { id: '3', requirement: 'ISO 27001 Security', description: 'Maintain information security management system certification', category: 'security', status: 'compliant', priority: 'high', due_date: '2025-06-01', owner: 'CISO' },
    { id: '4', requirement: 'Environmental Impact Assessment', description: 'Assess and mitigate environmental impact of project activities', category: 'environmental', status: 'pending_review', priority: 'medium', due_date: '2025-04-01', owner: 'Sustainability Manager' }
  ])

  const [complianceAuditTrail] = useState([
    { action: 'Compliance Review Completed', description: 'GDPR compliance review completed with no issues found', timestamp: '2025-01-15 10:30', user: 'Privacy Officer' },
    { action: 'SOX Controls Updated', description: 'Financial controls updated to meet SOX requirements', timestamp: '2025-01-10 14:15', user: 'Finance Director' },
    { action: 'Security Assessment', description: 'ISO 27001 security assessment conducted', timestamp: '2025-01-05 09:00', user: 'CISO' }
  ])

  // Handler functions for CRUD operations
  const handleDeleteWorkRequest = (id: string) => {
    console.log('Delete work request:', id)
  }

  const handleDeleteRisk = (id: string) => {
    console.log('Delete risk:', id)
  }

  const handleDeleteWbsItem = (id: string) => {
    console.log('Delete WBS item:', id)
  }

  const handleDeleteScheduleItem = (id: string) => {
    console.log('Delete schedule item:', id)
  }

  const handleDeleteStakeholder = (id: string) => {
    console.log('Delete stakeholder:', id)
  }

  const handleDeleteComplianceItem = (id: string) => {
    console.log('Delete compliance item:', id)
  }

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [accessibleTenantIds.join(',')])

  const loadData = async () => {
    const tenantIds = accessibleTenantIds
    
    if (!tenantIds || tenantIds.length === 0) {
      console.log('No accessible tenants, skipping load')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Loading project data for tenants:', tenantIds)
      
      // Load projects with error handling
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('project_charters')
          .select('*')
          .in('tenant_id', tenantIds) // Load from ALL accessible tenants
          .order('created_at', { ascending: false })
        
        if (projectsError) {
          console.error('Project charters query error:', projectsError)
          setProjects([])
        } else {
          setProjects(projectsData || [])
        }
      } catch (err) {
        console.error('Project charters query error:', err)
        setProjects([])
      }

      // Load work requests with error handling
      try {
        const { data: workRequestsData, error: workRequestsError } = await supabase
          .from('work_requests')
          .select('*')
          .in('tenant_id', tenantIds) // Load from ALL accessible tenants
          .order('created_at', { ascending: false })
        
        if (workRequestsError) {
          console.error('Work requests query error:', workRequestsError)
          setWorkRequests([])
        } else {
          setWorkRequests(workRequestsData || [])
        }
      } catch (err) {
        console.error('Work requests query error:', err)
        setWorkRequests([])
      }

      // Load risks with error handling
      try {
        const { data: risksData, error: risksError } = await supabase
          .from('risk_register')
          .select('*')
          .in('tenant_id', tenantIds) // Load from ALL accessible tenants
          .order('created_at', { ascending: false })
        
        if (risksError) {
          console.error('Risk register query error:', risksError)
          setRisks([])
        } else {
          setRisks(risksData || [])
        }
      } catch (err) {
        console.error('Risk register query error:', err)
        setRisks([])
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load project management data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  useEffect(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter((p: any) => 
      p.charter_status !== 'completed' && p.charter_status !== 'cancelled'
    ).length
    const completedProjects = projects.filter((p: any) => p.charter_status === 'completed').length
    const onHoldProjects = projects.filter((p: any) => p.charter_status === 'on_hold').length
    
    const totalWorkRequests = workRequests.length
    const pendingWorkRequests = workRequests.filter((wr: any) => wr.status === 'pending').length
    const approvedWorkRequests = workRequests.filter((wr: any) => wr.status === 'approved').length
    
    const highRisks = risks.filter((r: any) => 
      r.risk_level === 'high' || r.level === 'high' || r.severity === 'high'
    ).length
    
    const totalBudget = projects.reduce((sum: any, p) => sum + (p.budget || p.estimated_budget || 0), 0)
    const averageCompletion = projects.length > 0 
      ? projects.reduce((sum: any, p) => sum + (p.completion_percentage || 0), 0) / projects.length 
      : 0

    setStatistics({
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      workRequests: totalWorkRequests,
      pendingWorkRequests,
      approvedWorkRequests,
      highRisks,
      totalBudget,
      averageCompletion
    })
  }, [projects, workRequests, risks])

  // Create new project
  const handleCreateProject = async (projectData: Partial<ProjectCharter>) => {
    if (!selectedTenant?.id || !user?.id) return

    try {
      const newProject = {
        ...projectData,
        tenant_id: selectedTenant.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('project_charters')
        .insert([newProject])
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        setError('Failed to create project. Please try again.')
        return
      }

      setProjects(prev => [data, ...prev])
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Failed to create project. Please try again.')
    }
  }

  // Update project
  const handleUpdateProject = async (projectId: string, updates: Partial<ProjectCharter>) => {
    try {
      const { data, error } = await supabase
        .from('project_charters')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        setError('Failed to update project. Please try again.')
        return
      }

      setProjects(prev => prev.map((p: any) => p.id === projectId ? data : p))
      setIsEditModalOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      setError('Failed to update project. Please try again.')
    }
  }

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('project_charters')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        setError('Failed to delete project. Please try again.')
        return
      }

      setProjects(prev => prev.filter((p: any) => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Failed to delete project. Please try again.')
    }
  }

  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = !searchTerm || 
      (project.title || project.project_name || project.project_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.project_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.assigned_team_lead || project.team_lead || project.manager || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.charter_status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    const matchesDepartment = departmentFilter === 'all' || project.department === departmentFilter
    const matchesProjectType = projectTypeFilter === 'all' || project.project_type === projectTypeFilter
    const matchesTenant = !tenantFilter || project.tenant_id === tenantFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesProjectType && matchesTenant
  })

  // Pagination logic
  const totalItems = filteredProjects.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  // Filtered arrays for new tabs
  const filteredWorkRequests = workRequestItems.filter((request: any) => {
    const matchesSearch = !workRequestSearchTerm || 
      request.title.toLowerCase().includes(workRequestSearchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(workRequestSearchTerm.toLowerCase())
    const matchesStatus = !workRequestStatusFilter || request.status === workRequestStatusFilter
    const matchesPriority = !workRequestPriorityFilter || request.priority === workRequestPriorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredRisks = riskItems.filter((risk: any) => {
    const matchesSearch = !riskSearchTerm || 
      risk.title.toLowerCase().includes(riskSearchTerm.toLowerCase()) ||
      risk.description.toLowerCase().includes(riskSearchTerm.toLowerCase())
    const matchesLevel = !riskLevelFilter || risk.level === riskLevelFilter
    const matchesStatus = !riskStatusFilter || risk.status === riskStatusFilter
    return matchesSearch && matchesLevel && matchesStatus
  })

  const filteredWbsItems = wbsItems.filter((item: any) => {
    const matchesSearch = !wbsSearchTerm || 
      item.name.toLowerCase().includes(wbsSearchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(wbsSearchTerm.toLowerCase())
    const matchesStatus = !wbsStatusFilter || item.status === wbsStatusFilter
    const matchesLevel = !wbsLevelFilter || item.level.toString() === wbsLevelFilter
    return matchesSearch && matchesStatus && matchesLevel
  })

  const filteredScheduleItems = scheduleItems.filter((item: any) => {
    const matchesSearch = !scheduleSearchTerm || 
      item.name.toLowerCase().includes(scheduleSearchTerm.toLowerCase())
    const matchesStatus = !scheduleStatusFilter || item.status === scheduleStatusFilter
    const matchesType = !scheduleTypeFilter || item.type === scheduleTypeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredStakeholders = stakeholderItems.filter((stakeholder: any) => {
    const matchesSearch = !stakeholderSearchTerm || 
      stakeholder.name.toLowerCase().includes(stakeholderSearchTerm.toLowerCase()) ||
      stakeholder.role.toLowerCase().includes(stakeholderSearchTerm.toLowerCase())
    const matchesInfluence = !stakeholderInfluenceFilter || stakeholder.influence === stakeholderInfluenceFilter
    const matchesInterest = !stakeholderInterestFilter || stakeholder.interest === stakeholderInterestFilter
    return matchesSearch && matchesInfluence && matchesInterest
  })

  const filteredComplianceItems = complianceItems.filter((item: any) => {
    const matchesSearch = !complianceSearchTerm || 
      item.requirement.toLowerCase().includes(complianceSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(complianceSearchTerm.toLowerCase())
    const matchesStatus = !complianceStatusFilter || item.status === complianceStatusFilter
    const matchesCategory = !complianceCategoryFilter || item.category === complianceCategoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, priorityFilter, departmentFilter, projectTypeFilter, tenantFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  // Get project display name
  const getProjectName = (project: ProjectCharter) => {
    return project.title || project.project_name || project.project_title || `Project ${project.id?.slice(0, 8)}`
  }

  // Get project team lead
  const getProjectTeamLead = (project: ProjectCharter) => {
    return project.assigned_team_lead || project.team_lead || project.project_manager || project.manager || 'Unassigned'
  }

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Projects',
      value: statistics.totalProjects,
      icon: Building,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active',
      value: statistics.activeProjects,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Completed',
      value: statistics.completedProjects,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'On Hold',
      value: statistics.onHoldProjects,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Work Requests',
      value: statistics.workRequests,
      icon: FileText,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pending WR',
      value: statistics.pendingWorkRequests,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Approved WR',
      value: statistics.approvedWorkRequests,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'High Risks',
      value: statistics.highRisks,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Total Budget',
      value: `$${statistics.totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }
  ]

  // Tab configuration
  const tabs = [
    { id: 'projects', label: 'Projects', count: statistics.totalProjects, icon: Building },
    { id: 'work-requests', label: 'Work Requests', count: statistics.workRequests, icon: FileText },
    { id: 'risks', label: 'Risks', count: risks.length, icon: AlertTriangle },
    { id: 'charter', label: 'Charter', icon: FileText },
    { id: 'wbs', label: 'WBS', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'evm', label: 'EVM', icon: TrendingUp },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: Shield }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project management data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive project lifecycle management with PMBOK framework</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
          {statisticsCards.map((stat, index: any) => (
            <Card key={index} className={`${stat.bgColor} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Filters & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e: any) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={departmentFilter}
                  onChange={(e: any) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
                
                {/* Tenant Filter - Only show for multi-tenant users */}
                {isMultiTenant && (
                  <select
                    value={tenantFilter}
                    onChange={(e: any) => setTenantFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Tenants</option>
                    {availableTenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setPriorityFilter('all')
                    setDepartmentFilter('all')
                    setProjectTypeFilter('all')
                    setTenantFilter('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Project List Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Enhanced Projects ({totalItems} total, showing {startIndex + 1}-{Math.min(endIndex, totalItems)})
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>

            {/* Projects Display */}
            {viewMode === 'list' ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedProjects.map((project: any) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{getProjectName(project)}</div>
                              {project.project_code && (
                                <div className="text-sm text-gray-500">{project.project_code}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{getProjectTeamLead(project)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={project.charter_status === 'active' ? 'default' : 'secondary'}>
                              {project.charter_status || 'draft'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                              {project.priority || 'medium'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${project.completion_percentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{project.completion_percentage || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(project.budget || project.estimated_budget || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project)
                                  setIsViewModalOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project)
                                  setIsEditModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProjects.map((project: any) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{getProjectName(project)}</CardTitle>
                          {project.project_code && (
                            <CardDescription>{project.project_code}</CardDescription>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project)
                              setIsViewModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge variant={project.charter_status === 'active' ? 'default' : 'secondary'}>
                            {project.charter_status || 'draft'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Priority:</span>
                          <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                            {project.priority || 'medium'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Team Lead:</span>
                          <span className="text-sm font-medium">{getProjectTeamLead(project)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Budget:</span>
                          <span className="text-sm font-medium">
                            ${(project.budget || project.estimated_budget || 0).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Progress:</span>
                            <span className="text-sm font-medium">{project.completion_percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.completion_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>

                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Work Requests Tab */}
        {activeTab === 'work-requests' && (
          <div className="space-y-6">
            {/* Work Requests Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Project Work Requests</h3>
                <p className="text-sm text-gray-600">Manage work requests associated with this project</p>
              </div>
              <Button onClick={() => setIsCreateWorkRequestModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Work Request
              </Button>
            </div>

            {/* Work Requests Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search work requests..."
                  value={workRequestSearchTerm}
                  onChange={(e) => setWorkRequestSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={workRequestStatusFilter}
                onChange={(e) => setWorkRequestStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={workRequestPriorityFilter}
                onChange={(e) => setWorkRequestPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Work Requests Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{request.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                            request.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status?.replace('_', ' ') || 'Submitted'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {request.budget ? `$${request.budget.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedWorkRequest(request)
                                setIsViewWorkRequestModalOpen(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWorkRequest(request)
                                setIsEditWorkRequestModalOpen(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWorkRequest(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredWorkRequests.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Requests</h3>
                  <p className="text-gray-600 mb-4">No work requests found matching your criteria.</p>
                  <Button onClick={() => setIsCreateWorkRequestModalOpen(true)}>
                    Create First Work Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risks Tab */}
        {activeTab === 'risks' && (
          <div className="space-y-6">
            {/* Risks Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Risk Register</h3>
                <p className="text-sm text-gray-600">Identify, assess, and manage project risks</p>
              </div>
              <Button onClick={() => setIsCreateRiskModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Risk
              </Button>
            </div>

            {/* Risk Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Critical Risks</p>
                    <p className="text-2xl font-bold text-red-900">{risks.filter(r => r.risk_level === 'critical').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-800">High Risks</p>
                    <p className="text-2xl font-bold text-orange-900">{risks.filter(r => r.risk_level === 'high').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">Medium Risks</p>
                    <p className="text-2xl font-bold text-yellow-900">{risks.filter(r => r.risk_level === 'medium').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Low Risks</p>
                    <p className="text-2xl font-bold text-green-900">{risks.filter(r => r.risk_level === 'low').length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search risks..."
                  value={riskSearchTerm}
                  onChange={(e) => setRiskSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={riskLevelFilter}
                onChange={(e) => setRiskLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Risk Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={riskStatusFilter}
                onChange={(e) => setRiskStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="identified">Identified</option>
                <option value="assessed">Assessed</option>
                <option value="mitigated">Mitigated</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Risks Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRisks.map((risk) => (
                      <tr key={risk.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{risk.risk_title || risk.title || risk.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{risk.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (risk.risk_level || risk.level || risk.severity) === 'critical' ? 'bg-red-100 text-red-800' :
                            (risk.risk_level || risk.level || risk.severity) === 'high' ? 'bg-orange-100 text-orange-800' :
                            (risk.risk_level || risk.level || risk.severity) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {(risk.risk_level || risk.level || risk.severity) || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {risk.probability || 'Medium'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {risk.impact || 'Medium'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            risk.status === 'closed' ? 'bg-green-100 text-green-800' :
                            risk.status === 'mitigated' ? 'bg-blue-100 text-blue-800' :
                            risk.status === 'assessed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {risk.status || 'Identified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {risk.owner || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRisk(risk)
                                setIsViewRiskModalOpen(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRisk(risk)
                                setIsEditRiskModalOpen(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRisk(risk.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredRisks.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Risks Identified</h3>
                  <p className="text-gray-600 mb-4">Start by identifying potential project risks.</p>
                  <Button onClick={() => setIsCreateRiskModalOpen(true)}>
                    Add First Risk
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charter Tab */}
        {activeTab === 'charter' && (
          <div className="space-y-6">
            {/* Charter Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Project Charter</h3>
                <p className="text-sm text-gray-600">Define project scope, objectives, and authorization</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCharterPreviewOpen(true)} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={() => setIsEditCharterModalOpen(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Charter
                </Button>
              </div>
            </div>

            {/* Charter Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Charter Status</h4>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedProject?.charter_status === 'approved' ? 'bg-green-100 text-green-800' :
                  selectedProject?.charter_status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                  selectedProject?.charter_status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedProject?.charter_status || 'Draft'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{selectedProject?.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{selectedProject?.updated_at ? new Date(selectedProject.updated_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved By</p>
                  <p className="text-sm text-gray-900">{selectedProject?.approved_by || 'Pending'}</p>
                </div>
              </div>
            </div>

            {/* Charter Content */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">Charter Details</h4>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Project Overview */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Project Overview</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProject?.project_name || selectedProject?.title || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Code</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProject?.project_code || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Manager</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProject?.project_manager || selectedProject?.manager || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sponsor</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProject?.sponsor || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Project Description</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {selectedProject?.description || 'No description provided'}
                  </p>
                </div>

                {/* Business Case */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Business Case</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {selectedProject?.business_case || 'Business case not defined'}
                  </p>
                </div>

                {/* Project Scope */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Project Scope</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {selectedProject?.project_scope || selectedProject?.scope || 'Project scope not defined'}
                  </p>
                </div>

                {/* Success Criteria */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Success Criteria</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {selectedProject?.success_criteria || 'Success criteria not defined'}
                  </p>
                </div>

                {/* Timeline & Budget */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Timeline & Budget</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedProject?.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedProject?.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Budget</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedProject?.budget ? `$${selectedProject.budget.toLocaleString()}` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProject?.department || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Stakeholders */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Key Stakeholders</h5>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {selectedProject?.stakeholders && selectedProject.stakeholders.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedProject.stakeholders.map((stakeholder: any, index: number) => (
                          <li key={index} className="text-sm text-gray-700">
                            • {stakeholder.name || stakeholder} - {stakeholder.role || 'Stakeholder'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-700">No stakeholders defined</p>
                    )}
                  </div>
                </div>

                {/* Assumptions & Constraints */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-md font-medium text-gray-900 mb-3">Assumptions</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                      {selectedProject?.assumptions || 'No assumptions documented'}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-md font-medium text-gray-900 mb-3">Constraints</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                      {selectedProject?.constraints || 'No constraints documented'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WBS Tab */}
        {activeTab === 'wbs' && (
          <div className="space-y-6">
            {/* WBS Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Work Breakdown Structure</h3>
                <p className="text-sm text-gray-600">Hierarchical decomposition of project work</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setWbsViewMode(wbsViewMode === 'tree' ? 'table' : 'tree')} className="flex items-center gap-2">
                  {wbsViewMode === 'tree' ? <BarChart3 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  {wbsViewMode === 'tree' ? 'Table View' : 'Tree View'}
                </Button>
                <Button onClick={() => setIsCreateWbsItemModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add WBS Item
                </Button>
              </div>
            </div>

            {/* WBS Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-900">{wbsItems.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{wbsItems.filter(item => item.status === 'completed').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-900">{wbsItems.filter(item => item.status === 'in_progress').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-800">Progress</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {wbsItems.length > 0 ? Math.round((wbsItems.filter(item => item.status === 'completed').length / wbsItems.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WBS Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search WBS items..."
                  value={wbsSearchTerm}
                  onChange={(e) => setWbsSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={wbsStatusFilter}
                onChange={(e) => setWbsStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <select
                value={wbsLevelFilter}
                onChange={(e) => setWbsLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>

            {/* WBS Content */}
            {wbsViewMode === 'tree' ? (
              /* Tree View */
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                  {filteredWbsItems.filter(item => !item.parent_id).map((rootItem) => (
                    <WbsTreeNode 
                      key={rootItem.id} 
                      item={rootItem} 
                      allItems={filteredWbsItems}
                      onEdit={(item) => {
                        setSelectedWbsItem(item)
                        setIsEditWbsItemModalOpen(true)
                      }}
                      onDelete={handleDeleteWbsItem}
                      onToggle={(itemId) => {
                        setExpandedWbsItems(prev => 
                          prev.includes(itemId) 
                            ? prev.filter(id => id !== itemId)
                            : [...prev, itemId]
                        )
                      }}
                      isExpanded={expandedWbsItems.includes(rootItem.id)}
                    />
                  ))}
                  
                  {filteredWbsItems.filter(item => !item.parent_id).length === 0 && (
                    <div className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No WBS Items</h3>
                      <p className="text-gray-600 mb-4">Start by creating the first work breakdown structure item.</p>
                      <Button onClick={() => setIsCreateWbsItemModalOpen(true)}>
                        Create First WBS Item
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Table View */
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WBS Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWbsItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            {item.wbs_code || `${item.level || 1}.${item.sequence || 1}`}
                          </td>
                          <td className="px-6 py-4">
                            <div style={{ paddingLeft: `${((item.level || 1) - 1) * 20}px` }}>
                              <div className="text-sm font-medium text-gray-900">{item.name || item.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Level {item.level || 1}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'completed' ? 'bg-green-100 text-green-800' :
                              item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status?.replace('_', ' ') || 'Not Started'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{item.progress || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.assignee || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedWbsItem(item)
                                  setIsViewWbsItemModalOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedWbsItem(item)
                                  setIsEditWbsItemModalOpen(true)
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWbsItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredWbsItems.length === 0 && (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No WBS Items</h3>
                    <p className="text-gray-600 mb-4">Start by creating the first work breakdown structure item.</p>
                    <Button onClick={() => setIsCreateWbsItemModalOpen(true)}>
                      Create First WBS Item
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Schedule Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Project Schedule</h3>
                <p className="text-sm text-gray-600">Timeline management and milestone tracking</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setScheduleViewMode(scheduleViewMode === 'gantt' ? 'timeline' : 'gantt')} className="flex items-center gap-2">
                  {scheduleViewMode === 'gantt' ? <Calendar className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  {scheduleViewMode === 'gantt' ? 'Timeline View' : 'Gantt View'}
                </Button>
                <Button onClick={() => setIsCreateMilestoneModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </Button>
              </div>
            </div>

            {/* Schedule Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Total Duration</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedProject?.start_date && selectedProject?.end_date 
                        ? Math.ceil((new Date(selectedProject.end_date).getTime() - new Date(selectedProject.start_date).getTime()) / (1000 * 60 * 60 * 24))
                        : 0} days
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Completed Tasks</p>
                    <p className="text-2xl font-bold text-green-900">{scheduleItems.filter(item => item.status === 'completed').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-900">{scheduleItems.filter(item => item.status === 'in_progress').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">
                      {scheduleItems.filter(item => 
                        item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed'
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search schedule items..."
                  value={scheduleSearchTerm}
                  onChange={(e) => setScheduleSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={scheduleStatusFilter}
                onChange={(e) => setScheduleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <select
                value={scheduleTypeFilter}
                onChange={(e) => setScheduleTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="milestone">Milestones</option>
                <option value="task">Tasks</option>
                <option value="deliverable">Deliverables</option>
              </select>
            </div>

            {/* Schedule Content */}
            {scheduleViewMode === 'gantt' ? (
              /* Gantt Chart View */
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900">Gantt Chart</h4>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {/* Gantt Header */}
                      <div className="flex border-b border-gray-200 pb-2 mb-4">
                        <div className="w-64 font-medium text-gray-900">Task</div>
                        <div className="flex-1 grid grid-cols-12 gap-1 text-xs text-gray-500">
                          {Array.from({length: 12}, (_, i) => (
                            <div key={i} className="text-center">
                              {new Date(2024, i).toLocaleDateString('en', {month: 'short'})}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Gantt Rows */}
                      {filteredScheduleItems.map((item) => (
                        <div key={item.id} className="flex items-center py-2 border-b border-gray-100">
                          <div className="w-64">
                            <div className="text-sm font-medium text-gray-900">{item.name || item.title}</div>
                            <div className="text-xs text-gray-500">{item.assignee || 'Unassigned'}</div>
                          </div>
                          <div className="flex-1 grid grid-cols-12 gap-1 h-8">
                            {Array.from({length: 12}, (_, monthIndex) => {
                              const startDate = item.start_date ? new Date(item.start_date) : null
                              const endDate = item.due_date ? new Date(item.due_date) : null
                              const currentMonth = new Date(2024, monthIndex)
                              const nextMonth = new Date(2024, monthIndex + 1)
                              
                              const isInRange = startDate && endDate && 
                                startDate < nextMonth && endDate >= currentMonth
                              
                              return (
                                <div key={monthIndex} className="relative">
                                  {isInRange && (
                                    <div className={`h-6 rounded ${
                                      item.status === 'completed' ? 'bg-green-400' :
                                      item.status === 'in_progress' ? 'bg-blue-400' :
                                      item.status === 'on_hold' ? 'bg-yellow-400' :
                                      'bg-gray-300'
                                    }`} />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {filteredScheduleItems.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Items</h3>
                      <p className="text-gray-600 mb-4">Start by adding milestones and tasks to your project schedule.</p>
                      <Button onClick={() => setIsCreateMilestoneModalOpen(true)}>
                        Add First Milestone
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Timeline View */
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredScheduleItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name || item.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.type === 'milestone' ? 'bg-purple-100 text-purple-800' :
                              item.type === 'deliverable' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.type || 'Task'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'completed' ? 'bg-green-100 text-green-800' :
                              item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status?.replace('_', ' ') || 'Not Started'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{item.progress || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'Not set'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Not set'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.assignee || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedScheduleItem(item)
                                  setIsViewScheduleItemModalOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedScheduleItem(item)
                                  setIsEditScheduleItemModalOpen(true)
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteScheduleItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredScheduleItems.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Items</h3>
                    <p className="text-gray-600 mb-4">Start by adding milestones and tasks to your project schedule.</p>
                    <Button onClick={() => setIsCreateMilestoneModalOpen(true)}>
                      Add First Milestone
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* EVM Tab */}
        {activeTab === 'evm' && (
          <div className="space-y-6">
            {/* EVM Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Earned Value Management</h3>
                <p className="text-sm text-gray-600">Track project performance and forecast completion</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEvmViewMode(evmViewMode === 'dashboard' ? 'detailed' : 'dashboard')} className="flex items-center gap-2">
                  {evmViewMode === 'dashboard' ? <BarChart3 className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  {evmViewMode === 'dashboard' ? 'Detailed View' : 'Dashboard View'}
                </Button>
                <Button onClick={() => setIsUpdateEvmModalOpen(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Update EVM
                </Button>
              </div>
            </div>

            {/* EVM Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Budget at Completion (BAC)</p>
                    <p className="text-2xl font-bold text-blue-900">${selectedProject?.budget?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Earned Value (EV)</p>
                    <p className="text-2xl font-bold text-green-900">${evmData.earnedValue?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-800">Actual Cost (AC)</p>
                    <p className="text-2xl font-bold text-orange-900">${evmData.actualCost?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-800">Planned Value (PV)</p>
                    <p className="text-2xl font-bold text-purple-900">${evmData.plannedValue?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* EVM Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Cost Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost Performance Index (CPI)</span>
                    <span className={`text-lg font-bold ${
                      evmData.cpi >= 1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {evmData.cpi?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost Variance (CV)</span>
                    <span className={`text-lg font-bold ${
                      evmData.costVariance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${evmData.costVariance?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost Variance %</span>
                    <span className={`text-lg font-bold ${
                      evmData.costVariancePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {evmData.costVariancePercent?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Schedule Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Schedule Performance Index (SPI)</span>
                    <span className={`text-lg font-bold ${
                      evmData.spi >= 1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {evmData.spi?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Schedule Variance (SV)</span>
                    <span className={`text-lg font-bold ${
                      evmData.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${evmData.scheduleVariance?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Schedule Variance %</span>
                    <span className={`text-lg font-bold ${
                      evmData.scheduleVariancePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {evmData.scheduleVariancePercent?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Project Forecasts</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimate at Completion (EAC)</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${evmData.estimateAtCompletion?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimate to Complete (ETC)</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${evmData.estimateToComplete?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Variance at Completion (VAC)</span>
                    <span className={`text-lg font-bold ${
                      evmData.varianceAtCompletion >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${evmData.varianceAtCompletion?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EVM Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">EVM Trend Analysis</h4>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">EVM Chart Visualization</p>
                  <p className="text-sm text-gray-400">Planned Value, Earned Value, and Actual Cost over time</p>
                </div>
              </div>
            </div>

            {/* EVM Detailed Table */}
            {evmViewMode === 'detailed' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900">EVM Detailed Breakdown</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earned Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {evmHistory.map((period, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {period.period || `Period ${index + 1}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${period.plannedValue?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${period.earnedValue?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${period.actualCost?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className={`${
                              period.cpi >= 1 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {period.cpi?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className={`${
                              period.spi >= 1 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {period.spi?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              period.cpi >= 1 && period.spi >= 1 ? 'bg-green-100 text-green-800' :
                              period.cpi >= 0.9 && period.spi >= 0.9 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {period.cpi >= 1 && period.spi >= 1 ? 'On Track' :
                               period.cpi >= 0.9 && period.spi >= 0.9 ? 'At Risk' : 'Off Track'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {evmHistory.length === 0 && (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No EVM Data</h3>
                    <p className="text-gray-600 mb-4">Start tracking earned value metrics for this project.</p>
                    <Button onClick={() => setIsUpdateEvmModalOpen(true)}>
                      Add EVM Data
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stakeholders Tab */}
        {activeTab === 'stakeholders' && (
          <div className="space-y-6">
            {/* Stakeholders Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Project Stakeholders</h3>
                <p className="text-sm text-gray-600">Manage stakeholder engagement and communication</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStakeholderViewMode(stakeholderViewMode === 'grid' ? 'list' : 'grid')} className="flex items-center gap-2">
                  {stakeholderViewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  {stakeholderViewMode === 'grid' ? 'List View' : 'Grid View'}
                </Button>
                <Button onClick={() => setIsCreateStakeholderModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Stakeholder
                </Button>
              </div>
            </div>

            {/* Stakeholder Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Total Stakeholders</p>
                    <p className="text-2xl font-bold text-blue-900">{stakeholderItems.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">High Influence</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stakeholderItems.filter(s => s.influence === 'high').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">High Interest</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {stakeholderItems.filter(s => s.interest === 'high').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-800">Key Players</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stakeholderItems.filter(s => s.influence === 'high' && s.interest === 'high').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stakeholder Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search stakeholders..."
                  value={stakeholderSearchTerm}
                  onChange={(e) => setStakeholderSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={stakeholderInfluenceFilter}
                onChange={(e) => setStakeholderInfluenceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Influence</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={stakeholderInterestFilter}
                onChange={(e) => setStakeholderInterestFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Interest</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Stakeholder Matrix */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Stakeholder Influence-Interest Matrix</h4>
              <div className="grid grid-cols-2 gap-4 h-64">
                {/* High Influence, High Interest */}
                <div className="border-2 border-red-300 bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2">Manage Closely</h5>
                  <p className="text-xs text-red-600 mb-2">High Influence, High Interest</p>
                  <div className="space-y-1">
                    {stakeholderItems
                      .filter(s => s.influence === 'high' && s.interest === 'high')
                      .slice(0, 3)
                      .map(stakeholder => (
                        <div key={stakeholder.id} className="text-xs bg-white p-1 rounded">
                          {stakeholder.name}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Low Influence, High Interest */}
                <div className="border-2 border-yellow-300 bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2">Keep Informed</h5>
                  <p className="text-xs text-yellow-600 mb-2">Low Influence, High Interest</p>
                  <div className="space-y-1">
                    {stakeholderItems
                      .filter(s => s.influence === 'low' && s.interest === 'high')
                      .slice(0, 3)
                      .map(stakeholder => (
                        <div key={stakeholder.id} className="text-xs bg-white p-1 rounded">
                          {stakeholder.name}
                        </div>
                      ))}
                  </div>
                </div>

                {/* High Influence, Low Interest */}
                <div className="border-2 border-blue-300 bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">Keep Satisfied</h5>
                  <p className="text-xs text-blue-600 mb-2">High Influence, Low Interest</p>
                  <div className="space-y-1">
                    {stakeholderItems
                      .filter(s => s.influence === 'high' && s.interest === 'low')
                      .slice(0, 3)
                      .map(stakeholder => (
                        <div key={stakeholder.id} className="text-xs bg-white p-1 rounded">
                          {stakeholder.name}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Low Influence, Low Interest */}
                <div className="border-2 border-gray-300 bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Monitor</h5>
                  <p className="text-xs text-gray-600 mb-2">Low Influence, Low Interest</p>
                  <div className="space-y-1">
                    {stakeholderItems
                      .filter(s => s.influence === 'low' && s.interest === 'low')
                      .slice(0, 3)
                      .map(stakeholder => (
                        <div key={stakeholder.id} className="text-xs bg-white p-1 rounded">
                          {stakeholder.name}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stakeholder List/Grid */}
            {stakeholderViewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStakeholders.map((stakeholder) => (
                  <div key={stakeholder.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-medium text-gray-900">{stakeholder.name}</h4>
                          <p className="text-sm text-gray-600">{stakeholder.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStakeholder(stakeholder)
                            setIsViewStakeholderModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStakeholder(stakeholder)
                            setIsEditStakeholderModalOpen(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Influence:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          stakeholder.influence === 'high' ? 'bg-red-100 text-red-800' :
                          stakeholder.influence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {stakeholder.influence}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Interest:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          stakeholder.interest === 'high' ? 'bg-red-100 text-red-800' :
                          stakeholder.interest === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {stakeholder.interest}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="text-sm text-gray-900">{stakeholder.department}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 line-clamp-2">{stakeholder.expectations}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stakeholder</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influence</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Communication</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStakeholders.map((stakeholder) => (
                        <tr key={stakeholder.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{stakeholder.name}</div>
                                <div className="text-sm text-gray-500">{stakeholder.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{stakeholder.role}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{stakeholder.department}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              stakeholder.influence === 'high' ? 'bg-red-100 text-red-800' :
                              stakeholder.influence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {stakeholder.influence}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              stakeholder.interest === 'high' ? 'bg-red-100 text-red-800' :
                              stakeholder.interest === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {stakeholder.interest}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{stakeholder.communication_frequency}</td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedStakeholder(stakeholder)
                                  setIsViewStakeholderModalOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStakeholder(stakeholder)
                                  setIsEditStakeholderModalOpen(true)
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStakeholder(stakeholder.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredStakeholders.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Stakeholders</h3>
                    <p className="text-gray-600 mb-4">Start by adding stakeholders to your project.</p>
                    <Button onClick={() => setIsCreateStakeholderModalOpen(true)}>
                      Add First Stakeholder
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Compliance Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Project Compliance</h3>
                <p className="text-sm text-gray-600">Track regulatory compliance and audit requirements</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setComplianceViewMode(complianceViewMode === 'overview' ? 'detailed' : 'overview')} className="flex items-center gap-2">
                  {complianceViewMode === 'overview' ? <FileText className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  {complianceViewMode === 'overview' ? 'Detailed View' : 'Overview'}
                </Button>
                <Button onClick={() => setIsCreateComplianceItemModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Compliance Item
                </Button>
              </div>
            </div>

            {/* Compliance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Compliant</p>
                    <p className="text-2xl font-bold text-green-900">
                      {complianceItems.filter(item => item.status === 'compliant').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {complianceItems.filter(item => item.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Non-Compliant</p>
                    <p className="text-2xl font-bold text-red-900">
                      {complianceItems.filter(item => item.status === 'non_compliant').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Pending Review</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {complianceItems.filter(item => item.status === 'pending_review').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Score */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Overall Compliance Score</h4>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Compliance Progress</span>
                    <span>{Math.round((complianceItems.filter(item => item.status === 'compliant').length / Math.max(complianceItems.length, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-600 h-4 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${(complianceItems.filter(item => item.status === 'compliant').length / Math.max(complianceItems.length, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="ml-6">
                  <div className={`text-3xl font-bold ${
                    (complianceItems.filter(item => item.status === 'compliant').length / Math.max(complianceItems.length, 1)) * 100 >= 80 ? 'text-green-600' :
                    (complianceItems.filter(item => item.status === 'compliant').length / Math.max(complianceItems.length, 1)) * 100 >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {Math.round((complianceItems.filter(item => item.status === 'compliant').length / Math.max(complianceItems.length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Compliant</div>
                </div>
              </div>
            </div>

            {/* Compliance Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search compliance items..."
                  value={complianceSearchTerm}
                  onChange={(e) => setComplianceSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={complianceStatusFilter}
                onChange={(e) => setComplianceStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="in_progress">In Progress</option>
                <option value="non_compliant">Non-Compliant</option>
                <option value="pending_review">Pending Review</option>
              </select>
              <select
                value={complianceCategoryFilter}
                onChange={(e) => setComplianceCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="regulatory">Regulatory</option>
                <option value="security">Security</option>
                <option value="privacy">Privacy</option>
                <option value="quality">Quality</option>
                <option value="environmental">Environmental</option>
              </select>
            </div>

            {/* Compliance Items */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredComplianceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.requirement}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.category === 'regulatory' ? 'bg-red-100 text-red-800' :
                            item.category === 'security' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'privacy' ? 'bg-purple-100 text-purple-800' :
                            item.category === 'quality' ? 'bg-green-100 text-green-800' :
                            item.category === 'environmental' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                            item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                            item.status === 'pending_review' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Not set'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.owner || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedComplianceItem(item)
                                setIsViewComplianceItemModalOpen(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedComplianceItem(item)
                                setIsEditComplianceItemModalOpen(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComplianceItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredComplianceItems.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Compliance Items</h3>
                  <p className="text-gray-600 mb-4">Start by adding compliance requirements for this project.</p>
                  <Button onClick={() => setIsCreateComplianceItemModalOpen(true)}>
                    Add First Compliance Item
                  </Button>
                </div>
              )}
            </div>

            {/* Compliance Audit Trail */}
            {complianceViewMode === 'detailed' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance Audit Trail</h4>
                <div className="space-y-4">
                  {complianceAuditTrail.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{entry.action}</div>
                        <div className="text-sm text-gray-600">{entry.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {entry.timestamp} by {entry.user}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {complianceAuditTrail.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No audit trail entries yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          workRequests={workRequests}
        />
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && selectedProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProject(null)
          }}
          onSubmit={(updates: any) => handleUpdateProject(selectedProject.id, updates)}
          project={selectedProject}
          workRequests={workRequests}
        />
      )}

      {/* View Project Modal */}
      {isViewModalOpen && selectedProject && (
        <ViewProjectModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedProject(null)
          }}
          project={selectedProject}
        />
      )}
    </DashboardLayout>
  )
}

// Create Project Modal Component
function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  workRequests 
}: { 
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<ProjectCharter>) => void
  workRequests: WorkRequest[]
}) {
  const [formData, setFormData] = useState<Partial<ProjectCharter>>({
    title: '',
    project_name: '',
    project_code: '',
    priority: 'medium',
    charter_status: 'draft',
    completion_percentage: 0,
    project_type: 'internal',
    billing_type: 'fixed'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                <Input
                  value={formData.project_code || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, project_code: e.target.value }))}
                  placeholder="e.g., PROJ-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select
                    value={formData.project_type || 'internal'}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="customer">Customer</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team & Organization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Team & Organization</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                <Input
                  value={formData.assigned_team_lead || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, assigned_team_lead: e.target.value }))}
                  placeholder="Assigned team lead"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                <Input
                  value={formData.sponsor || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, sponsor: e.target.value }))}
                  placeholder="Project sponsor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <Input
                    value={formData.division || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="Division"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Request Reference</label>
                <select
                  value={formData.work_request_id || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, work_request_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Create without work request</option>
                  {workRequests.filter((wr: any) => wr.status === 'approved').map((wr) => (
                    <option key={wr.id} value={wr.id}>
                      {wr.title || `Work Request ${wr.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PMBOK Framework Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">PMBOK Framework</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Scope</label>
                <textarea
                  value={formData.project_scope || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, project_scope: e.target.value }))}
                  placeholder="Define project scope and boundaries"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Success Criteria</label>
                <textarea
                  value={formData.success_criteria || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, success_criteria: e.target.value }))}
                  placeholder="Define success criteria and acceptance criteria"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Case</label>
                <textarea
                  value={formData.business_case || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, business_case: e.target.value }))}
                  placeholder="Business justification for the project"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Assessment</label>
                <textarea
                  value={formData.risk_assessment || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, risk_assessment: e.target.value }))}
                  placeholder="Initial risk assessment and mitigation strategies"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Metrics</label>
                <textarea
                  value={formData.quality_metrics || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, quality_metrics: e.target.value }))}
                  placeholder="Quality standards and metrics"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Project Modal Component
function EditProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project,
  workRequests 
}: { 
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<ProjectCharter>) => void
  project: ProjectCharter
  workRequests: WorkRequest[]
}) {
  const [formData, setFormData] = useState<Partial<ProjectCharter>>(project)

  useEffect(() => {
    setFormData(project)
  }, [project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                <Input
                  value={formData.project_code || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, project_code: e.target.value }))}
                  placeholder="e.g., PROJ-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.charter_status || 'draft'}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, charter_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Percentage</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completion_percentage || 0}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, completion_percentage: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Team & Organization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Team & Organization</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                <Input
                  value={formData.assigned_team_lead || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, assigned_team_lead: e.target.value }))}
                  placeholder="Assigned team lead"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                <Input
                  value={formData.sponsor || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, sponsor: e.target.value }))}
                  placeholder="Project sponsor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <Input
                    value={formData.division || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="Division"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// View Project Modal Component
function ViewProjectModal({ 
  isOpen, 
  onClose, 
  project 
}: { 
  isOpen: boolean
  onClose: () => void
  project: ProjectCharter
}) {
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
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
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{project.description || 'No description provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  project.priority === 'high' ? 'bg-red-100 text-red-800' :
                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  project.priority === 'low' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.priority || 'Not set'}
                </span>
              </div>

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

