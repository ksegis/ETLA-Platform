"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/Badge";
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
} from "lucide-react";
import { Tenant, User } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PERMISSIONS } from "@/lib/rbac";

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
  created_at: string;
}

export default function TenantManagementPage() {
  const { user, tenantUser, isAuthenticated } = useAuth();
  const { checkPermission, loading: permissionsLoading } = usePermissions();
  const [tenants, setTenants] = useState<ExtendedTenant[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);

  const hasAdminAccess = checkPermission(PERMISSIONS.TENANT_READ);

  useEffect(() => {
    if (isAuthenticated && hasAdminAccess) {
      loadTenants();
      loadAllUsers();
    } else {
      setLoading(false);
    }
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

  const loadAllUsers = async () => {
    try {
      console.log("Attempting to load all users...");
      const { data, error } = await supabase
        .from("auth.users")
        .select("id, email, created_at")
        .order("email");

      if (error) {
        console.error("Error loading all users:", error);
        throw error;
      }
      setAllUsers(data || []);
      console.log("All users loaded successfully:", data);
    } catch (error) {
      console.error("Caught error loading all users:", error);
    }
  };

  const loadTenantUsers = async (tenantId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tenant_users")
        .select(
          `
          id,
          user_id,
          tenant_id,
          role,
          is_active,
          created_at
        `,
        )
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tenantUsersWithEmails = await Promise.all(
        (data || []).map(async (tu: any) => {
          const { data: userData } = await supabase
            .from("auth.users")
            .select("email")
            .eq("id", tu.user_id)
            .single();

          return {
            ...tu,
            email: userData?.email || "Unknown",
          };
        }),
      );

      setUsers(tenantUsersWithEmails);
    } catch (error) {
      console.error("Error loading tenant users:", error);
    } finally {
      setLoading(false);
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
  }) => {
    console.log("=== CREATE TENANT DEBUG START ===");
    console.log("Input tenantData:", tenantData);

    try {
      const insertData = {
        ...tenantData,
        status: "active",
        subscription_plan: "professional",
        max_users: 25,
        max_projects: 50,
        is_active: true,
        tenant_level: 1,
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
      console.log("=== CREATE TENANT DEBUG END ===");
    } catch (error) {
      console.error("=== CREATE TENANT ERROR ===");
      console.error("Error creating tenant:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      console.error("=== CREATE TENANT ERROR END ===");
    }
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

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenant management...</p>
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
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tenant Management
            </h1>
            <p className="text-gray-600">Manage tenants and user assignments</p>
          </div>
          <Button onClick={() => setShowCreateTenantModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tenant
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="text-center py-4">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No users assigned to this tenant
                    </div>
                  ) : (
                    users.map((user: any) => (
                      <div
                        key={user.id}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {user.email}
                            </h4>
                            <p className="text-sm text-gray-500">
                              User ID: {user.user_id.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-500">
                              Added:{" "}
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={getRoleColor(user.role)}>
                              {user.role}
                            </span>
                            <select
                              value={user.role}
                              onChange={(e: any) =>
                                updateUserRole(user.id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="host_admin">Host Admin</option>
                              <option value="program_manager">
                                Program Manager
                              </option>
                              <option value="client_admin">Client Admin</option>
                              <option value="client_user">Client User</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Select a tenant to view its users
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showAddUserModal && (
          <AddUserToTenantModal
            allUsers={allUsers}
            onClose={() => setShowAddUserModal(false)}
            onAddUser={addUserToTenant}
          />
        )}

        {showCreateTenantModal && (
          <CreateTenantModal
            onClose={() => setShowCreateTenantModal(false)}
            onCreateTenant={createTenant}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function AddUserToTenantModal({ allUsers, onClose, onAddUser }: any) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("client_user");

  const handleSubmit = () => {
    if (selectedUserId) {
      onAddUser(selectedUserId, role);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User to Tenant</DialogTitle>
          <DialogDescription>
            Select a user and assign a role within this tenant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="user-select">User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="role-select">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="host_admin">Host Admin</SelectItem>
                <SelectItem value="program_manager">Program Manager</SelectItem>
                <SelectItem value="client_admin">Client Admin</SelectItem>
                <SelectItem value="client_user">Client User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateTenantModal({ onClose, onCreateTenant }: any) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [tenantType, setTenantType] = useState("standard");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmit = () => {
    onCreateTenant({ name, code, tenant_type: tenantType, contact_email: contactEmail });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription>
            Enter the details for the new tenant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="tenant-name">Tenant Name</Label>
            <Input
              id="tenant-name"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="e.g., Acme Corporation"
            />
          </div>
          <div>
            <Label htmlFor="tenant-code">Tenant Code</Label>
            <Input
              id="tenant-code"
              value={code}
              onChange={(e: any) => setCode(e.target.value)}
              placeholder="e.g., ACME"
            />
          </div>
          <div>
            <Label htmlFor="tenant-type">Tenant Type</Label>
            <Select value={tenantType} onValueChange={setTenantType}>
              <SelectTrigger id="tenant-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e: any) => setContactEmail(e.target.value)}
              placeholder="e.g., admin@acme.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Tenant</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

