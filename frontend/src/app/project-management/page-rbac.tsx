'use client';


'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "hooks/usePermissions";
import { FEATURES, PERMISSIONS, ROLES, type Feature } from "rbac/constants";
import { pmbokRBAC } from "services/pmbok_service_rbac";
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
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
} from "../../components/PermissionGuards";
import { RouteGuard } from "../../components/RouteGuard";
import RoleGuard from "../../components/auth/RoleGuard";
import { BreadcrumbRBAC, QuickActionsRBAC } from "../../components/NavigationRBAC";

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

  const { user } = useAuth();
  const { selectedTenant } = useTenant();
  const { currentUserRole: effectiveUserRole } = usePermissions();

  // Safely derive a role the UI can display:
  const currentUserRole = effectiveUserRole ?? tenantUser?.role ?? 'GUEST';

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
      icon: "ðŸ“Š",
      visible: true,
    },
    {
      id: "work-requests",
      label: "Work Requests",
      icon: "ðŸ“",
      visible: canManage(FEATURES.WORK_REQUESTS),
      count: data.workRequests.length,
    },
    {
      id: "projects",
      label: "Projects",
      icon: "ðŸ“‹",
      visible: canManage(FEATURES.PROJECT_MANAGEMENT),
      count: data.projects.length,
    },
    {
      id: "risks",
      label: "Risks",
      icon: "âš ï¸",
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
                  ðŸ“Š Export Report
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
                        ðŸ”§ Debug
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
                        <div className="text-3xl mr-4">ðŸ“</div>
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
                        <div className="text-3xl mr-4">ðŸ“‹</div>
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
                        <div className="text-3xl mr-4">âš ï¸</div>
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
                        <div className="space-y-4">
                          {data.workRequests.slice(0, 2).map((wr) => (
                            <WorkRequestGuard key={wr.id} fallback={null}>
                              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-800_BAD_CHAR_">{wr.title}</p>
                                  <p className="text-sm text-gray-500_BAD_CHAR_">New work request submitted</p>
                                </div>
                                <span className="text-xs text-gray-400_BAD_CHAR_">{new Date(wr.created_at).toLocaleDateString()}</span>
                              </div>
                            </WorkRequestGuard>
                          ))}
                          {data.projects.slice(0, 2).map((p) => (
                            <ProjectGuard key={p.id} fallback={null}>
                              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-800_BAD_CHAR_">{p.project_title}</p>
                                  <p className="text-sm text-gray-500_BAD_CHAR_">Project status updated</p>
                                </div>
                                <span className="text-xs text-gray-400_BAD_CHAR_">{new Date(p.updated_at).toLocaleDateString()}</span>
                              </div>
                            </ProjectGuard>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Work Requests Tab */}
                  {selectedTab === "work-requests" && (
                    <WorkRequestGuard
                      fallback={<NoAccessFallback message="You do not have permission to manage work requests." />}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Work Requests
                          </h3>
                          <WorkRequestCreateButton
                            onClick={() => console.log("Create new work request")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                          >
                            + New Request
                          </WorkRequestCreateButton>
                        </div>
                        <div className="bg-white border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {data.workRequests.map((wr) => (
                                <tr key={wr.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wr.title}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wr.status}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wr.priority}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(wr.created_at).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        type="button"
                                        className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium"
                                        onClick={() => {
                                          setSelectedWorkRequest(wr);
                                          setShowApprovalModal(true);
                                        }}
                                      >
                                        Approve
                                      </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </WorkRequestGuard>
                  )}

                  {/* Projects Tab */}
                  {selectedTab === "projects" && (
                    <ProjectGuard
                      fallback={<NoAccessFallback message="You do not have permission to manage projects." />}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Projects</h3>
                          <ProjectCreateButton
                            onClick={() => console.log("Create new project")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                          >
                            + New Project
                          </ProjectCreateButton>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {data.projects.map((p) => (
                            <div key={p.id} className="bg-white border rounded-lg shadow-sm p-6">
                              <h4 className="font-bold text-lg text-gray-800">{p.project_title}</h4>
                              <p className="text-sm text-gray-600 mt-2">{p.description}</p>
                              <div className="mt-4 flex justify-between items-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${p.charter_status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {p.charter_status}
                                </span>
                                <span className="text-sm text-gray-500">{p.completion_percentage}% complete</span>
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
                      fallback={<NoAccessFallback message="You do not have permission to manage risks." />}
                    >
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Risks</h3>
                        <ul className="space-y-4">
                          {data.risks.map((r) => (
                            <li key={r.id} className="p-4 bg-white border rounded-lg flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-800">{r.title}</p>
                                <p className="text-sm text-gray-600">{r.description}</p>
                              </div>
                              <span className="text-sm font-semibold text-red-600">{r.status}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </RiskGuard>
                  )}

                  {/* Debug Tab (for admins) */}
                  {selectedTab === "debug" && (
                    <RoleGuard
                      allow={[ROLES.HOST_ADMIN, ROLES.CLIENT_ADMIN]}
                      fallback={<NoAccessFallback message="Debug panel is for admins only." />}
                    >
                      <PermissionDebugPanel />
                    </RoleGuard>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedWorkRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
              <h3 className="text-xl font-bold mb-4">Approve Work Request</h3>
              <p className="mb-2"><span className="font-semibold">Title:</span> {selectedWorkRequest.title}</p>
              <p className="mb-4"><span className="font-semibold">Description:</span> {selectedWorkRequest.description}</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log(`Approving ${selectedWorkRequest.id}`);
                    setShowApprovalModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}







