'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import { RouteGuard } from '@/components/RouteGuard'
import { PermissionGuard } from '@/hooks/usePermissions'
import TenantScopeBar from '@/components/rbac/TenantScopeBar'
import EntitySwitcher, { EntityType } from '@/components/rbac/EntitySwitcher'
import RBACMatrixGrid from '@/components/rbac/RBACMatrixGrid'
import RBACContextDrawer from '@/components/rbac/RBACContextDrawer'
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
    loadTenants()
  }, [])

  // Load users when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      loadTenantUsers()
    }
  }, [selectedTenant, searchTerm])

  // Load permission catalog on mount
  useEffect(() => {
    loadPermissionCatalog()
  }, [])

  // Load user detail when selected user changes
  useEffect(() => {
    if (selectedUserId && selectedTenant) {
      loadUserDetail()
    }
  }, [selectedUserId, selectedTenant])

  const loadTenants = async () => {
    try {
      const tenantList = await RBACAdminService.listTenants()
      setTenants(tenantList)
      
      // Auto-select first tenant or current tenant
      if (tenantList.length > 0) {
        const defaultTenant = currentTenantId 
          ? tenantList.find(t => t.id === currentTenantId) || tenantList[0]
          : tenantList[0]
        setSelectedTenant(defaultTenant)
      }
    } catch (error) {
      console.error('Error loading tenants:', error)
    }
  }

  const loadTenantUsers = async () => {
    if (!selectedTenant) return
    
    setLoading(true)
    try {
      const { users: userList } = await RBACAdminService.listTenantUsers(selectedTenant.id, {
        search: searchTerm || undefined,
        limit: 100 // For now, load first 100 users
      })

      // Get effective permissions for all users
      const userIds = userList.map(u => u.userId)
      const effectivePermissions = await RBACAdminService.getEffectivePermissions(selectedTenant.id, userIds)

      // Build matrix rows
      const matrixUsers: RBACMatrixRowUser[] = userList.map(user => ({
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
      const user = users.find(u => u.userId === selectedUserId)
      setSelectedUserPermissions(user?.cells || [])
    } catch (error) {
      console.error('Error loading user detail:', error)
    } finally {
      setUserDetailLoading(false)
    }
  }

  const handleCellClick = useCallback((userId: string, permissionId: string) => {
    const draftKey = `${userId}:${permissionId}`
    const currentDraft = draftChanges.get(draftKey)
    
    // Find current state from matrix
    const user = users.find(u => u.userId === userId)
    const cell = user?.cells.find(c => c.permissionId === permissionId)
    const currentState = currentDraft || cell?.state || 'none'
    
    // Cycle through states: none -> allow -> deny -> none
    let nextState: 'allow' | 'deny' | 'none'
    switch (currentState) {
      case 'none':
        nextState = 'allow'
        break
      case 'allow':
        nextState = 'deny'
        break
      case 'deny':
        nextState = 'none'
        break
      default:
        nextState = 'allow'
    }

    // Update draft changes
    const newDraftChanges = new Map(draftChanges)
    if (nextState === (cell?.state || 'none')) {
      // Revert to original state
      newDraftChanges.delete(draftKey)
    } else {
      newDraftChanges.set(draftKey, nextState)
    }
    setDraftChanges(newDraftChanges)

    // Add to change queue
    const operation: RBACChangeOperation = {
      op: nextState === 'none' ? 'clearOverride' : 'setOverride',
      userId,
      permissionId,
      effect: nextState === 'none' ? undefined : nextState
    }
    
    setChangeQueue(prev => {
      // Remove any existing operation for this user/permission
      const filtered = prev.filter(op => 
        !(op.userId === userId && op.permissionId === permissionId)
      )
      return [...filtered, operation]
    })
  }, [draftChanges, users])

  const handleUserClick = useCallback((userId: string) => {
    setSelectedUserId(userId)
    setIsDrawerOpen(true)
  }, [])

  const handlePermissionToggle = useCallback((permissionId: string) => {
    if (selectedUserId) {
      handleCellClick(selectedUserId, permissionId)
    }
  }, [selectedUserId, handleCellClick])

  const handleRevertOverride = useCallback((permissionId: string) => {
    if (selectedUserId) {
      const draftKey = `${selectedUserId}:${permissionId}`
      const newDraftChanges = new Map(draftChanges)
      newDraftChanges.delete(draftKey)
      setDraftChanges(newDraftChanges)

      // Add clear override operation
      const operation: RBACChangeOperation = {
        op: 'clearOverride',
        userId: selectedUserId,
        permissionId
      }
      
      setChangeQueue(prev => {
        const filtered = prev.filter(op => 
          !(op.userId === selectedUserId && op.permissionId === permissionId)
        )
        return [...filtered, operation]
      })
    }
  }, [selectedUserId, draftChanges])

  const handleApplyChanges = async () => {
    if (!selectedTenant || !currentUserId || changeQueue.length === 0) return

    setLoading(true)
    try {
      // Build apply changes request
      const request: RBACApplyChangesRequest = {
        tenantId: selectedTenant.id,
        actorUserId: currentUserId,
        userOverrides: changeQueue
          .filter(op => op.op === 'setOverride' || op.op === 'clearOverride')
          .map(op => ({
            userId: op.userId,
            permissionId: op.permissionId!,
            effect: op.effect || null
          })),
        auditNote: `RBAC changes applied via admin interface: ${changeQueue.length} operations`
      }

      const result = await RBACAdminService.applyChanges(request)
      
      if (result.success) {
        // Clear draft changes and reload data
        setDraftChanges(new Map())
        setChangeQueue([])
        await loadTenantUsers()
        
        // Reload user detail if drawer is open
        if (selectedUserId) {
          await loadUserDetail()
        }
      } else {
        console.error('Failed to apply changes:', result.error)
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error applying changes:', error)
      // TODO: Show error toast
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
      {/* Temporarily disable permission guard for demo access */}
      {/* <PermissionGuard feature={FEATURES.ACCESS_CONTROL} permission={PERMISSIONS.VIEW}> */}
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">RBAC Matrix</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage user permissions and access control across tenants
                  </p>
                </div>
                
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
            roleCount={4} // TODO: Get actual role count
          />

          {/* Main Content */}
          <div className="p-6">
            {selectedTenant ? (
              <div className="space-y-6">
                {/* Matrix Grid */}
                <RBACMatrixGrid
                  users={users}
                  permissionCatalog={permissionCatalog}
                  onCellClick={handleCellClick}
                  onUserClick={handleUserClick}
                  loading={loading}
                  draftChanges={draftChanges}
                />
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

