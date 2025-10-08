"use client";

/**
 * RBAC Implementation Test Suite (updated)
 *
 * This file provides test scenarios and validation for the RBAC implementation.
 * Run these tests manually or integrate with your preferred testing framework.
 */

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { FEATURES, PERMISSIONS } from "@/rbac/constants";
import {
  PermissionGuard,
  WorkRequestGuard,
  ProjectGuard,
  WorkRequestCreateButton,
  WorkRequestApproveButton,
} from "@/components/PermissionGuards";
import { RouteGuard } from "@/components/RouteGuard";

type PermissionsApi = ReturnType<typeof usePermissions>;

// Test scenarios for manual validation
export const RBAC_TEST_SCENARIOS = {
  // 1. Permission Checking Tests
  PERMISSION_CHECKING: {
    description: "Test basic permission checking functionality",
    scenarios: [
      {
        name: "User with view permissions",
        setup: "Login as user with WORK_REQUESTS.VIEW permission",
        expected:
          "checkPermission(FEATURES.WORK_REQUESTS, PERMISSIONS.VIEW) returns true",
        test: (p: PermissionsApi) =>
          p.checkPermission(FEATURES.WORK_REQUESTS, PERMISSIONS.VIEW),
      },
      {
        name: "User without create permissions",
        setup: "Login as user without WORK_REQUESTS.CREATE permission",
        expected:
          "checkPermission(FEATURES.WORK_REQUESTS, PERMISSIONS.CREATE) returns false",
        test: (p: PermissionsApi) =>
          !p.checkPermission(FEATURES.WORK_REQUESTS, PERMISSIONS.CREATE),
      },
      {
        name: "Host admin access (role-only sanity check)",
        setup: "Login as role that should behave like a host admin",
        expected:
          "currentUserRole indicates host-level admin; spot-check a few high-level permissions",
        test: (p: PermissionsApi) => {
          // We don’t assume a specific helper like isHostAdmin(); we just spot-check breadth.
          const canSeeAccess = p.canView(FEATURES.ACCESS_CONTROL as any);
          const canSeeTenants = p.canView(FEATURES.TENANT_MANAGEMENT as any);
          const canSeeProjects = p.canView(FEATURES.PROJECT_MANAGEMENT as any);
          return canSeeAccess && canSeeTenants && canSeeProjects;
        },
      },
    ],
  },

  // 2. Component Guard Tests
  COMPONENT_GUARDS: {
    description: "Test component permission guards",
    scenarios: [
      {
        name: "PermissionGuard shows content with permission",
        component: "PermissionGuard",
        expected: "Shows children when user has required permission",
      },
      {
        name: "PermissionGuard shows fallback without permission",
        component: "PermissionGuard",
        expected: "Shows fallback content when user lacks permission",
      },
      {
        name: "WorkRequestGuard respects work request permissions",
        component: "WorkRequestGuard",
        expected: "Shows content only if user can access work requests",
      },
    ],
  },

  // 3. Service Authorization Tests (descriptive)
  SERVICE_AUTHORIZATION: {
    description: "Test service-level permission enforcement",
    scenarios: [
      {
        name: "Service method checks permissions",
        setup: "Call pmbokRBAC.getWorkRequests() without VIEW permission",
        expected: "Method should throw/deny",
      },
      {
        name: "Service method succeeds with permission",
        setup: "Call pmbokRBAC.getWorkRequests() with VIEW permission",
        expected: "Method executes successfully",
      },
    ],
  },

  // 4. Role Hierarchy Tests (descriptive; compare by string)
  ROLE_HIERARCHY: {
    description: "Test role-based access hierarchy",
    scenarios: [
      {
        name: "Host admin breadth check",
        role: "host_admin",
        expected: "Can view most features (spot-check canView across features)",
      },
      {
        name: "Tenant admin limited to tenant",
        role: "tenant_admin",
        expected: "Can manage tenant-scoped features; not cross-tenant",
      },
      {
        name: "Project manager has project permissions",
        role: "project_manager",
        expected: "Can create/update in PROJECT_MANAGEMENT & WORK_REQUESTS",
      },
      {
        name: "User has only explicit permissions",
        role: "user",
        expected: "Only VIEW or explicit permissions where granted",
      },
    ],
  },
};

// Test component for manual validation
export const RBACTestComponent: React.FC = () => {
  const {
    checkPermission,
    canView,
    canManage,
    currentUserRole,
    loading,
  } = usePermissions();

  const roleString = String(currentUserRole ?? "");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">RBAC Test Dashboard</h1>

      {/* Permission Status */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Current User Permissions</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Role:</strong> {roleString || "None"}
          </div>
          <div>
            <strong>loading:</strong> {loading ? "Yes" : "No"}
          </div>
        </div>
      </div>

      {/* Feature Access Tests */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Feature Access Tests</h2>
        <div className="space-y-2 text-sm">
          {Object.values(FEATURES).map((feature) => (
            <div key={feature as string} className="flex justify-between">
              <span>{feature as string}:</span>
              <span
                className={
                  canView(feature as any) ? "text-green-600" : "text-red-600"
                }
              >
                {canView(feature as any) ? "✓ View Allowed" : "✗ View Denied"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-600">
          <em>Note:</em> Using <code>canView(feature)</code> for a simple signal.
          Use <code>canManage(feature)</code> where you expect create/update/delete.
        </div>
      </div>

      {/* Component Guard Tests */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Component Guard Tests</h2>

        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h3 className="font-medium mb-2">Work Request Guard Test</h3>
            <WorkRequestGuard
              fallback={
                <div className="text-red-600">
                  ❌ No access to work requests
                </div>
              }
            >
              <div className="text-green-600">
                ✅ Work request access granted
              </div>
            </WorkRequestGuard>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-medium mb-2">Project Guard Test</h3>
            <ProjectGuard
              fallback={
                <div className="text-red-600">❌ No access to projects</div>
              }
            >
              <div className="text-green-600">✅ Project access granted</div>
            </ProjectGuard>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-medium mb-2">Action Button Tests</h3>
            <div className="space-x-4">
              <WorkRequestCreateButton
                onClick={() => alert("Create clicked")}
                fallback={
                  <span className="text-gray-500">Create disabled</span>
                }
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Create Request
              </WorkRequestCreateButton>

              <WorkRequestApproveButton
                onClick={() => alert("Approve clicked")}
                fallback={
                  <span className="text-gray-500">Approve disabled</span>
                }
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Approve Request
              </WorkRequestApproveButton>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Details */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Explicit Checks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 border rounded">
            <div className="font-medium mb-1">Work Requests — VIEW</div>
            {checkPermission(FEATURES.WORK_REQUESTS as any, PERMISSIONS.VIEW)
              ? "✅ Allowed"
              : "❌ Denied"}
          </div>
          <div className="p-3 border rounded">
            <div className="font-medium mb-1">Work Requests — CREATE</div>
            {checkPermission(FEATURES.WORK_REQUESTS as any, PERMISSIONS.CREATE)
              ? "✅ Allowed"
              : "❌ Denied"}
          </div>
          <div className="p-3 border rounded">
            <div className="font-medium mb-1">Projects — UPDATE</div>
            {checkPermission(
              FEATURES.PROJECT_MANAGEMENT as any,
              PERMISSIONS.UPDATE,
            )
              ? "✅ Allowed"
              : "❌ Denied"}
          </div>
          <div className="p-3 border rounded">
            <div className="font-medium mb-1">Projects — DELETE</div>
            {checkPermission(
              FEATURES.PROJECT_MANAGEMENT as any,
              PERMISSIONS.DELETE,
            )
              ? "✅ Allowed"
              : "❌ Denied"}
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">
          Manual Testing Instructions
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            Login with different user roles (e.g., user, project_manager,
            tenant_admin, host_admin).
          </li>
          <li>Verify that components show/hide based on permissions.</li>
          <li>Test that action buttons are enabled/disabled appropriately.</li>
          <li>Check that service calls respect permission requirements.</li>
          <li>Confirm that navigation elements adapt to user permissions.</li>
        </ol>
      </div>
    </div>
  );
};

// Validation helpers for quick programmatic checks
export const validateRBACImplementation = {
  // Check if all required RBAC components are available
  checkComponents: () => {
    const results = {
      usePermissions: typeof usePermissions === "function",
      PermissionGuard: typeof PermissionGuard === "function",
      WorkRequestGuard: typeof WorkRequestGuard === "function",
      ProjectGuard: typeof ProjectGuard === "function",
      RouteGuard: typeof RouteGuard === "function",
    };

    const allPresent = Object.values(results).every(Boolean);
    return { allPresent, details: results };
  },

  // Check if permission constants are defined
  checkConstants: () => {
    const results = {
      FEATURES:
        typeof FEATURES === "object" && Object.keys(FEATURES).length > 0,
      PERMISSIONS:
        typeof PERMISSIONS === "object" && Object.keys(PERMISSIONS).length > 0,
    };

    const allPresent = Object.values(results).every(Boolean);
    return { allPresent, details: results };
  },

  // Run basic permission logic tests against the exposed API
  testPermissionLogic: (p: PermissionsApi) => {
    if (!p)
      return { success: false, error: "No permissions object provided" };

    try {
      const tests = {
        checkPermissionFunction: typeof p.checkPermission === "function",
        checkAnyPermissionFunction: typeof p.checkAnyPermission === "function",
        canViewFunction: typeof p.canView === "function",
        canManageFunction: typeof p.canManage === "function",
        currentUserRoleExists: p.currentUserRole !== undefined,
        loadingExists: typeof p.loading === "boolean",
      };

      const allPassed = Object.values(tests).every(Boolean);
      return { success: allPassed, details: tests };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
};

export default RBACTestComponent;
