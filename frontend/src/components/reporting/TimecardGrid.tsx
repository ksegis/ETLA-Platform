/**
 * Enhanced Timecard Grid Component
 * Displays daily timecard data in a grid format with totals and export functionality
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { exportUtils, TimecardGridRow } from '@/utils/exportUtils';
import { brandingService } from '@/services/brandingService';
import { Download, Calendar, Clock, AlertCircle } from 'lucide-react';

interface TimecardData {
  id: string;
  employee_id: string;
  work_date: string;
  clock_in?: string;
  clock_out?: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  notes?: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface TimecardGridProps {
  employeeId: string;
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  tenantId: string;
  data?: TimecardData[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function TimecardGrid({
  employeeId,
  employeeName,
  payPeriodStart,
  payPeriodEnd,
  tenantId,
  data = [],
  loading = false,
  onRefresh
}: TimecardGridProps) {
  const [customerName, setCustomerName] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);

  // Load customer branding
  useEffect(() => {
    brandingService.getCustomerLegalName(tenantId)
      .then(setCustomerName)
      .catch(console.error);
  }, [tenantId]);

  // Generate daily grid data
  const gridData = useMemo(() => {
    const startDate = new Date(payPeriodStart);
    const endDate = new Date(payPeriodEnd);
    const days: TimecardGridRow[] = [];

    // Create entry for each day in pay period
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const timecardEntry = data.find(entry => entry.work_date === dateStr);

      days.push({
        workDate: dateStr,
        clockIn: timecardEntry?.clock_in || '',
        clockOut: timecardEntry?.clock_out || '',
        regularHours: timecardEntry?.regular_hours || 0,
        overtimeHours: timecardEntry?.overtime_hours || 0,
        totalHours: timecardEntry?.total_hours || 0,
        notes: timecardEntry?.notes || ''
      });
    }

    return days;
  }, [data, payPeriodStart, payPeriodEnd]);

  // Calculate totals
  const totals = useMemo(() => {
    return gridData.reduce(
      (acc, row) => ({
        regularHours: acc.regularHours + row.regularHours,
        overtimeHours: acc.overtimeHours + row.overtimeHours,
        totalHours: acc.totalHours + row.totalHours,
        daysWorked: acc.daysWorked + (row.totalHours > 0 ? 1 : 0)
      }),
      { regularHours: 0, overtimeHours: 0, totalHours: 0, daysWorked: 0 }
    );
  }, [gridData]);

  // Format time display
  const formatTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '--';
    
    try {
      const time = new Date(`2000-01-01T${timeStr}`);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  // Format date display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dayName} ${monthDay}`;
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExportLoading(true);
    
    try {
      const filename = exportUtils.generateFilename(
        `timecard_${employeeName.replace(/\s+/g, '_')}_${payPeriodStart}_${payPeriodEnd}`,
        format
      );

      await exportUtils.exportTimecardGrid(
        gridData,
        {
          startDate: payPeriodStart,
          endDate: payPeriodEnd,
          employeeName,
          employeeId
        },
        {
          filename: filename.replace(`.${format}`, ''),
          customerName,
          includeTimestamp: true
        }
      );
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show a toast notification here
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Time Summary</h3>
            <p className="text-sm text-gray-600">
              Pay Period: {new Date(payPeriodStart).toLocaleDateString()} - {new Date(payPeriodEnd).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-600">Days Worked</div>
            <div className="text-2xl font-bold text-blue-900">{totals.daysWorked}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-600">Regular Hours</div>
            <div className="text-2xl font-bold text-green-900">{totals.regularHours.toFixed(2)}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-orange-600">Overtime Hours</div>
            <div className="text-2xl font-bold text-orange-900">{totals.overtimeHours.toFixed(2)}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-600">Total Hours</div>
            <div className="text-2xl font-bold text-purple-900">{totals.totalHours.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      {/* Timecard Grid */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Work Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Clock In</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Clock Out</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Regular Hours</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">OT Hours</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Total Hours</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
              </tr>
            </thead>
            <tbody>
              {gridData.map((row, index) => {
                const isWeekend = new Date(row.workDate).getDay() === 0 || new Date(row.workDate).getDay() === 6;
                const hasHours = row.totalHours > 0;
                
                return (
                  <tr 
                    key={row.workDate}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      isWeekend ? 'bg-gray-25' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className={`font-medium ${isWeekend ? 'text-gray-500' : 'text-gray-900'}`}>
                          {formatDate(row.workDate)}
                        </span>
                        {isWeekend && (
                          <Badge variant="secondary" className="text-xs">Weekend</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatTime(row.clockIn)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatTime(row.clockOut)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {row.regularHours > 0 ? row.regularHours.toFixed(2) : '--'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {row.overtimeHours > 0 ? (
                        <span className="text-orange-600 font-semibold">
                          {row.overtimeHours.toFixed(2)}
                        </span>
                      ) : '--'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {row.totalHours > 0 ? row.totalHours.toFixed(2) : '--'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {row.notes && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-blue-500" />
                          <span className="truncate max-w-32" title={row.notes}>
                            {row.notes}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {/* Totals Row */}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-4 px-4 text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Pay Period Totals
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-500">--</td>
                <td className="py-4 px-4 text-gray-500">--</td>
                <td className="py-4 px-4 text-right text-green-700 font-bold">
                  {totals.regularHours.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right text-orange-700 font-bold">
                  {totals.overtimeHours.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right text-purple-700 font-bold text-lg">
                  {totals.totalHours.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-gray-600 text-sm">
                  {totals.daysWorked} days worked
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {gridData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No timecard data available for this pay period.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
