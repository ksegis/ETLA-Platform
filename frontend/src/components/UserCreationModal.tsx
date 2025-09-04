'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X, User, Mail, Building, Shield, Phone, Briefcase } from 'lucide-react'
import { userManagement, type UserCreationData } from "@/lib/supabase"

interface UserCreationModalProps {
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

interface UserFormData {
  email: string
  full_name: string
  phone: string
  department: string
  job_title: string
  role: string
  role_level: string
  tenant_id: string
  password: string
  can_invite_users: boolean
  can_manage_sub_clients: boolean
  permission_scope: string
}

export default function UserCreationModal({ isOpen, onClose, onSuccess, tenants }: UserCreationModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    phone: '',
    department: '',
    job_title: '',
    role: 'user',
    role_level: 'sub_client',
    tenant_id: '',
    password: '',
    can_invite_users: false,
    can_manage_sub_clients: false,
    permission_scope: 'own'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.email || !formData.full_name || !formData.tenant_id || !formData.password) {
        setError('Please fill in all required fields')
        return
      }

      // Prepare user creation data
      const userData: UserCreationData = {
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
        job_title: formData.job_title || undefined,
        role: formData.role,
        role_level: formData.role_level,
        tenant_id: formData.tenant_id,
        password: formData.password,
        can_invite_users: formData.can_invite_users,
        can_manage_sub_clients: formData.can_manage_sub_clients,
        permission_scope: formData.permission_scope
      }

      const response = await userManagement.createUser(userData)
      
      if (response.success) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          email: '',
          full_name: '',
          phone: '',
          department: '',
          job_title: '',
          role: 'user',
          role_level: 'sub_client',
          tenant_id: '',
          password: '',
          can_invite_users: false,
          can_manage_sub_clients: false,
          permission_scope: 'own'
        })
      } else {
        setError(response.error || 'Failed to create user')
      }
    } catch (err) {
      setError('An error occurred while creating the user')
      console.error('User creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Create New User
              </CardTitle>
              <CardDescription>
                Add a new user to the system with appropriate role and permissions
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

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
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
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
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

                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permission Scope
                  </label>
                  <select
                    value={formData.permission_scope}
                    onChange={(e) => handleInputChange('permission_scope', e.target.value)}
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
                    onChange={(e) => handleInputChange('can_invite_users', e.target.checked)}
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
                    onChange={(e) => handleInputChange('can_manage_sub_clients', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_manage_sub_clients" className="ml-2 text-sm text-gray-700">
                    Can manage sub-client users
                  </label>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter temporary password"
                  />
                  <Button type="button" onClick={generatePassword} variant="outline">
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  User will be required to change password on first login
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

