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
import { MessageSquare, Plus, Clock } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltips'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!
)

interface StatusUpdate {
  id: string
  project_id: string
  tenant_id: string
  update_type: 'milestone_completed' | 'status_change' | 'risk_identified' | 'general_update'
  title: string
  description: string
  customer_visible: boolean
  created_at: string
}

interface StatusUpdateFormProps {
  projectId: string
  tenantId: string
}

export function StatusUpdateForm({ projectId, tenantId }: StatusUpdateFormProps) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    update_type: 'general_update' as 'milestone_completed' | 'status_change' | 'risk_identified' | 'general_update',
    title: '',
    description: '',
    customer_visible: true
  })

  // Fetch status updates from database
  useEffect(() => {
    fetchUpdates()
  }, [projectId])

  const fetchUpdates = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_status_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setUpdates(data || [])
    } catch (error) {
      console.error('Error fetching status updates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('project_status_updates')
        .insert({
          project_id: projectId,
          tenant_id: tenantId,
          ...formData,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Refresh updates
      await fetchUpdates()
      handleCloseDialog()

      // If customer-visible, create a notification
      if (formData.customer_visible) {
        await supabase
          .from('customer_project_notifications')
          .insert({
            project_id: projectId,
            tenant_id: tenantId,
            notification_type: 'status_update',
            title: formData.title,
            message: formData.description,
            severity: formData.update_type === 'risk_identified' ? 'high' : 'medium',
            is_read: false,
            created_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error creating status update:', error)
      alert('Failed to create status update. Please try again.')
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setFormData({
      update_type: 'general_update',
      title: '',
      description: '',
      customer_visible: true
    })
  }

  const getUpdateTypeBadge = (type: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      milestone_completed: { label: 'Milestone', variant: 'default' },
      status_change: { label: 'Status Change', variant: 'secondary' },
      risk_identified: { label: 'Risk', variant: 'destructive' },
      general_update: { label: 'Update', variant: 'outline' }
    }
    const { label, variant } = config[type] || config.general_update
    return <Badge variant={variant}>{label}</Badge>
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Status Updates
            <InfoTooltip content={TOOLTIP_CONTENT.host.statusUpdates} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading updates...</p>
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
              <MessageSquare className="h-5 w-5" />
              Status Updates ({updates.length})
              <InfoTooltip content={TOOLTIP_CONTENT.host.statusUpdates} />
            </CardTitle>
            <Button id="add-status-update-btn" onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Post Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No status updates yet. Click "Post Update" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getUpdateTypeBadge(update.update_type)}
                      {update.customer_visible && (
                        <Badge variant="outline" className="text-xs">
                          Customer Visible
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(update.created_at)}
                    </div>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{update.title}</h4>
                  <p className="text-sm text-gray-600">{update.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Status Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="update_type">
                Update Type
                <InfoTooltip content="Choose the type of update to help customers understand the context" />
              </Label>
              <Select
                value={formData.update_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, update_type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_update">General Update</SelectItem>
                  <SelectItem value="milestone_completed">Milestone Completed</SelectItem>
                  <SelectItem value="status_change">Status Change</SelectItem>
                  <SelectItem value="risk_identified">Risk Identified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">
                Title *
                <InfoTooltip content="Short, clear summary of the update (e.g., 'Design Phase Complete', 'Awaiting Client Feedback')" />
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Design Phase Complete"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">
                Description *
                <InfoTooltip content="Detailed information about this update. Be clear and specific for customer transparency." />
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide details about this update..."
                rows={5}
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
                <InfoTooltip content="When checked, this update will appear in the customer's activity feed and may trigger a notification" />
              </Label>
            </div>

            {formData.customer_visible && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <strong>Note:</strong> This update will appear in the customer's activity feed
                {formData.update_type === 'risk_identified' && (
                  <span className="text-orange-600">
                    {' '}
                    and will trigger a high-priority notification
                  </span>
                )}
                .
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || !formData.description.trim()}
            >
              Post Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
