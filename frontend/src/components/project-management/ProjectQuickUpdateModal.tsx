'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltips'

interface ProjectQuickUpdateModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  projectName: string
  currentHealthStatus?: 'green' | 'yellow' | 'red'
  currentCompletion?: number
  onUpdate: (data: ProjectUpdateData) => Promise<void>
}

export interface ProjectUpdateData {
  health_status: 'green' | 'yellow' | 'red'
  health_status_explanation: string
  completion_percentage: number
  budget_variance_percentage: number
  timeline_variance_days: number
  next_customer_action: string
}

export function ProjectQuickUpdateModal({
  open,
  onClose,
  projectId,
  projectName,
  currentHealthStatus = 'green',
  currentCompletion = 0,
  onUpdate
}: ProjectQuickUpdateModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProjectUpdateData>({
    health_status: currentHealthStatus,
    health_status_explanation: '',
    completion_percentage: currentCompletion,
    budget_variance_percentage: 0,
    timeline_variance_days: 0,
    next_customer_action: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onUpdate(formData)
      onClose()
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'yellow':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'red':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case 'green':
        return 'On Track'
      case 'yellow':
        return 'At Risk'
      case 'red':
        return 'Blocked'
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Quick Update: {projectName}
            <InfoTooltip content={TOOLTIP_CONTENT.host.quickUpdate} />
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Health Status */}
          <div className="space-y-2">
            <Label htmlFor="health_status" className="flex items-center gap-2">
              Project Health Status
              <InfoTooltip content={TOOLTIP_CONTENT.host.healthStatus} />
            </Label>
            <Select
              value={formData.health_status}
              onValueChange={(value) =>
                setFormData({ ...formData, health_status: value as 'green' | 'yellow' | 'red' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">
                  <div className="flex items-center gap-2">
                    {getHealthStatusIcon('green')}
                    <span>{getHealthStatusLabel('green')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="yellow">
                  <div className="flex items-center gap-2">
                    {getHealthStatusIcon('yellow')}
                    <span>{getHealthStatusLabel('yellow')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="red">
                  <div className="flex items-center gap-2">
                    {getHealthStatusIcon('red')}
                    <span>{getHealthStatusLabel('red')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Health Status Explanation */}
          <div className="space-y-2">
            <Label htmlFor="health_status_explanation">
              Status Explanation (Customer-Visible)
            </Label>
            <Textarea
              id="health_status_explanation"
              value={formData.health_status_explanation}
              onChange={(e) =>
                setFormData({ ...formData, health_status_explanation: e.target.value })
              }
              placeholder="Explain the current project status to the customer..."
              rows={3}
              required
            />
          </div>

          {/* Completion Percentage */}
          <div className="space-y-2">
            <Label htmlFor="completion_percentage" className="flex items-center gap-2">
              Completion Percentage
              <InfoTooltip content={TOOLTIP_CONTENT.host.completionPercentage} />
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="completion_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.completion_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, completion_percentage: parseInt(e.target.value) || 0 })
                }
                className="w-24"
                required
              />
              <span className="text-sm text-gray-500">%</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${formData.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Budget Variance */}
          <div className="space-y-2">
            <Label htmlFor="budget_variance_percentage" className="flex items-center gap-2">
              Budget Variance
              <InfoTooltip content={TOOLTIP_CONTENT.host.budgetVariance} />
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="budget_variance_percentage"
                type="number"
                step="0.1"
                value={formData.budget_variance_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, budget_variance_percentage: parseFloat(e.target.value) || 0 })
                }
                className="w-32"
              />
              <span className="text-sm text-gray-500">% (negative = under budget)</span>
            </div>
          </div>

          {/* Timeline Variance */}
          <div className="space-y-2">
            <Label htmlFor="timeline_variance_days" className="flex items-center gap-2">
              Timeline Variance
              <InfoTooltip content={TOOLTIP_CONTENT.host.timelineVariance} />
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="timeline_variance_days"
                type="number"
                value={formData.timeline_variance_days}
                onChange={(e) =>
                  setFormData({ ...formData, timeline_variance_days: parseInt(e.target.value) || 0 })
                }
                className="w-32"
              />
              <span className="text-sm text-gray-500">days (negative = ahead of schedule)</span>
            </div>
          </div>

          {/* Next Customer Action */}
          <div className="space-y-2">
            <Label htmlFor="next_customer_action" className="flex items-center gap-2">
              Next Customer Action Required
              <InfoTooltip content={TOOLTIP_CONTENT.host.nextCustomerAction} />
            </Label>
            <Textarea
              id="next_customer_action"
              value={formData.next_customer_action}
              onChange={(e) =>
                setFormData({ ...formData, next_customer_action: e.target.value })
              }
              placeholder="What does the customer need to do next? (e.g., 'Review design mockups by Friday')"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectQuickUpdateModal
