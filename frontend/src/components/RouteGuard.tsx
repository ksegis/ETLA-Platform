"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { NoAccessFallback } from "./PermissionGuards"; // (kept; safe if unused)
import { PERMISSIONS, ROLES } from "@/lib/rbac";

/* ------------------------------------------------------------------ */
/* Route permission configuration (kept as-is, but now actually used) */
/* ------------------------------------------------------------------ */
const ROUTE_PERMISSIONS: Record<
  string,
  { feature: string; permission: string }
> = {
  // Project Management Routes
  "/project-management": {
    feature: "project",
    permission: PERMISSIONS.PROJECT_READ,
  },
  "/project-management/create": {
    feature: "project",
    permission: PERMISSIONS.PROJECT_CREATE,
  },
  "/project-management/requests": {
    feature: "work_request",
    permission: PERMISSIONS.WORK_REQUEST_READ,
  },
  "/project-management/requests/create": {
    feature: "work_request",
    permission: PERMISSIONS.WORK_REQUEST_CREATE,
  },
  "/project-management/charters": {
    feature: "project",
    permission: PERMISSIONS.PROJECT_READ,
  },
  "/project-management/charters/create": {
    feature: "project",
    permission: PERMISSIONS.PROJECT_CREATE,
  },
  "/project-management/risks": {
    feature: "project",
    permission: PERMISSIONS.PROJECT_READ,
  },
  "/project-management/resources": {
    feature: "project",
    permission: PERMISSIONS.PROJECT_READ,
  },

  // Work Request Routes
  "/work-requests": {
    feature: "work_request",
    permission: PERMISSIONS.WORK_REQUEST_READ,
  },
  "/work-requests/create": {
    feature: "work_request",
    permission: PERMISSIONS.WORK_REQUEST_CREATE,
  },

  // Administration Routes
  "/access-control": {
    feature: "access_control",
    permission: PERMISSIONS.USER_READ,
  },
  "/admin/access-control": {
    feature: "access_control",
    permission: PERMISSIONS.USER_READ,
  },
  "/user-management": {
    feature: "user",
    permission: PERMISSIONS.USER_READ,
  },
  "/tenant-management": {
    feature: "tenant",
    permission: PERMISSIONS.TENANT_READ,
  },
  "/admin/tenant-management": {
    feature: "tenant",
    permission: PERMISSIONS.TENANT_READ,
  },
  "/system-settings": {
    feature: "system_settings",
    permission: PERMISSIONS.TENANT_UPDATE,
  },
  "/audit-logs": {
    feature: "audit_log",
    permission: PERMISSIONS.TENANT_READ,
  },

  // Reporting Routes
  "/reporting": { feature: "reporting", permission: PERMISSIONS.REPORTING_VIEW },
  "/dashboards": {
    feature: "reporting",
    permission: PERMISSIONS.REPORTING_VIEW,
  },
  "/analytics": {
    feature: "reporting",
    permission: PERMISSIONS.REPORTING_VIEW,
  },

  // Data Management Routes
  "/migration-workbench": {
    feature: "data_management",
    permission: PERMISSIONS.TENANT_UPDATE,
  },
  "/talent-import": {
    feature: "data_management",
    permission: PERMISSIONS.TENANT_UPDATE,
  },
  "/file-upload": {
    feature: "data_management",
    permission: PERMISSIONS.TENANT_UPDATE,
  },
  "/data-validation": {
    feature: "data_management",
    permission: PERMISSIONS.TENANT_UPDATE,
  },

  // Benefits & HR Routes
  "/benefits": {
    feature: "benefits",
    permission: PERMISSIONS.USER_READ,
  },
  "/payroll": {
    feature: "payroll",
    permission: PERMISSIONS.TIMECARD_READ_ALL,
  },
  "/employees": {
    feature: "employee_records",
    permission: PERMISSIONS.USER_READ,
  },
};

/* ------------------------------------------------------ */
/* Helpers to normalize/guess the feature when missing     */
/* ------------------------------------------------------ */
function normalizeFeatureName(f?: string): string {
  if (!f) return "work_request"; // safest default
  return String(f);
}

function normalizePermissionName(p?: string): string {
  if (!p) return "view";
  // Don’t force-case: we pass through because your PERMISSIONS come from "@/lib/rbac"
  return String(p);
}

/**
 * Try to determine a feature to use when only a permission string is available.
 * Priority:
 *  1) Explicit prop feature
 *  2) From ROUTE_PERMISSIONS[pathname]
 *  3) Fallback to "work_request"
 */
function pickFeature({
  explicitFeature,
  pathname,
}: {
  explicitFeature?: string;
  pathname: string;
}): string {
  if (explicitFeature) return normalizeFeatureName(explicitFeature);
  const route = ROUTE_PERMISSIONS[pathname];
  if (route?.feature) return normalizeFeatureName(route.feature);
  return "work_request";
}

/* ----------------------- */
/*       RouteGuard        */
/* ----------------------- */
export interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;

  /** Optional explicit feature/permission for new-style usage */
  feature?: string;
  permission?: string;

  /** Legacy single permission key (kept for compatibility) */
  requiredPermission?: string;

  /** Optional role gating */
  roles?: string[]; // uses your ROLES from "@/lib/rbac"
  anyRole?: boolean; // kept for compatibility; "any" by default
}

export function RouteGuard({
  children,
  fallback,
  redirectTo = "/dashboard",
  feature,
  permission,
  requiredPermission,
  roles,
  anyRole = true,
}: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { checkPermission, currentUserRole, loading: Loading } = usePermissions();
  const { isAuthenticated } = useAuth();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authMessage, setAuthMessage] = useState<string>("");

  // Pre-calc the best feature/permission pair to check when explicit props are given
  const explicitCheck = useMemo(() => {
    if (!feature && !permission && !requiredPermission) return null;

    if (feature && (permission || requiredPermission)) {
      // explicit feature + permission provided
      return {
        feature: normalizeFeatureName(feature),
        permission: normalizePermissionName(permission || requiredPermission),
      };
    }

    if (!feature && (permission || requiredPermission)) {
      // only a permission was provided; pick a feature from the current route or fallback
      return {
        feature: pickFeature({ explicitFeature: undefined, pathname }),
        permission: normalizePermissionName(permission || requiredPermission),
      };
    }

    return null;
  }, [feature, permission, requiredPermission, pathname]);

  useEffect(() => {
    if (Loading) {
      setIsAuthorized(null);
      return;
    }

    // 1) Must be authenticated
    if (!isAuthenticated) {
      setIsAuthorized(false);
      setAuthMessage("You must be logged in to access this page.");
      return;
    }

    // 2) Role gating (if roles provided)
    if (roles && roles.length > 0) {
      const roleStr = String(currentUserRole ?? "");
      const okByRole = roles.map(String).includes(roleStr);
      if (!okByRole) {
        setIsAuthorized(false);
        setAuthMessage("You do not have the required role to view this page.");
        return;
      }
    }

    // 3) If caller provided explicit feature/permission (or requiredPermission), honor that first
    if (explicitCheck) {
      const ok = checkPermission(explicitCheck.feature, explicitCheck.permission);
      if (!ok) {
        setIsAuthorized(false);
        setAuthMessage(
          `You don't have permission to access this feature. Required: ${explicitCheck.feature}.${explicitCheck.permission}`,
        );
        return;
      }
      setIsAuthorized(true);
      setAuthMessage("");
      return;
    }

    // 4) Route-config-based checks
    const routeConfig = ROUTE_PERMISSIONS[pathname];
    if (routeConfig) {
      const ok = checkPermission(
        normalizeFeatureName(routeConfig.feature),
        normalizePermissionName(routeConfig.permission),
      );
      if (!ok) {
        setIsAuthorized(false);
        setAuthMessage(
          `You don't have permission to access this feature. Required: ${routeConfig.feature}.${routeConfig.permission}`,
        );
        return;
      }
    }

    // 5) Dynamic routes (with parameters) — use feature + permission checks
    const dynamicRouteChecks: Array<{ pattern: RegExp; feature: string; permission: string }> = [
      {
        pattern: /^\/work-requests\/[^/]+$/,
        feature: "work_request",
        permission: PERMISSIONS.WORK_REQUEST_READ,
      },
      {
        pattern: /^\/work-requests\/[^/]+\/edit$/,
        feature: "work_request",
        permission: PERMISSIONS.WORK_REQUEST_UPDATE,
      },
      {
        pattern: /^\/project-management\/requests\/[^/]+$/,
        feature: "work_request",
        permission: PERMISSIONS.WORK_REQUEST_READ,
      },
      {
        pattern: /^\/project-management\/charters\/[^/]+$/,
        feature: "project",
        permission: PERMISSIONS.PROJECT_READ,
      },
    ];

    for (const check of dynamicRouteChecks) {
      if (check.pattern.test(pathname)) {
        const ok = checkPermission(
          normalizeFeatureName(check.feature),
          normalizePermissionName(check.permission),
        );
        if (!ok) {
          setIsAuthorized(false);
          setAuthMessage(
            `You don't have permission to access this feature. Required: ${check.feature}.${check.permission}`,
          );
          return;
        }
        break;
      }
    }

    // Authorized
    setIsAuthorized(true);
    setAuthMessage("");
  }, [
    pathname,
    checkPermission,
    Loading,
    isAuthenticated,
    roles,
    currentUserRole,
    explicitCheck,
  ]);

  // Loading state while checking permissions
  if (Loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Unauthorized
  if (!isAuthorized) {
    if (fallback) return <>{fallback}</>;
    router.push("/unauthorized");
    return null;
  }

  return <>{children}</>;
}

/* --------------------------------------------- */
/* HOC wrapper (kept API)                        */
/* --------------------------------------------- */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
    feature?: string;        // allow explicit feature/permission via HOC too
    permission?: string;
    requiredPermission?: string;
    roles?: string[];
  },
) {
  const WrappedComponent = (props: P) => {
    return (
      <RouteGuard
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
        feature={options?.feature}
        permission={options?.permission}
        requiredPermission={options?.requiredPermission}
        roles={options?.roles}
      >
        <Component {...props} />
      </RouteGuard>
    );
  };

  WrappedComponent.displayName = `withRouteGuard(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/* ------------------------------------------------------------- */
/* Specific guards — now explicit about feature + permission      */
/* (so they don’t rely on “permission-only” legacy behavior)      */
/* ------------------------------------------------------------- */
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard feature="user" permission={PERMISSIONS.USER_READ}>
      {children}
    </RouteGuard>
  );
}

export function HostAdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard feature="tenant" permission={PERMISSIONS.TENANT_READ}>
      {children}
    </RouteGuard>
  );
}

export function ProjectManagementRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard feature="project" permission={PERMISSIONS.PROJECT_READ}>
      {children}
    </RouteGuard>
  );
}

export function WorkRequestRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard feature="work_request" permission={PERMISSIONS.WORK_REQUEST_READ}>
      {children}
    </RouteGuard>
  );
}

export function ReportingRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard feature="reporting" permission={PERMISSIONS.REPORTING_VIEW}>
      {children}
    </RouteGuard>
  );
}

/* ------------------------------------------------------------- */
/* Utilities (kept)                                              */
/* ------------------------------------------------------------- */
export function isRouteAccessible(
  pathname: string,
  checkPermissionFunc: (feature: string, permission: string) => boolean,
): boolean {
  const routeConfig = ROUTE_PERMISSIONS[pathname];
  if (!routeConfig) return true;
  return checkPermissionFunc(
    normalizeFeatureName(routeConfig.feature),
    normalizePermissionName(routeConfig.permission),
  );
}

export function getAccessibleRoutes(
  checkPermissionFunc: (feature: string, permission: string) => boolean,
): string[] {
  return Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    isRouteAccessible(route, checkPermissionFunc),
  );
}

export default RouteGuard;
