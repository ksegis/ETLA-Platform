import React from 'react'
import { usePermissions, type Feature, type Permission, PERMISSIONS as PERM } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  feature: Feature
  permission?: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({
  feature,
  permission = PERM.VIEW,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { checkPermission } = usePermissions()
  const hasAccess = checkPermission(feature, permission)
  if (!hasAccess) return <>{fallback}</>
  return <>{children}</>
}

interface FeatureGuardProps {
  feature: Feature
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function FeatureGuard({ feature, fallback = null, children }: FeatureGuardProps) {
  const { canAccessFeature } = usePermissions()
  if (!canAccessFeature(feature)) return <>{fallback}</>
  return <>{children}</>
}

interface RoleGuardProps {
  roles: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { currentRole } = usePermissions()
  if (!currentRole || !roles.includes(currentRole)) return <>{fallback}</>
  return <>{children}</>
}

export default { PermissionGuard, FeatureGuard, RoleGuard }
