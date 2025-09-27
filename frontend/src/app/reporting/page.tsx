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
import { useTenant, useAccessibleTenantIds } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

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

interface Employee {
  id: string
  employee_id: string
  employee_code?: string
  full_name: string
  first_name?: string
  last_name?: string
  email?: string
  job_title?: string
  department?: string
  position?: string
  hire_date?: string
  status?: string
  employment_status?: string
  employment_type?: string
  work_location?: string
  manager_supervisor?: string
  annual_salary?: number
  pay_type?: string
  pay_frequency?: string
  tenant_id?: string
  created_at?: string
  updated_at?: string
}

interface Department {
  id: string
  name: string
  tenant_id?: string
  created_at?: string
  updated_at?: string
}

interface EmployeeDemographics {
  id?: string
  employee_id?: string
  date_of_birth?: string
  phone_mobile?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  marital_status?: string
  gender?: string
  ethnicity?: string
  veteran_status?: string
  disability_status?: string
  tenant_id?: string
  created_at?: string
  updated_at?: string
}

interface PayrollSummary {
  employee_id?: string
  ytd_gross?: number
  ytd_net?: number
  total_hours_ytd?: number
  latest_pay_date?: string
  total_statements?: number
}

interface EnhancedEmployeeData {
  employee: Employee
  demographics?: EmployeeDemographics
  payrollSummary?: PayrollSummary
  documentCount?: number
}

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

export default function ReportingPage() {
  const { selectedTenant } = useTenant()
  const { user } = useAuth()
  const accessibleTenantIds = useAccessibleTenantIds()
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

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load initial data on component mount
  useEffect(() => {
    if (mounted) {
      loadInitialData()
    }
  }, [accessibleTenantIds.join(','), mounted])

  const loadInitialData = async () => {
    const tenantIds = accessibleTenantIds
    
    if (!tenantIds || tenantIds.length === 0) {
      console.log('No accessible tenants, skipping load')
      setState(prev => ({ ...prev, loading: false }))
      return
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      console.log('Loading employee data for tenants:', tenantIds)
      
      // Load employees with error handling
      let employees: Employee[] = []
      try {
        console.log('Attempting to query employees table...')
        
        // First try to get all employees to see if the table exists
        const { data: allEmployeesData, error: allEmployeesError } = await supabase
          .from('employees')
          .select('*')
          .limit(50)
        
        console.log('All employees query result:', { data: allEmployeesData, error: allEmployeesError })
        
        if (allEmployeesError) {
          console.error('All employees query error:', allEmployeesError)
          employees = []
        } else {
          // If we got data, check if tenant_id field exists
          const hasTenantId = allEmployeesData && allEmployeesData.length > 0 && 'tenant_id' in allEmployeesData[0]
          console.log('Employees have tenant_id field:', hasTenantId)
          
          if (hasTenantId) {
            // Filter by tenant if tenant_id exists
            const { data: employeesData, error: employeesError } = await supabase
              .from('employees')
              .select('*')
              .in('tenant_id', tenantIds)
              .order('created_at', { ascending: false })
            
            if (employeesError) {
              console.error('Filtered employees query error:', employeesError)
              employees = allEmployeesData || []
            } else {
              employees = employeesData || []
            }
          } else {
            // Use all employees if no tenant_id field
            console.log('Using all employees (no tenant filtering)')
            employees = allEmployeesData || []
          }
        }
      } catch (err) {
        console.error('Employees query error:', err)
        employees = []
      }

      // Load departments with error handling
      let departments: Department[] = []
      try {
        const { data: departmentsData, error: departmentsError } = await supabase
          .from('departments')
          .select('*')
          .in('tenant_id', tenantIds)
          .order('name', { ascending: true })
        
        if (departmentsError) {
          console.error('Departments query error:', departmentsError)
          departments = []
        } else {
          departments = departmentsData || []
        }
      } catch (err) {
        console.error('Departments query error:', err)
        departments = []
      }
      
      console.log('✅ Loaded employees:', employees.length)
      console.log('✅ Loaded departments:', departments.length)
      
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

  const handleEmployeeSelect = (employee: Employee) => {
    setState(prev => ({ ...prev, selectedEmployee: employee }))
  }

  const refreshData = () => {
    loadInitialData()
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
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.employees.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {state.employees.filter(e => e.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(state.employees.map(e => e.department).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {state.selectedEmployee ? '1' : '0'}
              </div>
            </CardContent>
          </Card>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Employee Search & Selector */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Employee Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, ID, or email..."
                        value={state.searchTerm}
                        onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    {state.employees.length > 0 && (
                      <Select 
                        value={state.selectedEmployee?.id || ''} 
                        onValueChange={(value) => {
                          const employee = state.employees.find(emp => emp.id === value)
                          if (employee) handleEmployeeSelect(employee)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee..." />
                        </SelectTrigger>
                        <SelectContent>
                          {state.employees
                            .filter(employee => 
                              state.searchTerm === '' || 
                              employee.full_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                              employee.employee_id.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                              employee.email?.toLowerCase().includes(state.searchTerm.toLowerCase())
                            )
                            .map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{employee.full_name}</span>
                                <div className="text-xs text-gray-500 space-x-2">
                                  <span>{employee.employee_id}</span>
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

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employees ({state.employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading employees...</p>
              </div>
            ) : state.employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-500 mb-4">
                  {state.error || 'No employees found for the current tenant.'}
                </p>
                <Button onClick={refreshData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.employees
                  .filter(employee => 
                    state.searchTerm === '' || 
                    employee.full_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                    employee.employee_id.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                    employee.email?.toLowerCase().includes(state.searchTerm.toLowerCase())
                  )
                  .filter(employee =>
                    state.departmentFilter === '' ||
                    employee.department?.toLowerCase() === state.departmentFilter
                  )
                  .map((employee) => (
                    <div 
                      key={employee.id} 
                      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        state.selectedEmployee?.id === employee.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{employee.full_name}</h3>
                          <p className="text-sm text-gray-500">
                            {employee.employee_id} • {employee.department || 'No Department'}
                          </p>
                          {employee.job_title && (
                            <p className="text-sm text-gray-600">{employee.job_title}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            employee.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.status || 'Unknown'}
                          </span>
                          <Button size="sm" variant="outline">
                            View Reports
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Employee Details */}
        {state.selectedEmployee && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {state.selectedEmployee.full_name} - Employee Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Employee ID:</span> {state.selectedEmployee.employee_id}</div>
                    <div><span className="font-medium">Email:</span> {state.selectedEmployee.email || 'N/A'}</div>
                    <div><span className="font-medium">Department:</span> {state.selectedEmployee.department || 'N/A'}</div>
                    <div><span className="font-medium">Job Title:</span> {state.selectedEmployee.job_title || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Employment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {state.selectedEmployee.status || 'N/A'}</div>
                    <div><span className="font-medium">Hire Date:</span> {state.selectedEmployee.hire_date ? new Date(state.selectedEmployee.hire_date).toLocaleDateString() : 'N/A'}</div>
                    <div><span className="font-medium">Employment Type:</span> {state.selectedEmployee.employment_type || 'N/A'}</div>
                    <div><span className="font-medium">Work Location:</span> {state.selectedEmployee.work_location || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Compensation</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Annual Salary:</span> {state.selectedEmployee.annual_salary ? formatCurrency(state.selectedEmployee.annual_salary) : 'N/A'}</div>
                    <div><span className="font-medium">Pay Type:</span> {state.selectedEmployee.pay_type || 'N/A'}</div>
                    <div><span className="font-medium">Pay Frequency:</span> {state.selectedEmployee.pay_frequency || 'N/A'}</div>
                    <div><span className="font-medium">Manager:</span> {state.selectedEmployee.manager_supervisor || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
