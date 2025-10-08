// src/hooks/usePermissions.tsx
"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Re-export the canonical RBAC constants from the source of truth so that
 * existing imports like:
 *   import { usePermissions, PERMISSIONS, FEATURES, ROLES } from "@/hooks/usePermissions";
 * keep working without touching other files.
 */
import { PERMISSIONS, FEATURES, ROLES } from "@/lib/rbac";
export { PERMISSIONS, FEATURES, ROLES };

// ---------- Types (kept intentionally flexible to match your app) ----------
export type Permission = string;
export type Feature = string;
export type Role = string;

type FeaturePermissionMap = Record<Feature, Permission[]>;

export type CheckPermission = {
  // single-arg usage: check by permission only
  (permission: Permission): boolean;
  // two-arg usage: check within a feature gate
  (feature: Feature, permission: Permission): boolean;
};

export interface UsePermissionsResult {
  loading: boolean;
  isAuthenticated: boolean;
  currentUserRole: Role;
  userPermissions: Permission[];
  featurePermissions: FeaturePermissionMap;

  // allow both call signatures
  checkPermission: CheckPermission;

  // convenience helpers (optional, safe)
  hasAny: (perms: Permission[]) => boolean;
  hasAll: (perms: Permission[]) => boolean;
  hasRole: (...roles: Role[]) => boolean;
}

// ---------- Hook ----------
export function usePermissions(): UsePermissionsResult {
  const auth = useAuth?.(); // tolerate undefined in SSR edge cases
  const loading = Boolean(auth?.loading);
  const isAuthenticated = Boolean(auth?.isAuthenticated);

  // Try common places apps store RBAC details. All optional-safe.
  const currentUserRole: Role =
    (auth as any)?.tenantUser?.role ??
    (auth as any)?.user?.role ??
    (auth as any)?.role ??
    ROLES.USER; // sensible default

  const userPermissions: Permission[] =
    (auth as any)?.tenantUser?.permissions ??
    (auth as any)?.user?.permissions ??
    (auth as any)?.permissions ??
    [];

  const featurePermissions: FeaturePermissionMap =
    (auth as any)?.tenantUser?.featurePermissions ??
    (auth as any)?.featurePermissions ??
    {};

  const checkPermission: CheckPermission = (
    a: Permission | Feature,
    b?: Permission,
  ): boolean => {
    // Two-arg mode: (feature, permission)
    if (typeof b === "string") {
      const feature = String(a);
      const permission = b;

      const byFeature = featurePermissions?.[feature] ?? [];
      if (byFeature.includes(permission)) return true;

      // Fallback: global permission list also grants it
      return userPermissions.includes(permission);
    }

    // One-arg mode: (permission)
    const permission = String(a);
    return userPermissions.includes(permission);
  };

  const hasAny = (perms: Permission[]) =>
    perms.some((p) => checkPermission(p));

  const hasAll = (perms: Permission[]) =>
    perms.every((p) => checkPermission(p));

  const hasRole = (...roles: Role[]) => roles.includes(currentUserRole);

  return {
    loading,
    isAuthenticated,
    currentUserRole,
    userPermissions,
    featurePermissions,
    checkPermission,
    hasAny,
    hasAll,
    hasRole,
  };
}

// ---------- Guard components kept for backward compatibility ----------
type GuardCommonProps = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: GuardCommonProps & { permission: Permission }) {
  const { loading, checkPermission } = usePermissions();
  if (loading) return null;
  return checkPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

export function FeatureGuard({
  feature,
  permission,
  fallback = null,
  children,
}: GuardCommonProps & { feature: Feature; permission: Permission }) {
  const { loading, checkPermission } = usePermissions();
  if (loading) return null;
  return checkPermission(feature, permission) ? (
    <>{children}</>
  ) : (
    <>{fallback}</>
  );
}

export function RoleGuard({
  roles,
  fallback = null,
  children,
}: GuardCommonProps & { roles: Role[] }) {
  const { loading, currentUserRole } = usePermissions();
  if (loading) return null;
  return roles.includes(currentUserRole) ? <>{children}</> : <>{fallback}</>;
}

// Keep default export for legacy imports
export default usePermissions;
