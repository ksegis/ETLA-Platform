'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  EmployeeJobHistory,
  Department
} from '@/types/reporting'

// Grid Components
import PayStatementsGrid from '@/components/reporting/PayStatementsGrid'
import TimecardsGrid from '@/components/reporting/TimecardsGrid'
import TaxRecordsGrid from '@/components/reporting/TaxRecordsGrid'
import BenefitsGrid from '@/components/reporting/BenefitsGrid'
import DocumentsGrid from '@/components/reporting/DocumentsGrid'
import JobHistoryGrid from '@/components/reporting/JobHistoryGrid'

// Document Repository Components
import DocumentBrowserModal from '@/components/reporting/DocumentBrowserModal'
import DocumentViewer from '@/components/reporting/DocumentViewer'
import type { DocumentRecord } from '@/types/reporting'

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
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  CreditCard
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
  departments: Department[]
  error: string | null
}

export default function ReportingCockpitClient() {
  const { selectedTenant } = useTenant()
  const [mounted, setMounted] = useState(false)
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
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // Document Repository State
  const [documentBrowserOpen, setDocumentBrowserOpen] = useState(false)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null)
  const [employeeDocuments, setEmployeeDocuments] = useState<DocumentRecord[]>([])
  const [documentStats, setDocumentStats] = useState({
    totalDocuments: 0,
    documentsByCategory: {} as Record<string, number>,
    documentsByType: {} as Record<string, number>,
    recentDocuments: 0
  })

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load initial data on component mount
  useEffect(() => {
    if (mounted) {
      loadInitialData()
    }
  }, [selectedTenant, mounted])

  // Load enhanced employee data when employee is selected
  useEffect(() => {
    if (mounted && state.selectedEmployee) {
      loadEnhancedEmployeeData(state.selectedEmployee.id)
    } else {
      setState(prev => ({ ...prev, enhancedEmployeeData: null }))
    }
  }, [state.selectedEmployee, mounted])

  const loadInitialData = async () => {
    if (!mounted) return
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const tenantId = selectedTenant?.id
      
      // Dynamically import service to avoid SSR issues
      const { ReportingCockpitService } = await import('@/services/reportingCockpitService')
      const reportingService = new ReportingCockpitService()
      
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
    if (!mounted) return
    
    setState(prev => ({ ...prev, loadingEnhancedData: true }))
    
    try {
      const tenantId = selectedTenant?.id
      
      // Dynamically import services to avoid SSR issues
      const [{ ReportingCockpitService }, documentServiceModule] = await Promise.all([
        import("@/services/reportingCockpitService"),
        import("@/services/documentRepositoryService")
      ])
      const reportingService = new ReportingCockpitService()
      const documentService = documentServiceModule.default
      
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
    if (!mounted) return
    
    if (!searchTerm.trim()) {
      // If search is cleared, reload all employees
      loadInitialData()
      return
    }

    setState(prev => ({ ...prev, loading: true, searchTerm }))
    
    try {
      const tenantId = selectedTenant?.id
      
      // Dynamically import service to avoid SSR issues
      const { ReportingCockpitService } = await import('@/services/reportingCockpitService')
      const reportingService = new ReportingCockpitService()
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

  const refreshData = () => {
    loadInitialData()
    if (state.selectedEmployee) {
      loadEnhancedEmployeeData(state.selectedEmployee.id)
    }
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

  // Document Repository Handlers
  const handleOpenDocumentBrowser = () => {
    setDocumentBrowserOpen(true)
  }

  const handleDocumentSelect = (document: DocumentRecord) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
    setDocumentBrowserOpen(false)
  }

  const handleDocumentViewerClose = () => {
    setDocumentViewerOpen(false)
    setSelectedDocument(null)
  }

  const handleDocumentChange = (document: DocumentRecord) => {
    setSelectedDocument(document)
  }

  // Show loading state until component is mounted on client
  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading reporting cockpit...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Operations Reporting Cockpit
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Unified employee reporting and document management
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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

        {/* Function Bar - Moved to Top */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <Tabs value={activeDataTab} onValueChange={setActiveDataTab} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="overflow-x-auto">
                  <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 min-w-max">
                    <TabsTrigger value="pay-statements" className="text-xs sm:text-sm whitespace-nowrap">
                      <DollarSign className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Pay Statements</span>
                      <span className="sm:hidden">Pay</span>
                    </TabsTrigger>
                    <TabsTrigger value="timecards" className="text-xs sm:text-sm whitespace-nowrap">
                      <Clock className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Timecards</span>
                      <span className="sm:hidden">Time</span>
                    </TabsTrigger>
                    <TabsTrigger value="tax-records" className="text-xs sm:text-sm whitespace-nowrap">
                      <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Tax Records</span>
                      <span className="sm:hidden">Tax</span>
                    </TabsTrigger>
                    <TabsTrigger value="benefits" className="text-xs sm:text-sm whitespace-nowrap">
                      <Building className="h-4 w-4 mr-1 sm:mr-2" />
                      Benefits
                    </TabsTrigger>
                    <TabsTrigger value="job-history" className="text-xs sm:text-sm whitespace-nowrap">
                      <Briefcase className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Job History</span>
                      <span className="sm:hidden">Jobs</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs sm:text-sm whitespace-nowrap">
                      <Database className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">All Documents</span>
                      <span className="sm:hidden">Docs</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Generate Report</span>
                    <span className="sm:hidden">Report</span>
                  </Button>
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">View Facsimile</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <Download className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export Selected</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Collapsible Search/Filter Bar */}
        <Card className="mb-4 sm:mb-6">
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-base sm:text-lg">Search & Filters</CardTitle>
                    {state.selectedEmployee && (
                      <Badge variant="secondary" className="text-xs">
                        {state.selectedEmployee.full_name}
                      </Badge>
                    )}
                  </div>
                  {filtersOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {/* Employee Search & Selector */}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-2">
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
                    <div className="space-y-2">
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
                          <SelectItem key={department.id} value={department.name.toLowerCase()}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Actions</label>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={refreshData}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Employee Demographics & Summary */}
        {state.selectedEmployee && state.enhancedEmployeeData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Employee Basic Info */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {state.selectedEmployee.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {state.selectedEmployee.job_title} • {state.selectedEmployee.employee_id}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{state.selectedEmployee.department}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Hire Date:</span>
                    <span className="font-medium">{new Date(state.selectedEmployee.hire_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium">{formatCurrency(state.selectedEmployee.annual_salary || 0)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={state.selectedEmployee.status === 'active' ? 'default' : 'secondary'}>
                      {state.selectedEmployee.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee Demographics */}
            {state.enhancedEmployeeData.demographics && (
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-600" />
                    Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {state.enhancedEmployeeData.demographics.date_of_birth && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">
                          {calculateAge(state.enhancedEmployeeData.demographics.date_of_birth)} years
                        </span>
                      </div>
                    )}
                    {state.enhancedEmployeeData.demographics.phone_mobile && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{state.enhancedEmployeeData.demographics.phone_mobile}</span>
                      </div>
                    )}
                    {state.selectedEmployee.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-blue-600">{state.selectedEmployee.email}</span>
                      </div>
                    )}
                    {state.enhancedEmployeeData.demographics.address_line1 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">
                          {state.enhancedEmployeeData.demographics.address_line1}
                          {state.enhancedEmployeeData.demographics.city && `, ${state.enhancedEmployeeData.demographics.city}`}
                          {state.enhancedEmployeeData.demographics.state && `, ${state.enhancedEmployeeData.demographics.state}`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payroll Summary & Document Stats */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Payroll Summary */}
                  {state.enhancedEmployeeData.payrollSummary && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800 text-sm">Payroll YTD</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Gross:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(state.enhancedEmployeeData.payrollSummary.ytd_gross || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net:</span>
                          <span className="font-medium">
                            {formatCurrency(state.enhancedEmployeeData.payrollSummary.ytd_net || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Stats */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800 text-sm">Documents</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{documentStats.totalDocuments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payroll:</span>
                        <span className="font-medium">{documentStats.documentsByCategory['Payroll'] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span className="font-medium">{documentStats.documentsByCategory['Tax'] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Benefits:</span>
                        <span className="font-medium">{documentStats.documentsByCategory['Benefits'] || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Grids */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-0">
            <Tabs value={activeDataTab} onValueChange={setActiveDataTab} className="w-full">
              <TabsContent value="pay-statements" className="mt-0">
                <PayStatementsGrid
                  employeeId={state.selectedEmployee?.id}
                  tenantId={selectedTenant?.id}
                  startDate={state.dateRange.start}
                  endDate={state.dateRange.end}
                />
              </TabsContent>

              <TabsContent value="timecards" className="mt-0">
                <TimecardsGrid
                  employeeId={state.selectedEmployee?.id}
                  tenantId={selectedTenant?.id}
                  startDate={state.dateRange.start}
                  endDate={state.dateRange.end}
                />
              </TabsContent>

              <TabsContent value="tax-records" className="mt-0">
                <TaxRecordsGrid
                  employeeId={state.selectedEmployee?.id}
                  tenantId={selectedTenant?.id}
                />
              </TabsContent>

              <TabsContent value="benefits" className="mt-0">
                <BenefitsGrid
                  employeeId={state.selectedEmployee?.id}
                  tenantId={selectedTenant?.id}
                />
              </TabsContent>

              <TabsContent value="job-history" className="mt-0">
                <JobHistoryGrid
                  employeeId={state.selectedEmployee?.id}
                  tenantId={selectedTenant?.id}
                />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <DocumentsGrid
                  employeeId={state.selectedEmployee?.id}
                  tenantId={selectedTenant?.id}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Document Browser Modal */}
        <DocumentBrowserModal
          isOpen={documentBrowserOpen}
          onClose={() => setDocumentBrowserOpen(false)}
          employeeId={state.selectedEmployee?.id}
          employeeName={state.selectedEmployee?.full_name}
          tenantId={selectedTenant?.id}
          onDocumentSelect={handleDocumentSelect}
        />

        {/* Document Viewer Modal */}
        <DocumentViewer
          isOpen={documentViewerOpen}
          onClose={handleDocumentViewerClose}
          document={selectedDocument}
          documents={employeeDocuments}
          onDocumentChange={handleDocumentChange}
        />
      </div>
    </DashboardLayout>
  )
}
