"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  FEATURES, PERMISSIONS, ROLES,
  type Feature, type Permission, type Role
} from "@/rbac/constants";

/**
 * Single, stable surface:
 * - checkPermission(feature, permission)
 * - checkAnyPermission(feature, [permissions...])
 * - canView(feature), canManage(feature)
 * - currentUserRole, loading
 *
 * NOTE: If you previously called checkPermission(permission) with 1 arg,
 * update callsites to pass FEATURE + PERMISSION. (See step 5)
 */
export function usePermissions() {
  const { tenantUser, isAuthenticated } = useAuth(); // replace with your source of role/claims
  const loading = !tenantUser && isAuthenticated;    // tweak if needed

  const currentUserRole: Role | null = (tenantUser?.role as Role) ?? null;
  const isPlatformAdmin = currentUserRole === ROLES.PLATFORM_ADMIN;

  // TODO: wire this to your real permission matrix:
  // e.g. tenantUser?.permissions[feature]?.includes(permission)
  const checkPermission = (feature: Feature, permission: Permission): boolean => {
    if (isPlatformAdmin) return true;

    // Minimal safe default so screens render while we migrate:
    if (permission === PERMISSIONS.VIEW) return true;

    // Put real checks here:
    // const perms = tenantUser?.permissions?.[feature] as Permission[] | undefined;
    // return !!perms?.includes(permission);

    return false;
  };

  const checkAnyPermission = (feature: Feature, permissions: Permission[]) =>
    permissions.some((p) => checkPermission(feature, p));

  const canView   = (feature: Feature) => checkPermission(feature, PERMISSIONS.VIEW);
  const canManage = (feature: Feature) =>
    checkAnyPermission(feature, [PERMISSIONS.CREATE, PERMISSIONS.UPDATE, PERMISSIONS.DELETE]);

  return { checkPermission, checkAnyPermission, canView, canManage, currentUserRole, loading };
}

