'use client'

import { useState } from 'react'
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
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

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
  type: 'project_started' | 'milestone_completed' | 'deliverable_submitted' | 'issue_resolved' | 'meeting_scheduled'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'info'
}

interface UpcomingMilestone {
  id: string
  projectTitle: string
  milestoneTitle: string
  dueDate: string
  status: 'on_track' | 'at_risk' | 'overdue'
  completion: number
}

// Mock data for Demo Company
const clientName = "Demo Company"
const clientKPIs: ClientKPIs = {
  projects: {
    total: 12,
    active: 3,
    completed: 8,
    onTime: 7,
    delayed: 1,
    completionRate: 87.5
  },
  financial: {
    totalValue: 450000,
    completedValue: 320000,
    remainingValue: 130000,
    averageCost: 37500,
    budgetUtilization: 78,
    costPerHour: 125
  },
  timeline: {
    averageDuration: 45, // days
    onTimeRate: 87.5,
    upcomingDeadlines: 5,
    overdueItems: 1,
    avgDelay: 3.2 // days
  },
  quality: {
    satisfactionScore: 4.8,
    issueResolutionTime: 2.1, // days
    reworkRate: 8.5, // percentage
    deliverableAcceptance: 96.2,
    clientFeedbackScore: 4.7
  },
  team: {
    assignedMembers: 4,
    avgUtilization: 82,
    totalHoursWorked: 1240,
    remainingHours: 380
  }
}

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'milestone_completed',
    title: 'Payroll Integration Phase 1 Complete',
    description: 'Successfully completed data mapping and initial system setup',
    timestamp: '2024-08-15T10:30:00Z',
    status: 'success'
  },
  {
    id: '2',
    type: 'deliverable_submitted',
    title: 'Benefits Configuration Report',
    description: 'Comprehensive benefits setup documentation submitted for review',
    timestamp: '2024-08-14T16:45:00Z',
    status: 'info'
  },
  {
    id: '3',
    type: 'issue_resolved',
    title: 'Data Validation Error Fixed',
    description: 'Resolved SSN format validation issue in employee records',
    timestamp: '2024-08-14T14:20:00Z',
    status: 'success'
  },
  {
    id: '4',
    type: 'meeting_scheduled',
    title: 'Weekly Status Review',
    description: 'Scheduled for August 16, 2024 at 2:00 PM EST',
    timestamp: '2024-08-13T09:15:00Z',
    status: 'info'
  }
]

const upcomingMilestones: UpcomingMilestone[] = [
  {
    id: '1',
    projectTitle: 'Payroll System Integration',
    milestoneTitle: 'User Acceptance Testing',
    dueDate: '2024-08-25',
    status: 'on_track',
    completion: 75
  },
  {
    id: '2',
    projectTitle: 'Benefits Enrollment Setup',
    milestoneTitle: 'Configuration Complete',
    dueDate: '2024-08-30',
    status: 'on_track',
    completion: 60
  },
  {
    id: '3',
    projectTitle: 'Compliance Audit Report',
    milestoneTitle: 'Initial Assessment',
    dueDate: '2024-08-20',
    status: 'at_risk',
    completion: 40
  }
]

export default function ClientDashboard() {
  const [timeRange, setTimeRange] = useState('30d')

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
      case 'on_track': return 'bg-green-100 text-green-800'
      case 'at_risk': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'info': return 'bg-blue-100 text-blue-800'
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
              <p className="text-3xl font-bold text-gray-900 mb-1">{clientKPIs.projects.active}</p>
              <p className="text-sm text-gray-600">{clientKPIs.projects.total} total projects</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${clientKPIs.projects.completionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{clientKPIs.projects.completionRate}% completion rate</p>
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
              <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(clientKPIs.financial.totalValue)}</p>
              <p className="text-sm text-gray-600">{formatCurrency(clientKPIs.financial.completedValue)} completed</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(clientKPIs.financial.completedValue / clientKPIs.financial.totalValue) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{clientKPIs.financial.budgetUtilization}% budget utilized</p>
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
              <p className="text-3xl font-bold text-gray-900 mb-1">{clientKPIs.timeline.onTimeRate}%</p>
              <p className="text-sm text-gray-600">{clientKPIs.timeline.upcomingDeadlines} upcoming deadlines</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${clientKPIs.timeline.onTimeRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Avg {clientKPIs.timeline.averageDuration} days per project</p>
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
              <p className="text-3xl font-bold text-gray-900 mb-1">{clientKPIs.quality.satisfactionScore}</p>
              <p className="text-sm text-gray-600">{clientKPIs.quality.deliverableAcceptance}% acceptance rate</p>
              <div className="mt-3 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`text-lg ${star <= Math.floor(clientKPIs.quality.satisfactionScore) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{clientKPIs.quality.reworkRate}% rework rate</p>
            </div>
          </div>
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
                        <h3 className="font-medium text-gray-900">{milestone.milestoneTitle}</h3>
                        <p className="text-sm text-gray-600">{milestone.projectTitle}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">Due: {formatDate(milestone.dueDate)}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{milestone.completion}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              milestone.status === 'on_track' ? 'bg-green-500' :
                              milestone.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${milestone.completion}%` }}
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
                        <span className="font-medium">{clientKPIs.team.assignedMembers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg Utilization</span>
                        <span className="font-medium">{clientKPIs.team.avgUtilization}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hours Worked</span>
                        <span className="font-medium">{clientKPIs.team.totalHoursWorked}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Remaining Hours</span>
                        <span className="font-medium">{clientKPIs.team.remainingHours}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Quality Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Issue Resolution</span>
                        <span className="font-medium">{clientKPIs.quality.issueResolutionTime} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rework Rate</span>
                        <span className="font-medium">{clientKPIs.quality.reworkRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Acceptance Rate</span>
                        <span className="font-medium">{clientKPIs.quality.deliverableAcceptance}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Client Feedback</span>
                        <span className="font-medium">{clientKPIs.quality.clientFeedbackScore}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

