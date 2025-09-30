
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle, Clock } from 'lucide-react'
import timecardService, { TimecardDailySummaryV2 } from '@/services/timecardService'
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

    setLoading(true)
    setError(null)

    try {
      const updatedRecord = {
        ...initialData,
        first_clock_in: formData.first_clock_in || null,
        mid_clock_out: formData.mid_clock_out || null,
        mid_clock_in: formData.mid_clock_in || null,
        last_clock_out: formData.last_clock_out || null,
        correction_reason: formData.correction_reason.trim(),
        corrected_by: user.email || 'Unknown',
        corrected_at: new Date().toISOString(),
        is_corrected: true,
      }

      // Recalculate hours based on new punches
      const firstSegmentHours = calculateHours(updatedRecord.first_clock_in, updatedRecord.mid_clock_out)
      const secondSegmentHours = calculateHours(updatedRecord.mid_clock_in, updatedRecord.last_clock_out)
      updatedRecord.total_hours = firstSegmentHours + secondSegmentHours
      updatedRecord.regular_hours = Math.min(updatedRecord.total_hours, 8) // Simple example
      updatedRecord.ot_hours = Math.max(0, updatedRecord.total_hours - 8) // Simple example
      updatedRecord.dt_hours = 0 // Not implemented in this example

      await timecardService.updateDailySummary(updatedRecord)
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Timecard Correction</DialogTitle>
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
              <CardTitle className="text-lg">Clock Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_clock_in">Clock In</Label>
                  <Input
                    id="first_clock_in"
                    type="time"
                    value={formData.first_clock_in}
                    onChange={(e) => handleInputChange('first_clock_in', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mid_clock_out">Clock Out</Label>
                  <Input
                    id="mid_clock_out"
                    type="time"
                    value={formData.mid_clock_out}
                    onChange={(e) => handleInputChange('mid_clock_out', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mid_clock_in">Clock In</Label>
                  <Input
                    id="mid_clock_in"
                    type="time"
                    value={formData.mid_clock_in}
                    onChange={(e) => handleInputChange('mid_clock_in', e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_clock_out">Clock Out</Label>
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
              <CardTitle className="text-lg">Correction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="correction_reason">Correction Reason</Label>
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

