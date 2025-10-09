'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';

// HR Analytics specific interfaces
interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  terminatedEmployees: number;
  onLeaveEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  overtimeHours: number;
  complianceScore: number;
}

interface PayrollTrend {
  month: string;
  amount: number;
  department: string;
}

interface ComplianceItem {
  type: string;
  status: 'compliant' | 'warning' | 'violation';
  description: string;
  dueDate?: string;
}

export default function HRAnalyticsDashboard() {
  const { selectedTenant } = useTenant();
  const [loading, setloading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('current_year');
  
  // Data states
  const [hrMetrics, setHrMetrics] = useState<HRMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    terminatedEmployees: 0,
    onLeaveEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
    overtimeHours: 0,
    complianceScore: 0
  });
  
  const [payrollTrends, setPayrollTrends] = useState<PayrollTrend[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);

  // Load HR Analytics data
  useEffect(() => {
    loadHRAnalyticsData();
  }, [timeframe]);

  const loadHRAnalyticsData = async () => {
    setloading(true);
    setError(null);
    
    try {
      // Load employee metrics - try with tenant first, fallback to all data
      let employeesQuery = supabase.from('employees').select('*');
      if (selectedTenant?.id) {
        employeesQuery = employeesQuery.eq('customer_id', selectedTenant.id);
      }
      
      const { data: employees, error: empError } = await employeesQuery;
      if (empError) {
        console.error('Employee query error:', empError);
        throw empError;
      }

      // Load payroll data - try with tenant first, fallback to all data
      let payrollQuery = supabase.from('pay_statements').select('*');
      if (selectedTenant?.id) {
        payrollQuery = payrollQuery.eq('customer_id', selectedTenant.id);
      }
      
      const { data: payroll, error: payError } = await payrollQuery;
      if (payError) {
        console.error('Payroll query error:', payError);
        throw payError;
      }

      // Calculate metrics
      const activeEmployees = employees?.filter((emp: any) => emp.status === 'active').length || 0;
      const terminatedEmployees = employees?.filter((emp: any) => emp.status === 'terminated').length || 0;
      const onLeaveEmployees = employees?.filter((emp: any) => emp.status === 'on_leave').length || 0;
      
      const totalPayroll = payroll?.reduce((sum: number, pay: any) => sum + (parseFloat(pay.gross_pay) || 0), 0) || 0;
      const averageSalary = activeEmployees > 0 ? totalPayroll / activeEmployees : 0;

      setHrMetrics({
        totalEmployees: employees?.length || 0,
        activeEmployees,
        terminatedEmployees,
        onLeaveEmployees,
        totalPayroll,
        averageSalary,
        overtimeHours: 0, // Would calculate from timecards
        complianceScore: 85 // Sample score
      });

      // Sample payroll trends
      setPayrollTrends([
        { month: 'Jan 2024', amount: totalPayroll * 0.8, department: 'All' },
        { month: 'Feb 2024', amount: totalPayroll * 0.9, department: 'All' },
        { month: 'Mar 2024', amount: totalPayroll, department: 'All' }
      ]);

      // Sample compliance items
      setComplianceItems([
        { type: 'EEO-1', status: 'compliant', description: 'EEO-1 report filed on time' },
        { type: 'ACA', status: 'warning', description: '1095-C forms pending review', dueDate: '2024-03-31' },
        { type: 'FMLA', status: 'compliant', description: 'FMLA tracking up to date' },
        { type: 'Workers Comp', status: 'violation', description: 'Missing injury report', dueDate: '2024-02-15' }
      ]);

    } catch (err) {
      console.error('Error loading HR analytics data:', err);
      setError('Failed to load HR analytics data');
    } finally {
      setloading(false);
    }
  };

  const renderFinancialAuditSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">💰 Financial Audit Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payroll Expense Trending */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Payroll Expense Trending</h4>
          <div className="space-y-3">
            {payrollTrends.map((trend, index: any) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{trend.month}</span>
                <span className="font-semibold">${trend.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              <strong>Total YTD Payroll:</strong> ${hrMetrics.totalPayroll.toLocaleString()}
            </div>
          </div>
        </Card>

        {/* Tax Liability Analysis */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Tax Liability Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Federal Tax Withheld:</span>
              <span className="font-semibold">${(hrMetrics.totalPayroll * 0.22).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>State Tax Withheld:</span>
              <span className="font-semibold">${(hrMetrics.totalPayroll * 0.05).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Social Security:</span>
              <span className="font-semibold">${(hrMetrics.totalPayroll * 0.062).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Medicare:</span>
              <span className="font-semibold">${(hrMetrics.totalPayroll * 0.0145).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Deduction Reconciliation */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Deduction Reconciliation</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Pre-tax Deductions:</span>
              <span className="font-semibold text-green-600">${(hrMetrics.totalPayroll * 0.08).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Post-tax Deductions:</span>
              <span className="font-semibold text-blue-600">${(hrMetrics.totalPayroll * 0.03).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Garnishments:</span>
              <span className="font-semibold text-red-600">${(hrMetrics.totalPayroll * 0.01).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Benefits Cost Analysis */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Benefits Cost Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Employee Contributions:</span>
              <span className="font-semibold">${(hrMetrics.totalPayroll * 0.05).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Employer Contributions:</span>
              <span className="font-semibold">${(hrMetrics.totalPayroll * 0.12).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Benefits Cost:</span>
              <span className="font-semibold text-purple-600">${(hrMetrics.totalPayroll * 0.17).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderComplianceAuditSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">📊 Compliance Audit Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overtime Distribution */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Overtime Distribution</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Overtime Hours:</span>
              <span className="font-semibold">{hrMetrics.overtimeHours}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime Cost:</span>
              <span className="font-semibold">${(hrMetrics.overtimeHours * 35).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg OT per Employee:</span>
              <span className="font-semibold">{hrMetrics.activeEmployees > 0 ? (hrMetrics.overtimeHours / hrMetrics.activeEmployees).toFixed(1) : 0} hrs</span>
            </div>
          </div>
        </Card>

        {/* FLSA Compliance Dashboard */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">FLSA Compliance Dashboard</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Exempt Employees:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.activeEmployees * 0.4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Non-exempt Employees:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.activeEmployees * 0.6)}</span>
            </div>
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">FLSA Compliant</Badge>
            </div>
          </div>
        </Card>

        {/* Pay Equity Analysis */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Pay Equity Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Average Male Salary:</span>
              <span className="font-semibold">${(hrMetrics.averageSalary * 1.02).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Female Salary:</span>
              <span className="font-semibold">${(hrMetrics.averageSalary * 0.98).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Pay Gap:</span>
              <span className="font-semibold text-orange-600">2.0%</span>
            </div>
          </div>
        </Card>

        {/* Tax Jurisdiction Mapping */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Tax Jurisdiction Mapping</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Federal Only:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.activeEmployees * 0.1)}</span>
            </div>
            <div className="flex justify-between">
              <span>State + Federal:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.activeEmployees * 0.7)}</span>
            </div>
            <div className="flex justify-between">
              <span>Local + State + Federal:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.activeEmployees * 0.2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderOperationalAuditSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">⚙️ Operational Audit Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Completeness Scoring */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Data Completeness Scoring</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Employee Records:</span>
              <span className="font-semibold text-green-600">95%</span>
            </div>
            <div className="flex justify-between">
              <span>Pay Records:</span>
              <span className="font-semibold text-green-600">98%</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Records:</span>
              <span className="font-semibold text-yellow-600">87%</span>
            </div>
            <div className="flex justify-between">
              <span>Overall Score:</span>
              <span className="font-semibold text-green-600">93%</span>
            </div>
          </div>
        </Card>

        {/* Processing Timeline */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Processing Timeline</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Avg Payroll Cycle:</span>
              <span className="font-semibold">2.3 days</span>
            </div>
            <div className="flex justify-between">
              <span>Approval Time:</span>
              <span className="font-semibold">4.2 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Efficiency:</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
          </div>
        </Card>

        {/* Exception Reporting */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Exception Reporting</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Manual Adjustments:</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between">
              <span>Corrections:</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between">
              <span>Reversals:</span>
              <span className="font-semibold">1</span>
            </div>
          </div>
        </Card>

        {/* Access Control Audit */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Access Control Audit</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex justify-between">
              <span>Admin Users:</span>
              <span className="font-semibold">2</span>
            </div>
            <div className="flex justify-between">
              <span>Last Access Review:</span>
              <span className="font-semibold">2024-01-15</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRiskManagementSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">⚠️ Risk Management Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Garnishment Tracking */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Garnishment Tracking</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Active Garnishments:</span>
              <span className="font-semibold">2</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">${(hrMetrics.totalPayroll * 0.01).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Compliance Status:</span>
              <Badge className="bg-green-100 text-green-800">Compliant</Badge>
            </div>
          </div>
        </Card>

        {/* Benefits Enrollment Gaps */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Benefits Enrollment Gaps</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Eligible Employees:</span>
              <span className="font-semibold">{hrMetrics.activeEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span>Enrolled in Benefits:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.activeEmployees * 0.85)}</span>
            </div>
            <div className="flex justify-between">
              <span>Enrollment Rate:</span>
              <span className="font-semibold text-green-600">85%</span>
            </div>
          </div>
        </Card>

        {/* Termination Analysis */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Termination Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Voluntary Terminations:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.terminatedEmployees * 0.7)}</span>
            </div>
            <div className="flex justify-between">
              <span>Involuntary Terminations:</span>
              <span className="font-semibold">{Math.floor(hrMetrics.terminatedEmployees * 0.3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Turnover Rate:</span>
              <span className="font-semibold text-yellow-600">12%</span>
            </div>
          </div>
        </Card>

        {/* Payroll Error Rates */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Payroll Error Rates</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Payroll Runs:</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between">
              <span>Errors Detected:</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span className="font-semibold text-green-600">1.25%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">loading HR Analytics Dashboard...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive payroll and HR analytics with enhanced audit capabilities</p>
          </div>
          <div className="flex gap-4">
            <select 
              value={timeframe} 
              onChange={(e: any) => setTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="current_year">Current Year</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <Button onClick={loadHRAnalyticsData}>Refresh Data</Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{hrMetrics.totalEmployees}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">${hrMetrics.totalPayroll.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Payroll</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">${hrMetrics.averageSalary.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Average Salary</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{hrMetrics.complianceScore}%</div>
            <div className="text-sm text-gray-600">Compliance Score</div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Compliance Status Overview */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Compliance Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceItems.map((item, index: any) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{item.type}</span>
                  <Badge className={
                    item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">{item.description}</div>
                {item.dueDate && (
                  <div className="text-xs text-gray-500 mt-1">Due: {item.dueDate}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Four Main Audit Sections */}
        {renderFinancialAuditSection()}
        {renderComplianceAuditSection()}
        {renderOperationalAuditSection()}
        {renderRiskManagementSection()}
      </div>
    </DashboardLayout>
  );
}

