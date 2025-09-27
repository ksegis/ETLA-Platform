import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { reportingCockpitService, EmployeeJobHistory, exportToCSV } from '@/services/reportingCockpitService'
import { Briefcase, Download, Loader2, AlertCircle, TrendingUp } from 'lucide-react'

interface JobHistoryGridProps {
  employeeId?: string
  tenantId?: string
}

const JobHistoryGrid: React.FC<JobHistoryGridProps> = ({
  employeeId,
  tenantId
}) => {
  const [jobHistory, setJobHistory] = useState<EmployeeJobHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeId) {
      loadJobHistory()
    } else {
      setJobHistory([])
    }
  }, [employeeId, tenantId])

  const loadJobHistory = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const data = await reportingCockpitService.getEmployeeJobHistory(employeeId, tenantId)
      setJobHistory(data)
    } catch (err) {
      console.error('Error loading job history:', err)
      setError('Failed to load job history')
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
    if (!dateString) return 'Present'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDuration = (startDate: string, endDate?: string): string => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'terminated':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getChangeReasonColor = (reason: string | undefined) => {
    if (!reason) return 'bg-gray-100 text-gray-800';
    switch (reason?.toLowerCase()) {
      case 'promotion':
        return 'bg-green-100 text-green-800'
      case 'transfer':
        return 'bg-blue-100 text-blue-800'
      case 'demotion':
        return 'bg-red-100 text-red-800'
      case 'lateral move':
        return 'bg-yellow-100 text-yellow-800'
      case 'new hire':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateSalaryGrowth = (): { totalGrowth: number; percentageGrowth: number } => {
    if (jobHistory.length < 2) return { totalGrowth: 0, percentageGrowth: 0 }
    
    const sortedHistory = [...jobHistory].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    const firstSalary = sortedHistory[0].salary || 0
    const lastSalary = sortedHistory[sortedHistory.length - 1].salary || 0
    
    const totalGrowth = lastSalary - firstSalary
    const percentageGrowth = firstSalary > 0 ? (totalGrowth / firstSalary) * 100 : 0
    
    return { totalGrowth, percentageGrowth }
  }

  const exportJobHistory = () => {
    if (jobHistory.length > 0) {
      exportToCSV(
        jobHistory,
        `job_history_${employeeId}_${new Date().toISOString().split('T')[0]}`
      )
    }
  }

  if (!employeeId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Job history will appear here</p>
        <p className="text-xs text-gray-400">Select an employee to view data</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading job history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={loadJobHistory} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (jobHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No job history found</p>
        <p className="text-xs text-gray-400">No job history data available for this employee</p>
      </div>
    )
  }

  const { totalGrowth, percentageGrowth } = calculateSalaryGrowth()

  return (
    <div className="space-y-4">
      {/* Header with summary and export button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Job History</h3>
          <p className="text-sm text-gray-500">
            {jobHistory.length} positions • {totalGrowth > 0 ? '+' : ''}{formatCurrency(totalGrowth)} growth ({percentageGrowth.toFixed(1)}%)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportJobHistory}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Job History Timeline */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {jobHistory.map((job, index) => (
          <Card key={job.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Position Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getChangeReasonColor(job.reason_for_change)}`}>
                    {job.reason_for_change}
                  </span>
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="font-medium text-lg mb-1">{job.job_title}</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Job Code: {job.job_code}</div>
                  <div>Department: {job.department}</div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="font-medium">Duration</div>
                  <div className="text-gray-600">
                    {formatDate(job.start_date)} - {formatDate(job.end_date)}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {calculateDuration(job.start_date, job.end_date)}
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="font-medium">Salary</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(job.salary)}
                  </div>
                  {index < jobHistory.length - 1 && (
                    <div className="text-xs text-gray-500">
                      {job.salary > jobHistory[index + 1].salary ? (
                        <span className="text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{formatCurrency(job.salary - jobHistory[index + 1].salary)}
                        </span>
                      ) : job.salary < jobHistory[index + 1].salary ? (
                        <span className="text-red-600">
                          {formatCurrency(job.salary - jobHistory[index + 1].salary)}
                        </span>
                      ) : (
                        <span className="text-gray-500">No change</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline connector (except for last item) */}
            {index < jobHistory.length - 1 && (
              <div className="flex justify-center mt-4">
                <div className="w-px h-4 bg-gray-300"></div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Career Growth Summary */}
      {jobHistory.length > 1 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-blue-900">Total Positions</div>
              <div className="text-2xl font-bold text-blue-700">{jobHistory.length}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-900">Salary Growth</div>
              <div className="text-2xl font-bold text-green-700">
                {totalGrowth > 0 ? '+' : ''}{formatCurrency(totalGrowth)}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-900">Growth Rate</div>
              <div className="text-2xl font-bold text-purple-700">
                {percentageGrowth > 0 ? '+' : ''}{percentageGrowth.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default JobHistoryGrid
