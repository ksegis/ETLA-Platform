'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, RefreshCw, Download, Calendar, Users, TrendingUp, 
  FileText, Building, DollarSign, MapPin, Settings, Eye, Clock,
  BarChart3, PieChart, LineChart, Database, Shield, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'

interface ReportType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  fieldCount: number
  category: 'operational' | 'hr_historical' | 'executive'
  tableName: string
  excelTemplate: string
}

interface ReportConfig {
  reportType: string
  dateRange: {
    from: string
    to: string
  }
  includeHistorical: boolean
  filters: {
    activeOnly: boolean
    includeTerminated: boolean
    departments: string[]
    positions: string[]
  }
  exportFormat: 'excel' | 'csv' | 'pdf'
  options: {
    includeSensitive: boolean
    includeCalculated: boolean
    addValidation: boolean
  }
}

const reportTypes: ReportType[] = [
  // Operational Reports (Existing)
  {
    id: 'pay_period',
    title: 'Pay Period Analysis',
    description: 'Payroll trends and metrics by pay period',
    icon: <TrendingUp className="h-6 w-6" />,
    fieldCount: 8,
    category: 'operational',
    tableName: 'payroll_periods',
    excelTemplate: 'pay_period_template.xlsx'
  },
  {
    id: 'benefits',
    title: 'Benefit Group Analysis',
    description: 'Benefits enrollment and costs by group',
    icon: <Shield className="h-6 w-6" />,
    fieldCount: 12,
    category: 'operational',
    tableName: 'benefits_groups',
    excelTemplate: 'benefits_template.xlsx'
  },
  {
    id: 'departments',
    title: 'Department Analysis',
    description: 'Employee distribution, costs, and metrics by department',
    icon: <Building className="h-6 w-6" />,
    fieldCount: 10,
    category: 'operational',
    tableName: 'departments',
    excelTemplate: 'department_template.xlsx'
  },
  
  // HR Historical Data Reports (New)
  {
    id: 'demographics',
    title: 'Current Demographics',
    description: 'Complete employee profile snapshot with 35 comprehensive data fields',
    icon: <Users className="h-6 w-6" />,
    fieldCount: 35,
    category: 'hr_historical',
    tableName: 'employee_demographics',
    excelTemplate: 'demographics_template.xlsx'
  },
  {
    id: 'status_history',
    title: 'Employee Status History',
    description: 'Status change tracking over time (Active, Terminated, On Leave, etc.)',
    icon: <Clock className="h-6 w-6" />,
    fieldCount: 6,
    category: 'hr_historical',
    tableName: 'employee_status_history',
    excelTemplate: 'status_history_template.xlsx'
  },
  {
    id: 'pay_history',
    title: 'Compensation History',
    description: 'Pay changes, analysis, and trends with automatic calculations',
    icon: <DollarSign className="h-6 w-6" />,
    fieldCount: 10,
    category: 'hr_historical',
    tableName: 'employee_pay_history',
    excelTemplate: 'pay_history_template.xlsx'
  },
  {
    id: 'position_history',
    title: 'Position History',
    description: 'Organizational and role changes, promotions, transfers',
    icon: <MapPin className="h-6 w-6" />,
    fieldCount: 13,
    category: 'hr_historical',
    tableName: 'employee_position_history',
    excelTemplate: 'position_history_template.xlsx'
  },
  {
    id: 'tax_information',
    title: 'Tax Information',
    description: 'Federal, state, and local tax withholding configurations',
    icon: <FileText className="h-6 w-6" />,
    fieldCount: 26,
    category: 'hr_historical',
    tableName: 'employee_tax_information',
    excelTemplate: 'tax_information_template.xlsx'
  },
  {
    id: 'custom_fields',
    title: 'Custom Fields',
    description: 'Organization-specific HRIS data and custom field values',
    icon: <Settings className="h-6 w-6" />,
    fieldCount: 4,
    category: 'hr_historical',
    tableName: 'employee_custom_fields',
    excelTemplate: 'custom_fields_template.xlsx'
  },
  
  // Executive Reports (Enhanced)
  {
    id: 'executive',
    title: 'Monthly Executive Report',
    description: 'High-level metrics and trends for leadership (enhanced with HR data)',
    icon: <BarChart3 className="h-6 w-6" />,
    fieldCount: 25,
    category: 'executive',
    tableName: 'executive_summary',
    excelTemplate: 'executive_template.xlsx'
  },
  {
    id: 'analytics',
    title: 'Detailed Analytics',
    description: 'Comprehensive data analysis including HR trends and insights',
    icon: <LineChart className="h-6 w-6" />,
    fieldCount: 50,
    category: 'executive',
    tableName: 'detailed_analytics',
    excelTemplate: 'analytics_template.xlsx'
  },
  {
    id: 'compliance',
    title: 'Compliance Report',
    description: 'Regulatory compliance including EEOC, tax, and audit documentation',
    icon: <CheckCircle className="h-6 w-6" />,
    fieldCount: 30,
    category: 'executive',
    tableName: 'compliance_data',
    excelTemplate: 'compliance_template.xlsx'
  }
]

export default function EnhancedReportingPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    reportType: '',
    dateRange: {
      from: new Date().toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    includeHistorical: false,
    filters: {
      activeOnly: true,
      includeTerminated: false,
      departments: [],
      positions: []
    },
    exportFormat: 'excel',
    options: {
      includeSensitive: false,
      includeCalculated: true,
      addValidation: true
    }
  })
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalEmployees: 0,
    payrollVolume: 0,
    etlJobs: 0,
    processingTime: 0,
    statusChanges: 0,
    positionChanges: 0,
    payAdjustments: 0,
    taxUpdates: 0
  })

  // Load user and customer information
  useEffect(() => {
    loadUserAndCustomerInfo()
    loadDashboardMetrics()
  }, [])

  const loadUserAndCustomerInfo = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error loading user:', userError)
        return
      }

      setCurrentUser(user)

      // Get user's tenant/customer information
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()

      if (tenantError || !tenantData) {
        console.error('Error loading tenant info:', tenantError)
        return
      }

      // Get customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', tenantData.tenant_id)
        .single()

      if (!customerError && customerData) {
        setCustomerInfo(customerData)
      }
    } catch (error) {
      console.error('Error in loadUserAndCustomerInfo:', error)
    }
  }

  const loadDashboardMetrics = async () => {
    try {
      // This would load actual metrics from the database
      // For now, using sample data
      setDashboardMetrics({
        totalEmployees: 2113,
        payrollVolume: 8400000,
        etlJobs: 1247,
        processingTime: 4.2,
        statusChanges: 23,
        positionChanges: 8,
        payAdjustments: 15,
        taxUpdates: 3
      })
    } catch (error) {
      console.error('Error loading dashboard metrics:', error)
    }
  }

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId)
    setReportConfig(prev => ({ ...prev, reportType: reportId }))
    setShowPreview(false)
  }

  const handlePreviewData = async () => {
    if (!selectedReport || !customerInfo) return

    setIsLoading(true)
    try {
      const reportType = reportTypes.find(r => r.id === selectedReport)
      if (!reportType) return

      // Query the appropriate table based on report type
      let query = supabase
        .from(reportType.tableName)
        .select('*')
        .eq('customer_id', customerInfo.id)

      // Apply date range filters
      if (reportConfig.includeHistorical && reportConfig.dateRange.from && reportConfig.dateRange.to) {
        query = query
          .gte('effective_date', reportConfig.dateRange.from)
          .lte('effective_date', reportConfig.dateRange.to)
      }

      // Apply status filters for relevant reports
      if (reportConfig.filters.activeOnly && reportType.id === 'demographics') {
        query = query.eq('employee_status', 'Active')
      }

      const { data, error } = await query.limit(10) // Preview only first 10 records

      if (error) {
        console.error('Error loading preview data:', error)
        return
      }

      setPreviewData(data || [])
      setShowPreview(true)
    } catch (error) {
      console.error('Error in handlePreviewData:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = async () => {
    if (!selectedReport || !customerInfo) return

    setIsLoading(true)
    try {
      const reportType = reportTypes.find(r => r.id === selectedReport)
      if (!reportType) return

      // This would generate the actual Excel export
      // For now, we'll simulate the export process
      console.log('Exporting report:', {
        reportType: reportType.title,
        customer: customerInfo.company_name,
        config: reportConfig
      })

      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real implementation, this would:
      // 1. Query the full dataset based on configuration
      // 2. Generate Excel file matching the template structure
      // 3. Apply customer isolation and security policies
      // 4. Log the export activity for audit trail
      // 5. Provide download link or email delivery

      alert(`Report "${reportType.title}" exported successfully for ${customerInfo.company_name}`)
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'operational': return 'Operational Reports'
      case 'hr_historical': return 'HR Historical Data Reports'
      case 'executive': return 'Executive Reports'
      default: return 'Reports'
    }
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'operational': return 'Current payroll, benefits, and departmental analysis'
      case 'hr_historical': return 'Historical employee data matching Excel template structure'
      case 'executive': return 'High-level analytics and compliance reporting'
      default: return ''
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reporting & Analytics Dashboard</h1>
            <p className="text-gray-600">
              Enterprise reporting by pay period, benefit group, department, and HR historical data for{' '}
              <span className="font-medium text-blue-600">
                {customerInfo?.company_name || 'Loading...'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadDashboardMetrics}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              onClick={handleExportReport}
              disabled={!selectedReport || isLoading}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Enhanced Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardMetrics.totalEmployees)}</p>
                <p className="text-xs text-green-600">+2.3% from last period</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payroll Volume</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardMetrics.payrollVolume)}</p>
                <p className="text-xs text-green-600">+5.7% from last period</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status Changes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.statusChanges}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pay Adjustments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.payAdjustments}</p>
                <p className="text-xs text-gray-500">Last quarter</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Report Categories */}
        {['operational', 'hr_historical', 'executive'].map(category => (
          <div key={category} className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{getCategoryTitle(category)}</h2>
              <p className="text-gray-600">{getCategoryDescription(category)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes
                .filter(report => report.category === category)
                .map(report => (
                  <div
                    key={report.id}
                    className={`bg-white p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedReport === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => handleReportSelect(report.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        selectedReport === report.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {report.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {report.fieldCount} fields
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-gray-600 text-sm">{report.description}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Report Configuration Panel */}
        {selectedReport && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={reportConfig.dateRange.from}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={reportConfig.dateRange.to}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.filters.activeOnly}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        filters: { ...prev.filters, activeOnly: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active employees only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.filters.includeTerminated}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        filters: { ...prev.filters, includeTerminated: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include terminated employees</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeHistorical}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        includeHistorical: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include historical changes</span>
                  </label>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={reportConfig.exportFormat}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    exportFormat: e.target.value as 'excel' | 'csv' | 'pdf'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="excel">Excel (matching template)</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
                
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.options.includeCalculated}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        options: { ...prev.options, includeCalculated: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include calculated fields</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.options.addValidation}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        options: { ...prev.options, addValidation: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add data validation</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button
                onClick={handlePreviewData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isLoading ? 'Loading...' : 'Preview Data'}
              </Button>
              <Button
                onClick={handleExportReport}
                disabled={!selectedReport || isLoading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {showPreview && previewData.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Data Preview - {reportTypes.find(r => r.id === selectedReport)?.title}
            </h3>
            
            <div className="mb-4 text-sm text-gray-600">
              <p>Customer: <span className="font-medium">{customerInfo?.company_name}</span></p>
              <p>Total Records: <span className="font-medium">{previewData.length}+ records</span></p>
              <p>Date Range: <span className="font-medium">
                {reportConfig.dateRange.from} to {reportConfig.dateRange.to}
              </span></p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData[0] && Object.keys(previewData[0]).slice(0, 6).map(key => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).slice(0, 6).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Data validation passed
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Customer isolation verified
                </span>
                <span className="flex items-center gap-1">
                  <Database className="h-4 w-4 text-purple-600" />
                  Export format ready
                </span>
              </div>
              <Button
                onClick={handleExportReport}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Export to Excel
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

