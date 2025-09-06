'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import ReactECharts from 'echarts-for-react';

const HRPayrollReporting = () => {
  const { user } = useAuth();
  const { selectedTenant } = useTenant();
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states for data extraction
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    department: '',
    employeeStatus: '',
    payPeriod: '',
    jobTitle: '',
    location: '',
    payType: '',
    salaryRange: { min: '', max: '' }
  });

  // Data states
  const [employeeData, setEmployeeData] = useState([]);
  const [checksData, setChecksData] = useState([]);
  const [jobsData, setJobsData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [timecardsData, setTimecardsData] = useState([]);
  const [reportingData, setReportingData] = useState({});

  // Load data based on active tab
  const loadTabData = async (tabId) => {
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
      setError(`Failed to load ${tabId} data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Employee data loading
  const loadEmployeeData = async () => {
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
    const { data, error } = await supabase
      .from('pay_statements')
      .select(`
        *,
        employee:employees(employee_name, employee_code)
      `)
      .eq('customer_id', selectedTenant.id)
      .order('pay_date', { ascending: false });
    
    if (error) throw error;
    setChecksData(data || []);
  };

  // Jobs data loading
  const loadJobsData = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('position, home_department, employment_type, work_location, customer_id')
      .eq('customer_id', selectedTenant.id)
      .not('position', 'is', null);
    
    if (error) throw error;
    
    // Group by job characteristics
    const jobSummary = data.reduce((acc, emp) => {
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
    }, {});
    
    setJobsData(Object.values(jobSummary));
  };

  // Salary data loading
  const loadSalaryData = async () => {
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
    const { data, error } = await supabase
      .from('timecards')
      .select(`
        *,
        employee:employees(employee_name, employee_code)
      `)
      .eq('customer_id', selectedTenant.id)
      .order('work_date', { ascending: false });
    
    if (error) throw error;
    setTimecardsData(data || []);
  };

  // All reports data loading
  const loadAllReportsData = async () => {
    const reports = await Promise.all([
      supabase.from('employee_headcount_monthly').select('*').eq('customer_id', selectedTenant.id),
      supabase.from('employee_status_summary').select('*').eq('customer_id', selectedTenant.id),
      supabase.from('termination_analysis').select('*').eq('customer_id', selectedTenant.id),
      supabase.from('retention_analysis').select('*').eq('customer_id', selectedTenant.id)
    ]);
    
    setReportingData({
      headcount: reports[0].data || [],
      status: reports[1].data || [],
      terminations: reports[2].data || [],
      retention: reports[3].data || []
    });
  };

  // Data extraction function
  const extractData = async (format = 'csv') => {
    const currentData = getCurrentTabData();
    const filteredData = applyFilters(currentData);
    
    if (format === 'csv') {
      downloadCSV(filteredData, `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    } else if (format === 'json') {
      downloadJSON(filteredData, `${activeTab}_report_${new Date().toISOString().split('T')[0]}.json`);
    }
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'employees': return employeeData;
      case 'checks': return checksData;
      case 'jobs': return jobsData;
      case 'salary': return salaryData;
      case 'timecards': return timecardsData;
      case 'all-reports': return reportingData;
      default: return [];
    }
  };

  // Apply filters to data
  const applyFilters = (data) => {
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => {
      // Date range filter
      if (filters.dateRange.start && item.created_at) {
        if (new Date(item.created_at) < new Date(filters.dateRange.start)) return false;
      }
      if (filters.dateRange.end && item.created_at) {
        if (new Date(item.created_at) > new Date(filters.dateRange.end)) return false;
      }
      
      // Department filter
      if (filters.department && item.home_department !== filters.department) return false;
      
      // Employee status filter
      if (filters.employeeStatus && item.employment_status !== filters.employeeStatus) return false;
      
      // Job title filter
      if (filters.jobTitle && !item.position?.toLowerCase().includes(filters.jobTitle.toLowerCase())) return false;
      
      // Location filter
      if (filters.location && item.work_location !== filters.location) return false;
      
      // Pay type filter
      if (filters.payType && item.pay_type !== filters.payType) return false;
      
      // Salary range filter
      if (filters.salaryRange.min && item.pay_period_salary < parseFloat(filters.salaryRange.min)) return false;
      if (filters.salaryRange.max && item.pay_period_salary > parseFloat(filters.salaryRange.max)) return false;
      
      // Search term filter
      if (searchTerm) {
        const searchFields = ['employee_name', 'employee_code', 'position', 'home_department'];
        const matchesSearch = searchFields.some(field => 
          item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  };

  // Download CSV
  const downloadCSV = (data, filename) => {
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
  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter panel component
  const FilterPanel = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🔍 Data Extraction Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
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
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Input
              placeholder="Enter department"
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employee Status</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.employeeStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, employeeStatus: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Terminated">Terminated</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <Input
              placeholder="Enter job title"
              value={filters.jobTitle}
              onChange={(e) => setFilters(prev => ({ ...prev, jobTitle: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              placeholder="Enter location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Salary</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.salaryRange.min}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                salaryRange: { ...prev.salaryRange, min: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Salary</label>
            <Input
              type="number"
              placeholder="999999"
              value={filters.salaryRange.max}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                salaryRange: { ...prev.salaryRange, max: e.target.value }
              }))}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => extractData('csv')}>📊 Export CSV</Button>
          <Button onClick={() => extractData('json')} variant="outline">📄 Export JSON</Button>
          <Button 
            onClick={() => setFilters({
              dateRange: { start: '', end: '' },
              department: '',
              employeeStatus: '',
              payPeriod: '',
              jobTitle: '',
              location: '',
              payType: '',
              salaryRange: { min: '', max: '' }
            })}
            variant="outline"
          >
            🔄 Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Tab content renderers
  const renderEmployeesTab = () => {
    const filteredData = applyFilters(employeeData);
    
    return (
      <div className="space-y-6">
        <FilterPanel />
        <Card>
          <CardHeader>
            <CardTitle>👥 Employee Directory ({filteredData.length} employees)</CardTitle>
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredData.map((employee) => (
                <div key={employee.employee_code} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{employee.employee_name}</div>
                    <div className="text-sm text-gray-600">Code: {employee.employee_code}</div>
                    <div className="text-sm text-gray-600">Position: {employee.position}</div>
                    <div className="text-sm text-gray-600">Department: {employee.home_department}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={employee.employment_status === 'Active' ? 'default' : 'secondary'}>
                      {employee.employment_status}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      {employee.employment_type} • {employee.work_location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderChecksTab = () => {
    const filteredData = applyFilters(checksData);
    
    return (
      <div className="space-y-6">
        <FilterPanel />
        <Card>
          <CardHeader>
            <CardTitle>💰 Pay Statements ({filteredData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredData.map((check, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{check.employee?.employee_name}</div>
                    <div className="text-sm text-gray-600">Pay Date: {check.pay_date}</div>
                    <div className="text-sm text-gray-600">Period: {check.pay_period_start} - {check.pay_period_end}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${check.gross_pay}</div>
                    <div className="text-sm text-gray-600">Net: ${check.net_pay}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderJobsTab = () => {
    const filteredData = applyFilters(jobsData);
    
    return (
      <div className="space-y-6">
        <FilterPanel />
        <Card>
          <CardHeader>
            <CardTitle>💼 Job Analysis ({filteredData.length} job categories)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredData.map((job, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{job.position}</div>
                    <div className="text-sm text-gray-600">Department: {job.department}</div>
                    <div className="text-sm text-gray-600">Type: {job.employment_type}</div>
                  </div>
                  <div className="text-right">
                    <Badge>{job.count} employees</Badge>
                    <div className="text-sm text-gray-600 mt-1">{job.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSalaryTab = () => {
    const filteredData = applyFilters(salaryData);
    
    return (
      <div className="space-y-6">
        <FilterPanel />
        <Card>
          <CardHeader>
            <CardTitle>💵 Salary Analysis ({filteredData.length} employees)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredData.map((employee) => (
                <div key={employee.employee_code} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{employee.employee_name}</div>
                    <div className="text-sm text-gray-600">Position: {employee.position}</div>
                    <div className="text-sm text-gray-600">Department: {employee.home_department}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${employee.pay_period_salary || employee.hourly_rate}/
                      {employee.pay_type === 'Salary' ? 'period' : 'hour'}
                    </div>
                    <Badge variant="outline">{employee.pay_type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTimecardsTab = () => {
    const filteredData = applyFilters(timecardsData);
    
    return (
      <div className="space-y-6">
        <FilterPanel />
        <Card>
          <CardHeader>
            <CardTitle>⏰ Timecard Records ({filteredData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredData.map((timecard, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{timecard.employee?.employee_name}</div>
                    <div className="text-sm text-gray-600">Date: {timecard.work_date}</div>
                    <div className="text-sm text-gray-600">Hours: {timecard.hours_worked}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={timecard.status === 'Approved' ? 'default' : 'secondary'}>
                      {timecard.status}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      {timecard.overtime_hours > 0 && `OT: ${timecard.overtime_hours}h`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAllReportsTab = () => (
    <div className="space-y-6">
      <FilterPanel />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Employee Headcount Report', count: reportingData.headcount?.length || 0 },
                { name: 'Status Summary Report', count: reportingData.status?.length || 0 },
                { name: 'Termination Analysis Report', count: reportingData.terminations?.length || 0 },
                { name: 'Retention Analysis Report', count: reportingData.retention?.length || 0 }
              ].map((report, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">{report.name}</span>
                  <Badge>{report.count} records</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>📈 Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Employees</span>
                <span className="font-bold">{employeeData.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pay Statements</span>
                <span className="font-bold">{checksData.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Job Categories</span>
                <span className="font-bold">{jobsData.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Timecard Records</span>
                <span className="font-bold">{timecardsData.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Load data when tab changes
  useEffect(() => {
    if (selectedTenant?.id) {
      loadTabData(activeTab);
    }
  }, [activeTab, selectedTenant?.id]);

  if (!selectedTenant) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Please select a tenant to view reports.</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Operations</h2>
        </div>
        <nav className="mt-6">
          <div className="px-3">
            <div className="space-y-1">
              <a href="/work-requests" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                📋 Work Requests
              </a>
              <a href="/project-management" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                📊 Project Management
              </a>
              <a href="/jobs" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                💼 Job Management
              </a>
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                👥 Employee Data Processing
              </div>
            </div>
          </div>
          
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Library</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                📈 ETL Dashboard
              </div>
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                📊 HR Analytics Dashboard
              </div>
              <a href="/reporting" className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                📋 Reporting
              </a>
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                📊 Data Analytics
              </div>
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                🔍 Audit Trail
              </div>
            </div>
          </div>

          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Management</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                ⚙️ Configuration
              </div>
            </div>
          </div>

          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                🏢 Administration
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HR/Payroll Reporting</h1>
              <p className="text-gray-600 mt-1">
                Enterprise reporting by pay period, benefit group, and department for {selectedTenant?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">🔽 Filter</Button>
              <Button variant="outline" onClick={() => loadTabData(activeTab)} disabled={loading}>
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </Button>
              <Button onClick={() => extractData('csv')}>📤 Export</Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-red-800">{error}</div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'employees', label: '👥 Employees', icon: '👥' },
                { id: 'checks', label: '💰 Checks', icon: '💰' },
                { id: 'jobs', label: '💼 Jobs', icon: '💼' },
                { id: 'salary', label: '💵 Salary', icon: '💵' },
                { id: 'timecards', label: '⏰ Timecards', icon: '⏰' },
                { id: 'all-reports', label: '📊 All Reports', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading {activeTab} data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'employees' && renderEmployeesTab()}
              {activeTab === 'checks' && renderChecksTab()}
              {activeTab === 'jobs' && renderJobsTab()}
              {activeTab === 'salary' && renderSalaryTab()}
              {activeTab === 'timecards' && renderTimecardsTab()}
              {activeTab === 'all-reports' && renderAllReportsTab()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRPayrollReporting;

