import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Building, Download, Printer, Eye } from 'lucide-react';

interface TimecardEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  day_of_week: string;
  time_in: string;
  time_out: string;
  break_duration: number;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  project_code?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface TimecardGridViewProps {
  data: TimecardEntry[];
  onViewFacsimile?: (entry: TimecardEntry) => void;
  onPrintFacsimile?: (entry: TimecardEntry) => void;
  loading?: boolean;
  error?: string | null;
}

export default function TimecardGridView({
  data,
  onViewFacsimile,
  onPrintFacsimile,
  loading,
  error
}: TimecardGridViewProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [filteredData, setFilteredData] = useState<TimecardEntry[]>(data);

  // Get unique employees
  const employees = Array.from(new Set(data.map(entry => entry.employee_name)))
    .map(name => ({
      name,
      id: data.find(entry => entry.employee_name === name)?.employee_id || ''
    }));

  // Get unique weeks
  const weeks = Array.from(new Set(data.map(entry => {
    const date = new Date(entry.date);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
  }))).sort();

  useEffect(() => {
    let filtered = data;

    if (selectedEmployee) {
      filtered = filtered.filter(entry => entry.employee_name === selectedEmployee);
    }

    if (selectedWeek) {
      const weekStart = new Date(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
    }

    setFilteredData(filtered);
  }, [data, selectedEmployee, selectedWeek]);

  // Group data by employee and week
  const groupedData = filteredData.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const weekKey = startOfWeek.toISOString().split('T')[0];
    const employeeKey = entry.employee_name;
    const key = `${employeeKey}-${weekKey}`;

    if (!acc[key]) {
      acc[key] = {
        employee: entry.employee_name,
        employee_id: entry.employee_id,
        weekStart: weekKey,
        entries: {},
        totalHours: 0,
        totalRegular: 0,
        totalOvertime: 0
      };
    }

    const dayOfWeek = date.getDay();
    acc[key].entries[dayOfWeek] = entry;
    acc[key].totalHours += entry.total_hours;
    acc[key].totalRegular += entry.regular_hours;
    acc[key].totalOvertime += entry.overtime_hours;

    return acc;
  }, {} as any);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading timecard data: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Timecard Grid View
            </h3>
            <p className="text-sm text-gray-600">Excel-style timecard layout</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Weeks</option>
              {weeks.map((week) => (
                <option key={week} value={week}>
                  Week of {new Date(week).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {Object.values(groupedData).map((weekData: any) => (
            <div key={`${weekData.employee}-${weekData.weekStart}`} className="border-b border-gray-200 last:border-b-0">
              {/* Employee Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{weekData.employee}</span>
                    <span className="text-sm text-gray-500">ID: {weekData.employee_id}</span>
                    <span className="text-sm text-gray-500">
                      Week of {new Date(weekData.weekStart).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Total: <span className="font-medium">{weekData.totalHours.toFixed(2)}h</span>
                    </span>
                    <span className="text-gray-600">
                      Regular: <span className="font-medium">{weekData.totalRegular.toFixed(2)}h</span>
                    </span>
                    <span className="text-gray-600">
                      Overtime: <span className="font-medium">{weekData.totalOvertime.toFixed(2)}h</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-0">
                {daysOfWeek.map((day, index) => {
                  const entry = weekData.entries[index];
                  const isEmpty = !entry;

                  return (
                    <div
                      key={`${weekData.employee}-${weekData.weekStart}-${index}`}
                      className={`border-r border-gray-200 last:border-r-0 p-4 min-h-[120px] ${
                        isEmpty ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="text-xs font-medium text-gray-500 mb-2 text-center">
                        {day}
                        {entry && (
                          <div className="text-gray-700 mt-1">
                            {new Date(entry.date).getDate()}
                          </div>
                        )}
                      </div>

                      {entry ? (
                        <div className="space-y-2">
                          {/* Time In/Out */}
                          <div className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">In:</span>
                              <span className="font-medium">{formatTime(entry.time_in)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Out:</span>
                              <span className="font-medium">{formatTime(entry.time_out)}</span>
                            </div>
                          </div>

                          {/* Hours */}
                          <div className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Hours:</span>
                              <span className="font-medium">{entry.total_hours.toFixed(1)}</span>
                            </div>
                            {entry.overtime_hours > 0 && (
                              <div className="flex justify-between text-orange-600">
                                <span>OT:</span>
                                <span className="font-medium">{entry.overtime_hours.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* Status */}
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(entry.status)}`}>
                              {entry.status}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => onViewFacsimile?.(entry)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onPrintFacsimile?.(entry)}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                              title="Print"
                            >
                              <Printer className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Project Code */}
                          {entry.project_code && (
                            <div className="text-xs text-center text-gray-500 truncate">
                              {entry.project_code}
                            </div>
                          )}

                          {/* Notes Indicator */}
                          {entry.notes && (
                            <div className="text-center">
                              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" title={entry.notes}></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No Entry
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {Object.keys(groupedData).length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No timecard data available for the selected filters.</p>
        </div>
      )}
    </div>
  );
}
