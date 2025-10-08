"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ Import from single RBAC source
import {
  usePermissions,
  FEATURES,
  PERMISSIONS,
  ROLES,
  type Feature,
} from "@/hooks/usePermissions";

import { pmbokRBAC } from "@/services/pmbok_service_rbac";
import {
  PermissionGuard,
  WorkRequestGuard,
  ProjectGuard,
  RiskGuard,
  WorkRequestCreateButton,
  WorkRequestApproveButton,
  ProjectCreateButton,
  ReportExportButton,
  NoAccessFallback,
  PermissionStatus,
  PermissionDebugPanel,
} from "@/components/PermissionGuards";
import { RouteGuard } from "@/components/RouteGuard";
import { BreadcrumbRBAC, QuickActionsRBAC } from "@/components/NavigationRBAC";
import type { WorkRequest, ProjectCharter, Risk } from "@/types";

interface DashboardData {
  workRequests: WorkRequest[];
  projects: ProjectCharter[];
  risks: Risk[];
  stats: {
    workRequests: {
      total: number;
      pending: number;
      approved: number;
      declined: number;
    };
    projects: { total: number; active: number; completed: number };
    risks: { total: number; high: number; medium: number; low: number };
  };
}

export default function ProjectManagementPageRBAC() {
  const router = useRouter();

  // ---- Permissions (new hook shape) ----
  const {
    canManage,
    canView,
    currentUserRole,
    loading: permissionsloading,
  } = usePermissions();

  // Narrow feature constants to the Feature type (fixes "string not assignable to Feature")
  const F_DASHBOARDS = FEATURES.DASHBOARDS as Feature;
  const F_WORK_REQUESTS = FEATURES.WORK_REQUESTS as Feature;
  const F_PROJECT_MANAGEMENT = FEATURES.PROJECT_MANAGEMENT as Feature;
  const F_RISK_MANAGEMENT = FEATURES.RISK_MANAGEMENT as Feature;

  // Build a lightweight, safe-to-render permissions snapshot
  const debugPermissionsSummary = (() => {
    const featureKeys = FEATURES ? Object.keys(FEATURES) : [];
    const permissionKeys = PERMISSIONS ? Object.keys(PERMISSIONS) : [];
    return {
      features_viewable: featureKeys.filter((k) => {
        const key = (FEATURES as any)[k] ?? k;
        try {
          return canView?.(key) === true;
        } catch {
          return false;
        }
      }),
      permissions_manageable: permissionKeys.filter((k) => {
        const key = (PERMISSIONS as any)[k] ?? k;
        try {
          return canManage?.(key) === true;
        } catch {
          return false;
        }
      }),
    };
  })();

  const [data, setData] = useState<DashboardData>({
    workRequests: [],
    projects: [],
    risks: [],
    stats: {
      workRequests: { total: 0, pending: 0, approved: 0, declined: 0 },
      projects: { total: 0, active: 0, completed: 0 },
      risks: { total: 0, high: 0, medium: 0, low: 0 },
    },
  });

  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedWorkRequest, setSelectedWorkRequest] =
    useState<WorkRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Load data based on user permissions
  useEffect(() => {
    if (permissionsloading) return;

    const loadData = async () => {
      try {
        const dashboardData = await pmbokRBAC.getDashboardData();

        const [workRequests, projects, risks] = await Promise.all([
          canManage(F_WORK_REQUESTS)
            ? pmbokRBAC.getWorkRequests()
            : Promise.resolve([]),
          canManage(F_PROJECT_MANAGEMENT)
            ? pmbokRBAC.getProjects()
            : Promise.resolve([]),
          canManage(F_RISK_MANAGEMENT)
            ? pmbokRBAC.getRisks()
            : Promise.resolve([]),
        ]);

        setData({
          workRequests,
          projects,
          risks,
          stats: dashboardData,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadData();
  }, [permissionsloading, canManage, F_WORK_REQUESTS, F_PROJECT_MANAGEMENT, F_RISK_MANAGEMENT]);

  // Permission-based tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊", visible: true },
    {
      id: "work-requests",
      label: "Work Requests",
      icon: "📝",
      visible: canManage(F_WORK_REQUESTS),
      count: data.workRequests.length,
    },
    {
      id: "projects",
      label: "Projects",
      icon: "📋",
      visible: canManage(F_PROJECT_MANAGEMENT),
      count: data.projects.length,
    },
    {
      id: "risks",
      label: "Risks",
      icon: "⚠️",
      visible: canManage(F_RISK_MANAGEMENT),
      count: data.risks.length,
    },
  ].filter((tab: any) => tab.visible);

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    {
      label: "Project Management",
      feature: F_PROJECT_MANAGEMENT,
      permission: PERMISSIONS.VIEW,
    },
  ];

  if (permissionsloading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header with breadcrumbs and quick actions */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <BreadcrumbRBAC items={breadcrumbItems} />
              </div>
              <div className="flex items-center space-x-4">
                <QuickActionsRBAC />
                <ReportExportButton
                  onClick={() => console.log("Exporting report...")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                  fallback={null}
                >
                  📊 Export Report
                </ReportExportButton>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Main content */}
            <div className="flex-1">
              {/* Page title with role-based information */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Project Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Manage your projects, work requests, and risks
                      {currentUserRole && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {currentUserRole}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Admin-only debug panel toggle */}
                  {(currentUserRole === ROLES.HOST_ADMIN ||
                    currentUserRole === ROLES.CLIENT_ADMIN) &&
                    process.env.NODE_ENV !== "production" && (
                      <button
                        onClick={() => setSelectedTab("debug")}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        🔧 Debug
                      </button>
                    )}
                </div>
              </div>

              {/* Permission-based stats overview */}
              <PermissionGuard
                feature={F_DASHBOARDS}
                permission={PERMISSIONS.VIEW}
                fallback={
                  <NoAccessFallback
                    message="Dashboard view requires reporting permissions."
                    className="mb-8"
                  />
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <WorkRequestGuard fallback={null}>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">📝</div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Work Requests
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {data.stats.workRequests.total}
                          </p>
                          <p className="text-sm text-gray-500">
                            {data.stats.workRequests.pending} pending approval
                          </p>
                        </div>
                      </div>
                    </div>
                  </WorkRequestGuard>

                  <ProjectGuard fallback={null}>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">📋</div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Projects
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {data.stats.projects.total}
                          </p>
                          <p className="text-sm text-gray-500">
                            {data.stats.projects.active} active
                          </p>
                        </div>
                      </div>
                    </div>
                  </ProjectGuard>

                  <RiskGuard fallback={null}>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">⚠️</div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Risks
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {data.stats.risks.total}
                          </p>
                          <p className="text-sm text-gray-500">
                            {data.stats.risks.high} high priority
                          </p>
                        </div>
                      </div>
                    </div>
                  </RiskGuard>
                </div>
              </PermissionGuard>

              {/* Permission-based tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map((tab: any) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                          selectedTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                        {tab.count !== undefined && (
                          <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {selectedTab === "overview" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Project Management Overview
                      </h3>

                      {/* Permission status indicators */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Work Requests
                          </p>
                          <PermissionStatus
                            feature={F_WORK_REQUESTS}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Project Management
                          </p>
                          <PermissionStatus
                            feature={F_PROJECT_MANAGEMENT}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Risk Management
                          </p>
                          <PermissionStatus
                            feature={F_RISK_MANAGEMENT}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Reporting
                          </p>
                          <PermissionStatus
                            feature={F_DASHBOARDS}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                      </div>

                      {/* Recent activity with permission filtering */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">
                          Recent Activity
                        </h4>
                        <div className="space-y-3">
                          <WorkRequestGuard fallback={null}>
                            {data.workRequests.slice(0, 3).map((request: any) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                              >
                                <div>
                                  <p className="font-medium">{request.title}</p>
                                  <p className="text-sm text-gray-600">
                                    Work Request • {request.status}
                                  </p>
                                </div>
                                <WorkRequestApproveButton
                                  onClick={() => {
                                    setSelectedWorkRequest(request);
                                    setShowApprovalModal(true);
                                  }}
                                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                                  fallback={
                                    <span className="text-sm text-gray-500">
                                      View Only
                                    </span>
                                  }
                                >
                                  Review
                                </WorkRequestApproveButton>
                              </div>
                            ))}
                          </WorkRequestGuard>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Work Requests Tab */}
                  {selectedTab === "work-requests" && (
                    <WorkRequestGuard
                      fallback={
                        <NoAccessFallback message="You don't have permission to view work requests." />
                      }
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            Work Requests
                          </h3>
                          <WorkRequestCreateButton
                            onClick={() => router.push("/work-requests/create")}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            fallback={null}
                          >
                            + New Work Request
                          </WorkRequestCreateButton>
                        </div>

                        {data.workRequests.length === 0 ? (
                          <p className="text-gray-600">No work requests found.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                  </th>
                                  <th className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {data.workRequests.map((request: any) => (
                                  <tr key={request.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {request.title}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {request.description}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          request.status === "approved"
                                            ? "bg-green-100 text-green-800"
                                            : request.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {request.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {request.priority}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() =>
                                            router.push(`/work-requests/${request.id}`)
                                          }
                                          className="text-blue-600 hover:text-blue-900"
                                        >
                                          View
                                        </button>
                                        <WorkRequestApproveButton
                                          onClick={() => {
                                            setSelectedWorkRequest(request);
                                            setShowApprovalModal(true);
                                          }}
                                          className="text-green-600 hover:text-green-900"
                                          fallback={null}
                                        >
                                          Approve
                                        </WorkRequestApproveButton>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </WorkRequestGuard>
                  )}

                  {/* Projects Tab */}
                  {selectedTab === "projects" && (
                    <ProjectGuard
                      fallback={
                        <NoAccessFallback message="You don't have permission to view projects." />
                      }
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            Projects
                          </h3>
                          <ProjectCreateButton
                            onClick={() => router.push("/project-management/create")}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            fallback={null}
                          >
                            + New Project
                          </ProjectCreateButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {data.projects.map((project: any) => (
                            <div
                              key={project.id}
                              className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {project.title}
                                </h4>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    project.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : project.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {project.status}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-4">
                                {project.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {project.assigned_to}
                                </span>
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/project-management/charters/${project.id}`
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ProjectGuard>
                  )}

                  {/* Risks Tab */}
                  {selectedTab === "risks" && (
                    <RiskGuard
                      fallback={
                        <NoAccessFallback message="You don't have permission to view risks." />
                      }
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
