'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
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
    return Array.from(uniqueEmployees.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [timecardData]);

  // Get unique departments
  const departments = useMemo(() => {
    return Array.from(new Set(timecardData.map(entry => entry.department))).sort();
  }, [timecardData]);

  // Filter timecard data
  const filteredData = useMemo(() => {
    let filtered = timecardData;

    if (selectedEmployee) {
      filtered = filtered.filter(entry => entry.employee_id === selectedEmployee);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.employee_name.toLowerCase().includes(term) ||
        entry.employee_code.toLowerCase().includes(term) ||
        entry.department.toLowerCase().includes(term) ||
        entry.supervisor.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => new Date(b.work_date).getTime() - new Date(a.work_date).getTime());
  }, [timecardData, selectedEmployee, searchTerm]);

  // Generate pay period summaries
  const payPeriodSummaries = useMemo(() => {
    const summaries = new Map<string, PayPeriodSummary>();

    filteredData.forEach(entry => {
      const key = `${entry.employee_id}-${entry.work_date.substring(0, 7)}`; // Group by employee and month
      
      if (!summaries.has(key)) {
        summaries.set(key, {
          employee_id: entry.employee_id,
          employee_name: entry.employee_name,
          employee_code: entry.employee_code,
          department: entry.department,
          supervisor: entry.supervisor,
          pay_period_start: entry.work_date,
          pay_period_end: entry.work_date,
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

      const summary = summaries.get(key)!;
      summary.total_regular_hours += entry.regular_hours;
      summary.total_overtime_hours += entry.overtime_hours;
      summary.total_doubletime_hours += entry.doubletime_hours;
      summary.total_holiday_hours += entry.holiday_hours;
      summary.total_sick_hours += entry.sick_hours;
      summary.total_vacation_hours += entry.vacation_hours;
      summary.total_hours += entry.total_hours;

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

      // Update period dates
      if (entry.work_date < summary.pay_period_start) {
        summary.pay_period_start = entry.work_date;
      }
      if (entry.work_date > summary.pay_period_end) {
        summary.pay_period_end = entry.work_date;
      }
    });

    return Array.from(summaries.values()).sort((a, b) => 
      b.pay_period_start.localeCompare(a.pay_period_start) || 
      a.employee_name.localeCompare(b.employee_name)
    );
  }, [filteredData]);

  // Format time
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '--:--';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format hours
  const formatHours = (hours: number): string => {
    return hours.toFixed(2);
  };

  // Get approval status badge variant
  const getApprovalStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Export functions
  const exportToCSVHandler = () => {
    const exportData = filteredData.map(entry => ({
      'Employee Name': entry.employee_name,
      'Employee Code': entry.employee_code,
      'Work Date': new Date(entry.work_date).toLocaleDateString(),
      'Day of Week': entry.day_of_week,
      'Clock In': formatTime(entry.clock_in),
      'Clock Out': formatTime(entry.clock_out),
      'Regular Hours': formatHours(entry.regular_hours),
      'Overtime Hours': formatHours(entry.overtime_hours),
      'Total Hours': formatHours(entry.total_hours),
      'Department': entry.department,
      'Supervisor': entry.supervisor,
      'Approval Status': entry.approval_status,
      'Notes': entry.notes
    }));

    exportToCSV(exportData, `${branding?.legalName || 'ETLA'}_Timecard_Data_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcelHandler = () => {
    const exportData = filteredData.map(entry => ({
      'Employee Name': entry.employee_name,
      'Employee Code': entry.employee_code,
      'Work Date': new Date(entry.work_date).toLocaleDateString(),
      'Day of Week': entry.day_of_week,
      'Clock In': formatTime(entry.clock_in),
      'Clock Out': formatTime(entry.clock_out),
      'Regular Hours': entry.regular_hours,
      'Overtime Hours': entry.overtime_hours,
      'Total Hours': entry.total_hours,
      'Department': entry.department,
      'Supervisor': entry.supervisor,
      'Approval Status': entry.approval_status,
      'Notes': entry.notes
    }));

    exportToExcel(exportData, `${branding?.legalName || 'ETLA'}_Timecard_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header with branding */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {branding?.legalName || 'ETLA Platform'} - Timecard Management
          </h2>
          <p className="text-gray-600">Employee time tracking and pay period summaries</p>
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
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Employee name, code, department..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select 
                value={selectedEmployee} 
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All periods</option>
                <option value="current">Current Period</option>
                <option value="previous">Previous Period</option>
                <option value="last30">Last 30 Days</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pay Period Summaries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Pay Period Summaries</h3>
        
        {payPeriodSummaries.map((summary, index) => (
          <Card key={`${summary.employee_id}-${summary.pay_period_start}`} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    {summary.employee_name} ({summary.employee_code})
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {summary.department} • {summary.supervisor}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(summary.pay_period_start).toLocaleDateString()} - {new Date(summary.pay_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatHours(summary.total_hours)}</p>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              {/* Hours Summary */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Regular</p>
                  <p className="text-lg font-bold text-blue-900">{formatHours(summary.total_regular_hours)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">Overtime</p>
                  <p className="text-lg font-bold text-orange-900">{formatHours(summary.total_overtime_hours)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">Double Time</p>
                  <p className="text-lg font-bold text-red-900">{formatHours(summary.total_doubletime_hours)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Holiday</p>
                  <p className="text-lg font-bold text-green-900">{formatHours(summary.total_holiday_hours)}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-600 font-medium">Sick</p>
                  <p className="text-lg font-bold text-yellow-900">{formatHours(summary.total_sick_hours)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">Vacation</p>
                  <p className="text-lg font-bold text-purple-900">{formatHours(summary.total_vacation_hours)}</p>
                </div>
              </div>

              {/* Daily Entries Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Day</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Clock In</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Clock Out</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Regular</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Overtime</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Total</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Status</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.daily_entries
                      .sort((a, b) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime())
                      .map((entry, entryIndex) => (
                      <tr key={entryIndex} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3">{new Date(entry.work_date).toLocaleDateString()}</td>
                        <td className="py-2 px-3">{entry.day_of_week}</td>
                        <td className="py-2 px-3">{formatTime(entry.clock_in)}</td>
                        <td className="py-2 px-3">{formatTime(entry.clock_out)}</td>
                        <td className="py-2 px-3 text-right">{formatHours(entry.regular_hours)}</td>
                        <td className="py-2 px-3 text-right">{formatHours(entry.overtime_hours)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatHours(entry.total_hours)}</td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant={getApprovalStatusVariant(entry.approval_status)} className="text-xs">
                            {entry.approval_status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-600">{entry.notes || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {payPeriodSummaries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timecard data found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
