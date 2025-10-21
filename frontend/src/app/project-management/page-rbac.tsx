"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { FEATURES, PERMISSIONS, ROLES, type Feature } from "@/rbac/constants";
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
    checkPermission,
    checkAnyPermission,
    currentUserRole: currentRole,
    loading: permissionsLoading,
  } = usePermissions();

  // Derive the legacy helpers used by this page from the new API
  const canView = (feature: Feature) =>
    checkPermission(`${feature}:${PERMISSIONS.VIEW}`);

  const canManage = (feature: Feature) =>
    checkAnyPermission(feature, [
      PERMISSIONS.CREATE,
      PERMISSIONS.UPDATE,
      PERMISSIONS.DELETE,
      PERMISSIONS.APPROVE,
    ]);

  // Narrow constants to Feature to satisfy <PermissionGuard feature={...}>
  const F_DASHBOARDS = FEATURES.ACCESS_CONTROL as Feature; // Assuming DASHBOARDS maps to ACCESS_CONTROL for now
  const F_WORK_REQUESTS = FEATURES.WORK_REQUESTS as Feature;
  const F_PROJECT_MANAGEMENT = FEATURES.PROJECT_MANAGEMENT as Feature;
  const F_RISK_MANAGEMENT = FEATURES.RISK_MANAGEMENT as Feature;

  // Debug snapshot (safe to render)
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
    if (permissionsLoading) return;

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
  }, [
    permissionsLoading,
    canManage,
    F_WORK_REQUESTS,
    F_PROJECT_MANAGEMENT,
    F_RISK_MANAGEMENT,
  ]);

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

  if (permissionsLoading) {
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
                      {currentRole && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {currentRole}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Admin-only debug panel toggle */}
                  {(currentRole === ROLES.HOST_ADMIN ||
                    currentRole === ROLES.CLIENT_ADMIN) &&
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

              {/* Tabs for different sections */}
              <div className="bg-white rounded-lg shadow">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {tabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.icon} {tab.label}
                        {tab.count !== undefined && (
                          <Badge className="ml-2" variant="secondary">
                            {tab.count}
                          </Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Overview
                      </h3>
                      <p className="text-gray-600">
                        Welcome to your Project Management Dashboard. Here you
                        can get a quick glance at your work requests,
                        projects, and risks.
                      </p>
                      <PermissionStatus feature="project_management" />
                    </div>
                  </TabsContent>

                  {/* Work Requests Tab */}
                  <TabsContent value="work-requests" className="p-6">
                    <WorkRequestGuard
                      fallback={
                        <NoAccessFallback message="You do not have permission to view work requests." />
                      }
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Work Requests
                          </h3>
                          <WorkRequestCreateButton
                            onClick={() => console.log("Create Work Request")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            fallback={null}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Create Work
                            Request
                          </WorkRequestCreateButton>
                        </div>
                        {data.workRequests.length > 0 ? (
                          <ul className="divide-y divide-gray-200">
                            {data.workRequests.map((wr) => (
                              <li key={wr.id} className="py-4 flex items-center">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {wr.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Status: {wr.status}
                                  </p>
                                </div>
                                <WorkRequestApproveButton
                                  workRequest={wr}
                                  onClick={() => {
                                    setSelectedWorkRequest(wr);
                                    setShowApprovalModal(true);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                                  fallback={null}
                                >
                                  Approve
                                </WorkRequestApproveButton>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No work requests found.</p>
                        )}
                      </div>
                    </WorkRequestGuard>
                  </TabsContent>

                  {/* Projects Tab */}
                  <TabsContent value="projects" className="p-6">
                    <ProjectGuard
                      fallback={
                        <NoAccessFallback message="You do not have permission to view projects." />
                      }
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Projects
                          </h3>
                          <ProjectCreateButton
                            onClick={() => console.log("Create Project")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            fallback={null}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Create Project
                          </ProjectCreateButton>
                        </div>
                        {data.projects.length > 0 ? (
                          <ul className="divide-y divide-gray-200">
                            {data.projects.map((project) => (
                              <li
                                key={project.id}
                                className="py-4 flex items-center"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {project.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Status: {project.status}
                                  </p>
                                </div>
                                {/* Add project specific actions here */}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No projects found.</p>
                        )}
                      </div>
                    </ProjectGuard>
                  </TabsContent>

                  {/* Risks Tab */}
                  <TabsContent value="risks" className="p-6">
                    <RiskGuard
                      fallback={
                        <NoAccessFallback message="You do not have permission to view risks." />
                      }
                    >
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          Risks
                        </h3>
                        <p className="text-gray-600">
                          Manage and mitigate project risks.
                        </p>
                        {data.risks.length > 0 ? (
                          <ul className="divide-y divide-gray-200">
                            {data.risks.map((risk) => (
                              <li
                                key={risk.id}
                                className="py-4 flex items-center"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {risk.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Severity: {risk.severity}
                                  </p>
                                </div>
                                {/* Add risk specific actions here */}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No risks found.</p>
                        )}
                      </div>
                    </RiskGuard>
                  </TabsContent>

                  {/* Debug Tab (Admin Only) */}
                  <TabsContent value="debug" className="p-6">
                    {(currentRole === ROLES.HOST_ADMIN ||
                      currentRole === ROLES.CLIENT_ADMIN) &&
                    process.env.NODE_ENV !== "production" ? (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          RBAC Debug Panel
                        </h3>
                        <PermissionDebugPanel />
                      </div>
                    ) : (
                      <NoAccessFallback message="You do not have permission to view the debug panel." />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

