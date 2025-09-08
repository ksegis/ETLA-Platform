'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
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
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import UserCreationModal from '@/components/UserCreationModal'
import UserInviteModal from '@/components/UserInviteModal'

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  department?: string
  job_title?: string
  role: string
  role_level?: string
  tenant_id: string
  tenant_name: string
  is_active: boolean
  status: string
  created_at: string
  last_sign_in_at?: string
  can_invite_users: boolean
  can_manage_sub_clients: boolean
  permission_scope: string
  requires_password_change?: boolean
  is_primary_tenant?: boolean
}

interface Tenant {
  id: string
  name: string
  code: string
  status: string
  tenant_type: string
}

interface Invitation {
  id: string
  email: string
  full_name?: string
  tenant_name: string
  role: string
  status: string
  created_at: string
  expires_at: string
  invited_by_name?: string
}

interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  user_id?: string
  is_read: boolean
  created_at: string
  data?: any
}

export default function AccessControlPage() {
  const { user, isAuthenticated, isDemoMode, tenantUser } = useAuth()
  const { selectedTenant } = useTenant()
  
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'invites' | 'notifications'>('overview')

  // Permission checks - Use tenantUser role and allow demo mode
  const userRole = tenantUser?.role || user?.role
  const isHostAdmin = userRole === 'host_admin'
  const isClientAdmin = userRole === 'client_admin'
  const isDemoUser = user?.email === 'demo@company.com' || isDemoMode
  const canManageUsers = isHostAdmin || isClientAdmin || isDemoUser
  
  // Debug logging
  console.log('🔍 Access Control Permission Debug:', {
    user: user?.email,
    userRole,
    tenantUserRole: tenantUser?.role,
    isAuthenticated,
    isDemoMode,
    canManageUsers,
    isHostAdmin,
    isClientAdmin,
    isDemoUser
  })

  useEffect(() => {
    // Allow access in demo mode or when authenticated with proper permissions
    if ((isAuthenticated || isDemoMode) && canManageUsers) {
      console.log('✅ Loading Access Control data')
      loadData()
    } else {
      console.log('❌ Access denied - not loading data')
    }
  }, [isAuthenticated, isDemoMode, canManageUsers, selectedTenant])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        loadUsers(),
        loadTenants(),
        loadInvitations(),
        loadNotifications()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          tenant_users!inner(
            role,
            role_level,
            is_active,
            tenant_id,
            is_primary_tenant,
            requires_password_change,
            permission_scope,
            can_invite_users,
            can_manage_sub_clients,
            tenants(name, code)
          )
        `)
        .order('created_at', { ascending: false })

      // Filter by tenant if not host admin
      // Host admin should see ALL users regardless of selectedTenant
      console.log('🔍 Access Control Debug:', {
        isHostAdmin,
        selectedTenant: selectedTenant?.name,
        userRole: user?.role,
        userEmail: user?.email,
        willFilter: !isHostAdmin && selectedTenant
      })
      
      if (!isHostAdmin && selectedTenant) {
        console.log('🚫 Applying tenant filter for tenant:', selectedTenant.name)
        query = query.eq('tenant_users.tenant_id', selectedTenant.id)
      } else {
        console.log('✅ No tenant filtering - showing all users')
      }

      const { data: users, error } = await query

      console.log('📊 Query Results:', {
        userCount: users?.length || 0,
        users: users?.map((u: any) => ({ email: u.email, role: u.tenant_users?.[0]?.role })) || []
      })

      if (error) {
        console.error('Error loading users:', error)
        throw error
      }

      const formattedUsers: User[] = users?.map((user: any) => {
        const tenantUser = user.tenant_users[0] || {}
        const tenant = tenantUser.tenants || {}
        
        return {
          id: user.id,
          email: user.email || 'N/A',
          full_name: user.full_name || 'Unknown',
          phone: user.phone,
          department: user.department,
          job_title: user.job_title,
          role: tenantUser.role || 'user',
          role_level: tenantUser.role_level,
          tenant_id: tenantUser.tenant_id,
          tenant_name: tenant.name || 'No Tenant',
          is_active: tenantUser.is_active ?? true,
          status: user.status || 'active',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          can_invite_users: tenantUser.can_invite_users || false,
          can_manage_sub_clients: tenantUser.can_manage_sub_clients || false,
          permission_scope: tenantUser.permission_scope || 'own',
          requires_password_change: tenantUser.requires_password_change || false,
          is_primary_tenant: tenantUser.is_primary_tenant || false
        }
      }) || []

      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      throw error
    }
  }

  const loadTenants = async () => {
    try {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setTenants(tenants || [])
    } catch (error) {
      console.error('Error loading tenants:', error)
      throw error
    }
  }

  const loadInvitations = async () => {
    try {
      let query = supabase
        .from('user_invitations')
        .select(`
          *,
          tenants(name),
          invited_by_profile:profiles!user_invitations_invited_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      // Filter by tenant if not host admin
      if (!isHostAdmin && selectedTenant) {
        query = query.eq('tenant_id', selectedTenant.id)
      }

      const { data: invitations, error } = await query

      if (error) throw error

      const formattedInvitations: Invitation[] = invitations?.map((inv: any) => ({
        id: inv.id,
        email: inv.email,
        full_name: inv.full_name,
        tenant_name: inv.tenants?.name || 'Unknown Tenant',
        role: inv.role,
        status: inv.status,
        created_at: inv.created_at,
        expires_at: inv.expires_at,
        invited_by_name: inv.invited_by_profile?.full_name || 'Unknown'
      })) || []

      setInvitations(formattedInvitations)
    } catch (error) {
      console.error('Error loading invitations:', error)
      throw error
    }
  }

  const loadNotifications = async () => {
    try {
      const { data: notifications, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('admin_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(notifications || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
      throw error
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u: any) => u.is_active && u.status === 'active').length,
    pendingUsers: users.filter((u: any) => u.status === 'pending_assignment').length,
    pendingInvites: invitations.filter((i: any) => i.status === 'pending').length,
    unreadNotifications: notifications.filter((n: any) => !n.is_read).length
  }

  const roleDistribution = users.reduce((acc: any, user: any) => {
    acc[user.role as keyof typeof acc] = (acc[user.role as keyof typeof acc] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Debug logging before access check
  console.log('🔍 Final Access Check:', {
    canManageUsers,
    isHostAdmin,
    isClientAdmin,
    isDemoUser,
    userEmail: user?.email,
    userRole,
    tenantUserRole: tenantUser?.role,
    isAuthenticated,
    isDemoMode
  })

  if (!canManageUsers) {
    console.log('❌ Access denied - canManageUsers is false')
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access user management.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  console.log('✅ Access granted - rendering Access Control page')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Access Control & Security</h1>
            <p className="text-gray-600">Comprehensive user management, RBAC, and security controls</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowInviteModal(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Invite User</span>
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create User</span>
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'roles', label: 'Roles & Permissions', icon: Shield },
              { id: 'invites', label: 'Invitations', icon: Mail },
              { id: 'notifications', label: 'Notifications', icon: AlertCircle }
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id === 'notifications' && stats.unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.unreadNotifications}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Assignment</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Mail className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Invites</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingInvites}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Notifications</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.unreadNotifications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Current user distribution across roles and levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(roleDistribution).map(([role, count]: any) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{count} users</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={filterRole}
                onChange={(e: any) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="host_admin">Host Admin</option>
                <option value="client_admin">Client Admin</option>
                <option value="user">User</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending_assignment">Pending Assignment</option>
                <option value="suspended">Suspended</option>
              </select>
              <Button
                onClick={loadData}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                      <p className="text-gray-500">
                        {users.length === 0 
                          ? "No users have been created yet." 
                          : "No users match your search criteria."
                        }
                      </p>
                      {users.length === 0 && (
                        <Button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-4"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create First User
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role & Tenant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user: any) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.full_name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.full_name}
                                    {user.is_primary_tenant && (
                                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                  {user.job_title && (
                                    <div className="text-xs text-gray-400">{user.job_title}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">
                                {user.role.replace('_', ' ')}
                              </div>
                              <div className="text-sm text-gray-500">{user.tenant_name}</div>
                              {user.role_level && (
                                <div className="text-xs text-gray-400 capitalize">
                                  {user.role_level.replace('_', ' ')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.is_active && user.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : user.status === 'pending_assignment'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.is_active && user.status === 'active' ? 'Active' : 
                                   user.status === 'pending_assignment' ? 'Pending' : 'Inactive'}
                                </span>
                                {user.requires_password_change && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Password Reset Required
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.last_sign_in_at 
                                ? new Date(user.last_sign_in_at).toLocaleDateString()
                                : 'Never'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowEditModal(true)
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowPasswordModal(true)
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === 'invites' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Manage user invitations and track their status</CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Invitations</h3>
                    <p className="text-gray-500">No user invitations have been sent yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invitee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role & Tenant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invited By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expires
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invitations.map((invitation: any) => (
                          <tr key={invitation.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {invitation.full_name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">{invitation.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">
                                {invitation.role.replace('_', ' ')}
                              </div>
                              <div className="text-sm text-gray-500">{invitation.tenant_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invitation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : invitation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {invitation.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invitation.invited_by_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(invitation.expires_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals would be implemented here */}
      {showCreateModal && (
        <UserCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadData()
            setShowCreateModal(false)
          }}
          tenants={tenants}
        />
      )}

      {showInviteModal && (
        <UserInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            loadData()
            setShowInviteModal(false)
          }}
          tenants={tenants}
        />
      )}
    </DashboardLayout>
  )
}

