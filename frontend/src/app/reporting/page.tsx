'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Users,
  DollarSign,
  FileText,
  Clock
} from 'lucide-react'

export default function ReportingDashboardPage() {
  const { tenant } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reporting & Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Enterprise reporting by pay period, benefit group, and department for {tenant?.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">2,113</p>
                  <p className="text-xs text-green-600">+2.3% from last period</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payroll Volume</p>
                  <p className="text-2xl font-bold text-gray-900">$8.4M</p>
                  <p className="text-xs text-green-600">+5.7% from last period</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ETL Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-blue-600">98.5% success rate</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900">4.2m</p>
                  <p className="text-xs text-green-600">-12% improvement</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pay Period Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Pay Period Analysis</CardTitle>
              <CardDescription>
                Payroll trends and metrics by pay period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Q4 2024 - Period 26</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Completed
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">2,113</div>
                      <div className="text-xs text-gray-500">Employees</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">$8.4M</div>
                      <div className="text-xs text-gray-500">Gross Pay</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">$2.1M</div>
                      <div className="text-xs text-gray-500">Deductions</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">3m 45s</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Error Rate:</span>
                      <span className="font-medium text-green-600">0.2%</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Q4 2024 - Period 25</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Completed
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">2,098</div>
                      <div className="text-xs text-gray-500">Employees</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">$8.1M</div>
                      <div className="text-xs text-gray-500">Gross Pay</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">$2.0M</div>
                      <div className="text-xs text-gray-500">Deductions</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">4m 12s</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Error Rate:</span>
                      <span className="font-medium text-green-600">0.3%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  View All Pay Periods
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefit Group Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Benefit Group Analysis</CardTitle>
              <CardDescription>
                Benefits enrollment and costs by group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-800">Executive Benefits</h4>
                    <span className="text-xs text-blue-600">125 employees</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-blue-900">$2,450</div>
                      <div className="text-xs text-blue-600">Avg Monthly Cost</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-900">98%</div>
                      <div className="text-xs text-blue-600">Enrollment Rate</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-blue-700">
                    Premium health, dental, vision + executive perks
                  </div>
                </div>
                
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-green-800">Standard Benefits</h4>
                    <span className="text-xs text-green-600">1,756 employees</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-green-900">$1,250</div>
                      <div className="text-xs text-green-600">Avg Monthly Cost</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-900">94%</div>
                      <div className="text-xs text-green-600">Enrollment Rate</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-green-700">
                    Health, dental, vision + 401k matching
                  </div>
                </div>
                
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-orange-800">Basic Benefits</h4>
                    <span className="text-xs text-orange-600">232 employees</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-orange-900">$650</div>
                      <div className="text-xs text-orange-600">Avg Monthly Cost</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-orange-900">87%</div>
                      <div className="text-xs text-orange-600">Enrollment Rate</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-orange-700">
                    Basic health coverage + minimal dental
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="w-full">
                  Detailed Benefits Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Department Analysis</CardTitle>
            <CardDescription>
              Employee distribution, costs, and metrics by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Engineering</h4>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium">456</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Salary:</span>
                    <span className="font-medium">$125,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium text-green-600">$57.0M</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Sales</h4>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium">312</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Salary:</span>
                    <span className="font-medium">$85,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium text-blue-600">$26.5M</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Operations</h4>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium">789</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Salary:</span>
                    <span className="font-medium">$65,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium text-purple-600">$51.3M</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Support</h4>
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium">556</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Salary:</span>
                    <span className="font-medium">$55,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium text-orange-600">$30.6M</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Report Generation</CardTitle>
            <CardDescription>
              Generate custom reports for stakeholders and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium mb-1">Monthly Executive Report</h4>
                <p className="text-xs text-gray-600 mb-3">High-level metrics and trends for leadership</p>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium mb-1">Detailed Analytics</h4>
                <p className="text-xs text-gray-600 mb-3">Comprehensive data analysis and insights</p>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium mb-1">Compliance Report</h4>
                <p className="text-xs text-gray-600 mb-3">Regulatory compliance and audit documentation</p>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Recent Reports</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div>
                    <span className="text-sm font-medium">Q4 2024 Executive Summary</span>
                    <span className="text-xs text-gray-500 ml-2">Generated: 2024-01-15 09:30</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div>
                    <span className="text-sm font-medium">Benefits Enrollment Analysis</span>
                    <span className="text-xs text-gray-500 ml-2">Generated: 2024-01-14 14:15</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

