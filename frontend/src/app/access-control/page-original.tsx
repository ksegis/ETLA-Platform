'use client';


'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useTenant } from 'contexts/TenantContext'
import DashboardLayout from 'components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card'
import { Button } from 'components/ui/button'
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
import { createSupabaseBrowserClient } from 'lib/supabase/browser'
import UserCreationModal from 'components/UserCreationModal'
import UserInviteModal from 'components/UserInviteModal'

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
  const [loading, setloading] = useState(true)
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
      console.log('✅ loading Access Control data')
      loadData()
    } else {
      console.log('❌ Access denied - not loading data')
    }
  }, [isAuthenticated, isDemoMode, canManageUsers, selectedTenant])

  const loadData = async () => {
    setloading(true)
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
      setloading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
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
        isClientAdmin,
        isDemoUser,
        canManageUsers,
        selectedTenant: selectedTenant?.name,
        userRole: user?.role,
        tenantUserRole: tenantUser?.role,
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
          email: user?.email || 'N/A',
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
      const supabase = createSupabaseBrowserClient();
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
      const supabase = createSupabaseBrowserClient();
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
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // Host admin should see all notifications, others see only their own
      if (!isHostAdmin && user?.id) {
        query = query.eq('admin_id', user.id)
      }

      const { data: notifications, error } = await query

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
                         user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user?.role ?? currentUserRole === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.is_active && u.status === 'active').length,
    pendingUsers: users.filter((u) => u.status === 'pending_assignment').length,
    pendingInvites: invitations.filter((i) => i.status === 'pending').length,
    unreadNotifications: notifications.filter((n) => !n.is_read).length
  }

  const roleDistribution = users.reduce((acc: any, user) => {
    acc[user?.role ?? currentUserRole as keyof typeof acc] = (acc[user?.role ?? currentUserRole as keyof typeof acc] || 0) + 1
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
            <p className="text-gray-500">You don&apos;t have permission to access user management.</p>
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
                      <p className="text-sm font-medium text-gray-500">Unread Notifications</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.unreadNotifications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                      <p className="text-2xl font-semibold text-gray-900">{tenants.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by assigned roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(roleDistribution).map(([role, count]) => (
                    <div key={role} className="flex items-center space-x-3">
                      <Badge variant="secondary" className="capitalize">{role.replace('_', ' ')}</Badge>
                      <span className="text-lg font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2"
                  />
                </div>
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="host_admin">Host Admin</option>
                <option value="client_admin">Client Admin</option>
                <option value="program_manager">Program Manager</option>
                <option value="client_user">Client User</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_assignment">Pending Assignment</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* User Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>Manage user roles, permissions, and access</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sign-in</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                  <div className="text-sm text-gray-500">{user?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary" className="capitalize">{user?.role ?? currentUserRole.replace('_', ' ')}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.tenant_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : user.status === 'pending_assignment'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {user.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedUser(user)
                                  setShowEditModal(true)
                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedUser(user)
                                  setShowPasswordModal(true)
                                }}>
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => console.log('Delete user', user.id)}>
                                  <Trash2 className="h-4 w-4" />
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

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
                <CardDescription>Define and manage roles and their associated permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">This section allows you to configure roles and their permissions. Changes made here will affect how users can interact with different features and data within the platform.</p>
                <Button className="mt-4" onClick={() => console.log('Configure RBAC')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure RBAC
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Overrides</CardTitle>
                <CardDescription>Grant or deny specific permissions to individual users, overriding their role-based access</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Use this feature sparingly for exceptional cases where a user's access needs to deviate from their assigned role. Overrides take precedence over role permissions.</p>
                <Button className="mt-4" onClick={() => console.log('Manage Overrides')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Overrides
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'invites' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>View and manage outstanding user invitations</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited By</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invitations.map((invite) => (
                          <tr key={invite.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary" className="capitalize">{invite.role.replace('_', ' ')}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invite.tenant_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invite.invited_by_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  invite.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {invite.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(invite.expires_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => console.log('Resend invite', invite.id)}>
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => console.log('Revoke invite', invite.id)}>
                                  <Trash2 className="h-4 w-4" />
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

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Notifications</CardTitle>
                <CardDescription>Important alerts and system messages</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <tr key={notification.id} className={notification.is_read ? 'text-gray-500' : 'font-medium'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  notification.type === 'alert'
                                    ? 'bg-red-100 text-red-800'
                                    : notification.type === 'info'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {notification.type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">{notification.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm max-w-xs truncate">{notification.message}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(notification.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {!notification.is_read && (
                                  <Button variant="ghost" size="sm" onClick={() => console.log('Mark as read', notification.id)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {notification.is_read && (
                                  <Button variant="ghost" size="sm" onClick={() => console.log('Mark as unread', notification.id)}>
                                    <EyeOff className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => console.log('Delete notification', notification.id)}>
                                  <Trash2 className="h-4 w-4" />
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
      </div>

      <UserCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={loadData}
      />

      <UserInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={loadData}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <UserCreationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUserCreated={loadData} // Re-fetch data after edit
          initialUserData={selectedUser}
        />
      )}

      {/* Change Password Modal */}
      {selectedUser && (
        <UserCreationModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onUserCreated={loadData} // Re-fetch data after password change
          initialUserData={selectedUser}
          changePasswordMode={true}
        />
      )}
    </DashboardLayout>
  )
}







