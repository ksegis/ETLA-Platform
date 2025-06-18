'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Settings, Users, Database, Shield, Bell } from 'lucide-react'

export default function SettingsPage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure platform settings and preferences for {tenant?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic platform configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Organization Name</label>
                  <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                    {tenant?.name}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Time Zone</label>
                  <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                    UTC-05:00 (Eastern Time)
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Data Retention Period</label>
                  <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                    7 years
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline">
                  Edit Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active Users</p>
                    <p className="text-xs text-gray-500">Currently logged in users</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">12</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Users</p>
                    <p className="text-xs text-gray-500">All registered users</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">45</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin Users</p>
                    <p className="text-xs text-gray-500">Users with admin privileges</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">3</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline">
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Sources
              </CardTitle>
              <CardDescription>
                Configure ETL data source connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">HRIS System</p>
                      <p className="text-xs text-gray-500">Employee master data</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Connected
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payroll API</p>
                      <p className="text-xs text-gray-500">Payroll processing data</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline">
                  Configure Sources
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Compliance
              </CardTitle>
              <CardDescription>
                Security settings and compliance configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Enhanced security for user accounts</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Enabled
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Data Encryption</p>
                    <p className="text-xs text-gray-500">AES-256 encryption at rest</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Active
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Audit Logging</p>
                    <p className="text-xs text-gray-500">Complete activity tracking</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Enabled
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline">
                  Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

