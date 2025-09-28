'use client';

import React, { useState, useEffect } from 'react';
import { User, PayStatement } from "@/types";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  employees: {
    total: number;
    active: number;
    terminated: number;
    onLeave: number;
    byDepartment: { [key: string]: number };
    byFlsaStatus: { exempt: number; nonExempt: number };
    byUnionStatus: { union: number; nonUnion: number };
    byEeoCategory: { [key: string]: number };
  };
  payStatements: {
    total: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalTaxes: number;
    byMonth: { [key: string]: { count: number; grossPay: number } };
    byDepartment: { [key: string]: { count: number; grossPay: number } };
    averageGrossPay: number;
    averageNetPay: number;
  };
  timecards: {
    total: number;
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    holidayHours: number;
    byApprovalStatus: { [key: string]: number };
    byDepartment: { [key: string]: number };
    averageHoursPerEmployee: number;
  };
  jobs: {
    total: number;
    byDepartment: { [key: string]: number };
    byFlsaClassification: { exempt: number; nonExempt: number };
    payRangeAnalysis: {
      minRange: number;
      maxRange: number;
      averageRange: number;
    };
    totalEmployeesInJobs: number;
  };
  taxRecords: {
    total: number;
    byFormType: { [key: string]: number };
    byTaxYear: { [key: string]: number };
    byStatus: { [key: string]: number };
    totalWages: number;
    totalTaxesWithheld: number;
  };
  benefits: {
    total: number;
    byDeductionType: { [key: string]: number };
    totalEmployeeContributions: number;
    totalEmployerContributions: number;
    activeGarnishments: number;
    byFrequency: { [key: string]: number };
  };
  compliance: {
    total: number;
    byComplianceType: { [key: string]: number };
    byStatus: { [key: string]: number };
    upcomingDeadlines: number;
    overdueReports: number;
  };
}

interface ComprehensiveDashboardProps {
  onCategoryClick?: (category: string) => void;
}

// Cache for dashboard metrics
const metricsCache = new Map<string, { data: DashboardMetrics; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({ onCategoryClick }) => {
  const { 
    selectedTenant, 
    availableTenants, 
    isMultiTenant, 
    isDemoMode,
    isLoading: tenantLoading 
  } = useTenant();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('current_year');

  const loadDashboardMetrics = async () => {
    // Don't load if tenant context is still loading
    if (tenantLoading) return;

    // Get tenant IDs with same logic as reporting page
    let tenantIds: string[] = [];
    
    if (isDemoMode) {
      tenantIds = ['99883779-9517-4ca9-a3f8-7fdc59051f0e']; // Demo tenant ID
    } else if (isMultiTenant() && availableTenants.length > 0) {
      tenantIds = availableTenants.map(t => t.id);
    } else if (selectedTenant) {
      tenantIds = [selectedTenant.id];
    }

    if (!tenantIds || tenantIds.length === 0) {
      setLoading(false);
      setError("No tenant selected or accessible.");
      return;
    }

    // Check cache first
    const cacheKey = `${tenantIds.join(',')}-${selectedTimeframe}`;
    const cached = metricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setMetrics(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel using same queries as reporting page
      const [
        employeesResult,
        payStatementsResult,
        timecardsResult,
        jobsResult,
        taxRecordsResult,
        benefitsResult,
        complianceResult
      ] = await Promise.all([
        supabase.from('employee_comprehensive_report').select('*').in('tenant_id', tenantIds),
        supabase.from('pay_statements_comprehensive_report').select('*').in('tenant_id', tenantIds),
        supabase.from('timecards_comprehensive_report').select('*').in('tenant_id', tenantIds),
        supabase.from('jobs_comprehensive_report').select('*').in('tenant_id', tenantIds),
        supabase.from('tax_records_comprehensive_report').select('*').in('tenant_id', tenantIds),
        supabase.from('benefits').select('*').in('tenant_id', tenantIds), // Use same table as reporting
        supabase.from('compliance_records').select('*').in('tenant_id', tenantIds) // Use same table as reporting
      ]);

      // Process employee metrics
      const employees = employeesResult.data || [];
      const employeeMetrics = {
        total: employees.length,
        active: employees.filter((e: User) => e.employment_status === 'active').length,
        terminated: employees.filter((e: User) => e.employment_status === 'terminated').length,
        onLeave: employees.filter((e: User) => e.employment_status === 'on_leave').length,
        byDepartment: employees.reduce((acc: Record<string, number>, e: User) => {
          const dept = e.home_department || 'Unknown';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {}),
        byFlsaStatus: {
          exempt: employees.filter((e: User) => e.flsa_status === 'exempt').length,
          nonExempt: employees.filter((e: User) => e.flsa_status === 'non-exempt').length
        },
        byUnionStatus: {
          union: employees.filter((e: User) => e.union_status === 'union_member').length,
          nonUnion: employees.filter((e: User) => e.union_status === 'non_union').length
        },
        byEeoCategory: employees.reduce((acc: Record<string, number>, e: User) => {
          const category = e.eeo_categories || 'Not Specified';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {})
      };

      // Process pay statement metrics
      const payStatements = payStatementsResult.data || [];
      const payStatementMetrics = {
        total: payStatements.length,
        totalGrossPay: payStatements.reduce((sum: number, p: PayStatement) => sum + (p.gross_pay || 0), 0),
        totalNetPay: payStatements.reduce((sum: number, p: PayStatement) => sum + (p.net_pay || 0), 0),
        totalTaxes: payStatements.reduce((sum: number, p: PayStatement) => sum + (p.federal_tax_withheld || 0) + (p.state_tax_withheld || 0), 0),
        byMonth: payStatements.reduce((acc: Record<string, {count: number, grossPay: number}>, p: PayStatement) => {
          const month = new Date(p.pay_date).toISOString().substring(0, 7);
          if (!acc[month]) acc[month] = { count: 0, grossPay: 0 };
          acc[month].count += 1;
          acc[month].grossPay += p.gross_pay || 0;
          return acc;
        }, {}),
        byDepartment: payStatements.reduce((acc: Record<string, {count: number, grossPay: number}>, p: PayStatement) => {
          const dept = p.department || 'Unknown';
          if (!acc[dept]) acc[dept] = { count: 0, grossPay: 0 };
          acc[dept].count += 1;
          acc[dept].grossPay += p.gross_pay || 0;
          return acc;
        }, {}),
        averageGrossPay: payStatements.length > 0 ? payStatements.reduce((sum: number, p: PayStatement) => sum + (p.gross_pay || 0), 0) / payStatements.length : 0,
        averageNetPay: payStatements.length > 0 ? payStatements.reduce((sum: number, p: PayStatement) => sum + (p.net_pay || 0), 0) / payStatements.length : 0
      };

      // Process timecard metrics
      const timecards = timecardsResult.data || [];
      const timecardMetrics = {
        total: timecards.length,
        totalHours: timecards.reduce((sum: number, t: any) => sum + (t.total_hours || 0), 0),
        regularHours: timecards.reduce((sum: number, t: any) => sum + (t.regular_hours || 0), 0),
        overtimeHours: timecards.reduce((sum: number, t: any) => sum + (t.overtime_hours || 0), 0),
        holidayHours: timecards.reduce((sum: number, t: any) => sum + (t.holiday_hours || 0), 0),
        byApprovalStatus: timecards.reduce((acc: Record<string, any>, t: any) => {
          const status = t.approval_status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        byDepartment: timecards.reduce((acc: Record<string, any>, t: any) => {
          const dept = t.department || 'Unknown';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {}),
        averageHoursPerEmployee: employees.length > 0 ? timecards.reduce((sum: number, t: any) => sum + (t.total_hours || 0), 0) / employees.length : 0
      };

      // Process job metrics
      const jobs = jobsResult.data || [];
      const jobMetrics = {
        total: jobs.length,
        byDepartment: jobs.reduce((acc: Record<string, any>, j: any) => {
          const dept = j.department || 'Unknown';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {}),
        byFlsaClassification: {
          exempt: jobs.filter((j: any) => j.flsa_classification === 'exempt').length,
          nonExempt: jobs.filter((j: any) => j.flsa_classification === 'non-exempt').length
        },
        payRangeAnalysis: {
          minRange: jobs.length > 0 ? Math.min(...jobs.map((j: any) => j.min_pay_range || 0)) : 0,
          maxRange: jobs.length > 0 ? Math.max(...jobs.map((j: any) => j.max_pay_range || 0)) : 0,
          averageRange: jobs.length > 0 ? jobs.reduce((sum: number, j: any) => sum + (j.midpoint_pay || 0), 0) / jobs.length : 0
        },
        totalEmployeesInJobs: jobs.reduce((sum: number, j: any) => sum + (j.employee_count || 0), 0)
      };

      // Process tax record metrics
      const taxRecords = taxRecordsResult.data || [];
      const taxMetrics = {
        total: taxRecords.length,
        byFormType: taxRecords.reduce((acc: Record<string, any>, t: any) => {
          const type = t.form_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        byTaxYear: taxRecords.reduce((acc: Record<string, any>, t: any) => {
          const year = t.tax_year?.toString() || 'Unknown';
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {}),
        byStatus: taxRecords.reduce((acc: Record<string, any>, t: any) => {
          const status = t.document_status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        totalWages: taxRecords.reduce((sum: number, t: any) => sum + (t.wages_tips_compensation || 0), 0),
        totalTaxesWithheld: taxRecords.reduce((sum: number, t: any) => sum + (t.federal_income_tax_withheld || 0) + (t.state_income_tax || 0), 0)
      };

      // Process benefit metrics
      const benefits = benefitsResult.data || [];
      const benefitMetrics = {
        total: benefits.length,
        byDeductionType: benefits.reduce((acc: Record<string, any>, b: any) => {
          const type = b.deduction_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        totalEmployeeContributions: benefits.reduce((sum: number, b: any) => sum + (b.employee_contribution || 0), 0),
        totalEmployerContributions: benefits.reduce((sum: number, b: any) => sum + (b.employer_contribution || 0), 0),
        activeGarnishments: benefits.filter((b: any) => b.court_order_number && b.end_date === null).length,
        byFrequency: benefits.reduce((acc: Record<string, any>, b: any) => {
          const freq = b.frequency || 'Unknown';
          acc[freq] = (acc[freq] || 0) + 1;
          return acc;
        }, {})
      };

      // Process compliance metrics
      const compliance = complianceResult.data || [];
      const complianceMetrics = {
        total: compliance.length,
        byComplianceType: compliance.reduce((acc: Record<string, any>, c: any) => {
          const type = c.compliance_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        byStatus: compliance.reduce((acc: Record<string, any>, c: any) => {
          const status = c.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        upcomingDeadlines: compliance.filter((c: any) => {
          const dueDate = new Date(c.due_date);
          const now = new Date();
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return dueDate > now && dueDate <= thirtyDaysFromNow;
        }).length,
        overdueReports: compliance.filter((c: any) => {
          const dueDate = new Date(c.due_date);
          const now = new Date();
          return dueDate < now && c.status !== 'completed';
        }).length
      };

      const finalMetrics = {
        employees: employeeMetrics,
        payStatements: payStatementMetrics,
        timecards: timecardMetrics,
        jobs: jobMetrics,
        taxRecords: taxMetrics,
        benefits: benefitMetrics,
        compliance: complianceMetrics
      };

      // Cache the results
      metricsCache.set(cacheKey, {
        data: finalMetrics,
        timestamp: Date.now()
      });

      // Log for debugging
      console.log('Dashboard metrics loaded:', {
        employees: employees.length,
        payStatements: payStatements.length,
        timecards: timecards.length,
        jobs: jobs.length,
        taxRecords: taxRecords.length,
        benefits: benefits.length,
        compliance: compliance.length,
        tenantIds,
        cached: false
      });

      setMetrics(finalMetrics);

    } catch (err: any) {
      console.error('Error loading dashboard metrics:', err);
      setError(`Failed to load dashboard metrics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardMetrics();
  }, [selectedTenant, selectedTimeframe, tenantLoading, isDemoMode, availableTenants.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading comprehensive dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available for dashboard metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time insights across all reporting categories</p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={selectedTimeframe}
            onChange={(e: any) => setSelectedTimeframe(e.target.value)}
          >
            <option value="current_year">Current Year</option>
            <option value="last_12_months">Last 12 Months</option>
            <option value="current_quarter">Current Quarter</option>
            <option value="last_quarter">Last Quarter</option>
          </select>
          <Button 
            onClick={() => {
              // Clear cache and reload
              metricsCache.clear();
              loadDashboardMetrics();
            }} 
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCategoryClick?.('employees')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{metrics.employees.total}</div>
            <div className="text-sm text-gray-600">👥 Employees</div>
            <div className="text-xs text-green-600 mt-1">
              {metrics.employees.active} Active
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCategoryClick?.('pay-statements')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics.payStatements.total}</div>
            <div className="text-sm text-gray-600">💰 Pay Statements</div>
            <div className="text-xs text-green-600 mt-1">
              ${(metrics.payStatements.totalGrossPay / 1000).toFixed(0)}K Total
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCategoryClick?.('timecards')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{metrics.timecards.total}</div>
            <div className="text-sm text-gray-600">⏰ Timecards</div>
            <div className="text-xs text-green-600 mt-1">
              {metrics.timecards.totalHours.toFixed(0)} Hours
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCategoryClick?.('jobs')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{metrics.jobs.total}</div>
            <div className="text-sm text-gray-600">💼 Job Positions</div>
            <div className="text-xs text-green-600 mt-1">
              {metrics.jobs.totalEmployeesInJobs} Filled
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCategoryClick?.('tax-records')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{metrics.taxRecords.total}</div>
            <div className="text-sm text-gray-600">📋 Tax Records</div>
            <div className="text-xs text-green-600 mt-1">
              ${(metrics.taxRecords.totalWages / 1000).toFixed(0)}K Wages
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCategoryClick?.('benefits-deductions')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{metrics.benefits.total}</div>
            <div className="text-sm text-gray-600">🏥 Benefits</div>
            <div className="text-xs text-green-600 mt-1">
              ${(metrics.benefits.totalEmployeeContributions / 1000).toFixed(0)}K Contrib.
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCategoryClick?.('compliance')}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">{metrics.compliance.total}</div>
            <div className="text-sm text-gray-600">📊 Compliance</div>
            <div className="text-xs text-red-600 mt-1">
              {metrics.compliance.overdueReports} Overdue
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Employee Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">👥 Employee Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Active Employees:</span>
              <Badge variant="default">{metrics.employees.active}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Terminated:</span>
              <Badge variant="secondary">{metrics.employees.terminated}</Badge>
            </div>
            <div className="flex justify-between">
              <span>On Leave:</span>
              <Badge variant="outline">{metrics.employees.onLeave}</Badge>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">By Department:</h4>
              {Object.entries(metrics.employees.byDepartment).map(([dept, count]: any) => (
                <div key={dept} className="flex justify-between text-sm">
                  <span>{dept}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">FLSA Status:</h4>
              <div className="flex justify-between text-sm">
                <span>Exempt: {metrics.employees.byFlsaStatus.exempt}</span>
                <span>Non-Exempt: {metrics.employees.byFlsaStatus.nonExempt}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payroll Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">💰 Payroll Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Gross Pay:</span>
              <span className="font-semibold">${metrics.payStatements.totalGrossPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Net Pay:</span>
              <span className="font-semibold">${metrics.payStatements.totalNetPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Taxes:</span>
              <span className="font-semibold">${metrics.payStatements.totalTaxes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Gross:</span>
              <span>${metrics.payStatements.averageGrossPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Net:</span>
              <span>${metrics.payStatements.averageNetPay.toLocaleString()}</span>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">By Department:</h4>
              {Object.entries(metrics.payStatements.byDepartment).slice(0, 3).map(([dept, data]: [string, any]) => (
                <div key={dept} className="flex justify-between text-sm">
                  <span>{dept}:</span>
                  <span>${data.grossPay.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Time Tracking Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">⏰ Time Tracking</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Hours:</span>
              <span className="font-semibold">{metrics.timecards.totalHours.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Regular Hours:</span>
              <span>{metrics.timecards.regularHours.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime Hours:</span>
              <span>{metrics.timecards.overtimeHours.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Holiday Hours:</span>
              <span>{metrics.timecards.holidayHours.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Hours/Employee:</span>
              <span>{metrics.timecards.averageHoursPerEmployee.toFixed(1)}</span>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Approval Status:</h4>
              {Object.entries(metrics.timecards.byApprovalStatus).map(([status, count]: any) => (
                <div key={status} className="flex justify-between text-sm">
                  <span>{status}:</span>
                  <Badge variant={status === 'approved' ? 'default' : 'secondary'}>{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Job Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">💼 Job Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Positions:</span>
              <span className="font-semibold">{metrics.jobs.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Filled Positions:</span>
              <span>{metrics.jobs.totalEmployeesInJobs}</span>
            </div>
            <div className="flex justify-between">
              <span>Min Pay Range:</span>
              <span>${metrics.jobs.payRangeAnalysis.minRange.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Pay Range:</span>
              <span>${metrics.jobs.payRangeAnalysis.maxRange.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Range:</span>
              <span>${metrics.jobs.payRangeAnalysis.averageRange.toLocaleString()}</span>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">FLSA Classification:</h4>
              <div className="flex justify-between text-sm">
                <span>Exempt: {metrics.jobs.byFlsaClassification.exempt}</span>
                <span>Non-Exempt: {metrics.jobs.byFlsaClassification.nonExempt}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tax Records Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Tax Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Records:</span>
              <span className="font-semibold">{metrics.taxRecords.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Wages:</span>
              <span>${metrics.taxRecords.totalWages.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes Withheld:</span>
              <span>${metrics.taxRecords.totalTaxesWithheld.toLocaleString()}</span>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">By Form Type:</h4>
              {Object.entries(metrics.taxRecords.byFormType).map(([type, count]: any) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}:</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">By Status:</h4>
              {Object.entries(metrics.taxRecords.byStatus).map(([status, count]: any) => (
                <div key={status} className="flex justify-between text-sm">
                  <span>{status}:</span>
                  <Badge variant={status === 'completed' ? 'default' : 'secondary'}>{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Benefits Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🏥 Benefits Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Benefits:</span>
              <span className="font-semibold">{metrics.benefits.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Employee Contributions:</span>
              <span>${metrics.benefits.totalEmployeeContributions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Employer Contributions:</span>
              <span>${metrics.benefits.totalEmployerContributions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Garnishments:</span>
              <Badge variant={metrics.benefits.activeGarnishments > 0 ? 'destructive' : 'default'}>
                {metrics.benefits.activeGarnishments}
              </Badge>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">By Type:</h4>
              {Object.entries(metrics.benefits.byDeductionType).slice(0, 4).map(([type, count]: any) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Compliance Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Compliance Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Reports:</span>
              <span className="font-semibold">{metrics.compliance.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Upcoming Deadlines:</span>
              <Badge variant={metrics.compliance.upcomingDeadlines > 0 ? 'outline' : 'default'}>
                {metrics.compliance.upcomingDeadlines}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Overdue Reports:</span>
              <Badge variant={metrics.compliance.overdueReports > 0 ? 'destructive' : 'default'}>
                {metrics.compliance.overdueReports}
              </Badge>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">By Type:</h4>
              {Object.entries(metrics.compliance.byComplianceType).map(([type, count]: any) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">By Status:</h4>
              {Object.entries(metrics.compliance.byStatus).map(([status, count]: any) => (
                <div key={status} className="flex justify-between text-sm">
                  <span>{status}:</span>
                  <Badge variant={status === 'completed' ? 'default' : 'secondary'}>{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default ComprehensiveDashboard;

