'use client';

import React, { useState, useEffect } from 'react';
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
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  pay_period: string;
  department: string;
  tenant_id: string;
}

interface SimpleTimecardGridProps {
  tenantId: string;
}

export default function SimpleTimecardGrid({ tenantId }: SimpleTimecardGridProps) {
  const [timecards, setTimecards] = useState<TimecardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setloading] = useState<boolean>(true);
  const { branding } = useCustomerBranding(tenantId);

  // Mock data for demonstration
  useEffect(() => {
    const mockTimecards: TimecardEntry[] = [
      {
        id: '1',
        employee_id: 'emp-1',
        employee_name: 'John Smith',
        work_date: '2024-02-19',
        clock_in: '08:00:00',
        clock_out: '17:00:00',
        regular_hours: 8.0,
        overtime_hours: 0.0,
        total_hours: 8.0,
        pay_period: '2024-02-12 to 2024-02-25',
        department: 'Engineering',
        tenant_id: tenantId
      },
      {
        id: '2',
        employee_id: 'emp-1',
        employee_name: 'John Smith',
        work_date: '2024-02-20',
        clock_in: '08:15:00',
        clock_out: '18:30:00',
        regular_hours: 8.0,
        overtime_hours: 2.25,
        total_hours: 10.25,
        pay_period: '2024-02-12 to 2024-02-25',
        department: 'Engineering',
        tenant_id: tenantId
      },
      {
        id: '3',
        employee_id: 'emp-2',
        employee_name: 'Sarah Johnson',
        work_date: '2024-02-19',
        clock_in: '09:00:00',
        clock_out: '17:30:00',
        regular_hours: 8.0,
        overtime_hours: 0.5,
        total_hours: 8.5,
        pay_period: '2024-02-12 to 2024-02-25',
        department: 'Marketing',
        tenant_id: tenantId
      }
    ];

    setTimeout(() => {
      setTimecards(mockTimecards);
      setloading(false);
    }, 1000);
  }, [tenantId]);

  // Get unique employees and pay periods
  const employees = Array.from(new Set(timecards.map(t => ({ id: t.employee_id, name: t.employee_name }))))
    .map(emp => ({ id: emp.id, name: emp.name }));
  const payPeriods = Array.from(new Set(timecards.map(t => t.pay_period)));

  // Filter timecards
  const filteredTimecards = timecards.filter(timecard => {
    const matchesSearch = searchTerm === '' || 
      timecard.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timecard.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmployee = selectedEmployee === '' || timecard.employee_id === selectedEmployee;
    const matchesPeriod = selectedPeriod === '' || timecard.pay_period === selectedPeriod;

    return matchesSearch && matchesEmployee && matchesPeriod;
  });

  // Group by employee and pay period for grid display
  const groupedTimecards = filteredTimecards.reduce((acc, timecard) => {
    const key = `${timecard.employee_id}-${timecard.pay_period}`;
    if (!acc[key]) {
      acc[key] = {
        employee_name: timecard.employee_name,
        employee_id: timecard.employee_id,
        pay_period: timecard.pay_period,
        department: timecard.department,
        entries: [],
        totals: { regular_hours: 0, overtime_hours: 0, total_hours: 0 }
      };
    }
    acc[key].entries.push(timecard);
    acc[key].totals.regular_hours += timecard.regular_hours;
    acc[key].totals.overtime_hours += timecard.overtime_hours;
    acc[key].totals.total_hours += timecard.total_hours;
    return acc;
  }, {} as any);

  // Format time for display
  const formatTime = (time: string | null): string => {
    if (!time) return '--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Export functions
  const handleExportCSV = () => {
    const exportData = filteredTimecards.map(timecard => ({
      'Employee Name': timecard.employee_name,
      'Work Date': timecard.work_date,
      'Clock In': formatTime(timecard.clock_in),
      'Clock Out': formatTime(timecard.clock_out),
      'Regular Hours': timecard.regular_hours,
      'Overtime Hours': timecard.overtime_hours,
      'Total Hours': timecard.total_hours,
      'Pay Period': timecard.pay_period,
      'Department': timecard.department
    }));

    exportToCSV(exportData, `${branding?.legalName || 'Company'}_timecards_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    const exportData = filteredTimecards.map(timecard => ({
      'Employee Name': timecard.employee_name,
      'Work Date': timecard.work_date,
      'Clock In': formatTime(timecard.clock_in),
      'Clock Out': formatTime(timecard.clock_out),
      'Regular Hours': timecard.regular_hours,
      'Overtime Hours': timecard.overtime_hours,
      'Total Hours': timecard.total_hours,
      'Pay Period': timecard.pay_period,
      'Department': timecard.department
    }));

    exportToExcel(exportData, `${branding?.legalName || 'Company'}_timecards_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timecard Grid - {branding?.displayName || 'Company'}</h2>
          <p className="text-gray-600">Daily timecard breakdown with pay period totals</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search employees or departments..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                    {emp.name}
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
                {payPeriods.map(period => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timecard Grid */}
      <div className="space-y-6">
        {Object.values(groupedTimecards).map((group: any) => (
          <Card key={`${group.employee_id}-${group.pay_period}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {group.employee_name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {group.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {group.pay_period}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Pay Period Totals</div>
                  <div className="flex gap-4 text-sm">
                    <span>Regular: <strong>{group.totals.regular_hours.toFixed(2)}h</strong></span>
                    <span>OT: <strong>{group.totals.overtime_hours.toFixed(2)}h</strong></span>
                    <span>Total: <strong>{group.totals.total_hours.toFixed(2)}h</strong></span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Work Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Clock In</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Clock Out</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Regular Hours</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">OT Hours</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry: TimecardEntry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(entry.work_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatTime(entry.clock_in)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatTime(entry.clock_out)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {entry.regular_hours.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {entry.overtime_hours.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {entry.total_hours.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {/* Pay Period Totals Row */}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-medium">
                      <td className="py-3 px-4 text-gray-900">Pay Period Totals</td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {group.totals.regular_hours.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {group.totals.overtime_hours.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-bold">
                        {group.totals.total_hours.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedTimecards).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No timecard data found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedEmployee || selectedPeriod 
                ? "Try adjusting your filters to see timecard data."
                : "No timecard entries are available for this tenant."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
