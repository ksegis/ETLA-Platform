/**
 * Enhanced Tax Records Component with Local Tax Support
 * Features: Federal, state, and local tax breakdown with advanced filtering and export
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { exportUtils } from '@/utils/exportUtils';
import { brandingService } from '@/services/brandingService';
import { 
  Download, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  FileText,
  Search,
  Filter,
  Calendar,
  Building,
  MapPin,
  Percent,
  PieChart,
  BarChart3,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface TaxRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  federal_withholding: number;
  state_withholding: number;
  local_withholding: number;
  social_security: number;
  medicare: number;
  unemployment_tax: number;
  workers_comp: number;
  other_deductions: number;
  net_pay: number;
  ytd_gross: number;
  ytd_federal: number;
  ytd_state: number;
  ytd_local: number;
  ytd_social_security: number;
  ytd_medicare: number;
  state: string;
  locality?: string;
  department?: string;
  status: 'processed' | 'pending' | 'error';
}

interface EnhancedTaxRecordsProps {
  data?: TaxRecord[];
  loading?: boolean;
  onRefresh?: () => void;
  tenantId: string;
  showYTD?: boolean;
  showLocalTax?: boolean;
}

export default function EnhancedTaxRecordsWithLocalTax({
  data = [],
  loading = false,
  onRefresh,
  tenantId,
  showYTD = true,
  showLocalTax = true
}: EnhancedTaxRecordsProps) {
  const [customerName, setCustomerName] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  // Load customer branding
  useEffect(() => {
    brandingService.getCustomerLegalName(tenantId)
      .then(setCustomerName)
      .catch(console.error);
  }, [tenantId]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const states = [...new Set(data.map(item => item.state).filter(Boolean))].sort();
    const departments = [...new Set(data.map(item => item.department).filter(Boolean))].sort();
    return { states, departments };
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locality?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = stateFilter === 'all' || item.state === stateFilter;
      const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesState && matchesDepartment && matchesStatus;
    });
  }, [data, searchTerm, stateFilter, departmentFilter, statusFilter]);

  // Calculate tax summary statistics
  const taxSummary = useMemo(() => {
    const summary = filteredData.reduce(
      (acc, record) => ({
        totalGrossPay: acc.totalGrossPay + record.gross_pay,
        totalFederalTax: acc.totalFederalTax + record.federal_withholding,
        totalStateTax: acc.totalStateTax + record.state_withholding,
        totalLocalTax: acc.totalLocalTax + record.local_withholding,
        totalSocialSecurity: acc.totalSocialSecurity + record.social_security,
        totalMedicare: acc.totalMedicare + record.medicare,
        totalUnemployment: acc.totalUnemployment + record.unemployment_tax,
        totalWorkersComp: acc.totalWorkersComp + record.workers_comp,
        totalOtherDeductions: acc.totalOtherDeductions + record.other_deductions,
        totalNetPay: acc.totalNetPay + record.net_pay,
        recordCount: acc.recordCount + 1,
        employeeCount: new Set([...acc.employeeCount, record.employee_id]).size,
        stateCount: new Set([...acc.stateCount, record.state]).size,
        errorCount: acc.errorCount + (record.status === 'error' ? 1 : 0),
        pendingCount: acc.pendingCount + (record.status === 'pending' ? 1 : 0)
      }),
      {
        totalGrossPay: 0,
        totalFederalTax: 0,
        totalStateTax: 0,
        totalLocalTax: 0,
        totalSocialSecurity: 0,
        totalMedicare: 0,
        totalUnemployment: 0,
        totalWorkersComp: 0,
        totalOtherDeductions: 0,
        totalNetPay: 0,
        recordCount: 0,
        employeeCount: new Set(),
        stateCount: new Set(),
        errorCount: 0,
        pendingCount: 0
      }
    );

    const totalTaxes = summary.totalFederalTax + summary.totalStateTax + summary.totalLocalTax + 
                      summary.totalSocialSecurity + summary.totalMedicare;
    
    return {
      ...summary,
      employeeCount: summary.employeeCount.size,
      stateCount: summary.stateCount.size,
      totalTaxes,
      effectiveTaxRate: summary.totalGrossPay > 0 ? (totalTaxes / summary.totalGrossPay) * 100 : 0,
      averageGrossPerEmployee: summary.employeeCount > 0 ? summary.totalGrossPay / summary.employeeCount : 0
    };
  }, [filteredData]);

  // Handle export
  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExportLoading(true);
    
    try {
      const exportData = filteredData.map(record => ({
        employeeName: record.employee_name,
        payPeriodStart: record.pay_period_start,
        payPeriodEnd: record.pay_period_end,
        state: record.state,
        locality: record.locality || '',
        department: record.department || '',
        grossPay: record.gross_pay,
        federalWithholding: record.federal_withholding,
        stateWithholding: record.state_withholding,
        localWithholding: record.local_withholding,
        socialSecurity: record.social_security,
        medicare: record.medicare,
        unemploymentTax: record.unemployment_tax,
        workersComp: record.workers_comp,
        otherDeductions: record.other_deductions,
        netPay: record.net_pay,
        ytdGross: record.ytd_gross,
        ytdFederal: record.ytd_federal,
        ytdState: record.ytd_state,
        ytdLocal: record.ytd_local,
        ytdSocialSecurity: record.ytd_social_security,
        ytdMedicare: record.ytd_medicare,
        status: record.status
      }));

      const filename = exportUtils.generateFilename(
        `enhanced_tax_records_${new Date().toISOString().split('T')[0]}`,
        format
      );

      // Use a generic export method since we don't have a specific tax export method
      if (format === 'csv') {
        await exportUtils.exportToCSV(exportData, filename);
      } else {
        await exportUtils.exportToExcel(exportData, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tax Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Gross Pay</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(taxSummary.totalGrossPay)}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total Taxes</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(taxSummary.totalTaxes)}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Tax Rate</div>
              <div className="text-lg font-bold text-gray-900">
                {formatPercentage(taxSummary.effectiveTaxRate)}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Employees</div>
              <div className="text-lg font-bold text-gray-900">{taxSummary.employeeCount}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MapPin className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">States</div>
              <div className="text-lg font-bold text-gray-900">{taxSummary.stateCount}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Issues</div>
              <div className="text-lg font-bold text-gray-900">
                {taxSummary.errorCount + taxSummary.pendingCount}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tax Breakdown Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tax Breakdown</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'summary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('summary')}
            >
              <PieChart className="h-4 w-4 mr-2" />
              Summary
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Detailed
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-600">Federal Tax</div>
            <div className="text-xl font-bold text-blue-900">
              {formatCurrency(taxSummary.totalFederalTax)}
            </div>
            <div className="text-xs text-blue-600">
              {formatPercentage((taxSummary.totalFederalTax / taxSummary.totalGrossPay) * 100)}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-600">State Tax</div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(taxSummary.totalStateTax)}
            </div>
            <div className="text-xs text-green-600">
              {formatPercentage((taxSummary.totalStateTax / taxSummary.totalGrossPay) * 100)}
            </div>
          </div>
          
          {showLocalTax && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-600">Local Tax</div>
              <div className="text-xl font-bold text-purple-900">
                {formatCurrency(taxSummary.totalLocalTax)}
              </div>
              <div className="text-xs text-purple-600">
                {formatPercentage((taxSummary.totalLocalTax / taxSummary.totalGrossPay) * 100)}
              </div>
            </div>
          )}
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-orange-600">Social Security</div>
            <div className="text-xl font-bold text-orange-900">
              {formatCurrency(taxSummary.totalSocialSecurity)}
            </div>
            <div className="text-xs text-orange-600">
              {formatPercentage((taxSummary.totalSocialSecurity / taxSummary.totalGrossPay) * 100)}
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-red-600">Medicare</div>
            <div className="text-xl font-bold text-red-900">
              {formatCurrency(taxSummary.totalMedicare)}
            </div>
            <div className="text-xs text-red-600">
              {formatPercentage((taxSummary.totalMedicare / taxSummary.totalGrossPay) * 100)}
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees, states, localities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Filters */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All States</option>
              {filterOptions.states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {filterOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="processed">Processed</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>
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

      {/* Data Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Gross Pay</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Federal</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">State</th>
                {showLocalTax && (
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Local</th>
                )}
                <th className="text-right py-3 px-4 font-semibold text-gray-900">FICA</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Net Pay</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{record.employee_name}</div>
                      {record.department && (
                        <div className="text-sm text-gray-500">{record.department}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div>{new Date(record.pay_period_start).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(record.pay_period_end).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-medium">{record.state}</div>
                      {record.locality && (
                        <div className="text-gray-500">{record.locality}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(record.gross_pay)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(record.federal_withholding)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(record.state_withholding)}
                  </td>
                  {showLocalTax && (
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(record.local_withholding)}
                    </td>
                  )}
                  <td className="py-3 px-4 text-right font-mono">
                    <div className="text-sm">
                      <div>{formatCurrency(record.social_security + record.medicare)}</div>
                      <div className="text-gray-500 text-xs">
                        SS: {formatCurrency(record.social_security)} | MC: {formatCurrency(record.medicare)}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    {formatCurrency(record.net_pay)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        record.status === 'processed' ? 'success' :
                        record.status === 'pending' ? 'warning' : 'destructive'
                      }
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No tax records found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
