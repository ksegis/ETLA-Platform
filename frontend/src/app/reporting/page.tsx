'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenant } from '@/contexts/TenantContext'
import reportingCockpitService, { 
  Employee, 
  EmployeeDemographics, 
  EnhancedEmployeeData,
  PayStatement,
  TaxRecord,
  BenefitRecord,
  TimecardRecord,
  EmployeeJobHistory
} from '@/services/reportingCockpitService'

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
import documentRepositoryService, { DocumentRecord } from '@/services/documentRepositoryService'
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
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null)
  const [employeeDocuments, setEmployeeDocuments] = useState<DocumentRecord[]>([])
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
      
      // Load employees and departments in parallel
      const [employees, departments] = await Promise.all([
        reportingCockpitService.getEmployees(tenantId),
        reportingCockpitService.getDepartments(tenantId)
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
      
      // Load enhanced employee data and document information in parallel
      const [enhancedData, documents, docStats] = await Promise.all([
        reportingCockpitService.getEnhancedEmployeeData(employeeId, tenantId),
        documentRepositoryService.getEmployeeDocuments(employeeId, tenantId),
        documentRepositoryService.getDocumentStats(employeeId, tenantId)
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
      const employees = await reportingCockpitService.searchEmployees(searchTerm, tenantId)
      
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
                    className="flex-1"
                    onClick={refreshData}
                    disabled={state.loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${state.loading ? 'animate-spin' : ''}`} />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4-Quadrant Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quadrant 1: Employee Overview & Demographics */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Employee Overview & Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.loadingEnhancedData ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
                  <p className="text-gray-500">Loading employee details...</p>
                </div>
              ) : state.selectedEmployee && state.enhancedEmployeeData ? (
                <div className="space-y-4">
                  {/* Employee Basic Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                      <span className="text-lg font-semibold">
                        {state.selectedEmployee.first_name?.[0]}{state.selectedEmployee.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{state.selectedEmployee.full_name}</h3>
                      <p className="text-gray-600">
                        {state.selectedEmployee.job_title || state.selectedEmployee.position || 'N/A'}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{state.selectedEmployee.employee_id}</span>
                        {state.selectedEmployee.employee_code && (
                          <>
                            <span>•</span>
                            <span>{state.selectedEmployee.employee_code}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Demographics Section */}
                  {state.enhancedEmployeeData.demographics && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Demographics
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {state.enhancedEmployeeData.demographics.date_of_birth && (
                          <div>
                            <span className="font-medium text-gray-700">Age:</span>
                            <p>{reportingCockpitService.calculateAge(state.enhancedEmployeeData.demographics.date_of_birth)} years</p>
                          </div>
                        )}
                        {state.enhancedEmployeeData.demographics.gender && (
                          <div>
                            <span className="font-medium text-gray-700">Gender:</span>
                            <p>{state.enhancedEmployeeData.demographics.gender}</p>
                          </div>
                        )}
                        {state.enhancedEmployeeData.demographics.ethnicity && (
                          <div>
                            <span className="font-medium text-gray-700">Ethnicity:</span>
                            <p>{state.enhancedEmployeeData.demographics.ethnicity}</p>
                          </div>
                        )}
                        {state.enhancedEmployeeData.demographics.veteran_status !== undefined && (
                          <div>
                            <span className="font-medium text-gray-700">Veteran:</span>
                            <p>{state.enhancedEmployeeData.demographics.veteran_status ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {state.enhancedEmployeeData.demographics.has_disability !== undefined && (
                          <div>
                            <span className="font-medium text-gray-700">Disability:</span>
                            <p>{state.enhancedEmployeeData.demographics.has_disability ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {state.enhancedEmployeeData.demographics.marital_status && (
                          <div>
                            <span className="font-medium text-gray-700">Marital Status:</span>
                            <p>{state.enhancedEmployeeData.demographics.marital_status}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Employment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Department:</span>
                      <p>{state.selectedEmployee.department || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Hire Date:</span>
                      <p>{new Date(state.selectedEmployee.hire_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Manager:</span>
                      <p>{state.selectedEmployee.manager_supervisor || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p>{state.selectedEmployee.work_location || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Employment Type:</span>
                      <p>{state.selectedEmployee.employment_type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Pay Type:</span>
                      <p>{state.selectedEmployee.pay_type || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Quick Stats with Real Data */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {state.enhancedEmployeeData.payrollSummary?.ytd_gross 
                          ? reportingCockpitService.formatCurrency(state.enhancedEmployeeData.payrollSummary.ytd_gross)
                          : '$0'
                        }
                      </div>
                      <div className="text-xs text-gray-500">YTD Earnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {state.enhancedEmployeeData.payrollSummary?.total_hours_ytd 
                          ? reportingCockpitService.formatHours(state.enhancedEmployeeData.payrollSummary.total_hours_ytd)
                          : '0'
                        }
                      </div>
                      <div className="text-xs text-gray-500">Hours Worked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {state.enhancedEmployeeData.documentCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Documents</div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  {state.enhancedEmployeeData.demographics && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {state.selectedEmployee.email && (
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <p className="text-blue-600">{state.selectedEmployee.email}</p>
                          </div>
                        )}
                        {state.enhancedEmployeeData.demographics.phone_mobile && (
                          <div>
                            <span className="font-medium text-gray-700">Mobile:</span>
                            <p>{state.enhancedEmployeeData.demographics.phone_mobile}</p>
                          </div>
                        )}
                        {state.enhancedEmployeeData.demographics.address_line1 && (
                          <div>
                            <span className="font-medium text-gray-700">Address:</span>
                            <p>
                              {state.enhancedEmployeeData.demographics.address_line1}
                              {state.enhancedEmployeeData.demographics.city && `, ${state.enhancedEmployeeData.demographics.city}`}
                              {state.enhancedEmployeeData.demographics.state && `, ${state.enhancedEmployeeData.demographics.state}`}
                              {state.enhancedEmployeeData.demographics.postal_code && ` ${state.enhancedEmployeeData.demographics.postal_code}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : state.selectedEmployee ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4 text-orange-400" />
                  <p>Employee details not available</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => loadEnhancedEmployeeData(state.selectedEmployee!.id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select an employee to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quadrant 2: Report Generation & Job Catalog Hub */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Report Generation & Job Catalog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Report Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Pay Statement
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Timecard Report
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Tax Records
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Building className="h-4 w-4 mr-2" />
                    Benefits Report
                  </Button>
                </div>

                {/* Job Catalog Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Job Catalog
                  </h4>
                  <div className="space-y-2">
                    <div className="p-2 border rounded text-sm">
                      <div className="font-medium">Senior Developer</div>
                      <div className="text-gray-500">Engineering • $80,000-$120,000</div>
                    </div>
                    <div className="p-2 border rounded text-sm">
                      <div className="font-medium">Marketing Manager</div>
                      <div className="text-gray-500">Marketing • $70,000-$90,000</div>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Export Formats</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">PDF</Button>
                    <Button variant="outline" size="sm">Excel</Button>
                    <Button variant="outline" size="sm">CSV</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quadrant 3: Interactive Data Grid */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Interactive Data Grid
                </div>
                {state.selectedEmployee && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const tabData = getActiveTabData()
                      if (tabData.length > 0) {
                        reportingCockpitService.exportToCSV(
                          tabData, 
                          `${state.selectedEmployee?.full_name}_${activeDataTab}_${new Date().toISOString().split('T')[0]}`
                        )
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeDataTab} onValueChange={setActiveDataTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="pay-statements" className="text-xs">Pay</TabsTrigger>
                  <TabsTrigger value="timecards" className="text-xs">Time</TabsTrigger>
                  <TabsTrigger value="tax-records" className="text-xs">Tax</TabsTrigger>
                  <TabsTrigger value="benefits" className="text-xs">Benefits</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">Docs</TabsTrigger>
                  <TabsTrigger value="job-history" className="text-xs">Jobs</TabsTrigger>
                </TabsList>
                
                {/* Pay Statements Tab */}
                <TabsContent value="pay-statements" className="mt-4">
                  <PayStatementsGrid 
                    employeeId={state.selectedEmployee?.id}
                    tenantId={selectedTenant?.id}
                    startDate={state.dateRange.start}
                    endDate={state.dateRange.end}
                  />
                </TabsContent>
                
                {/* Timecards Tab */}
                <TabsContent value="timecards" className="mt-4">
                  <TimecardsGrid 
                    employeeId={state.selectedEmployee?.id}
                    tenantId={selectedTenant?.id}
                    startDate={state.dateRange.start}
                    endDate={state.dateRange.end}
                  />
                </TabsContent>
                
                {/* Tax Records Tab */}
                <TabsContent value="tax-records" className="mt-4">
                  <TaxRecordsGrid 
                    employeeId={state.selectedEmployee?.id}
                    tenantId={selectedTenant?.id}
                  />
                </TabsContent>
                
                {/* Benefits Tab */}
                <TabsContent value="benefits" className="mt-4">
                  <BenefitsGrid 
                    employeeId={state.selectedEmployee?.id}
                    tenantId={selectedTenant?.id}
                  />
                </TabsContent>
                
                {/* Documents Tab */}
                <TabsContent value="documents" className="mt-4">
                  <DocumentsGrid 
                    employeeId={state.selectedEmployee?.id}
                    tenantId={selectedTenant?.id}
                  />
                </TabsContent>

                {/* Job History Tab */}
                <TabsContent value="job-history" className="mt-4">
                  <JobHistoryGrid 
                    employeeId={state.selectedEmployee?.id}
                    tenantId={selectedTenant?.id}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quadrant 4: Document Viewer & Repository */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Document Viewer & Repository
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Document Repository Status */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-900">Document Repository</div>
                      <div className="text-sm text-blue-700">
                        {state.selectedEmployee ? 
                          `${state.selectedEmployee.full_name} - ${documentStats.totalDocuments} documents found` : 
                          'Select employee to view documents'
                        }
                      </div>
                      {state.selectedEmployee && documentStats.recentDocuments > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          {documentStats.recentDocuments} new documents (last 30 days)
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!state.selectedEmployee}
                      onClick={handleOpenDocumentBrowser}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Browse
                    </Button>
                  </div>
                </div>

                {/* Document Statistics */}
                {state.selectedEmployee && documentStats.totalDocuments > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Document Categories:</div>
                    <div className="space-y-2">
                      {Object.entries(documentStats.documentsByCategory).slice(0, 4).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{category}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Preview Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  {selectedDocument ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-blue-500" />
                      <p className="text-sm font-medium">{selectedDocument.document_name}</p>
                      <p className="text-xs text-gray-500">{selectedDocument.document_category}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDocumentViewerOpen(true)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Document
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-2">Document preview area</p>
                      <p className="text-sm text-gray-400">
                        {state.selectedEmployee ? 
                          'Browse documents to preview them here' : 
                          'Select an employee to view documents'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Document Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!selectedDocument}
                    onClick={() => selectedDocument && console.log('Download:', selectedDocument.document_name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!state.selectedEmployee}
                    onClick={handleOpenDocumentBrowser}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Repository
                  </Button>
                </div>

                {/* Facsimile Options */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Facsimile Generation</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start" 
                      disabled={!state.selectedEmployee}
                      onClick={() => console.log('Generate pay stub for:', state.selectedEmployee?.full_name)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Pay Stub
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start" 
                      disabled={!state.selectedEmployee}
                      onClick={() => console.log('Generate tax form for:', state.selectedEmployee?.full_name)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Tax Form
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start" 
                      disabled={!state.selectedEmployee}
                      onClick={() => console.log('Generate employment verification for:', state.selectedEmployee?.full_name)}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Employment Verification
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {state.selectedEmployee ? 
                    `Viewing: ${state.selectedEmployee.full_name}` : 
                    'No employee selected'
                  }
                </Badge>
                {state.dateRange.start && state.dateRange.end && (
                  <Badge variant="outline">
                    {state.dateRange.start} to {state.dateRange.end}
                  </Badge>
                )}
              </div>
              
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
