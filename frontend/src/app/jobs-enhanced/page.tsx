'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Undo2, 
  Eye, 
  Download,
  Play,
  Pause,
  Settings
} from 'lucide-react'

export default function EnhancedJobsPage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Job Management</h1>
          <p className="mt-2 text-gray-600">
            Enterprise-grade ETL job monitoring with retry, rollback, and error tracking for {tenant?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">98.5%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Auto-Retries</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                </div>
                <RotateCcw className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Intelligence & Controls</CardTitle>
            <CardDescription>
              Advanced job management with retry, rollback, and error tracking capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Job with Retry Controls */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Payroll Processing - Q4 2024</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Failed (Retry 2/3)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Started: 2024-01-15 14:45:10 | Failed: 2024-01-15 15:02:33</p>
                    <p className="text-xs text-red-600 mb-3">Error: 47 records failed validation - Invalid SSN format in rows 1,247-1,294</p>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Retry Job
                      </Button>
                      <Button size="sm" variant="outline">
                        <Undo2 className="h-4 w-4 mr-1" />
                        Rollback
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Errors
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        Field Mapping
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job with Before/After View */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Employee Data Sync - Weekly</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        Processing (85%)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Started: 2024-01-15 16:30:15 | ETA: 2024-01-15 16:45:00</p>
                    <p className="text-xs text-blue-600 mb-3">Processing 2,113 records | 1,796 transformed | 317 pending</p>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause Job
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Before/After
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Progress Log
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Successful Job with Lineage */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Benefits Enrollment Update</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Completed
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Completed: 2024-01-15 15:47:22 | Duration: 3m 45s</p>
                    <p className="text-xs text-green-600 mb-3">Successfully processed 1,245 benefit records | 0 errors | 12 warnings</p>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Export Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Rerun Job
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Record-Level Error Analysis</CardTitle>
              <CardDescription>
                Detailed error tracking with field-level validation failures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-red-600">Row 1,247: Invalid SSN</span>
                    <span className="text-xs text-gray-500">Employee ID: EMP001247</span>
                  </div>
                  <p className="text-xs text-gray-600">SSN "123-45-67890" failed validation - Invalid format</p>
                  <p className="text-xs text-blue-600 mt-1">Suggested: Apply SSN format transformation</p>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-orange-600">Row 1,248: Missing Pay Group</span>
                    <span className="text-xs text-gray-500">Employee ID: EMP001248</span>
                  </div>
                  <p className="text-xs text-gray-600">Required field "pay_group" is empty</p>
                  <p className="text-xs text-blue-600 mt-1">Suggested: Use default pay group "STANDARD"</p>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-red-600">Row 1,249: Date Logic Error</span>
                    <span className="text-xs text-gray-500">Employee ID: EMP001249</span>
                  </div>
                  <p className="text-xs text-gray-600">Hire date (2025-01-01) is in the future</p>
                  <p className="text-xs text-blue-600 mt-1">Suggested: Review date format or data source</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  View All 47 Errors
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Visualizer</CardTitle>
              <CardDescription>
                Dynamic field mapping with transformation preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Source: emp_ssn</span>
                    <span className="text-sm text-gray-500">→</span>
                    <span className="text-sm font-medium">Target: social_security_number</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">Transform: Format SSN</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">Example: </span>
                    <span className="bg-red-50 px-1">123456789</span>
                    <span className="mx-1">→</span>
                    <span className="bg-green-50 px-1">123-45-6789</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Source: hire_dt</span>
                    <span className="text-sm text-gray-500">→</span>
                    <span className="text-sm font-medium">Target: hire_date</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">Transform: Date Format</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">Example: </span>
                    <span className="bg-red-50 px-1">01/15/2024</span>
                    <span className="mx-1">→</span>
                    <span className="bg-green-50 px-1">2024-01-15</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Source: salary</span>
                    <span className="text-sm text-gray-500">→</span>
                    <span className="text-sm font-medium">Target: annual_salary</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">Transform: Currency Format</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">Example: </span>
                    <span className="bg-red-50 px-1">75000</span>
                    <span className="mx-1">→</span>
                    <span className="bg-green-50 px-1">$75,000.00</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" className="w-full">
                  Edit Field Mappings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

