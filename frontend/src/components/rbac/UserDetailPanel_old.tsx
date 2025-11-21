import React from 'react';
import { Button } from '@/components/ui/Button';

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
      <div className="border-t bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">User Details</h2>
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
      <div className="border-t bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <div className="text-center py-8 text-gray-500">
          No user details available
        </div>
      </div>
    );
  }

  return (
    <div className="border-t bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">User Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>

      {/* Horizontal Grid Layout */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {/* Basic Information Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
          <div>
            <label className="text-xs text-gray-500 uppercase block">Email</label>
            <p className="text-sm font-medium mt-1">{userDetail.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase block">Full Name</label>
            <p className="text-sm font-medium mt-1">
              {userDetail.profile?.full_name || userDetail.profile?.first_name && userDetail.profile?.last_name 
                ? `${userDetail.profile.first_name} ${userDetail.profile.last_name}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase block">Phone</label>
            <p className="text-sm font-medium mt-1">{userDetail.profile?.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase block">Status</label>
            <p className="text-sm mt-1">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                userDetail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userDetail.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>

        {/* Role & Permissions Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Role & Permissions</h3>
          <div>
            <label className="text-xs text-gray-500 uppercase block">Role</label>
            <p className="text-sm font-medium mt-1 capitalize">{userDetail.role?.replace('_', ' ') || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase block">Permission Scope</label>
            <p className="text-sm font-medium mt-1 capitalize">
              {userDetail.permission_scope?.replace('_', ' ') || 'Tenant Scope'}
            </p>
          </div>
          {userDetail.permissions && userDetail.permissions.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 uppercase block">Active Permissions</label>
              <p className="text-sm text-gray-600 mt-1">{userDetail.permissions.length} permissions granted</p>
            </div>
          )}
        </div>

        {/* Tenant Information Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Tenant</h3>
          {userDetail.tenant ? (
            <>
              <div>
                <label className="text-xs text-gray-500 uppercase block">Tenant Name</label>
                <p className="text-sm font-medium mt-1">{userDetail.tenant.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block">Tenant Type</label>
                <p className="text-sm font-medium mt-1 capitalize">
                  {userDetail.tenant.tenant_type?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No tenant assigned</p>
          )}
          
          {/* Additional Capabilities */}
          {(userDetail.can_invite_users || userDetail.can_manage_sub_clients) && (
            <div className="pt-2">
              <label className="text-xs text-gray-500 uppercase block mb-2">Capabilities</label>
              {userDetail.can_invite_users && (
                <div className="flex items-center text-sm mb-1">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-xs">Can invite users</span>
                </div>
              )}
              {userDetail.can_manage_sub_clients && (
                <div className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-xs">Can manage sub-clients</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Column */}
        {isAdmin && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Actions</h3>
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
          </div>
        )}
      </div>
    </div>
  );
};

