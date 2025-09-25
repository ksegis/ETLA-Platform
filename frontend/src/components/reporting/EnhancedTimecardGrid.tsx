'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
// Note: Using simplified select implementation
// In production, you would use proper UI library components
import { Calendar, Download, Clock, User, Building, FileSpreadsheet } from 'lucide-react';
import { useCustomerBranding } from '@/services/brandingService';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

interface TimecardEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_duration: number;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  doubletime_hours: number;
  holiday_hours: number;
  sick_hours: number;
  vacation_hours: number;
  department: string;
  supervisor: string;
  job_code: string;
  cost_center: string;
  pay_rate: number;
  day_of_week: string;
  shift_code: string;
  approval_status: string;
  approver_id: string;
  approval_date: string;
  notes: string;
  tenant_id: string;
}

interface PayPeriodSummary {
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department: string;
  supervisor: string;
  pay_period_start: string;
  pay_period_end: string;
  total_regular_hours: number;
  total_overtime_hours: number;
  total_doubletime_hours: number;
  total_holiday_hours: number;
  total_sick_hours: number;
  total_vacation_hours: number;
  total_hours: number;
  daily_entries: DailyEntry[];
}

interface DailyEntry {
  work_date: string;
  day_of_week: string;
  clock_in: string | null;
  clock_out: string | null;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  approval_status: string;
  notes: string;
}

interface EnhancedTimecardGridProps {
  timecardData: TimecardEntry[];
  tenantId?: string;
  employeeId?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
}

export default function EnhancedTimecardGrid({ 
  timecardData, 
  tenantId, 
  employeeId,
  payPeriodStart,
  payPeriodEnd 
}: EnhancedTimecardGridProps) {
  const { branding } = useCustomerBranding(tenantId);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(employeeId || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Get unique employees for selection
  const employees = useMemo(() => {
    const uniqueEmployees = new Map();
    timecardData.forEach(entry => {
      if (!uniqueEmployees.has(entry.employee_id)) {
        uniqueEmployees.set(entry.employee_id, {
          id: entry.employee_id,
          name: entry.employee_name,
          code: entry.employee_code,
          department: entry.department
        });
      }
    });
    return Array.from(uniqueEmployees.values());
  }, [timecardData]);

  // Get unique pay periods
  const payPeriods = useMemo(() => {
    const periods = new Set<string>();
    timecardData.forEach(entry => {
      const date = new Date(entry.work_date);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Calculate bi-weekly pay periods (assuming pay periods start on Sundays)
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekOfYear = Math.floor(dayOfYear / 7);
      const payPeriodNumber = Math.floor(weekOfYear / 2);
      
      const payPeriodStart = new Date(year, 0, 1 + (payPeriodNumber * 14));
      const payPeriodEnd = new Date(payPeriodStart);
      payPeriodEnd.setDate(payPeriodEnd.getDate() + 13);
      
      const periodKey = `${payPeriodStart.toISOString().split('T')[0]} to ${payPeriodEnd.toISOString().split('T')[0]}`;
      periods.add(periodKey);
    });
    
    return Array.from(periods).sort().reverse(); // Most recent first
  }, [timecardData]);

  // Filter and group timecard data by pay period
  const payPeriodSummaries = useMemo(() => {
    let filteredData = timecardData;

    // Apply filters
    if (selectedEmployee) {
      filteredData = filteredData.filter(entry => entry.employee_id === selectedEmployee);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(entry => 
        entry.employee_name.toLowerCase().includes(term) ||
        entry.employee_code.toLowerCase().includes(term) ||
        entry.department.toLowerCase().includes(term)
      );
    }

    // Group by employee and pay period
    const grouped = new Map<string, PayPeriodSummary>();

    filteredData.forEach(entry => {
      const date = new Date(entry.work_date);
      const year = date.getFullYear();
      
      // Calculate pay period
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekOfYear = Math.floor(dayOfYear / 7);
      const payPeriodNumber = Math.floor(weekOfYear / 2);
      
      const payPeriodStart = new Date(year, 0, 1 + (payPeriodNumber * 14));
      const payPeriodEnd = new Date(payPeriodStart);
      payPeriodEnd.setDate(payPeriodEnd.getDate() + 13);
      
      const key = `${entry.employee_id}-${payPeriodStart.toISOString().split('T')[0]}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          employee_id: entry.employee_id,
          employee_name: entry.employee_name,
          employee_code: entry.employee_code,
          department: entry.department,
          supervisor: entry.supervisor,
          pay_period_start: payPeriodStart.toISOString().split('T')[0],
          pay_period_end: payPeriodEnd.toISOString().split('T')[0],
          total_regular_hours: 0,
          total_overtime_hours: 0,
          total_doubletime_hours: 0,
          total_holiday_hours: 0,
          total_sick_hours: 0,
          total_vacation_hours: 0,
          total_hours: 0,
          daily_entries: []
        });
      }

      const summary = grouped.get(key)!;
      
      // Add daily entry
      summary.daily_entries.push({
        work_date: entry.work_date,
        day_of_week: entry.day_of_week,
        clock_in: entry.clock_in,
        clock_out: entry.clock_out,
        regular_hours: entry.regular_hours,
        overtime_hours: entry.overtime_hours,
        total_hours: entry.total_hours,
        approval_status: entry.approval_status,
        notes: entry.notes
      });

      // Update totals
      summary.total_regular_hours += entry.regular_hours;
      summary.total_overtime_hours += entry.overtime_hours;
      summary.total_doubletime_hours += entry.doubletime_hours;
      summary.total_holiday_hours += entry.holiday_hours;
      summary.total_sick_hours += entry.sick_hours;
      summary.total_vacation_hours += entry.vacation_hours;
      summary.total_hours += entry.total_hours;
    });

    // Sort daily entries by date
    grouped.forEach(summary => {
      summary.daily_entries.sort((a, b) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime());
    });

    return Array.from(grouped.values()).sort((a, b) => 
      new Date(b.pay_period_start).getTime() - new Date(a.pay_period_start).getTime()
    );
  }, [timecardData, selectedEmployee, searchTerm]);

  // Format time for display
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '--';
    
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  // Format hours for display
  const formatHours = (hours: number): string => {
    return hours.toFixed(2);
  };

  // Export functions
  const exportToCSVHandler = () => {
    const exportData = payPeriodSummaries.flatMap(summary => 
      summary.daily_entries.map(entry => ({
        'Employee Name': summary.employee_name,
        'Employee Code': summary.employee_code,
        'Department': summary.department,
        'Supervisor': summary.supervisor,
        'Pay Period': `${summary.pay_period_start} to ${summary.pay_period_end}`,
        'Work Date': entry.work_date,
        'Day of Week': entry.day_of_week,
        'Clock In': formatTime(entry.clock_in),
        'Clock Out': formatTime(entry.clock_out),
        'Regular Hours': formatHours(entry.regular_hours),
        'Overtime Hours': formatHours(entry.overtime_hours),
        'Total Hours': formatHours(entry.total_hours),
        'Approval Status': entry.approval_status,
        'Notes': entry.notes || ''
      }))
    );

    exportToCSV(exportData, `${branding?.legalName || 'ETLA'}_Timecards_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcelHandler = () => {
    const exportData = payPeriodSummaries.flatMap(summary => 
      summary.daily_entries.map(entry => ({
        'Employee Name': summary.employee_name,
        'Employee Code': summary.employee_code,
        'Department': summary.department,
        'Supervisor': summary.supervisor,
        'Pay Period': `${summary.pay_period_start} to ${summary.pay_period_end}`,
        'Work Date': entry.work_date,
        'Day of Week': entry.day_of_week,
        'Clock In': formatTime(entry.clock_in),
        'Clock Out': formatTime(entry.clock_out),
        'Regular Hours': formatHours(entry.regular_hours),
        'Overtime Hours': formatHours(entry.overtime_hours),
        'Total Hours': formatHours(entry.total_hours),
        'Approval Status': entry.approval_status,
        'Notes': entry.notes || ''
      }))
    );

    exportToExcel(exportData, `${branding?.legalName || 'ETLA'}_Timecards_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header with branding */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {branding?.legalName || 'ETLA Platform'} - Timecard Details
          </h2>
          <p className="text-gray-600">Daily time tracking with pay period summaries</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSVHandler} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToExcelHandler} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="All periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All periods</SelectItem>
                  {payPeriods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search employees, departments..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timecard Grids */}
      <div className="space-y-6">
        {payPeriodSummaries.map((summary, index) => (
          <Card key={`${summary.employee_id}-${summary.pay_period_start}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {summary.employee_name} ({summary.employee_code})
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {summary.department}
                    </span>
                    <span>Supervisor: {summary.supervisor}</span>
                    <span>Period: {summary.pay_period_start} to {summary.pay_period_end}</span>
                  </div>
                </div>
                <Badge variant="outline">
                  {formatHours(summary.total_hours)} total hours
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Daily Time Grid */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Work Date
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Day
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Clock In
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                        Clock Out
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium text-gray-700">
                        Regular Hours
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium text-gray-700">
                        OT Hours
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium text-gray-700">
                        Total Hours
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.daily_entries.map((entry, dayIndex) => (
                      <tr key={`${entry.work_date}-${dayIndex}`} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900">
                          {new Date(entry.work_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          {entry.day_of_week}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          {formatTime(entry.clock_in)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          {formatTime(entry.clock_out)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900 text-right">
                          {formatHours(entry.regular_hours)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900 text-right">
                          {formatHours(entry.overtime_hours)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 text-right">
                          {formatHours(entry.total_hours)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          <Badge 
                            variant={entry.approval_status === 'approved' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {entry.approval_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Pay Period Totals Row */}
                    <tr className="bg-blue-50 font-medium">
                      <td colSpan={4} className="border border-gray-200 px-3 py-2 text-sm text-gray-900">
                        <strong>Pay Period Totals</strong>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900 text-right">
                        <strong>{formatHours(summary.total_regular_hours)}</strong>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900 text-right">
                        <strong>{formatHours(summary.total_overtime_hours)}</strong>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900 text-right">
                        <strong>{formatHours(summary.total_hours)}</strong>
                      </td>
                      <td className="border border-gray-200 px-3 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Additional Hours Breakdown */}
              {(summary.total_holiday_hours > 0 || summary.total_sick_hours > 0 || summary.total_vacation_hours > 0) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Hours</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {summary.total_holiday_hours > 0 && (
                      <div>
                        <span className="text-gray-600">Holiday Hours:</span>
                        <span className="ml-2 font-medium">{formatHours(summary.total_holiday_hours)}</span>
                      </div>
                    )}
                    {summary.total_sick_hours > 0 && (
                      <div>
                        <span className="text-gray-600">Sick Hours:</span>
                        <span className="ml-2 font-medium">{formatHours(summary.total_sick_hours)}</span>
                      </div>
                    )}
                    {summary.total_vacation_hours > 0 && (
                      <div>
                        <span className="text-gray-600">Vacation Hours:</span>
                        <span className="ml-2 font-medium">{formatHours(summary.total_vacation_hours)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {payPeriodSummaries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timecard data found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
