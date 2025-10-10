'use client'

import { useState, useEffect } from 'react'
// keep the rest of your normal imports here, e.g.
// import { createClient } from '@/lib/supabase'
// import { Button } from '@/components/ui/button'
// ...

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
  AlertCircle as AlertCircleIcon,
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
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

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

  // Status and progress
  status?: string
  progress?: number
  health?: string
  issues?: any[]
  risks?: any[]
  change_requests?: any[]

  // Metadata
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  version?: number
  tags?: string[]
  attachments?: any[]

  // Financials
  cost_benefit_analysis?: string
  roi?: number
  npv?: number
  irr?: number

  // Stakeholder details
  stakeholder_register?: any[]

  // Quality management
  quality_assurance_plan?: string
  quality_control_plan?: string

  // Procurement
  procurement_plan?: string

  // Closing
  project_closure_report?: string
  lessons_learned?: string
}

const ProjectManagementPage = () => {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const supabase = createSupabaseBrowserClient()

  const [projects, setProjects] = useState<ProjectCharter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<any>({})

  useEffect(() => {
    if (tenant) {
      fetchProjects()
    }
  }, [tenant])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('pmbok')
        .select('*')
        .eq('tenant_id', tenant.tenant_id)

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
      }

      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          query = query.eq(key, filters[key])
        }
      })

      const { data, error } = await query

      if (error) {
        throw error
      }

      setProjects(data as ProjectCharter[])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchProjects()
  }

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div></DashboardLayout>
  }

  if (error) {
    return <DashboardLayout><div className="text-red-500 p-4">{error}</div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Project Management</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setView(view === 'list' ? 'grid' : 'list')}>
              {view === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 bg-card p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
            <Button onClick={applyFilters} className="w-full md:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Project View */}
        {view === 'list' ? (
          <ProjectListView projects={projects} />
        ) : (
          <ProjectGridView projects={projects} />
        )}
      </div>
    </DashboardLayout>
  )
}

const ProjectListView = ({ projects }: { projects: ProjectCharter[] }) => (
  <div className="space-y-4">
    {projects.map(project => (
      <Card key={project.id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.title}</CardTitle>
            <ProjectActions project={project} />
          </div>
          <CardDescription>{project.project_code}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{project.description}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Badge variant={getPriorityBadge(project.priority)}>{project.priority}</Badge>
              <Badge variant="secondary">{project.project_type}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{project.end_date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>{project.budget}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const ProjectGridView = ({ projects }: { projects: ProjectCharter[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {projects.map(project => (
      <Card key={project.id} className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.title}</CardTitle>
            <ProjectActions project={project} />
          </div>
          <CardDescription>{project.project_code}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="mb-4 text-sm">{project.description}</p>
        </CardContent>
        <div className="p-6 pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Badge variant={getPriorityBadge(project.priority)}>{project.priority}</Badge>
              <Badge variant="secondary">{project.project_type}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{project.end_date}</span>
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
)

const ProjectActions = ({ project }: { project: ProjectCharter }) => (
  <div className="flex items-center space-x-2">
    <Button variant="ghost" size="icon">
      <Eye className="w-4 h-4" />
    </Button>
    <Button variant="ghost" size="icon">
      <Edit className="w-4 h-4" />
    </Button>
    <Button variant="ghost" size="icon" className="text-red-500">
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
)

const getPriorityBadge = (priority: string | undefined) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'secondary'
  }
}

export default ProjectManagementPage

