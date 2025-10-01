"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FEATURES, usePermissions } from "@/hooks/usePermissions";
import { RBACAdminService } from "@/services/rbac_admin_service";
import {
  RBACMatrixRowUser,
  RBACPermissionCatalog,
  RBACUserDetail,
  RBACChangeOperation,
  RBACApplyChangesRequest,
} from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import RBACMatrixGrid from "@/components/rbac/RBACMatrixGrid";
import { RolesPermissionsTab } from "@/components/rbac/RolesPermissionsTab";
import { UserDetailPanel } from "@/components/rbac/UserDetailPanel";

export const dynamic = "force-dynamic";

export default function AccessControlPage() {
  const router = useRouter();
  const { user, tenantUser, isAuthenticated, tenant } = useAuth();
  const { canManage, currentRole } = usePermissions();

  const [activeTab, setActiveTab] = useState("users");
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [selectedTenant, setSelectedTenant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [users, setUsers] = useState<RBACMatrixRowUser[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<
    RBACPermissionCatalog[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<RBACUserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [draftChanges, setDraftChanges] = useState<
    Map<string, "allow" | "deny" | "none">
  >(new Map());
  const [changeQueue, setChangeQueue] = useState<RBACChangeOperation[]>([]);
  const currentUserId = user?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!canManage(FEATURES.ACCESS_CONTROL)) {
      router.push("/unauthorized");
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const fetchedTenants = await RBACAdminService.listTenants();
        setTenants(fetchedTenants);
        if (fetchedTenants.length > 0) {
          setSelectedTenant(fetchedTenants[0]);
        }

        const fetchedCatalog = await RBACAdminService.listPermissionCatalog();
        setPermissionCatalog(fetchedCatalog);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isAuthenticated, router, canManage]);

  useEffect(() => {
    if (selectedTenant) {
      loadTenantUsers(selectedTenant.id, searchQuery);
    }
  }, [selectedTenant, searchQuery]);

  useEffect(() => {
    if (selectedUserId && selectedTenant) {
      loadUserDetail(selectedTenant.id, selectedUserId);
    }
  }, [selectedUserId, selectedTenant]);

  const loadTenantUsers = async (tenantId: string, search?: string) => {
    setLoading(true);
    try {
      const { users: fetchedUsers } = await RBACAdminService.listTenantUsers(
        tenantId,
        { search },
      );
      setUsers(fetchedUsers);

      // Get effective permissions for all users
      const userIds = fetchedUsers.map((u: any) => u.userId);
      const effectivePermissions =
        await RBACAdminService.getEffectivePermissions(tenantId, userIds);

      // Merge effective permissions into user objects
      const usersWithPermissions = fetchedUsers.map((user) => ({
        ...user,
        cells: effectivePermissions.get(user.userId) || [],
      }));
      setUsers(usersWithPermissions);
    } catch (error) {
      console.error("Error loading tenant users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (tenantId: string, userId: string) => {
    setUserDetailLoading(true);
    try {
      const detail = await RBACAdminService.getUserDetail(tenantId, userId);
      setUserDetail(detail);
    } catch (error) {
      console.error("Error loading user detail:", error);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleCellClick = (userId: string, permissionId: string) => {
    // Determine the current effective state for this cell
    const userToUpdate = users.find((u) => u.userId === userId);
    const currentCell = userToUpdate?.cells?.find(
      (cell) => cell.permissionId === permissionId,
    );
    const currentValue =
      draftChanges.get(`${userId}:${permissionId}`) ||
      currentCell?.state ||
      "none";

    let newValue: "allow" | "deny" | "none";
    switch (currentValue) {
      case "allow":
        newValue = "deny";
        break;
      case "deny":
        newValue = "none";
        break;
      default:
        newValue = "allow";
    }

    // Update draft changes
    const key = `${userId}:${permissionId}`;
    const newDraftChanges = new Map(draftChanges);

    if (newValue === "none") {
      newDraftChanges.delete(key);
    } else {
      newDraftChanges.set(key, newValue);
    }

    setDraftChanges(newDraftChanges);

    // Add to change queue
    const changeOperation: RBACChangeOperation = {
      id: `${Date.now()}`,
      type: "permission_change",
      op: newValue === "none" ? "clearOverride" : "setOverride",
      userId,
      permissionId,
      oldValue: currentValue as "allow" | "deny" | "none",
      newValue,
      timestamp: new Date().toISOString(),
    };
    setChangeQueue((prev) => [...prev, changeOperation]);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleApplyChanges = async () => {
    if (changeQueue.length === 0 || !selectedTenant || !currentUserId) return;

    setLoading(true);
    try {
      const request: RBACApplyChangesRequest = {
        tenantId: selectedTenant.id,
        actorUserId: currentUserId as string, // Explicitly cast to string after null- to satisfy TypeScript
        changes: changeQueue,
      };

      await RBACAdminService.applyChanges(request); // Corrected method name

      // Clear draft changes and queue
      setDraftChanges(new Map());
      setChangeQueue([]);

      // Reload users and user detail to reflect changes
      loadTenantUsers(selectedTenant.id, searchQuery);
      if (selectedUserId) {
        loadUserDetail(selectedTenant.id, selectedUserId);
      }
    } catch (error) {
      console.error("Error applying changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    setDraftChanges(new Map());
    setChangeQueue([]);
  };

  const pendingChangesCount = draftChanges.size;

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Access Control & Security
              <div className="flex space-x-2">
                <Button variant="outline">Invite User</Button>
                <Button>Create User</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                  <TabsTrigger value="invitations">Invitations</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px]"
                  />
                  <Select
                    value={selectedTenant?.id || ""}
                    onValueChange={(tenantId) => {
                      const tenant = tenants.find((t) => t.id === tenantId);
                      setSelectedTenant(tenant || null);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="users">
                <RBACMatrixGrid
                  users={users}
                  permissionCatalog={permissionCatalog}
                  onCellClick={handleCellClick}
                  onUserClick={handleUserClick}
                  loading={loading}
                  draftChanges={draftChanges}
                />
                {pendingChangesCount > 0 && (
                  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-3 rounded-lg shadow-lg flex items-center space-x-4">
                    <span>{pendingChangesCount} pending changes</span>
                    <Button variant="secondary" onClick={handleDiscardChanges}>
                      Discard
                    </Button>
                    <Button onClick={handleApplyChanges}>Apply Changes</Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="roles">
                <RolesPermissionsTab selectedTenantId={selectedTenant?.id} />
              </TabsContent>
              <TabsContent value="invitations">
                Invitations content here.
              </TabsContent>
              <TabsContent value="notifications">
                Notifications content here.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      {selectedUserId && (
        <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
          <UserDetailPanel
            userId={selectedUserId}
            tenantId={selectedTenant?.id || ""}
            onClose={() => setSelectedUserId(null)}
            userDetail={userDetail}
            loading={userDetailLoading}
            isHostAdmin={currentRole === "host_admin"}
            isAdmin={
              currentRole === "host_admin" || currentRole === "tenant_admin"
            }
          />
        </div>
      )}
    </div>
  );
}
