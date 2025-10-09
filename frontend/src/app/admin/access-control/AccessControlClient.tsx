'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FEATURES, PERMISSIONS, ROLES } from '@/rbac/constants';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

/* ---------- FIXED dynamic imports ---------- */
// RBACMatrixGrid exports a *default*
const RBACMatrixGrid = dynamic(
  () => import('@/components/rbac/RBACMatrixGrid'),
  { ssr: false }
);

// RolesPermissionsTab also has a *default*
const RolesPermissionsTab = dynamic(
  () => import('@/components/rbac/RolesPermissionsTab'),
  { ssr: false }
);

// UserDetailPanel is a *named* export in your repo
const UserDetailPanel = dynamic(
  () => import('@/components/rbac/UserDetailPanel').then(m => m.UserDetailPanel as any),
  { ssr: false }
);
/* ------------------------------------------- */

export default function AccessControlClient() {
  const router = useRouter();

  const { user, isAuthenticated } = useAuth();
  const { checkPermission, currentUserRole, loading: permissionsLoading } = usePermissions();

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'invitations' | 'notifications'>('users');

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

  const currentUserId = user?.id ?? null;

  // prevent setState after unmount
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // compute once after perms ready; don't depend on function identity
  const canViewAccess = useMemo(() => {
    if (permissionsLoading) return false;
    try {
      return checkPermission(FEATURES.ACCESS_CONTROL, PERMISSIONS.VIEW);
    } catch {
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoading]);

  // initial load (run once)
  const initRan = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || permissionsLoading || initRan.current) return;

    if (!canViewAccess) {
      router.replace('/unauthorized');
      return;
    }

    initRan.current = true;

    const load = async () => {
      setLoading(true);
      try {
        const [fetchedTenants, fetchedCatalog] = await Promise.all([
          RBACAdminService.listTenants(),
          RBACAdminService.listPermissionCatalog(),
        ]);

        if (!mounted.current) return;

        setTenants(fetchedTenants);
        if (!selectedTenant && fetchedTenants.length > 0) {
          setSelectedTenant(fetchedTenants[0]);
        }
        setPermissionCatalog(fetchedCatalog);
      } catch (e) {
        console.error('AccessControl: initial load failed', e);
      } finally {
        mounted.current && setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, permissionsLoading, canViewAccess, router, selectedTenant]);

  // load tenant users (debounced)
  useEffect(() => {
    if (!selectedTenant) return;

    const controller = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { users: fetchedUsers } = await RBACAdminService.listTenantUsers(
          selectedTenant.id,
          { search: searchQuery }
        );

        if (!mounted.current || controller.signal.aborted) return;

        const userIds = fetchedUsers.map(u => u.userId);
        const effectivePermissions = await RBACAdminService.getEffectivePermissions(selectedTenant.id, userIds);

        if (!mounted.current || controller.signal.aborted) return;

        const withPerms = fetchedUsers.map(u => ({
          ...u,
          cells: effectivePermissions.get(u.userId) ?? [],
        }));

        setUsers(withPerms);
      } catch (e) {
        if (!controller.signal.aborted) {
          console.error('AccessControl: loadTenantUsers failed', e);
        }
      } finally {
        mounted.current && !controller.signal.aborted && setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [selectedTenant?.id, searchQuery]);

  // load selected user detail
  useEffect(() => {
    if (!selectedUserId || !selectedTenant) return;

    let cancelled = false;
    (async () => {
      setUserDetailLoading(true);
      try {
        const detail = await RBACAdminService.getUserDetail(selectedTenant.id, selectedUserId);
        if (!mounted.current || cancelled) return;
        setUserDetail(detail);
      } catch (e) {
        if (!cancelled) console.error('AccessControl: loadUserDetail failed', e);
      } finally {
        !cancelled && mounted.current && setUserDetailLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedUserId, selectedTenant?.id]);

  const handleCellClick = (userId: string, permissionId: string) => {
    const row = users.find(u => u.userId === userId);
    const currentCell = row?.cells?.find(c => c.permissionId === permissionId);
    const current = draftChanges.get(`${userId}:${permissionId}`) || currentCell?.state || 'none';

    const next: 'allow' | 'deny' | 'none' =
      current === 'allow' ? 'deny' : current === 'deny' ? 'none' : 'allow';

    const key = `${userId}:${permissionId}`;
    const nextDraft = new Map(draftChanges);
    if (next === 'none') nextDraft.delete(key);
    else nextDraft.set(key, next);
    setDraftChanges(nextDraft);

    setChangeQueue(prev => [
      ...prev,
      {
        id: `${Date.now()}`,
        type: 'permission_change',
        op: next === 'none' ? 'clearOverride' : 'setOverride',
        userId,
        permissionId,
        oldValue: current as 'allow' | 'deny' | 'none',
        newValue: next,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleApplyChanges = async () => {
    if (changeQueue.length === 0 || !selectedTenant || !currentUserId) return;

    setLoading(true);
    try {
      const req: RBACApplyChangesRequest = {
        tenantId: selectedTenant.id,
        actorUserId: currentUserId,
        changes: changeQueue,
      };
      await RBACAdminService.applyChanges(req);
      setDraftChanges(new Map());
      setChangeQueue([]);
      // refresh list
      setSearchQuery(q => q);
    } catch (e) {
      console.error('AccessControl: applyChanges failed', e);
    } finally {
      mounted.current && setLoading(false);
    }
  };

  const pendingChangesCount = draftChanges.size;

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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
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
                      const t = tenants.find(x => x.id === tenantId) || null;
                      setSelectedTenant(t);
                      setSelectedUserId(null);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
                  onUserClick={setSelectedUserId}
                  loading={loading}
                  draftChanges={draftChanges}
                />
                {pendingChangesCount > 0 && (
                  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-3 rounded-lg shadow-lg flex items-center space-x-4 z-50">
                    <span>{pendingChangesCount} pending changes</span>
                    <Button variant="secondary" onClick={() => { setDraftChanges(new Map()); setChangeQueue([]); }}>
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
            tenantId={selectedTenant?.id || ''}
            onClose={() => setSelectedUserId(null)}
            userDetail={userDetail}
            loading={userDetailLoading}
            isHostAdmin={currentUserRole === ROLES.HOST_ADMIN}
            isAdmin={currentUserRole === ROLES.HOST_ADMIN || currentUserRole === ROLES.CLIENT_ADMIN}
          />
        </div>
      )}
    </div>
  );
}
