'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Save
} from 'lucide-react'

export default function ValidationRulesPage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Validation Rules Configuration</h1>
              <p className="mt-2 text-gray-600">
                Configure field-level validation rules and business logic for {tenant?.name}
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Rule
            </Button>
          </div>
        </div>

        {/* Rule Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Field Format Rules</CardTitle>
              <CardDescription>
                Data format and pattern validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SSN Format</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Pattern: XXX-XX-XXXX</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Email Format</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Pattern: Valid email address</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Phone Number</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Pattern: (XXX) XXX-XXXX</p>
                  <div className="mt-2 flex items-center">
                    <AlertTriangle className="h-3 w-3 text-orange-600 mr-1" />
                    <span className="text-xs text-orange-600">Warning Only</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Logic Rules</CardTitle>
              <CardDescription>
                Custom business validation logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Date Logic</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Hire date ≤ Today</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Salary Range</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">$15,000 - $500,000</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Age Validation</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Age 16-75 years</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Fields</CardTitle>
              <CardDescription>
                Mandatory field validation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Employee ID</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Required, Unique</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Full Name</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Required, Min 2 words</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Department</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Required, Valid dept code</p>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rule Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Validation Rule</CardTitle>
            <CardDescription>
              Build custom validation rules with conditions and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rule Name</label>
                  <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                    Custom Validation Rule
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Target Field</label>
                  <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                    Select field...
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Validation Type</label>
                  <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                    Format Pattern
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rule Condition</label>
                  <div className="border border-gray-300 rounded-md p-2 bg-gray-50 h-20">
                    Enter validation logic...
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Error Message</label>
                  <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                    Custom error message for validation failure
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Severity Level</label>
                  <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                    Error (Block processing)
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Auto-Fix Action</label>
                  <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                    None
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Validation Rule
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

