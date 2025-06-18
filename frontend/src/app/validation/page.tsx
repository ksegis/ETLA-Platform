'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Download,
  Settings,
  Eye,
  BarChart3,
  FileText
} from 'lucide-react'

export default function ValidationEnginePage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Validation & Data Quality Engine</h1>
          <p className="mt-2 text-gray-600">
            Enterprise-grade data validation, quality scoring, and anomaly detection for {tenant?.name}
          </p>
        </div>

        {/* Data Health Scorecard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Health Scorecard - Latest Upload</CardTitle>
            <CardDescription>
              Real-time data quality metrics and validation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">97.8%</div>
                <div className="text-sm text-gray-500 mb-1">Overall Quality Score</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '97.8%'}}></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2,066</div>
                <div className="text-sm text-gray-500 mb-1">Valid Records (97.8%)</div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">Passed validation</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">35</div>
                <div className="text-sm text-gray-500 mb-1">Missing Data (1.7%)</div>
                <div className="flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-xs text-orange-600">Requires attention</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">12</div>
                <div className="text-sm text-gray-500 mb-1">Flagged Records (0.5%)</div>
                <div className="flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-xs text-red-600">Critical issues</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center space-x-3">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export QA Report
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Rules
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Validation Rules Engine */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Rules Engine</CardTitle>
              <CardDescription>
                Field-level validation rules and business logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SSN Format Validation</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Pattern: XXX-XX-XXXX | Required: Yes</p>
                  <div className="text-xs">
                    <span className="text-green-600">✅ 2,089 passed</span>
                    <span className="text-red-600 ml-3">❌ 24 failed</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Date Logic Validation</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Hire date ≤ Today | Termination ≥ Hire</p>
                  <div className="text-xs">
                    <span className="text-green-600">✅ 2,105 passed</span>
                    <span className="text-red-600 ml-3">❌ 8 failed</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Salary Range Validation</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Range: $15,000 - $500,000 | Required: Yes</p>
                  <div className="text-xs">
                    <span className="text-green-600">✅ 2,098 passed</span>
                    <span className="text-orange-600 ml-3">⚠️ 15 warnings</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Required Fields Check</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Employee ID, Name, Department required</p>
                  <div className="text-xs">
                    <span className="text-green-600">✅ 2,078 passed</span>
                    <span className="text-red-600 ml-3">❌ 35 failed</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  Manage Validation Rules
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle>Automated Anomaly Detection</CardTitle>
              <CardDescription>
                AI-powered detection of data anomalies and outliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-800">Salary Spike Detected</span>
                  </div>
                  <p className="text-xs text-orange-700 mb-2">15 employees with 25%+ salary increase</p>
                  <div className="text-xs text-orange-600">
                    Avg increase: 32% | Requires review
                  </div>
                </div>
                
                <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">Employment Gap Alert</span>
                  </div>
                  <p className="text-xs text-red-700 mb-2">8 employees with >30 day gaps in history</p>
                  <div className="text-xs text-red-600">
                    Max gap: 45 days | Data integrity issue
                  </div>
                </div>
                
                <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">Unusual Department Size</span>
                  </div>
                  <p className="text-xs text-yellow-700 mb-2">IT department grew by 40% this quarter</p>
                  <div className="text-xs text-yellow-600">
                    From 25 to 35 employees | Verify accuracy
                  </div>
                </div>
                
                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Benefit Enrollment Pattern</span>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">95% enrollment rate matches historical trend</p>
                  <div className="text-xs text-blue-600">
                    No anomalies detected | Normal pattern
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  Configure Anomaly Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QA Validation Reports */}
        <Card>
          <CardHeader>
            <CardTitle>QA Validation Reports</CardTitle>
            <CardDescription>
              Generate comprehensive validation reports for client sign-off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium mb-1">Executive Summary</h4>
                <p className="text-xs text-gray-600 mb-3">High-level quality metrics and key findings</p>
                <Button size="sm" variant="outline">
                  Generate PDF
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium mb-1">Detailed Analysis</h4>
                <p className="text-xs text-gray-600 mb-3">Field-by-field validation results and errors</p>
                <Button size="sm" variant="outline">
                  Export CSV
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium mb-1">Compliance Report</h4>
                <p className="text-xs text-gray-600 mb-3">Regulatory compliance and audit trail</p>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Recent QA Reports</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div>
                    <span className="text-sm font-medium">Q4 Payroll Validation Report</span>
                    <span className="text-xs text-gray-500 ml-2">Generated: 2024-01-15 15:30</span>
                  </div>
                  <Button size="sm" variant="outline">Download</Button>
                </div>
                
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div>
                    <span className="text-sm font-medium">Benefits Enrollment QA Summary</span>
                    <span className="text-xs text-gray-500 ml-2">Generated: 2024-01-14 09:15</span>
                  </div>
                  <Button size="sm" variant="outline">Download</Button>
                </div>
                
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div>
                    <span className="text-sm font-medium">Employee Data Compliance Report</span>
                    <span className="text-xs text-gray-500 ml-2">Generated: 2024-01-13 14:45</span>
                  </div>
                  <Button size="sm" variant="outline">Download</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

