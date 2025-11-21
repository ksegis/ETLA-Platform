'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
import { InvitationsTab } from '@/components/admin/InvitationsTab';
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

  const { user, isAuthenticated, tenantUser } = useAuth();
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

  // Check permission to access this page
  useEffect(() => {
    // Wait for permissions to load
    if (permissionsLoading) return;
    
    // If authenticated, wait for tenantUser to load before checking permissions
    if (isAuthenticated && !tenantUser) {
      console.log('⏳ Access Control: Waiting for tenantUser to load...');
      return;
    }
    
    const canAccess = checkPermission(FEATURES.ACCESS_CONTROL, PERMISSIONS.VIEW);
    
    if (!canAccess) {
      console.log('❌ Access Control: Permission denied, redirecting to /unauthorized');
      router.push('/unauthorized');
    } else {
      console.log('✅ Access Control: Permission granted');
    }
  }, [checkPermission, permissionsLoading, router, isAuthenticated, tenantUser]);

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

  // Load users - now loads ALL users across all tenants
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    setLoading(true);
    (async () => {
      try {
        // Get ALL users across all tenants (or filter by selected tenant)
        const result = selectedTenant 
          ? await RBACAdminService.listTenantUsers(selectedTenant.id, {
              search: searchQuery,
              limit: 200
            })
          : await RBACAdminService.listAllUsers({
              search: searchQuery,
              limit: 200
            });

        const allUsers = result?.users || [];

        if (allUsers.length === 0) {
          if (mounted.current) {
            setUsers([]);
          }
          return;
        }

        // Build matrix users with tenant info
        const matrixUsers: RBACMatrixRowUser[] = allUsers.map(user => {
          return {
            userId: user.userId,
            email: user.email,
            display_name: user.display_name || user.email,
            role: user.role,
            is_active: user.is_active,
            tenant_id: (user as any).tenant_id,
            tenant_name: (user as any).tenant_name,
            cells: [] // Permissions will be loaded on demand when user clicks
          };
        });

        if (mounted.current) {
          setUsers(matrixUsers);
        }
      } catch (e) {
        console.error('AccessControl: load matrix users failed', e);
        if (mounted.current) {
          setUsers([]);
        }
      } finally {
        mounted.current && setLoading(false);
      }
    })();
  }, [isAuthenticated, currentUserId, selectedTenant, searchQuery]);

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

    const currentPerm = currentUser.cells?.find((p) => p.permissionId === permissionId);
    if (!currentPerm) return;

    const currentValue = currentPerm.state;
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
    const changeOp: RBACChangeOperation = {
      id: `${userId}:${permissionId}:${Date.now()}`,
      type: 'permission_change',
      op: nextValue === 'none' ? 'clearOverride' : 'setOverride',
      userId,
      permissionId,
      oldValue: currentValue,
      newValue: nextValue,
      effect: nextValue === 'allow' ? 'allow' : 'deny'
    };
    if (existingIndex >= 0) {
      newQueue[existingIndex] = changeOp;
    } else {
      newQueue.push(changeOp);
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
    <DashboardLayout>
      <div className="flex h-full flex-col">
      {/* Fixed Header */}
      <div className="bg-white border-b p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Access Control &amp; Security</h1>
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
        
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px]"
          />
          <Select
            value={selectedTenant?.id || 'all'}
            onValueChange={(tenantId) => {
              const t = tenantId === 'all' ? null : tenants.find(x => x.id === tenantId) || null;
              setSelectedTenant(t);
              setSelectedUserId(null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Tenants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        <Card>
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
                <InvitationsTab 
                  selectedTenantId={selectedTenant?.id || null} 
                  isHostAdmin={isHostAdmin}
                />
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
    </DashboardLayout>
  );
}
