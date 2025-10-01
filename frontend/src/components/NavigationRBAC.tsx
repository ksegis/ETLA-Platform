"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions, FEATURES, PERMISSIONS } from "@/hooks/usePermissions";

// Navigation item interface
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  feature?: string;
  permission?: string;
  roles?: string[];
  adminOnly?: boolean;
  hostAdminOnly?: boolean;
  children?: NavItem[];
}

// Navigation configuration with RBAC
const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "📊",
  },
  {
    id: "project-management",
    label: "Project Management",
    href: "/project-management",
    icon: "📋",
    feature: FEATURES.PROJECT_MANAGEMENT,
    children: [
      {
        id: "work-requests",
        label: "Work Requests",
        href: "/project-management/requests",
        feature: FEATURES.WORK_REQUESTS,
      },
      {
        id: "project-charters",
        label: "Project Charters",
        href: "/project-management/charters",
        feature: FEATURES.PROJECT_CHARTER,
      },
      {
        id: "risk-management",
        label: "Risk Management",
        href: "/project-management/risks",
        feature: FEATURES.RISK_MANAGEMENT,
      },
      {
        id: "resource-management",
        label: "Resources",
        href: "/project-management/resources",
        feature: FEATURES.RESOURCE_MANAGEMENT,
      },
    ],
  },
  {
    id: "work-requests-standalone",
    label: "Work Requests",
    href: "/work-requests",
    icon: "📝",
    feature: FEATURES.WORK_REQUESTS,
  },
  {
    id: "reporting",
    label: "Reporting",
    href: "/reporting",
    icon: "📈",
    feature: FEATURES.REPORTING,
    children: [
      {
        id: "dashboards",
        label: "Dashboards",
        href: "/dashboards",
        feature: FEATURES.DASHBOARDS,
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/analytics",
        feature: FEATURES.ANALYTICS,
      },
    ],
  },
  {
    id: "data-management",
    label: "Data Management",
    href: "/data-management",
    icon: "🗄️",
    children: [
      {
        id: "migration-workbench",
        label: "Migration Workbench",
        href: "/migration-workbench",
        feature: FEATURES.MIGRATION_WORKBENCH,
      },
      {
        id: "file-upload",
        label: "File Upload",
        href: "/file-upload",
        feature: FEATURES.FILE_UPLOAD,
      },
      {
        id: "data-validation",
        label: "Data Validation",
        href: "/data-validation",
        feature: FEATURES.DATA_VALIDATION,
      },
    ],
  },
  {
    id: "benefits",
    label: "Benefits & HR",
    href: "/benefits",
    icon: "👥",
    feature: FEATURES.BENEFITS_MANAGEMENT,
    children: [
      {
        id: "employee-records",
        label: "Employee Records",
        href: "/employees",
        feature: FEATURES.EMPLOYEE_RECORDS,
      },
      {
        id: "payroll",
        label: "Payroll",
        href: "/payroll",
        feature: FEATURES.PAYROLL_PROCESSING,
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    href: "/admin",
    icon: "⚙️",
    adminOnly: true,
    children: [
      {
        id: "access-control",
        label: "Access Control",
        href: "/admin/access-control",
        feature: FEATURES.ACCESS_CONTROL,
        adminOnly: true,
      },
      {
        id: "rbac-matrix",
        label: "RBAC Matrix",
        href: "/admin/access-control",
        feature: FEATURES.ACCESS_CONTROL,
        adminOnly: true,
      },
      {
        id: "user-management",
        label: "User Management",
        href: "/user-management",
        feature: FEATURES.USER_MANAGEMENT,
        adminOnly: true,
      },
      {
        id: "tenant-management",
        label: "Tenant Management",
        href: "/tenant-management",
        feature: FEATURES.TENANT_MANAGEMENT,
        hostAdminOnly: true,
      },
      {
        id: "system-settings",
        label: "System Settings",
        href: "/system-settings",
        feature: FEATURES.SYSTEM_SETTINGS,
        hostAdminOnly: true,
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        href: "/audit-logs",
        feature: FEATURES.AUDIT_LOGS,
        adminOnly: true,
      },
    ],
  },
];

interface NavigationItemProps {
  item: NavItem;
  level?: number;
  isCollapsed?: boolean;
}

function NavigationItem({
  item,
  level = 0,
  isCollapsed = false,
}: NavigationItemProps) {
  const pathname = usePathname();
  const { canView, isAdmin, isHostAdmin, currentRole } = usePermissions();

  // Check if item should be visible
  const isVisible = () => {
    // Check admin requirements
    if (item.adminOnly && !isAdmin()) return false;
    if (item.hostAdminOnly && !isHostAdmin()) return false;

    // Check role requirements
    if (item.roles && item.roles.length > 0) {
      if (!currentRole || !item.roles.includes(currentRole)) return false;
    }

    // Check feature/permission requirements
    if (item.feature) {
      return canView(item.feature);
    }

    return true;
  };

  if (!isVisible()) return null;

  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;

  // Filter visible children
  const visibleChildren =
    item.children?.filter((child: any) => {
      if (child.adminOnly && !isAdmin()) return false;
      if (child.hostAdminOnly && !isHostAdmin()) return false;
      if (child.feature) {
        return canView(child.feature);
      }
      return true;
    }) || [];

  const baseClasses = `
    flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
    ${level > 0 ? "ml-4" : ""}
  `;

  const activeClasses = isActive
    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  return (
    <div>
      <Link
        href={item.href}
        className={`${baseClasses} ${activeClasses}`}
        title={isCollapsed ? item.label : undefined}
      >
        {item.icon && (
          <span className="mr-3 text-lg" role="img" aria-label={item.label}>
            {item.icon}
          </span>
        )}
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {hasChildren && visibleChildren.length > 0 && (
              <span className="ml-2">{isActive ? "▼" : "▶"}</span>
            )}
          </>
        )}
      </Link>

      {/* Render children if expanded and has visible children */}
      {!isCollapsed &&
        hasChildren &&
        visibleChildren.length > 0 &&
        isActive && (
          <div className="mt-1 space-y-1">
            {visibleChildren.map((child: any) => (
              <NavigationItem
                key={child.id}
                item={child}
                level={level + 1}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        )}
    </div>
  );
}

interface NavigationRBACProps {
  isCollapsed?: boolean;
  className?: string;
}

export function NavigationRBAC({
  isCollapsed = false,
  className = "",
}: NavigationRBACProps) {
  const { isLoading, currentRole, isAdmin, isHostAdmin } = usePermissions();

  if (isLoading) {
    return (
      <nav className={`space-y-1 ${className}`}>
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((i: any) => (
            <div key={i} className="h-10 bg-gray-200 rounded-md mb-2"></div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className={`space-y-1 ${className}`}>
      {/* User role indicator */}
      {!isCollapsed && (
        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200 mb-4">
          <div className="flex items-center justify-between">
            <span>Role: {currentRole}</span>
            <div className="flex space-x-1">
              {isAdmin() && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Admin
                </span>
              )}
              {isHostAdmin() && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  Host
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation items */}
      {NAVIGATION_ITEMS.map((item: any) => (
        <NavigationItem key={item.id} item={item} isCollapsed={isCollapsed} />
      ))}
    </nav>
  );
}

// Breadcrumb component with permission checking
interface BreadcrumbItem {
  label: string;
  href?: string;
  feature?: string;
  permission?: string;
}

interface BreadcrumbRBACProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbRBAC({ items, className = "" }: BreadcrumbRBACProps) {
  const { hasPermission, canAccessFeature } = usePermissions();

  const isItemAccessible = (item: BreadcrumbItem) => {
    if (item.feature) {
      if (item.permission) {
        return hasPermission(item.feature, item.permission);
      } else {
        return canAccessFeature(item.feature);
      }
    }
    return true;
  };

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index: any) => {
          const isLast = index === items.length - 1;
          const isAccessible = isItemAccessible(item);

          return (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}

              {item.href && !isLast && isAccessible ? (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? "text-gray-900 font-medium" : "text-gray-500"
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Quick action buttons with permission checking
interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  feature: string;
  permission: string;
  className?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "create-work-request",
    label: "New Work Request",
    href: "/work-requests/create",
    icon: "📝",
    feature: FEATURES.WORK_REQUESTS,
    permission: PERMISSIONS.CREATE,
    className: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    id: "create-project",
    label: "New Project",
    href: "/project-management/create",
    icon: "📋",
    feature: FEATURES.PROJECT_MANAGEMENT,
    permission: PERMISSIONS.CREATE,
    className: "bg-green-600 hover:bg-green-700 text-white",
  },
  {
    id: "upload-file",
    label: "Upload File",
    href: "/file-upload",
    icon: "📁",
    feature: FEATURES.FILE_UPLOAD,
    permission: PERMISSIONS.CREATE,
    className: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

export function QuickActionsRBAC({ className = "" }: { className?: string }) {
  const { hasPermission } = usePermissions();

  const accessibleActions = QUICK_ACTIONS.filter((action: any) =>
    hasPermission(action.feature, action.permission),
  );

  if (accessibleActions.length === 0) {
    return null;
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {accessibleActions.map((action: any) => (
        <Link
          key={action.id}
          href={action.href}
          className={`
            inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
            transition-colors duration-200
            ${action.className || "bg-gray-600 hover:bg-gray-700 text-white"}
          `}
        >
          <span className="mr-2" role="img" aria-label={action.label}>
            {action.icon}
          </span>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
