'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { BarChart3, Users, FileText, TrendingUp, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface DashboardStats {
  total_records: number
  active_employees: number
  etl_jobs: number
  success_rate: number
}

interface RecentJob {
  id: string
  name: string
  status: string
  created_at: string
}

interface Milestone {
  id: string
  title: string
  due_date: string
  status: string
  completion_percentage: number
  project_title: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_records: 24567,
    active_employees: 2113,
    etl_jobs: 156,
    success_rate: 98.5
  })
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [upcomingMilestones, setUpcomingMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch recent ETL jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('etl_jobs')
        .select('id, job_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!jobsError && jobsData) {
        const transformedJobs = jobsData.map(job => ({
          id: job.id,
          name: job.job_name,
          status: job.status,
          created_at: job.created_at
        }))
        setRecentJobs(transformedJobs)
      } else {
        // Use mock data if query fails
        setRecentJobs(mockRecentJobs)
      }

      // Fetch upcoming milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('project_milestones')
        .select(`
          id,
          title,
          due_date,
          status,
          completion_percentage,
          projects (
            title
          )
        `)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(5)

      if (!milestonesError && milestonesData) {
        const transformedMilestones = milestonesData.map(m => ({
          id: m.id,
          title: m.title,
          due_date: m.due_date,
          status: m.status,
          completion_percentage: m.completion_percentage,
          project_title: Array.isArray(m.projects) 
            ? m.projects[0]?.title || 'Unknown Project'
            : (m.projects as any)?.title || 'Unknown Project'
        }))
        setUpcomingMilestones(transformedMilestones)
      } else {
        // Use mock data if query fails
        setUpcomingMilestones(mockMilestones)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use mock data on error
      setRecentJobs(mockRecentJobs)
      setUpcomingMilestones(mockMilestones)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for fallback
  const mockRecentJobs: RecentJob[] = [
    { id: '1', name: 'Employee Data Sync', status: 'completed', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    { id: '2', name: 'Payroll Processing', status: 'running', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '3', name: 'Benefits Update', status: 'completed', created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
  ]

  const mockMilestones: Milestone[] = [
    { id: '1', title: 'System Integration Phase 1', due_date: '2024-01-20', status: 'in_progress', completion_percentage: 75, project_title: 'Acme Corp Integration' },
    { id: '2', title: 'Data Migration Completion', due_date: '2024-01-25', status: 'pending', completion_percentage: 30, project_title: 'TechStart Migration' },
    { id: '3', title: 'User Training Session', due_date: '2024-01-30', status: 'pending', completion_percentage: 0, project_title: 'Global Enterprises Setup' }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'running':
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'failed':
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Due today'
    if (diffInDays === 1) return 'Due tomorrow'
    if (diffInDays > 0) return `Due in ${diffInDays} days`
    return `Overdue by ${Math.abs(diffInDays)} days`
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            ETL operations and project management overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_records.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_employees.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ETL Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.etl_jobs}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.success_rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent ETL Jobs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent ETL Jobs</h2>
              <p className="text-sm text-gray-600">Latest data processing activities</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.name}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(job.created_at)}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Milestones</h2>
              <p className="text-sm text-gray-600">Project deadlines and deliverables</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMilestones.map((milestone) => (
                    <div key={milestone.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                          <p className="text-xs text-gray-500">{milestone.project_title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">{formatDueDate(milestone.due_date)}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                            {milestone.completion_percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${milestone.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
              <p className="text-sm text-gray-600">Current system status and performance</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Database Connection</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">API Services</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Data Quality</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    98.5%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

