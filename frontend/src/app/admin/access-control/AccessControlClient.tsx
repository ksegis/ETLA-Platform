'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import user management modals
import UserInviteModal from '@/components/UserInviteModal';
import UserCreationModal from '@/components/UserCreationModal';

/* ---------- dynamic imports (typed) ---------- */
const RBACMatrixGrid = dynamic(
  () => import('@/components/rbac/RBACMatrixGrid'),
  { ssr: false }
);

type RolesPermissionsTabProps = { selectedTenantId?: string };
const RolesPermissionsTab = dynamic<RolesPermissionsTabProps>(
  () =>
    import('@/components/rbac/RolesPermissionsTab').then(
      (m) => (m.default || m.RolesPermissionsTab) as React.ComponentType<RolesPermissionsTabProps>
    ),
  { ssr: false }
);

type UserDetailPanelProps = {
  userId: string;
  tenantId: string;
  onClose: () => void;
  userDetail: RBACUserDetail | null;
  loading: boolean;
  isHostAdmin: boolean;
  isAdmin: boolean;
};
const UserDetailPanel = dynamic<UserDetailPanelProps>(
  () =>
    import('@/components/rbac/UserDetailPanel').then(
      (m) => (m.UserDetailPanel as React.ComponentType<UserDetailPanelProps>)
    ),
  { ssr: false }
);
/* -------------------------------------------- */

type TabKey = 'users' | 'roles' | 'invitations' | 'notifications';

export default function AccessControlClient() {
  const router = useRouter();

  const { user, isAuthenticated } = useAuth();
  const { checkPermission, currentUserRole, loading: permissionsLoading } = usePermissions();

  const [activeTab, setActiveTab] = useState<TabKey>('users');

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

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const currentUserId = user?.id ?? null;

  const isHostAdmin = useMemo(
    () => currentUserRole === ROLES.HOST_ADMIN,
    [currentUserRole]
  );

  const isAdmin = useMemo(
    () => currentUserRole === ROLES.HOST_ADMIN || currentUserRole === ROLES.CLIENT_ADMIN,
    [currentUserRole]
  );

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Check permission
  useEffect(() => {
    if (permissionsLoading) return;
    const canAccess = checkPermission(FEATURES.ACCESS_CONTROL, PERMISSIONS.VIEW);
    if (!canAccess) {
      router.push('/unauthorized');
    }
  }, [checkPermission, permissionsLoading, router]);

  // Load tenants
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    (async () => {
      try {
        const list = await RBACAdminService.listTenants();
        if (mounted.current) {
          setTenants(list);
          if (list.length > 0) {
            setSelectedTenant(list[0]);
          }
        }
      } catch (e) {
        console.error('AccessControl: load tenants failed', e);
      }
    })();
  }, [isAuthenticated, currentUserId]);

  // Load permission catalog
  useEffect(() => {
    if (!selectedTenant) return;
    (async () => {
      try {
        const catalog = await RBACAdminService.listPermissionCatalog();
        if (mounted.current) {
          setPermissionCatalog(catalog);
        }
      } catch (e) {
        console.error('AccessControl: load permission catalog failed', e);
      }
    })();
  }, [selectedTenant]);

  // Load users
  useEffect(() => {
    if (!selectedTenant) return;
    setLoading(true);
    (async () => {
      try {
        const matrixUsers = await RBACAdminService.getMatrixUsers(selectedTenant.id, searchQuery);
        if (mounted.current) {
          setUsers(matrixUsers);
        }
      } catch (e) {
        console.error('AccessControl: load matrix users failed', e);
      } finally {
        mounted.current && setLoading(false);
      }
    })();
  }, [selectedTenant, searchQuery]);

  // Load user detail when selected
  useEffect(() => {
    if (!selectedUserId || !selectedTenant) {
      setUserDetail(null);
      return;
    }
    setUserDetailLoading(true);
    (async () => {
      try {
        const detail = await RBACAdminService.getUserDetail(selectedTenant.id, selectedUserId);
        if (mounted.current) {
          setUserDetail(detail);
        }
      } catch (e) {
        console.error('AccessControl: load user detail failed', e);
      } finally {
        mounted.current && setUserDetailLoading(false);
      }
    })();
  }, [selectedUserId, selectedTenant]);

  const handleCellClick = (userId: string, permissionId: string) => {
    const key = `${userId}:${permissionId}`;
    const currentUser = users.find((u) => u.userId === userId);
    if (!currentUser) return;

    const currentPerm = currentUser.permissions.find((p) => p.permissionId === permissionId);
    if (!currentPerm) return;

    const currentValue = currentPerm.value;
    let nextValue: 'allow' | 'deny' | 'none';

    if (currentValue === 'allow') {
      nextValue = 'deny';
    } else if (currentValue === 'deny') {
      nextValue = 'none';
    } else {
      nextValue = 'allow';
    }

    const newDrafts = new Map(draftChanges);
    newDrafts.set(key, nextValue);
    setDraftChanges(newDrafts);

    const newQueue = [...changeQueue];
    const existingIndex = newQueue.findIndex(
      (op) => op.userId === userId && op.permissionId === permissionId
    );
    if (existingIndex >= 0) {
      newQueue[existingIndex] = { userId, permissionId, newValue: nextValue };
    } else {
      newQueue.push({ userId, permissionId, newValue: nextValue });
    }
    setChangeQueue(newQueue);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleApplyChanges = async () => {
    if (!selectedTenant || !currentUserId) return;

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
      setSearchQuery(q => q); // reload via effect
    } catch (e) {
      console.error('AccessControl: applyChanges failed', e);
    } finally {
      mounted.current && setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    // Reload users list after successful invitation
    setSearchQuery(q => q + ' '); // trigger reload
    setActiveTab('invitations'); // Switch to invitations tab to see the new invitation
  };

  const handleCreateSuccess = () => {
    // Reload users list after successful user creation
    setSearchQuery(q => q + ' '); // trigger reload
  };

  const pendingChangesCount = draftChanges.size;

  // Prepare tenants data for modals
  const tenantsForModal = tenants.map(t => ({
    id: t.id,
    name: t.name,
    code: t.id.substring(0, 8).toUpperCase(), // Generate a code from ID
    tenant_type: 'client' // Default type
  }));

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <CardTitle>Access Control &amp; Security</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInviteModal(true)}
                  >
                    Invite User
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create User
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
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
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v: string) => setActiveTab(v as TabKey)}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
                <TabsTrigger value="invitations">Invitations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                {selectedTenant && (
                  <div className="overflow-x-auto">
                    <RBACMatrixGrid
                      users={users}
                      permissionCatalog={permissionCatalog}
                      onCellClick={handleCellClick}
                      onUserClick={handleUserClick}
                      loading={loading}
                      draftChanges={draftChanges}
                    />
                  </div>
                )}
                {!selectedTenant && (
                  <div className="text-center py-8 text-gray-500">
                    Please select a tenant to view users
                  </div>
                )}
              </TabsContent>

              <TabsContent value="roles" className="space-y-4">
                {selectedTenant && (
                  <RolesPermissionsTab selectedTenantId={selectedTenant.id} />
                )}
                {!selectedTenant && (
                  <div className="text-center py-8 text-gray-500">
                    Please select a tenant to view roles and permissions
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invitations" className="space-y-4">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
                  <div className="text-center py-8 text-gray-500">
                    <p>No pending invitations at this time.</p>
                    <p className="text-sm mt-2">Invited users will appear here until they accept their invitation.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">System Notifications</h3>
                  <div className="text-center py-8 text-gray-500">
                    <p>No new notifications.</p>
                    <p className="text-sm mt-2">System notifications and audit logs will appear here.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {pendingChangesCount > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {pendingChangesCount} pending change{pendingChangesCount !== 1 ? 's' : ''}
              </span>
              <Button onClick={handleApplyChanges} disabled={loading}>
                Apply Changes
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedUserId && selectedTenant && (
        <UserDetailPanel
          userId={selectedUserId}
          tenantId={selectedTenant.id}
          onClose={() => setSelectedUserId(null)}
          userDetail={userDetail}
          loading={userDetailLoading}
          isHostAdmin={isHostAdmin}
          isAdmin={isAdmin}
        />
      )}

      {/* User Invite Modal */}
      <UserInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
        tenants={tenantsForModal}
      />

      {/* User Creation Modal */}
      <UserCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        tenants={tenantsForModal}
      />
    </div>
  );
}

