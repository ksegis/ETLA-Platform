'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  FileText, 
  User, 
  Clock, 
  Database, 
  ArrowRight, 
  Eye, 
  Download,
  Filter,
  Search,
  GitBranch,
  Shield
} from 'lucide-react'

export default function AuditTrailPage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Trail & Data Lineage</h1>
              <p className="mt-2 text-gray-600">
                Complete audit trail, data lineage tracking, and compliance monitoring for {tenant?.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Audit Summary */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Sources</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Retention Days</p>
                  <p className="text-2xl font-bold text-gray-900">2,555</p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Log</CardTitle>
              <CardDescription>
                Track user actions, uploads, approvals, and system access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Sarah Johnson</span>
                    </div>
                    <span className="text-xs text-gray-500">2 minutes ago</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Uploaded file: payroll_q4_2024.csv</p>
                  <p className="text-xs text-blue-600">Action: File Upload | Status: Processing</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Mike Chen</span>
                    </div>
                    <span className="text-xs text-gray-500">15 minutes ago</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Approved ETL job: Employee Data Sync</p>
                  <p className="text-xs text-green-600">Action: Job Approval | Status: Completed</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Lisa Rodriguez</span>
                    </div>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Reran failed job: Benefits Processing</p>
                  <p className="text-xs text-orange-600">Action: Job Retry | Status: In Progress</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Admin User</span>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Modified validation rule: SSN Format</p>
                  <p className="text-xs text-purple-600">Action: Config Change | Status: Applied</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  View Complete Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Lineage Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Data Lineage Tracking</CardTitle>
              <CardDescription>
                Track data flow from source to destination with transformations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center mb-3">
                    <GitBranch className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Payroll Data Flow</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs">
                      <Database className="h-3 w-3 text-gray-500 mr-2" />
                      <span>Source: payroll_q4_2024.csv</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 mx-2" />
                      <span>2,113 records</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <FileText className="h-3 w-3 text-orange-500 mr-2" />
                      <span>Transform: Field mapping + validation</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 mx-2" />
                      <span>2,066 valid</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <Database className="h-3 w-3 text-green-500 mr-2" />
                      <span>Target: Payroll Database</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 mx-2" />
                      <span>2,066 loaded</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                  <div className="flex items-center mb-3">
                    <GitBranch className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Employee Data Flow</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs">
                      <Database className="h-3 w-3 text-gray-500 mr-2" />
                      <span>Source: HRIS API</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 mx-2" />
                      <span>1,245 records</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <FileText className="h-3 w-3 text-orange-500 mr-2" />
                      <span>Transform: Data enrichment</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 mx-2" />
                      <span>1,245 enriched</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <Database className="h-3 w-3 text-green-500 mr-2" />
                      <span>Target: Employee Database</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 mx-2" />
                      <span>1,245 synced</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Field-Level Change History */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Field-Level Change History</CardTitle>
            <CardDescription>
              Track changes to individual fields across ETL job versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Employee ID: EMP001245</h4>
                  <span className="text-xs text-gray-500">Last updated: 2024-01-15 14:30</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Field Changes</h5>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="text-red-600">- salary: $70,000</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-600">+ salary: $75,000</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-red-600">- department: IT</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-600">+ department: Engineering</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Change Reason</h5>
                    <p className="text-xs text-gray-600">Promotion and department transfer</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Changed By</h5>
                    <p className="text-xs text-gray-600">Sarah Johnson (HR Manager)</p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Employee ID: EMP001247</h4>
                  <span className="text-xs text-gray-500">Last updated: 2024-01-14 09:15</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Field Changes</h5>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="text-red-600">- status: Active</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-600">+ status: Terminated</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-600">+ termination_date: 2024-01-14</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Change Reason</h5>
                    <p className="text-xs text-gray-600">Employee resignation</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Changed By</h5>
                    <p className="text-xs text-gray-600">Mike Chen (HR Director)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline">
                View Complete Change History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Data Retention Policies</CardTitle>
            <CardDescription>
              Configure and monitor data retention policies per client and data type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Employee Records</h4>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-gray-600">Retention Period: </span>
                    <span className="font-medium">7 years</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">Auto-Purge: </span>
                    <span className="font-medium">Enabled</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">Next Purge: </span>
                    <span className="font-medium">2031-01-15</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Payroll Data</h4>
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-gray-600">Retention Period: </span>
                    <span className="font-medium">10 years</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">Auto-Purge: </span>
                    <span className="font-medium">Enabled</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">Next Purge: </span>
                    <span className="font-medium">2034-01-15</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Audit Logs</h4>
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-gray-600">Retention Period: </span>
                    <span className="font-medium">5 years</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">Auto-Purge: </span>
                    <span className="font-medium">Disabled</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-600">Manual Review: </span>
                    <span className="font-medium">Required</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline">
                Configure Retention Policies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

