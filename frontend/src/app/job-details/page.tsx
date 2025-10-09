'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Eye, 
  Download, 
  ArrowRight, 
  Database, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react'

export default function JobDetailsPage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Details: Payroll Processing Q4</h1>
              <p className="mt-2 text-gray-600">
                Before/after transformation view and record-level analysis
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                View All Records
              </Button>
            </div>
          </div>
        </div>

        {/* Job Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Transformation Summary</CardTitle>
            <CardDescription>
              Overview of data processing and transformation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2,113</div>
                <div className="text-sm text-gray-500">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2,066</div>
                <div className="text-sm text-gray-500">Successfully Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">47</div>
                <div className="text-sm text-gray-500">Failed Validation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <div className="text-sm text-gray-500">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Before/After Comparison */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Before/After Record Transformation</CardTitle>
            <CardDescription>
              Sample records showing raw input vs. transformed output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Record 1 - Successful */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Record 1,245 - Successfully Transformed</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Input</h4>
                    <div className="bg-white border rounded p-3 text-xs font-mono">
                      <div>emp_id: &quot;EMP001245&quot;</div>
                      <div>emp_ssn: &quot;123456789&quot;</div>
                      <div>hire_dt: &quot;01/15/2024&quot;</div>
                      <div>salary: &quot;75000&quot;</div>
                      <div>pay_grp: &quot;STD&quot;</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Transformed Output</h4>
                    <div className="bg-white border rounded p-3 text-xs font-mono">
                      <div>employee_id: &quot;EMP001245&quot;</div>
                      <div>social_security_number: &quot;123-45-6789&quot;</div>
                      <div>hire_date: &quot;2024-01-15&quot;</div>
                      <div>annual_salary: &quot;$75,000.00&quot;</div>
                      <div>pay_group: &quot;STANDARD&quot;</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Record 2 - Failed */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">Record 1,247 - Validation Failed</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Input</h4>
                    <div className="bg-white border rounded p-3 text-xs font-mono">
                      <div>emp_id: &quot;EMP001247&quot;</div>
                      <div className="text-red-600">emp_ssn: &quot;123-45-67890&quot;</div>
                      <div>hire_dt: &quot;01/15/2024&quot;</div>
                      <div>salary: &quot;85000&quot;</div>
                      <div className="text-red-600">pay_grp: &quot;&quot;</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-red-400" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Validation Errors</h4>
                    <div className="bg-white border rounded p-3 text-xs">
                      <div className="text-red-600 mb-1">❌ SSN format invalid (too many digits)</div>
                      <div className="text-red-600 mb-1">❌ Pay group is required</div>
                      <div className="text-gray-600">✅ Employee ID valid</div>
                      <div className="text-gray-600">✅ Hire date valid</div>
                      <div className="text-gray-600">✅ Salary valid</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Record 3 - Warning */}
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-800">Record 1,250 - Transformed with Warnings</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Input</h4>
                    <div className="bg-white border rounded p-3 text-xs font-mono">
                      <div>emp_id: &quot;EMP001250&quot;</div>
                      <div>emp_ssn: &quot;987654321&quot;</div>
                      <div className="text-orange-600">hire_dt: &quot;01/15/2024&quot;</div>
                      <div>salary: &quot;125000&quot;</div>
                      <div>pay_grp: &quot;EXEC&quot;</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-orange-400" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Transformed with Warnings</h4>
                    <div className="bg-white border rounded p-3 text-xs">
                      <div className="text-gray-600">employee_id: &quot;EMP001250&quot;</div>
                      <div className="text-gray-600">social_security_number: &quot;987-65-4321&quot;</div>
                      <div className="text-orange-600">⚠️ hire_dt: &quot;12/31/2023&quot;1" (weekend)</div>
                      <div className="text-orange-600">⚠️ annual_salary: &quot;$125,000.00&quot; (above avg)</div>
                      <div className="text-gray-600">pay_group: &quot;EXECUTIVE&quot;</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Lineage */}
        <Card>
          <CardHeader>
            <CardTitle>Data Lineage & Processing Flow</CardTitle>
            <CardDescription>
              Track data from source to destination with transformation steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div className="ml-2">
                    <div className="text-sm font-medium">Source File</div>
                    <div className="text-xs text-gray-500">payroll_q4_2024.csv</div>
                    <div className="text-xs text-gray-500">2,113 records</div>
                  </div>
                </div>
                
                <ArrowRight className="h-6 w-6 text-gray-400" />
                
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                  <div className="ml-2">
                    <div className="text-sm font-medium">Validation</div>
                    <div className="text-xs text-gray-500">Field validation rules</div>
                    <div className="text-xs text-gray-500">47 failures, 12 warnings</div>
                  </div>
                </div>
                
                <ArrowRight className="h-6 w-6 text-gray-400" />
                
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-2">
                    <div className="text-sm font-medium">Transformation</div>
                    <div className="text-xs text-gray-500">Field mapping & formatting</div>
                    <div className="text-xs text-gray-500">2,066 transformed</div>
                  </div>
                </div>
                
                <ArrowRight className="h-6 w-6 text-gray-400" />
                
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-green-600" />
                  <div className="ml-2">
                    <div className="text-sm font-medium">Target System</div>
                    <div className="text-xs text-gray-500">Payroll Database</div>
                    <div className="text-xs text-gray-500">2,066 loaded</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">Processing Details</div>
              <div className="text-xs text-blue-700">
                <div>• Started: &quot;2024-01-15 14:45:10&quot;</div>
                <div>• Validation completed: &quot;2024-01-15 14:47:22&quot; (2m 12s) </div>
                <div>• Transformation completed: &quot;2024-01-15 14:58:45&quot; (11m 23s) </div>
                <div>• Load failed: &quot;2024-01-15 15:02:33&quot; (3m 48s) - 47 records rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

