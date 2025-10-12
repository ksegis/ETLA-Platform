'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Building,
  AlertCircle,
  Loader2,
  List,
  Grid,
  Target,
  Clipboard,
  BarChart3,
  Settings,
  MapPin,
  Timer,
  Award,
  Briefcase,
  Save,
  X,
  Shield,
  Network,
  ThumbsUp,
  ThumbsDown,
  Star,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Percent,
  Calculator,
  Tag,
  Building2,
  CreditCard,
  FileCheck,
  UserCheck,
  Clock3,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const supabase = createSupabaseBrowserClient()

 
// Complete PMBOK interface with all fields
interface ProjectCharter {
  id: string
  selectedTenant_id: string
  
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
  
  // Status and workflow
  charter_status?: string
  completion_percentage?: number
  schedule_variance?: number
  
  // Approval and authorization
  approved_by?: string
  approved_at?: string
  
  // Organization
  department?: string
  division?: string
  cost_center?: string
  
  // External references
  work_request_id?: string
  customer_id?: string
  external_project_id?: string
  contract_number?: string
  billing_type?: string
  
  // Timestamps
  created_at: string
  updated_at?: string
}
 
interface WorkRequest {
  id: string
  name?: string
  title?: string
  description?: string
  status?: string
  priority?: string
  selectedTenant_id: string
  created_at: string
  updated_at?: string
}
 
interface Risk {
  id: string
  name?: string
  title?: string
  description?: string
  status?: string
  selectedTenant_id: string
  created_at: string
  updated_at?: string
}
 
interface ProjectFilters {
  searchTerm: string
  status: string
  priority: string
  department: string
  projectType: string
}
 
export default function QueryFixedProjectManagementPage() {

  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setloading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCharter | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'work-requests' | 'risks'>('projects')
 
  // Enhanced filters
  const [filters, setFilters] = useState<ProjectFilters>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    department: 'all',
    projectType: 'all'
  })
 
  // Complete new project form state
  const [newProject, setNewProject] = useState<Partial<ProjectCharter>>({
    title: '',
    project_name: '',
    project_code: '',
    description: '',
    priority: 'medium',
    project_type: 'internal',
    charter_status: 'draft',
    completion_percentage: 0,
    budget: 0,
    estimated_budget: 0,
    actual_budget: 0,
    budget_variance: 0,
    schedule_variance: 0,
    stakeholders: [],
    milestone_schedule: [],
    deliverables: []
  })
 
  const { user } = useAuth()
  const { selectedTenant } = useTenant()
  const getDisplayName = (item: ProjectCharter | WorkRequest | Risk): string => {
    if ('title' in item && item.title) return item.title
    if ('project_name' in item && item.project_name) return item.project_name
    if ('name' in item && item.name) return item.name
    return 'Untitled'
  }
 
  // Fixed load data function with graceful field handling
  const loadData = async () => {
    if (!selectedTenant) {
      console.log('No selectedTenant selected, skipping load')
      setloading(false)
      return
    }
 
    try {
      setloading(true)
      setError(null)
      
      console.log('loading project data for selectedTenant:', selectedTenant);      // Load projects with graceful field handling
      try {
        console.log('loading from project_charters table...')
        
        // First, try to get basic fields that we know exist
        const { data: projectData, error: projectError } = await supabase
          .from('project_charters')
          .select('*') // Select all fields, let the database return what exists
          .eq('selectedTenant_id', selectedTenant) 
          .order('created_at', { ascending: false })
 
        if (projectError) {
          console.error('Project charters query error:', projectError)
          setError(`Failed to load projects: ${projectError.message}`);          setProjects([])
        } else {
          console.log('Successfully loaded projects:', projectData?.length || 0)
          console.log('Sample project data:', projectData?.[0])
          setProjects(projectData || [])
        }
      } catch (projectErr) {
        console.error('Error loading projects:', projectErr)
        setProjects([])
        setError('Failed to load projects. Please check database connection.')
      }
 
      // Load work requests with graceful handling
      try {
        console.log('loading from work_requests table...')
        const { data: workRequestData, error: workRequestError } = await supabase
          .from('work_requests')
          .select('*') // Select all fields
          .eq('selectedTenant_id', selectedTenant) 
          .order('created_at', { ascending: false })
 
        if (workRequestError) {
          console.error('Work requests query error:', workRequestError)
          setWorkRequests([])
        } else {
          console.log('Successfully loaded work requests:', workRequestData?.length || 0)
          setWorkRequests(workRequestData || [])
        }
      } catch (workRequestErr) {
        console.error('Error loading work requests:', workRequestErr)
        setWorkRequests([])
      }
 
      // Load risks with graceful handling
      try {
        console.log('loading from risk_register table...')
        const { data: riskData, error: riskError } = await supabase
          .from('risk_register')
          .select('*') // Select all fields
          .eq('selectedTenant_id', selectedTenant) 
          .order('created_at', { ascending: false })
 
        if (riskError) {
          console.error('Risk register query error:', riskError)
          setRisks([])
        } else {
          console.log('Successfully loaded risks:', riskData?.length || 0)
          setRisks(riskData || [])
        }
      } catch (riskErr) {
        console.error('Error loading risks:', riskErr)
        setRisks([])
      }
 
    } catch (err) {
      console.error('Unexpected error loading data:', err)
      setError('Failed to load project management data. Please check your database connection.')
    } finally {
      setloading(false)
    }
  }
 
  // Load data when selectedTenant is selected
  useEffect(() => {
    loadData()
  }, [selectedTenant])
 
  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => 
      p.charter_status === 'active' || 
      p.charter_status === 'approved' || 
      p.charter_status === 'in_progress'
    ).length,
    completedProjects: projects.filter((p) => 
      p.completion_percentage === 100 || 
      p.charter_status === 'completed'
    ).length,
    totalBudget: projects.reduce((sum, p: any) => sum + (p.budget || p.estimated_budget || 0), 0),
    totalWorkRequests: workRequests.length,
    totalRisks: risks.length,
    averageCompletion: projects.length > 0 
      ? Math.round(projects.reduce((sum: any, p) => sum + (p.completion_percentage || 0), 0) / projects.length)
      : 0
  }
 
  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
    const title = project.title || project.project_name || ''
    const description = project.description || project.business_case || ''
    const projectCode = project.project_code || ''
    const teamLead = project.assigned_team_lead || project.team_lead || project.project_manager || ''
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         projectCode.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         teamLead.toLowerCase().includes(filters.searchTerm.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || project.charter_status === filters.status
    const matchesPriority = filters.priority === 'all' || project.priority === filters.priority
    const matchesDepartment = filters.department === 'all' || project.department === filters.department
    const matchesProjectType = filters.projectType === 'all' || project.project_type === filters.projectType
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesProjectType
  })
 
  // Filter work requests and risks
  const filteredWorkRequests = workRequests.filter((wr: any) => {
    const name = wr.name || wr.title || ''
    const description = wr.description || ''
    
    const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || wr.status === filters.status
    
    return matchesSearch && matchesStatus
  })
 
  const filteredRisks = risks.filter((risk: any) => {
    const name = risk.name || risk.title || ''
    const description = risk.description || ''
    
    const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || risk.status === filters.status
    
    return matchesSearch && matchesStatus
  })
 
  // Helper functions
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }
 
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
 
  const getStatusColor = (status: string | null | undefined) => {
    const statusLower = (status || '').toLowerCase()
    switch (statusLower) {
      case 'active':
      case 'approved':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'draft':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'on_hold':
        return 'bg-orange-100 text-orange-800'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
 
  const getPriorityColor = (priority: string | null | undefined) => {
    const priorityLower = (priority || '').toLowerCase()
    switch (priorityLower) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
 
  // Fixed create project function with graceful field handling
  const handleCreateProject = async () => {
    if (!selectedTenant || !newProject.title) {
      setError('Please provide a project title and ensure a selectedTenant is selected.')
      return
    }
 
    try {
      setError(null)
      
      // Only include fields that have values to avoid null constraint issues
      const projectData: any = {
                selectedTenant_id: selectedTenant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
 
      // Add fields only if they have values
      if (newProject.title) projectData.title = newProject.title
      if (newProject.project_name) projectData.project_name = newProject.project_name
      if (newProject.project_code) projectData.project_code = newProject.project_code
      if (newProject.description) projectData.description = newProject.description
      if (newProject.priority) projectData.priority = newProject.priority
      if (newProject.project_type) projectData.project_type = newProject.project_type
      if (newProject.start_date) projectData.start_date = newProject.start_date
      if (newProject.end_date) projectData.end_date = newProject.end_date
      if (newProject.budget !== undefined) projectData.budget = newProject.budget
      if (newProject.estimated_budget !== undefined) projectData.estimated_budget = newProject.estimated_budget
      if (newProject.assigned_team_lead) projectData.assigned_team_lead = newProject.assigned_team_lead
      if (newProject.sponsor) projectData.sponsor = newProject.sponsor
      if (newProject.department) projectData.department = newProject.department
      if (newProject.charter_status) projectData.charter_status = newProject.charter_status
      if (newProject.completion_percentage !== undefined) projectData.completion_percentage = newProject.completion_percentage
      if (newProject.business_case) projectData.business_case = newProject.business_case
      if (newProject.project_scope) projectData.project_scope = newProject.project_scope
      if (newProject.success_criteria) projectData.success_criteria = newProject.success_criteria
 
      console.log('Creating project with data:', projectData)
 
      const { data, error } = await supabase
        .from('project_charters')
        .insert([projectData])
        .select()
 
      if (error) {
        console.error('Error creating project:', error)
        setError(`Failed to create project: ${error.message}`)
        return
      }
 
      console.log('Project created successfully:', data)
      setNewProject({
        title: '',
        project_name: '',
        project_code: '',
        description: '',
        priority: 'medium',
        project_type: 'internal',
        charter_status: 'draft',
        completion_percentage: 0,
        budget: 0,
        estimated_budget: 0,
        actual_budget: 0,
        budget_variance: 0,
        schedule_variance: 0,
        stakeholders: [],
        milestone_schedule: [],
        deliverables: []
      })
      setShowCreateModal(false)
      loadData()
    } catch (err: any) {
      console.error('Unexpected error creating project:', err)
      setError(`Failed to create project: ${err.message}`)
    }
  }
}





