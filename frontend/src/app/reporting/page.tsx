'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Briefcase
} from 'lucide-react'

// Types for the cockpit data
interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string
  department: string
  position: string
  hire_date: string
  status: 'active' | 'inactive' | 'terminated'
  avatar_url?: string
  manager_name?: string
  location?: string
}

interface EmployeeDemographics {
  age?: number
  gender?: string
  ethnicity?: string
  veteran_status?: boolean
  disability_status?: boolean
}

interface ReportingCockpitState {
  selectedEmployee: Employee | null
  dateRange: {
    start: string
    end: string
  }
  departmentFilter: string
  loading: boolean
  employees: Employee[]
}

export default function ReportingCockpit() {
  const [state, setState] = useState<ReportingCockpitState>({
    selectedEmployee: null,
    dateRange: {
      start: '',
      end: ''
    },
    departmentFilter: '',
    loading: true,
    employees: []
  })

  const [activeDataTab, setActiveDataTab] = useState('pay-statements')

  // Load employees on component mount
  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // TODO: Replace with real Supabase query
      // const { data: employees, error } = await supabase
      //   .from('employees')
      //   .select('*')
      //   .eq('status', 'active')
      //   .order('full_name')
      
      // Mock data for now - will be replaced with real database connection
      const mockEmployees: Employee[] = [
        {
          id: '1',
          employee_id: 'EMP001',
          full_name: 'John Smith',
          email: 'john.smith@company.com',
          department: 'Engineering',
          position: 'Senior Developer',
          hire_date: '2022-01-15',
          status: 'active',
          manager_name: 'Sarah Johnson',
          location: 'New York'
        },
        {
          id: '2',
          employee_id: 'EMP002',
          full_name: 'Jane Doe',
          email: 'jane.doe@company.com',
          department: 'Marketing',
          position: 'Marketing Manager',
          hire_date: '2021-06-10',
          status: 'active',
          manager_name: 'Mike Wilson',
          location: 'California'
        }
      ]
      
      setState(prev => ({ 
        ...prev, 
        employees: mockEmployees,
        loading: false 
      }))
    } catch (error) {
      console.error('Error loading employees:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleEmployeeSelect = (employee: Employee) => {
    setState(prev => ({ ...prev, selectedEmployee: employee }))
  }

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      selectedEmployee: null,
      dateRange: { start: '', end: '' },
      departmentFilter: ''
    }))
  }

  const exportAllData = () => {
    // TODO: Implement export functionality
    console.log('Exporting all data for employee:', state.selectedEmployee?.full_name)
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employee Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Employee</label>
                <Select 
                  value={state.selectedEmployee?.id || ''} 
                  onValueChange={(value) => {
                    const employee = state.employees.find(emp => emp.id === value)
                    if (employee) handleEmployeeSelect(employee)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {state.employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{employee.full_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {employee.employee_id}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  />
                  <Input
                    type="date"
                    value={state.dateRange.end}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="text-sm"
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
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quick Actions</label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
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
              {state.selectedEmployee ? (
                <div className="space-y-4">
                  {/* Employee Basic Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{state.selectedEmployee.full_name}</h3>
                      <p className="text-gray-600">{state.selectedEmployee.position}</p>
                      <p className="text-sm text-gray-500">{state.selectedEmployee.employee_id}</p>
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Department:</span>
                      <p>{state.selectedEmployee.department}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Hire Date:</span>
                      <p>{new Date(state.selectedEmployee.hire_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Manager:</span>
                      <p>{state.selectedEmployee.manager_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p>{state.selectedEmployee.location || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">$0</div>
                      <div className="text-xs text-gray-500">YTD Earnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">0</div>
                      <div className="text-xs text-gray-500">Hours Worked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">0</div>
                      <div className="text-xs text-gray-500">Documents</div>
                    </div>
                  </div>
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
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Interactive Data Grid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeDataTab} onValueChange={setActiveDataTab}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 text-xs">
                  <TabsTrigger value="pay-statements">Pay</TabsTrigger>
                  <TabsTrigger value="timecards">Time</TabsTrigger>
                  <TabsTrigger value="tax-records">Tax</TabsTrigger>
                  <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  <TabsTrigger value="documents">Docs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pay-statements" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Pay statements will appear here</p>
                    <p className="text-xs text-gray-400">Select an employee to view data</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="timecards" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Timecard data will appear here</p>
                    <p className="text-xs text-gray-400">Select an employee to view data</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="tax-records" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Tax records will appear here</p>
                    <p className="text-xs text-gray-400">Select an employee to view data</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="benefits" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Benefits data will appear here</p>
                    <p className="text-xs text-gray-400">Select an employee to view data</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Employee documents will appear here</p>
                    <p className="text-xs text-gray-400">Select an employee to view data</p>
                  </div>
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
                          `${state.selectedEmployee.full_name} - 0 documents found` : 
                          'Select employee to view documents'
                        }
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                      <Eye className="h-4 w-4 mr-1" />
                      Browse
                    </Button>
                  </div>
                </div>

                {/* Document Preview Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">Document preview area</p>
                  <p className="text-sm text-gray-400">
                    Select a document to preview it here
                  </p>
                </div>

                {/* Document Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" disabled={!state.selectedEmployee}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>

                {/* Facsimile Options */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Facsimile Generation</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled={!state.selectedEmployee}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Pay Stub
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled={!state.selectedEmployee}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Tax Form
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
      </div>
    </DashboardLayout>
  )
}
