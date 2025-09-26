'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import { RouteGuard } from '@/components/RouteGuard'
import { PermissionGuard } from '@/hooks/usePermissions'
import TenantScopeBar from '@/components/rbac/TenantScopeBar'
import EntitySwitcher, { EntityType } from '@/components/rbac/EntitySwitcher'
import RBACMatrixGrid from '@/components/rbac/RBACMatrixGrid'
import RBACContextDrawer from '@/components/rbac/RBACContextDrawer'
import RolesPermissionsTab from '@/components/rbac/RolesPermissionsTab'
import RBACAdminService from '@/services/rbac_admin_service'
import { 
  RBACMatrixRowUser, 
  RBACPermissionCatalog, 
  RBACUserDetail, 
  RBACPermissionCell,
  RBACChangeOperation,
  RBACApplyChangesRequest
} from '@/types'
import { Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react'

interface Tenant {
  id: string
  name: string
}

export default function AccessControlPage() {
  // State management
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [activeEntity, setActiveEntity] = useState<EntityType>('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<RBACMatrixRowUser[]>([])
  const [permissionCatalog, setPermissionCatalog] = useState<RBACPermissionCatalog[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserDetail, setSelectedUserDetail] = useState<RBACUserDetail | null>(null)
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<RBACPermissionCell[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userDetailLoading, setUserDetailLoading] = useState(false)
  
  // Draft changes management
  const [draftChanges, setDraftChanges] = useState<Map<string, 'allow' | 'deny' | 'none'>>(new Map())
  const [changeQueue, setChangeQueue] = useState<RBACChangeOperation[]>([])
  
  // Permissions and auth
  const { currentUserId, currentTenantId, isHostAdmin, canManage } = usePermissions()

  // Load tenants on mount
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const tenantList = await RBACAdminService.listTenants()
        setTenants(tenantList)
        
        // Auto-select first tenant if none selected
        if (tenantList.length > 0 && !selectedTenant) {
          setSelectedTenant(tenantList[0])
        }
      } catch (error) {
        console.error('Error loading tenants:', error)
      }
    }
    
    loadTenants()
  }, [selectedTenant])

  // Load users and permissions when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      loadTenantUsers()
      loadPermissionCatalog()
    }
  }, [selectedTenant])

  // Load user detail when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      loadUserDetail()
    }
  }, [selectedUserId])

  const loadTenantUsers = async () => {
    if (!selectedTenant) return

    setLoading(true)
    try {
      const userList = await RBACAdminService.listTenantUsers(selectedTenant.id)
      
      // Get effective permissions for all users
      const userIds = userList.users.map((u: any) => u.userId)
      const effectivePermissions = await RBACAdminService.getEffectivePermissions(selectedTenant.id, userIds)

      // Build matrix rows
      const matrixUsers: RBACMatrixRowUser[] = userList.users.map((user) => ({
        userId: user.userId,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        is_active: user.is_active,
        cells: effectivePermissions.get(user.userId) || []
      }))

      setUsers(matrixUsers)
    } catch (error) {
      console.error('Error loading tenant users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPermissionCatalog = async () => {
    try {
      const catalog = await RBACAdminService.listPermissionCatalog()
      setPermissionCatalog(catalog)
    } catch (error) {
      console.error('Error loading permission catalog:', error)
    }
  }

  const loadUserDetail = async () => {
    if (!selectedUserId || !selectedTenant) return

    setUserDetailLoading(true)
    try {
      const userDetail = await RBACAdminService.getUserDetail(selectedTenant.id, selectedUserId)
      setSelectedUserDetail(userDetail)

      // Get user's permissions from the matrix
      const user = users.find((u: any) => u.userId === selectedUserId)
      setSelectedUserPermissions(user?.cells || [])
    } catch (error) {
      console.error('Error loading user detail:', error)
    } finally {
      setUserDetailLoading(false)
    }
  }

  const handleCellClick = useCallback((userId: string, permissionId: string, currentValue: string) => {
    // Cycle through permission states: none -> allow -> deny -> none
    let newValue: 'allow' | 'deny' | 'none';
    switch (currentValue) {
      case 'allow':
        newValue = 'deny'
        break
      case 'deny':
        newValue = 'none'
        break
      default:
        newValue = 'allow'
    }
    
    // Update draft changes
    const key = `${userId}:${permissionId}`
    const newDraftChanges = new Map(draftChanges)
    
    if (newValue === 'none') {
      newDraftChanges.delete(key)
    } else {
      newDraftChanges.set(key, newValue)
    }
    
    setDraftChanges(newDraftChanges)
    
    // Add to change queue
    const changeOperation: RBACChangeOperation = {
      id: `${Date.now()}`,
      type: 'permission_change',
      op: newValue === 'none' ? 'clearOverride' : 'setOverride',
      userId,
      permissionId,
      oldValue: currentValue as 'allow' | 'deny' | 'none',
      newValue,
      timestamp: new Date().toISOString()
    }
    
    setChangeQueue(prev => [...prev, changeOperation])
  }, [draftChanges])

  const handleUserClick = useCallback((userId: string) => {
    setSelectedUserId(userId)
    setIsDrawerOpen(true)
  }, [])

  const handlePermissionToggle = useCallback((permissionId: string, currentValue: string) => {
    if (!selectedUserId) return
    handleCellClick(selectedUserId, permissionId, currentValue)
  }, [selectedUserId, handleCellClick])

  const handleRevertOverride = useCallback((permissionId: string) => {
    if (!selectedUserId) return
    
    // Find the key in draft changes
    const key = `${selectedUserId}:${permissionId}`
    
    // Remove from draft changes
    const newDraftChanges = new Map(draftChanges)
    newDraftChanges.delete(key)
    setDraftChanges(newDraftChanges)
    
    // Remove from change queue
    setChangeQueue(prev => prev.filter(op => 
      !(op.userId === selectedUserId && op.permissionId === permissionId)
    ))
  }, [selectedUserId, draftChanges])

  const handleApplyChanges = async () => {
    if (changeQueue.length === 0 || !selectedTenant) return
    
    setLoading(true)
    try {
      const request: RBACApplyChangesRequest = {
        tenantId: selectedTenant.id,
        changes: changeQueue
      }
      
      await RBACAdminService.applyPermissionChanges(request)
      
      // Clear draft changes and queue
      setDraftChanges(new Map())
      setChangeQueue([])
      
      // Reload data
      await loadTenantUsers()
      
      // If user detail is open, reload it
      if (selectedUserId) {
        await loadUserDetail()
      }
    } catch (error) {
      console.error('Error applying changes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscardChanges = () => {
    setDraftChanges(new Map())
    setChangeQueue([])
  }

  const hasPendingChanges = changeQueue.length > 0

  return (
    <RouteGuard>
      {/* <PermissionGuard feature={FEATURES.ACCESS_CONTROL} permission={PERMISSIONS.MANAGE}> */}
        <div className="flex flex-col h-full">
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900">Access Control</h1>
                
                {/* Publish Bar */}
                {hasPendingChanges && (
                  <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {changeQueue.length} pending change{changeQueue.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDiscardChanges}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      >
                        <RotateCcw className="h-3 w-3 mr-1 inline" />
                        Discard
                      </button>
                      <button
                        onClick={handleApplyChanges}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-3 w-3 mr-1 inline" />
                        Apply Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tenant Scope Bar */}
          <TenantScopeBar
            tenants={tenants}
            selectedTenant={selectedTenant}
            onTenantChange={setSelectedTenant}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={loading}
          />

          {/* Entity Switcher */}
          <EntitySwitcher
            activeEntity={activeEntity}
            onEntityChange={setActiveEntity}
            userCount={users.length}
            roleCount={5} // Mock role count
          />

          {/* Main Content */}
          <div className="p-6">
            {selectedTenant ? (
              <div className="space-y-6">
                {activeEntity === 'users' && (
                  /* Matrix Grid */
                  <RBACMatrixGrid
                    users={users}
                    permissionCatalog={permissionCatalog}
                    onCellClick={handleCellClick}
                    onUserClick={handleUserClick}
                    loading={loading}
                    draftChanges={draftChanges}
                  />
                )}
                {activeEntity === 'roles' && (
                  /* Roles & Permissions Tab */
                  <RolesPermissionsTab />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tenant selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a tenant to manage user permissions and access control.
                </p>
              </div>
            )}
          </div>

          {/* Context Drawer */}
          <RBACContextDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            userDetail={selectedUserDetail}
            userPermissions={selectedUserPermissions}
            onPermissionToggle={handlePermissionToggle}
            onRevertOverride={handleRevertOverride}
            loading={userDetailLoading}
          />
        </div>
      {/* </PermissionGuard> */}
    </RouteGuard>
  )
}

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'
