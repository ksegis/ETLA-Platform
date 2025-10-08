'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { RBACAdminService } from '@/services/rbac_admin_service';

import type {
  RBACMatrixRowUser,
  RBACPermissionCatalog,
  RBACUserDetail,
  RBACChangeOperation,
  RBACApplyChangesRequest,
} from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import RBACMatrixGrid from '@/components/rbac/RBACMatrixGrid';
import { FEATURES, PERMISSIONS, ROLES } from '@/rbac/constants';

// --- Dynamic children (works with default OR named exports) ---
const RolesPermissionsTab = dynamic(
  () =>
    import('@/components/rbac/RolesPermissionsTab').then((m: any) =>
      m?.default ? m.default : m.RolesPermissionsTab
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-lg border border-dashed grid place-items-center text-gray-500">
        Loading roles &amp; permissions…
      </div>
    ),
  }
);

const UserDetailPanel = dynamic(
  () =>
    import('@/components/rbac/UserDetailPanel').then((m: any) =>
      m?.default ? m.default : m.UserDetailPanel
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-sm text-gray-500">Loading user details…</div>
    ),
  }
);

export default function AccessControlClient() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { checkPermission, currentUserRole, loading: permissionsloading } = usePermissions();

  const [activeTab, setActiveTab] = useState('users');
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTenant, setSelectedTenant] = useState<{ id: string; name: string } | null>(null);

  const [users, setUsers] = useState<RBACMatrixRowUser[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<RBACPermissionCatalog[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<RBACUserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  const [draftChanges, setDraftChanges] = useState<Map<string, 'allow' | 'deny' | 'none'>>(new Map());
  const [changeQueue, setChangeQueue] = useState<RBACChangeOperation[]>([]);
  const currentUserId = user?.id;

  // Gate access & initial loads
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // When permissions are ready, block if not allowed
    if (!permissionsloading && !checkPermission(FEATURES.ACCESS_CONTROL, PERMISSIONS.VIEW)) {
      router.push('/unauthorized');
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
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) loadInitialData();
  }, [isAuthenticated, router, checkPermission, permissionsloading]);

  // Load users for selected tenant (and search)
  useEffect(() => {
    if (!selectedTenant) return;

    const loadTenantUsers = async (tenantId: string, search?: string) => {
      setLoading(true);
      try {
        const { users: fetchedUsers } = await RBACAdminService.listTenantUsers(tenantId, { search });
        // Get effective permissions for all users and merge
        const userIds = fetchedUsers.map((u: any) => u.userId);
        const effectivePermissions = await RBACAdminService.getEffectivePermissions(tenantId, userIds);

        const usersWithPermissions = fetchedUsers.map((u) => ({
          ...u,
          cells: effectivePermissions.get(u.userId) || [],
        }));

        setUsers(usersWithPermissions);
      } catch (err) {
        console.error('Error loading tenant users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTenantUsers(selectedTenant.id, searchQuery);
  }, [selectedTenant, searchQuery]);

  // Load selected user detail
  useEffect(() => {
    if (!selectedUserId || !selectedTenant) return;

    const loadUserDetail = async (tenantId: string, userId: string) => {
      setUserDetailLoading(true);
      try {
        const detail = await RBACAdminService.getUserDetail(tenantId, userId);
        setUserDetail(detail);
      } catch (err) {
        console.error('Error loading user detail:', err);
      } finally {
        setUserDetailLoading(false);
      }
    };

    loadUserDetail(selectedTenant.id, selectedUserId);
  }, [selectedUserId, selectedTenant]);

  // Cell toggle
  const handleCellClick = (userId: string, permissionId: string) => {
    const userToUpdate = users.find((u) => u.userId === userId);
    const currentCell = userToUpdate?.cells?.find((cell) => cell.permissionId === permissionId);
    const currentValue = draftChanges.get(`${userId}:${permissionId}`) || currentCell?.state || 'none';

    let newValue: 'allow' | 'deny' | 'none';
    switch (currentValue) {
      case 'allow':
        newValue = 'deny';
        break;
      case 'deny':
        newValue = 'none';
        break;
      default:
        newValue = 'allow';
    }

    const key = `${userId}:${permissionId}`;
    const nextDraft = new Map(draftChanges);
    if (newValue === 'none') nextDraft.delete(key);
    else nextDraft.set(key, newValue);
    setDraftChanges(nextDraft);

    const change: RBACChangeOperation = {
      id: `${Date.now()}`,
      type: 'permission_change',
      op: newValue === 'none' ? 'clearOverride' : 'setOverride',
      userId,
      permissionId,
      oldValue: currentValue as 'allow' | 'deny' | 'none',
      newValue,
      timestamp: new Date().toISOString(),
    };
    setChangeQueue((prev) => [...prev, change]);
  };

  const handleApplyChanges = async () => {
    if (changeQueue.length === 0 || !selectedTenant || !currentUserId) return;

    setLoading(true);
    try {
      const req: RBACApplyChangesRequest = {
        tenantId: selectedTenant.id,
        actorUserId: currentUserId as string,
        changes: changeQueue,
      };

      await RBACAdminService.applyChanges(req);

      // Clear drafts & reload
      setDraftChanges(new Map());
      setChangeQueue([]);

      // Reload users and detail
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      selectedTenant && setSearchQuery((q) => q); // trigger users effect by setting same query
      if (selectedUserId) {
        const detail = await RBACAdminService.getUserDetail(selectedTenant.id, selectedUserId);
        setUserDetail(detail);
      }
    } catch (err) {
      console.error('Error applying changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    setDraftChanges(new Map());
    setChangeQueue([]);
  };

  const pendingChangesCount = draftChanges.size;

  // UI
  if (permissionsloading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">loading permissions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Access Control &amp; Security
              <div className="flex space-x-2">
                <Button variant="outline">Invite User</Button>
                <Button>Create User</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
                  <TabsTrigger value="invitations">Invitations</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Search users…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px]"
                  />

                  <Select
                    value={selectedTenant?.id || ''}
                    onValueChange={(tenantId) => {
                      const t = tenants.find((x) => x.id === tenantId);
                      setSelectedTenant(t || null);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
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
                  onUserClick={(uid) => setSelectedUserId(uid)}
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

              <TabsContent value="invitations">Invitations content here.</TabsContent>
              <TabsContent value="notifications">Notifications content here.</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedUserId && (
        <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
          <UserDetailPanel
            userId={selectedUserId}
            tenantId={selectedTenant?.id || ''}
            onClose={() => setSelectedUserId(null)}
            userDetail={userDetail}
            loading={userDetailLoading}
            isHostAdmin={currentUserRole === ROLES.HOST_ADMIN}
            isAdmin={
              currentUserRole === ROLES.HOST_ADMIN || currentUserRole === ROLES.CLIENT_ADMIN
            }
          />
        </div>
      )}
    </div>
  );
}
