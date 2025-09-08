'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Building, Users, Plus, Edit, Trash2, UserPlus, Search } from 'lucide-react'
import { Tenant, User } from '@/types'

interface ExtendedTenant extends Tenant {
  code?: string
  tenant_type?: string
  contact_email?: string
  is_active?: boolean
  tenant_level?: number
  max_projects?: number
  feature_flags?: Record<string, any>
  usage_quotas?: Record<string, any>
  rbac_settings?: Record<string, any>
}

interface TenantUser {
  id: string
  user_id: string
  tenant_id: string
  role: string
  is_active: boolean
  email?: string
  created_at: string
}

interface AuthUser {
  id: string
  email: string
  created_at: string
}

export default function TenantManagementPage() {
  const { tenantUser } = useAuth()
  const { selectedTenant } = useTenant()
  const [tenants, setTenants] = useState<ExtendedTenant[]>([])
  const [users, setUsers] = useState<TenantUser[]>([])
  const [allUsers, setAllUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false)
  // Using singleton supabase instance

  // Check if user has admin access
  const hasAdminAccess = tenantUser?.role === 'host_admin' || tenantUser?.role === 'program_manager'

  useEffect(() => {
    if (hasAdminAccess) {
      loadTenants()
      loadAllUsers()
    }
  }, [hasAdminAccess])

  useEffect(() => {
    if (selectedTenantId) {
      loadTenantUsers(selectedTenantId)
    }
  }, [selectedTenantId])

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name')

      if (error) throw error
      setTenants(data || [])
    } catch (error) {
      console.error('Error loading tenants:', error)
    }
  }

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('id, email, created_at')
        .order('email')

      if (error) throw error
      setAllUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadTenantUsers = async (tenantId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tenant_users')
        .select(`
          id,
          user_id,
          tenant_id,
          role,
          is_active,
          created_at
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get user emails for each tenant user
      const tenantUsersWithEmails = await Promise.all(
        (data || []).map(async (tu: any) => {
          const { data: userData } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', tu.user_id)
            .single()
          
          return {
            ...tu,
            email: userData?.email || 'Unknown'
          }
        })
      )

      setUsers(tenantUsersWithEmails)
    } catch (error) {
      console.error('Error loading tenant users:', error)
    } finally {
      setLoading(false)
    }
  }

  const addUserToTenant = async (userId: string, role: string) => {
    if (!selectedTenantId) return

    try {
      const { error } = await supabase
        .from('tenant_users')
        .insert({
          user_id: userId,
          tenant_id: selectedTenantId,
          role: role,
          is_active: true
        })

      if (error) throw error

      setShowAddUserModal(false)
      loadTenantUsers(selectedTenantId)
    } catch (error) {
      console.error('Error adding user to tenant:', error)
    }
  }

  const removeUserFromTenant = async (tenantUserId: string) => {
    try {
      const { error } = await supabase
        .from('tenant_users')
        .update({ is_active: false })
        .eq('id', tenantUserId)

      if (error) throw error

      if (selectedTenantId) {
        loadTenantUsers(selectedTenantId)
      }
    } catch (error) {
      console.error('Error removing user from tenant:', error)
    }
  }

  const updateUserRole = async (tenantUserId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('tenant_users')
        .update({ role: newRole })
        .eq('id', tenantUserId)

      if (error) throw error

      if (selectedTenantId) {
        loadTenantUsers(selectedTenantId)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const createTenant = async (tenantData: {
    name: string
    code: string
    tenant_type: string
    contact_email: string
  }) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .insert({
          ...tenantData,
          status: 'active',
          subscription_plan: 'professional',
          max_users: 25,
          max_projects: 50,
          is_active: true,
          tenant_level: 1,
          settings: {},
          feature_flags: {},
          usage_quotas: {},
          rbac_settings: {}
        })

      if (error) throw error

      setShowCreateTenantModal(false)
      loadTenants()
    } catch (error) {
      console.error('Error creating tenant:', error)
    }
  }

  const filteredTenants = tenants.filter((tenant: any) =>
    tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'host_admin': return 'bg-red-100 text-red-800'
      case 'program_manager': return 'bg-blue-100 text-blue-800'
      case 'client_admin': return 'bg-green-100 text-green-800'
      case 'client_user': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!hasAdminAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-500">
                You need admin privileges to access tenant management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600">Manage tenants and user assignments</p>
        </div>
        <Button onClick={() => setShowCreateTenantModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Tenants ({filteredTenants.length})
            </CardTitle>
            <CardDescription>
              Select a tenant to manage its users
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTenants.map((tenant: any) => (
                <div
                  key={tenant.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTenantId === tenant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTenantId(tenant.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {tenant.name || 'Unnamed Tenant'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Code: {tenant.code || 'No code'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {tenant.tenant_type || 'Unknown'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tenant Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tenant Users
              {selectedTenantId && (
                <Button
                  size="sm"
                  onClick={() => setShowAddUserModal(true)}
                  className="ml-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {selectedTenantId
                ? `Users assigned to ${tenants.find((t: any) => t.id === selectedTenantId)?.name || 'selected tenant'}`
                : 'Select a tenant to view its users'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTenantId ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No users assigned to this tenant
                  </div>
                ) : (
                  users.map((user: any) => (
                    <div
                      key={user.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {user.email}
                          </h4>
                          <p className="text-sm text-gray-500">
                            User ID: {user.user_id.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-gray-500">
                            Added: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={getRoleColor(user.role)}>
                            {user.role}
                          </span>
                          <select
                            value={user.role}
                            onChange={(e: any) => updateUserRole(user.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="host_admin">Host Admin</option>
                            <option value="program_manager">Program Manager</option>
                            <option value="client_admin">Client Admin</option>
                            <option value="client_user">Client User</option>
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeUserFromTenant(user.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a tenant from the left to manage its users
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add User to Tenant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  id="user-select"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Choose a user...</option>
                  {allUsers.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role-select"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="client_user">Client User</option>
                  <option value="client_admin">Client Admin</option>
                  <option value="program_manager">Program Manager</option>
                  <option value="host_admin">Host Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const userSelect = document.getElementById('user-select') as HTMLSelectElement
                  const roleSelect = document.getElementById('role-select') as HTMLSelectElement
                  if (userSelect.value && roleSelect.value) {
                    addUserToTenant(userSelect.value, roleSelect.value)
                  }
                }}
              >
                Add User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Tenant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Name
                </label>
                <Input
                  id="tenant-name"
                  placeholder="Enter tenant name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Code
                </label>
                <Input
                  id="tenant-code"
                  placeholder="Enter tenant code (e.g., ACME)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Type
                </label>
                <select
                  id="tenant-type"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="enterprise">Enterprise</option>
                  <option value="client">Client</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="Enter contact email"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateTenantModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const nameInput = document.getElementById('tenant-name') as HTMLInputElement
                  const codeInput = document.getElementById('tenant-code') as HTMLInputElement
                  const typeSelect = document.getElementById('tenant-type') as HTMLSelectElement
                  const emailInput = document.getElementById('contact-email') as HTMLInputElement
                  
                  if (nameInput.value && codeInput.value && emailInput.value) {
                    createTenant({
                      name: nameInput.value,
                      code: codeInput.value,
                      tenant_type: typeSelect.value,
                      contact_email: emailInput.value
                    })
                  }
                }}
              >
                Create Tenant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

