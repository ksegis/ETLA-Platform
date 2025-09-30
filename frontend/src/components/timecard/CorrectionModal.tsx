'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle, Clock } from 'lucide-react'
import timecardService, { TimecardDailySummaryV2, TimecardCorrectionData } from '@/services/timecardService'
import { useAuth } from '@/contexts/AuthContext'

interface CorrectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  initialData: TimecardDailySummaryV2 | null
}

export function CorrectionModal({ isOpen, onClose, onSave, initialData }: CorrectionModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    first_clock_in: '',
    mid_clock_out: '',
    mid_clock_in: '',
    last_clock_out: '',
    total_hours: '',
    regular_hours: '',
    ot_hours: '',
    dt_hours: '',
    correction_reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_clock_in: initialData.first_clock_in || '',
        mid_clock_out: initialData.mid_clock_out || '',
        mid_clock_in: initialData.mid_clock_in || '',
        last_clock_out: initialData.last_clock_out || '',
        total_hours: initialData.total_hours?.toString() || '',
        regular_hours: initialData.regular_hours?.toString() || '',
        ot_hours: initialData.ot_hours?.toString() || '',
        dt_hours: initialData.dt_hours?.toString() || '',
        correction_reason: initialData.correction_reason || '',
      })
    }
  }, [initialData])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateTime = (time: string): boolean => {
    if (!time) return true // Allow empty for optional punches
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
    return regex.test(time)
  }

  const validateHours = (hours: string): boolean => {
    if (!hours) return true // Allow empty
    const num = parseFloat(hours)
    return !isNaN(num) && num >= 0 && num <= 24
  }

  const calculateHours = (start: string | null, end: string | null): number => {
    if (!start || !end) return 0
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)

    const startTime = startH * 60 + startM
    const endTime = endH * 60 + endM

    let diff = endTime - startTime
    if (diff < 0) diff += 24 * 60 // Handle overnight shifts

    return diff / 60
  }

  const handleAutoCalculate = () => {
    const firstSegmentHours = calculateHours(formData.first_clock_in, formData.mid_clock_out)
    const secondSegmentHours = calculateHours(formData.mid_clock_in, formData.last_clock_out)
    const totalHours = firstSegmentHours + secondSegmentHours
    
    // Simple calculation - can be enhanced with business rules
    const regularHours = Math.min(totalHours, 8)
    const otHours = Math.max(0, Math.min(totalHours - 8, 4))
    const dtHours = Math.max(0, totalHours - 12)

    setFormData(prev => ({
      ...prev,
      total_hours: totalHours.toFixed(2),
      regular_hours: regularHours.toFixed(2),
      ot_hours: otHours.toFixed(2),
      dt_hours: dtHours.toFixed(2)
    }))
  }

  const handleSubmit = async () => {
    if (!initialData || !user) return

    // Basic validation
    if (!formData.correction_reason.trim()) {
      setError('Correction reason is required.')
      return
    }

    if (!validateTime(formData.first_clock_in) ||
        !validateTime(formData.mid_clock_out) ||
        !validateTime(formData.mid_clock_in) ||
        !validateTime(formData.last_clock_out)) {
      setError('Invalid time format. Please use HH:MM.')
      return
    }

    if (!validateHours(formData.total_hours) ||
        !validateHours(formData.regular_hours) ||
        !validateHours(formData.ot_hours) ||
        !validateHours(formData.dt_hours)) {
      setError('Invalid hours format. Please enter valid numbers.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const correctionData: TimecardCorrectionData = {
        override_first_clock_in: formData.first_clock_in || null,
        override_mid_clock_out: formData.mid_clock_out || null,
        override_mid_clock_in: formData.mid_clock_in || null,
        override_last_clock_out: formData.last_clock_out || null,
        override_total_hours: formData.total_hours ? parseFloat(formData.total_hours) : null,
        override_regular_hours: formData.regular_hours ? parseFloat(formData.regular_hours) : null,
        override_ot_hours: formData.ot_hours ? parseFloat(formData.ot_hours) : null,
        override_dt_hours: formData.dt_hours ? parseFloat(formData.dt_hours) : null,
        correction_reason: formData.correction_reason.trim(),
        corrected_by: user.email || 'Unknown'
      }

      await timecardService.correctDailySummary(
        initialData.tenant_id,
        initialData.employee_ref,
        initialData.work_date,
        correctionData
      )

      onSave()
    } catch (err) {
      console.error('Error saving correction:', err)
      setError('Failed to save correction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Timecard Correction</DialogTitle>
          {initialData && (
            <div className="text-sm text-gray-600">
              {initialData.employee_name} - {new Date(initialData.work_date).toLocaleDateString()}
            </div>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Clock Times</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAutoCalculate}
                  disabled={!formData.first_clock_in || !formData.last_clock_out}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Auto Calculate
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_clock_in">First Clock In</Label>
                  <Input
                    id="first_clock_in"
                    type="time"
                    value={formData.first_clock_in}
                    onChange={(e) => handleInputChange('first_clock_in', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mid_clock_out">Mid Clock Out</Label>
                  <Input
                    id="mid_clock_out"
                    type="time"
                    value={formData.mid_clock_out}
                    onChange={(e) => handleInputChange('mid_clock_out', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mid_clock_in">Mid Clock In</Label>
                  <Input
                    id="mid_clock_in"
                    type="time"
                    value={formData.mid_clock_in}
                    onChange={(e) => handleInputChange('mid_clock_in', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_clock_out">Last Clock Out</Label>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hours Breakdown</CardTitle>
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
                    max="24"
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
                    max="24"
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
                    max="24"
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
                    max="24"
                    value={formData.total_hours}
                    onChange={(e) => handleInputChange('total_hours', e.target.value)}
                    className="font-mono font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Correction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="correction_reason">Correction Reason *</Label>
                <Textarea
                  id="correction_reason"
                  placeholder="Briefly describe the reason for this correction."
                  value={formData.correction_reason}
                  onChange={(e) => handleInputChange('correction_reason', e.target.value)}
                  rows={3}
                />
              </div>
              {initialData?.corrected_by && (
                <div className="text-sm text-gray-500 mt-2">
                  Last corrected by {initialData.corrected_by} on {initialData.corrected_at ? new Date(initialData.corrected_at).toLocaleString() : 'Unknown'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Correction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
