"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { FEATURES, PERMISSIONS } from "@/rbac/constants";
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

  // ---- Permissions (hook) ----
  const {
    canManage,
    canView,
    currentUserRole,
    loading: permissionsloading, // ✅ correct key is 'loading'
  } = usePermissions();

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

  const [Loading, setIsloading] = useState(true); // ✅ keep this since we use setIsloading
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedWorkRequest, setSelectedWorkRequest] =
    useState<WorkRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Load data based on user permissions
  useEffect(() => {
    if (permissionsloading) return;

    const loadData = async () => {
      setIsloading(true);
      try {
        const dashboardData = await pmbokRBAC.getDashboardData();

        const [workRequests, projects, risks] = await Promise.all([
          canManage(FEATURES.WORK_REQUESTS)
            ? pmbokRBAC.getWorkRequests()
            : Promise.resolve([]),
          canManage(FEATURES.PROJECT_MANAGEMENT)
            ? pmbokRBAC.getProjects()
            : Promise.resolve([]),
          canManage(FEATURES.RISK_MANAGEMENT)
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
      } finally {
        setIsloading(false);
      }
    };

    loadData();
  }, [permissionsloading, canManage]);

  // Permission-based tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊", visible: true },
    {
      id: "work-requests",
      label: "Work Requests",
      icon: "📝",
      visible: canManage(FEATURES.WORK_REQUESTS),
      count: data.workRequests.length,
    },
    {
      id: "projects",
      label: "Projects",
      icon: "📋",
      visible: canManage(FEATURES.PROJECT_MANAGEMENT),
      count: data.projects.length,
    },
    {
      id: "risks",
      label: "Risks",
      icon: "⚠️",
      visible: canManage(FEATURES.RISK_MANAGEMENT),
      count: data.risks.length,
    },
  ].filter((tab: any) => tab.visible);

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    {
      label: "Project Management",
      feature: FEATURES.PROJECT_MANAGEMENT,
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
              {/* Title */}
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

                  {(currentUserRole === "host_admin" ||
                    currentUserRole === "tenant_admin") &&
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
                feature={FEATURES.DASHBOARDS}
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

              {/* Tabs */}
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
                  {/* Overview */}
                  {selectedTab === "overview" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Project Management Overview
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Work Requests
                          </p>
                          <PermissionStatus
                            feature={FEATURES.WORK_REQUESTS}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Project Management
                          </p>
                          <PermissionStatus
                            feature={FEATURES.PROJECT_MANAGEMENT}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Risk Management
                          </p>
                          <PermissionStatus
                            feature={FEATURES.RISK_MANAGEMENT}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Reporting
                          </p>
                          <PermissionStatus
                            feature={FEATURES.DASHBOARDS}
                            permission={PERMISSIONS.VIEW}
                          />
                        </div>
                      </div>

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

                  {/* Other tabs omitted for brevity – keep your existing
                      Work Requests / Projects / Risks sections unchanged */}
                  {selectedTab === "debug" &&
                    (currentUserRole === "host_admin" ||
                      currentUserRole === "tenant_admin") && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          RBAC Debug Information
                        </h3>
                        <PermissionDebugPanel />
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">
                            User Permissions Summary
                          </h4>
                          <pre className="text-xs text-gray-600 overflow-auto">
                            {JSON.stringify(debugPermissionsSummary, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <WorkRequestGuard fallback={null}>
                    <button
                      onClick={() => router.push("/work-requests")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      📝 All Work Requests
                    </button>
                  </WorkRequestGuard>

                  <ProjectGuard fallback={null}>
                    <button
                      onClick={() => router.push("/project-management/charters")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      📋 Project Charters
                    </button>
                  </ProjectGuard>

                  <RiskGuard fallback={null}>
                    <button
                      onClick={() => router.push("/project-management/risks")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      ⚠️ Risk Register
                    </button>
                  </RiskGuard>

                  <PermissionGuard
                    feature={FEATURES.DASHBOARDS}
                    permission={PERMISSIONS.VIEW}
                    fallback={null}
                  >
                    <button
                      onClick={() => router.push("/reporting")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      📊 Reports
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedWorkRequest && (
          <WorkRequestApproveButton onClick={() => {}} fallback={null}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Approve Work Request
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to approve "{selectedWorkRequest.title}"?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedWorkRequest(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await pmbokRBAC.approveWorkRequest(
                        selectedWorkRequest.id,
                        "current-user"
                      );
                      setShowApprovalModal(false);
                      setSelectedWorkRequest(null);
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </WorkRequestApproveButton>
        )}
      </div>
    </RouteGuard>
  );
}
