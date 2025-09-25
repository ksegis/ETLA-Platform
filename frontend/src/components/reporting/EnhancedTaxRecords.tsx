/**
 * Enhanced Tax Records Component
 * Displays tax records with local tax information and customer branding
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { brandingService } from '@/services/brandingService';
import { FileText, Download, MapPin, DollarSign, Calendar, Building } from 'lucide-react';

interface TaxRecord {
  id: string;
  employee_id: string;
  tax_year: number;
  tax_period?: string;
  federal_tax_withheld: number;
  state_tax_withheld: number;
  local_tax_withheld?: number;
  local_tax_jurisdiction?: string;
  social_security_tax: number;
  medicare_tax: number;
  gross_wages: number;
  taxable_wages: number;
  w2_document_url?: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedTaxRecordsProps {
  employeeId: string;
  employeeName: string;
  tenantId: string;
  taxRecords: TaxRecord[];
  loading?: boolean;
  onDownloadW2?: (recordId: string) => void;
}

export default function EnhancedTaxRecords({
  employeeId,
  employeeName,
  tenantId,
  taxRecords,
  loading = false,
  onDownloadW2
}: EnhancedTaxRecordsProps) {
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Load customer branding
  useEffect(() => {
    brandingService.getCustomerLegalName(tenantId)
      .then(setCustomerName)
      .catch(console.error);
  }, [tenantId]);

  // Get unique tax years
  const availableYears = React.useMemo(() => {
    const years = Array.from(new Set(taxRecords.map(record => record.tax_year)));
    return years.sort((a, b) => b - a); // Most recent first
  }, [taxRecords]);

  // Filter records by selected year
  const filteredRecords = React.useMemo(() => {
    if (!selectedYear) return taxRecords;
    return taxRecords.filter(record => record.tax_year === selectedYear);
  }, [taxRecords, selectedYear]);

  // Calculate totals for selected year
  const yearTotals = React.useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => ({
        grossWages: acc.grossWages + (record.gross_wages || 0),
        federalTax: acc.federalTax + (record.federal_tax_withheld || 0),
        stateTax: acc.stateTax + (record.state_tax_withheld || 0),
        localTax: acc.localTax + (record.local_tax_withheld || 0),
        socialSecurity: acc.socialSecurity + (record.social_security_tax || 0),
        medicare: acc.medicare + (record.medicare_tax || 0),
      }),
      {
        grossWages: 0,
        federalTax: 0,
        stateTax: 0,
        localTax: 0,
        socialSecurity: 0,
        medicare: 0,
      }
    );
  }, [filteredRecords]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get local tax display
  const getLocalTaxDisplay = (record: TaxRecord) => {
    if (!record.local_tax_withheld || record.local_tax_withheld === 0) {
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin className="h-4 w-4" />
          <span>None</span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-gray-900">
            {formatCurrency(record.local_tax_withheld)}
          </span>
        </div>
        {record.local_tax_jurisdiction && (
          <div className="text-sm text-gray-600 ml-6">
            {record.local_tax_jurisdiction}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Customer Branding */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Tax Records - {customerName || 'ETLA Platform'}
            </h3>
            <p className="text-sm text-gray-600">
              Employee: {employeeName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{customerName}</span>
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Tax Year:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedYear === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(null)}
            >
              All Years
            </Button>
            {availableYears.map(year => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        {/* Year Summary */}
        {selectedYear && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-green-600">Gross Wages</div>
              <div className="text-lg font-bold text-green-900">
                {formatCurrency(yearTotals.grossWages)}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-red-600">Federal Tax</div>
              <div className="text-lg font-bold text-red-900">
                {formatCurrency(yearTotals.federalTax)}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-blue-600">State Tax</div>
              <div className="text-lg font-bold text-blue-900">
                {formatCurrency(yearTotals.stateTax)}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-purple-600">Local Tax</div>
              <div className="text-lg font-bold text-purple-900">
                {formatCurrency(yearTotals.localTax)}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-orange-600">Social Security</div>
              <div className="text-lg font-bold text-orange-900">
                {formatCurrency(yearTotals.socialSecurity)}
              </div>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-teal-600">Medicare</div>
              <div className="text-lg font-bold text-teal-900">
                {formatCurrency(yearTotals.medicare)}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tax Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Tax Year {record.tax_year}
                    {record.tax_period && (
                      <span className="text-gray-500 font-normal"> - {record.tax_period}</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(record.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {record.w2_document_url && onDownloadW2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadW2(record.id)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download W-2
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Wages Section */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 border-b pb-1">Wages</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gross Wages:</span>
                    <span className="font-semibold">{formatCurrency(record.gross_wages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taxable Wages:</span>
                    <span className="font-semibold">{formatCurrency(record.taxable_wages)}</span>
                  </div>
                </div>
              </div>

              {/* Federal & State Taxes */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 border-b pb-1">Federal & State</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Federal Tax:</span>
                    <span className="font-semibold text-red-700">
                      {formatCurrency(record.federal_tax_withheld)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">State Tax:</span>
                    <span className="font-semibold text-blue-700">
                      {formatCurrency(record.state_tax_withheld)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Local Taxes - Enhanced Display */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 border-b pb-1">Local Taxes</h5>
                <div className="space-y-2">
                  {getLocalTaxDisplay(record)}
                </div>
              </div>

              {/* Payroll Taxes */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 border-b pb-1">Payroll Taxes</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Social Security:</span>
                    <span className="font-semibold text-orange-700">
                      {formatCurrency(record.social_security_tax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Medicare:</span>
                    <span className="font-semibold text-teal-700">
                      {formatCurrency(record.medicare_tax)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Tax Withheld */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Tax Withheld:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    record.federal_tax_withheld +
                    record.state_tax_withheld +
                    (record.local_tax_withheld || 0) +
                    record.social_security_tax +
                    record.medicare_tax
                  )}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {filteredRecords.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Tax Records Found</p>
              <p>
                {selectedYear 
                  ? `No tax records available for ${selectedYear}.`
                  : 'No tax records available for this employee.'
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
