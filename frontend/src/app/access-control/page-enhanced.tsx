'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Settings, 
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Trash2,
  Edit,
  Key,
  Send,
  Plus,
  BarChart3,
  Database,
  Link,
  AlertTriangle
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import UserCreationModal from '@/components/UserCreationModal'
import UserInviteModal from '@/components/UserInviteModal'
import UserEditModal from '@/components/UserEditModal'
import PasswordResetModal from '@/components/PasswordResetModal'
import UserCleanupModal from '@/components/UserCleanupModal'
import { supabase } from '@/lib/supabase'

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
  last_sign_in_at?: string
  created_at: string
  email_confirmed_at?: string
  can_invite_users: boolean
  can_manage_sub_clients: boolean
  permission_scope: string
}

interface Tenant {
  id: string
  name: string
  code: string
  tenant_type: string
  status: string
  user_count: number
}

interface InviteStatus {
  id: string
  email: string
  role: string
  tenant_name: string
  invited_by: string
  created_at: string
  expires_at: string
  status: 'pending' | 'accepted' | 'expired'
}

interface RoleStats {
  role: string
  role_level: string
  count: number
  description: string
}

export default function AccessControlPageEnhanced() {
  const { user, isAuthenticated, tenant } = useAuth()
  const { hasPermission, currentRole, isHostAdmin } = usePermissions()
  
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [invites, setInvites] = useState<InviteStatus[]>([])
  const [roleStats, setRoleStats] = useState<RoleStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'sso' | 'invites' | 'cleanup'>('overview')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCleanupModal, setShowCleanupModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Check if user has access to this page
  const canAccessUserManagement = hasPermission('user-management', 'manage') && isHostAdmin()
  const canViewUserManagement = hasPermission('user-management', 'view') || canAccessUserManagement

  useEffect(() => {
    if (isAuthenticated && canViewUserManagement) {
      loadData()
    }
  }, [isAuthenticated, canViewUserManagement])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadUsers(),
        loadTenants(),
        loadInvites(),
        loadRoleStats()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

   const loadUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenant_users!inner(
            role,
            role_level,
            is_active,
            tenant_id,
            tenants(name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedUsers: User[] = users?.map((user: any) => ({
        id: user.id,
        email: user.email || 'N/A',
        full_name: user.full_name || 'Unknown',
        role: user.tenant_users[0]?.role || 'user',
        role_level: user.tenant_users[0]?.role_level || 'sub_client',
        tenant_name: user.tenant_users[0]?.tenants?.name || 'No Tenant',
        tenant_id: user.tenant_users[0]?.tenant_id,
        is_active: user.tenant_users[0]?.is_active ?? true,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        phone: user.phone,
        department: user.department,
        job_title: user.job_title,
        can_invite_users: ['admin', 'manager'].includes(user.tenant_users[0]?.role || ''),
        can_manage_sub_clients: user.tenant_users[0]?.role_level === 'primary_client',
        permission_scope: user.tenant_users[0]?.permission_scope || 'own'
      })) || []

      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    }
  }

  const loadTenants = async () => {
    try {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name')

      if (error) throw error
      setTenants(tenants || [])
    } catch (error) {
      console.error('Error loading tenants:', error)
      setError('Failed to load tenants')
    }
  }

  const loadInvites = async () => {
    try {
      // This would need to be implemented based on your invitation system
      // For now, using empty array
      setInvites([])
    } catch (error) {
      console.error('Error loading invites:', error)
      setError('Failed to load invites')
    }
  }

  const loadRoleStats = async () => {
    try {
      const { data: stats, error } = await supabase
        .from('tenant_users')
        .select('role, role_level')

      if (error) throw error

      const roleStats: RoleStats[] = Object.entries(stats?.reduce((acc, user) => {
        const key = `${user.role_level}_${user.role}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}).map(([key, count]) => {
        const [role_level, role] = key.split('_')
        return {
          role,
          role_level,
          count,
          description: `${role_level} ${role}s`
        }
      })

      setRoleStats(roleStats)
    } catch (error) {
      console.error('Error loading role stats:', error)
      setError('Failed to load role stats')
    }
  }

   const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Delete from tenant_users first (foreign key constraint)
        const { error: tenantUserError } = await supabase
          .from('tenant_users')
          .delete()
          .eq('user_id', userId)

        if (tenantUserError) throw tenantUserError

        // Delete from profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)

        if (profileError) throw profileError

        // Note: auth.users deletion requires admin privileges
        // This would typically be done via a server-side function
        console.log('User deleted from profiles and tenant_users. Auth user may need manual cleanup.')
        
        await loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        setError('Failed to delete user')
      }
    }
  }

  const handlePasswordReset = (userId: string, email: string) => {
    setSelectedUser(users.find(u => u.id === userId) || null)
    setShowPasswordModal(true)
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      // TODO: Implement invite resend functionality
      console.log('Resending invite:', inviteId)
      // This would typically call a server function to resend the invitation email
      await loadInvites()
    } catch (error) {
      console.error('Error resending invite:', error)
      setError('Failed to resend invite')
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Name', 'Role', 'Level', 'Tenant', 'Status', 'Last Login', 'Created'].join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.full_name,
        user.role,
        user.role_level,
        user.tenant_name,
        user.is_active ? 'Active' : 'Inactive',
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never',
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTenant = selectedTenant === 'all' || user.tenant_id === selectedTenant
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    
    return matchesSearch && matchesTenant && matchesRole
  })

  const getRoleColor = (role: string, level: string) => {
    if (level === 'host') return 'bg-purple-100 text-purple-800'
    if (level === 'primary_client') return 'bg-blue-100 text-blue-800'
    if (level === 'sub_client') return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (user: User) => {
    if (!user.email_confirmed_at) return <Clock className="h-4 w-4 text-yellow-500" />
    if (!user.is_active) return <AlertCircle className="h-4 w-4 text-red-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600">Please log in to access user management.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!canViewUserManagement) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access user management.</p>
              <p className="text-sm text-gray-500 mt-2">Contact your administrator for access.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Access Control & Security</h1>
              <p className="mt-2 text-gray-600">
                {canAccessUserManagement 
                  ? "Comprehensive user management, RBAC, and security controls"
                  : `User management and security overview for ${tenant?.name}`
                }
              </p>
            </div>
            {canAccessUserManagement && (
              <div className="flex space-x-2">
                <Button onClick={() => setShowInviteModal(true)} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'roles', label: 'Roles & Permissions', icon: Shield },
              { id: 'sso', label: 'SSO Configuration', icon: Key },
              ...(canAccessUserManagement ? [
                { id: 'invites', label: 'Invitations', icon: Mail },
                { id: 'cleanup', label: 'System Cleanup', icon: Settings }
              ] : [])
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                      <p className="text-2xl font-bold text-gray-900">{tenants.filter(t => t.status === 'active').length}</p>
                    </div>
                    <Building className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                      <p className="text-2xl font-bold text-gray-900">{invites.filter(i => i.status === 'pending').length}</p>
                    </div>
                    <Mail className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_active).length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                  <CardDescription>
                    Current user distribution across roles and levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roleStats.map((stat, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Shield className={`h-4 w-4 mr-2 ${
                              stat.role_level === 'host' ? 'text-purple-600' :
                              stat.role_level === 'primary_client' ? 'text-blue-600' :
                              'text-green-600'
                            }`} />
                            <span className="text-sm font-medium">{stat.role} ({stat.role_level})</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{stat.count} users</span>
                        </div>
                        <p className="text-xs text-gray-600">{stat.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tenant Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Overview</CardTitle>
                  <CardDescription>
                    Active tenants and user distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tenants.slice(0, 5).map((tenant) => (
                      <div key={tenant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-sm text-gray-600">{tenant.tenant_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{tenant.user_count} users</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tenant.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Tenants</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </select>

              <Button onClick={exportUsers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  {canAccessUserManagement 
                    ? "Manage all users across the platform"
                    : "View users in your organization"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading users...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Tenant</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                          {canAccessUserManagement && (
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getStatusIcon(user)}
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{user.full_name}</p>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                  {user.job_title && (
                                    <p className="text-xs text-gray-500">{user.job_title}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role, user.role_level)}`}>
                                {user.role} ({user.role_level})
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-gray-900">{user.tenant_name}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-gray-600">
                                {user.last_sign_in_at 
                                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                                  : 'Never'
                                }
                              </p>
                            </td>
                            {canAccessUserManagement && (
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setShowEditModal(true)
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePasswordReset(user.id, user.email)}
                                  >
                                    <Key className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Roles Tab - Enhanced with real data */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
                <CardDescription>
                  Manage user roles and permissions with tenant scoping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleStats.map((stat, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Shield className={`h-4 w-4 mr-2 ${
                            stat.role_level === 'host' ? 'text-red-600' :
                            stat.role_level === 'primary_client' ? 'text-orange-600' :
                            stat.role_level === 'sub_client' ? 'text-blue-600' :
                            'text-green-600'
                          }`} />
                          <span className="text-sm font-medium">{stat.role}</span>
                        </div>
                        {canAccessUserManagement && (
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{stat.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{stat.count} users assigned</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stat.role_level === 'host' ? 'bg-red-50 text-red-700 border border-red-200' :
                          stat.role_level === 'primary_client' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          stat.role_level === 'sub_client' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {stat.role_level === 'host' ? 'System-wide' :
                           stat.role_level === 'primary_client' ? 'Tenant-scoped' :
                           stat.role_level === 'sub_client' ? 'Sub-client' : 'Limited'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {canAccessUserManagement && (
                  <div className="mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" className="w-full">
                      Create Custom Role
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Permission Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>
                  Overview of permissions by role level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600 border-b pb-2">
                    <div>Permission</div>
                    <div>Host</div>
                    <div>Primary</div>
                    <div>Sub</div>
                  </div>
                  
                  {[
                    { name: 'User Management', host: true, primary: true, sub: false },
                    { name: 'System Settings', host: true, primary: false, sub: false },
                    { name: 'Tenant Management', host: true, primary: true, sub: false },
                    { name: 'Project Management', host: true, primary: true, sub: true },
                    { name: 'Reporting', host: true, primary: true, sub: true },
                    { name: 'Data Export', host: true, primary: true, sub: false }
                  ].map((perm, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 text-xs py-2 border-b">
                      <div className="font-medium">{perm.name}</div>
                      <div className="text-center">
                        {perm.host ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />}
                      </div>
                      <div className="text-center">
                        {perm.primary ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />}
                      </div>
                      <div className="text-center">
                        {perm.sub ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SSO Tab - Keep existing SSO configuration */}
        {activeTab === 'sso' && (
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>
                Configure SSO providers and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Microsoft Azure AD</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mb-2">Primary SSO provider for corporate users</p>
                  <div className="text-xs text-green-600">
                    Last sync: {new Date().toLocaleDateString()} | {users.filter(u => u.email.includes('@')).length} users authenticated
                  </div>
                </div>
                
                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Google Workspace</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">Secondary provider for external consultants</p>
                  <div className="text-xs text-blue-600">
                    Last sync: {new Date().toLocaleDateString()} | {Math.floor(users.length * 0.2)} users authenticated
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">SAML 2.0 Provider</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      Configured
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Ready for enterprise SAML integration</p>
                  <div className="text-xs text-gray-500">
                    Status: Ready | No active connections
                  </div>
                </div>
              </div>
              
              {canAccessUserManagement && (
                <div className="mt-4 pt-4 border-t">
                  <Button size="sm" variant="outline" className="w-full">
                    Configure SSO Provider
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invites Tab - Only for host admins */}
        {activeTab === 'invites' && canAccessUserManagement && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage user invitations and track their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tenant</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Invited By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Expires</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{invite.email}</td>
                        <td className="py-3 px-4">{invite.role}</td>
                        <td className="py-3 px-4">{invite.tenant_name}</td>
                        <td className="py-3 px-4">{invite.invited_by}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            invite.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invite.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {invite.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendInvite(invite.id)}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Resend
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cleanup Tab - Only for host admins */}
        {activeTab === 'cleanup' && canAccessUserManagement && (
          <Card>
            <CardHeader>
              <CardTitle>System Cleanup & Maintenance</CardTitle>
              <CardDescription>
                Advanced user management and cleanup operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowCleanupModal(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Bulk User Cleanup
                </Button>
                
                <Button
                  onClick={loadData}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All Data
                </Button>

                <Button
                  onClick={exportUsers}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals - Only render for host admins */}
      {canAccessUserManagement && (
        <>
          {showCreateModal && (
            <UserCreationModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSuccess={loadUsers}
              tenants={tenants}
            />
          )}

          {showInviteModal && (
            <UserInviteModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              onSuccess={loadInvites}
              tenants={tenants}
            />
          )}

          {showEditModal && selectedUser && (
            <UserEditModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false)
                setSelectedUser(null)
              }}
              onSuccess={loadUsers}
              user={selectedUser}
              tenants={tenants}
            />
          )}

          {showPasswordModal && selectedUser && (
            <PasswordResetModal
              isOpen={showPasswordModal}
              onClose={() => {
                setShowPasswordModal(false)
                setSelectedUser(null)
              }}
              onSuccess={() => {
                loadUsers()
                setShowPasswordModal(false)
                setSelectedUser(null)
              }}
              user={selectedUser}
            />
          )}

          {showCleanupModal && (
            <UserCleanupModal
              isOpen={showCleanupModal}
              onClose={() => setShowCleanupModal(false)}
              onSuccess={loadUsers}
            />
          )}
        </>
      )}
    </DashboardLayout>
  )
}

