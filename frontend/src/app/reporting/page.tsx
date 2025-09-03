'use client'

import { useState } from 'react'
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
  Clock,
  CheckCircle,
  Briefcase
} from 'lucide-react'

export default function ReportingDashboardPage() {
  const { tenant } = useAuth()
  const [activeTab, setActiveTab] = useState('employee')

  // Navigation tabs for the reporting page
  const reportingTabs = [
    { id: 'employee', name: 'Employee', icon: Users },
    { id: 'checks', name: 'Checks', icon: CheckCircle },
    { id: 'jobs', name: 'Jobs', icon: Briefcase },
    { id: 'salary', name: 'Salary', icon: DollarSign },
    { id: 'timecards', name: 'Timecards', icon: Clock },
    { id: 'all-reports', name: 'All Reports', icon: FileText }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employee':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                      <p className="text-sm font-medium text-gray-600">Active Employees</p>
                      <p className="text-2xl font-bold text-gray-900">2,087</p>
                      <p className="text-xs text-green-600">98.8% active rate</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New Hires</p>
                      <p className="text-2xl font-bold text-gray-900">47</p>
                      <p className="text-xs text-blue-600">This month</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Terminations</p>
                      <p className="text-2xl font-bold text-gray-900">21</p>
                      <p className="text-xs text-orange-600">This month</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Employee Demographics</CardTitle>
                <CardDescription>Employee distribution by department and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Engineering</h4>
                      <div className="text-2xl font-bold text-blue-600">456</div>
                      <div className="text-xs text-gray-500">21.6% of workforce</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Sales</h4>
                      <div className="text-2xl font-bold text-green-600">312</div>
                      <div className="text-xs text-gray-500">14.8% of workforce</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Operations</h4>
                      <div className="text-2xl font-bold text-purple-600">789</div>
                      <div className="text-xs text-gray-500">37.3% of workforce</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Support</h4>
                      <div className="text-2xl font-bold text-orange-600">556</div>
                      <div className="text-xs text-gray-500">26.3% of workforce</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'checks':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Checks Processed</p>
                      <p className="text-2xl font-bold text-gray-900">4,226</p>
                      <p className="text-xs text-green-600">This pay period</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">$8.4M</p>
                      <p className="text-xs text-blue-600">Gross payroll</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Direct Deposits</p>
                      <p className="text-2xl font-bold text-gray-900">4,198</p>
                      <p className="text-xs text-green-600">99.3% electronic</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paper Checks</p>
                      <p className="text-2xl font-bold text-gray-900">28</p>
                      <p className="text-xs text-orange-600">0.7% physical</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Check Processing Status</CardTitle>
                <CardDescription>Current pay period check processing details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-800">Q4 2024 - Period 26</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Completed
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-green-900">4,226</div>
                        <div className="text-xs text-green-600">Checks</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-900">$8.4M</div>
                        <div className="text-xs text-green-600">Total Amount</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-900">99.8%</div>
                        <div className="text-xs text-green-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                      <p className="text-xs text-green-600">This month</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">98.5%</p>
                      <p className="text-xs text-green-600">Above target</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                      <p className="text-2xl font-bold text-gray-900">4.2m</p>
                      <p className="text-xs text-green-600">-12% improvement</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">19</p>
                      <p className="text-xs text-orange-600">1.5% failure rate</p>
                    </div>
                    <Eye className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Processing Details</CardTitle>
                <CardDescription>Recent job execution and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Payroll Processing Jobs</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">847</div>
                        <div className="text-xs text-gray-500">Total Jobs</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">99.2%</div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">3.8m</div>
                        <div className="text-xs text-gray-500">Avg Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'salary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                      <p className="text-2xl font-bold text-gray-900">$8.4M</p>
                      <p className="text-xs text-green-600">This period</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Salary</p>
                      <p className="text-2xl font-bold text-gray-900">$67,500</p>
                      <p className="text-xs text-blue-600">Annual equivalent</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overtime Pay</p>
                      <p className="text-2xl font-bold text-gray-900">$1.2M</p>
                      <p className="text-xs text-orange-600">14.3% of total</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bonuses</p>
                      <p className="text-2xl font-bold text-gray-900">$450K</p>
                      <p className="text-xs text-purple-600">5.4% of total</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
                <CardDescription>Compensation breakdown by department and level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Engineering</h4>
                      <div className="text-lg font-bold text-blue-600">$125,000</div>
                      <div className="text-xs text-gray-500">Average salary</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Sales</h4>
                      <div className="text-lg font-bold text-green-600">$85,000</div>
                      <div className="text-xs text-gray-500">Average salary</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Operations</h4>
                      <div className="text-lg font-bold text-purple-600">$65,000</div>
                      <div className="text-xs text-gray-500">Average salary</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Support</h4>
                      <div className="text-lg font-bold text-orange-600">$55,000</div>
                      <div className="text-xs text-gray-500">Average salary</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'timecards':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold text-gray-900">84,520</p>
                      <p className="text-xs text-green-600">This period</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Regular Hours</p>
                      <p className="text-2xl font-bold text-gray-900">72,440</p>
                      <p className="text-xs text-blue-600">85.7% of total</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                      <p className="text-2xl font-bold text-gray-900">12,080</p>
                      <p className="text-xs text-orange-600">14.3% of total</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Hours/Employee</p>
                      <p className="text-2xl font-bold text-gray-900">40.2</p>
                      <p className="text-xs text-purple-600">Per week</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Timecard Processing</CardTitle>
                <CardDescription>Time tracking and attendance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Attendance Rate</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Excellent
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-green-900">96.8%</div>
                        <div className="text-xs text-gray-500">On Time</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-orange-600">2.1%</div>
                        <div className="text-xs text-gray-500">Late</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">1.1%</div>
                        <div className="text-xs text-gray-500">Absent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'all-reports':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Complete list of all available reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium">Employee Report</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Comprehensive employee data and demographics</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="text-sm font-medium">Payroll Summary</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Detailed payroll processing and costs</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="text-sm font-medium">Time & Attendance</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Hours worked, overtime, and attendance tracking</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <BarChart3 className="h-5 w-5 text-orange-600 mr-2" />
                      <h4 className="text-sm font-medium">Department Analysis</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Department-wise metrics and comparisons</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="text-sm font-medium">Benefits Analysis</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Benefits enrollment and cost analysis</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center mb-3">
                      <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                      <h4 className="text-sm font-medium">Custom Reports</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Build and customize your own reports</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Top Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR/Payroll Reporting</h1>
              <p className="text-gray-600">
                Enterprise reporting by pay period, benefit group, and department for {tenant?.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            {reportingTabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <TabIcon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  )
}

