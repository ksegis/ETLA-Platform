'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, CheckCircle, Plus, X, Edit } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltips'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!
)

interface Roadblock {
  id: string
  project_id: string
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
  resolution_notes?: string
}

interface RoadblockManagerProps {
  projectId: string
}

export function RoadblockManager({ projectId }: RoadblockManagerProps) {
  const [roadblocks, setRoadblocks] = useState<Roadblock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [selectedRoadblock, setSelectedRoadblock] = useState<Roadblock | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    timeline_impact_days: 0,
    budget_impact: 0,
    resolution_plan: '',
    customer_visible: false
  })
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Fetch roadblocks from database
  useEffect(() => {
    fetchRoadblocks()
  }, [projectId])

  const fetchRoadblocks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_roadblocks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoadblocks(data || [])
    } catch (error) {
      console.error('Error fetching roadblocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.title.trim()) {
      alert('Please provide a title')
      return
    }

    try {
      const { error } = await supabase
        .from('project_roadblocks')
        .insert({
          project_id: projectId,
          ...formData,
          status: 'open',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      await fetchRoadblocks()
      handleCloseModal()
    } catch (error) {
      console.error('Error adding roadblock:', error)
      alert('Failed to add roadblock. Please try again.')
    }
  }

  const handleResolve = async () => {
    if (!selectedRoadblock || !resolutionNotes.trim()) {
      alert('Please provide resolution notes')
      return
    }

    try {
      const { error } = await supabase
        .from('project_roadblocks')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes
        })
        .eq('id', selectedRoadblock.id)

      if (error) throw error

      await fetchRoadblocks()
      setShowResolveModal(false)
      setSelectedRoadblock(null)
      setResolutionNotes('')
    } catch (error) {
      console.error('Error resolving roadblock:', error)
      alert('Failed to resolve roadblock. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      timeline_impact_days: 0,
      budget_impact: 0,
      resolution_plan: '',
      customer_visible: false
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      resolved: 'default',
      in_progress: 'secondary',
      open: 'destructive',
      closed: 'outline'
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Roadblocks
            <InfoTooltip content={TOOLTIP_CONTENT.host.roadblocks} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading roadblocks...</p>
        </CardContent>
      </Card>
    )
  }

  const openRoadblocks = roadblocks.filter((r) => r.status === 'open')
  const inProgressRoadblocks = roadblocks.filter((r) => r.status === 'in_progress')
  const resolvedRoadblocks = roadblocks.filter((r) => r.status === 'resolved')

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Roadblocks ({roadblocks.length})
              <InfoTooltip content={TOOLTIP_CONTENT.host.roadblocks} />
            </CardTitle>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Roadblock
            </Button>
          </div>
          {roadblocks.length > 0 && (
            <div className="flex gap-4 text-sm text-gray-600 mt-2">
              <span>Open: {openRoadblocks.length}</span>
              <span>In Progress: {inProgressRoadblocks.length}</span>
              <span>Resolved: {resolvedRoadblocks.length}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {roadblocks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No roadblocks yet. Click "Add Roadblock" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {roadblocks.map((roadblock) => (
                <div
                  key={roadblock.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(roadblock.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h4 className="font-medium">{roadblock.title}</h4>
                        {getStatusBadge(roadblock.status)}
                        <Badge variant="outline" className="text-xs">
                          {roadblock.severity.toUpperCase()}
                        </Badge>
                        {roadblock.customer_visible && (
                          <Badge variant="outline" className="text-xs">
                            Customer Visible
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{roadblock.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Timeline Impact:</span>{' '}
                          {roadblock.timeline_impact_days} days
                        </div>
                        <div>
                          <span className="font-medium">Budget Impact:</span> $
                          {roadblock.budget_impact.toLocaleString()}
                        </div>
                      </div>
                      {roadblock.resolution_plan && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                          <strong>Resolution Plan:</strong> {roadblock.resolution_plan}
                        </div>
                      )}
                      {roadblock.resolution_notes && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                          <strong>Resolution Notes:</strong> {roadblock.resolution_notes}
                        </div>
                      )}
                      {roadblock.resolved_at && (
                        <div className="mt-2 text-xs text-gray-600">
                          Resolved: {new Date(roadblock.resolved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {roadblock.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRoadblock(roadblock)
                          setShowResolveModal(true)
                        }}
                        className="ml-4"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Roadblock Modal */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Roadblock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">
                Title *
                <InfoTooltip content="Brief, clear description of the roadblock" />
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Vendor Delay on Critical Component"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the roadblock..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value as any })
                  }
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="timeline_impact">Timeline Impact (days)</Label>
                <Input
                  id="timeline_impact"
                  type="number"
                  value={formData.timeline_impact_days}
                  onChange={(e) =>
                    setFormData({ ...formData, timeline_impact_days: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget_impact">Budget Impact ($)</Label>
              <Input
                id="budget_impact"
                type="number"
                value={formData.budget_impact}
                onChange={(e) =>
                  setFormData({ ...formData, budget_impact: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="resolution_plan">Resolution Plan</Label>
              <Textarea
                id="resolution_plan"
                value={formData.resolution_plan}
                onChange={(e) => setFormData({ ...formData, resolution_plan: e.target.value })}
                placeholder="How do you plan to resolve this roadblock?"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customer_visible"
                checked={formData.customer_visible}
                onChange={(e) =>
                  setFormData({ ...formData, customer_visible: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="customer_visible" className="cursor-pointer">
                Make visible to customer
                <InfoTooltip content="When checked, this roadblock will be visible on the customer dashboard" />
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!formData.title.trim()}>
              Add Roadblock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Roadblock Modal */}
      <Dialog open={showResolveModal} onOpenChange={() => setShowResolveModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Roadblock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRoadblock && (
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium mb-1">{selectedRoadblock.title}</h4>
                <p className="text-sm text-gray-600">{selectedRoadblock.description}</p>
              </div>
            )}

            <div>
              <Label htmlFor="resolution_notes">
                Resolution Notes *
                <InfoTooltip content="Describe how this roadblock was resolved" />
              </Label>
              <Textarea
                id="resolution_notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain how this roadblock was resolved..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolutionNotes.trim()}>
              Mark as Resolved
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
