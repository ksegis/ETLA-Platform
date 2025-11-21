"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger as BaseSelectTrigger } from "@/components/ui/select";
import type {
  ComponentProps,
  ForwardRefExoticComponent,
  HTMLAttributes,
} from "react";

// widen props just for this file
type TriggerProps = ComponentProps<typeof BaseSelectTrigger> &
  HTMLAttributes<HTMLButtonElement>;

const SelectTrigger = BaseSelectTrigger as unknown as
  ForwardRefExoticComponent<TriggerProps>;
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Building,
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { Tenant, User, TenantTemplate, TenantTier } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FEATURES, PERMISSIONS } from "@/hooks/usePermissions";
import { TenantHierarchyService } from "@/services/tenant_hierarchy_service";
import { TenantHierarchyTree } from "@/components/tenant/TenantHierarchyTree";

interface ExtendedTenant extends Tenant {
  code?: string;
  tenant_type?: string;
  contact_email?: string;
  is_active?: boolean;
  tenant_level?: number;
  max_projects?: number;
  feature_flags?: Record<string, any>;
  usage_quotas?: Record<string, any>;
  rbac_settings?: Record<string, any>;
}

interface TenantUser {
  id: string;
  user_id: string;
  tenant_id: string;
  role: string;
  is_active: boolean;
  email?: string;
  created_at: string;
}

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
}

export default function TenantManagementPage() {
  const { user, tenantUser, isAuthenticated } = useAuth();
  const { checkPermission, loading: permissionsloading } = usePermissions();
  const [tenants, setTenants] = useState<ExtendedTenant[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [loading, setloading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [creationType, setCreationType] = useState<'primary' | 'sub'>('primary');
  const [hierarchyExpanded, setHierarchyExpanded] = useState(false);
  // Phase 2: Hierarchy state
  const [templates, setTemplates] = useState<TenantTemplate[]>([]);
  const [parentTenants, setParentTenants] = useState<ExtendedTenant[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [newTenant, setNewTenant] = useState({
    name: "",
    code: "",
    tenant_type: "",
    contact_email: "",
    parent_tenant_id: undefined as string | undefined,
    tenant_tier: 2 as TenantTier, // Default to Primary Customer
    template_id: "",
  });
  // RBAC v2 API requires (feature, permission)
  const hasAdminAccess = checkPermission(FEATURES.TENANT_MANAGEMENT, PERMISSIONS.TENANT_READ);

  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated && hasAdminAccess) {
        try {
          await Promise.all([
            loadTenants(),
            loadTemplates(),
            loadParentTenants(),
            loadAllUsers()
          ]);
        } catch (error) {
          console.error('Error loading initial data:', error);
        } finally {
          setloading(false);
        }
      } else {
        setloading(false);
      }
    };
    
    loadInitialData();
  }, [isAuthenticated, hasAdminAccess]);

  useEffect(() => {
    if (selectedTenantId) {
      loadTenantUsers(selectedTenantId);
    }
  }, [selectedTenantId]);

  const loadTenants = async () => {
    try {
      console.log("Attempting to load tenants...");
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error loading tenants:", error);
        throw error;
      }
      setTenants(data || []);
      console.log("Tenants loaded successfully:", data);
    } catch (error) {
      console.error("Caught error loading tenants:", error);
    }
  };

  // Load all users from tenant_users_with_email view (gets unique users)
  const loadAllUsers = async () => {
    try {
      console.log("Attempting to load all users...");
      const { data, error } = await supabase
        .from("tenant_users_with_email")
        .select("user_id, email, full_name")
        .order("email");

      if (error) {
        console.error("Error loading all users:", error);
        throw error;
      }
      
      // Get unique users by user_id
      const uniqueUsers = Array.from(
        new Map(data?.map((u: any) => [u.user_id, { id: u.user_id, email: u.email, full_name: u.full_name }]) || []).values()
      );
      
      setAllUsers(uniqueUsers as AuthUser[]);
      console.log("All users loaded successfully:", uniqueUsers);
    } catch (error) {
      console.error("Caught error loading all users:", error);
    }
  };

  // Phase 2: Load tenant templates
  const loadTemplates = async () => {
    try {
      const templates = await TenantHierarchyService.getTenantTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  // Phase 2: Load available parent tenants
  const loadParentTenants = async () => {
    try {
      const parents = await TenantHierarchyService.getAvailableParentTenants();
      setParentTenants(parents as ExtendedTenant[]);
    } catch (error) {
      console.error("Error loading parent tenants:", error);
    }
  };

  const loadTenantUsers = async (tenantId: string) => {
    try {
      setloading(true);
      const { data, error } = await supabase
        .from("tenant_users_with_email")
        .select(
          `
          id,
          user_id,
          tenant_id,
          role,
          is_active,
          created_at,
          email,
          full_name
        `,
        )
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error("Error loading tenant users:", error);
    } finally {
      setloading(false);
    }
  };

  const addUserToTenant = async (userId: string, role: string) => {
    if (!selectedTenantId) return;

    try {
      const { error } = await supabase.from("tenant_users").insert({
        user_id: userId,
        tenant_id: selectedTenantId,
        role: role,
        is_active: true,
      });

      if (error) throw error;

      setShowAddUserModal(false);
      loadTenantUsers(selectedTenantId);
    } catch (error) {
      console.error("Error adding user to tenant:", error);
    }
  };

  const removeUserFromTenant = async (tenantUserId: string) => {
    try {
      const { error } = await supabase
        .from("tenant_users")
        .update({ is_active: false })
        .eq("id", tenantUserId);

      if (error) throw error;

      if (selectedTenantId) {
        loadTenantUsers(selectedTenantId);
      }
    } catch (error) {
      console.error("Error removing user from tenant:", error);
    }
  };

  const updateUserRole = async (tenantUserId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("tenant_users")
        .update({ role: newRole })
        .eq("id", tenantUserId);

      if (error) throw error;

      if (selectedTenantId) {
        loadTenantUsers(selectedTenantId);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const createTenant = async (tenantData: {
    name: string;
    code: string;
    tenant_type: string;
    contact_email: string;
    parent_tenant_id?: string;
    tenant_tier?: TenantTier;
    template_id?: string;
  }) => {
    console.log("=== CREATE TENANT DEBUG START ====");
    console.log("Input tenantData:", tenantData);

    try {
      // Phase 2: Use template if selected
      if (tenantData.template_id) {
        console.log("Creating tenant from template:", tenantData.template_id);
        const newTenant = await TenantHierarchyService.createTenantFromTemplate(
          tenantData.template_id,
          {
            name: tenantData.name,
            code: tenantData.code,
            parent_tenant_id: tenantData.parent_tenant_id,
            contact_email: tenantData.contact_email
          }
        );
        console.log("Tenant created from template:", newTenant);
        setShowCreateTenantModal(false);
        await loadTenants();
        await loadParentTenants();
        return;
      }

      // Phase 2: Manual creation with hierarchy support
      // Exclude template_id as it's not a column in tenants table
      const { template_id, ...tenantDataWithoutTemplate } = tenantData;
      
      const insertData = {
        ...tenantDataWithoutTemplate,
        status: "active",
        subscription_plan: "professional",
        max_users: 25,
        max_projects: 50,
        is_active: true,
        tenant_level: tenantData.tenant_tier || 2,
        tenant_tier: tenantData.tenant_tier || 2,
        parent_tenant_id: tenantData.parent_tenant_id || null,
        can_have_children: tenantData.tenant_tier === 2,
        max_child_tenants: tenantData.tenant_tier === 2 ? 50 : 0,
        current_child_count: 0,
        settings: {},
        feature_flags: {},
        usage_quotas: {},
        rbac_settings: {},
      };

      console.log("Data to insert:", insertData);
      console.log("Making Supabase insert call...");

      const { data, error } = await supabase
        .from("tenants")
        .insert(insertData)
        .select();

      console.log("Supabase response - data:", data);
      console.log("Supabase response - error:", error);

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log(
        "Tenant created successfully, closing modal and reloading tenants...",
      );
      setShowCreateTenantModal(false);
      await loadTenants();
      await loadParentTenants(); // Reload parent list
      console.log("=== CREATE TENANT DEBUG END ====");
    } catch (error) {
      console.error("=== CREATE TENANT ERROR ====");
      console.error("Error creating tenant:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      console.error("=== CREATE TENANT ERROR END ====");
    }
  };

  // Helper function to open create modal with specific type
  const openCreateModal = (type: 'primary' | 'sub') => {
    setCreationType(type);
    setNewTenant({
      name: "",
      code: "",
      tenant_type: "",
      contact_email: "",
      parent_tenant_id: type === 'primary' ? undefined : newTenant.parent_tenant_id,
      tenant_tier: type === 'primary' ? 2 : 3,
      template_id: "",
    });
    setShowCreateTenantModal(true);
  };

  const filteredTenants = tenants.filter(
    (tenant: any) =>
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "host_admin":
        return "bg-red-100 text-red-800";
      case "program_manager":
        return "bg-blue-100 text-blue-800";
      case "client_admin":
        return "bg-green-100 text-green-800";
      case "client_user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || permissionsloading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">loading tenant management...</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Access Denied
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You do not have the required permissions to access this page.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Required permission: {PERMISSIONS.TENANT_READ}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-3 md:p-4 space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              Tenant Management
            </h1>
            <p className="text-sm md:text-base text-gray-600">Manage tenants and user assignments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => openCreateModal('primary')}
              className="w-full sm:w-auto"
            >
              <Building className="h-4 w-4 mr-2" />
              Create Primary Client
            </Button>
            <Button 
              onClick={() => openCreateModal('sub')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Create Sub-Client
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tenants List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Tenants ({filteredTenants.length})
              </CardTitle>
              <CardDescription>
                Select a tenant to manage its users
              </CardDescription>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTenants.map((tenant: any) => (
                  <div
                    key={tenant.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTenantId === tenant.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTenantId(tenant.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {tenant.name || "Unnamed Tenant"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Code: {tenant.code || "No code"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {tenant.tenant_type || "Unknown"}
                        </p>
                        {/* Phase 2: Show tier and hierarchy info */}
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            tenant.tenant_tier === 2 ? "bg-blue-100 text-blue-800" : 
                            tenant.tenant_tier === 3 ? "bg-purple-100 text-purple-800" : 
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {TenantHierarchyService.getTierName(tenant.tenant_tier)}
                          </span>
                          {tenant.current_child_count > 0 && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              {tenant.current_child_count} sub-client{tenant.current_child_count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${tenant.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {tenant.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tenant Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tenant Users
                {selectedTenantId && (
                  <Button
                    size="sm"
                    onClick={() => setShowAddUserModal(true)}
                    className="ml-auto"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {selectedTenantId
                  ? `Users assigned to ${tenants.find((t: any) => t.id === selectedTenantId)?.name || "selected tenant"}`
                  : "Select a tenant to view its users"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTenantId ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No users assigned to this tenant
                    </div>
                  ) : (
                    users.map((user: any) => (
                      <div
                        key={user.id}
                        className="p-2.5 border border-gray-200 rounded-lg space-y-2"
                      >
                        {/* User info */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {user.full_name || user.email}
                            </h4>
                            {user.full_name && (
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Added: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUserFromTenant(user.id)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                        
                        {/* Role management */}
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                          <span className="text-xs text-gray-600">Role:</span>
                          <span className={`${getRoleColor(user.role)} flex-shrink-0`}>
                            {user.role}
                          </span>
                          <select
                            value={user.role}
                            onChange={(e: any) =>
                              updateUserRole(user.id, e.target.value)
                            }
                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="host_admin">Host Admin</option>
                            <option value="program_manager">Program Manager</option>
                            <option value="client_admin">Client Admin</option>
                            <option value="client_user">Client User</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Select a tenant from the list to manage its users.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phase 2: Hierarchy Tree Visualization - Collapsible at bottom */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setHierarchyExpanded(!hierarchyExpanded)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Tenant Hierarchy
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                {hierarchyExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </CardTitle>
            <CardDescription>
              Visual representation of tenant relationships (click to {hierarchyExpanded ? 'collapse' : 'expand'})
            </CardDescription>
          </CardHeader>
          {hierarchyExpanded && (
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <TenantHierarchyTree
                  selectedTenantId={selectedTenantId}
                  onTenantSelect={(tenant) => setSelectedTenantId(tenant.id)}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Add User Modal */}
        <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Tenant</DialogTitle>
              <DialogDescription>
                Select a user and assign a role to add them to the current
                tenant.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="user-select" className="md:text-right">
                  User
                </Label>
                <div className="md:col-span-3">
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger id="user-select" className="w-full">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="role-select" className="md:text-right">
                  Role
                </Label>
                <div className="md:col-span-3">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger id="role-select" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="host_admin">Host Admin</SelectItem>
                      <SelectItem value="program_manager">Program Manager</SelectItem>
                      <SelectItem value="client_admin">Client Admin</SelectItem>
                      <SelectItem value="client_user">Client User</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() =>
                  addUserToTenant(selectedUserId as string, selectedRole)
                }
                disabled={!selectedUserId || !selectedRole}
              >
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Tenant Modal */}
        <Dialog
          open={showCreateTenantModal}
          onOpenChange={setShowCreateTenantModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {creationType === 'primary' 
                  ? 'Create New Primary Client (Customer Organization)'
                  : 'Create New Sub-Client (Department/Division)'}
              </DialogTitle>
              <DialogDescription>
                {creationType === 'primary'
                  ? 'Primary clients are top-level customer organizations that can have multiple sub-clients (departments, divisions, etc.)'
                  : 'Sub-clients are departments or divisions under a primary client. They inherit settings from their parent organization.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                <Label htmlFor="tenant-name" className="md:text-right">
                  Name *
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="tenant-name"
                    placeholder="e.g., Acme Corporation"
                    value={newTenant.name}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, name: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">The display name for this tenant</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                <Label htmlFor="tenant-code" className="md:text-right">
                  Code *
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="tenant-code"
                    placeholder="e.g., acme-corp"
                    value={newTenant.code}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, code: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, no spaces)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                <Label htmlFor="tenant-type" className="md:text-right">
                  Business Type
                </Label>
                <div className="md:col-span-3">
                  <Select
                    value={newTenant.tenant_type}
                    onValueChange={(value) =>
                      setNewTenant({ ...newTenant, tenant_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="nonprofit">Non-Profit</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="financial">Financial Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Optional: Industry or business category</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                <Label htmlFor="contact-email" className="md:text-right">
                  Contact Email *
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newTenant.contact_email}
                    onChange={(e) =>
                      setNewTenant({
                        ...newTenant,
                        contact_email: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary contact email for this tenant</p>
                </div>
              </div>
              {/* Phase 2: Parent selection - only show for sub-clients */}
              {creationType === 'sub' && (
                <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                  <Label htmlFor="parent-tenant" className="md:text-right">
                    Parent Primary Client *
                  </Label>
                  <div className="md:col-span-3">
                    <Select
                      value={newTenant.parent_tenant_id}
                      onValueChange={(value) =>
                        setNewTenant({ ...newTenant, parent_tenant_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent primary client" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentTenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name} ({tenant.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Select which primary client will manage this sub-client</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
                <Label htmlFor="template" className="md:text-right">
                  Template
                </Label>
                <div className="md:col-span-3">
                  <Select
                    value={newTenant.template_id}
                    onValueChange={(value) =>
                      setNewTenant({ ...newTenant, template_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (use default settings)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (default settings)</SelectItem>
                      {templates
                        .filter((t) => t.tenant_tier === newTenant.tenant_tier)
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Pre-configured settings for users, projects, and features</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => createTenant(newTenant)}>
                {creationType === 'primary' ? 'Create Primary Client' : 'Create Sub-Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

const selectedUserId = ""; // Placeholder for selected user ID
const setSelectedUserId = (id: string) => {}; // Placeholder for setSelectedUserId
const selectedRole = ""; // Placeholder for selected role
const setSelectedRole = (role: string) => {}; // Placeholder for setSelectedRole


