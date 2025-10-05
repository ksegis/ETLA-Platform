"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { NoAccessFallback } from "./PermissionGuards";
import { PERMISSIONS, ROLES } from "@/lib/rbac"; // Import PERMISSIONS and ROLES from rbac.ts

// Route permission configuration
const ROUTE_PERMISSIONS: Record<
  string,
  { feature: string; permission: string }
> = {
  // Project Management Routes
  "/project-management": {
    feature: "project", // Using a generic feature name, map to actual permission
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
    feature: "project", // Assuming charters are part of project management
    permission: PERMISSIONS.PROJECT_READ,
  },
  "/project-management/charters/create": {
    feature: "project",
    permission: PERMISSIONS.PROJECT_CREATE,
  },
  "/project-management/risks": {
    feature: "project", // Assuming risks are part of project management
    permission: PERMISSIONS.PROJECT_READ,
  },
  "/project-management/resources": {
    feature: "project", // Assuming resources are part of project management
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
    feature: "access_control", // New feature for access control page
    permission: PERMISSIONS.USER_READ, // Assuming viewing access control requires user read permission
  },
  "/user-management": {
    feature: "user",
    permission: PERMISSIONS.USER_READ,
  },
  "/tenant-management": {
    feature: "tenant",
    permission: PERMISSIONS.TENANT_READ,
  },
  "/system-settings": {
    feature: "system_settings", // New feature
    permission: PERMISSIONS.TENANT_UPDATE, // Assuming system settings are managed by tenant admin
  },
  "/audit-logs": { feature: "audit_log", permission: PERMISSIONS.TENANT_READ }, // New feature

  // Reporting Routes
  "/reporting": { feature: "reporting", permission: PERMISSIONS.REPORTING_VIEW },
  "/dashboards": { feature: "reporting", permission: PERMISSIONS.REPORTING_VIEW }, // Dashboards are part of reporting
  "/analytics": { feature: "reporting", permission: PERMISSIONS.REPORTING_VIEW }, // Analytics are part of reporting

  // Data Management Routes
  "/migration-workbench": {
    feature: "data_management", // New feature
    permission: PERMISSIONS.TENANT_UPDATE, // Assuming data management is a high-level permission
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
    feature: "benefits", // New feature
    permission: PERMISSIONS.USER_READ, // Assuming benefits viewing requires user read
  },
  "/payroll": {
    feature: "payroll", // New feature
    permission: PERMISSIONS.TIMECARD_READ_ALL, // Assuming payroll requires reading all timecards
  },
  "/employees": {
    feature: "employee_records", // New feature
    permission: PERMISSIONS.USER_READ,
  },
};

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  fallback,
  redirectTo = "/dashboard",
}: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { checkPermission, currentUserRole, loading: isLoading } = usePermissions();
  const { isAuthenticated } = useAuth();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authMessage, setAuthMessage] = useState<string>("");

  useEffect(() => {
    if (isLoading) {
      setIsAuthorized(null);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setIsAuthorized(false);
      setAuthMessage("You must be logged in to access this page.");
      return;
    }

    // Check specific route permissions
    const routeConfig = ROUTE_PERMISSIONS[pathname];
    if (routeConfig) {
      const hasAccess = checkPermission(routeConfig.permission);
      if (!hasAccess) {
        setIsAuthorized(false);
        setAuthMessage(
          `You don't have permission to access this feature. Required: ${routeConfig.permission}`,
        );
        return;
      }
    }

    // Check dynamic routes (with parameters)
    const dynamicRouteChecks = [
      {
        pattern: /^\/work-requests\/[^\/]+$/,
        permission: PERMISSIONS.WORK_REQUEST_READ,
      },
      {
        pattern: /^\/work-requests\/[^\/]+\/edit$/,
        permission: PERMISSIONS.WORK_REQUEST_UPDATE,
      },
      {
        pattern: /^\/project-management\/requests\/[^\/]+$/,
        permission: PERMISSIONS.WORK_REQUEST_READ,
      },
      {
        pattern: /^\/project-management\/charters\/[^\/]+$/,
        permission: PERMISSIONS.PROJECT_READ,
      },
    ];

    for (const check of dynamicRouteChecks) {
      if (check.pattern.test(pathname)) {
        const hasAccess = checkPermission(check.permission);
        if (!hasAccess) {
          setIsAuthorized(false);
          setAuthMessage(
            `You don't have permission to access this feature. Required: ${check.permission}`,
          );
          return;
        }
        break;
      }
    }

    // If we get here, user is authorized
    setIsAuthorized(true);
    setAuthMessage("");
  }, [
    pathname,
    checkPermission,
    isLoading,
    isAuthenticated,
  ]);

  // Show loading state while checking permissions
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message or redirect
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirect to unauthorized page instead of showing inline message
    router.push("/unauthorized");
    return null; // Return null to prevent rendering children while redirecting
  }

  // User is authorized, render children
  return <>{children}</>;
}

// Higher-order component for page-level protection
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  },
) {
  const WrappedComponent = (props: P) => {
    return (
      <RouteGuard fallback={options?.fallback} redirectTo={options?.redirectTo}>
        <Component {...props} />
      </RouteGuard>
    );
  };

  WrappedComponent.displayName = `withRouteGuard(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Specific guards will now use the generic RouteGuard with specific permissions
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredPermission={PERMISSIONS.USER_READ}> {/* Assuming any admin can read users */}
      {children}
    </RouteGuard>
  );
}

export function HostAdminRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredPermission={PERMISSIONS.TENANT_READ}> {/* Host admin can read tenants */}
      {children}
    </RouteGuard>
  );
}

// Feature-specific route guards - these will now use the generic RouteGuard with the specific permission
export function ProjectManagementRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredPermission={PERMISSIONS.PROJECT_READ}>
      {children}
    </RouteGuard>
  );
}

export function WorkRequestRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredPermission={PERMISSIONS.WORK_REQUEST_READ}>
      {children}
    </RouteGuard>
  );
}

export function ReportingRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredPermission={PERMISSIONS.REPORTING_VIEW}>
      {children}
    </RouteGuard>
  );
}

// Utility function to check if a route is accessible - this will be updated to use checkPermission
export function isRouteAccessible(pathname: string, checkPermissionFunc: (permission: string) => boolean): boolean {
  const routeConfig = ROUTE_PERMISSIONS[pathname];

  if (!routeConfig) {
    return true; // Allow access to routes without specific permissions
  }

  return checkPermissionFunc(routeConfig.permission);
}

// Get accessible routes for navigation - this will be updated to use checkPermission
export function getAccessibleRoutes(checkPermissionFunc: (permission: string) => boolean): string[] {
  return Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    isRouteAccessible(route, checkPermissionFunc),
  );
}

export default RouteGuard;

