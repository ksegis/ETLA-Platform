import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { Permission, RolePermissions } from '@/types'

// Feature definitions for RBAC
export const FEATURES = {
  // Data Management
  MIGRATION_WORKBENCH: 'migration-workbench',
  FILE_UPLOAD: 'file-upload',
  DATA_VALIDATION: 'data-validation',
  EMPLOYEE_DATA_PROCESSING: 'employee-data-processing',
  
  // Project Management
  PROJECT_MANAGEMENT: 'project-management',
  WORK_REQUESTS: 'work-requests',
  PROJECT_CHARTER: 'project-charter',
  RISK_MANAGEMENT: 'risk-management',
  RESOURCE_MANAGEMENT: 'resource-management',
  
  // Reporting & Analytics
  REPORTING: 'reporting',
  DASHBOARDS: 'dashboards',
  ANALYTICS: 'analytics',
  HISTORICAL_DATA: 'historical-data',
  
  // Administration
  USER_MANAGEMENT: 'user-management',
  ACCESS_CONTROL: 'access-control',
  TENANT_MANAGEMENT: 'tenant-management',
  SYSTEM_SETTINGS: 'system-settings',
  AUDIT_LOGS: 'audit-logs',
  
  // Benefits & HR
  BENEFITS_MANAGEMENT: 'benefits-management',
  PAYROLL_PROCESSING: 'payroll-processing',
  EMPLOYEE_RECORDS: 'employee-records'
} as const

// Permission types
export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  APPROVE: 'approve',
  EXPORT: 'export',
  IMPORT: 'import'
} as const

// Permission scopes
export const SCOPES = {
  OWN: 'own',
  TENANT: 'tenant',
  ALL: 'all'
} as const

// Default role permissions configuration
const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  host_admin: {
    role: 'host_admin',
    permissions: [
      // Full system access
      { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.TENANT_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.SYSTEM_SETTINGS, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.AUDIT_LOGS, permission: PERMISSIONS.VIEW },
      
      // All business features
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.REPORTING, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: PERMISSIONS.MANAGE }
    ]
  },
  
  program_manager: {
    role: 'program_manager',
    permissions: [
      // Project management focus
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.PROJECT_CHARTER, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.RISK_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.RESOURCE_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      
      // Reporting access
      { feature: FEATURES.REPORTING, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.ANALYTICS, permission: PERMISSIONS.VIEW },
      
      // Limited user management
      { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.VIEW },
      
      // Data management
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.DATA_VALIDATION, permission: PERMISSIONS.VIEW }
    ]
  },
  
  client_admin: {
    role: 'client_admin',
    permissions: [
      // Tenant-scoped administration
      { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.VIEW },
      
      // Business operations
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.REPORTING, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: PERMISSIONS.VIEW },
      
      // HR & Benefits
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: PERMISSIONS.MANAGE },
      { feature: FEATURES.EMPLOYEE_RECORDS, permission: PERMISSIONS.MANAGE },
      
      // Data management
      { feature: FEATURES.FILE_UPLOAD, permission: PERMISSIONS.CREATE },
      { feature: FEATURES.DATA_VALIDATION, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.MIGRATION_WORKBENCH, permission: PERMISSIONS.VIEW }
    ]
  },
  
  client_user: {
    role: 'client_user',
    permissions: [
      // Basic work request access
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.CREATE },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.UPDATE },
      
      // Limited project visibility
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.VIEW },
      
      // Basic reporting
      { feature: FEATURES.REPORTING, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: PERMISSIONS.VIEW },
      
      // Own benefits access
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: PERMISSIONS.VIEW },
      
      // File upload for own requests
      { feature: FEATURES.FILE_UPLOAD, permission: PERMISSIONS.CREATE },
      
      // Demo: Grant access control access for demo user
      { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.VIEW }
    ]
  },

  // Add support for 'user' role (maps to client_user)
  user: {
    role: 'user',
    permissions: [
      // Basic work request access
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.CREATE },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.UPDATE },
      
      // Limited project visibility
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.VIEW },
      
      // Basic reporting
      { feature: FEATURES.REPORTING, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.DASHBOARDS, permission: PERMISSIONS.VIEW },
      
      // Own benefits access
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: PERMISSIONS.VIEW },
      
      // File upload for own requests
      { feature: FEATURES.FILE_UPLOAD, permission: PERMISSIONS.CREATE },
      
      // Demo: Grant access control access for demo user
      { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.VIEW },
      { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.VIEW }
    ]
  }
}

// Main permissions hook
export function usePermissions() {
  const { user, tenantUser, isAuthenticated, isDemoMode } = useAuth()
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user permissions based on role
  useEffect(() => {
    if (!isAuthenticated || !tenantUser) {
      setUserPermissions([])
      setIsLoading(false)
      return
    }

    // Get permissions for user's role
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[tenantUser.role]
    if (rolePermissions) {
      setUserPermissions(rolePermissions.permissions)
    } else {
      // Default to client_user permissions for unknown roles
      setUserPermissions(DEFAULT_ROLE_PERMISSIONS.client_user.permissions)
    }
    
    setIsLoading(false)
  }, [isAuthenticated, tenantUser])

  // Check if user has specific permission for a feature
  const hasPermission = (feature: string, permission: string, scope: string = SCOPES.TENANT): boolean => {
    if (isDemoMode) {
      // Demo mode has broad permissions for testing
      return true
    }

    if (!isAuthenticated || !tenantUser) {
      return false
    }

    // Host admin has all permissions
    if (tenantUser.role === 'host_admin') {
      return true
    }

    // Check if user has the specific permission
    return userPermissions.some(p => 
      p.feature === feature && 
      p.permission === permission
    )
  }

  // Check if user can access a feature at all (any permission)
  const canAccessFeature = (feature: string): boolean => {
    if (isDemoMode) {
      return true
    }

    if (!isAuthenticated || !tenantUser) {
      return false
    }

    // Host admin can access all features
    if (tenantUser.role === 'host_admin') {
      return true
    }

    // Check if user has any permission for this feature
    return userPermissions.some(p => p.feature === feature)
  }

  // Get user's permission level for a feature
  const getPermissionLevel = (feature: string): string[] => {
    if (isDemoMode) {
      return [PERMISSIONS.MANAGE]
    }

    if (!isAuthenticated || !tenantUser) {
      return []
    }

    // Host admin has manage permission for everything
    if (tenantUser.role === 'host_admin') {
      return [PERMISSIONS.MANAGE]
    }

    // Get all permissions for this feature
    return userPermissions
      .filter(p => p.feature === feature)
      .map(p => p.permission)
  }

  // Check if user can perform specific actions
  const canCreate = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.CREATE) || hasPermission(feature, PERMISSIONS.MANAGE)
  }

  const canUpdate = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.UPDATE) || hasPermission(feature, PERMISSIONS.MANAGE)
  }

  const canDelete = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.DELETE) || hasPermission(feature, PERMISSIONS.MANAGE)
  }

  const canView = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.VIEW) || 
           hasPermission(feature, PERMISSIONS.MANAGE) ||
           canCreate(feature) || canUpdate(feature)
  }

  const canManage = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.MANAGE)
  }

  const canApprove = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.APPROVE) || hasPermission(feature, PERMISSIONS.MANAGE)
  }

  const canExport = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.EXPORT) || hasPermission(feature, PERMISSIONS.MANAGE)
  }

  const canImport = (feature: string): boolean => {
    return hasPermission(feature, PERMISSIONS.IMPORT) || hasPermission(feature, PERMISSIONS.MANAGE)
  }

  // Get all accessible features for current user
  const getAccessibleFeatures = (): string[] => {
    if (isDemoMode) {
      return Object.values(FEATURES)
    }

    if (!isAuthenticated || !tenantUser) {
      return []
    }

    // Host admin can access all features
    if (tenantUser.role === 'host_admin') {
      return Object.values(FEATURES)
    }

    // Get unique features from user permissions
    return Array.from(new Set(userPermissions.map(p => p.feature)))
  }

  // Check if user is admin (any admin role)
  const isAdmin = (): boolean => {
    if (!isAuthenticated || !tenantUser) {
      return false
    }
    
    return ['host_admin', 'client_admin'].includes(tenantUser.role)
  }

  // Check if user is host admin
  const isHostAdmin = (): boolean => {
    if (!isAuthenticated || !tenantUser) {
      return false
    }
    
    return tenantUser.role === 'host_admin'
  }

  // Check if user can manage other users
  const canManageUsers = (): boolean => {
    return hasPermission(FEATURES.USER_MANAGEMENT, PERMISSIONS.MANAGE)
  }

  // Check if user can access admin features
  const canAccessAdmin = (): boolean => {
    return canAccessFeature(FEATURES.ACCESS_CONTROL) || 
           canAccessFeature(FEATURES.USER_MANAGEMENT) ||
           canAccessFeature(FEATURES.SYSTEM_SETTINGS)
  }

  // Get comprehensive permissions summary
  const getUserPermissions = () => {
    return {
      workRequests: {
        view: canView(FEATURES.WORK_REQUESTS),
        create: canCreate(FEATURES.WORK_REQUESTS),
        update: canUpdate(FEATURES.WORK_REQUESTS),
        approve: canApprove(FEATURES.WORK_REQUESTS)
      },
      projects: {
        view: canView(FEATURES.PROJECT_MANAGEMENT),
        create: canCreate(FEATURES.PROJECT_MANAGEMENT),
        update: canUpdate(FEATURES.PROJECT_MANAGEMENT),
        delete: canDelete(FEATURES.PROJECT_MANAGEMENT)
      },
      risks: {
        view: canView(FEATURES.RISK_MANAGEMENT),
        manage: canManage(FEATURES.RISK_MANAGEMENT)
      },
      users: {
        view: canView(FEATURES.USER_MANAGEMENT),
        manage: canManageUsers()
      },
      reports: {
        view: canView(FEATURES.REPORTING),
        export: canExport(FEATURES.REPORTING)
      },
      admin: {
        access: canAccessAdmin(),
        isAdmin: isAdmin(),
        isHostAdmin: isHostAdmin()
      }
    }
  }

  return {
    // Permission checking
    hasPermission,
    canAccessFeature,
    getPermissionLevel,
    
    // Action-specific checks
    canCreate,
    canUpdate,
    canDelete,
    canView,
    canManage,
    canApprove,
    canExport,
    canImport,
    
    // Utility functions
    getAccessibleFeatures,
    getUserPermissions,
    isAdmin,
    isHostAdmin,
    canManageUsers,
    canAccessAdmin,
    
    // State
    userPermissions,
    isLoading,
    isDemoMode,
    isAuthenticated,
    
    // Current user info
    currentRole: tenantUser?.role,
    currentUserId: user?.id,
    currentTenantId: tenantUser?.tenant_id
  }
}

// Permission guard component
interface PermissionGuardProps {
  feature: string
  permission?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ 
  feature, 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children 
}: PermissionGuardProps) {
  const { hasPermission, canAccessFeature } = usePermissions()
  
  const hasAccess = permission 
    ? hasPermission(feature, permission)
    : canAccessFeature(feature)
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Feature guard component
interface FeatureGuardProps {
  feature: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function FeatureGuard({ feature, fallback = null, children }: FeatureGuardProps) {
  const { canAccessFeature } = usePermissions()
  
  if (!canAccessFeature(feature)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Role guard component
interface RoleGuardProps {
  roles: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { currentRole } = usePermissions()
  
  if (!currentRole || !roles.includes(currentRole)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

export default usePermissions

