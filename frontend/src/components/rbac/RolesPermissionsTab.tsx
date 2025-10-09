'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Users,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import {
  FEATURES,
  PERMISSIONS,
  type Feature,
  type Permission,
} from '@/rbac/constants';

type RolePermission = {
  feature: Feature;
  permission: Permission;
  granted: boolean;
};

type UiRole = {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissionCount: number;
  userCount: number;
  permissions: RolePermission[];
};

interface RolesPermissionsTabProps {
  selectedTenantId?: string;
}

/* ---------- helpers ---------- */

const ALL_FEATURES = Object.values(FEATURES) as Feature[];
const UNIQUE_PERMISSIONS = Array.from(
  new Set(Object.values(PERMISSIONS))
) as Permission[];

const getExistingFeatures = (keys: string[]): Feature[] =>
  keys
    .map((k) => (FEATURES as any)[k])
    .filter(Boolean) as Feature[];

const PROJECT_FEATURES = getExistingFeatures([
  'PROJECT_MANAGEMENT',
  'WORK_REQUESTS',
  'PROJECT_CHARTER', // guarded by getExistingFeatures
  'RISK_MANAGEMENT',
  'RESOURCE_MANAGEMENT',
]);

const REPORTING_FEATURES = getExistingFeatures([
  'REPORTING',
  'DASHBOARDS',
  'ANALYTICS',
]);

const labelize = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const RolesPermissionsTab: React.FC<RolesPermissionsTabProps> = ({
  selectedTenantId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UiRole | null>(null);
  const [roles, setRoles] = useState<UiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildRole = (
    id: string,
    name: string,
    description: string,
    grant: (feature: Feature, permission: Permission) => boolean,
    isSystemRole = true
  ): UiRole => {
    const permissions: RolePermission[] = ALL_FEATURES.flatMap((feature) =>
      UNIQUE_PERMISSIONS.map((permission) => ({
        feature,
        permission,
        granted: grant(feature, permission),
      }))
    );
    return {
      id,
      name,
      description,
      isSystemRole,
      permissionCount: permissions.filter((p) => p.granted).length,
      userCount: 0,
      permissions,
    };
  };

  const loadRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const hostAdmin = buildRole(
        'host_admin',
        'Host Admin',
        'Full system administrator with all privileges',
        () => true
      );

      const clientAdmin = buildRole(
        'client_admin',
        'Client Admin',
        'Tenant administrator with full tenant privileges',
        (feature) =>
          feature !== (FEATURES as any).TENANT_MANAGEMENT &&
          feature !== (FEATURES as any).SYSTEM_SETTINGS
      );

      const programManager = buildRole(
        'program_manager',
        'Program Manager',
        'Project and program management with team oversight',
        (feature, permission) => {
          if (PROJECT_FEATURES.includes(feature)) {
            return (
              permission === PERMISSIONS.MANAGE ||
              permission === PERMISSIONS.VIEW ||
              permission === PERMISSIONS.CREATE ||
              permission === PERMISSIONS.UPDATE
            );
          }
          if (REPORTING_FEATURES.includes(feature)) {
            return permission === PERMISSIONS.VIEW;
          }
          if (feature === (FEATURES as any).USER_MANAGEMENT) {
            return permission === PERMISSIONS.VIEW;
          }
          if (
            feature === (FEATURES as any).MIGRATION_WORKBENCH ||
            feature === (FEATURES as any).DATA_VALIDATION
          ) {
            return permission === PERMISSIONS.VIEW;
          }
          return false;
        }
      );

      const clientUser = buildRole(
        'client_user',
        'Client User',
        'Standard user with basic access to work requests and reporting',
        (feature, permission) => {
          if (feature === (FEATURES as any).WORK_REQUESTS) {
            return (
              permission === PERMISSIONS.VIEW ||
              permission === PERMISSIONS.CREATE ||
              permission === PERMISSIONS.UPDATE
            );
          }
          if (
            feature === (FEATURES as any).REPORTING ||
            feature === (FEATURES as any).DASHBOARDS ||
            feature === (FEATURES as any).BENEFITS_MANAGEMENT
          ) {
            return permission === PERMISSIONS.VIEW;
          }
          if (feature === (FEATURES as any).FILE_UPLOAD) {
            return permission === PERMISSIONS.CREATE;
          }
          if (
            feature === (FEATURES as any).ACCESS_CONTROL ||
            feature === (FEATURES as any).USER_MANAGEMENT
          ) {
            return permission === PERMISSIONS.VIEW;
          }
          return false;
        }
      );

      setRoles([hostAdmin, clientAdmin, programManager, clientUser]);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleClick = (role: UiRole) => setSelectedRole(role);

  const handleCreateRole = () => {
    alert(
      'Custom role creation is not yet implemented. Currently using system-defined roles.'
    );
  };

  const handleEditRole = (roleId: string) => {
    const r = roles.find((x) => x.id === roleId);
    if (!r) return;
    if (r.isSystemRole) {
      alert(
        'System roles cannot be edited. You can create custom roles with specific permissions.'
      );
    } else {
      alert(`Edit role ${roleId} coming soon.`);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    const r = roles.find((x) => x.id === roleId);
    if (!r) return;
    if (r.isSystemRole) {
      alert('System roles cannot be deleted.');
    } else {
      alert(`Delete role ${roleId} coming soon.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">loading roles and permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading Roles
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadRoles}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!selectedTenantId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Tenant
          </h3>
          <p className="text-gray-600">
            Please select a tenant to view roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search roles..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Roles list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRoles.map((role) => (
          <Card
            key={role.id}
            className={`cursor-pointer hover:border-blue-300 transition-colors ${
              selectedRole?.id === role.id ? 'border-blue-500' : ''
            }`}
            onClick={() => handleRoleClick(role)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium">{role.name}</h3>
                    {role.isSystemRole && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        System Role
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {role.description}
                  </p>

                  <div className="flex space-x-4 mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-1" />
                      {role.permissionCount} permissions
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {role.userCount} users
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRole(role.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!role.isSystemRole && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No roles found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms.'
              : 'No roles are configured for this tenant.'}
          </p>
        </div>
      )}

      {/* Selected role details */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Permissions for {selectedRole.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ALL_FEATURES.map((feature) => {
                const featurePermissions = selectedRole.permissions.filter(
                  (p) => p.feature === feature
                );
                const granted = featurePermissions.filter((p) => p.granted);
                if (granted.length === 0) return null;

                return (
                  <div key={feature} className="border-b border-gray-100 pb-3">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">
                      {labelize(feature)}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {UNIQUE_PERMISSIONS.map((permission) => {
                        const hasPermission = featurePermissions.some(
                          (p) => p.permission === permission && p.granted
                        );
                        return (
                          <div
                            key={`${feature}-${permission}`}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-xs text-gray-600 capitalize">
                              {permission}
                            </span>
                            {hasPermission ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => handleEditRole(selectedRole.id)}
                >
                  {selectedRole.isSystemRole ? 'View Details' : 'Edit Permissions'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RolesPermissionsTab;
