'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createClient } from '@supabase/supabase-js'
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  ArrowLeft,
  Target,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
  budget_variance: number
  timeline_variance: number
  start_date: string
  end_date: string
  next_customer_action: string
  customer_visible: boolean
}

interface Milestone {
  id: string
  milestone_name: string
  due_date: string
  status: string
  customer_action: string
  definition_of_done: string
  customer_visible: boolean
}

interface Roadblock {
  id: string
  title: string
  description: string
  severity: string
  impact: string
  resolution_plan: string
  status: string
  created_at: string
}

interface StatusUpdate {
  id: string
  update_type: string
  title: string
  description: string
  created_at: string
  created_by: string
}

interface Deliverable {
  id: string
  deliverable_name: string
  description: string
  due_date: string
  status: string
  file_link: string
}

export default function CustomerProjectDashboard() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [roadblocks, setRoadblocks] = useState<Roadblock[]>([])
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    setLoading(true)
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('project_charters')
        .select('*')
        .eq('id', projectId)
        .eq('customer_visible', true)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .eq('customer_visible', true)
        .order('due_date', { ascending: true })

      setMilestones(milestonesData || [])

      // Fetch roadblocks
      const { data: roadblocksData } = await supabase
        .from('project_roadblocks')
        .select('*')
        .eq('project_id', projectId)
        .neq('status', 'resolved')
        .order('created_at', { ascending: false })

      setRoadblocks(roadblocksData || [])

      // Fetch status updates
      const { data: updatesData } = await supabase
        .from('project_status_updates')
        .select('*')
        .eq('project_id', projectId)
        .eq('customer_visible', true)
        .order('created_at', { ascending: false })
        .limit(10)

      setStatusUpdates(updatesData || [])

      // Fetch deliverables
      const { data: deliverablesData } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true})

      setDeliverables(deliverablesData || [])
    } catch (error) {
      console.error('Error fetching project data:', error)
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
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'yellow':
        return <Clock className="h-6 w-6 text-yellow-600" />
      case 'red':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      default:
        return <Clock className="h-6 w-6 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'at_risk':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
          <p className="text-gray-600 mb-4">This project doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/customer/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/customer/projects')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
              {project.project_code && (
                <Badge variant="outline" className="mt-2">
                  {project.project_code}
                </Badge>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${getHealthColor(project.health_status)}`}>
              {getHealthIcon(project.health_status)}
              {project.health_status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{project.completion_percentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${project.completion_percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget</p>
                  <p className="text-2xl font-bold text-gray-900">${(project.budget / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${(project.budget_spent / 1000).toFixed(0)}K spent
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Timeline</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {project.timeline_variance > 0 ? '+' : ''}{project.timeline_variance} days
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {project.timeline_variance >= 0 ? 'Ahead of schedule' : 'Behind schedule'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Roadblocks</p>
                  <p className="text-2xl font-bold text-gray-900">{roadblocks.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Active issues</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Action */}
        {project.next_customer_action && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Target className="h-5 w-5" />
                Your Next Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">{project.next_customer_action}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No milestones yet</p>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{milestone.milestone_name}</h4>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Due: {formatDate(milestone.due_date)}
                      </p>
                      {milestone.customer_action && (
                        <div className="bg-blue-50 rounded p-2 text-sm text-blue-800 mb-2">
                          <strong>Your Action:</strong> {milestone.customer_action}
                        </div>
                      )}
                      {milestone.definition_of_done && (
                        <p className="text-sm text-gray-600">
                          <strong>Done when:</strong> {milestone.definition_of_done}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deliverables.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No deliverables yet</p>
              ) : (
                <div className="space-y-4">
                  {deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{deliverable.deliverable_name}</h4>
                        <Badge className={getStatusColor(deliverable.status)}>
                          {deliverable.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {deliverable.description && (
                        <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        Due: {formatDate(deliverable.due_date)}
                      </p>
                      {deliverable.file_link && (
                        <a
                          href={deliverable.file_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          View File
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Roadblocks */}
          {roadblocks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Roadblocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roadblocks.map((roadblock) => (
                    <div key={roadblock.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{roadblock.title}</h4>
                        <Badge className={getSeverityColor(roadblock.severity)}>
                          {roadblock.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{roadblock.description}</p>
                      {roadblock.impact && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Impact:</strong> {roadblock.impact}
                        </p>
                      )}
                      {roadblock.resolution_plan && (
                        <div className="bg-green-50 rounded p-2 text-sm text-green-800">
                          <strong>Resolution Plan:</strong> {roadblock.resolution_plan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusUpdates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No updates yet</p>
              ) : (
                <div className="space-y-4">
                  {statusUpdates.map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm">{update.title}</h4>
                        <span className="text-xs text-gray-500">{formatTimeAgo(update.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{update.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {update.update_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
