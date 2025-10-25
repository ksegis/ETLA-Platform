import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface UserDetailPanelProps {
  userId: string;
  tenantId: string;
  onClose: () => void;
  userDetail: any;
  loading: boolean;
  isHostAdmin: boolean;
  isAdmin: boolean;
}

export const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ 
  userId,
  tenantId,
  onClose, 
  userDetail, 
  loading,
  isHostAdmin,
  isAdmin 
}) => {
  if (loading) {
    return (
      <div className="w-96 border-l bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <div className="text-center py-8 text-gray-500">
          Loading user details...
        </div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="w-96 border-l bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <div className="text-center py-8 text-gray-500">
          No user details available
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-l bg-gray-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase">Email</label>
              <p className="text-sm font-medium">{userDetail.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Full Name</label>
              <p className="text-sm font-medium">
                {userDetail.profile?.full_name || userDetail.profile?.first_name && userDetail.profile?.last_name 
                  ? `${userDetail.profile.first_name} ${userDetail.profile.last_name}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Phone</label>
              <p className="text-sm font-medium">{userDetail.profile?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Status</label>
              <p className="text-sm">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  userDetail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {userDetail.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Role & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase">Role</label>
              <p className="text-sm font-medium capitalize">{userDetail.role?.replace('_', ' ') || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Permission Scope</label>
              <p className="text-sm font-medium capitalize">
                {userDetail.permission_scope?.replace('_', ' ') || 'Tenant Scope'}
              </p>
            </div>
            {userDetail.permissions && userDetail.permissions.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 uppercase">Active Permissions</label>
                <p className="text-sm text-gray-600">{userDetail.permissions.length} permissions granted</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Information */}
        {userDetail.tenant && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tenant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase">Tenant Name</label>
                <p className="text-sm font-medium">{userDetail.tenant.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Tenant Type</label>
                <p className="text-sm font-medium capitalize">
                  {userDetail.tenant.tenant_type?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Capabilities */}
        {(userDetail.can_invite_users || userDetail.can_manage_sub_clients) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Additional Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userDetail.can_invite_users && (
                <div className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  Can invite other users
                </div>
              )}
              {userDetail.can_manage_sub_clients && (
                <div className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  Can manage sub-clients
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="space-y-2">
            <Button variant="outline" className="w-full" size="sm">
              Edit User
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              Reset Password
            </Button>
            {isHostAdmin && (
              <Button variant="destructive" className="w-full" size="sm">
                Deactivate User
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

