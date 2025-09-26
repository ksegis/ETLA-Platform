import React from 'react';
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
  XCircle
} from 'lucide-react';

// Mock roles data
const mockRoles = [
  {
    id: '1',
    name: 'Host Admin',
    description: 'Full system administrator with all privileges',
    isSystemRole: true,
    permissionCount: 24,
    userCount: 1
  },
  {
    id: '2',
    name: 'Client Admin',
    description: 'Tenant administrator with full tenant privileges',
    isSystemRole: true,
    permissionCount: 18,
    userCount: 2
  },
  {
    id: '3',
    name: 'Manager',
    description: 'Department manager with team oversight privileges',
    isSystemRole: true,
    permissionCount: 12,
    userCount: 4
  },
  {
    id: '4',
    name: 'HR',
    description: 'Human resources with employee data access',
    isSystemRole: false,
    permissionCount: 8,
    userCount: 2
  },
  {
    id: '5',
    name: 'Employee',
    description: 'Standard employee with basic access',
    isSystemRole: true,
    permissionCount: 5,
    userCount: 10
  }
];

// Create the RolesPermissionsTab component
export const RolesPermissionsTab = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<any>(null);
  
  // Filter roles based on search term
  const filteredRoles = mockRoles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle role selection
  const handleRoleClick = (role: any) => {
    setSelectedRole(role);
  };
  
  // Handle role creation
  const handleCreateRole = () => {
    alert('Create role functionality would open a modal here');
  };
  
  // Handle role editing
  const handleEditRole = (roleId: string) => {
    alert(`Edit role ${roleId} functionality would open a modal here`);
  };
  
  // Handle role deletion
  const handleDeleteRole = (roleId: string) => {
    alert(`Delete role ${roleId} functionality would show a confirmation here`);
  };
  
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
              {/* Mock permissions list */}
              {[
                { name: 'View Users', granted: true },
                { name: 'Create Users', granted: selectedRole.name !== 'Employee' },
                { name: 'Update Users', granted: selectedRole.name !== 'Employee' },
                { name: 'Delete Users', granted: ['Host Admin', 'Client Admin'].includes(selectedRole.name) },
                { name: 'Manage Access Control', granted: ['Host Admin', 'Client Admin'].includes(selectedRole.name) },
                { name: 'View Reports', granted: true },
                { name: 'Export Data', granted: selectedRole.name !== 'Employee' },
                { name: 'Manage Tenants', granted: selectedRole.name === 'Host Admin' }
              ].map((permission, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm">{permission.name}</span>
                  {permission.granted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              ))}
              
              <Button className="w-full mt-4">
                Edit Permissions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RolesPermissionsTab;
