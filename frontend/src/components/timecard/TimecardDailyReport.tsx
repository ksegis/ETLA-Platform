'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Calendar, 
  Download, 
  Clock, 
  User, 
  Building, 
  FileSpreadsheet, 
  Edit3,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { timecardService, TimecardDailySummary, GetDailySummariesParams } from '@/services/timecardService';
import CorrectionModal from './CorrectionModal';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

interface TimecardDailyReportProps {
  className?: string;
}

export default function TimecardDailyReport({ className = '' }: TimecardDailyReportProps) {
  const { user } = useAuth();
  const { selectedTenant: contextTenant } = useTenant();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<TimecardDailySummary[]>([]);
  const [employees, setEmployees] = useState<Array<{
    employee_ref: string;
    employee_name: string;
    employee_code: string;
  }>>([]);
  const [tenants, setTenants] = useState<Array<{
    id: string;
    name: string;
    legal_name: string;
  }>>([]);

  // Filters
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Correction modal
  const [correctionModal, setCorrectionModal] = useState<{
    isOpen: boolean;
    tenantId: string;
    employeeRef: string;
    employeeName: string;
    workDate: string;
  }>({
    isOpen: false,
    tenantId: '',
    employeeRef: '',
    employeeName: '',
    workDate: ''
  });

  // Check user permissions
  const isHostAdmin = user?.role === 'host_admin';
  const canCorrect = ['host_admin', 'tenant_admin', 'payroll_manager'].includes(user?.role || '');

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

  // Set default tenant
  useEffect(() => {
    if (contextTenant && !isHostAdmin) {
      setSelectedTenant(contextTenant.id);
    }
  }, [contextTenant, isHostAdmin]);

  // Load tenants for host admin
  useEffect(() => {
    if (isHostAdmin) {
      loadTenants();
    }
  }, [isHostAdmin]);

  // Load employees when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      loadEmployees();
    }
  }, [selectedTenant]);

  // Load summaries when filters change
  useEffect(() => {
    if (selectedTenant && startDate && endDate) {
      loadSummaries();
    }
  }, [selectedTenant, startDate, endDate, selectedEmployee]);

  const loadTenants = async () => {
    try {
      const data = await timecardService.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
    }
  };

  const loadEmployees = async () => {
    if (!selectedTenant) return;
    
    try {
      const data = await timecardService.getEmployees(selectedTenant);
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const loadSummaries = async () => {
    if (!selectedTenant || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const params: GetDailySummariesParams = {
        tenant_id: selectedTenant,
        start_date: startDate,
        end_date: endDate
      };

      if (selectedEmployee) {
        params.employee_ref = selectedEmployee;
      }

      const data = await timecardService.getDailySummaries(params);
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timecard summaries');
    } finally {
      setLoading(false);
    }
  };

  // Filter summaries by search term
  const filteredSummaries = useMemo(() => {
    if (!searchTerm) return summaries;

    const term = searchTerm.toLowerCase();
    return summaries.filter(summary =>
      summary.employee_name.toLowerCase().includes(term) ||
      summary.employee_code.toLowerCase().includes(term)
    );
  }, [summaries, searchTerm]);

  // Format time
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5);
  };

  // Format hours
  const formatHours = (hours: number): string => {
    return hours.toFixed(2);
  };

  // Handle correction
  const handleCorrect = (summary: TimecardDailySummary) => {
    setCorrectionModal({
      isOpen: true,
      tenantId: summary.tenant_id,
      employeeRef: summary.employee_ref,
      employeeName: summary.employee_name,
      workDate: summary.work_date
    });
  };

  const handleCorrectionSave = () => {
    setCorrectionModal(prev => ({ ...prev, isOpen: false }));
    // Reload summaries to show updated data
    loadSummaries();
  };

  // Export functions
  const exportToCSVHandler = () => {
    const exportData = filteredSummaries.map(summary => ({
      'Employee Name': summary.employee_name,
      'Employee Code': summary.employee_code,
      'Work Date': new Date(summary.work_date).toLocaleDateString(),
      'First Clock In': formatTime(summary.first_clock_in),
      'Last Clock Out': formatTime(summary.last_clock_out),
      'Regular Hours': formatHours(summary.regular_hours),
      'Overtime Hours': formatHours(summary.ot_hours),
      'Double Time Hours': formatHours(summary.dt_hours),
      'Total Hours': formatHours(summary.total_hours),
      'Status': summary.is_corrected ? 'Corrected' : 'Calculated'
    }));

    const tenantName = tenants.find(t => t.id === selectedTenant)?.legal_name || 'Timecard';
    exportToCSV(exportData, `${tenantName}_Daily_Summaries_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcelHandler = () => {
    const exportData = filteredSummaries.map(summary => ({
      'Employee Name': summary.employee_name,
      'Employee Code': summary.employee_code,
      'Work Date': new Date(summary.work_date).toLocaleDateString(),
      'First Clock In': formatTime(summary.first_clock_in),
      'Last Clock Out': formatTime(summary.last_clock_out),
      'Regular Hours': summary.regular_hours,
      'Overtime Hours': summary.ot_hours,
      'Double Time Hours': summary.dt_hours,
      'Total Hours': summary.total_hours,
      'Status': summary.is_corrected ? 'Corrected' : 'Calculated'
    }));

    const tenantName = tenants.find(t => t.id === selectedTenant)?.legal_name || 'Timecard';
    exportToExcel(exportData, `${tenantName}_Daily_Summaries_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timecard Daily Summaries</h2>
          <p className="text-gray-600">View and correct daily timecard summaries</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSummaries} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportToCSVHandler} variant="outline" size="sm" disabled={!filteredSummaries.length}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToExcelHandler} variant="outline" size="sm" disabled={!filteredSummaries.length}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tenant Selector (only for host_admin) */}
            {isHostAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select tenant...</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.legal_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All employees</option>
                {employees.map(emp => (
                  <option key={emp.employee_ref} value={emp.employee_ref}>
                    {emp.employee_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <Clock className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daily Summaries ({filteredSummaries.length})</span>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSummaries.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              {selectedTenant && startDate && endDate ? 
                'No timecard summaries found for the selected criteria.' :
                'Please select a tenant and date range to view summaries.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-medium text-gray-700">Employee</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-700">First Clock In</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-700">Last Clock Out</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-700">Regular</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-700">Overtime</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-700">Double Time</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-700">Total</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-700">Status</th>
                    {canCorrect && (
                      <th className="text-center py-3 px-3 font-medium text-gray-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredSummaries.map((summary, index) => (
                    <tr key={`${summary.employee_ref}-${summary.work_date}`} 
                        className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-medium text-gray-900">{summary.employee_name}</div>
                          <div className="text-xs text-gray-500">{summary.employee_code}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {new Date(summary.work_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">{formatTime(summary.first_clock_in)}</td>
                      <td className="py-3 px-3">{formatTime(summary.last_clock_out)}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatHours(summary.regular_hours)}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatHours(summary.ot_hours)}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatHours(summary.dt_hours)}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">{formatHours(summary.total_hours)}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={summary.is_corrected ? 'default' : 'secondary'}>
                          {summary.is_corrected ? 'Corrected' : 'Calculated'}
                        </Badge>
                      </td>
                      {canCorrect && (
                        <td className="py-3 px-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCorrect(summary)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correction Modal */}
      <CorrectionModal
        isOpen={correctionModal.isOpen}
        onClose={() => setCorrectionModal(prev => ({ ...prev, isOpen: false }))}
        tenantId={correctionModal.tenantId}
        employeeRef={correctionModal.employeeRef}
        employeeName={correctionModal.employeeName}
        workDate={correctionModal.workDate}
        onSave={handleCorrectionSave}
        currentUserId={user?.id || ''}
      />
    </div>
  );
}
