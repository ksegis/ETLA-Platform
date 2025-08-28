'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Building,
  UserCheck,
  UserX,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react'

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
  bgColor: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function HistoricalDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('12months')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // HR/Payroll specific metrics
  const hrMetrics: MetricCard[] = [
    {
      title: 'Total Employees',
      value: '2,113',
      change: '+5.2%',
      changeType: 'increase',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Payroll Volume',
      value: '$8.4M',
      change: '+12.3%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Salary',
      value: '$67,500',
      change: '+3.8%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Employee Turnover',
      value: '8.2%',
      change: '-2.1%',
      changeType: 'decrease',
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Active Departments',
      value: '12',
      change: '0%',
      changeType: 'neutral',
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'New Hires (YTD)',
      value: '287',
      change: '+18.5%',
      changeType: 'increase',
      icon: UserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ]

  // Department distribution data
  const departmentData: ChartData[] = [
    { name: 'Engineering', value: 35, color: '#3B82F6' },
    { name: 'Sales', value: 22, color: '#10B981' },
    { name: 'Marketing', value: 15, color: '#8B5CF6' },
    { name: 'Operations', value: 12, color: '#F59E0B' },
    { name: 'HR', value: 8, color: '#EF4444' },
    { name: 'Finance', value: 8, color: '#6366F1' }
  ]

  // Salary range distribution
  const salaryRanges: ChartData[] = [
    { name: '$30K-$50K', value: 18, color: '#EF4444' },
    { name: '$50K-$70K', value: 32, color: '#F59E0B' },
    { name: '$70K-$90K', value: 28, color: '#10B981' },
    { name: '$90K-$120K', value: 15, color: '#3B82F6' },
    { name: '$120K+', value: 7, color: '#8B5CF6' }
  ]

  // Recent HR activities
  const recentActivities = [
    {
      type: 'hire',
      description: 'New hire: Sarah Johnson - Software Engineer',
      department: 'Engineering',
      date: '2 hours ago',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      type: 'promotion',
      description: 'Promotion: Mike Chen - Senior Manager',
      department: 'Sales',
      date: '5 hours ago',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      type: 'termination',
      description: 'Termination: Alex Rodriguez - Marketing Specialist',
      department: 'Marketing',
      date: '1 day ago',
      icon: UserX,
      color: 'text-red-600'
    },
    {
      type: 'salary_change',
      description: 'Salary adjustment: Jennifer Lee - $75K → $82K',
      department: 'Operations',
      date: '2 days ago',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      type: 'transfer',
      description: 'Department transfer: David Kim - HR → Finance',
      department: 'Finance',
      date: '3 days ago',
      icon: Building,
      color: 'text-indigo-600'
    }
  ]

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'decrease':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Historical employee data and payroll analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Period Selector */}
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
                <option value="24months">Last 24 Months</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hrMetrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(metric.changeType)}
                    <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Employee Distribution by Department</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          backgroundColor: dept.color, 
                          width: `${dept.value}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{dept.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Range Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Salary Range Distribution</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {salaryRanges.map((range, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: range.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{range.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          backgroundColor: range.color, 
                          width: `${range.value * 2}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{range.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent HR Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent HR Activities</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const IconComponent = activity.icon
              return (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg bg-gray-50`}>
                    <IconComponent className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.department}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.date}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Activities →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <BarChart3 className="h-5 w-5 mr-2" />
              Generate Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <Users className="h-5 w-5 mr-2" />
              Employee Analysis
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
              <DollarSign className="h-5 w-5 mr-2" />
              Payroll Analysis
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

