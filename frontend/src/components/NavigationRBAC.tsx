import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS, ROLES } from "@/lib/rbac";

// Navigation item interface
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  requiredPermission?: string; // Use requiredPermission directly
  feature?: string;
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
    requiredPermission: PERMISSIONS.PROJECT_READ,
    children: [
      {
        id: "work-requests",
        label: "Work Requests",
        href: "/project-management/requests",
        requiredPermission: PERMISSIONS.WORK_REQUEST_READ,
      },
      {
        id: "project-charters",
        label: "Project Charters",
        href: "/project-management/charters",
        requiredPermission: PERMISSIONS.PROJECT_READ,
      },
      {
        id: "risk-management",
        label: "Risk Management",
        href: "/project-management/risks",
        requiredPermission: PERMISSIONS.PROJECT_READ,
      },
      {
        id: "resource-management",
        label: "Resources",
        href: "/project-management/resources",
        requiredPermission: PERMISSIONS.PROJECT_READ,
      },
    ],
  },
  {
    id: "work-requests-standalone",
    label: "Work Requests",
    href: "/work-requests",
    icon: "📝",
    requiredPermission: PERMISSIONS.WORK_REQUEST_READ,
  },
  {
    id: "reporting",
    label: "Reporting",
    href: "/reporting",
    icon: "📈",
    requiredPermission: PERMISSIONS.REPORTING_VIEW,
    children: [
      {
        id: "dashboards",
        label: "Dashboards",
        href: "/dashboards",
        requiredPermission: PERMISSIONS.REPORTING_VIEW,
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/analytics",
        requiredPermission: PERMISSIONS.REPORTING_VIEW,
      },
    ],
  },
  {
    id: "data-management",
    label: "Data Management",
    href: "/data-management",
    icon: "🗄️",
    requiredPermission: PERMISSIONS.TENANT_UPDATE, // Assuming data management is a high-level permission
    children: [
      {
        id: "migration-workbench",
        label: "Migration Workbench",
        href: "/migration-workbench",
        requiredPermission: PERMISSIONS.TENANT_UPDATE,
      },
      {
        id: "file-upload",
        label: "File Upload",
        href: "/file-upload",
        requiredPermission: PERMISSIONS.TENANT_UPDATE,
      },
      {
        id: "data-validation",
        label: "Data Validation",
        href: "/data-validation",
        requiredPermission: PERMISSIONS.TENANT_UPDATE,
      },
    ],
  },
  {
    id: "benefits",
    label: "Benefits & HR",
    href: "/benefits",
    icon: "👥",
    requiredPermission: PERMISSIONS.USER_READ, // Assuming benefits viewing requires user read
    children: [
      {
        id: "employee-records",
        label: "Employee Records",
        href: "/employees",
        requiredPermission: PERMISSIONS.USER_READ,
      },
      {
        id: "payroll",
        label: "Payroll",
        href: "/payroll",
        requiredPermission: PERMISSIONS.TIMECARD_READ_ALL,
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    href: "/admin",
    icon: "⚙️",
    requiredPermission: PERMISSIONS.USER_READ, // General admin access requires user read
    children: [
      {
        id: "access-control",
        label: "Access Control",
        href: "/access-control",
        requiredPermission: PERMISSIONS.USER_READ,
      },
      {
        id: "user-management",
        label: "User Management",
        href: "/user-management",
        requiredPermission: PERMISSIONS.USER_READ,
      },
      {
        id: "tenant-management",
        label: "Tenant Management",
        href: "/tenant-management",
        requiredPermission: PERMISSIONS.TENANT_READ,
      },
      {
        id: "system-settings",
        label: "System Settings",
        href: "/system-settings",
        requiredPermission: PERMISSIONS.TENANT_UPDATE,
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        href: "/audit-logs",
        requiredPermission: PERMISSIONS.TENANT_READ,
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
  const { checkPermission, currentUserRole } = usePermissions();

  // Check if item should be visible based on requiredPermission
  const isVisible = () => {    if (item.requiredPermission && !checkPermission(item.feature, item.requiredPermission)) {
      return false;
    }
    return true;
  };

  if (!isVisible()) return null;

  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;

  // Filter visible children
  const visibleChildren =
    item.children?.filter((child) => {
     if (child.requiredPermission && !checkPermission(child.feature, child.requiredPermission)) {
        return false;
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
            {visibleChildren.map((child) => (
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
  const { loading: isLoading, currentUserRole } = usePermissions();

  if (isLoading) {
    return (
      <nav className={`space-y-1 ${className}`}>
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
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
            <span>Role: {currentUserRole}</span>
            {/* Admin/Host Admin badges can be derived from currentUserRole if needed */}
          </div>
        </div>
      )}

      {/* Navigation items */}
      {NAVIGATION_ITEMS.map((item) => (
        <NavigationItem key={item.id} item={item} isCollapsed={isCollapsed} />
      ))}
    </nav>
  );
}

// Breadcrumb component with permission checking
interface BreadcrumbItem {
  label: string;
  href?: string;
  requiredPermission?: string;
  feature?: string;
}

interface BreadcrumbRBACProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbRBAC({ items, className = "" }: BreadcrumbRBACProps) {
  const { checkPermission } = usePermissions();

  const isItemAccessible = (item: BreadcrumbItem) => {
    if (item.requiredPermission) {
      return checkPermission(item.requiredPermission);
    }
    return true;
  };

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
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
  requiredPermission: string;
  className?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "create-work-request",
    label: "New Work Request",
    href: "/work-requests/create",
    icon: "📝",
    requiredPermission: PERMISSIONS.WORK_REQUEST_CREATE,
    className: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    id: "create-project",
    label: "New Project",
    href: "/project-management/create",
    icon: "📋",
    requiredPermission: PERMISSIONS.PROJECT_CREATE,
    className: "bg-green-600 hover:bg-green-700 text-white",
  },
  {
    id: "upload-file",
    label: "Upload File",
    href: "/file-upload",
    icon: "📁",
    requiredPermission: PERMISSIONS.TENANT_UPDATE, // Assuming file upload is a high-level permission
    className: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

export function QuickActionsRBAC({ className = "" }: { className?: string }) {
  const { checkPermission } = usePermissions();

  const accessibleActions = QUICK_ACTIONS.filter((action) =>
    checkPermission(action.requiredPermission),
  );

  if (accessibleActions.length === 0) {
    return null;
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {accessibleActions.map((action) => (
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

export default NavigationRBAC;

