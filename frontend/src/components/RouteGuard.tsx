'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import { NoAccessFallback } from './PermissionGuards'

// Route permission configuration
const ROUTE_PERMISSIONS: Record<string, { feature: string; permission: string }> = {
  // Project Management Routes
  '/project-management': { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.VIEW },
  '/project-management/create': { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.CREATE },
  '/project-management/requests': { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.VIEW },
  '/project-management/requests/create': { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.CREATE },
  '/project-management/charters': { feature: FEATURES.PROJECT_CHARTER, permission: PERMISSIONS.VIEW },
  '/project-management/charters/create': { feature: FEATURES.PROJECT_CHARTER, permission: PERMISSIONS.CREATE },
  '/project-management/risks': { feature: FEATURES.RISK_MANAGEMENT, permission: PERMISSIONS.VIEW },
  '/project-management/resources': { feature: FEATURES.RESOURCE_MANAGEMENT, permission: PERMISSIONS.VIEW },
  
  // Work Request Routes
  '/work-requests': { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.VIEW },
  '/work-requests/create': { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.CREATE },
  
  // Administration Routes
  '/access-control': { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.VIEW },
  '/user-management': { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.VIEW },
  '/tenant-management': { feature: FEATURES.TENANT_MANAGEMENT, permission: PERMISSIONS.VIEW },
  '/system-settings': { feature: FEATURES.SYSTEM_SETTINGS, permission: PERMISSIONS.VIEW },
  '/audit-logs': { feature: FEATURES.AUDIT_LOGS, permission: PERMISSIONS.VIEW },
  
  // Reporting Routes
  '/reporting': { feature: FEATURES.REPORTING, permission: PERMISSIONS.VIEW },
  '/dashboards': { feature: FEATURES.DASHBOARDS, permission: PERMISSIONS.VIEW },
  '/analytics': { feature: FEATURES.ANALYTICS, permission: PERMISSIONS.VIEW },
  
  // Data Management Routes
  '/migration-workbench': { feature: FEATURES.MIGRATION_WORKBENCH, permission: PERMISSIONS.VIEW },
  '/file-upload': { feature: FEATURES.FILE_UPLOAD, permission: PERMISSIONS.CREATE },
  '/data-validation': { feature: FEATURES.DATA_VALIDATION, permission: PERMISSIONS.VIEW },
  
  // Benefits & HR Routes
  '/benefits': { feature: FEATURES.BENEFITS_MANAGEMENT, permission: PERMISSIONS.VIEW },
  '/payroll': { feature: FEATURES.PAYROLL_PROCESSING, permission: PERMISSIONS.VIEW },
  '/employees': { feature: FEATURES.EMPLOYEE_RECORDS, permission: PERMISSIONS.VIEW }
}

// Admin-only routes
const ADMIN_ROUTES = [
  '/access-control',
  '/user-management',
  '/tenant-management',
  '/system-settings',
  '/audit-logs'
]

// Host admin-only routes
const HOST_ADMIN_ROUTES = [
  '/tenant-management',
  '/system-settings'
]

interface RouteGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  fallback,
  redirectTo = '/dashboard'
}: RouteGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { 
    hasPermission, 
    isAdmin, 
    isHostAdmin, 
    isLoading, 
    isAuthenticated,
    currentRole 
  } = usePermissions()
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [authMessage, setAuthMessage] = useState<string>('')

  useEffect(() => {
    if (isLoading) {
      setIsAuthorized(null)
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setIsAuthorized(false)
      setAuthMessage('You must be logged in to access this page.')
      return
    }

    // Check admin-only routes
    if (ADMIN_ROUTES.includes(pathname)) {
      if (!isAdmin()) {
        setIsAuthorized(false)
        setAuthMessage('This page requires administrator privileges.')
        return
      }
    }

    // Check host admin-only routes
    if (HOST_ADMIN_ROUTES.includes(pathname)) {
      if (!isHostAdmin()) {
        setIsAuthorized(false)
        setAuthMessage('This page requires host administrator privileges.')
        return
      }
    }

    // Check specific route permissions
    const routePermission = ROUTE_PERMISSIONS[pathname]
    if (routePermission) {
      const hasAccess = hasPermission(routePermission.feature, routePermission.permission)
      if (!hasAccess) {
        setIsAuthorized(false)
        setAuthMessage(`You don't have permission to ${routePermission.permission} ${routePermission.feature.replace('-', ' ')}.`)
        return
      }
    }

    // Check dynamic routes (with parameters)
    const dynamicRouteChecks = [
      {
        pattern: /^\/work-requests\/[^\/]+$/,
        feature: FEATURES.WORK_REQUESTS,
        permission: PERMISSIONS.VIEW
      },
      {
        pattern: /^\/work-requests\/[^\/]+\/edit$/,
        feature: FEATURES.WORK_REQUESTS,
        permission: PERMISSIONS.UPDATE
      },
      {
        pattern: /^\/project-management\/requests\/[^\/]+$/,
        feature: FEATURES.WORK_REQUESTS,
        permission: PERMISSIONS.VIEW
      },
      {
        pattern: /^\/project-management\/charters\/[^\/]+$/,
        feature: FEATURES.PROJECT_CHARTER,
        permission: PERMISSIONS.VIEW
      }
    ]

    for (const check of dynamicRouteChecks) {
      if (check.pattern.test(pathname)) {
        const hasAccess = hasPermission(check.feature, check.permission)
        if (!hasAccess) {
          setIsAuthorized(false)
          setAuthMessage(`You don't have permission to ${check.permission} ${check.feature.replace('-', ' ')}.`)
          return
        }
        break
      }
    }

    // If we get here, user is authorized
    setIsAuthorized(true)
    setAuthMessage('')

  }, [pathname, hasPermission, isAdmin, isHostAdmin, isLoading, isAuthenticated])

  // Show loading state while checking permissions
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message or redirect
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">{authMessage}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push(redirectTo)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-left">
                <div><strong>Path:</strong> {pathname}</div>
                <div><strong>Role:</strong> {currentRole}</div>
                <div><strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</div>
                <div><strong>Is Host Admin:</strong> {isHostAdmin() ? 'Yes' : 'No'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // User is authorized, render children
  return <>{children}</>
}

// Higher-order component for page-level protection
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode
    redirectTo?: string
  }
) {
  const WrappedComponent = (props: P) => {
    return (
      <RouteGuard fallback={options?.fallback} redirectTo={options?.redirectTo}>
        <Component {...props} />
      </RouteGuard>
    )
  }

  WrappedComponent.displayName = `withRouteGuard(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Specific route guards for common patterns
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = usePermissions()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!isAdmin()) {
    return (
      <NoAccessFallback 
        message="This page requires administrator privileges."
        className="min-h-screen flex items-center justify-center"
      />
    )
  }
  
  return <>{children}</>
}

export function HostAdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isHostAdmin, isLoading } = usePermissions()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!isHostAdmin()) {
    return (
      <NoAccessFallback 
        message="This page requires host administrator privileges."
        className="min-h-screen flex items-center justify-center"
      />
    )
  }
  
  return <>{children}</>
}

// Feature-specific route guards
export function ProjectManagementRouteGuard({ children }: { children: React.ReactNode }) {
  const { canAccessFeature, isLoading } = usePermissions()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!canAccessFeature(FEATURES.PROJECT_MANAGEMENT)) {
    return (
      <NoAccessFallback 
        message="You don't have access to project management features."
        className="min-h-screen flex items-center justify-center"
      />
    )
  }
  
  return <>{children}</>
}

export function WorkRequestRouteGuard({ children }: { children: React.ReactNode }) {
  const { canAccessFeature, isLoading } = usePermissions()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!canAccessFeature(FEATURES.WORK_REQUESTS)) {
    return (
      <NoAccessFallback 
        message="You don't have access to work request features."
        className="min-h-screen flex items-center justify-center"
      />
    )
  }
  
  return <>{children}</>
}

export function ReportingRouteGuard({ children }: { children: React.ReactNode }) {
  const { canAccessFeature, isLoading } = usePermissions()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!canAccessFeature(FEATURES.REPORTING)) {
    return (
      <NoAccessFallback 
        message="You don't have access to reporting features."
        className="min-h-screen flex items-center justify-center"
      />
    )
  }
  
  return <>{children}</>
}

// Utility function to check if a route is accessible
export function isRouteAccessible(pathname: string, permissions: any): boolean {
  const routePermission = ROUTE_PERMISSIONS[pathname]
  
  if (!routePermission) {
    return true // Allow access to routes without specific permissions
  }
  
  return permissions.hasPermission(routePermission.feature, routePermission.permission)
}

// Get accessible routes for navigation
export function getAccessibleRoutes(permissions: any): string[] {
  return Object.keys(ROUTE_PERMISSIONS).filter((route: any) => 
    isRouteAccessible(route, permissions)
  )
}

export default RouteGuard

