"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface ProjectCharter {
  id: string;
  tenant_id: string;
  title?: string;
  project_name?: string;
  project_title?: string;
  project_code?: string;
  description?: string;
  priority?: string;
  project_type?: string;
  project_category?: string;
  start_date?: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  budget?: number;
  estimated_budget?: number;
  actual_budget?: number;
  budget_variance?: number;
  assigned_team_lead?: string;
  team_lead?: string;
  project_manager?: string;
  manager?: string;
  sponsor?: string;
  resource_requirements?: string;
  project_scope?: string;
  success_criteria?: string;
  stakeholders?: any[];
  risk_assessment?: string;
  quality_metrics?: string;
  communication_plan?: string;
  milestone_schedule?: any[];
  deliverables?: any[];
  constraints?: string;
  assumptions?: string;
  business_case?: string;
  charter_status?: string;
  completion_percentage?: number;
  schedule_variance?: number;
  approved_by?: string;
  approved_at?: string;
  department?: string;
  division?: string;
  cost_center?: string;
  work_request_id?: string;
  customer_id?: string;
  external_project_id?: string;
  contract_number?: string;
  billing_type?: string;
  created_at: string;
  updated_at?: string;
}

interface WorkRequest {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  tenant_id: string;
  created_at: string;
  updated_at?: string;
}

interface Risk {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  tenant_id: string;
  created_at: string;
  updated_at?: string;
}

interface DashboardData {
  workRequests: any[];
  projects: any[];
  risks: any[];
  stats: {
    workRequests: { total: number; pending: number; approved: number; declined: number };
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

  type FeatureKey = keyof typeof FEATURES;
  type FeatureValue = (typeof FEATURES)[FeatureKey];
  type FeatureArg = FeatureKey | FeatureValue;

  // runtime type guard for keys
  const isFeatureKey = (f: FeatureArg): f is FeatureKey =>
    Object.prototype.hasOwnProperty.call(FEATURES, f as any);

  // always return the slug/value used in permission strings
  const featureSlug = (f: FeatureArg): FeatureValue => {
    if (isFeatureKey(f)) {
      // Convert FeatureKey to FeatureValue (e.g., 'MIGRATION_WORKBENCH' to 'migration-workbench')
      return FEATURES[f];
    }
    // If it's already a FeatureValue, return it as is
    return f as FeatureValue;
  };

  const canView = (feature: FeatureArg) =>
    checkPermission(`${featureSlug(feature)}:${PERMISSIONS.VIEW}`);

  const canManage = (feature: FeatureArg) =>
    checkAnyPermission(featureSlug(feature), [
      PERMISSIONS.CREATE,
      PERMISSIONS.EDIT,
      PERMISSIONS.DELETE,
      PERMISSIONS.APPROVE,
    ]);

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

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedWorkRequest, setSelectedWorkRequest] =
    useState<WorkRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Load data based on user permissions
  useEffect(() => {
    if (permissionsLoading) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const dashboardData = await pmbokRBAC.getDashboardData();

        // Load detailed data only if user has permissions
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

        setData((prevData) => ({
          ...prevData,
          workRequests,
          projects,
          risks,
          stats: dashboardData.stats,
        }));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [permissionsLoading, canManage]);

  // Permission-based tab configuration
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "📊",
      visible: true,
    },
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

                {/* Permission-based export button */}
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

              {/* Permission-based tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map((tab: any) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`
                          flex items-center py-4 px-1 border-b-2 font-medium text-sm
                          ${
                            selectedTab === tab.id
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }
                        `}
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
                            feature={FEATURES.REPORTING}
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
                            {data.workRequests
                              .slice(0, 3)
                              .map((request: any) => (
                                <div
                                  key={request.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {request.title}
                                    </p>
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
                      fallback={<NoAccessFallback message="You do not have permission to view work requests." />}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Work Requests</h3>
                          <WorkRequestCreateButton
                            onClick={() => console.log("Create new work request")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                          >
                            New Request
                          </WorkRequestCreateButton>
                        </div>
                        <div className="space-y-4">
                          {data.workRequests.map((request: any) => (
                            <div key={request.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{request.title}</p>
                                <p className="text-sm text-gray-500">{request.status}</p>
                              </div>
                              <WorkRequestApproveButton
                                onClick={() => {
                                  setSelectedWorkRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                className="text-sm bg-green-600 text-white px-3 py-1 rounded"
                                fallback={null}
                              >
                                Approve
                              </WorkRequestApproveButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    </WorkRequestGuard>
                  )}

                  {/* Projects Tab */}
                  {selectedTab === "projects" && (
                    <ProjectGuard
                      fallback={<NoAccessFallback message="You do not have permission to view projects." />}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Projects</h3>
                          <ProjectCreateButton
                            onClick={() => console.log("Create new project")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                          >
                            New Project
                          </ProjectCreateButton>
                        </div>
                        <div className="space-y-4">
                          {data.projects.map((project: any) => (
                            <div key={project.id} className="bg-white p-4 rounded-lg shadow">
                              <p className="font-semibold">{project.title}</p>
                              <p className="text-sm text-gray-500">{project.status}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ProjectGuard>
                  )}

                  {/* Risks Tab */}
                  {selectedTab === "risks" && (
                    <RiskGuard
                      fallback={<NoAccessFallback message="You do not have permission to view risks." />}
                    >
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Risks</h3>
                        <div className="space-y-4">
                          {data.risks.map((risk: any) => (
                            <div key={risk.id} className="bg-white p-4 rounded-lg shadow">
                              <p className="font-semibold">{risk.title}</p>
                              <p className="text-sm text-gray-500">{risk.status}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </RiskGuard>
                  )}

                  {/* Debug Tab (for admins) */}
                  {selectedTab === "debug" && (
                    <PermissionGuard
                      role={[ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN]}
                      fallback={<NoAccessFallback message="Access denied." />}
                    >
                      <PermissionDebugPanel />
                    </PermissionGuard>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedWorkRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Review Work Request</h2>
              <p className="mb-2"><span className="font-semibold">Title:</span> {selectedWorkRequest.title}</p>
              <p className="mb-4"><span className="font-semibold">Description:</span> {selectedWorkRequest.description}</p>
              
              <div className="flex justify-end space-x-4">
                <WorkRequestApproveButton
                  action="approve"
                  workRequest={selectedWorkRequest}
                  onApproved={() => {
                    console.log("Approved");
                    setShowApprovalModal(false);
                    // Optionally reload data
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Approve
                </WorkRequestApproveButton>
                <WorkRequestApproveButton
                  action="decline"
                  workRequest={selectedWorkRequest}
                  onDeclined={() => {
                    console.log("Declined");
                    setShowApprovalModal(false);
                    // Optionally reload data
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Decline
                </WorkRequestApproveButton>
                <button 
                  onClick={() => setShowApprovalModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
'''
