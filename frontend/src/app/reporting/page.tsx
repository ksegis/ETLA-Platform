'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Building,
  FileText,
  Clock,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  LayoutGrid,
  List,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant, useAccessibleTenantIds, useMultiTenantMode } from '@/contexts/TenantContext'
import { supabase } from '@/lib/supabase'

// Employee interface matching the database schema
interface Employee {
  id: string
  tenant_id: string
  employee_id: string
  first_name: string
  last_name: string
  email?: string
  date_of_birth?: string
  hire_date: string
  termination_date?: string
  status?: string
  department?: string
  job_title?: string
  pay_frequency?: string
  pay_type?: string
  base_pay_rate?: number
  annual_salary?: number
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  employment_status?: string
  employment_type?: string
  work_location?: string
  position?: string
  home_department?: string
  employee_code?: string
  employee_name?: string
  full_name?: string
  preferred_name?: string
  cost_center?: string
  division?: string
  location_branch?: string
  job_code?: string
  flsa_status?: string
  manager_supervisor?: string
  hr_business_partner?: string
  home_address?: string
  union_status?: string
  eeo_categories?: string
  created_at: string
  updated_at: string
}

// Department interface
interface Department {
  id: string
  tenant_id: string
  name: string
  description?: string
  manager?: string
  budget?: number
  created_at: string
  updated_at: string
}

// Statistics interface
interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  departments: number
  selectedEmployee: string | null
}

// Data type tabs
type DataType = 'pay_statements' | 'timecards' | 'tax_records' | 'benefits' | 'job_history' | 'documents'

const dataTypeConfig = {
  pay_statements: { label: 'Pay Statements', shortLabel: 'Pay', icon: DollarSign, color: 'bg-green-100 text-green-700' },
  timecards: { label: 'Timecards', shortLabel: 'Time', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  tax_records: { label: 'Tax Records', shortLabel: 'Tax', icon: FileText, color: 'bg-red-100 text-red-700' },
  benefits: { label: 'Benefits', shortLabel: 'Benefits', icon: CheckCircle, color: 'bg-purple-100 text-purple-700' },
  job_history: { label: 'Job History', shortLabel: 'History', icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
  documents: { label: 'Documents', shortLabel: 'Docs', icon: FileText, color: 'bg-gray-100 text-gray-700' }
}

export default function ReportingCockpitPage() {
  const { user, tenantUser } = useAuth()
  const { selectedTenant } = useTenant()
  const accessibleTenantIds = useAccessibleTenantIds()
  const { isMultiTenant, availableTenants } = useMultiTenantMode()

  // State management
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [activeDataType, setActiveDataType] = useState<DataType>('pay_statements')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Statistics
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    selectedEmployee: null
  })

  // Load data using proven pattern from Project Management and Work Requests
  const loadData = async () => {
    const tenantIds = accessibleTenantIds
    
    if (!tenantIds || tenantIds.length === 0) {
      console.log('No accessible tenants, skipping load')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Loading employee data for tenants:', tenantIds)
      
      // Load employees with error handling
      try {
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .in('tenant_id', tenantIds)
          .order('created_at', { ascending: false })
        
        if (employeesError) {
          console.error('Employees query error:', employeesError)
          setEmployees([])
        } else {
          console.log('✅ Loaded employees:', employeesData?.length || 0)
          setEmployees(employeesData || [])
        }
      } catch (err) {
        console.error('Employees query error:', err)
        setEmployees([])
      }

      // Load departments with error handling
      try {
        const { data: departmentsData, error: departmentsError } = await supabase
          .from('departments')
          .select('*')
          .in('tenant_id', tenantIds)
          .order('name', { ascending: true })
        
        if (departmentsError) {
          console.error('Departments query error:', departmentsError)
          setDepartments([])
        } else {
          console.log('✅ Loaded departments:', departmentsData?.length || 0)
          setDepartments(departmentsData || [])
        }
      } catch (err) {
        console.error('Departments query error:', err)
        setDepartments([])
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load employee data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount using proven dependency pattern
  useEffect(() => {
    loadData()
  }, [accessibleTenantIds.join(','), tenantUser?.role])

  // Calculate statistics
  useEffect(() => {
    const totalEmployees = employees.length
    const activeEmployees = employees.filter(emp => 
      emp.status === 'active' || emp.employment_status === 'Active'
    ).length
    const departmentCount = departments.length

    setStats({
      totalEmployees,
      activeEmployees,
      departments: departmentCount,
      selectedEmployee: selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : null
    })
  }, [employees, departments, selectedEmployee])

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.job_title || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = !departmentFilter || 
      employee.department === departmentFilter || 
      employee.home_department === departmentFilter
    
    const matchesStatus = !statusFilter || 
      employee.status === statusFilter || 
      employee.employment_status === statusFilter
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Get employee display name
  const getEmployeeName = (employee: Employee) => {
    return employee.full_name || 
           employee.employee_name || 
           `${employee.first_name} ${employee.last_name}` ||
           employee.preferred_name ||
           `Employee ${employee.employee_id}`
  }

  // Get employee status badge
  const getStatusBadge = (employee: Employee) => {
    const status = employee.status || employee.employment_status || 'unknown'
    const isActive = status.toLowerCase() === 'active'
    
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
        {status}
      </Badge>
    )
  }

  // Handle employee selection
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
  }

  // Handle refresh
  const handleRefresh = () => {
    loadData()
  }

  // Render data type specific content
  const renderDataTypeContent = () => {
    if (!selectedEmployee) return null

    switch (activeDataType) {
      case 'pay_statements':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h5 className="font-medium">Recent Pay Statements</h5>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {/* Sample pay statement data */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Pay Period: Dec 1-15, 2024</p>
                      <p className="text-sm text-gray-600">Pay Date: Dec 20, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${selectedEmployee.annual_salary ? (selectedEmployee.annual_salary / 26).toFixed(2) : '0.00'}</p>
                      <p className="text-sm text-gray-600">Gross Pay</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Pay Period: Nov 16-30, 2024</p>
                      <p className="text-sm text-gray-600">Pay Date: Dec 5, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${selectedEmployee.annual_salary ? (selectedEmployee.annual_salary / 26).toFixed(2) : '0.00'}</p>
                      <p className="text-sm text-gray-600">Gross Pay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'timecards':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h5 className="font-medium">Recent Timecards</h5>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Week of Dec 16-22, 2024</p>
                      <p className="text-sm text-gray-600">Status: Approved</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">40.0 hours</p>
                      <p className="text-sm text-gray-600">Regular Time</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Week of Dec 9-15, 2024</p>
                      <p className="text-sm text-gray-600">Status: Approved</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">42.5 hours</p>
                      <p className="text-sm text-gray-600">2.5 OT</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'tax_records':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h5 className="font-medium">Tax Documents</h5>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">W-2 Form - 2023</p>
                      <p className="text-sm text-gray-600">Tax Year: 2023</p>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">1099 Form - 2023</p>
                      <p className="text-sm text-gray-600">Tax Year: 2023</p>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'benefits':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h5 className="font-medium">Benefits Enrollment</h5>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Health Insurance</p>
                      <p className="text-sm text-gray-600">Plan: Premium PPO</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Dental Insurance</p>
                      <p className="text-sm text-gray-600">Plan: Standard</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">401(k) Plan</p>
                      <p className="text-sm text-gray-600">Contribution: 6%</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'job_history':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h5 className="font-medium">Employment History</h5>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedEmployee.job_title || 'Current Position'}</p>
                        <p className="text-sm text-gray-600">{selectedEmployee.department || 'Department'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedEmployee.hire_date).toLocaleDateString()} - Present
                        </p>
                      </div>
                      <Badge variant="default" className="bg-blue-100 text-blue-700">Current</Badge>
                    </div>
                  </div>
                  {selectedEmployee.annual_salary && (
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Salary Information</p>
                          <p className="text-sm text-gray-600">Annual Salary: ${selectedEmployee.annual_salary.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Pay Type: {selectedEmployee.pay_type || 'Salary'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'documents':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h5 className="font-medium">Employee Documents</h5>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Employment Contract</p>
                      <p className="text-sm text-gray-600">Uploaded: {new Date(selectedEmployee.hire_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">I-9 Form</p>
                      <p className="text-sm text-gray-600">Status: Verified</p>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Performance Reviews</p>
                      <p className="text-sm text-gray-600">Last Review: Annual 2023</p>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        const config = dataTypeConfig[activeDataType as keyof typeof dataTypeConfig]
        return (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            {React.createElement(config.icon, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" })}
            <p className="text-gray-600">
              {config.label} data will be displayed here.
            </p>
          </div>
        )
    }
  }

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Active',
      value: stats.activeEmployees,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-700'
    },
    {
      title: 'Departments',
      value: stats.departments,
      icon: Building,
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Selected',
      value: stats.selectedEmployee || 'None',
      icon: User,
      color: 'bg-orange-50 text-orange-700'
    }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading employees...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Operations Reporting Cockpit</h1>
                <p className="text-gray-600">Unified employee reporting and document management</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statisticsCards.map((card, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Function Bar - Data Type Tabs */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dataTypeConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={activeDataType === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveDataType(key as DataType)}
                      className={`flex items-center space-x-2 ${activeDataType === key ? config.color : ''}`}
                    >
                      <config.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="sm:hidden">{config.shortLabel}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Generate Report</span>
                    <span className="sm:hidden">Report</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">View Facsimile</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export Selected</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search & Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Search & Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </CardHeader>
              {showFilters && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Employees</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Name, ID, email, or title..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="Active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Employee List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-600">
                      {employees.length === 0 
                        ? "No employees found for the current tenant." 
                        : "No employees match your current filters."}
                    </p>
                    {employees.length === 0 && (
                      <Button onClick={handleRefresh} className="mt-4" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedEmployee?.id === employee.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{getEmployeeName(employee)}</h4>
                            <p className="text-sm text-gray-600">{employee.employee_id}</p>
                            {employee.job_title && (
                              <p className="text-sm text-gray-600">{employee.job_title}</p>
                            )}
                            {employee.department && (
                              <p className="text-sm text-gray-500">{employee.department}</p>
                            )}
                            {employee.email && (
                              <p className="text-sm text-gray-500">{employee.email}</p>
                            )}
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(employee)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Employee Details */}
            {selectedEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle>Employee Details</CardTitle>
                  <CardDescription>
                    Detailed information for {getEmployeeName(selectedEmployee)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{getEmployeeName(selectedEmployee)}</span>
                        </div>
                        {selectedEmployee.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedEmployee.email}</span>
                          </div>
                        )}
                        {selectedEmployee.date_of_birth && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Born: {new Date(selectedEmployee.date_of_birth).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Employment Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Employment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedEmployee.job_title || 'No title'}</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{selectedEmployee.department || 'No department'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Hired: {new Date(selectedEmployee.hire_date).toLocaleDateString()}</span>
                        </div>
                        {selectedEmployee.annual_salary && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">Salary: ${selectedEmployee.annual_salary.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Contact</h4>
                      <div className="space-y-2">
                        {selectedEmployee.home_address && (
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                            <span className="text-sm">{selectedEmployee.home_address}</span>
                          </div>
                        )}
                        {(selectedEmployee.city || selectedEmployee.state) && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {[selectedEmployee.city, selectedEmployee.state, selectedEmployee.zip_code].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data Type Content */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-4">
                      {dataTypeConfig[activeDataType].label} for {getEmployeeName(selectedEmployee)}
                    </h4>
                    {renderDataTypeContent()}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
