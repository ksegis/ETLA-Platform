'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, Download, Clock, User, Building, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { useCustomerBranding } from 'services/brandingService';
import { exportToExcel } from 'utils/exportUtils';
import timecardService, { TimecardDailySummaryV2, TimecardFilters } from 'services/timecardService';

interface SimpleTimecardGridProps {
  tenantId: string;
}

type GroupedTimecards = Record<
  string,
  {
    employee_name: string;
    employee_ref: string;
    entries: TimecardDailySummaryV2[];
    totals: {
      regular_hours: number;
      ot_hours: number;
      dt_hours: number;
      total_hours: number;
    };
  }
>;

export default function SimpleTimecardGrid({ tenantId }: SimpleTimecardGridProps) {
  const [timecards, setTimecards] = useState<TimecardDailySummaryV2[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<
    Array<{
      employee_ref: string;
      employee_name: string;
      employee_id?: string;
      employee_code?: string;
    }>
  >([]);

  const { branding } = useCustomerBranding(tenantId);

  // Initialize dates to current week
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      const employeesData = await timecardService.getEmployees(tenantId);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees');
    }
  }, [tenantId]);

  const loadTimecards = useCallback(async () => {
    if (!tenantId || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const filters: TimecardFilters = {
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        ...(selectedEmployee ? { employee_ref: selectedEmployee } : {}),
      };

      const data = await timecardService.getDailySummaries(filters);
      setTimecards(data);
    } catch (err) {
      console.error('Error loading timecards:', err);
      setError('Failed to load timecard data');
    } finally {
      setLoading(false);
    }
  }, [tenantId, startDate, endDate, selectedEmployee]);

  // Load employees when tenant changes
  useEffect(() => {
    if (tenantId) {
      loadEmployees();
    }
  }, [tenantId, loadEmployees]);

  // Load data when filters change
  useEffect(() => {
    if (tenantId && startDate && endDate) {
      loadTimecards();
    }
  }, [tenantId, startDate, endDate, selectedEmployee, loadTimecards]);

  // Filter timecards based on search term
  const filteredTimecards = timecards.filter(
    (t) =>
      !searchTerm ||
      t.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employee_ref?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group by employee for grid display
  const groupedTimecards: GroupedTimecards = filteredTimecards.reduce((acc, t) => {
    const key = t.employee_ref;
    if (!acc[key]) {
      acc[key] = {
        employee_name: t.employee_name,
        employee_ref: t.employee_ref,
        entries: [],
        totals: { regular_hours: 0, ot_hours: 0, dt_hours: 0, total_hours: 0 },
      };
    }
    acc[key].entries.push(t);
    acc[key].totals.regular_hours += t.regular_hours || 0;
    acc[key].totals.ot_hours += t.ot_hours || 0;
    acc[key].totals.dt_hours += t.dt_hours || 0;
    acc[key].totals.total_hours += t.total_hours || 0;
    return acc;
  }, {} as GroupedTimecards);

  // Format time for display
  const formatTime = (time: string | null): string => {
    if (!time) return '--';
    return time.substring(0, 5); // handle HH:MM or HH:MM:SS
  };

  // Export: CSV (download directly from returned CSV string)
  const handleExportCSV = async () => {
    try {
      const filters: TimecardFilters = {
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        ...(selectedEmployee ? { employee_ref: selectedEmployee } : {}),
      };

      const csvData = await timecardService.exportToCSV(filters);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${branding?.legalName || 'Company'}_timecards_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV');
    }
  };

  // Export: Excel (transform array to worksheet via helper)
  const handleExportExcel = async () => {
    try {
      const filters: TimecardFilters = {
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        ...(selectedEmployee ? { employee_ref: selectedEmployee } : {}),
      };

      const data = await timecardService.exportToExcel(filters);
      const exportData = data.map((tc) => ({
        'Employee Name': tc.employee_name,
        'Employee Ref': tc.employee_ref,
        'Work Date': tc.work_date,
        'First Clock In': formatTime(tc.first_clock_in),
        'Mid Clock Out': formatTime(tc.mid_clock_out),
        'Mid Clock In': formatTime(tc.mid_clock_in),
        'Last Clock Out': formatTime(tc.last_clock_out),
        'Regular Hours': tc.regular_hours?.toFixed(2) || '0.00',
        'OT Hours': tc.ot_hours?.toFixed(2) || '0.00',
        'DT Hours': tc.dt_hours?.toFixed(2) || '0.00',
        'Total Hours': tc.total_hours?.toFixed(2) || '0.00',
        'Is Corrected': tc.is_corrected ? 'Yes' : 'No',
        'Corrected By': tc.corrected_by || '',
        'Correction Reason': tc.correction_reason || '',
      }));

      exportToExcel(
        exportData,
        `${branding?.legalName || 'Company'}_timecards_${startDate}_to_${endDate}.xlsx`,
      );
    } catch (err) {
      console.error('Error exporting Excel:', err);
      setError('Failed to export Excel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Timecard Grid - {branding?.displayName || 'Company'}
          </h2>
          <p className="text-gray-600">Daily timecard breakdown with all clock punches and totals</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" disabled={filteredTimecards.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportExcel} variant="outline" disabled={filteredTimecards.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employee_ref} value={employee.employee_ref}>
                      {employee.employee_name} ({employee.employee_ref})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button onClick={loadTimecards} disabled={loading || !startDate || !endDate}>
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timecard Grid */}
      <div className="space-y-6">
        {Object.values(groupedTimecards).map((group) => (
          <Card key={group.employee_ref}>
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
                      {group.employee_ref}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {startDate} to {endDate}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Period Totals</div>
                  <div className="flex gap-4 text-sm">
                    <span>
                      Regular: <strong>{group.totals.regular_hours.toFixed(2)}h</strong>
                    </span>
                    <span>
                      OT: <strong>{group.totals.ot_hours.toFixed(2)}h</strong>
                    </span>
                    <span>
                      DT: <strong>{group.totals.dt_hours.toFixed(2)}h</strong>
                    </span>
                    <span>
                      Total: <strong>{group.totals.total_hours.toFixed(2)}h</strong>
                    </span>
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
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Clock In</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Clock Out</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Regular Hrs</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">OT Hrs</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">DT Hrs</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Hrs</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry) => (
                      <tr key={`${entry.employee_ref}-${entry.work_date}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(entry.work_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{formatTime(entry.first_clock_in)}</td>
                        <td className="py-3 px-4 text-gray-700">{formatTime(entry.mid_clock_out)}</td>
                        <td className="py-3 px-4 text-gray-700">{formatTime(entry.mid_clock_in)}</td>
                        <td className="py-3 px-4 text-gray-700">{formatTime(entry.last_clock_out)}</td>
                        <td className="py-3 px-4 text-right text-gray-700 font-mono">
                          {(entry.regular_hours || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-mono">
                          {(entry.ot_hours || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-mono">
                          {(entry.dt_hours || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 font-mono">
                          {(entry.total_hours || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {entry.is_corrected ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                    Corrected
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm">
                                    <div>
                                      <strong>Corrected by:</strong> {entry.corrected_by}
                                    </div>
                                    <div>
                                      <strong>Corrected at:</strong>{' '}
                                      {entry.corrected_at ? new Date(entry.corrected_at).toLocaleString() : 'Unknown'}
                                    </div>
                                    {entry.correction_reason && (
                                      <div>
                                        <strong>Reason:</strong> {entry.correction_reason}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Calculated
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Period Totals Row */}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-medium">
                      <td className="py-3 px-4 text-gray-900">Period Totals</td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-right text-gray-900 font-mono">
                        {group.totals.regular_hours.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-mono">
                        {group.totals.ot_hours.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-mono">
                        {group.totals.dt_hours.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-bold font-mono">
                        {group.totals.total_hours.toFixed(2)}
                      </td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedTimecards).length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No timecard data found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedEmployee
                ? 'Try adjusting your filters to see timecard data.'
                : 'No timecard entries are available for the selected date range.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}







