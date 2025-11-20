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
import { Calendar, CheckCircle, Circle, Plus, Edit, Trash2 } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltips'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Milestone {
  id: string
  project_id: string
  milestone_name: string
  description: string | null
  due_date: string
  status: 'not_started' | 'in_progress' | 'completed'
  customer_visible: boolean
  customer_action_required: string | null
  definition_of_done: string | null
  created_at: string
  updated_at: string
}

interface MilestoneManagerProps {
  projectId: string
}

export function MilestoneManager({ projectId }: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [formData, setFormData] = useState({
    milestone_name: '',
    description: '',
    due_date: '',
    status: 'not_started' as 'not_started' | 'in_progress' | 'completed',
    customer_visible: true,
    customer_action_required: '',
    definition_of_done: ''
  })

  // Fetch milestones from database
  useEffect(() => {
    fetchMilestones()
  }, [projectId])

  const fetchMilestones = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true })

      if (error) throw error
      setMilestones(data || [])
    } catch (error) {
      console.error('Error fetching milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingMilestone) {
        // Update existing milestone
        const { error } = await supabase
          .from('project_milestones')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMilestone.id)

        if (error) throw error
      } else {
        // Create new milestone
        const { error } = await supabase
          .from('project_milestones')
          .insert({
            project_id: projectId,
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Refresh milestones
      await fetchMilestones()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving milestone:', error)
      alert('Failed to save milestone. Please try again.')
    }
  }

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return

    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId)

      if (error) throw error

      // Refresh milestones
      await fetchMilestones()
    } catch (error) {
      console.error('Error deleting milestone:', error)
      alert('Failed to delete milestone. Please try again.')
    }
  }

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setFormData({
      milestone_name: milestone.milestone_name,
      description: milestone.description || '',
      due_date: milestone.due_date.split('T')[0], // Format for date input
      status: milestone.status,
      customer_visible: milestone.customer_visible,
      customer_action_required: milestone.customer_action_required || '',
      definition_of_done: milestone.definition_of_done || ''
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingMilestone(null)
    setFormData({
      milestone_name: '',
      description: '',
      due_date: '',
      status: 'not_started',
      customer_visible: true,
      customer_action_required: '',
      definition_of_done: ''
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      in_progress: 'secondary',
      not_started: 'outline'
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
            <Calendar className="h-5 w-5" />
            Milestones
            <InfoTooltip content={TOOLTIP_CONTENT.host.milestones} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading milestones...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Milestones ({milestones.length})
              <InfoTooltip content={TOOLTIP_CONTENT.host.milestones} />
            </CardTitle>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No milestones yet. Click "Add Milestone" to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(milestone.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{milestone.milestone_name}</h4>
                          {getStatusBadge(milestone.status)}
                          {milestone.customer_visible && (
                            <Badge variant="outline" className="text-xs">
                              Customer Visible
                            </Badge>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                          {milestone.customer_action_required && (
                            <span className="text-orange-600 font-medium">
                              Customer Action Required
                            </span>
                          )}
                        </div>
                        {milestone.definition_of_done && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Definition of Done:</strong> {milestone.definition_of_done}
                          </div>
                        )}
                        {milestone.customer_action_required && (
                          <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
                            <strong>Customer Action:</strong> {milestone.customer_action_required}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(milestone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="milestone_name">
                Milestone Name *
                <InfoTooltip content="Clear, concise name for this milestone (e.g., 'Design Approval', 'Phase 1 Complete')" />
              </Label>
              <Input
                id="milestone_name"
                value={formData.milestone_name}
                onChange={(e) => setFormData({ ...formData, milestone_name: e.target.value })}
                placeholder="e.g., Design Approval"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of this milestone..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="definition_of_done">
                Definition of Done
                <InfoTooltip content="Clear criteria that define when this milestone is complete. Helps prevent scope creep." />
              </Label>
              <Textarea
                id="definition_of_done"
                value={formData.definition_of_done}
                onChange={(e) => setFormData({ ...formData, definition_of_done: e.target.value })}
                placeholder="e.g., All designs approved by stakeholders, feedback incorporated, final files delivered"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="customer_action">
                Customer Action Required
                <InfoTooltip content="Specific action the customer needs to take to complete this milestone (leave blank if no action needed)" />
              </Label>
              <Textarea
                id="customer_action"
                value={formData.customer_action_required}
                onChange={(e) =>
                  setFormData({ ...formData, customer_action_required: e.target.value })
                }
                placeholder="e.g., Review and approve design mockups by Friday"
                rows={2}
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
                <InfoTooltip content="When checked, this milestone will appear on the customer's project dashboard" />
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.milestone_name || !formData.due_date}
            >
              {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
