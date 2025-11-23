'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { createClient } from '@supabase/supabase-js'
import { 
  Folder, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Search,
  ArrowRight,
  Calendar,
  HelpCircle,
  Building
} from 'lucide-react'
import { TourProvider, useTour } from '@/components/tours/TourProvider'
import { customerProjectsTour } from '@/components/tours/customerProjectsTour'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!
)

interface Project {
  id: string
  project_name: string
  project_code: string
  health_status: 'green' | 'yellow' | 'red'
  completion_percentage: number
  budget: number
  budget_spent: number
  start_date: string
  end_date: string
  next_customer_action: string
  customer_visible: boolean
  tenant_id: string
  tenants?: {
    id: string
    name: string
  }
}

function CustomerProjectsPageContent() {
  const { startTour } = useTour()
  
  const router = useRouter()
  const { user } = useAuth()
  const { selectedTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [searchTerm, setSearchTerm('')

  useEffect(() => {
    if (user) {
      fetchProjectsForAllTenants()
    }
  }, [user])

  const fetchProjectsForAllTenants = async () => {
    setLoading(true)
    try {
      // First, get all tenants the user has access to
      const { data: tenantUsers, error: tenantError } = await supabase
        .from('tenant_users')
        .select('tenant_id, tenants(id, name)')
        .eq('user_id', user?.id)

      if (tenantError) throw tenantError

      const userTenantIds = tenantUsers?.map(tu => tu.tenant_id) || []
      
      if (userTenantIds.length === 0) {
        setProjects([])
        setTenants([])
        setLoading(false)
        return
      }

      // Fetch all projects for these tenants
      const { data: projectData, error: projectError } = await supabase
        .from('project_charters')
        .select(`
          *,
          tenants(id, name)
        `)
        .in('tenant_id', userTenantIds)
        .order('created_at', { ascending: false })

      if (projectError) throw projectError

      setProjects(projectData || [])
      
      // Extract unique tenants from tenant_users
      const uniqueTenants = tenantUsers
        ?.map(tu => tu.tenants)
        .filter((t, index, self) => 
          t && self.findIndex(s => s?.id === t?.id) === index
        ) || []
      setTenants(uniqueTenants)

    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'yellow':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'red':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const filteredProjects = projects.filter((project) => {
    if (!searchTerm) return true
    return (
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_code?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const activeProjects = filteredProjects.filter(p => p.completion_percentage < 100)
  const completedProjects = filteredProjects.filter(p => p.completion_percentage >= 100)
  const atRiskProjects = filteredProjects.filter(p => p.health_status === 'red' || p.health_status === 'yellow')

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">
              View and track your active projects
            </p>
          </div>
          <Button variant="outline" onClick={startTour}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Start Tour
          </Button>
        </div>

        {/* Summary Cards */}
        <div id="project-summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{activeProjects.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{atRiskProjects.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedProjects.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="project-search"
                placeholder="Search projects by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms.'
                  : 'You don\'t have any projects assigned yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project, index) => (
              <Card key={project.id} id={`project-card-${index}`} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span id={`health-indicator-${index}`}>{getHealthIcon(project.health_status)}</span>
                        <CardTitle className="text-lg">{project.project_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {project.tenants?.name && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Building className="h-3 w-3 mr-1" />
                            {project.tenants.name}
                          </Badge>
                        )}
                        {project.project_code && (
                          <Badge variant="outline" className="text-xs">
                            {project.project_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getHealthColor(project.health_status)}`}>
                      {project.health_status.toUpperCase()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.completion_percentage >= 75
                              ? 'bg-green-600'
                              : project.completion_percentage >= 50
                              ? 'bg-yellow-600'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${project.completion_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Budget:</span>{' '}
                        <span className="font-medium">${(project.budget / 1000).toFixed(0)}K</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Spent:</span>{' '}
                        <span className="font-medium">${(project.budget_spent / 1000).toFixed(0)}K</span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(project.start_date).toLocaleDateString()} -{' '}
                        {new Date(project.end_date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Next Action */}
                    {project.next_customer_action && (
                      <div id={`next-action-${index}`} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">Your Next Action:</p>
                        <p className="text-sm text-blue-800">{project.next_customer_action}</p>
                      </div>
                    )}

                    {/* View Details Button */}
                    <Button
                      onClick={() => router.push(`/customer/projects/${project.id}`)}
                      className="w-full"
                      variant="outline"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function CustomerProjectsPage() {
  return (
    <TourProvider tourId="customer-projects" steps={customerProjectsTour}>
      <CustomerProjectsPageContent />
    </TourProvider>
  )
}
