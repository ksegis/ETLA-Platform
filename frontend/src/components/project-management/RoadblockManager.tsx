'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, CheckCircle, Plus, X } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltips'

interface Roadblock {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  timeline_impact_days: number
  budget_impact: number
  resolution_plan: string
  customer_visible: boolean
  created_at: string
  resolved_at?: string
}

interface RoadblockManagerProps {
  projectId: string
  roadblocks: Roadblock[]
  onAdd: (data: Partial<Roadblock>) => Promise<void>
  onUpdate: (id: string, data: Partial<Roadblock>) => Promise<void>
  onResolve: (id: string, notes: string) => Promise<void>
}

export function RoadblockManager({
  projectId,
  roadblocks,
  onAdd,
  onUpdate,
  onResolve
}: RoadblockManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRoadblock, setSelectedRoadblock] = useState<Roadblock | null>(null)
  const [loading, setLoading] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'open':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const openRoadblocks = roadblocks.filter(r => r.status === 'open' || r.status === 'in_progress')
  const resolvedRoadblocks = roadblocks.filter(r => r.status === 'resolved' || r.status === 'closed')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Project Roadblocks</h3>
          <InfoTooltip content={TOOLTIP_CONTENT.host.roadblocks} />
          {openRoadblocks.length > 0 && (
            <Badge variant="destructive">{openRoadblocks.length} Active</Badge>
          )}
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Roadblock
        </Button>
      </div>

      {/* Open Roadblocks */}
      {openRoadblocks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Active Roadblocks</h4>
          {openRoadblocks.map((roadblock) => (
            <Card key={roadblock.id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <CardTitle className="text-base">{roadblock.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getSeverityColor(roadblock.severity)}>
                        {roadblock.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(roadblock.status)}>
                        {roadblock.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {roadblock.customer_visible && (
                        <Badge variant="outline">Customer Visible</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRoadblock(roadblock)}
                  >
                    Resolve
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{roadblock.description}</p>
                {roadblock.resolution_plan && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-blue-900 mb-1">Resolution Plan:</p>
                    <p className="text-sm text-blue-800">{roadblock.resolution_plan}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {roadblock.timeline_impact_days > 0 && (
                    <span>⏱️ +{roadblock.timeline_impact_days} days</span>
                  )}
                  {roadblock.budget_impact > 0 && (
                    <span>💰 +${roadblock.budget_impact.toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolved Roadblocks */}
      {resolvedRoadblocks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Resolved Roadblocks</h4>
          {resolvedRoadblocks.map((roadblock) => (
            <Card key={roadblock.id} className="opacity-75">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <CardTitle className="text-sm">{roadblock.title}</CardTitle>
                  <Badge className={getStatusColor(roadblock.status)}>
                    {roadblock.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {roadblocks.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No roadblocks reported. Great!</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Roadblock Modal */}
      <AddRoadblockModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAdd}
      />

      {/* Resolve Roadblock Modal */}
      {selectedRoadblock && (
        <ResolveRoadblockModal
          open={!!selectedRoadblock}
          roadblock={selectedRoadblock}
          onClose={() => setSelectedRoadblock(null)}
          onResolve={onResolve}
        />
      )}
    </div>
  )
}

// Add Roadblock Modal Component
function AddRoadblockModal({
  open,
  onClose,
  onAdd
}: {
  open: boolean
  onClose: () => void
  onAdd: (data: Partial<Roadblock>) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    timeline_impact_days: 0,
    budget_impact: 0,
    resolution_plan: '',
    customer_visible: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onAdd(formData)
      onClose()
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        timeline_impact_days: 0,
        budget_impact: 0,
        resolution_plan: '',
        customer_visible: true
      })
    } catch (error) {
      console.error('Failed to add roadblock:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Project Roadblock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Roadblock Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the roadblock"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline_impact">Timeline Impact (days)</Label>
              <Input
                id="timeline_impact"
                type="number"
                min="0"
                value={formData.timeline_impact_days}
                onChange={(e) =>
                  setFormData({ ...formData, timeline_impact_days: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution_plan">Resolution Plan</Label>
            <Textarea
              id="resolution_plan"
              value={formData.resolution_plan}
              onChange={(e) => setFormData({ ...formData, resolution_plan: e.target.value })}
              placeholder="How will this be resolved?"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="customer_visible"
              checked={formData.customer_visible}
              onChange={(e) => setFormData({ ...formData, customer_visible: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="customer_visible" className="cursor-pointer">
              Make visible to customer
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Roadblock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Resolve Roadblock Modal Component
function ResolveRoadblockModal({
  open,
  roadblock,
  onClose,
  onResolve
}: {
  open: boolean
  roadblock: Roadblock
  onClose: () => void
  onResolve: (id: string, notes: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onResolve(roadblock.id, notes)
      onClose()
    } catch (error) {
      console.error('Failed to resolve roadblock:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Roadblock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium">{roadblock.title}</p>
            <p className="text-sm text-gray-600 mt-1">{roadblock.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution_notes">Resolution Notes *</Label>
            <Textarea
              id="resolution_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe how this roadblock was resolved..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RoadblockManager
