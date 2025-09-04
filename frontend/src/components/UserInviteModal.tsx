'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X, Mail, Building, Shield, Send, Users } from 'lucide-react'
import { supabase } from "@/lib/supabase"

interface UserInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tenants: Array<{
    id: string
    name: string
    code: string
    tenant_type: string
  }>
}

interface InviteFormData {
  emails: string
  role: string
  role_level: string
  tenant_id: string
  message: string
  expires_in_days: number
}

export default function UserInviteModal({ isOpen, onClose, onSuccess, tenants }: UserInviteModalProps) {
  const [formData, setFormData] = useState<InviteFormData>({
    emails: '',
    role: 'user',
    role_level: 'sub_client',
    tenant_id: '',
    message: '',
    expires_in_days: 7
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailCount, setEmailCount] = useState(0)

  const handleInputChange = (field: keyof InviteFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Count emails when emails field changes
    if (field === 'emails') {
      const emails = (value as string).split(/[,\n]/).filter(email => email.trim().length > 0)
      setEmailCount(emails.length)
    }
  }

  const validateEmails = (emailString: string): string[] => {
    const emails = emailString.split(/[,\n]/).map(email => email.trim()).filter(email => email.length > 0)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    const validEmails: string[] = []
    const invalidEmails: string[] = []
    
    emails.forEach(email => {
      if (emailRegex.test(email)) {
        validEmails.push(email)
      } else {
        invalidEmails.push(email)
      }
    })
    
    if (invalidEmails.length > 0) {
      throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`)
    }
    
    return validEmails
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const validEmails = validateEmails(formData.emails)
      
      if (validEmails.length === 0) {
        throw new Error('Please enter at least one valid email address')
      }

      const response = await supabase.inviteUsers({
        emails: validEmails,
        role: formData.role,
        role_level: formData.role_level,
        tenant_id: formData.tenant_id,
        message: formData.message,
        expires_in_days: formData.expires_in_days
      })

      if (response.success) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          emails: '',
          role: 'user',
          role_level: 'sub_client',
          tenant_id: '',
          message: '',
          expires_in_days: 7
        })
        setEmailCount(0)
      } else {
        setError(response.error || 'Failed to send invitations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending invitations')
      console.error('Invitation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultMessage = () => {
    const selectedTenant = tenants.find(t => t.id === formData.tenant_id)
    return `You have been invited to join ${selectedTenant?.name || 'our organization'} on the ETLA Platform. Please click the link below to accept your invitation and set up your account.`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Invite Users
              </CardTitle>
              <CardDescription>
                Send email invitations to new users to join the platform
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Addresses */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recipients</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Addresses *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.emails}
                  onChange={(e) => handleInputChange('emails', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email addresses separated by commas or new lines:&#10;user1@company.com&#10;user2@company.com, user3@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {emailCount > 0 ? `${emailCount} email${emailCount > 1 ? 's' : ''} to be invited` : 'Separate multiple emails with commas or new lines'}
                </p>
              </div>
            </div>

            {/* Role and Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Role Assignment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Role Level *
                  </label>
                  <select
                    required
                    value={formData.role_level}
                    onChange={(e) => handleInputChange('role_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="sub_client">Sub Client</option>
                    <option value="primary_client">Primary Client</option>
                    <option value="host">Host Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    Tenant *
                  </label>
                  <select
                    required
                    value={formData.tenant_id}
                    onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.tenant_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Invitation Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Invitation Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In (Days)
                </label>
                <select
                  value={formData.expires_in_days}
                  onChange={(e) => handleInputChange('expires_in_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Message
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getDefaultMessage()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use the default invitation message
                </p>
              </div>
            </div>

            {/* Preview */}
            {emailCount > 0 && formData.tenant_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Invitation Preview
                </h4>
                <div className="text-sm text-blue-800">
                  <p><strong>{emailCount}</strong> user{emailCount > 1 ? 's' : ''} will be invited as <strong>{formData.role}</strong> ({formData.role_level}) to <strong>{tenants.find(t => t.id === formData.tenant_id)?.name}</strong></p>
                  <p className="mt-1">Invitations will expire in <strong>{formData.expires_in_days} day{formData.expires_in_days > 1 ? 's' : ''}</strong></p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || emailCount === 0}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : `Send ${emailCount} Invitation${emailCount > 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

