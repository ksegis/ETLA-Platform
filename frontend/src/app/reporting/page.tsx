'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Eye,
  ChevronRight,
  ChevronDown,
  Search,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Enhanced Reporting & Analytics Dashboard (No shadcn/ui dependencies)
 * 
 * Improved navigation, responsive design, and better user experience
 * for HR reporting and analytics using standard HTML elements and Tailwind CSS.
 */

interface ReportType {
  id: string
  title: string
  description: string
  icon: string
  category: 'operational' | 'hr_historical' | 'executive'
  fields: number
  estimatedRecords: number
  color: string
}

interface DashboardStats {
  totalEmployees: number
  payrollVolume: number
  statusChanges: number
  payAdjustments: number
}

const REPORT_TYPES: ReportType[] = [
  // Operational Reports
  {
    id: 'pay_period_analysis',
    title: 'Pay Period Analysis',
    description: 'Payroll costs and metrics by pay period',
    icon: 'DollarSign',
    category: 'operational',
    fields: 8,
    estimatedRecords: 500,
    color: 'bg-blue-500'
  },
  {
    id: 'benefit_group_analysis',
    title: 'Benefit Group Analysis',
    description: 'Benefits breakdown and costs by group',
    icon: 'PieChart',
    category: 'operational',
    fields: 12,
    estimatedRecords: 150,
    color: 'bg-green-500'
  },
  {
    id: 'department_analysis',
    title: 'Department Analysis',
    description: 'Employee distribution, costs, and metrics by department',
    icon: 'BarChart3',
    category: 'operational',
    fields: 15,
    estimatedRecords: 2500,
    color: 'bg-purple-500'
  },

  // HR Historical Data Reports
  {
    id: 'demographics',
    title: 'Current Demographics',
    description: 'Complete employee profiles snapshot with 35 comprehensive data fields',
    icon: 'Users',
    category: 'hr_historical',
    fields: 35,
    estimatedRecords: 2113,
    color: 'bg-indigo-500'
  },
  {
    id: 'status_history',
    title: 'Employee Status History',
    description: 'Status change tracking from Active, Terminated, On Leave, etc.',
    icon: 'TrendingUp',
    category: 'hr_historical',
    fields: 6,
    estimatedRecords: 450,
    color: 'bg-orange-500'
  },
  {
    id: 'pay_history',
    title: 'Compensation History',
    description: 'Pay changes, salaries, and bonus with automatic calculations',
    icon: 'DollarSign',
    category: 'hr_historical',
    fields: 10,
    estimatedRecords: 890,
    color: 'bg-emerald-500'
  },
  {
    id: 'position_history',
    title: 'Position History',
    description: 'Organizational and role changes, promotions, transfers',
    icon: 'LineChart',
    category: 'hr_historical',
    fields: 13,
    estimatedRecords: 670,
    color: 'bg-cyan-500'
  },
  {
    id: 'tax_information',
    title: 'Tax Information',
    description: 'Federal, state, and local tax withholding configurations',
    icon: 'FileText',
    category: 'hr_historical',
    fields: 26,
    estimatedRecords: 1850,
    color: 'bg-rose-500'
  },
  {
    id: 'custom_fields',
    title: 'Custom Fields',
    description: 'Organization-specific data and custom field values',
    icon: 'Settings',
    category: 'hr_historical',
    fields: 5,
    estimatedRecords: 320,
    color: 'bg-amber-500'
  },

  // Executive Reports
  {
    id: 'monthly_executive',
    title: 'Monthly Executive Report',
    description: 'High-level metrics and trends for leadership, compared with HR data',
    icon: 'BarChart3',
    category: 'executive',
    fields: 25,
    estimatedRecords: 12,
    color: 'bg-slate-600'
  },
  {
    id: 'detailed_analytics',
    title: 'Detailed Analytics',
    description: 'Comprehensive data analysis including HR trends and insights',
    icon: 'Table',
    category: 'executive',
    fields: 50,
    estimatedRecords: 5000,
    color: 'bg-violet-500'
  },
  {
    id: 'compliance_report',
    title: 'Compliance Report',
    description: 'Regulatory compliance including EEOC, tax, and audit documentation',
    icon: 'FileText',
    category: 'executive',
    fields: 30,
    estimatedRecords: 2113,
    color: 'bg-red-500'
  }
]

// Icon component mapper
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const iconProps = { className: className || "h-4 w-4" }
  
  switch (name) {
    case 'Users': return <Users {...iconProps} />
    case 'DollarSign': return <DollarSign {...iconProps} />
    case 'TrendingUp': return <TrendingUp {...iconProps} />
    case 'FileText': return <FileText {...iconProps} />
    case 'Settings': return <Settings {...iconProps} />
    case 'BarChart3': return <BarChart3 {...iconProps} />
    case 'PieChart': return <PieChart {...iconProps} />
    case 'LineChart': return <LineChart {...iconProps} />
    case 'Table': return <Table {...iconProps} />
    default: return <FileText {...iconProps} />
  }
}

export default function EnhancedReportingPage() {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEmployees: 2113,
    payrollVolume: 8400000,
    statusChanges: 23,
    payAdjustments: 15
  })

  // Filter State
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [selectedFilters, setSelectedFilters] = useState({
    departments: [] as string[],
    positions: [] as string[],
    statuses: [] as string[],
    payTypes: [] as string[],
    states: [] as string[],
    employees: [] as string[],
    customFields: [] as string[],
    includeSensitive: false,
    activeOnly: false,
    includeTerminated: true
  })

  // User and Customer State
  const [user, setUser] = useState<any>(null)
  const [customerId, setCustomerId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Load user and customer information
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          setError('Authentication error: ' + authError.message)
          return
        }
        
        if (user) {
          setUser(user)
          
          // Get customer ID from user metadata or profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('customer_id')
            .eq('user_id', user.id)
            .single()
          
          if (profileError) {
            console.warn('Profile not found, using demo customer ID')
            setCustomerId('demo-customer-id')
          } else if (profile?.customer_id) {
            setCustomerId(profile.customer_id)
          }
        } else {
          setError('No authenticated user found')
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Generate Report Handler
  const handleGenerateReport = async (reportType: ReportType, preview: boolean = false) => {
    if (!customerId) {
      alert('Customer information not available. Please contact support.')
      return
    }

    setIsGenerating(true)
    
    try {
      if (reportType.category === 'hr_historical') {
        // Simulate HR report generation
        if (preview) {
          // Generate sample preview data
          const sampleData = generateSampleHRData(reportType)
          setPreviewData(sampleData)
          setActiveTab('preview')
        } else {
          // Simulate Excel export
          alert(`Generating ${reportType.title} Excel report with ${reportType.fields} fields for ${reportType.estimatedRecords} records...`)
        }
      } else {
        // Handle operational and executive reports
        if (preview) {
          const sampleData = generateSampleData(reportType)
          setPreviewData(sampleData)
          setActiveTab('preview')
        } else {
          alert(`${reportType.title} export functionality will be implemented based on your specific requirements.`)
        }
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('An error occurred while generating the report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate sample HR data for preview
  const generateSampleHRData = (reportType: ReportType) => {
    const sampleData = []
    for (let i = 0; i < 5; i++) {
      const baseData = {
        employee_code: `EMP${String(i + 1).padStart(4, '0')}`,
        effective_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        employee_name: `Employee ${i + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      switch (reportType.id) {
        case 'demographics':
          sampleData.push({
            ...baseData,
            first_name: `First${i + 1}`,
            last_name: `Last${i + 1}`,
            ssn: `XXX-XX-${String(1000 + i).slice(-4)}`,
            home_department: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'][i % 5],
            position: ['Developer', 'Manager', 'Analyst', 'Coordinator', 'Director'][i % 5],
            employee_status: ['Active', 'Active', 'Active', 'On Leave', 'Active'][i % 5],
            hire_date: new Date(2020 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
          })
          break
        case 'pay_history':
          sampleData.push({
            ...baseData,
            pay_type: ['Salary', 'Hourly'][i % 2],
            new_annual_amount: 50000 + (i * 10000),
            change_reason: ['Merit Increase', 'Promotion', 'Market Adjustment', 'Annual Review', 'Role Change'][i % 5],
            percentage_change: (5 + Math.random() * 10).toFixed(2)
          })
          break
        case 'status_history':
          sampleData.push({
            ...baseData,
            status: ['Active', 'On Leave', 'Terminated', 'Active', 'Active'][i % 5],
            termination_type: i === 2 ? 'Voluntary' : null,
            termination_reason: i === 2 ? 'Better Opportunity' : null,
            notes: `Status change notes for employee ${i + 1}`
          })
          break
        default:
          sampleData.push({
            ...baseData,
            field_1: `Value ${i + 1}`,
            field_2: Math.floor(Math.random() * 1000),
            field_3: ['Option A', 'Option B', 'Option C'][i % 3]
          })
      }
    }
    return sampleData
  }

  // Generate sample data for non-HR reports
  const generateSampleData = (reportType: ReportType) => {
    const sampleData = []
    for (let i = 0; i < 5; i++) {
      sampleData.push({
        id: i + 1,
        name: `Sample ${reportType.title} ${i + 1}`,
        value: Math.floor(Math.random() * 1000),
        date: new Date().toISOString().split('T')[0],
        category: ['Category A', 'Category B', 'Category C'][i % 3]
      })
    }
    return sampleData
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      departments: [],
      positions: [],
      statuses: [],
      payTypes: [],
      states: [],
      employees: [],
      customFields: [],
      includeSensitive: false,
      activeOnly: false,
      includeTerminated: true
    })
    setDateFrom('')
    setDateTo('')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((count, filter) => {
      if (Array.isArray(filter)) {
        return count + filter.length
      }
      if (typeof filter === 'boolean' && filter) {
        return count + 1
      }
      return count
    }, 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading reporting dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reporting & Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enterprise reporting for pay period, benefit group, departmental, and HR historical data for {user?.email || 'Loading...'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
            <div className="flex space-x-2">
              <button 
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Departments</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select departments</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="hr">Human Resources</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            {/* Position Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Positions</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select positions</option>
                <option value="developer">Developer</option>
                <option value="manager">Manager</option>
                <option value="analyst">Analyst</option>
                <option value="coordinator">Coordinator</option>
                <option value="director">Director</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Employee Status</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="activeOnly"
                    type="checkbox"
                    checked={selectedFilters.activeOnly}
                    onChange={(e) => 
                      setSelectedFilters(prev => ({ ...prev, activeOnly: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activeOnly" className="ml-2 block text-sm text-gray-900">
                    Active employees only
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="includeTerminated"
                    type="checkbox"
                    checked={selectedFilters.includeTerminated}
                    onChange={(e) => 
                      setSelectedFilters(prev => ({ ...prev, includeTerminated: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeTerminated" className="ml-2 block text-sm text-gray-900">
                    Include terminated
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 sm:px-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'reports', 'preview', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalEmployees.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Active workforce</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Payroll Volume</dt>
                        <dd className="text-lg font-medium text-gray-900">${(dashboardStats.payrollVolume / 1000000).toFixed(1)}M</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Annual payroll</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Status Changes</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.statusChanges}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-gray-500">This month</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <LineChart className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pay Adjustments</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.payAdjustments}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Recent changes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <p className="mt-1 text-sm text-gray-500">Generate commonly used reports</p>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REPORT_TYPES.filter(report => report.category === 'hr_historical').slice(0, 3).map((report) => (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReport(report)
                        setActiveTab('reports')
                      }}
                      className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <div className={`flex-shrink-0 p-2 rounded-md ${report.color}`}>
                        <IconComponent name={report.icon} className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-500">{report.fields} fields</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Report Categories</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a report type to generate</p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-1 p-4">
                      {/* Operational Reports */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 px-2">Operational Reports</h4>
                        {REPORT_TYPES.filter(report => report.category === 'operational').map((report) => (
                          <button
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`w-full text-left p-3 rounded-md ${
                              selectedReport?.id === report.id 
                                ? 'bg-blue-50 border-blue-200 border' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-1.5 rounded-sm ${report.color}`}>
                                <IconComponent name={report.icon} className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{report.title}</div>
                                <div className="text-xs text-gray-500">{report.estimatedRecords} records</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 my-4"></div>

                      {/* HR Historical Reports */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 px-2">HR Historical Data Reports</h4>
                        {REPORT_TYPES.filter(report => report.category === 'hr_historical').map((report) => (
                          <button
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`w-full text-left p-3 rounded-md ${
                              selectedReport?.id === report.id 
                                ? 'bg-blue-50 border-blue-200 border' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-1.5 rounded-sm ${report.color}`}>
                                <IconComponent name={report.icon} className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{report.title}</div>
                                <div className="text-xs text-gray-500">{report.fields} fields • {report.estimatedRecords} records</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 my-4"></div>

                      {/* Executive Reports */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 px-2">Executive Reports</h4>
                        {REPORT_TYPES.filter(report => report.category === 'executive').map((report) => (
                          <button
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`w-full text-left p-3 rounded-md ${
                              selectedReport?.id === report.id 
                                ? 'bg-blue-50 border-blue-200 border' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-1.5 rounded-sm ${report.color}`}>
                                <IconComponent name={report.icon} className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{report.title}</div>
                                <div className="text-xs text-gray-500">{report.fields} fields</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Details and Actions */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className={`p-2 rounded-md ${selectedReport.color}`}>
                        <IconComponent name={selectedReport.icon} className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedReport.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{selectedReport.description}</p>
                      </div>
                    </div>

                    {/* Report Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{selectedReport.fields}</div>
                        <div className="text-sm text-gray-500">Data Fields</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{selectedReport.estimatedRecords.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Est. Records</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{selectedReport.category === 'hr_historical' ? 'Excel' : 'PDF'}</div>
                        <div className="text-sm text-gray-500">Export Format</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">~2s</div>
                        <div className="text-sm text-gray-500">Generation Time</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
                      <button
                        onClick={() => handleGenerateReport(selectedReport, true)}
                        disabled={isGenerating}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Preview Data'}
                      </button>
                      <button
                        onClick={() => handleGenerateReport(selectedReport, false)}
                        disabled={isGenerating}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                      </button>
                    </div>

                    {/* Additional Info for HR Reports */}
                    {selectedReport.category === 'hr_historical' && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">HR Historical Data Report</h4>
                        <p className="text-sm text-blue-700">
                          This report uses your historical HR database with complete customer isolation. 
                          Data includes {selectedReport.fields} fields matching your Excel template structure 
                          with automatic calculations and data validation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6 flex items-center justify-center h-96">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
                      <p className="text-gray-500">Choose a report type from the left panel to get started</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Data Preview</h3>
              <p className="mt-1 text-sm text-gray-500">
                {previewData.length > 0 
                  ? `Showing ${previewData.length} sample records` 
                  : 'No preview data available'
                }
              </p>
              <div className="mt-6">
                {previewData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Data</h3>
                    <p className="text-gray-500">Generate a report preview to see data here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Report Configuration</h3>
              <p className="mt-1 text-sm text-gray-500">Configure default settings for report generation</p>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-base font-medium text-gray-900">Include Sensitive Data</label>
                    <p className="text-sm text-gray-500">Show full SSN and confidential information</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedFilters.includeSensitive}
                    onChange={(e) => 
                      setSelectedFilters(prev => ({ ...prev, includeSensitive: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="border-t border-gray-200"></div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Export Format</label>
                  <select 
                    defaultValue="excel"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="excel">Excel (matching template)</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date Range</label>
                  <select 
                    defaultValue="all"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">All historical data</option>
                    <option value="ytd">Year to date</option>
                    <option value="last12">Last 12 months</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

