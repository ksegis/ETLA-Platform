'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Save, 
  User, 
  X 
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import timecardService, { TimecardDailySummaryV2, TimecardCorrectionData } from '@/services/timecardService'

interface CorrectionModalProps {
  record: TimecardDailySummaryV2
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function CorrectionModal({ record, isOpen, onClose, onSave }: CorrectionModalProps) {
  const { user } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    first_clock_in: '',
    mid_clock_out: '',
    mid_clock_in: '',
    last_clock_out: '',
    total_hours: '',
    regular_hours: '',
    ot_hours: '',
    dt_hours: '',
    correction_reason: ''
  })
  
  const [loading, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        first_clock_in: formatTimeForInput(record.first_clock_in),
        mid_clock_out: formatTimeForInput(record.mid_clock_out),
        mid_clock_in: formatTimeForInput(record.mid_clock_in),
        last_clock_out: formatTimeForInput(record.last_clock_out),
        total_hours: record.total_hours?.toFixed(2) || '0.00',
        regular_hours: record.regular_hours?.toFixed(2) || '0.00',
        ot_hours: record.ot_hours?.toFixed(2) || '0.00',
        dt_hours: record.dt_hours?.toFixed(2) || '0.00',
        correction_reason: record.correction_reason || ''
      })
      setError(null)
    }
  }, [record])

  const formatTimeForInput = (timeString: string | null | undefined): string => {
    if (!timeString) return ''
    // Convert HH:MM:SS to HH:MM for input[type="time"]
    return timeString.substring(0, 5)
  }

  const formatTimeForDatabase = (timeString: string): string | null => {
    if (!timeString) return null
    // Ensure format is HH:MM:SS for database
    return timeString.length === 5 ? `${timeString}:00` : timeString
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.correction_reason.trim()) {
      setError('Correction reason is required')
      return false
    }

    // Validate time format (HH:MM)
    const timeFields = ['first_clock_in', 'mid_clock_out', 'mid_clock_in', 'last_clock_out']
    for (const field of timeFields) {
      const value = formData[field as keyof typeof formData]
      if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
        setError(`Invalid time format for ${field.replace('_', ' ')}: ${value}`)
        return false
      }
    }

    // Validate hours (must be non-negative numbers)
    const hourFields = ['total_hours', 'regular_hours', 'ot_hours', 'dt_hours']
    for (const field of hourFields) {
      const value = parseFloat(formData[field as keyof typeof formData])
      if (isNaN(value) || value < 0) {
        setError(`Invalid hours value for ${field.replace('_', ' ')}: ${formData[field as keyof typeof formData]}`)
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setError(null)

    try {
      const correctionData: TimecardCorrectionData = {
        override_first_clock_in: formatTimeForDatabase(formData.first_clock_in),
        override_mid_clock_out: formatTimeForDatabase(formData.mid_clock_out),
        override_mid_clock_in: formatTimeForDatabase(formData.mid_clock_in),
        override_last_clock_out: formatTimeForDatabase(formData.last_clock_out),
        override_total_hours: parseFloat(formData.total_hours),
        override_regular_hours: parseFloat(formData.regular_hours),
        override_ot_hours: parseFloat(formData.ot_hours),
        override_dt_hours: parseFloat(formData.dt_hours),
        correction_reason: formData.correction_reason.trim(),
        corrected_by: user?.email || 'Unknown User'
      }

      await timecardService.correctDailySummary(
        record.tenant_id,
        record.employee_ref,
        record.work_date,
        correctionData
      )

      onSave()
    } catch (error) {
      console.error('Error saving correction:', error)
      setError('Failed to save correction. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Correct Timecard Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Record Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Record Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Employee</Label>
                  <div className="mt-1">
                    <div className="font-medium">{record.employee_name}</div>
                    <div className="text-sm text-gray-500">{record.employee_ref}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Work Date</Label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(record.work_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                  <div className="mt-1">
                    {record.is_corrected ? (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Previously Corrected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Calculated
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {record.is_corrected && record.correction_reason && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <Label className="text-sm font-medium text-orange-800">Previous Correction Reason</Label>
                  <div className="mt-1 text-sm text-orange-700">{record.correction_reason}</div>
                  {record.corrected_by && record.corrected_at && (
                    <div className="mt-2 text-xs text-orange-600">
                      Corrected by {record.corrected_by} on {new Date(record.corrected_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clock Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clock Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_clock_in">Clock In <span className="text-xs text-gray-500">(First)</span></Label>
                  <Input
                    id="first_clock_in"
                    type="time"
                    value={formData.first_clock_in}
                    onChange={(e) => handleInputChange('first_clock_in', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mid_clock_out">Clock Out <span className="text-xs text-gray-500">(Lunch Start)</span></Label>
                  <Input
                    id="mid_clock_out"
                    type="time"
                    value={formData.mid_clock_out}
                    onChange={(e) => handleInputChange('mid_clock_out', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mid_clock_in">Clock In <span className="text-xs text-gray-500">(Lunch End)</span></Label>
                  <Input
                    id="mid_clock_in"
                    type="time"
                    value={formData.mid_clock_in}
                    onChange={(e) => handleInputChange('mid_clock_in', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_clock_out">Clock Out <span className="text-xs text-gray-500">(Last)</span></Label>
                  <Input
                    id="last_clock_out"
                    type="time"
                    value={formData.last_clock_out}
                    onChange={(e) => handleInputChange('last_clock_out', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regular_hours">Regular Hours</Label>
                  <Input
                    id="regular_hours"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.regular_hours}
                    onChange={(e) => handleInputChange('regular_hours', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ot_hours">Overtime Hours</Label>
                  <Input
                    id="ot_hours"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ot_hours}
                    onChange={(e) => handleInputChange('ot_hours', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dt_hours">Double Time Hours</Label>
                  <Input
                    id="dt_hours"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.dt_hours}
                    onChange={(e) => handleInputChange('dt_hours', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_hours">Total Hours</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_hours}
                    onChange={(e) => handleInputChange('total_hours', e.target.value)}
                    className="font-mono font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correction Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Correction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="correction_reason">
                  Correction Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="correction_reason"
                  placeholder="Please provide a detailed reason for this correction..."
                  value={formData.correction_reason}
                  onChange={(e) => handleInputChange('correction_reason', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="text-sm text-gray-500">
                  This reason will be recorded for audit purposes and displayed to other users.
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
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.correction_reason.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Correction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
