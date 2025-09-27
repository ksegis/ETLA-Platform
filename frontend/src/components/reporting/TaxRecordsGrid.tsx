import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import reportingCockpitService, { TaxRecord } from '@/services/reportingCockpitService'
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react'

interface TaxRecordsGridProps {
  employeeId?: string
  tenantId?: string
}

const TaxRecordsGrid: React.FC<TaxRecordsGridProps> = ({
  employeeId,
  tenantId
}) => {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeId) {
      loadTaxRecords()
    } else {
      setTaxRecords([])
    }
  }, [employeeId, tenantId])

  const loadTaxRecords = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const data = await reportingCockpitService.getTaxRecords(employeeId, tenantId)
      setTaxRecords(data)
    } catch (err) {
      console.error('Error loading tax records:', err)
      setError('Failed to load tax records')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'issued':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'corrected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const exportTaxRecords = () => {
    if (taxRecords.length > 0) {
      reportingCockpitService.exportToCSV(
        taxRecords,
        `tax_records_${employeeId}_${new Date().toISOString().split('T')[0]}`
      )
    }
  }

  if (!employeeId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Tax records will appear here</p>
        <p className="text-xs text-gray-400">Select an employee to view data</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading tax records...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={loadTaxRecords} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (taxRecords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No tax records found</p>
        <p className="text-xs text-gray-400">No tax data available for this employee</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with export button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Tax Records</h3>
          <p className="text-sm text-gray-500">{taxRecords.length} records found</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportTaxRecords}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Tax Records Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {taxRecords.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column - Basic Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{record.form_type} - {record.tax_year}</span>
                  <Badge variant={getStatusBadgeVariant(record.document_status)}>
                    {record.document_status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Record ID: {record.tax_record_id}</div>
                  <div>Issue Date: {formatDate(record.issue_date)}</div>
                </div>
              </div>

              {/* Middle Column - Wages & Federal */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Wages/Tips:</span>
                    <span className="font-medium">{formatCurrency(record.wages_tips_compensation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Federal Tax:</span>
                    <span>{formatCurrency(record.federal_income_tax_withheld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SS Wages:</span>
                    <span>{formatCurrency(record.social_security_wages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SS Tax:</span>
                    <span>{formatCurrency(record.social_security_tax_withheld)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Medicare & State */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Medicare Wages:</span>
                    <span>{formatCurrency(record.medicare_wages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medicare Tax:</span>
                    <span>{formatCurrency(record.medicare_tax_withheld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Wages:</span>
                    <span>{formatCurrency(record.state_wages)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Tax:</span>
                    <span>{formatCurrency(record.state_income_tax)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Tax Withheld Summary */}
            <div className="mt-3 pt-3 border-t bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="font-medium">Total Federal</div>
                  <div className="text-sm">{formatCurrency(record.federal_income_tax_withheld)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Total FICA</div>
                  <div className="text-sm">{formatCurrency((record.social_security_tax_withheld || 0) + (record.medicare_tax_withheld || 0))}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Total State</div>
                  <div className="text-sm">{formatCurrency(record.state_income_tax)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Total Withheld</div>
                  <div className="text-sm font-bold">
                    {formatCurrency(
                      (record.federal_income_tax_withheld || 0) +
                      (record.social_security_tax_withheld || 0) +
                      (record.medicare_tax_withheld || 0) +
                      (record.state_income_tax || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TaxRecordsGrid
