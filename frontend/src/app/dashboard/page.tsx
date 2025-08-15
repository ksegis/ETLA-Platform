'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Users,
  Target,
  Award,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/contexts/TenantContext'

interface ClientKPIs {
  projects: {
    total: number
    active: number
    completed: number
    onTime: number
    delayed: number
    completionRate: number
  }
  financial: {
    totalValue: number
    completedValue: number
    remainingValue: number
    averageCost: number
    budgetUtilization: number
    costPerHour: number
  }
  timeline: {
    averageDuration: number
    onTimeRate: number
    upcomingDeadlines: number
    overdueItems: number
    avgDelay: number
  }
  quality: {
    satisfactionScore: number
    issueResolutionTime: number
    reworkRate: number
    deliverableAcceptance: number
    clientFeedbackScore: number
  }
  team: {
    assignedMembers: number
    avgUtilization: number
    totalHoursWorked: number
    remainingHours: number
  }
}

interface RecentActivity {
  id: string
  activity_type: string
  title: string
  description: string
  created_at: string
  metadata: any
}

interface UpcomingMilestone {
  id: string
  project_title: string
  title: string
  due_date: string
  status: string
  completion_percentage: number
}

export default function ClientDashboard() {
  const { currentTenant, userProfile } = useTenant()
  const [kpis, setKPIs] = useState<ClientKPIs | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingMilestones, setUpcomingMilestones] = useState<UpcomingMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (currentTenant) {
      fetchDashboardData()
    }
  }, [currentTenant, timeRange])

  const fetchDashboardData = async () => {
    if (!currentTenant) return

    try {
      // Fetch KPIs using database function
      const { data: kpiData, error: kpiError } = await supabase
        .rpc('calculate_client_kpis', { tenant_uuid: currentTenant })

      if (kpiError) throw kpiError

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .eq('tenant_id', currentTenant)
        .eq('is_visible_to_client', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activityError) throw activityError

      // Fetch upcoming milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('project_milestones')
        .select(`
          id,
          title,
          due_date,
          status,
          completion_percentage,
          projects!inner(title)
        `)
        .eq('tenant_id', currentTenant)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date')
        .limit(5)

      if (milestonesError) throw milestonesError

      // Transform and set data
      if (kpiData && kpiData[0]) {
        const kpi = kpiData[0]
        setKPIs({
          projects: {
            total: kpi.total_projects || 0,
            active: kpi.active_projects || 0,
            completed: kpi.completed_projects || 0,
            onTime: kpi.on_time_projects || 0,
            delayed: kpi.delayed_projects || 0,
            completionRate: kpi.completion_rate || 0
          },
          financial: {
            totalValue: kpi.total_project_value || 0,
            completedValue: kpi.completed_project_value || 0,
            remainingValue: kpi.remaining_project_value || 0,
            averageCost: kpi.average_project_cost || 0,
            budgetUtilization: kpi.budget_utilization || 0,
            costPerHour: kpi.cost_per_hour || 0
          },
          timeline: {
            averageDuration: kpi.average_project_duration || 0,
            onTimeRate: kpi.on_time_delivery_rate || 0,
            upcomingDeadlines: kpi.upcoming_deadlines || 0,
            overdueItems: kpi.overdue_items || 0,
            avgDelay: kpi.average_delay_days || 0
          },
          quality: {
            satisfactionScore: kpi.satisfaction_score || 0,
            issueResolutionTime: kpi.issue_resolution_time || 0,
            reworkRate: kpi.rework_rate || 0,
            deliverableAcceptance: kpi.deliverable_acceptance_rate || 0,
            clientFeedbackScore: kpi.client_feedback_score || 0
          },
          team: {
            assignedMembers: kpi.assigned_team_members || 0,
            avgUtilization: kpi.average_team_utilization || 0,
            totalHoursWorked: kpi.total_hours_worked || 0,
            remainingHours: kpi.remaining_hours || 0
          }
        })
      }

      setRecentActivity(activityData || [])
      
      const transformedMilestones = milestonesData?.map(m => ({
        id: m.id,
        project_title: m.projects.title,
        title: m.title,
        due_date: m.due_date,
        status: m.status,
        completion_percentage: m.completion_percentage
      })) || []
      
      setUpcomingMilestones(transformedMilestones)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': case 'pending': return 'bg-green-100 text-green-800'
      case 'at_risk': case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': case 'completed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_started': return <Activity className="h-4 w-4" />
      case 'milestone_completed': return <CheckCircle className="h-4 w-4" />
      case 'deliverable_submitted': return <FileText className="h-4 w-4" />
      case 'issue_resolved': return <AlertCircle className="h-4 w-4" />
      case 'meeting_scheduled': return <Calendar className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const clientName = userProfile?.tenant_id ? 
    (userProfile as any).tenant?.company_name || "Your Company" : 
    "Your Company"

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{clientName} Dashboard</h1>
              <p className="text-gray-600">Project performance and key metrics overview</p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button 
                onClick={() => window.location.href = '/reports'}
                variant="outline"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Project Status */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    +12%
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Projects</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{kpis.projects.active}</p>
                <p className="text-sm text-gray-600">{kpis.projects.total} total projects</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${kpis.projects.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpis.projects.completionRate}% completion rate</p>
              </div>

              {/* Financial Performance */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    +8%
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Value</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(kpis.financial.totalValue)}</p>
                <p className="text-sm text-gray-600">{formatCurrency(kpis.financial.completedValue)} completed</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${kpis.financial.budgetUtilization}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpis.financial.budgetUtilization}% budget utilized</p>
              </div>

              {/* Timeline Performance */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    +5%
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">On-Time Delivery</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{kpis.timeline.onTimeRate}%</p>
                <p className="text-sm text-gray-600">{kpis.timeline.upcomingDeadlines} upcoming deadlines</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${kpis.timeline.onTimeRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Avg {kpis.timeline.averageDuration} days per project</p>
              </div>

              {/* Quality Score */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-sm text-green-600 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    +0.2
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction Score</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{kpis.quality.satisfactionScore.toFixed(1)}</p>
                <p className="text-sm text-gray-600">{kpis.quality.deliverableAcceptance}% acceptance rate</p>
                <div className="mt-3 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`text-lg ${star <= Math.floor(kpis.quality.satisfactionScore) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpis.quality.reworkRate}% rework rate</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Milestones */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Milestones</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                        <p className="text-sm text-gray-600">{milestone.project_title}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">Due: {formatDate(milestone.due_date)}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{milestone.completion_percentage}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              milestone.status === 'pending' ? 'bg-green-500' :
                              milestone.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${milestone.completion_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => window.location.href = '/projects'}
                    variant="outline" 
                    className="w-full"
                  >
                    View All Projects
                  </Button>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {kpis && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Team Utilization</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Assigned Members</span>
                          <span className="font-medium">{kpis.team.assignedMembers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Utilization</span>
                          <span className="font-medium">{kpis.team.avgUtilization}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Hours Worked</span>
                          <span className="font-medium">{kpis.team.totalHoursWorked}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Remaining Hours</span>
                          <span className="font-medium">{kpis.team.remainingHours}h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Quality Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Issue Resolution</span>
                          <span className="font-medium">{kpis.quality.issueResolutionTime} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Rework Rate</span>
                          <span className="font-medium">{kpis.quality.reworkRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Acceptance Rate</span>
                          <span className="font-medium">{kpis.quality.deliverableAcceptance}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Client Feedback</span>
                          <span className="font-medium">{kpis.quality.clientFeedbackScore}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(activity.created_at).toLocaleDateString()} at{' '}
                          {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => window.location.href = '/activity'}
                    variant="outline" 
                    className="w-full"
                  >
                    View All Activity
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Button 
                  onClick={() => window.location.href = '/work-requests/new'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Submit New Request
                </Button>
                <Button 
                  onClick={() => window.location.href = '/projects'}
                  variant="outline" 
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  View Projects
                </Button>
                <Button 
                  onClick={() => window.location.href = '/reports'}
                  variant="outline" 
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button 
                  onClick={() => window.location.href = '/settings'}
                  variant="outline" 
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

