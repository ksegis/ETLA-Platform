import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ReportingCockpitService, exportToCSV } from '@/services/reportingCockpitService'
import type { TimecardRecord } from '@/types/reporting'
import { Clock, Download, Loader2, AlertCircle } from 'lucide-react'

interface TimecardsGridProps {
  employeeId?: string
  tenantId?: string
  startDate?: string
  endDate?: string
}

const TimecardsGrid: React.FC<TimecardsGridProps> = ({
  employeeId,
  tenantId,
  startDate,
  endDate
}) => {
  const [timecards, setTimecards] = useState<TimecardRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeId) {
      loadTimecards()
    } else {
      setTimecards([])
    }
  }, [employeeId, tenantId, startDate, endDate])

  const loadTimecards = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const reportingService = new ReportingCockpitService()
      const data = await reportingService.getTimecardRecords(
        employeeId,
        tenantId,
        startDate,
        endDate
      )
      setTimecards(data)
    } catch (err) {
      console.error('Error loading timecards:', err)
      setError('Failed to load timecard data')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return 'N/A'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const calculateTotalHours = (): number => {
    return timecards.reduce((total, timecard) => total + (timecard.hours_worked || 0), 0)
  }

  const calculateTotalPay = (): number => {
    // Since total_pay doesn't exist in the type, we'll calculate based on hours and a default rate
    // This should be updated when the actual pay calculation logic is available
    return timecards.reduce((total, timecard) => total + ((timecard.hours_worked || 0) * 25), 0) // Assuming $25/hour
  }

  const exportTimecards = () => {
    if (timecards.length > 0) {
      exportToCSV(
        timecards,
        `timecards_${employeeId}_${new Date().toISOString().split('T')[0]}`
      )
    }
  }

  if (!employeeId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Timecard data will appear here</p>
        <p className="text-xs text-gray-400">Select an employee to view data</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading timecard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={loadTimecards} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (timecards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No timecard data found</p>
        <p className="text-xs text-gray-400">
          {startDate || endDate ? 'Try adjusting the date range' : 'No timecard data available for this employee'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with summary and export button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Timecard Records</h3>
          <p className="text-sm text-gray-500">
            {timecards.length} records • {calculateTotalHours().toFixed(1)} total hours • {formatCurrency(calculateTotalPay())} total pay
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportTimecards}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Timecards Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {timecards.map((timecard) => (
          <Card key={timecard.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date & Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{formatDate(timecard.work_date)}</span>
                  <Badge variant={getStatusBadgeVariant(timecard.status)}>
                    {timecard.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(timecard.work_date).toLocaleDateString('en-US', { year: 'numeric' })}
                </div>
              </div>

              {/* Clock In/Out Times */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Date:</span>
                    <span className="font-medium">{new Date(timecard.work_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours Worked:</span>
                    <span className="font-medium">{(timecard.hours_worked || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break:</span>
                    <span>0 min</span>
                  </div>
                </div>
              </div>

              {/* Hours Breakdown */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular:</span>
                    <span>{(timecard.hours_worked || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overtime:</span>
                    <span>0.0h</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Total Hours:</span>
                    <span>{(timecard.hours_worked || 0).toFixed(1)}h</span>
                  </div>
                </div>
              </div>

              {/* Pay Information */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span>{formatCurrency(25)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-600 pt-1 border-t">
                    <span>Total Pay:</span>
                    <span>{formatCurrency((timecard.hours_worked || 0) * 25)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details (if needed)             {/* Break time information removed since break_minutes doesn't exist in type */}  </Card>
        ))}
      </div>

      {/* Summary Card */}
      {timecards.length > 1 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-blue-900">Total Records</div>
              <div className="text-2xl font-bold text-blue-700">{timecards.length}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-900">Total Hours</div>
              <div className="text-2xl font-bold text-blue-700">{calculateTotalHours().toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-900">Total Pay</div>
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(calculateTotalPay())}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default TimecardsGrid

