// src/hooks/usePermissions.ts
// ⬇️ add/ensure these are exported
export const FEATURES = {
  ACCESS_CONTROL: "access_control",
  TENANT_MANAGEMENT: "tenant_management",
  WORK_REQUESTS: "work_requests",
  PROJECTS: "projects",
  PROJECT_MANAGEMENT: "projects",   // alias for legacy
  RISK_MANAGEMENT: "risk_management",
  DASHBOARDS: "dashboards",
  // ⬇️ legacy alias so code can use FEATURES.REPORTING
  REPORTING: "dashboards",
} as const;

export const PERMISSIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",

  // ⬇️ legacy aliases used all over the app (map to the canonical verbs)
  USER_READ: "view",
  TENANT_READ: "view",
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ⬇️ LEGACY permission name -> { feature, permission } translator
const LEGACY_PERMISSION_MAP: Record<
  string,
  { feature: Feature; permission: Permission }
> = {
  // Tenants
  TENANT_READ: { feature: FEATURES.TENANT_MANAGEMENT, permission: PERMISSIONS.VIEW },
  TENANT_CREATE: { feature: FEATURES.TENANT_MANAGEMENT, permission: PERMISSIONS.CREATE },
  TENANT_UPDATE: { feature: FEATURES.TENANT_MANAGEMENT, permission: PERMISSIONS.UPDATE },
  TENANT_DELETE: { feature: FEATURES.TENANT_MANAGEMENT, permission: PERMISSIONS.DELETE },

  // Users / Access control
  USER_READ: { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.VIEW },
  USER_CREATE: { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.CREATE },
  USER_UPDATE: { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.UPDATE },
  USER_DELETE: { feature: FEATURES.ACCESS_CONTROL, permission: PERMISSIONS.DELETE },

  // Projects
  PROJECT_READ: { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.VIEW },
  PROJECT_CREATE: { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.CREATE },
  PROJECT_UPDATE: { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.UPDATE },
  PROJECT_DELETE: { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.DELETE },

  // Work requests
  WORK_REQUEST_READ: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.VIEW },
  WORK_REQUEST_CREATE: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.CREATE },
  WORK_REQUEST_UPDATE: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.UPDATE },
  WORK_REQUEST_DELETE: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.DELETE },

  // Reporting (alias to dashboards)
  REPORTING_VIEW: { feature: FEATURES.DASHBOARDS, permission: PERMISSIONS.VIEW },

  // Common mis-typed legacy names seen in logs:
  WORK_REQUESTS_CREATE: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.CREATE },
  WORK_REQUESTS_UPDATE: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.UPDATE },
  WORK_REQUESTS_DELETE: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.DELETE },

  // Ad-hoc actions we saw (no strict match in new model) → map to UPDATE:
  APPROVE: { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.UPDATE },
};

// Export roles if you already define them in this file
export type Role = "host_admin" | "tenant_admin" | "user" | string; // adjust to your real union

export function usePermissions() {
  // your existing state
  const loading = false; // whatever you already compute
  const currentUserRole: Role = "user"; // whatever you already compute

  // Your real, canonical permission evaluator (new API)
  const checkPermissionCanonical = (feature: Feature, permission: Permission): boolean => {
    // TODO: keep your real logic; this is just a placeholder call-through
    // return RBACService.has(currentUser, feature, permission)
    return true;
  };

  // ⬇️ Backward-compatible overload
  function checkPermission(feature: Feature, permission: Permission): boolean;
  function checkPermission(legacyPermissionName: string): boolean;
  function checkPermission(arg1: any, arg2?: any): boolean {
    // New API usage: (feature, permission)
    if (arg2) return checkPermissionCanonical(arg1 as Feature, arg2 as Permission);

    // Legacy usage: (permissionName)
    const entry = LEGACY_PERMISSION_MAP[String(arg1)];
    if (!entry) {
      // unknown legacy permission; be conservative
      return false;
    }
    return checkPermissionCanonical(entry.feature, entry.permission);
  }

  const checkAnyPermission = (feature: Feature, permissions: Permission[]) =>
    permissions.some((p) => checkPermission(feature, p));

  const canView = (feature: Feature) => checkPermission(feature, PERMISSIONS.VIEW);
  const canManage = (feature: Feature) =>
    checkAnyPermission(feature, [PERMISSIONS.CREATE, PERMISSIONS.UPDATE, PERMISSIONS.DELETE]);

  return {
    checkPermission,
    checkAnyPermission,
    canView,
    canManage,
    currentUserRole,
    loading,
    // Optional helpers some code expects:
    isAdmin: () => currentUserRole === "host_admin" || currentUserRole === "tenant_admin",
    isHostAdmin: () => currentUserRole === "host_admin",
    // Re‑export constants for old imports
    FEATURES,
    PERMISSIONS,
  };
}
