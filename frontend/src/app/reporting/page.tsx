'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'

interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string
  department: string
  status: string
}

export default function ReportingPage() {
  const { user } = useAuth()
  const { selectedTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const loadEmployees = async () => {
    console.log('🔍 Loading employees...')
    console.log('User:', user)
    console.log('Selected Tenant:', selectedTenant)
    
    setLoading(true)
    try {
      // First, try loading ALL employees to test basic database connection
      console.log('🔍 Testing basic database connection...')
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, full_name, email, department, status, tenant_id')
        .limit(10)
      
      console.log('📊 Supabase response:', { data, error })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        alert(`Database error: ${error.message}`)
        throw error
      }
      
      console.log(`✅ Successfully loaded ${data?.length || 0} employees`)
      console.log('📋 Employee data:', data)
      
      // If we have a tenant, filter the results
      let filteredData = data || []
      if (selectedTenant?.id) {
        filteredData = (data || []).filter(emp => emp.tenant_id === selectedTenant.id)
        console.log(`🎯 Filtered to ${filteredData.length} employees for tenant ${selectedTenant.id}`)
      } else {
        console.log('⚠️ No tenant selected, showing all employees')
      }
      
      setEmployees(filteredData)
      alert(`Loaded ${filteredData.length} employees successfully!`)
    } catch (err: any) {
      console.error('❌ Error loading employees:', err)
      alert(`Failed to load employees: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Operations Reporting Cockpit
              </h1>
              <p className="text-gray-600 mt-1">
                Unified employee reporting and document management
              </p>
            </div>
            <Button onClick={loadEmployees} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Load Employees'}
            </Button>
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
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(e => e.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(employees.map(e => e.department).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Ready</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employees ({employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-500 mb-4">
                  Click "Load Employees" to fetch employee data from the database.
                </p>
                <Button onClick={loadEmployees} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Load Employees'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {employees
                  .filter(employee => 
                    searchTerm === '' || 
                    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((employee) => (
                    <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{employee.full_name}</h3>
                          <p className="text-sm text-gray-500">
                            {employee.employee_id} • {employee.department || 'No Department'}
                          </p>
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
      </div>
    </DashboardLayout>
  )
}
