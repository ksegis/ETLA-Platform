import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ReportingCockpitService, exportToCSV } from '@/services/reportingCockpitService'
import type { PayStatement } from '@/types/reporting'
import { DollarSign, Download, Loader2, AlertCircle } from 'lucide-react'

interface PayStatementsGridProps {
  employeeId?: string
  tenantId?: string
  startDate?: string
  endDate?: string
}

const PayStatementsGrid: React.FC<PayStatementsGridProps> = ({
  employeeId,
  tenantId,
  startDate,
  endDate
}) => {
  const [payStatements, setPayStatements] = useState<PayStatement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeId) {
      loadPayStatements()
    } else {
      setPayStatements([])
    }
  }, [employeeId, tenantId, startDate, endDate])

  const loadPayStatements = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const reportingService = new ReportingCockpitService()
      const data = await reportingService.getPayStatements(
        employeeId,
        tenantId,
        startDate,
        endDate
      )
      setPayStatements(data)
    } catch (err) {
      console.error('Error loading pay statements:', err)
      setError('Failed to load pay statements')
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

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const exportPayStatements = () => {
    if (payStatements.length > 0) {
      exportToCSV(
        payStatements,
        `pay_statements_${employeeId}_${new Date().toISOString().split('T')[0]}`
      )
    }
  }

  if (!employeeId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Pay statements will appear here</p>
        <p className="text-xs text-gray-400">Select an employee to view data</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading pay statements...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={loadPayStatements} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (payStatements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No pay statements found</p>
        <p className="text-xs text-gray-400">
          {startDate || endDate ? 'Try adjusting the date range' : 'No pay data available for this employee'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with export button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Pay Statements</h3>
          <p className="text-sm text-gray-500">{payStatements.length} statements found</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportPayStatements}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Pay Statements Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {payStatements.map((statement) => (
          <Card key={statement.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column - Basic Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Check #{statement.check_number}</span>
                  <Badge variant={getStatusBadgeVariant(statement.check_status)}>
                    {statement.check_status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Pay Date: {formatDate(statement.pay_date)}</div>
                  <div>Period: {formatDate(statement.pay_period_start)} - {formatDate(statement.pay_period_end)}</div>
                </div>
              </div>

              {/* Middle Column - Hours & Pay */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Regular Hours:</span>
                    <span>{statement.regular_hours || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Hours:</span>
                    <span>{statement.overtime_hours || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular Pay:</span>
                    <span>{formatCurrency(statement.regular_pay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Pay:</span>
                    <span>{formatCurrency(statement.overtime_pay)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Totals */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>Gross Pay:</span>
                    <span>{formatCurrency(statement.gross_pay)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Fed Tax:</span>
                    <span>-{formatCurrency(statement.federal_tax_withheld)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>State Tax:</span>
                    <span>-{formatCurrency(statement.state_tax_withheld)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>FICA:</span>
                    <span>-{formatCurrency((statement.social_security_tax || 0) + (statement.medicare_tax || 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-600 pt-1 border-t">
                    <span>Net Pay:</span>
                    <span>{formatCurrency(statement.net_pay)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* YTD Totals (if available) */}
            {(statement.ytd_gross || statement.ytd_net) && (
              <div className="mt-3 pt-3 border-t bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600 grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span>YTD Gross:</span>
                    <span className="font-medium">{formatCurrency(statement.ytd_gross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>YTD Net:</span>
                    <span className="font-medium">{formatCurrency(statement.ytd_net)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PayStatementsGrid

