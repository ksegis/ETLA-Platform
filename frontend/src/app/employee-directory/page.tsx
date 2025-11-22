'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Search, Mail, Phone, MapPin, Building, User, Filter, Download } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  department: string
  location: string
  manager: string
  hireDate: Date
  status: 'active' | 'inactive' | 'on-leave'
  avatar?: string
}

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '(555) 123-4567',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      manager: 'Jane Smith',
      hireDate: new Date('2020-01-15'),
      status: 'active',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phone: '(555) 234-5678',
      jobTitle: 'Engineering Manager',
      department: 'Engineering',
      location: 'San Francisco, CA',
      manager: 'Bob Johnson',
      hireDate: new Date('2018-03-20'),
      status: 'active',
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@company.com',
      phone: '(555) 345-6789',
      jobTitle: 'VP of Engineering',
      department: 'Engineering',
      location: 'San Francisco, CA',
      manager: 'CEO',
      hireDate: new Date('2015-06-10'),
      status: 'active',
    },
    {
      id: '4',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@company.com',
      phone: '(555) 456-7890',
      jobTitle: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      manager: 'Carol Davis',
      hireDate: new Date('2019-09-01'),
      status: 'active',
    },
    {
      id: '5',
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol.davis@company.com',
      phone: '(555) 567-8901',
      jobTitle: 'Director of Product',
      department: 'Product',
      location: 'New York, NY',
      manager: 'CEO',
      hireDate: new Date('2017-11-15'),
      status: 'active',
    },
    {
      id: '6',
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@company.com',
      phone: '(555) 678-9012',
      jobTitle: 'HR Manager',
      department: 'Human Resources',
      location: 'Austin, TX',
      manager: 'CEO',
      hireDate: new Date('2019-02-20'),
      status: 'active',
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Get unique values for filters
  const departments = ['all', ...Array.from(new Set(employees.map(e => e.department)))]
  const locations = ['all', ...Array.from(new Set(employees.map(e => e.location)))]

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment
    const matchesLocation = filterLocation === 'all' || employee.location === filterLocation
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus

    return matchesSearch && matchesDepartment && matchesLocation && matchesStatus
  })

  const getStatusBadge = (status: Employee['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      'on-leave': 'bg-yellow-100 text-yellow-800',
    }
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      'on-leave': 'On Leave',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Department', 'Location', 'Manager', 'Hire Date', 'Status']
    const rows = employees.map(e => [
      e.firstName,
      e.lastName,
      e.email,
      e.phone,
      e.jobTitle,
      e.department,
      e.location,
      e.manager,
      e.hireDate.toLocaleDateString(),
      e.status,
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `employee-directory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-600 mt-2">Browse and search employee information</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-gray-500 mt-1">In directory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length - 1}</div>
            <p className="text-xs text-gray-500 mt-1">Unique departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length - 1}</div>
            <p className="text-xs text-gray-500 mt-1">Office locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc === 'all' ? 'All Locations' : loc}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>
            Showing {filteredEmployees.length} of {employees.length} employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(employee => (
              <div
                key={employee.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Avatar and Name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    {getInitials(employee.firstName, employee.lastName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.jobTitle}</p>
                    {getStatusBadge(employee.status)}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${employee.email}`} className="hover:text-blue-600">
                      {employee.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{employee.location}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <p>Manager: {employee.manager}</p>
                  <p>Hire Date: {employee.hireDate.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No employees found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
