'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Employee {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  position: string;
  home_department: string;
  employment_status: string;
  employment_type: string;
  work_location: string;
  pay_period_salary: number;
  hourly_rate: number;
  pay_type: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
}

interface PayStatement {
  id: string;
  customer_id: string;
  employee_code: string;
  employee_name: string;
  pay_date: string;
  gross_pay: number;
  net_pay: number;
  created_at: string;
}

interface JobSummary {
  position: string;
  department: string;
  employment_type: string;
  location: string;
  count: number;
}

interface Timecard {
  id: string;
  customer_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  work_date: string;
  total_hours: number;
  regular_hours: number;
  department: string;
}

export default function ReportingPage() {
  const { user } = useAuth();
  const { selectedTenant } = useTenant();
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [checksData, setChecksData] = useState<PayStatement[]>([]);
  const [jobsData, setJobsData] = useState<JobSummary[]>([]);
  const [salaryData, setSalaryData] = useState<Employee[]>([]);
  const [timecardsData, setTimecardsData] = useState<Timecard[]>([]);

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    department: '',
    employeeStatus: '',
    location: '',
    jobTitle: '',
    payType: '',
    salaryRange: { min: '', max: '' }
  });

  // Load data based on active tab
  const loadTabData = async (tabId: string) => {
    if (!selectedTenant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      switch (tabId) {
        case 'employees':
          await loadEmployeeData();
          break;
        case 'checks':
          await loadChecksData();
          break;
        case 'jobs':
          await loadJobsData();
          break;
        case 'salary':
          await loadSalaryData();
          break;
        case 'timecards':
          await loadTimecardsData();
          break;
        case 'all-reports':
          await loadAllReportsData();
          break;
      }
    } catch (err) {
      console.error(`Error loading ${tabId} data:`, err);
      setError(`Failed to load ${tabId} data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Employee data loading
  const loadEmployeeData = async () => {
    if (!selectedTenant?.id) return;
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('customer_id', selectedTenant.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setEmployeeData(data || []);
  };

  // Checks data loading (pay statements)
  const loadChecksData = async () => {
    if (!selectedTenant?.id) return;
    
    const { data, error } = await supabase
      .from('pay_statements')
      .select('*')
      .eq('customer_id', selectedTenant.id)
      .order('pay_date', { ascending: false });
    
    if (error) throw error;
    setChecksData(data || []);
  };

  // Jobs data loading
  const loadJobsData = async () => {
    if (!selectedTenant?.id) return;
    
    const { data, error } = await supabase
      .from('employees')
      .select('position, home_department, employment_type, work_location, customer_id')
      .eq('customer_id', selectedTenant.id)
      .not('position', 'is', null);
    
    if (error) throw error;
    
    // Group by job characteristics
    const jobSummary = data.reduce((acc: Record<string, JobSummary>, emp: any) => {
      const key = `${emp.position}-${emp.home_department}`;
      if (!acc[key]) {
        acc[key] = {
          position: emp.position,
          department: emp.home_department,
          employment_type: emp.employment_type,
          location: emp.work_location,
          count: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, JobSummary>);
    
    setJobsData(Object.values(jobSummary));
  };

  // Salary data loading
  const loadSalaryData = async () => {
    if (!selectedTenant?.id) return;
    
    const { data, error } = await supabase
      .from('employees')
      .select('employee_name, employee_code, position, pay_period_salary, hourly_rate, pay_type, home_department')
      .eq('customer_id', selectedTenant.id)
      .not('pay_period_salary', 'is', null);
    
    if (error) throw error;
    setSalaryData(data || []);
  };

  // Timecards data loading
  const loadTimecardsData = async () => {
    if (!selectedTenant?.id) return;
    
    const { data, error } = await supabase
      .from('timecards')
      .select('*')
      .eq('customer_id', selectedTenant.id)
      .order('work_date', { ascending: false });
    
    if (error) throw error;
    setTimecardsData(data || []);
  };

  // All reports data loading
  const loadAllReportsData = async () => {
    if (!selectedTenant?.id) return;
    
    // Load all data types for comprehensive reporting
    await Promise.all([
      loadEmployeeData(),
      loadChecksData(),
      loadJobsData(),
      loadSalaryData(),
      loadTimecardsData()
    ]);
  };

  // Load data when tab changes or tenant changes
  useEffect(() => {
    if (selectedTenant?.id) {
      loadTabData(activeTab);
    }
  }, [activeTab, selectedTenant?.id]);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'employees': return employeeData;
      case 'checks': return checksData;
      case 'jobs': return jobsData;
      case 'salary': return salaryData;
      case 'timecards': return timecardsData;
      case 'all-reports': return {
        employees: employeeData,
        checks: checksData,
        jobs: jobsData,
        salary: salaryData,
        timecards: timecardsData
      };
      default: return [];
    }
  };

  // Apply filters to data
  const applyFilters = (data: any[]) => {
    if (!Array.isArray(data)) return [];
    
    return data.filter((item: any) => {
      // Search term filter
      if (searchTerm) {
        const searchFields = ['employee_name', 'employee_code', 'position', 'home_department', 'employment_status'];
        const matchesSearch = searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!matchesSearch) return false;
      }

      // Department filter
      if (filters.department && item.home_department !== filters.department) {
        return false;
      }

      // Employee status filter
      if (filters.employeeStatus && item.employment_status !== filters.employeeStatus) {
        return false;
      }

      // Location filter
      if (filters.location && item.work_location !== filters.location) {
        return false;
      }

      // Job title filter
      if (filters.jobTitle && !item.position?.toLowerCase().includes(filters.jobTitle.toLowerCase())) {
        return false;
      }

      // Pay type filter
      if (filters.payType && item.pay_type !== filters.payType) {
        return false;
      }

      // Salary range filter
      if (filters.salaryRange.min && item.pay_period_salary < parseFloat(filters.salaryRange.min)) {
        return false;
      }
      if (filters.salaryRange.max && item.pay_period_salary > parseFloat(filters.salaryRange.max)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const itemDate = new Date(item.created_at || item.pay_date || item.work_date);
        if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      return true;
    });
  };

  // Download CSV
  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Download JSON
  const downloadJSON = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currentData = getCurrentData();
  const filteredData = Array.isArray(currentData) ? applyFilters(currentData) : currentData;

  // Tab configuration
  const tabs = [
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'checks', label: 'Checks', icon: '💰' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'salary', label: 'Salary', icon: '💵' },
    { id: 'timecards', label: 'Timecards', icon: '⏰' },
    { id: 'all-reports', label: 'All Reports', icon: '📊' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comprehensive Reporting System</h1>
        <p className="text-gray-600">Generate detailed reports and extract data across all categories</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Data Extraction Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <Input
                type="text"
                placeholder="Department"
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>

            {/* Employee Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.employeeStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, employeeStatus: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Terminated">Terminated</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input
                type="text"
                placeholder="Work Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <Input
                type="text"
                placeholder="Position"
                value={filters.jobTitle}
                onChange={(e) => setFilters(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>

            {/* Pay Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.payType}
                onChange={(e) => setFilters(prev => ({ ...prev, payType: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="salary">Salary</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <Input
                type="number"
                placeholder="Minimum salary"
                value={filters.salaryRange.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, min: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <Input
                type="number"
                placeholder="Maximum salary"
                value={filters.salaryRange.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, max: e.target.value }
                }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilters({
                dateRange: { start: '', end: '' },
                department: '',
                employeeStatus: '',
                location: '',
                jobTitle: '',
                payType: '',
                salaryRange: { min: '', max: '' }
              })}
              variant="outline"
            >
              Clear Filters
            </Button>
            
            {Array.isArray(filteredData) && filteredData.length > 0 && (
              <>
                <Button
                  onClick={() => downloadCSV(filteredData, `${activeTab}_report.csv`)}
                  variant="outline"
                >
                  Export CSV
                </Button>
                <Button
                  onClick={() => downloadJSON(filteredData, `${activeTab}_report.json`)}
                  variant="outline"
                >
                  Export JSON
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="mb-6">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {activeTab} data...</p>
          </div>
        </Card>
      )}

      {/* Data Display */}
      {!loading && !error && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {tabs.find(tab => tab.id === activeTab)?.label} Report
              </h3>
              <Badge variant="secondary">
                {Array.isArray(filteredData) ? filteredData.length : 'Multiple'} records
              </Badge>
            </div>

            {/* Data Table */}
            {Array.isArray(filteredData) && filteredData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(filteredData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(item).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'all-reports' && typeof filteredData === 'object' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Employees</h4>
                    <p className="text-2xl font-bold text-blue-600">{(filteredData as any).employees?.length || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900">Pay Statements</h4>
                    <p className="text-2xl font-bold text-green-600">{(filteredData as any).checks?.length || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Job Categories</h4>
                    <p className="text-2xl font-bold text-purple-600">{(filteredData as any).jobs?.length || 0}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900">Salary Records</h4>
                    <p className="text-2xl font-bold text-yellow-600">{(filteredData as any).salary?.length || 0}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900">Timecards</h4>
                    <p className="text-2xl font-bold text-red-600">{(filteredData as any).timecards?.length || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available for the selected filters.</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

