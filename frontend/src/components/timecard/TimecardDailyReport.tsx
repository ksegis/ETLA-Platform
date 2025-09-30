'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/Badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Download, 
  Edit, 
  Filter, 
  RefreshCw, 
  Search, 
  User 
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import timecardService, { TimecardDailySummaryV2, TimecardFilters } from '@/services/timecardService'
import { CorrectionModal } from './CorrectionModal'

interface TimecardDailyReportProps {
  className?: string
}

export default function TimecardDailyReport({ className = '' }: TimecardDailyReportProps) {
  const { user } = useAuth()
  const { selectedTenant: contextTenant } = useTenant()
  
  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TimecardDailySummaryV2[]>([])
  const [tenants, setTenants] = useState<Array<{
    id: string
    name: string
    legal_name: string
  }>>([])
  const [employees, setEmployees] = useState<Array<{
    employee_ref: string
    employee_name: string
    employee_id?: string
    employee_code?: string
  }>>([])

  // Filter state
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Correction modal state
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TimecardDailySummaryV2 | null>(null)

  // Permission checks
  const isHostAdmin = user?.role === 'host_admin'
  const isTenantAdmin = user?.role === 'tenant_admin'
  const isPayrollManager = user?.role === 'payroll_manager'
  const canCorrect = isHostAdmin || isTenantAdmin || isPayrollManager

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

  // Load employees when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      loadEmployees()
    }
  }, [selectedTenant])

  // Load data when filters change
  useEffect(() => {
    if (selectedTenant && startDate && endDate) {
      loadData()
    }
  }, [selectedTenant, startDate, endDate, selectedEmployee])

  const loadTenants = async () => {
    try {
      const tenantsData = await timecardService.getTenants()
      setTenants(tenantsData)
    } catch (error) {
      console.error('Error loading tenants:', error)
      setError('Failed to load tenants')
    }
  }

  const loadEmployees = async () => {
    if (!selectedTenant) return

    try {
      const employeesData = await timecardService.getEmployees(selectedTenant)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error loading employees:', error)
      setError('Failed to load employees')
    }
  }

  const loadData = async () => {
    if (!selectedTenant || !startDate || !endDate) return

    setLoading(true)
    setError(null)

    try {
      const filters: TimecardFilters = {
        tenant_id: selectedTenant,
        start_date: startDate,
        end_date: endDate
      }

      if (selectedEmployee) {
        filters.employee_ref = selectedEmployee
      }

      const summaries = await timecardService.getDailySummaries(filters)
      setData(summaries)
    } catch (error) {
      console.error('Error loading timecard data:', error)
      setError('Failed to load timecard data')
    } finally {
      setLoading(false)
    }
  }

  const handleCorrection = (record: TimecardDailySummaryV2) => {
    setSelectedRecord(record)
    setCorrectionModalOpen(true)
  }

  const handleCorrectionSaved = () => {
    setCorrectionModalOpen(false)
    setSelectedRecord(null)
    loadData() // Refresh data to show corrections
  }

  const handleExportCSV = async () => {
    if (!selectedTenant || !startDate || !endDate) return

    try {
      const filters: TimecardFilters = {
        tenant_id: selectedTenant,
        start_date: startDate,
        end_date: endDate
      }

      if (selectedEmployee) {
        filters.employee_ref = selectedEmployee
      }

      const csvData = await timecardService.exportToCSV(filters)
      
      // Create and download file
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timecard-summaries-${startDate}-to-${endDate}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      setError('Failed to export CSV')
    }
  }

  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '--'
    // Handle both HH:MM and HH:MM:SS formats
    return timeString.substring(0, 5)
  }

  const formatHours = (hours: number | null): string => {
    return hours !== null ? hours.toFixed(2) : '0.00'
  }

  // Filter data based on search term
  const filteredData = data.filter(record => 
    !searchTerm || 
    record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employee_ref?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timecard Daily Summaries</h1>
          <p className="text-gray-600">View and manage daily timecard summaries with correction capabilities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadData}
            disabled={loading || !selectedTenant}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={loading || !selectedTenant || data.length === 0}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tenant Selector (Host Admin Only) */}
            {isHostAdmin && (
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant</Label>
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Employee Filter */}
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employee_ref} value={employee.employee_ref}>
                      {employee.employee_name} ({employee.employee_ref})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by employee name or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Daily Summaries ({filteredData.length} records)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading timecard data...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No timecard data found for the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead className="text-right">Regular Hrs</TableHead>
                    <TableHead className="text-right">OT Hrs</TableHead>
                    <TableHead className="text-right">DT Hrs</TableHead>
                    <TableHead className="text-right">Total Hrs</TableHead>
                    <TableHead>Status</TableHead>
                    {canCorrect && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record, index) => (
                    <TableRow key={`${record.employee_ref}-${record.work_date}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.employee_name}</div>
                          <div className="text-sm text-gray-500">{record.employee_ref}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(record.work_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{formatTime(record.first_clock_in)}</TableCell>
                      <TableCell>{formatTime(record.mid_clock_out)}</TableCell>
                      <TableCell>{formatTime(record.mid_clock_in)}</TableCell>
                      <TableCell>{formatTime(record.last_clock_out)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatHours(record.regular_hours)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatHours(record.ot_hours)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatHours(record.dt_hours)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatHours(record.total_hours)}
                      </TableCell>
                      <TableCell>
                        {record.is_corrected ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  Corrected
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <div><strong>Corrected by:</strong> {record.corrected_by}</div>
                                  <div><strong>Corrected at:</strong> {record.corrected_at ? new Date(record.corrected_at).toLocaleString() : 'Unknown'}</div>
                                  {record.correction_reason && (
                                    <div><strong>Reason:</strong> {record.correction_reason}</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Calculated
                          </Badge>
                        )}
                      </TableCell>
                      {canCorrect && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCorrection(record)}
                            className="text-gray-500 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRecord && (
        <CorrectionModal
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          onSave={handleCorrectionSaved}
          initialData={selectedRecord}
        />
      )}
    </div>
  )
}
