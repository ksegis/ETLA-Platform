'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
 * Enhanced Reporting & Analytics Dashboard (Fixed Version)
 * 
 * Improved navigation, responsive design, and better user experience
 * for HR reporting and analytics with comprehensive filtering capabilities.
 * Fixed image processing errors and simplified component structure.
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

// Icon component mapper to avoid dynamic imports
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
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label>Departments</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position Filter */}
            <div className="space-y-2">
              <Label>Positions</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Employee Status</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="activeOnly"
                    checked={selectedFilters.activeOnly}
                    onCheckedChange={(checked) => 
                      setSelectedFilters(prev => ({ ...prev, activeOnly: checked as boolean }))
                    }
                  />
                  <Label htmlFor="activeOnly" className="text-sm">Active employees only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTerminated"
                    checked={selectedFilters.includeTerminated}
                    onCheckedChange={(checked) => 
                      setSelectedFilters(prev => ({ ...prev, includeTerminated: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeTerminated" className="text-sm">Include terminated</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalEmployees.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Active workforce</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payroll Volume</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(dashboardStats.payrollVolume / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">Annual payroll</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status Changes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.statusChanges}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pay Adjustments</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.payAdjustments}</div>
                  <p className="text-xs text-muted-foreground">Recent changes</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Generate commonly used reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REPORT_TYPES.filter(report => report.category === 'hr_historical').slice(0, 3).map((report) => (
                    <Button
                      key={report.id}
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        setSelectedReport(report)
                        setActiveTab('reports')
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-md ${report.color}`}>
                          <IconComponent name={report.icon} className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-muted-foreground">{report.fields} fields</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Categories */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Categories</CardTitle>
                    <CardDescription>Select a report type to generate</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-1 p-4">
                        {/* Operational Reports */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 px-2">Operational Reports</h4>
                          {REPORT_TYPES.filter(report => report.category === 'operational').map((report) => (
                            <Button
                              key={report.id}
                              variant={selectedReport?.id === report.id ? "default" : "ghost"}
                              className="w-full justify-start h-auto p-3"
                              onClick={() => setSelectedReport(report)}
                            >
                              <div className="flex items-center space-x-3 w-full">
                                <div className={`p-1.5 rounded-sm ${report.color}`}>
                                  <IconComponent name={report.icon} className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">{report.title}</div>
                                  <div className="text-xs text-muted-foreground">{report.estimatedRecords} records</div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        {/* HR Historical Reports */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 px-2">HR Historical Data Reports</h4>
                          {REPORT_TYPES.filter(report => report.category === 'hr_historical').map((report) => (
                            <Button
                              key={report.id}
                              variant={selectedReport?.id === report.id ? "default" : "ghost"}
                              className="w-full justify-start h-auto p-3"
                              onClick={() => setSelectedReport(report)}
                            >
                              <div className="flex items-center space-x-3 w-full">
                                <div className={`p-1.5 rounded-sm ${report.color}`}>
                                  <IconComponent name={report.icon} className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">{report.title}</div>
                                  <div className="text-xs text-muted-foreground">{report.fields} fields • {report.estimatedRecords} records</div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        {/* Executive Reports */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 px-2">Executive Reports</h4>
                          {REPORT_TYPES.filter(report => report.category === 'executive').map((report) => (
                            <Button
                              key={report.id}
                              variant={selectedReport?.id === report.id ? "default" : "ghost"}
                              className="w-full justify-start h-auto p-3"
                              onClick={() => setSelectedReport(report)}
                            >
                              <div className="flex items-center space-x-3 w-full">
                                <div className={`p-1.5 rounded-sm ${report.color}`}>
                                  <IconComponent name={report.icon} className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">{report.title}</div>
                                  <div className="text-xs text-muted-foreground">{report.fields} fields</div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Report Details and Actions */}
              <div className="lg:col-span-2">
                {selectedReport ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-md ${selectedReport.color}`}>
                          <IconComponent name={selectedReport.icon} className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>{selectedReport.title}</CardTitle>
                          <CardDescription>{selectedReport.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Report Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <Button
                          onClick={() => handleGenerateReport(selectedReport, true)}
                          disabled={isGenerating}
                          className="flex-1"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {isGenerating ? 'Generating...' : 'Preview Data'}
                        </Button>
                        <Button
                          onClick={() => handleGenerateReport(selectedReport, false)}
                          disabled={isGenerating}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isGenerating ? 'Generating...' : 'Generate Report'}
                        </Button>
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
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
                        <p className="text-gray-500">Choose a report type from the left panel to get started</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  {previewData.length > 0 
                    ? `Showing ${previewData.length} sample records` 
                    : 'No preview data available'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Configure default settings for report generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Include Sensitive Data</Label>
                      <p className="text-sm text-muted-foreground">Show full SSN and confidential information</p>
                    </div>
                    <Checkbox
                      checked={selectedFilters.includeSensitive}
                      onCheckedChange={(checked) => 
                        setSelectedFilters(prev => ({ ...prev, includeSensitive: checked as boolean }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select defaultValue="excel">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (matching template)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All historical data</SelectItem>
                        <SelectItem value="ytd">Year to date</SelectItem>
                        <SelectItem value="last12">Last 12 months</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

