'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Play, 
  RefreshCw, 
  Settings 
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import timecardService from '@/services/timecardService'

interface TimecardRecalculationToolProps {
  className?: string
}

export default function TimecardRecalculationTool({ className = '' }: TimecardRecalculationToolProps) {
  const { user } = useAuth()
  const { selectedTenant: contextTenant } = useTenant()
  
  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [tenants, setTenants] = useState<Array<{
    id: string
    name: string
    legal_name: string
  }>>([])

  // Form state
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Permission checks
  const isHostAdmin = user?.role === 'host_admin'
  const isTenantAdmin = user?.role === 'tenant_admin'
  const canRecalculate = isHostAdmin || isTenantAdmin

  // Initialize dates to current week
  useEffect(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday

    setStartDate(startOfWeek.toISOString().split('T')[0])
    setEndDate(endOfWeek.toISOString().split('T')[0])
  }, [])

  // Set default tenant
  useEffect(() => {
    if (contextTenant && !isHostAdmin) {
      setSelectedTenant(contextTenant.id)
    }
  }, [contextTenant, isHostAdmin])

  // Load tenants for host admin
  useEffect(() => {
    if (isHostAdmin) {
      loadTenants()
    }
  }, [isHostAdmin])

  const loadTenants = async () => {
    try {
      const tenantsData = await timecardService.getTenants()
      setTenants(tenantsData)
    } catch (error) {
      console.error('Error loading tenants:', error)
      setError('Failed to load tenants')
    }
  }

  const validateForm = (): boolean => {
    if (!selectedTenant) {
      setError('Please select a tenant')
      return false
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return false
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before or equal to end date')
      return false
    }

    // Limit to 90 days to prevent excessive processing
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 90) {
      setError('Date range cannot exceed 90 days')
      return false
    }

    return true
  }

  const handleRecalculate = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 500)

      await timecardService.recalculateTimecardDailyRange(
        selectedTenant,
        startDate,
        endDate
      )

      clearInterval(progressInterval)
      setProgress(100)
      
      const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      setSuccess(`Successfully recalculated timecard summaries for ${daysDiff} days from ${startDate} to ${endDate}`)
    } catch (error) {
      console.error('Error recalculating timecard summaries:', error)
      setError('Failed to recalculate timecard summaries. Please try again.')
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setError(null)
    setSuccess(null)
    setProgress(0)
  }

  // Permission check
  if (!canRecalculate) {
    return (
      <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center text-yellow-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            You do not have permission to access this tool. This utility is restricted to host administrators and tenant administrators.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timecard Recalculation Tool</h1>
          <p className="text-gray-600">Recalculate timecard daily summaries for a specific date range</p>
        </div>
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      {/* Main Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Recalculation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tenant Selector (Host Admin Only) */}
            {isHostAdmin && (
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant *</Label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.legal_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  resetForm()
                }}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  resetForm()
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">What this tool does:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Recalculates timecard daily summaries from raw timecard punches</li>
                  <li>Updates the <code>public.v_timecard_daily_effective_v2</code> view data</li>
                  <li>Preserves existing corrections (override values remain intact)</li>
                  <li>Processes up to 90 days at a time to prevent system overload</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recalculation Progress</Label>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 text-center">
                Processing timecard data... This may take a few minutes.
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-800">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Display */}
          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {success}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleRecalculate}
              disabled={loading || !selectedTenant || !startDate || !endDate}
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Recalculating...' : 'Start Recalculation'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <div className="font-medium text-gray-900 mb-1">When to use this tool:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>After importing new timecard punch data</li>
                <li>When timecard calculation rules have been updated</li>
                <li>To fix calculation errors in historical data</li>
                <li>After system maintenance or data migration</li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-gray-900 mb-1">Important notes:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>This process may take several minutes for large date ranges</li>
                <li>Existing manual corrections will be preserved</li>
                <li>The system will remain available during recalculation</li>
                <li>Users may see updated data immediately after completion</li>
              </ul>
            </div>

            <div>
              <div className="font-medium text-gray-900 mb-1">Best practices:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Run during off-peak hours when possible</li>
                <li>Process smaller date ranges (1-2 weeks) for faster completion</li>
                <li>Verify results in the Timecard Daily Report after completion</li>
                <li>Coordinate with payroll team before processing payroll periods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
