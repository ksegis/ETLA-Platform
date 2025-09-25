'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
// Note: Using simplified select implementation
// In production, you would use proper UI library components
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

    return filtered.sort((a, b) => {
      // Sort by tax year (desc), then employee name (asc)
      if (a.tax_year !== b.tax_year) {
        return b.tax_year - a.tax_year;
      }
      return a.employee_name.localeCompare(b.employee_name);
    });
  }, [taxRecords, searchTerm, selectedYear, selectedFormType, selectedStatus, selectedEmployee]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format SSN for display (masked)
  const formatSSN = (ssn: string): string => {
    if (!ssn || ssn.length < 4) return 'XXX-XX-XXXX';
    return `XXX-XX-${ssn.slice(-4)}`;
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
      'Tax Record ID': record.tax_record_id,
      'Tax Year': record.tax_year,
      'Form Type': record.form_type,
      'Filing Status': record.filing_status,
      'Tax Jurisdiction': record.tax_jurisdiction,
      'State Code': record.state_code,
      'Wages & Compensation': record.wages_tips_compensation,
      'Federal Income Tax Withheld': record.federal_income_tax_withheld,
      'Social Security Wages': record.social_security_wages,
      'Social Security Tax Withheld': record.social_security_tax_withheld,
      'Medicare Wages': record.medicare_wages,
      'Medicare Tax Withheld': record.medicare_tax_withheld,
      'State Wages': record.state_wages,
      'State Income Tax': record.state_income_tax,
      'Local Tax Withheld': record.local_tax_withheld || 0,
      'Local Tax Jurisdiction': record.local_tax_jurisdiction || 'None',
      'Document Status': record.document_status,
      'Issue Date': record.issue_date
    }));

    exportToCSV(exportData, `${branding?.legalName || 'ETLA'}_Tax_Records_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcelHandler = () => {
    const exportData = filteredRecords.map(record => ({
      'Employee Name': record.employee_name,
      'Tax Record ID': record.tax_record_id,
      'Tax Year': record.tax_year,
      'Form Type': record.form_type,
      'Filing Status': record.filing_status,
      'Tax Jurisdiction': record.tax_jurisdiction,
      'State Code': record.state_code,
      'Wages & Compensation': record.wages_tips_compensation,
      'Federal Income Tax Withheld': record.federal_income_tax_withheld,
      'Social Security Wages': record.social_security_wages,
      'Social Security Tax Withheld': record.social_security_tax_withheld,
      'Medicare Wages': record.medicare_wages,
      'Medicare Tax Withheld': record.medicare_tax_withheld,
      'State Wages': record.state_wages,
      'State Income Tax': record.state_income_tax,
      'Local Tax Withheld': record.local_tax_withheld || 0,
      'Local Tax Jurisdiction': record.local_tax_jurisdiction || 'None',
      'Document Status': record.document_status,
      'Issue Date': record.issue_date
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
          <p className="text-gray-600">Employee tax documents and withholding information</p>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Employee, Tax ID, Form Type..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
              <Select value={selectedFormType} onValueChange={setSelectedFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="All forms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All forms</SelectItem>
                  {formTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Records Grid */}
      <div className="grid gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {record.employee_name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>SSN: {formatSSN(record.ssn)}</span>
                    <span>Tax ID: {record.tax_record_id}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {record.tax_year}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{record.form_type}</Badge>
                  <Badge variant={getStatusVariant(record.document_status)}>
                    {record.document_status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Tax Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filing Status:</span>
                      <span className="font-medium">{record.filing_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dependents:</span>
                      <span className="font-medium">{record.dependents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Jurisdiction:</span>
                      <span className="font-medium">{record.tax_jurisdiction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State Code:</span>
                      <span className="font-medium">{record.state_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issue Date:</span>
                      <span className="font-medium">
                        {new Date(record.issue_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Wage and Tax Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Wages & Withholdings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wages & Compensation:</span>
                      <span className="font-medium">{formatCurrency(record.wages_tips_compensation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Federal Income Tax:</span>
                      <span className="font-medium">{formatCurrency(record.federal_income_tax_withheld)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Social Security Tax:</span>
                      <span className="font-medium">{formatCurrency(record.social_security_tax_withheld)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medicare Tax:</span>
                      <span className="font-medium">{formatCurrency(record.medicare_tax_withheld)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State Income Tax:</span>
                      <span className="font-medium">{formatCurrency(record.state_income_tax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Tax Information - REP-03 Requirement */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Local Tax Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Local Tax Withheld:</span>
                    <span className="font-medium">
                      {record.local_tax_withheld ? formatCurrency(record.local_tax_withheld) : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Local Tax Jurisdiction:</span>
                    <span className="font-medium">
                      {record.local_tax_jurisdiction || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Income (if present) */}
              {(record.nonemployee_compensation > 0 || record.misc_income > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Additional Income</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {record.nonemployee_compensation > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Non-employee Compensation:</span>
                        <span className="font-medium">{formatCurrency(record.nonemployee_compensation)}</span>
                      </div>
                    )}
                    {record.misc_income > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Miscellaneous Income:</span>
                        <span className="font-medium">{formatCurrency(record.misc_income)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tax records found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
