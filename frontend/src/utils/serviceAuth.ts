import { FEATURES, PERMISSIONS } from '@/hooks/usePermissions'

// Service authorization error types
export class ServiceAuthError extends Error {
  constructor(
    message: string,
    public feature: string,
    public permission: string,
    public userRole?: string
  ) {
    super(message)
    this.name = 'ServiceAuthError'
  }
}

export class InsufficientPermissionsError extends ServiceAuthError {
  constructor(feature: string, permission: string, userRole?: string) {
    super(
      `Insufficient permissions: ${permission} access required for ${feature}`,
      feature,
      permission,
      userRole
    )
    this.name = 'InsufficientPermissionsError'
  }
}

export class UnauthenticatedError extends ServiceAuthError {
  constructor() {
    super('Authentication required', '', '')
    this.name = 'UnauthenticatedError'
  }
}

// Permission checking for services
export interface ServiceAuthContext {
  userId: string | null
  tenantId: string | null
  userRole: string | null
  isAuthenticated: boolean
  isDemoMode: boolean
}

// Default role permissions (same as in usePermissions hook)
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  host_admin: ['*'], // All permissions
  program_manager: [
    `${FEATURES.PROJECT_MANAGEMENT}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.WORK_REQUESTS}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.PROJECT_CHARTER}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.RISK_MANAGEMENT}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.RESOURCE_MANAGEMENT}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.REPORTING}:${PERMISSIONS.VIEW}`,
    `${FEATURES.DASHBOARDS}:${PERMISSIONS.VIEW}`,
    `${FEATURES.ANALYTICS}:${PERMISSIONS.VIEW}`,
    `${FEATURES.USER_MANAGEMENT}:${PERMISSIONS.VIEW}`,
    `${FEATURES.MIGRATION_WORKBENCH}:${PERMISSIONS.VIEW}`,
    `${FEATURES.DATA_VALIDATION}:${PERMISSIONS.VIEW}`
  ],
  client_admin: [
    `${FEATURES.USER_MANAGEMENT}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.ACCESS_CONTROL}:${PERMISSIONS.VIEW}`,
    `${FEATURES.PROJECT_MANAGEMENT}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.WORK_REQUESTS}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.REPORTING}:${PERMISSIONS.VIEW}`,
    `${FEATURES.DASHBOARDS}:${PERMISSIONS.VIEW}`,
    `${FEATURES.BENEFITS_MANAGEMENT}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.EMPLOYEE_RECORDS}:${PERMISSIONS.MANAGE}`,
    `${FEATURES.FILE_UPLOAD}:${PERMISSIONS.CREATE}`,
    `${FEATURES.DATA_VALIDATION}:${PERMISSIONS.VIEW}`,
    `${FEATURES.MIGRATION_WORKBENCH}:${PERMISSIONS.VIEW}`
  ],
  client_user: [
    `${FEATURES.WORK_REQUESTS}:${PERMISSIONS.CREATE}`,
    `${FEATURES.WORK_REQUESTS}:${PERMISSIONS.VIEW}`,
    `${FEATURES.WORK_REQUESTS}:${PERMISSIONS.UPDATE}`,
    `${FEATURES.PROJECT_MANAGEMENT}:${PERMISSIONS.VIEW}`,
    `${FEATURES.REPORTING}:${PERMISSIONS.VIEW}`,
    `${FEATURES.DASHBOARDS}:${PERMISSIONS.VIEW}`,
    `${FEATURES.BENEFITS_MANAGEMENT}:${PERMISSIONS.VIEW}`,
    `${FEATURES.FILE_UPLOAD}:${PERMISSIONS.CREATE}`
  ]
}

// Check if user has permission
export function hasServicePermission(
  context: ServiceAuthContext,
  feature: string,
  permission: string
): boolean {
  // Demo mode allows all operations
  if (context.isDemoMode) {
    return true
  }

  // Must be authenticated
  if (!context.isAuthenticated || !context.userRole) {
    return false
  }

  // Host admin has all permissions
  if (context.userRole === 'host_admin') {
    return true
  }

  // Check role permissions
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[context.userRole] || []
  
  // Check for wildcard permission
  if (rolePermissions.includes('*')) {
    return true
  }

  // Check for specific permission
  const permissionKey = `${feature}:${permission}`
  if (rolePermissions.includes(permissionKey)) {
    return true
  }

  // Check for manage permission (implies all other permissions)
  const managePermissionKey = `${feature}:${PERMISSIONS.MANAGE}`
  if (permission !== PERMISSIONS.MANAGE && rolePermissions.includes(managePermissionKey)) {
    return true
  }

  return false
}

// Service authorization decorator
export function requirePermission(feature: string, permission: string) {
  return function <T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value!

    descriptor.value = async function (...args: T): Promise<R> {
      // Get auth context from global state or parameters
      const context = getServiceAuthContext()
      
      if (!hasServicePermission(context, feature, permission)) {
        if (!context.isAuthenticated) {
          throw new UnauthenticatedError()
        } else {
          throw new InsufficientPermissionsError(feature, permission, context.userRole || undefined)
        }
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// Get current service auth context
export function getServiceAuthContext(): ServiceAuthContext {
  // In a real implementation, this would get the context from the current request
  // For now, we'll use a global context or default values
  if (typeof window !== 'undefined') {
    // Client-side: get from localStorage or global state
    try {
      const authData = localStorage.getItem('etla-auth-context')
      if (authData) {
        return JSON.parse(authData)
      }
    } catch (error) {
      console.warn('Failed to parse auth context from localStorage:', error)
    }
  }

  // Default context for demo mode
  return {
    userId: null, // Should be set by auth context
    tenantId: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
    userRole: 'client_admin',
    isAuthenticated: true,
    isDemoMode: true
  }
}

// Set service auth context (to be called from AuthContext)
export function setServiceAuthContext(context: ServiceAuthContext): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('etla-auth-context', JSON.stringify(context))
    } catch (error) {
      console.warn('Failed to store auth context in localStorage:', error)
    }
  }
}

// Service method wrapper for permission checking
export async function withPermissionCheck<T>(
  feature: string,
  permission: string,
  operation: () => Promise<T>,
  context?: ServiceAuthContext
): Promise<T> {
  const authContext = context || getServiceAuthContext()
  
  if (!hasServicePermission(authContext, feature, permission)) {
    if (!authContext.isAuthenticated) {
      throw new UnauthenticatedError()
    } else {
      throw new InsufficientPermissionsError(feature, permission, authContext.userRole || undefined)
    }
  }

  return operation()
}

// Utility functions for common permission patterns
export const ServiceAuth = {
  // Project Management
  canViewProjects: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.PROJECT_MANAGEMENT, PERMISSIONS.VIEW),
  
  canCreateProjects: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.PROJECT_MANAGEMENT, PERMISSIONS.CREATE),
  
  canUpdateProjects: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.PROJECT_MANAGEMENT, PERMISSIONS.UPDATE),
  
  canDeleteProjects: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.PROJECT_MANAGEMENT, PERMISSIONS.DELETE),

  // Work Requests
  canViewWorkRequests: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.WORK_REQUESTS, PERMISSIONS.VIEW),
  
  canCreateWorkRequests: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.WORK_REQUESTS, PERMISSIONS.CREATE),
  
  canUpdateWorkRequests: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.WORK_REQUESTS, PERMISSIONS.UPDATE),
  
  canApproveWorkRequests: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.WORK_REQUESTS, PERMISSIONS.APPROVE),

  // Risk Management
  canViewRisks: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.RISK_MANAGEMENT, PERMISSIONS.VIEW),
  
  canManageRisks: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.RISK_MANAGEMENT, PERMISSIONS.MANAGE),

  // User Management
  canViewUsers: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.USER_MANAGEMENT, PERMISSIONS.VIEW),
  
  canManageUsers: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.USER_MANAGEMENT, PERMISSIONS.MANAGE),

  // Reporting
  canViewReports: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.REPORTING, PERMISSIONS.VIEW),
  
  canExportReports: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.REPORTING, PERMISSIONS.EXPORT),

  // File Operations
  canUploadFiles: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.FILE_UPLOAD, PERMISSIONS.CREATE),

  // Data Management
  canViewMigrationWorkbench: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.MIGRATION_WORKBENCH, PERMISSIONS.VIEW),
  
  canManageMigrationWorkbench: (context?: ServiceAuthContext) => 
    hasServicePermission(context || getServiceAuthContext(), FEATURES.MIGRATION_WORKBENCH, PERMISSIONS.MANAGE)
}

export default ServiceAuth

