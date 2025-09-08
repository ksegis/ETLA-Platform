'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X, User, Mail, Building, Shield, Phone, Briefcase, Save } from 'lucide-react'
import { userManagement, type UserUpdateData } from "@/lib/supabase"

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  department?: string
  job_title?: string
  role: string
  role_level: string
  tenant_id: string
  tenant_name: string
  is_active: boolean
  can_invite_users: boolean
  can_manage_sub_clients: boolean
  permission_scope: string
}

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User
  tenants: Array<{
    id: string
    name: string
    code: string
    tenant_type: string
  }>
}

interface UserUpdateFormData {
  full_name: string
  phone: string
  department: string
  job_title: string
  role: string
  role_level: string
  tenant_id: string
  is_active: boolean
  can_invite_users: boolean
  can_manage_sub_clients: boolean
  permission_scope: string
}

export default function UserEditModal({ isOpen, onClose, onSuccess, user, tenants }: UserEditModalProps) {
  const [formData, setFormData] = useState<UserUpdateFormData>({
    full_name: '',
    phone: '',
    department: '',
    job_title: '',
    role: 'user',
    role_level: 'sub_client',
    tenant_id: '',
    is_active: true,
    can_invite_users: false,
    can_manage_sub_clients: false,
    permission_scope: 'own'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        department: user.department || '',
        job_title: user.job_title || '',
        role: user.role,
        role_level: user.role_level,
        tenant_id: user.tenant_id,
        is_active: user.is_active,
        can_invite_users: user.can_invite_users,
        can_manage_sub_clients: user.can_manage_sub_clients,
        permission_scope: user.permission_scope
      })
    }
  }, [user])

  const handleInputChange = (field: keyof UserUpdateFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-adjust permission scope based on role level
    if (field === 'role_level') {
      const newScope = value === 'host' ? 'all' : value === 'primary_client' ? 'tenant' : 'own'
      setFormData(prev => ({
        ...prev,
        permission_scope: newScope
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.full_name || !formData.tenant_id) {
        setError('Please fill in all required fields')
        return
      }

      // Prepare update data
      const updateData: UserUpdateData = {
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
        job_title: formData.job_title || undefined,
        role: formData.role,
        role_level: formData.role_level,
        tenant_id: formData.tenant_id,
        is_active: formData.is_active,
        can_invite_users: formData.can_invite_users,
        can_manage_sub_clients: formData.can_manage_sub_clients,
        permission_scope: formData.permission_scope
      }

      const response = await userManagement.updateUser(user.id, updateData)
      
      if (response.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.error || 'Failed to update user')
      }
    } catch (err) {
      setError('An error occurred while updating the user')
      console.error('User update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate this user? They will lose access to the system.')) {
      setLoading(true)
      setError('')
      
      try {
        const response = await userManagement.deactivateUser(user.id)
        if (response.success) {
          onSuccess()
          onClose()
        } else {
          setError(response.error || 'Failed to deactivate user')
        }
      } catch (err) {
        setError('An error occurred while deactivating the user')
        console.error('User deactivation error:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleActivate = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await userManagement.activateUser(user.id)
      if (response.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.error || 'Failed to activate user')
      }
    } catch (err) {
      setError('An error occurred while activating the user')
      console.error('User activation error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Edit User: {user.full_name}
              </CardTitle>
              <CardDescription>
                Update user information, role, and permissions
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

            {/* User Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Account Status</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {user.is_active ? (
                    <Button type="button" size="sm" variant="outline" onClick={handleDeactivate} disabled={loading}>
                      Deactivate
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={handleActivate} disabled={loading}>
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e: any) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e: any) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e: any) => handleInputChange('job_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e: any) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Engineering"
                  />
                </div>
              </div>
            </div>

            {/* Role and Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Role and Permissions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Role Level *
                  </label>
                  <select
                    required
                    value={formData.role_level}
                    onChange={(e: any) => handleInputChange('role_level', e.target.value)}
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
                    onChange={(e: any) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    Tenant *
                  </label>
                  <select
                    required
                    value={formData.tenant_id}
                    onChange={(e: any) => handleInputChange('tenant_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map((tenant: any: any) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.tenant_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permission Scope
                  </label>
                  <select
                    value={formData.permission_scope}
                    onChange={(e: any) => handleInputChange('permission_scope', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="own">Own Data Only</option>
                    <option value="tenant">Tenant Scope</option>
                    <option value="all">All Data</option>
                  </select>
                </div>
              </div>

              {/* Additional Permissions */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="can_invite_users"
                    checked={formData.can_invite_users}
                    onChange={(e: any) => handleInputChange('can_invite_users', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_invite_users" className="ml-2 text-sm text-gray-700">
                    Can invite other users
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="can_manage_sub_clients"
                    checked={formData.can_manage_sub_clients}
                    onChange={(e: any) => handleInputChange('can_manage_sub_clients', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_manage_sub_clients" className="ml-2 text-sm text-gray-700">
                    Can manage sub-client users
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e: any) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Account is active
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

