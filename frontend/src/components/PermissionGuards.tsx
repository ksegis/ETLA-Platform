'use client'

import React from 'react'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'

// Base Permission Guard Component
interface PermissionGuardProps {
  feature: string
  permission?: string
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PermissionGuard({ 
  feature, 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children,
  className 
}: PermissionGuardProps) {
  const { hasPermission, canAccessFeature } = usePermissions()
  
  const hasAccess = permission 
    ? hasPermission(feature, permission)
    : canAccessFeature(feature)
  
  if (!hasAccess) {
    return <div className={className}>{fallback}</div>
  }
  
  return <div className={className}>{children}</div>
}

// Feature Guard Component (any access to feature)
interface FeatureGuardProps {
  feature: string
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function FeatureGuard({ feature, fallback = null, children, className }: FeatureGuardProps) {
  const { canAccessFeature } = usePermissions()
  
  if (!canAccessFeature(feature)) {
    return <div className={className}>{fallback}</div>
  }
  
  return <div className={className}>{children}</div>
}

// Role Guard Component
interface RoleGuardProps {
  roles: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function RoleGuard({ roles, fallback = null, children, className }: RoleGuardProps) {
  const { currentRole } = usePermissions()
  
  if (!currentRole || !roles.includes(currentRole)) {
    return <div className={className}>{fallback}</div>
  }
  
  return <div className={className}>{children}</div>
}

// Admin Guard Component
interface AdminGuardProps {
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AdminGuard({ fallback = null, children, className }: AdminGuardProps) {
  const { isAdmin } = usePermissions()
  
  if (!isAdmin()) {
    return <div className={className}>{fallback}</div>
  }
  
  return <div className={className}>{children}</div>
}

// Button with Permission Check
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  feature: string
  permission: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionButton({ 
  feature, 
  permission, 
  fallback = null, 
  children, 
  className = '',
  ...buttonProps 
}: PermissionButtonProps) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(feature, permission)) {
    return <>{fallback}</>
  }
  
  return (
    <button 
      className={`${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  )
}

// Link with Permission Check
interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  feature: string
  permission?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionLink({ 
  feature, 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children, 
  className = '',
  ...linkProps 
}: PermissionLinkProps) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(feature, permission)) {
    return <>{fallback}</>
  }
  
  return (
    <a 
      className={`${className}`}
      {...linkProps}
    >
      {children}
    </a>
  )
}

// Conditional Render based on permissions
interface ConditionalRenderProps {
  condition: () => boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ConditionalRender({ condition, children, fallback = null }: ConditionalRenderProps) {
  if (!condition()) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Specific Feature Guards for common use cases

// Work Request Guards
export function WorkRequestGuard({ 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children, 
  className 
}: Omit<PermissionGuardProps, 'feature'>) {
  return (
    <PermissionGuard 
      feature={FEATURES.WORK_REQUESTS} 
      permission={permission} 
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

export function WorkRequestCreateButton({ 
  fallback = null, 
  children, 
  className = '',
  ...buttonProps 
}: Omit<PermissionButtonProps, 'feature' | 'permission'>) {
  return (
    <PermissionButton 
      feature={FEATURES.WORK_REQUESTS} 
      permission={PERMISSIONS.CREATE} 
      fallback={fallback}
      className={className}
      {...buttonProps}
    >
      {children}
    </PermissionButton>
  )
}

export function WorkRequestApproveButton({ 
  fallback = null, 
  children, 
  className = '',
  ...buttonProps 
}: Omit<PermissionButtonProps, 'feature' | 'permission'>) {
  return (
    <PermissionButton 
      feature={FEATURES.WORK_REQUESTS} 
      permission={PERMISSIONS.APPROVE} 
      fallback={fallback}
      className={className}
      {...buttonProps}
    >
      {children}
    </PermissionButton>
  )
}

// Project Management Guards
export function ProjectGuard({ 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children, 
  className 
}: Omit<PermissionGuardProps, 'feature'>) {
  return (
    <PermissionGuard 
      feature={FEATURES.PROJECT_MANAGEMENT} 
      permission={permission} 
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

export function ProjectCreateButton({ 
  fallback = null, 
  children, 
  className = '',
  ...buttonProps 
}: Omit<PermissionButtonProps, 'feature' | 'permission'>) {
  return (
    <PermissionButton 
      feature={FEATURES.PROJECT_MANAGEMENT} 
      permission={PERMISSIONS.CREATE} 
      fallback={fallback}
      className={className}
      {...buttonProps}
    >
      {children}
    </PermissionButton>
  )
}

// Risk Management Guards
export function RiskGuard({ 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children, 
  className 
}: Omit<PermissionGuardProps, 'feature'>) {
  return (
    <PermissionGuard 
      feature={FEATURES.RISK_MANAGEMENT} 
      permission={permission} 
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

// User Management Guards
export function UserManagementGuard({ 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children, 
  className 
}: Omit<PermissionGuardProps, 'feature'>) {
  return (
    <PermissionGuard 
      feature={FEATURES.USER_MANAGEMENT} 
      permission={permission} 
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

// Reporting Guards
export function ReportingGuard({ 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children, 
  className 
}: Omit<PermissionGuardProps, 'feature'>) {
  return (
    <PermissionGuard 
      feature={FEATURES.REPORTING} 
      permission={permission} 
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

export function ReportExportButton({ 
  fallback = null, 
  children, 
  className = '',
  ...buttonProps 
}: Omit<PermissionButtonProps, 'feature' | 'permission'>) {
  return (
    <PermissionButton 
      feature={FEATURES.REPORTING} 
      permission={PERMISSIONS.EXPORT} 
      fallback={fallback}
      className={className}
      {...buttonProps}
    >
      {children}
    </PermissionButton>
  )
}

// Access Control Guards
export function AccessControlGuard({ 
  permission = PERMISSIONS.VIEW, 
  fallback = null, 
  children, 
  className 
}: Omit<PermissionGuardProps, 'feature'>) {
  return (
    <PermissionGuard 
      feature={FEATURES.ACCESS_CONTROL} 
      permission={permission} 
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

// No Access Fallback Component
export function NoAccessFallback({ 
  message = "You don't have permission to access this feature.",
  className = "p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200"
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="text-lg mb-2">🔒</div>
      <p>{message}</p>
    </div>
  )
}

// Permission Status Indicator
export function PermissionStatus({ 
  feature, 
  permission, 
  className = "inline-flex items-center px-2 py-1 text-xs rounded-full"
}: {
  feature: string
  permission: string
  className?: string
}) {
  const { hasPermission } = usePermissions()
  const hasAccess = hasPermission(feature, permission)
  
  return (
    <span className={`${className} ${hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {hasAccess ? '✓ Allowed' : '✗ Denied'}
    </span>
  )
}

// Permission Debug Panel (for development)
export function PermissionDebugPanel({ className = "p-4 bg-gray-100 rounded-lg text-xs" }: { className?: string }) {
  const { 
    currentRole, 
    currentUserId, 
    currentTenantId, 
    userPermissions, 
    getAccessibleFeatures,
    isAdmin,
    isDemoMode 
  } = usePermissions()
  
  return (
    <div className={className}>
      <h4 className="font-bold mb-2">Permission Debug Info</h4>
      <div className="space-y-1">
        <div><strong>User ID:</strong> {currentUserId}</div>
        <div><strong>Tenant ID:</strong> {currentTenantId}</div>
        <div><strong>Role:</strong> {currentRole}</div>
        <div><strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</div>
        <div><strong>Demo Mode:</strong> {isDemoMode ? 'Yes' : 'No'}</div>
        <div><strong>Permissions:</strong> {userPermissions.length}</div>
        <div><strong>Accessible Features:</strong> {getAccessibleFeatures().length}</div>
      </div>
    </div>
  )
}

export default {
  PermissionGuard,
  FeatureGuard,
  RoleGuard,
  AdminGuard,
  PermissionButton,
  PermissionLink,
  ConditionalRender,
  WorkRequestGuard,
  WorkRequestCreateButton,
  WorkRequestApproveButton,
  ProjectGuard,
  ProjectCreateButton,
  RiskGuard,
  UserManagementGuard,
  ReportingGuard,
  ReportExportButton,
  AccessControlGuard,
  NoAccessFallback,
  PermissionStatus,
  PermissionDebugPanel
}

