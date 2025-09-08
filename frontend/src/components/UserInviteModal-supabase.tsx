'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X, Mail, Users, Send, Clock, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Tenant {
  id: string
  name: string
  code: string
}

interface UserInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tenants: Tenant[]
}

interface InvitationData {
  email: string
  tenant_id: string
  role: string
  role_level: string
  permission_scope: string
  expires_at: string
}

export default function UserInviteModal({ isOpen, onClose, onSuccess, tenants }: UserInviteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    emails: '',
    tenant_id: '',
    role: 'user',
    role_level: 'sub_client',
    permission_scope: 'own',
    expires_in_days: 7,
    custom_message: '',
    send_immediately: true
  })
  const [invitationPreview, setInvitationPreview] = useState<InvitationData[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
    { value: 'viewer', label: 'Viewer' }
  ]

  const roleLevels = [
    { value: 'host', label: 'Host Admin' },
    { value: 'primary_client', label: 'Primary Client' },
    { value: 'sub_client', label: 'Sub Client' }
  ]

  const permissionScopes = [
    { value: 'all', label: 'All Tenants' },
    { value: 'tenant', label: 'Tenant Level' },
    { value: 'own', label: 'Own Data Only' }
  ]

  const parseEmails = (emailString: string): string[] => {
    return emailString
      .split(/[,\n]/)
      .map((email: any: any) => email.trim())
      .filter((email: any: any) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  }

  const generatePreview = () => {
    const emails = parseEmails(formData.emails)
    if (emails.length === 0) {
      setError('Please enter at least one valid email address')
      return
    }

    if (!formData.tenant_id) {
      setError('Please select a tenant')
      return
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + formData.expires_in_days)

    const preview: InvitationData[] = emails.map((email: any: any) => ({
      email,
      tenant_id: formData.tenant_id,
      role: formData.role,
      role_level: formData.role_level,
      permission_scope: formData.permission_scope,
      expires_at: expiresAt.toISOString()
    }))

    setInvitationPreview(preview)
    setShowPreview(true)
    setError('')
  }

  const sendInvitations = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const invitationPromises = invitationPreview.map(async (invitation: any) => {
        // Create invitation record
        const { data: inviteData, error: inviteError } = await supabase
          .from('user_invitations')
          .insert({
            email: invitation.email,
            tenant_id: invitation.tenant_id,
            role: invitation.role,
            role_level: invitation.role_level,
            permission_scope: invitation.permission_scope,
            expires_at: invitation.expires_at,
            custom_message: formData.custom_message || null,
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (inviteError) throw inviteError

        // Send invitation email using Supabase Auth
        if (formData.send_immediately) {
          const inviteToken = btoa(JSON.stringify({
            email: invitation.email,
            invitation_id: inviteData.id,
            tenant_id: invitation.tenant_id
          }))

          const inviteUrl = `${window.location.origin}/accept-invitation?token=${inviteToken}`

          // Note: In a real implementation, you'd use a proper email service
          // For now, we'll use Supabase's password reset as a workaround
          const { error: emailError } = await supabase.auth.resetPasswordForEmail(
            invitation.email,
            {
              redirectTo: inviteUrl
            }
          )

          if (emailError) {
            console.warn(`Failed to send email to ${invitation.email}:`, emailError)
            // Don't fail the entire operation for email issues
          }
        }

        return inviteData
      })

      const results = await Promise.allSettled(invitationPromises)
      const successful = results.filter((result: any: any) => result.status === 'fulfilled').length
      const failed = results.filter((result: any: any) => result.status === 'rejected').length

      if (successful > 0) {
        setSuccess(`Successfully sent ${successful} invitation(s)${failed > 0 ? ` (${failed} failed)` : ''}`)
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 2000)
      } else {
        setError('Failed to send any invitations')
      }
    } catch (error: any) {
      console.error('Error sending invitations:', error)
      setError(error.message || 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      emails: '',
      tenant_id: '',
      role: 'user',
      role_level: 'sub_client',
      permission_scope: 'own',
      expires_in_days: 7,
      custom_message: '',
      send_immediately: true
    })
    setInvitationPreview([])
    setShowPreview(false)
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite Users
              </CardTitle>
              <CardDescription>
                Send invitations to new users to join your organization
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!showPreview ? (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email Addresses */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Addresses *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.emails}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, emails: e.target.value }))}
                  placeholder="Enter email addresses separated by commas or new lines:&#10;user1@company.com&#10;user2@company.com, user3@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple email addresses with commas or new lines
                </p>
              </div>

              {/* Role Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tenant *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.tenant_id}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, tenant_id: e.target.value }))}
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map((tenant: any: any) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.role_level}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, role_level: e.target.value }))}
                  >
                    {roleLevels.map((level: any: any) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.role}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    {roles.map((role: any: any) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Permission Scope
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.permission_scope}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, permission_scope: e.target.value }))}
                  >
                    {permissionScopes.map((scope: any: any) => (
                      <option key={scope.value} value={scope.value}>
                        {scope.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invitation Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Invitation Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Expires In (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.expires_in_days}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, expires_in_days: parseInt(e.target.value) || 7 }))}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="send_immediately"
                      checked={formData.send_immediately}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, send_immediately: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="send_immediately" className="text-sm">
                      Send invitations immediately
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.custom_message}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, custom_message: e.target.value }))}
                    placeholder="Add a personal message to the invitation email..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={generatePreview}>
                  Preview Invitations
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5" />
                  Invitation Preview ({invitationPreview.length} users)
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {invitationPreview.map((invitation, index: any) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          {roles.find((r: any) => r.value === invitation.role)?.label} • 
                          {roleLevels.find((l: any) => l.value === invitation.role_level)?.label}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.custom_message && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Custom Message
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">{formData.custom_message}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowPreview(false)}>
                  Back to Edit
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={sendInvitations} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending...' : `Send ${invitationPreview.length} Invitation(s)`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

