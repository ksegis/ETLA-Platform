'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { createSupabaseBrowserClient } from '@/lib/supabase';

// Schema-compatible interfaces that work with existing database structure
interface ProjectCharter {
  id: string;
  name?: string; // Use 'name' if 'title' doesn't exist
  title?: string; // Keep title as optional
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  assigned_team_lead?: string;
  team_lead?: string; // Alternative field name
  tenant_id: string;
  created_at: string;
  updated_at: string;
  // PMBOK Framework fields (all optional for compatibility)
  project_scope?: string;
  success_criteria?: string;
  stakeholders?: string[];
  risk_assessment?: string;
  quality_metrics?: string;
  communication_plan?: string;
  resource_requirements?: string;
  milestone_schedule?: any[];
  deliverables?: string[];
  constraints?: string;
  assumptions?: string;
  work_request_id?: string;
  project_code?: string;
  business_case?: string;
  charter_status?: string;
  estimated_budget?: number;
}

interface WorkRequest {
  id: string;
  name?: string; // Use 'name' if 'title' doesn't exist
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  customer_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  business_justification?: string;
  estimated_budget?: number;
  requested_completion_date?: string;
  department?: string;
  requestor_name?: string;
  customer_name?: string;
  customer_email?: string;
  category?: string;
}

interface Risk {
  id: string;
  name?: string; // Use 'name' if 'risk_title' doesn't exist
  risk_title?: string;
  title?: string;
  risk_description?: string;
  description?: string;
  risk_level?: string;
  level?: string;
  status?: string;
  project_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  mitigation_plan?: string;
  impact_assessment?: string;
  probability?: string;
}

interface ProjectFilters {
  searchTerm: string;
  status: string;
  priority: string;
  teamLead: string;
  dateRange: string;
}

export default function EnhancedProjectManagementPage() {
  const [projects, setProjects] = useState<ProjectCharter[]>([]);
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectCharter | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'work-requests' | 'risks' | 'charter' | 'wbs' | 'schedule' | 'evm' | 'stakeholders' | 'compliance'>('projects');
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  // Enhanced filters
  const [filters, setFilters] = useState<ProjectFilters>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    teamLead: 'all',
    dateRange: 'all'
  });

  // New project form state
  const [newProject, setNewProject] = useState<Partial<ProjectCharter>>({
    title: '',
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget: 0,
    assigned_team_lead: '',
    team_lead: '',
    project_scope: '',
    success_criteria: '',
    stakeholders: [],
    risk_assessment: '',
    quality_metrics: '',
    communication_plan: '',
    resource_requirements: '',
    milestone_schedule: [],
    deliverables: [],
    constraints: '',
    assumptions: '',
    work_request_id: '',
    project_code: '',
    business_case: '',
    charter_status: 'draft'
  });

  const { user } = useAuth();
  const { selectedTenant } = useTenant();

  // Helper function to get display title from project
  const getProjectTitle = (project: ProjectCharter): string => {
    return project.title || project.name || 'Untitled Project';
  };

  // Helper function to get display name from work request
  const getWorkRequestTitle = (workRequest: WorkRequest): string => {
    return workRequest.title || workRequest.name || 'Untitled Request';
  };

  // Helper function to get display name from risk
  const getRiskTitle = (risk: Risk): string => {
    return risk.risk_title || risk.title || risk.name || 'Untitled Risk';
  };

  // Helper function to get team lead
  const getTeamLead = (project: ProjectCharter): string => {
    return project.assigned_team_lead || project.team_lead || '';
  };

  // Initialize Supabase client
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Check available tables in database
  const checkAvailableTables = async () => {
    try {
      // Try to query information_schema to see what tables exist
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');

      if (!error && data) {
        const tableNames = data.map((row: any) => row.table_name);
        setAvailableTables(tableNames);
        console.log('Available tables:', tableNames);
      }
    } catch (err) {
      console.log('Could not check available tables, will try direct queries');
    }
  };

  // Enhanced load data function with schema compatibility
  const loadData = async () => {
    if (!selectedTenant) {
      console.log('No tenant selected, skipping load');
      setLoading(false);
      return;
    }

    try {
     setLoading(true);
      setError(null);
     console.log('loading project data for tenant:', selectedTenant);     // Check available tables first      await checkAvailableTables();
      // Try multiple table names for projects
      const projectTableNames = ['project_charters', 'projects', 'project_charter'];
      let projectData: any[] = [];
      
      for (const tableName of projectTableNames) {
        try {
          console.log(`Trying to load from table: ${tableName}`);
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('tenant_id', selectedTenant)

            .order('created_at', { ascending: false });

          if (!error && data) {
            console.log(`Successfully loaded ${data.length} projects from ${tableName}`);
            projectData = data;
            break;
          } else if (error) {
            console.log(`Table ${tableName} query failed:`, error.message);
          }
        } catch (err) {
          console.log(`Error querying ${tableName}:`, err);
        }
      }
      
      setProjects(projectData || []);

      // Try multiple table names for work requests
      const workRequestTableNames = ['work_requests', 'workrequests', 'requests'];
      let workRequestData: any[] = [];
      
      for (const tableName of workRequestTableNames) {
        try {
          console.log(`Trying to load from table: ${tableName}`);
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('tenant_id', selectedTenant)

            .order('created_at', { ascending: false });

          if (!error && data) {
            console.log(`Successfully loaded ${data.length} work requests from ${tableName}`);
            workRequestData = data;
            break;
          } else if (error) {
            console.log(`Table ${tableName} query failed:`, error.message);
          }
        } catch (err) {
          console.log(`Error querying ${tableName}:`, err);
        }
      }
      
      setWorkRequests(workRequestData || []);

      // Try multiple table names for risks
      const riskTableNames = ['risks', 'risk', 'project_risks'];
      let riskData: any[] = [];
      
      for (const tableName of riskTableNames) {
        try {
          console.log(`Trying to load from table: ${tableName}`);
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('tenant_id', selectedTenant)

            .order('created_at', { ascending: false });

          if (!error && data) {
            console.log(`Successfully loaded ${data.length} risks from ${tableName}`);
            riskData = data;
            break;
          } else if (error) {
            console.log(`Table ${tableName} query failed:`, error.message);
          }
        } catch (err) {
          console.log(`Error querying ${tableName}:`, err);
        }
      }
      
      setRisks(riskData || []);

      // Show informational message about available data
      if (projectData.length === 0 && workRequestData.length === 0 && riskData.length === 0) {
        setError('No project management tables found or they contain no data. You may need to set up the database schema.');
      }

    } catch (err) {
      console.error('Unexpected error loading data:', err);
      setError('Failed to load project management data. The database schema may need to be set up.');
    } finally {
      setLoading(false);
    }
  };

  // Load data when tenant is selected
  useEffect(() => {
    loadData();
  }, [selectedTenant]);

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => ['active', 'in_progress', 'planning'].includes(p.status || '')).length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    onHoldProjects: projects.filter((p) => p.status === 'on_hold').length,
    totalWorkRequests: workRequests.length,
    pendingWorkRequests: workRequests.filter((wr) => ['submitted', 'under_review'].includes(wr.status || '')).length,
    approvedWorkRequests: workRequests.filter((wr) => wr.status === 'approved').length,
    totalBudget: projects.reduce((sum, p: any) => sum + (p.budget || 0), 0),
    totalRisks: risks.length,
    highRisks: risks.filter((r) => (r.risk_level || r.level) === 'high').length,
    mitigatedRisks: risks.filter((r) => r.status === 'resolved').length
  };

  // Filter projects with schema compatibility
  const filteredProjects = projects.filter((project: any) => {
    const title = getProjectTitle(project);
    const description = project.description || '';
    const teamLead = getTeamLead(project);
    const projectCode = project.project_code || '';
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         teamLead.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         projectCode.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || project.status === filters.status;
    const matchesPriority = filters.priority === 'all' || project.priority === filters.priority;
    const matchesTeamLead = filters.teamLead === 'all' || teamLead === filters.teamLead;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTeamLead;
  });

  // Filter work requests with schema compatibility
  const filteredWorkRequests = workRequests.filter((wr: any) => {
    const title = getWorkRequestTitle(wr);
    const description = wr.description || '';
    const customerName = wr.customer_name || '';
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || wr.status === filters.status;
    const matchesPriority = filters.priority === 'all' || wr.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Filter risks with schema compatibility
  const filteredRisks = risks.filter((risk: any) => {
    const title = getRiskTitle(risk);
    const description = risk.risk_description || risk.description || '';
    
    const matchesSearch = title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || risk.status === filters.status;
    const matchesPriority = filters.priority === 'all' || (risk.risk_level || risk.level) === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  type StatusVariant = React.ComponentProps<typeof Badge>["variant"];
  const statusToVariant: Record<string, StatusVariant> = {
    planning: "secondary",
    draft: "secondary",
    active: "default",
    in_progress: "default",
    completed: "success",
    on_hold: "warning",
    cancelled: "destructive",
    approved: "success",
    submitted: "default",
    under_review: "warning",
    rejected: "destructive",
    declined: "destructive",
    resolved: "success",
    mitigated: "success",
  };

  type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];
  const severityToVariant: Record<"high" | "medium" | "low", BadgeVariant> = {
    high: "destructive",
    medium: "secondary",
    low: "outline",
  };

  // Schema-compatible create project function
  const handleCreateProject = async () => {
    if (!selectedTenant || (!newProject.title && !newProject.name)) {
      setError('Please provide a project title and ensure a tenant is selected.');
      return;
    }

    try {
      setError(null);
      
      // Prepare data with both title and name fields for compatibility
      const projectData = {
        ...newProject,
        title: newProject.title || newProject.name,
        name: newProject.name || newProject.title,
        tenant_id: selectedTenant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try different table names
      const projectTableNames = ['project_charters', 'projects', 'project_charter'];
      let success = false;
      
      for (const tableName of projectTableNames) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .insert([projectData])
            .select();

          if (!error && data) {
            console.log(`Project created in ${tableName}:`, data);
            setProjects(prev => [data[0], ...prev]);
            setShowCreateModal(false);
            resetNewProject();
            success = true;
            break;
          } else if (error) {
            console.log(`Table ${tableName} query failed:`, error.message);
          }
        } catch (err) {
          console.log(`Error querying ${tableName}:`, err);
        }
      }
      
      if (!success) {
        setError('Failed to create project in any known table. Please check your database schema.');
      }

    } catch (err) {
      console.error('Unexpected error creating project:', err);
      setError('Failed to create project. Please try again.');
    }
  };

  // Schema-compatible update project function
  const handleUpdateProject = async () => {
    if (!selectedProject?.id || !selectedTenant || (!selectedProject.title && !selectedProject.name)) {
      setError('Please select a project, provide a title, and ensure a tenant is selected.');
      return;
    }

    try {
      setError(null);

      const projectData = {
        ...selectedProject,
        title: selectedProject.title || selectedProject.name,
        name: selectedProject.name || selectedProject.title,
        updated_at: new Date().toISOString()
      };

      const projectTableNames = ['project_charters', 'projects', 'project_charter'];
      let success = false;

      for (const tableName of projectTableNames) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .update(projectData)
            .eq('id', selectedProject.id)
            .eq('tenant_id', selectedTenant)

            .select();

          if (!error && data) {
            console.log(`Project updated in ${tableName}:`, data);
            setProjects(prev => prev.map(p => (p.id === data[0].id ? data[0] : p)));
            setShowEditModal(false);
            setSelectedProject(null);
            success = true;
            break;
          } else if (error) {
            console.log(`Table ${tableName} update failed:`, error.message);
          }
        } catch (err) {
          console.log(`Error updating ${tableName}:`, err);
        }
      }

      if (!success) {
        setError('Failed to update project in any known table. Please check your database schema.');
      }

    } catch (err) {
      console.error('Unexpected error updating project:', err);
      setError('Failed to update project. Please try again.');
    }
  };

  // Schema-compatible delete project function
  const handleDeleteProject = async (projectId: string) => {
    if (!selectedTenant) {
      setError('No tenant selected.');
      return;
    }

    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setError(null);

      const projectTableNames = ['project_charters', 'projects', 'project_charter'];
      let success = false;

      for (const tableName of projectTableNames) {
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', projectId)
            .eq('tenant_id', selectedTenant)
;

          if (!error) {
            console.log(`Project deleted from ${tableName}:`, projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            success = true;
            break;
          } else if (error) {
            console.log(`Table ${tableName} delete failed:`, error.message);
          }
        } catch (err) {
          console.log(`Error deleting from ${tableName}:`, err);
        }
      }

      if (!success) {
        setError('Failed to delete project from any known table. Please check your database schema.');
      }

    } catch (err) {
      console.error('Unexpected error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const resetNewProject = () => {
    setNewProject({
      title: '',
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      end_date: '',
      budget: 0,
      assigned_team_lead: '',
      team_lead: '',
      project_scope: '',
      success_criteria: '',
      stakeholders: [],
      risk_assessment: '',
      quality_metrics: '',
      communication_plan: '',
      resource_requirements: '',
      milestone_schedule: [],
      deliverables: [],
      constraints: '',
      assumptions: '',
      work_request_id: '',
      project_code: '',
      business_case: '',
      charter_status: 'draft'
    });
  };

  const getPriorityBadge = (priority: string | null | undefined) => {
   return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Project Management (Schema Compatible)</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Clipboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">{stats.activeProjects} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWorkRequests}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingWorkRequests} pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRisks}</div>
                <p className="text-xs text-muted-foreground">{stats.highRisks} high priority</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search projects, requests, risks..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full"
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="all">All Statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="declined">Declined</option>
                <option value="resolved">Resolved</option>
                <option value="mitigated">Mitigated</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="critical">Critical</option>
              </select>
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
                {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Project
              </Button>
            </div>
          </div>

          {/* Tabs for Projects, Work Requests, Risks */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`
                    ${activeTab === 'projects'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  Projects ({filteredProjects.length})
                </button>
                <button
                  onClick={() => setActiveTab('work-requests')}
                  className={`
                    ${activeTab === 'work-requests'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  Work Requests ({filteredWorkRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab('risks')}
                  className={`
                    ${activeTab === 'risks'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  Risks ({filteredRisks.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  {filteredProjects.length === 0 ? (
                    <p className="text-gray-500">No projects found matching your criteria.</p>
                  ) : viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProjects.map((project) => (
                            <tr key={project.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getProjectTitle(project)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Badge variant={getStatusBadge(risk.status)}>{risk.status}</Badge></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Badge variant={getPriorityBadge(project.priority)}>{project.priority}</Badge></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeamLead(project)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(project.start_date || '')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(project.end_date || '')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedProject(project);
                                  setShowEditModal(true);
                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProjects.map((project) => (
                        <Card key={project.id}>
                          <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                              {getProjectTitle(project)}
                              <div className="flex space-x-2">
                                <Badge variant={statusToVariant[project.status?.toLowerCase() || 'default']}>{project.status}</Badge>
                                {getPriorityBadge(project.priority)}
                              </div>
                            </CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm text-gray-600">
                            <p className="flex items-center"><Users className="h-4 w-4 mr-2" /> Team Lead: {getTeamLead(project)}</p>
                            <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Start: {formatDate(project.start_date || '')}</p>
                            <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> End: {formatDate(project.end_date || '')}</p>
                            <p className="flex items-center"><DollarSign className="h-4 w-4 mr-2" /> Budget: {formatCurrency(project.budget || 0)}</p>
                            <div className="flex justify-end space-x-2 mt-4">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedProject(project);
                                setShowEditModal(true);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'work-requests' && (
                <div className="space-y-4">
                  {filteredWorkRequests.length === 0 ? (
                    <p className="text-gray-500">No work requests found matching your criteria.</p>
                  ) : viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredWorkRequests.map((wr) => (
                            <tr key={wr.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getWorkRequestTitle(wr)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Badge variant={getStatusBadge(wr.status)}>{wr.status}</Badge></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Badge variant={getPriorityBadge(wr.priority)}>{wr.priority}</Badge></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wr.customer_name || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(wr.created_at)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium"
                                  onClick={() => {
                                    setSelectedWorkRequest(wr);
                                    setShowApprovalModal(true);
                                  }}
                                >
                                  Approve
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredWorkRequests.map((wr) => (
                        <Card key={wr.id}>
                          <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                              {getWorkRequestTitle(wr)}
                              <div className="flex space-x-2">
                                {getStatusBadge(wr.status)}
                                {getPriorityBadge(wr.priority)}
                              </div>
                            </CardTitle>
                            <CardDescription>{wr.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm text-gray-600">
                            <p className="flex items-center"><Users className="h-4 w-4 mr-2" /> Customer: {wr.customer_name || 'N/A'}</p>
                            <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Created: {formatDate(wr.created_at)}</p>
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium"
                                onClick={() => {
                                  setSelectedWorkRequest(wr);
                                  setShowApprovalModal(true);
                                }}
                              >
                                Approve
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'risks' && (
                <div className="space-y-4">
                  {filteredRisks.length === 0 ? (
                    <p className="text-gray-500">No risks found matching your criteria.</p>
                  ) : viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredRisks.map((risk) => (
                            <tr key={risk.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getRiskTitle(risk)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Badge variant={getPriorityBadge(risk.risk_level || risk.level)}>{risk.risk_level || risk.level}</Badge></td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Badge variant={getStatusBadge(risk.status)}>{risk.status}</Badge></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risk.project_id || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(risk.created_at)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  // Implement risk edit logic
                                }} className="text-blue-600 hover:text-blue-900">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  // Implement risk delete logic
                                }} className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRisks.map((risk) => (
                        <Card key={risk.id}>
                          <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                              {getRiskTitle(risk)}
                              <div className="flex space-x-2">
                                {getPriorityBadge(risk.risk_level || risk.level)}
                                {getStatusBadge(risk.status)}
                              </div>
                            </CardTitle>
                            <CardDescription>{risk.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm text-gray-600">
                            <p className="flex items-center"><Clipboard className="h-4 w-4 mr-2" /> Project ID: {risk.project_id || 'N/A'}</p>
                            <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Created: {formatDate(risk.created_at)}</p>
                            <div className="flex justify-end space-x-2 mt-4">
                              <Button variant="ghost" size="sm" onClick={() => {
                                // Implement risk edit logic
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => {
                                // Implement risk delete logic
                              }} className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="newProjectTitle" className="block text-sm font-medium text-gray-700">Project Title</label>
                <Input
                  type="text"
                  id="newProjectTitle"
                  value={newProject.title || ''}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value, name: e.target.value })}
                  className="mt-1 block w-full"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label htmlFor="newProjectDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="newProjectDescription"
                  rows={3}
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Brief description of the project"
                ></textarea>
              </div>
              <div>
                <label htmlFor="newProjectStatus" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="newProjectStatus"
                  value={newProject.status || 'planning'}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="newProjectPriority" className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  id="newProjectPriority"
                  value={newProject.priority || 'medium'}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label htmlFor="newProjectStartDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  id="newProjectStartDate"
                  value={newProject.start_date ? newProject.start_date.split('T')[0] : ''}
                  onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="newProjectEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  id="newProjectEndDate"
                  value={newProject.end_date ? newProject.end_date.split('T')[0] : ''}
                  onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="newProjectBudget" className="block text-sm font-medium text-gray-700">Budget</label>
                <Input
                  type="number"
                  id="newProjectBudget"
                  value={newProject.budget || 0}
                  onChange={(e) => setNewProject({ ...newProject, budget: parseFloat(e.target.value) })}
                  className="mt-1 block w-full"
                  placeholder="Enter budget amount"
                />
              </div>
              <div>
                <label htmlFor="newProjectTeamLead" className="block text-sm font-medium text-gray-700">Team Lead</label>
                <Input
                  type="text"
                  id="newProjectTeamLead"
                  value={newProject.assigned_team_lead || newProject.team_lead || ''}
                  onChange={(e) => setNewProject({ ...newProject, assigned_team_lead: e.target.value, team_lead: e.target.value })}
                  className="mt-1 block w-full"
                  placeholder="Enter team lead name"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="editProjectTitle" className="block text-sm font-medium text-gray-700">Project Title</label>
                <Input
                  type="text"
                  id="editProjectTitle"
                  value={selectedProject.title || selectedProject.name || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, title: e.target.value, name: e.target.value })}
                  className="mt-1 block w-full"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label htmlFor="editProjectDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="editProjectDescription"
                  rows={3}
                  value={selectedProject.description || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Brief description of the project"
                ></textarea>
              </div>
              <div>
                <label htmlFor="editProjectStatus" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="editProjectStatus"
                  value={selectedProject.status || 'planning'}
                  onChange={(e) => setSelectedProject({ ...selectedProject, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="editProjectPriority" className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  id="editProjectPriority"
                  value={selectedProject.priority || 'medium'}
                  onChange={(e) => setSelectedProject({ ...selectedProject, priority: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label htmlFor="editProjectStartDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  id="editProjectStartDate"
                  value={selectedProject.start_date ? selectedProject.start_date.split('T')[0] : ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, start_date: e.target.value })}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="editProjectEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  id="editProjectEndDate"
                  value={selectedProject.end_date ? selectedProject.end_date.split('T')[0] : ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, end_date: e.target.value })}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="editProjectBudget" className="block text-sm font-medium text-gray-700">Budget</label>
                <Input
                  type="number"
                  id="editProjectBudget"
                  value={selectedProject.budget || 0}
                  onChange={(e) => setSelectedProject({ ...selectedProject, budget: parseFloat(e.target.value) })}
                  className="mt-1 block w-full"
                  placeholder="Enter budget amount"
                />
              </div>
              <div>
                <label htmlFor="editProjectTeamLead" className="block text-sm font-medium text-gray-700">Team Lead</label>
                <Input
                  type="text"
                  id="editProjectTeamLead"
                  value={selectedProject.assigned_team_lead || selectedProject.team_lead || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, assigned_team_lead: e.target.value, team_lead: e.target.value })}
                  className="mt-1 block w-full"
                  placeholder="Enter team lead name"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateProject}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Work Request Approval Modal */}
      {showApprovalModal && selectedWorkRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Approve Work Request</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            <p className="mb-4">Are you sure you want to approve the work request: <strong>{getWorkRequestTitle(selectedWorkRequest)}</strong>?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
              <Button onClick={() => handleApproveWorkRequest(selectedWorkRequest.id)}>Approve</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

