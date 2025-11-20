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
import { Package, Plus, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltips'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Deliverable {
  id: string
  project_id: string
  tenant_id: string
  deliverable_name: string
  description: string | null
  due_date: string
  status: 'pending' | 'in_progress' | 'delivered' | 'approved'
  milestone_id: string | null
  file_url: string | null
  created_at: string
  updated_at: string
}

interface Milestone {
  id: string
  milestone_name: string
}

interface DeliverableTrackerProps {
  projectId: string
  tenantId: string
}

export function DeliverableTracker({ projectId, tenantId }: DeliverableTrackerProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null)
  const [formData, setFormData] = useState({
    deliverable_name: '',
    description: '',
    due_date: '',
    status: 'pending' as 'pending' | 'in_progress' | 'delivered' | 'approved',
    milestone_id: '',
    file_url: ''
  })

  // Fetch deliverables and milestones from database
  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch deliverables
      const { data: delivData, error: delivError } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true })

      if (delivError) throw delivError
      setDeliverables(delivData || [])

      // Fetch milestones for dropdown
      const { data: milestoneData, error: milestoneError } = await supabase
        .from('project_milestones')
        .select('id, milestone_name')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true })

      if (milestoneError) throw milestoneError
      setMilestones(milestoneData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.deliverable_name.trim() || !formData.due_date) {
      alert('Please fill in all required fields')
      return
    }

    try {
      if (editingDeliverable) {
        // Update existing deliverable
        const { error } = await supabase
          .from('project_deliverables')
          .update({
            ...formData,
            milestone_id: formData.milestone_id || null,
            file_url: formData.file_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDeliverable.id)

        if (error) throw error
      } else {
        // Create new deliverable
        const { error } = await supabase
          .from('project_deliverables')
          .insert({
            project_id: projectId,
            tenant_id: tenantId,
            ...formData,
            milestone_id: formData.milestone_id || null,
            file_url: formData.file_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Refresh deliverables
      await fetchData()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving deliverable:', error)
      alert('Failed to save deliverable. Please try again.')
    }
  }

  const handleDelete = async (deliverableId: string) => {
    if (!confirm('Are you sure you want to delete this deliverable?')) return

    try {
      const { error } = await supabase
        .from('project_deliverables')
        .delete()
        .eq('id', deliverableId)

      if (error) throw error

      // Refresh deliverables
      await fetchData()
    } catch (error) {
      console.error('Error deleting deliverable:', error)
      alert('Failed to delete deliverable. Please try again.')
    }
  }

  const handleEdit = (deliverable: Deliverable) => {
    setEditingDeliverable(deliverable)
    setFormData({
      deliverable_name: deliverable.deliverable_name,
      description: deliverable.description || '',
      due_date: deliverable.due_date.split('T')[0],
      status: deliverable.status,
      milestone_id: deliverable.milestone_id || '',
      file_url: deliverable.file_url || ''
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingDeliverable(null)
    setFormData({
      deliverable_name: '',
      description: '',
      due_date: '',
      status: 'pending',
      milestone_id: '',
      file_url: ''
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'delivered':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-orange-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      delivered: 'secondary',
      in_progress: 'outline',
      pending: 'outline'
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getMilestoneName = (milestoneId: string | null) => {
    if (!milestoneId) return null
    const milestone = milestones.find((m) => m.id === milestoneId)
    return milestone?.milestone_name
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'approved' || status === 'delivered') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Deliverables
            <InfoTooltip content={TOOLTIP_CONTENT.host.deliverables} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading deliverables...</p>
        </CardContent>
      </Card>
    )
  }

  const pendingCount = deliverables.filter((d) => d.status === 'pending').length
  const inProgressCount = deliverables.filter((d) => d.status === 'in_progress').length
  const deliveredCount = deliverables.filter((d) => d.status === 'delivered').length
  const approvedCount = deliverables.filter((d) => d.status === 'approved').length

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Deliverables ({deliverables.length})
              <InfoTooltip content={TOOLTIP_CONTENT.host.deliverables} />
            </CardTitle>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          </div>
          {deliverables.length > 0 && (
            <div className="flex gap-4 text-sm text-gray-600 mt-2">
              <span>Pending: {pendingCount}</span>
              <span>In Progress: {inProgressCount}</span>
              <span>Delivered: {deliveredCount}</span>
              <span>Approved: {approvedCount}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {deliverables.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No deliverables yet. Click "Add Deliverable" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {deliverables.map((deliverable) => {
                const overdue = isOverdue(deliverable.due_date, deliverable.status)
                const milestoneName = getMilestoneName(deliverable.milestone_id)

                return (
                  <div
                    key={deliverable.id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                      overdue ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(deliverable.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{deliverable.deliverable_name}</h4>
                            {getStatusBadge(deliverable.status)}
                            {overdue && (
                              <Badge variant="destructive" className="text-xs">
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                          {deliverable.description && (
                            <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Due: {new Date(deliverable.due_date).toLocaleDateString()}
                            </span>
                            {milestoneName && (
                              <span className="text-blue-600">→ {milestoneName}</span>
                            )}
                          </div>
                          {deliverable.file_url && (
                            <div className="mt-2">
                              <a
                                href={deliverable.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View File →
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(deliverable)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(deliverable.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDeliverable ? 'Edit Deliverable' : 'Add New Deliverable'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deliverable_name">
                Deliverable Name *
                <InfoTooltip content="Clear name for this deliverable (e.g., 'Final Design Files', 'User Documentation')" />
              </Label>
              <Input
                id="deliverable_name"
                value={formData.deliverable_name}
                onChange={(e) => setFormData({ ...formData, deliverable_name: e.target.value })}
                placeholder="e.g., Final Design Files"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of this deliverable..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="milestone_id">
                Link to Milestone (Optional)
                <InfoTooltip content="Associate this deliverable with a milestone for better tracking" />
              </Label>
              <Select
                value={formData.milestone_id}
                onValueChange={(value) => setFormData({ ...formData, milestone_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a milestone..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Milestone</SelectItem>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.milestone_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file_url">
                File URL (Optional)
                <InfoTooltip content="Link to the deliverable file (e.g., Google Drive, Dropbox, etc.)" />
              </Label>
              <Input
                id="file_url"
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.deliverable_name || !formData.due_date}
            >
              {editingDeliverable ? 'Update Deliverable' : 'Add Deliverable'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
