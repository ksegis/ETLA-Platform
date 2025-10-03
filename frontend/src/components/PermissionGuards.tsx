
'use client'

import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS, ROLES } from '@/lib/rbac'

// Base Permission Guard Component
interface PermissionGuardProps {
  requiredPermission: string
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PermissionGuard({
  requiredPermission,
  fallback = null,
  children,
  className
}: PermissionGuardProps) {
  const { checkPermission, loading } = usePermissions()

  if (loading) {
    return null; // Or a loading indicator
  }

  if (!checkPermission(requiredPermission)) {
    return <div className={className}>{fallback}</div>
  }

  return <div className={className}>{children}</div>
}

// Feature Guard Component (any access to feature) - this concept is now covered by specific permissions
// We can keep it if there's a need to check for *any* permission related to a feature, but for now,
// we'll focus on explicit permission checks.
// If a feature has a 'view' permission, that would be its FeatureGuard equivalent.

// Role Guard Component
interface RoleGuardProps {
  allowedRoles: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function RoleGuard({ allowedRoles, fallback = null, children, className }: RoleGuardProps) {
  const { currentUserRole, loading } = usePermissions()

  if (loading) {
    return null; // Or a loading indicator
  }

  if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
    return <div className={className}>{fallback}</div>
  }

  return <div className={className}>{children}</div>
}

// Admin Guard Component (checks for host_admin or tenant_admin role)
interface AdminGuardProps {
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AdminGuard({ fallback = null, children, className }: AdminGuardProps) {
  const { currentUserRole, loading } = usePermissions()

  if (loading) {
    return null; // Or a loading indicator
  }

  const isAdmin = currentUserRole === ROLES.HOST_ADMIN || currentUserRole === ROLES.TENANT_ADMIN;

  if (!isAdmin) {
    return <div className={className}>{fallback}</div>
  }

  return <div className={className}>{children}</div>
}

// Button with Permission Check
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  requiredPermission: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionButton({
  requiredPermission,
  fallback = null,
  children,
  className = '',
  ...buttonProps
}: PermissionButtonProps) {
  const { checkPermission, loading } = usePermissions()

  if (loading) {
    return null; // Or a loading indicator
  }

  if (!checkPermission(requiredPermission)) {
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
  requiredPermission: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionLink({
  requiredPermission,
  fallback = null,
  children,
  className = '',
  ...linkProps
}: PermissionLinkProps) {
  const { checkPermission, loading } = usePermissions()

  if (loading) {
    return null; // Or a loading indicator
  }

  if (!checkPermission(requiredPermission)) {
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
// These now directly use PermissionGuard with the specific permission

export function WorkRequestGuard({
  permission = PERMISSIONS.WORK_REQUEST_READ,
  fallback = null,
  children,
  className
}: Omit<PermissionGuardProps, 'requiredPermission'> & { permission?: string }) {
  return (
    <PermissionGuard
      requiredPermission={permission}
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
}: Omit<PermissionButtonProps, 'requiredPermission'>) {
  return (
    <PermissionButton
      requiredPermission={PERMISSIONS.WORK_REQUEST_CREATE}
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
}: Omit<PermissionButtonProps, 'requiredPermission'>) {
  return (
    <PermissionButton
      requiredPermission={PERMISSIONS.TIMECARD_APPROVE} // Assuming work request approval is tied to timecard approval for now
      fallback={fallback}
      className={className}
      {...buttonProps}
    >
      {children}
    </PermissionButton>
  )
}

export function ProjectGuard({
  permission = PERMISSIONS.PROJECT_READ,
  fallback = null,
  children,
  className
}: Omit<PermissionGuardProps, 'requiredPermission'> & { permission?: string }) {
  return (
    <PermissionGuard
      requiredPermission={permission}
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
}: Omit<PermissionButtonProps, 'requiredPermission'>) {
  return (
    <PermissionButton
      requiredPermission={PERMISSIONS.PROJECT_CREATE}
      fallback={fallback}
      className={className}
      {...buttonProps}
    >
      {children}
    </PermissionButton>
  )
}

export function RiskGuard({
  permission = PERMISSIONS.PROJECT_READ, // Assuming risk management falls under project read for now
  fallback = null,
  children,
  className
}: Omit<PermissionGuardProps, 'requiredPermission'> & { permission?: string }) {
  return (
    <PermissionGuard
      requiredPermission={permission}
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

export function UserManagementGuard({
  permission = PERMISSIONS.USER_READ,
  fallback = null,
  children,
  className
}: Omit<PermissionGuardProps, 'requiredPermission'> & { permission?: string }) {
  return (
    <PermissionGuard
      requiredPermission={permission}
      fallback={fallback}
      className={className}
    >
      {children}
    </PermissionGuard>
  )
}

export function ReportingGuard({
  permission = PERMISSIONS.REPORTING_VIEW,
  fallback = null,
  children,
  className
}: Omit<PermissionGuardProps, 'requiredPermission'> & { permission?: string }) {
  return (
    <PermissionGuard
      requiredPermission={permission}
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
}: Omit<PermissionButtonProps, 'requiredPermission'>) {
  return (
    <PermissionButton
      requiredPermission={PERMISSIONS.REPORTING_VIEW} // Assuming export is part of view for now
      fallback={fallback}
      className={className}
      {...buttonProps}
    >
      {children}
    </PermissionButton>
  )
}

export function AccessControlGuard({
  permission = PERMISSIONS.USER_READ, // Assuming access control page requires user read permission
  fallback = null,
  children,
  className
}: Omit<PermissionGuardProps, 'requiredPermission'> & { permission?: string }) {
  return (
    <PermissionGuard
      requiredPermission={permission}
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
  requiredPermission,
  className = "inline-flex items-center px-2 py-1 text-xs rounded-full"
}: {
  requiredPermission: string
  className?: string
}) {
  const { checkPermission, loading } = usePermissions()
  const hasAccess = !loading && checkPermission(requiredPermission)

  return (
    <span className={`${className} ${hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {hasAccess ? '✓ Allowed' : '✗ Denied'}
    </span>
  )
}

// Permission Debug Panel (for development)
export function PermissionDebugPanel({ className = "p-4 bg-gray-100 rounded-lg text-xs" }: { className?: string }) {
  const {
    currentUserRole,
    loading
  } = usePermissions()

  if (loading) {
    return null; // Or a loading indicator
  }

  const isAdmin = currentUserRole === ROLES.HOST_ADMIN || currentUserRole === ROLES.TENANT_ADMIN;
  const isHostAdmin = currentUserRole === ROLES.HOST_ADMIN;

  return (
    <div className={className}>
      <h4 className="font-bold mb-2">Permission Debug Info</h4>
      <div className="space-y-1">
        <div><strong>Role:</strong> {currentUserRole}</div>
        <div><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</div>
        <div><strong>Is Host Admin:</strong> {isHostAdmin ? 'Yes' : 'No'}</div>
      </div>
    </div>
  )
}

export default {
  PermissionGuard,
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

