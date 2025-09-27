import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import reportingCockpitService, { BenefitRecord } from '@/services/reportingCockpitService'
import { Building, Download, Loader2, AlertCircle } from 'lucide-react'

interface BenefitsGridProps {
  employeeId?: string
  tenantId?: string
}

const BenefitsGrid: React.FC<BenefitsGridProps> = ({
  employeeId,
  tenantId
}) => {
  const [benefits, setBenefits] = useState<BenefitRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeId) {
      loadBenefits()
    } else {
      setBenefits([])
    }
  }, [employeeId, tenantId])

  const loadBenefits = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const data = await reportingCockpitService.getBenefitRecords(employeeId, tenantId)
      setBenefits(data)
    } catch (err) {
      console.error('Error loading benefits:', err)
      setError('Failed to load benefits data')
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
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'terminated':
        return 'destructive'
      case 'suspended':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getBenefitTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'health':
        return 'bg-blue-100 text-blue-800'
      case 'dental':
        return 'bg-green-100 text-green-800'
      case 'vision':
        return 'bg-purple-100 text-purple-800'
      case 'life':
        return 'bg-red-100 text-red-800'
      case '401k':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateTotalEmployeeContribution = (): number => {
    return benefits.reduce((total, benefit) => total + (benefit.employee_contribution || 0), 0)
  }

  const calculateTotalEmployerContribution = (): number => {
    return benefits.reduce((total, benefit) => total + (benefit.employer_contribution || 0), 0)
  }

  const exportBenefits = () => {
    if (benefits.length > 0) {
      reportingCockpitService.exportToCSV(
        benefits,
        `benefits_${employeeId}_${new Date().toISOString().split('T')[0]}`
      )
    }
  }

  if (!employeeId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Benefits data will appear here</p>
        <p className="text-xs text-gray-400">Select an employee to view data</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading benefits data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={loadBenefits} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (benefits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No benefits found</p>
        <p className="text-xs text-gray-400">No benefits data available for this employee</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with summary and export button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Benefits Enrollment</h3>
          <p className="text-sm text-gray-500">
            {benefits.length} plans • Employee: {formatCurrency(calculateTotalEmployeeContribution())} • Employer: {formatCurrency(calculateTotalEmployerContribution())}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportBenefits}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Benefits Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {benefits.map((benefit) => (
          <Card key={benefit.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column - Plan Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBenefitTypeColor(benefit.benefit_type)}`}>
                      {benefit.benefit_type}
                    </span>
                    <Badge variant={getStatusBadgeVariant(benefit.status)}>
                      {benefit.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{benefit.plan_name}</div>
                  <div className="text-sm text-gray-600">{benefit.coverage_type}</div>
                </div>
              </div>

              {/* Middle Column - Dates */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrolled:</span>
                    <span>{formatDate(benefit.enrollment_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Effective:</span>
                    <span>{formatDate(benefit.effective_date)}</span>
                  </div>
                  {benefit.termination_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terminated:</span>
                      <span className="text-red-600">{formatDate(benefit.termination_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Contributions */}
              <div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee:</span>
                    <span className="font-medium">{formatCurrency(benefit.employee_contribution)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employer:</span>
                    <span className="font-medium">{formatCurrency(benefit.employer_contribution)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency((benefit.employee_contribution || 0) + (benefit.employer_contribution || 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Amount (if applicable) */}
            {benefit.coverage_amount && benefit.coverage_amount > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Coverage Amount:</span> {formatCurrency(benefit.coverage_amount)}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      {benefits.length > 1 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-900">Total Plans</div>
              <div className="text-2xl font-bold text-green-700">{benefits.length}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-900">Employee Contribution</div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(calculateTotalEmployeeContribution())}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-900">Employer Contribution</div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(calculateTotalEmployerContribution())}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default BenefitsGrid
