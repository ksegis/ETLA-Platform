import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { RBACAdminService } from '@/services/rbac_admin_service';
import { FEATURES, PERMISSIONS } from '@/hooks/usePermissions';

interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissionCount: number;
  userCount: number;
  permissions: Array<{
    feature: string;
    permission: string;
    granted: boolean;
  }>;
}

interface RolesPermissionsTabProps {
  selectedTenantId?: string;
}

export const RolesPermissionsTab: React.FC<RolesPermissionsTabProps> = ({ selectedTenantId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setloading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load roles data
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setloading(true);
    setError(null);
    
    try {
      // Get system roles with their permissions
      const systemRoles = [
        {
          id: 'host_admin',
          name: 'Host Admin',
          description: 'Full system administrator with all privileges',
          isSystemRole: true,
          permissionCount: 0,
          userCount: 0,
          permissions: Object.values(FEATURES).flatMap(feature => 
            Object.values(PERMISSIONS).map(permission => ({
              feature,
              permission,
              granted: true
            }))
          )
        },
        {
          id: 'client_admin',
          name: 'Client Admin',
          description: 'Tenant administrator with full tenant privileges',
          isSystemRole: true,
          permissionCount: 0,
          userCount: 0,
          permissions: Object.values(FEATURES).flatMap(feature => 
            Object.values(PERMISSIONS).map(permission => ({
              feature,
              permission,
              granted: feature !== 'tenant-management' && feature !== 'system-settings'
            }))
          )
        },
        {
          id: 'program_manager',
          name: 'Program Manager',
          description: 'Project and program management with team oversight',
          isSystemRole: true,
          permissionCount: 0,
          userCount: 0,
          permissions: Object.values(FEATURES).flatMap(feature => 
            Object.values(PERMISSIONS).map(permission => {
              const projectFeatures = ['project-management', 'work-requests', 'project-charter', 'risk-management', 'resource-management'];
              const reportingFeatures = ['reporting', 'dashboards', 'analytics'];
              
              if (projectFeatures.includes(feature)) {
                return { feature, permission, granted: ['view', 'create', 'update', 'manage'].includes(permission) };
              }
              if (reportingFeatures.includes(feature)) {
                return { feature, permission, granted: permission === 'view' };
              }
              if (feature === 'user-management') {
                return { feature, permission, granted: permission === 'view' };
              }
              return { feature, permission, granted: false };
            })
          )
        },
        {
          id: 'client_user',
          name: 'Client User',
          description: 'Standard user with basic access to work requests and reporting',
          isSystemRole: true,
          permissionCount: 0,
          userCount: 0,
          permissions: Object.values(FEATURES).flatMap(feature => 
            Object.values(PERMISSIONS).map(permission => {
              const userFeatures = ['work-requests', 'reporting', 'dashboards', 'benefits-management', 'file-upload'];
              
              if (feature === 'work-requests') {
                return { feature, permission, granted: ['view', 'create', 'update'].includes(permission) };
              }
              if (['reporting', 'dashboards', 'benefits-management'].includes(feature)) {
                return { feature, permission, granted: permission === 'view' };
              }
              if (feature === 'file-upload') {
                return { feature, permission, granted: permission === 'create' };
              }
              return { feature, permission, granted: false };
            })
          )
        }
      ];

      const rolesWithCounts = systemRoles.map(role => ({
        ...role,
        userCount: 0, // Hardcoded for debugging
        permissionCount: role.permissions.filter(p => p.granted).length
      }));

      setRoles(rolesWithCounts);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles data');
    } finally {
      setloading(false);
    }
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle role selection
  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
  };

  // Handle role creation
  const handleCreateRole = () => {
    alert('Custom role creation is not yet implemented. Currently using system-defined roles.');
  };

  // Handle role editing
  const handleEditRole = (roleId: string) => {
    if (roles.find(r => r.id === roleId)?.isSystemRole) {
      alert('System roles cannot be edited. You can create custom roles with specific permissions.');
    } else {
      alert(`Edit role ${roleId} functionality will be implemented in a future update.`);
    }
  };

  // Handle role deletion
  const handleDeleteRole = (roleId: string) => {
    if (roles.find(r => r.id === roleId)?.isSystemRole) {
      alert('System roles cannot be deleted.');
    } else {
      alert(`Delete role ${roleId} functionality will be implemented in a future update.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading Roles</h3>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Tenant</h3>
          <p className="text-gray-600">Please select a tenant to view roles and permissions.</p>
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
        {filteredRoles.map(role => (
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
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        System Role
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No roles are configured for this tenant.'}
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
              {/* Group permissions by feature */}
              {Object.values(FEATURES).map(feature => {
                const featurePermissions = selectedRole.permissions.filter(p => p.feature === feature);
                const grantedPermissions = featurePermissions.filter(p => p.granted);
                
                if (grantedPermissions.length === 0) return null;
                
                return (
                  <div key={feature} className="border-b border-gray-100 pb-3">
                    <h4 className="font-medium text-sm text-gray-900 mb-2 capitalize">
                      {feature.replace('-', ' ')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.values(PERMISSIONS).map(permission => {
                        const hasPermission = featurePermissions.find(p => 
                          p.permission === permission && p.granted
                        );
                        
                        return (
                          <div key={permission} className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600 capitalize">{permission}</span>
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
