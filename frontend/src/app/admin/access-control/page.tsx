'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { useEffect, useState, useMemo } from 'react';
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
import { FEATURES, PERMISSIONS, ROLES } from '@/rbac/constants';

// -- IMPORTANT: dynamically import client-only RBAC components (no SSR) --
const RBACMatrixGrid = dynamic(
  () => import('@/components/rbac/RBACMatrixGrid'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-lg border border-dashed grid place-items-center text-gray-500">
        Loading permissions matrix…
      </div>
    ),
  }
);

const RolesPermissionsTab = dynamic(
  () =>
    import('@/components/rbac/RolesPermissionsTab').then(
      (m) => m.default ?? m.RolesPermissionsTab
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-lg border border-dashed grid place-items-center text-gray-500">
        Loading roles & permissions…
      </div>
    ),
  }
);

const UserDetailPanel = dynamic(
  () =>
    import('@/components/rbac/UserDetailPanel').then(
      (m) => m.default ?? m.UserDetailPanel
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-sm text-gray-500">Loading user details…</div>
    ),
  }
);

export default function AccessControlPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    checkPermission,
    currentUserRole,
    loading: permissionsloading,
  } = usePermissions();

  const [activeTab, setActiveTab] = useState('users');

  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedTenant, setSelectedTenant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [users, setUsers] = useState<RBACMatrixRowUser[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<
    RBACPermissionCatalog[]
  >([]);

  const [loading, setloading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<RBACUserDetail | null>(null);
  const [userDetailloading, setUserDetailloading] = useState(false);

  const [draftChanges, setDraftChanges] = useState<
    Map<string, 'allow' | 'deny' | 'none'>
  >(new Map());
  const [changeQueue, setChangeQueue] = useState<RBACChangeOperation[]>([]);

  const currentUserId = user?.id ?? null;

  // Gate route access & load initial data only after permissions are known
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (permissionsloading) return;

    if (!checkPermission(FEATURES.ACCESS_CONTROL, PERMISSIONS.VIEW)) {
      router.replace('/unauthorized');
      return;
    }

    const loadInitial = async () => {
      setloading(true);
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
        setloading(false);
      }
    };

    loadInitial();
  }, [isAuthenticated, permissionsloading, checkPermission, router]);

  // Load users list for tenant + search
  useEffect(() => {
    if (!selectedTenant) return;
    void loadTenantUsers(selectedTenant.id, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenant, searchQuery]);

  // Load user detail when a row is selected
  useEffect(() => {
    if (!selectedUserId || !selectedTenant) return;
    void loadUserDetail(selectedTenant.id, selectedUserId);
  }, [selectedUserId, selectedTenant]);

  const loadTenantUsers = async (tenantId: string, search?: string) => {
    setloading(true);
    try {
      const { users: fetchedUsers } = await RBACAdminService.listTenantUsers(
        tenantId,
        { search }
      );

      // fetch effective permissions for all listed users
      const userIds = fetchedUsers.map((u) => u.userId);
      const effective = await RBACAdminService.getEffectivePermissions(
        tenantId,
        userIds
      );

      // merge effective perms into rows
      const merged = fetchedUsers.map((u) => ({
        ...u,
        cells: effective.get(u.userId) || [],
      }));

      setUsers(merged);
    } catch (err) {
      console.error('Error loading tenant users:', err);
    } finally {
      setloading(false);
    }
  };

  const loadUserDetail = async (tenantId: string, userId: string) => {
    setUserDetailloading(true);
    try {
      const detail = await RBACAdminService.getUserDetail(tenantId, userId);
      setUserDetail(detail);
    } catch (err) {
      console.error('Error loading user detail:', err);
    } finally {
      setUserDetailloading(false);
    }
  };

  const handleCellClick = (userId: string, permissionId: string) => {
    const row = users.find((u) => u.userId === userId);
    const currentCell = row?.cells?.find((c) => c.permissionId === permissionId);
    const currentValue =
      draftChanges.get(`${userId}:${permissionId}`) ||
      currentCell?.state ||
      'none';

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
    const next = new Map(draftChanges);
    if (newValue === 'none') next.delete(key);
    else next.set(key, newValue);
    setDraftChanges(next);

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

  const handleUserClick = (userId: string) => setSelectedUserId(userId);

  const handleApplyChanges = async () => {
    if (changeQueue.length === 0 || !selectedTenant || !currentUserId) return;
    setloading(true);
    try {
      const request: RBACApplyChangesRequest = {
        tenantId: selectedTenant.id,
        actorUserId: currentUserId,
        changes: changeQueue,
      };
      await RBACAdminService.applyChanges(request);

      // reset UI
      setDraftChanges(new Map());
      setChangeQueue([]);

      // refresh data
      await loadTenantUsers(selectedTenant.id, searchQuery);
      if (selectedUserId) {
        await loadUserDetail(selectedTenant.id, selectedUserId);
      }
    } catch (err) {
      console.error('Error applying changes:', err);
    } finally {
      setloading(false);
    }
  };

  const handleDiscardChanges = () => {
    setDraftChanges(new Map());
    setChangeQueue([]);
  };

  const pendingChangesCount = draftChanges.size;

  // show a lightweight gate while we don't know perms yet
  if (permissionsloading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          loading permissions…
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
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px]"
                  />

                  <Select
                    value={selectedTenant?.id || ''}
                    onValueChange={(tenantId) => {
                      const t = tenants.find((x) => x.id === tenantId) || null;
                      setSelectedTenant(t);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
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
            loading={userDetailloading}
            isHostAdmin={currentUserRole === ROLES.HOST_ADMIN}
            isAdmin={
              currentUserRole === ROLES.HOST_ADMIN ||
              currentUserRole === ROLES.CLIENT_ADMIN
            }
          />
        </div>
      )}
    </div>
  );
}
