/**
 * Enhanced Timecard Grid Component with Advanced Grid Layout
 * Features: Interactive filtering, sorting, bulk actions, and advanced export options
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { exportUtils, TimecardGridRow } from '@/utils/exportUtils';
import { brandingService } from '@/services/brandingService';
import { 
  Download, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc,
  CheckSquare,
  Square,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';

interface TimecardData {
  id: string;
  employee_id: string;
  employee_name: string;
  work_date: string;
  clock_in?: string;
  clock_out?: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  notes?: string;
  status: 'approved' | 'pending' | 'rejected';
  department?: string;
  project?: string;
}

interface EnhancedTimecardGridProps {
  data?: TimecardData[];
  loading?: boolean;
  onRefresh?: () => void;
  onEdit?: (timecard: TimecardData) => void;
  onDelete?: (timecardId: string) => void;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  tenantId: string;
  showBulkActions?: boolean;
  showFilters?: boolean;
}

type SortField = 'employee_name' | 'work_date' | 'total_hours' | 'status' | 'department';
type SortDirection = 'asc' | 'desc';

export default function EnhancedTimecardGrid({
  data = [],
  loading = false,
  onRefresh,
  onEdit,
  onDelete,
  onBulkAction,
  tenantId,
  showBulkActions = true,
  showFilters = true
}: EnhancedTimecardGridProps) {
  const [customerName, setCustomerName] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('work_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Load customer branding
  useEffect(() => {
    brandingService.getCustomerLegalName(tenantId)
      .then(setCustomerName)
      .catch(console.error);
  }, [tenantId]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = Array.from(new Set(data.map(item => item.department).filter(Boolean)));
    return depts.sort();
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.project?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'work_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, statusFilter, departmentFilter, sortField, sortDirection]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const employeeSet = new Set<string>();
    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    let pendingEntries = 0;
    let approvedEntries = 0;
    let rejectedEntries = 0;

    filteredAndSortedData.forEach(item => {
      employeeSet.add(item.employee_id);
      totalHours += item.total_hours;
      regularHours += item.regular_hours;
      overtimeHours += item.overtime_hours;
      if (item.status === 'pending') pendingEntries += 1;
      if (item.status === 'approved') approvedEntries += 1;
      if (item.status === 'rejected') rejectedEntries += 1;
    });

    const stats = {
      totalEmployees: employeeSet.size,
      totalHours,
      regularHours,
      overtimeHours,
      pendingEntries,
      approvedEntries,
      rejectedEntries
    };
    
    return {
      ...stats,
      averageHoursPerEmployee: stats.totalEmployees > 0 ? stats.totalHours / stats.totalEmployees : 0
    };
  }, [filteredAndSortedData]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedData.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedIds.length > 0) {
      onBulkAction(action, selectedIds);
      setSelectedIds([]);
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExportLoading(true);
    
    try {
      const exportData = filteredAndSortedData.map(item => ({
        workDate: item.work_date,
        date: item.work_date,
        employeeName: item.employee_name,
        department: item.department || '',
        project: item.project || '',
        clockIn: item.clock_in || '',
        clockOut: item.clock_out || '',
        regularHours: item.regular_hours,
        overtimeHours: item.overtime_hours,
        totalHours: item.total_hours,
        status: item.status,
        notes: item.notes || ''
      }));

      const filename = exportUtils.generateExportFilename(
        `enhanced_timecard_grid_${new Date().toISOString().split('T')[0]}`,
        format
      );

      await exportUtils.exportTimecardGrid(exportData, filename.replace(`.${format}`, ''));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

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

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Employees</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.totalEmployees}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total Hours</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.totalHours.toFixed(1)}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Overtime</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.overtimeHours.toFixed(1)}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Avg/Employee</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.averageHoursPerEmployee.toFixed(1)}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.pendingEntries}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Approved</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.approvedEntries}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees, notes, projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {showBulkActions && selectedIds.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                >
                  Reject
                </Button>
              </div>
            )}

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Data Grid */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                {showBulkActions && (
                  <th className="text-left py-3 px-4 w-12">
                    <button onClick={handleSelectAll}>
                      {selectedIds.length === filteredAndSortedData.length && filteredAndSortedData.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                )}
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('employee_name')}
                    className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Employee
                    {sortField === 'employee_name' && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('work_date')}
                    className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Date
                    {sortField === 'work_date' && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('department')}
                    className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Department
                    {sortField === 'department' && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Times</th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('total_hours')}
                    className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Hours
                    {sortField === 'total_hours' && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((item) => (
                <tr 
                  key={item.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    selectedIds.includes(item.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {showBulkActions && (
                    <td className="py-3 px-4">
                      <button onClick={() => handleSelectItem(item.id)}>
                        {selectedIds.includes(item.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.employee_name}</div>
                      {item.project && (
                        <div className="text-sm text-gray-500">{item.project}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(item.work_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {item.department && (
                      <Badge variant="outline">{item.department}</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div>{formatTime(item.clock_in)} - {formatTime(item.clock_out)}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm">
                      <div className="font-semibold">{item.total_hours.toFixed(2)}h</div>
                      <div className="text-gray-500">
                        {item.regular_hours.toFixed(1)}r + {item.overtime_hours.toFixed(1)}ot
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No timecard entries found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
