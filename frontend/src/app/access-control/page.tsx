'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  Shield, 
  Key, 
  Settings, 
  BarChart3, 
  Database, 
  Link,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function AccessControlPage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Access Control & Security</h1>
              <p className="mt-2 text-gray-600">
                SSO, RBAC, and tenant-scoped security management for {tenant?.name}
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SSO Enabled</p>
                  <p className="text-2xl font-bold text-green-600">✓</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Role Groups</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <Key className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">2FA Adoption</p>
                  <p className="text-2xl font-bold text-gray-900">89%</p>
                </div>
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Role-Based Access Control */}
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
              <CardDescription>
                Manage user roles and permissions with tenant scoping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium">Super Admin</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Full system access across all tenants</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">3 users assigned</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      System-wide
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Tenant Admin</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Full access within tenant scope</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">5 users assigned</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      Tenant-scoped
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">ETL Manager</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Manage ETL jobs, uploads, and validation</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">12 users assigned</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Tenant-scoped
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Data Analyst</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Read-only access to reports and dashboards</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">25 users assigned</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Tenant-scoped
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  Create Custom Role
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SSO Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>
                Configure SSO providers and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Microsoft Azure AD</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mb-2">Primary SSO provider for corporate users</p>
                  <div className="text-xs text-green-600">
                    Last sync: 2024-01-15 14:30 | 42 users authenticated
                  </div>
                </div>
                
                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Google Workspace</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">Secondary provider for external consultants</p>
                  <div className="text-xs text-blue-600">
                    Last sync: 2024-01-15 13:45 | 8 users authenticated
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">SAML 2.0 Provider</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      Configured
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Ready for enterprise SAML integration</p>
                  <div className="text-xs text-gray-500">
                    Status: Ready | No active connections
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  Configure SSO Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users, roles, and permissions with tenant isolation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">SJ</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Sarah Johnson</h4>
                      <p className="text-xs text-gray-500">sarah.johnson@company.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      Tenant Admin
                    </span>
                    <span className="text-xs text-gray-500">Last login: 2 hours ago</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">MC</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Mike Chen</h4>
                      <p className="text-xs text-gray-500">mike.chen@company.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      ETL Manager
                    </span>
                    <span className="text-xs text-gray-500">Last login: 15 minutes ago</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">LR</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Lisa Rodriguez</h4>
                      <p className="text-xs text-gray-500">lisa.rodriguez@company.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Data Analyst
                    </span>
                    <span className="text-xs text-gray-500">Last login: 1 day ago</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline">
                Import Users from SSO
              </Button>
              <Button variant="outline">
                Export User List
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integration & API Access */}
        <Card>
          <CardHeader>
            <CardTitle>API Integration & Access Control</CardTitle>
            <CardDescription>
              Manage API keys, integration points, and downstream system access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">API Keys & Tokens</h4>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Production API Key</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">pk_prod_1234...5678</p>
                    <p className="text-xs text-gray-500">Created: 2024-01-01 | Expires: 2025-01-01</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Staging API Key</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">pk_test_9876...4321</p>
                    <p className="text-xs text-gray-500">Created: 2024-01-10 | Expires: 2024-07-10</p>
                  </div>
                </div>
                
                <Button size="sm" variant="outline" className="w-full mt-4">
                  Generate New API Key
                </Button>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Downstream Integrations</h4>
                <div className="space-y-3">
                  <div className="border border-green-200 rounded p-3 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Link className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium">Workday HCM</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-green-700">Employee data sync enabled</p>
                  </div>
                  
                  <div className="border border-blue-200 rounded p-3 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Link className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium">Oracle Payroll</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">Payroll data export enabled</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Link className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium">SAP SuccessFactors</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        Configured
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Ready for connection</p>
                  </div>
                </div>
                
                <Button size="sm" variant="outline" className="w-full mt-4">
                  Add Integration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

