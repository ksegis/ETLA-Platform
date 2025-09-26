'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { FileText, Download, DollarSign, Calendar, Building, User, MapPin } from 'lucide-react';
import { useCustomerBranding } from '@/services/brandingService';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

interface TaxRecord {
  id: string;
  tax_record_id: string;
  employee_id: string;
  employee_name: string;
  ssn: string;
  tax_year: number;
  form_type: string;
  filing_status: string;
  dependents: number;
  tax_jurisdiction: string;
  state_code: string;
  wages_tips_compensation: number;
  federal_income_tax_withheld: number;
  social_security_wages: number;
  social_security_tax_withheld: number;
  medicare_wages: number;
  medicare_tax_withheld: number;
  state_wages: number;
  state_income_tax: number;
  local_tax_withheld?: number;
  local_tax_jurisdiction?: string;
  nonemployee_compensation: number;
  misc_income: number;
  document_status: string;
  issue_date: string;
  tenant_id: string;
}

interface EnhancedTaxRecordsProps {
  taxRecords: TaxRecord[];
  tenantId?: string;
}

export default function EnhancedTaxRecordsWithLocalTax({ taxRecords, tenantId }: EnhancedTaxRecordsProps) {
  const { branding } = useCustomerBranding(tenantId);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedFormType, setSelectedFormType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  // Get unique tax years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(taxRecords.map(record => record.tax_year)));
    return years.sort((a, b) => b - a); // Most recent first
  }, [taxRecords]);

  // Get unique form types
  const formTypes = useMemo(() => {
    return Array.from(new Set(taxRecords.map(record => record.form_type))).sort();
  }, [taxRecords]);

  // Get unique statuses
  const statuses = useMemo(() => {
    return Array.from(new Set(taxRecords.map(record => record.document_status))).sort();
  }, [taxRecords]);

  // Get unique employees
  const employees = useMemo(() => {
    const uniqueEmployees = new Map();
    taxRecords.forEach(record => {
      if (!uniqueEmployees.has(record.employee_id)) {
        uniqueEmployees.set(record.employee_id, {
          id: record.employee_id,
          name: record.employee_name
        });
      }
    });
    return Array.from(uniqueEmployees.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [taxRecords]);

  // Filter tax records
  const filteredRecords = useMemo(() => {
    let filtered = taxRecords;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.employee_name.toLowerCase().includes(term) ||
        record.tax_record_id.toLowerCase().includes(term) ||
        record.form_type.toLowerCase().includes(term) ||
        record.tax_jurisdiction.toLowerCase().includes(term)
      );
    }

    if (selectedYear) {
      filtered = filtered.filter(record => record.tax_year.toString() === selectedYear);
    }

    if (selectedFormType) {
      filtered = filtered.filter(record => record.form_type === selectedFormType);
    }

    if (selectedStatus) {
      filtered = filtered.filter(record => record.document_status === selectedStatus);
    }

    if (selectedEmployee) {
      filtered = filtered.filter(record => record.employee_id === selectedEmployee);
    }

    return filtered.sort((a, b) => b.tax_year - a.tax_year || a.employee_name.localeCompare(b.employee_name));
  }, [taxRecords, searchTerm, selectedYear, selectedFormType, selectedStatus, selectedEmployee]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
      acc.totalWages += record.wages_tips_compensation;
      acc.totalFederalTax += record.federal_income_tax_withheld;
      acc.totalStateTax += record.state_income_tax;
      acc.totalLocalTax += record.local_tax_withheld || 0;
      acc.totalSocialSecurity += record.social_security_tax_withheld;
      acc.totalMedicare += record.medicare_tax_withheld;
      return acc;
    }, {
      totalWages: 0,
      totalFederalTax: 0,
      totalStateTax: 0,
      totalLocalTax: 0,
      totalSocialSecurity: 0,
      totalMedicare: 0
    });
  }, [filteredRecords]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge variant
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'issued':
      case 'completed':
        return 'default';
      case 'pending':
      case 'processing':
        return 'secondary';
      case 'error':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Export functions
  const exportToCSVHandler = () => {
    const exportData = filteredRecords.map(record => ({
      'Employee Name': record.employee_name,
      'Tax Year': record.tax_year,
      'Form Type': record.form_type,
      'Filing Status': record.filing_status,
      'Wages': formatCurrency(record.wages_tips_compensation),
      'Federal Tax': formatCurrency(record.federal_income_tax_withheld),
      'State Tax': formatCurrency(record.state_income_tax),
      'Local Tax': formatCurrency(record.local_tax_withheld || 0),
      'Social Security Tax': formatCurrency(record.social_security_tax_withheld),
      'Medicare Tax': formatCurrency(record.medicare_tax_withheld),
      'Status': record.document_status,
      'Issue Date': new Date(record.issue_date).toLocaleDateString()
    }));

    exportToCSV(exportData, `${branding?.legalName || 'ETLA'}_Tax_Records_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcelHandler = () => {
    const exportData = filteredRecords.map(record => ({
      'Employee Name': record.employee_name,
      'Tax Year': record.tax_year,
      'Form Type': record.form_type,
      'Filing Status': record.filing_status,
      'Wages': record.wages_tips_compensation,
      'Federal Tax': record.federal_income_tax_withheld,
      'State Tax': record.state_income_tax,
      'Local Tax': record.local_tax_withheld || 0,
      'Social Security Tax': record.social_security_tax_withheld,
      'Medicare Tax': record.medicare_tax_withheld,
      'Status': record.document_status,
      'Issue Date': new Date(record.issue_date).toLocaleDateString()
    }));

    exportToExcel(exportData, `${branding?.legalName || 'ETLA'}_Tax_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header with branding */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {branding?.legalName || 'ETLA Platform'} - Tax Records
          </h2>
          <p className="text-gray-600">Comprehensive tax record management with local tax support</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSVHandler} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToExcelHandler} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wages</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summaryStats.totalWages)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Federal Tax</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summaryStats.totalFederalTax)}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">State Tax</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summaryStats.totalStateTax)}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Local Tax</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summaryStats.totalLocalTax)}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Social Security</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summaryStats.totalSocialSecurity)}</p>
              </div>
              <User className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medicare</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summaryStats.totalMedicare)}</p>
              </div>
              <User className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Employee name, record ID..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All years</option>
                {availableYears.map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
              <select 
                value={selectedFormType} 
                onChange={(e) => setSelectedFormType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All forms</option>
                {formTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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
          </div>
        </CardContent>
      </Card>

      {/* Tax Records List */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium text-gray-900">{record.form_type} - {record.tax_year}</h3>
                    <Badge variant={getStatusVariant(record.document_status)} className="text-xs">
                      {record.document_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{record.employee_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{record.tax_jurisdiction}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(record.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{record.filing_status}</span>
                    </div>
                  </div>

                  {/* Tax Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Wages</p>
                      <p className="font-medium">{formatCurrency(record.wages_tips_compensation)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Federal Tax</p>
                      <p className="font-medium">{formatCurrency(record.federal_income_tax_withheld)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">State Tax</p>
                      <p className="font-medium">{formatCurrency(record.state_income_tax)}</p>
                    </div>
                    {record.local_tax_withheld && record.local_tax_withheld > 0 && (
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Local Tax</p>
                        <p className="font-medium">{formatCurrency(record.local_tax_withheld)}</p>
                        {record.local_tax_jurisdiction && (
                          <p className="text-xs text-gray-400">{record.local_tax_jurisdiction}</p>
                        )}
                      </div>
                    )}
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Social Security</p>
                      <p className="font-medium">{formatCurrency(record.social_security_tax_withheld)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Medicare</p>
                      <p className="font-medium">{formatCurrency(record.medicare_tax_withheld)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tax records found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
