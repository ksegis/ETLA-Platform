'use client'

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  RefreshCw,
  BarChart3,
  Database,
  Briefcase,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

export default function ReportingPage() {
  const { selectedTenant } = useTenant()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [enhancedEmployeeData, setEnhancedEmployeeData] = useState<any>(null)
  const [activeDataTab, setActiveDataTab] = useState('pay-statements')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [departmentFilter, setDepartmentFilter] = useState('')

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  const loadEmployees = async () => {
    if (!mounted) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Only import the service when actually needed
      const { ReportingCockpitService } = await import('@/services/reportingCockpitService')
      const reportingService = new ReportingCockpitService()
      
      const employeesData = await reportingService.getEmployees(selectedTenant?.id)
      setEmployees(employeesData)
    } catch (err) {
      console.error('Error loading employees:', err)
      setError('Failed to load employee data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadEnhancedEmployeeData = async (employeeId: string) => {
    if (!mounted) return
    
    try {
      // Only import services when actually needed
      const { ReportingCockpitService } = await import('@/services/reportingCockpitService')
      const reportingService = new ReportingCockpitService()
      
      const enhancedData = await reportingService.getEnhancedEmployeeData(employeeId, selectedTenant?.id)
      setEnhancedEmployeeData(enhancedData)
    } catch (err) {
      console.error('Error loading enhanced employee data:', err)
      setError('Failed to load employee details. Please try again.')
    }
  }

  const handleEmployeeSelect = (employee: any) => {
    setSelectedEmployee(employee)
    if (employee) {
      loadEnhancedEmployeeData(employee.id)
    } else {
      setEnhancedEmployeeData(null)
    }
  }

  const clearFilters = () => {
    setSelectedEmployee(null)
    setEnhancedEmployeeData(null)
    setSearchTerm('')
    setDateRange({ start: '', end: '' })
    setDepartmentFilter('')
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
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button 
                size="sm" 
                disabled={!selectedEmployee}
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
                  <Button variant="outline" size="sm" disabled={!selectedEmployee}>
                    <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Generate Report</span>
                    <span className="sm:hidden">Report</span>
                  </Button>
                  <Button variant="outline" size="sm" disabled={!selectedEmployee}>
                    <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">View Facsimile</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  <Button variant="outline" size="sm" disabled={!selectedEmployee}>
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
                    {selectedEmployee && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedEmployee.full_name}
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
                  {/* Employee Search */}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Employee Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, ID, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={loadEmployees}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4 mr-2" />
                        )}
                        Load Employees
                      </Button>
                    </div>

                    {/* Employee Dropdown */}
                    {employees.length > 0 && (
                      <Select 
                        value={selectedEmployee?.id || ''} 
                        onValueChange={(value) => {
                          const employee = employees.find(emp => emp.id === value)
                          handleEmployeeSelect(employee || null)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select from ${employees.length} employees...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
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
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="text-sm"
                        placeholder="Start date"
                      />
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="text-sm"
                        placeholder="End date"
                      />
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <Select 
                      value={departmentFilter} 
                      onValueChange={setDepartmentFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
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
                        onClick={() => {
                          clearFilters()
                          loadEmployees()
                        }}
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

        {/* Error Display */}
        {error && (
          <Card className="mb-4 sm:mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-red-700">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Employee Demographics & Summary */}
        {selectedEmployee && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Employee Basic Info */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {selectedEmployee.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {selectedEmployee.job_title} • {selectedEmployee.employee_id}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{selectedEmployee.department || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Hire Date:</span>
                    <span className="font-medium">
                      {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium">
                      {selectedEmployee.annual_salary ? formatCurrency(selectedEmployee.annual_salary) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={selectedEmployee.status === 'active' ? 'default' : 'secondary'}>
                      {selectedEmployee.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Data Placeholder */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center text-gray-500">
                  <p>Enhanced employee data will appear here</p>
                  <p className="text-sm">when fully loaded</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Placeholder */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center text-gray-500">
                  <p>Payroll and document</p>
                  <p className="text-sm">summary will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Grids Placeholder */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeDataTab} onValueChange={setActiveDataTab} className="w-full">
              <TabsContent value="pay-statements" className="mt-0">
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Pay Statements</h3>
                  <p className="text-gray-500">
                    {selectedEmployee 
                      ? 'Pay statement data will be loaded here' 
                      : 'Select an employee to view pay statements'
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="timecards" className="mt-0">
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Timecards</h3>
                  <p className="text-gray-500">
                    {selectedEmployee 
                      ? 'Timecard data will be loaded here' 
                      : 'Select an employee to view timecards'
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="tax-records" className="mt-0">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Records</h3>
                  <p className="text-gray-500">
                    {selectedEmployee 
                      ? 'Tax record data will be loaded here' 
                      : 'Select an employee to view tax records'
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="benefits" className="mt-0">
                <div className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Benefits</h3>
                  <p className="text-gray-500">
                    {selectedEmployee 
                      ? 'Benefits data will be loaded here' 
                      : 'Select an employee to view benefits'
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="job-history" className="mt-0">
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Job History</h3>
                  <p className="text-gray-500">
                    {selectedEmployee 
                      ? 'Job history data will be loaded here' 
                      : 'Select an employee to view job history'
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Documents</h3>
                  <p className="text-gray-500">
                    {selectedEmployee 
                      ? 'Document data will be loaded here' 
                      : 'Select an employee to view documents'
                    }
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
