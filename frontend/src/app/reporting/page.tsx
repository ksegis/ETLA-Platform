
'use client'

import React, { useState, useEffect } from 'react'

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenant } from '@/contexts/TenantContext'
// Import types only to avoid SSR issues
import type { 
  Employee, 
  EmployeeDemographics, 
  EnhancedEmployeeData,
  PayStatement,
  TaxRecord,
  BenefitRecord,
  TimecardRecord,
  EmployeeJobHistory
} from '@/types/reporting'

// Grid Components - Temporarily disabled to fix build
// import PayStatementsGrid from '@/components/reporting/PayStatementsGrid'
// import TimecardsGrid from '@/components/reporting/TimecardsGrid'
// import TaxRecordsGrid from '@/components/reporting/TaxRecordsGrid'
// import BenefitsGrid from '@/components/reporting/BenefitsGrid'
// import DocumentsGrid from '@/components/reporting/DocumentsGrid'
// import JobHistoryGrid from '@/components/reporting/JobHistoryGrid'

// Document Repository Components - Temporarily disabled to fix build
// import DocumentBrowserModal from '@/components/reporting/DocumentBrowserModal'
// import DocumentViewer from '@/components/reporting/DocumentViewer'
// import type { DocumentRecord } from '@/services/documentRepositoryService'
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  Clock,
  Building,
  Users,
  Eye,
  Settings,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface ReportingCockpitState {
  selectedEmployee: Employee | null
  enhancedEmployeeData: EnhancedEmployeeData | null
  dateRange: {
    start: string
    end: string
  }
  departmentFilter: string
  searchTerm: string
  loading: boolean
  loadingEnhancedData: boolean
  employees: Employee[]
  departments: string[]
  error: string | null
}

export default function ReportingCockpit() {
  const { selectedTenant } = useTenant()
  const [state, setState] = useState<ReportingCockpitState>({
    selectedEmployee: null,
    enhancedEmployeeData: null,
    dateRange: {
      start: '',
      end: ''
    },
    departmentFilter: '',
    searchTerm: '',
    loading: true,
    loadingEnhancedData: false,
    employees: [],
    departments: [],
    error: null
  })

  const [activeDataTab, setActiveDataTab] = useState('pay-statements')
  
  // Document Repository State
  const [documentBrowserOpen, setDocumentBrowserOpen] = useState(false)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [employeeDocuments, setEmployeeDocuments] = useState<any[]>([])
  const [documentStats, setDocumentStats] = useState({
    totalDocuments: 0,
    documentsByCategory: {} as Record<string, number>,
    documentsByType: {} as Record<string, number>,
    recentDocuments: 0
  })

  // Load initial data on component mount
  useEffect(() => {
    loadInitialData()
  }, [selectedTenant])

  // Load enhanced employee data when employee is selected
  useEffect(() => {
    if (state.selectedEmployee) {
      loadEnhancedEmployeeData(state.selectedEmployee.id)
    } else {
      setState(prev => ({ ...prev, enhancedEmployeeData: null }))
    }
  }, [state.selectedEmployee])

  const loadInitialData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const tenantId = selectedTenant?.id
      
      // Dynamically import service to avoid SSR issues
      const { default: reportingService } = await import('@/services/reportingCockpitService')
      
      // Load employees and departments in parallel
      const [employees, departments] = await Promise.all([
        reportingService.getEmployees(tenantId),
        reportingService.getDepartments(tenantId)
      ])
      
      setState(prev => ({ 
        ...prev, 
        employees,
        departments,
        loading: false 
      }))
    } catch (error) {
      console.error('Error loading initial data:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to load employee data. Please try again.'
      }))
    }
  }

  const loadEnhancedEmployeeData = async (employeeId: string) => {
    setState(prev => ({ ...prev, loadingEnhancedData: true }))
    
    try {
      const tenantId = selectedTenant?.id
      
      // Dynamically import services to avoid SSR issues
      const [{ default: reportingService }, { default: documentService }] = await Promise.all([
        import('@/services/reportingCockpitService'),
        import('@/services/documentRepositoryService')
      ])
      
      // Load enhanced employee data and document information in parallel
      const [enhancedData, documents, docStats] = await Promise.all([
        reportingService.getEnhancedEmployeeData(employeeId, tenantId),
        documentService.getEmployeeDocuments(employeeId, tenantId),
        documentService.getDocumentStats(employeeId, tenantId)
      ])
      
      setState(prev => ({ 
        ...prev, 
        enhancedEmployeeData: enhancedData,
        loadingEnhancedData: false 
      }))
      
      setEmployeeDocuments(documents)
      setDocumentStats(docStats)
    } catch (error) {
      console.error('Error loading enhanced employee data:', error)
      setState(prev => ({ 
        ...prev, 
        loadingEnhancedData: false,
        error: 'Failed to load employee details. Please try again.'
      }))
    }
  }

  const handleEmployeeSelect = (employee: Employee) => {
    setState(prev => ({ ...prev, selectedEmployee: employee }))
  }

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // If search is cleared, reload all employees
      loadInitialData()
      return
    }

    setState(prev => ({ ...prev, loading: true, searchTerm }))
    
    try {
      const tenantId = selectedTenant?.id
      
      // Dynamically import service to avoid SSR issues
      const { default: reportingService } = await import('@/services/reportingCockpitService')
      const employees = await reportingService.searchEmployees(searchTerm, tenantId)
      
      setState(prev => ({ 
        ...prev, 
        employees,
        loading: false 
      }))
    } catch (error) {
      console.error('Error searching employees:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to search employees. Please try again.'
      }))
    }
  }

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      selectedEmployee: null,
      enhancedEmployeeData: null,
      dateRange: { start: '', end: '' },
      departmentFilter: '',
      searchTerm: ''
    }))
    loadInitialData()
  }

  const exportAllData = () => {
    if (!state.selectedEmployee) return
    
    // TODO: Implement comprehensive export functionality
    console.log('Exporting all data for:', state.selectedEmployee.full_name)
  }

  // Helper functions
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatHours = (hours: number): string => {
    return `${hours.toFixed(1)} hrs`
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper function to get data for the currently active tab (for export functionality)
  const getActiveTabData = (): any[] => {
    // This will be populated by the individual grid components
    // For now, return empty array - each grid component will handle its own export
    return []
  }

  const refreshData = () => {
    loadInitialData()
    if (state.selectedEmployee) {
      loadEnhancedEmployeeData(state.selectedEmployee.id)
    }
  }

  // Document Repository Handlers
  const handleOpenDocumentBrowser = () => {
    setDocumentBrowserOpen(true)
  }

  const handleDocumentSelect = (document: any) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
    setDocumentBrowserOpen(false)
  }

  const handleDocumentViewerClose = () => {
    setDocumentViewerOpen(false)
    setSelectedDocument(null)
  }

  const handleDocumentChange = (document: any) => {
    setSelectedDocument(document)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Operations Reporting Cockpit
              </h1>
              <p className="text-gray-600 mt-1">
                Unified employee reporting and document management
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button 
                size="sm" 
                onClick={exportAllData}
                disabled={!state.selectedEmployee}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>

        {/* Master Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Employee Search & Selector */}
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-gray-700">Employee Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, ID, or email..."
                    value={state.searchTerm}
                    onChange={(e) => {
                      const value = e.target.value
                      setState(prev => ({ ...prev, searchTerm: value }))
                      
                      // Debounced search
                      clearTimeout((window as any).searchTimeout)
                      ;(window as any).searchTimeout = setTimeout(() => {
                        handleSearch(value)
                      }, 300)
                    }}
                    className="pl-10"
                  />
                  {state.loading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>
                
                {/* Employee Dropdown */}
                {state.employees.length > 0 && (
                  <Select 
                    value={state.selectedEmployee?.id || ''} 
                    onValueChange={(value) => {
                      const employee = state.employees.find(emp => emp.id === value)
                      if (employee) handleEmployeeSelect(employee)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select from ${state.employees.length} employees...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {state.employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{employee.full_name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Badge variant="outline" className="text-xs">
                                {employee.employee_id}
                              </Badge>
                              {employee.department && (
                                <span>{employee.department}</span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={state.dateRange.start}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="text-sm"
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={state.dateRange.end}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Select 
                  value={state.departmentFilter} 
                  onValueChange={(value) => setState(prev => ({ ...prev, departmentFilter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {state.departments.map((department) => (
                      <SelectItem key={department} value={department.toLowerCase()}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actions</label>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Detail View */}
        {state.selectedEmployee && state.enhancedEmployeeData && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader className="bg-gray-100 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-gray-600" />
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {state.enhancedEmployeeData.employee.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {state.enhancedEmployeeData.employee.job_title} - {state.enhancedEmployeeData.employee.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={state.enhancedEmployeeData.employee.status === 'active' ? 'default' : 'destructive'}>
                    {state.enhancedEmployeeData.employee.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleOpenDocumentBrowser}>
                    <FileText className="h-4 w-4 mr-2" />
                    Document Repository
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Demographics */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Demographics</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {state.enhancedEmployeeData.demographics?.email}</p>
                  <p><strong>Phone:</strong> {state.enhancedEmployeeData.demographics?.phone_mobile}</p>
                  <p><strong>Location:</strong> {`${state.enhancedEmployeeData.demographics?.city}, ${state.enhancedEmployeeData.demographics?.state}`}</p>
                  <p><strong>Age:</strong> {state.enhancedEmployeeData.demographics?.birth_date ? calculateAge(state.enhancedEmployeeData.demographics.birth_date) : 'N/A'}</p>
                </div>
              </div>
              {/* Employment Details */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Employment</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Hire Date:</strong> {state.enhancedEmployeeData.employee.hire_date}</p>
                  <p><strong>Type:</strong> {state.enhancedEmployeeData.employee.employment_type}</p>
                  <p><strong>Manager:</strong> {state.enhancedEmployeeData.employee.manager_supervisor}</p>
                  <p><strong>Salary:</strong> {formatCurrency(state.enhancedEmployeeData.employee.annual_salary || 0)}</p>
                </div>
              </div>
              {/* Payroll Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">YTD Payroll</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Gross Pay:</strong> {formatCurrency(state.enhancedEmployeeData.payrollSummary?.ytd_gross || 0)}</p>
                  <p><strong>Net Pay:</strong> {formatCurrency(state.enhancedEmployeeData.payrollSummary?.ytd_net || 0)}</p>
                  <p><strong>Total Hours:</strong> {formatHours(state.enhancedEmployeeData.payrollSummary?.total_hours_ytd || 0)}</p>
                  <p><strong>Last Pay Date:</strong> {state.enhancedEmployeeData.payrollSummary?.latest_pay_date}</p>
                </div>
              </div>
              {/* Document Stats */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Documents</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Total Documents:</strong> {documentStats.totalDocuments}</p>
                  <p><strong>Pay Statements:</strong> {documentStats.documentsByCategory['Payroll'] || 0}</p>
                  <p><strong>Tax Forms:</strong> {documentStats.documentsByCategory['Tax'] || 0}</p>
                  <p><strong>Benefits:</strong> {documentStats.documentsByCategory['Benefits'] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Grids */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-0">
            <Tabs value={activeDataTab} onValueChange={setActiveDataTab} className="w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <TabsList>
                  <TabsTrigger value="pay-statements">Pay Statements</TabsTrigger>
                  <TabsTrigger value="timecards">Timecards</TabsTrigger>
                  <TabsTrigger value="tax-records">Tax Records</TabsTrigger>
                  <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  <TabsTrigger value="job-history">Job History</TabsTrigger>
                  <TabsTrigger value="documents">All Documents</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Facsimile
                  </Button>
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button size="sm" disabled={!state.selectedEmployee}>
                    <Settings className="h-4 w-4 mr-2" />
                    Save View
                  </Button>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Document Browser Modal - Temporarily disabled */}
        {/* <DocumentBrowserModal
          isOpen={documentBrowserOpen}
          onClose={handleDocumentBrowserClose}
          employeeId={state.selectedEmployee?.id}
          employeeName={state.selectedEmployee?.full_name}
          tenantId={selectedTenant?.id}
          onDocumentSelect={handleDocumentSelect}
        /> */}

        {/* Document Viewer Modal - Temporarily disabled */}
        {/* <DocumentViewer
          isOpen={documentViewerOpen}
          onClose={handleDocumentViewerClose}
          document={selectedDocument}
          documents={employeeDocuments}
          onDocumentChange={handleDocumentChange}
        /> */}
      </div>
    </DashboardLayout>
  )
}

