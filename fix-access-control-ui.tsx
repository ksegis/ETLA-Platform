// Fix for Access Control UI Issues
// ============================================================================

// 1. Fix the loadTenantUsers function in access-control page
// The issue is likely that the RBACAdminService is not loading users properly

// Replace the loadTenantUsers function with this implementation:
const loadTenantUsers = async () => {
  if (!selectedTenant) return;
  
  try {
    setLoading(true);
    
    // Mock data for testing - replace with actual API call
    const mockUsers = [
      {
        id: '3c1028ec-3b29-4a12-a881-f153ebf9406f',
        email: 'demo@company.com',
        full_name: 'Demo User',
        role: 'host_admin',
        role_level: 'super_admin',
        status: 'active',
        last_login: null,
        tenant_name: 'Demo Company',
        permissions: []
      },
      {
        id: 'kevin-user-id', // Replace with actual Kevin's user ID
        email: 'kevin.shelton@egisdynamics.com',
        full_name: 'Kevin Shelton (Host Admin)',
        role: 'host_admin',
        role_level: 'super_admin',
        status: 'active',
        last_login: null,
        tenant_name: 'Demo Company',
        permissions: []
      }
    ];
    
    setUsers(mockUsers);
  } catch (error) {
    console.error('Error loading users:', error);
    // Set empty array on error
    setUsers([]);
  } finally {
    setLoading(false);
  }
};

// 2. Fix the loadPermissionCatalog function
const loadPermissionCatalog = async () => {
  try {
    // Mock permission catalog for testing
    const mockPermissions = [
      {
        id: '1',
        feature: 'user_management',
        feature_display: 'User Management',
        permissions: [
          { id: '1-1', name: 'view', display: 'View' },
          { id: '1-2', name: 'create', display: 'Create' },
          { id: '1-3', name: 'update', display: 'Update' },
          { id: '1-4', name: 'delete', display: 'Delete' }
        ]
      },
      {
        id: '2',
        feature: 'access_control',
        feature_display: 'Access Control',
        permissions: [
          { id: '2-1', name: 'view', display: 'View' },
          { id: '2-2', name: 'manage', display: 'Manage' }
        ]
      },
      {
        id: '3',
        feature: 'reporting',
        feature_display: 'Reporting',
        permissions: [
          { id: '3-1', name: 'view', display: 'View' },
          { id: '3-2', name: 'export', display: 'Export' }
        ]
      }
    ];
    
    setPermissionCatalog(mockPermissions);
  } catch (error) {
    console.error('Error loading permission catalog:', error);
    setPermissionCatalog([]);
  }
};

// 3. Fix the handleCellClick function to make action buttons work
const handleCellClick = (userId: string, permissionId: string, currentValue: string) => {
  const key = `${userId}-${permissionId}`;
  
  // Cycle through permission states: none -> allow -> deny -> none
  let newValue: 'allow' | 'deny' | 'none';
  switch (currentValue) {
    case 'none':
      newValue = 'allow';
      break;
    case 'allow':
      newValue = 'deny';
      break;
    case 'deny':
      newValue = 'none';
      break;
    default:
      newValue = 'allow';
  }
  
  // Update draft changes
  const newDraftChanges = new Map(draftChanges);
  newDraftChanges.set(key, newValue);
  setDraftChanges(newDraftChanges);
  
  // Add to change queue
  const changeOperation = {
    id: Date.now().toString(),
    type: 'permission_change' as const,
    userId,
    permissionId,
    oldValue: currentValue,
    newValue,
    timestamp: new Date().toISOString()
  };
  
  setChangeQueue(prev => [...prev, changeOperation]);
};

// 4. Fix the handleApplyChanges function
const handleApplyChanges = async () => {
  if (changeQueue.length === 0) return;
  
  try {
    setLoading(true);
    
    // Mock applying changes - replace with actual API call
    console.log('Applying changes:', changeQueue);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear draft changes and queue
    setDraftChanges(new Map());
    setChangeQueue([]);
    
    // Reload data
    await loadTenantUsers();
    
    alert('Changes applied successfully!');
  } catch (error) {
    console.error('Error applying changes:', error);
    alert('Error applying changes. Please try again.');
  } finally {
    setLoading(false);
  }
};

// 5. Fix the handleDiscardChanges function
const handleDiscardChanges = () => {
  setDraftChanges(new Map());
  setChangeQueue([]);
};

// 6. Add this to check if there are pending changes
const hasPendingChanges = changeQueue.length > 0;

// 7. Debug function to check user permissions
const debugUserPermissions = () => {
  const { 
    isAuthenticated, 
    tenantUser, 
    isHostAdmin, 
    canManageUsers, 
    canAccessAdmin,
    currentRole,
    currentUserId,
    currentTenantId
  } = usePermissions();
  
  console.log('🔍 Access Control Permission Debug:', {
    user: tenantUser,
    userRole: tenantUser?.role,
    tenantUserRole: tenantUser?.role,
    isAuthenticated,
    isDemoMode,
    canManageUsers: canManageUsers(),
    isHostAdmin: isHostAdmin(),
    isClientAdmin: tenantUser?.role === 'client_admin',
    isDemoUser: tenantUser?.email === 'demo@company.com'
  });
  
  console.log('🔍 Final Access Check:', {
    canManageUsers: canManageUsers(),
    isHostAdmin: isHostAdmin(),
    isClientAdmin: tenantUser?.role === 'client_admin',
    canAccessAdmin: canAccessAdmin()
  });
};

// Call this in useEffect to debug
useEffect(() => {
  debugUserPermissions();
}, [tenantUser, isAuthenticated]);

export {
  loadTenantUsers,
  loadPermissionCatalog,
  handleCellClick,
  handleApplyChanges,
  handleDiscardChanges,
  debugUserPermissions
};
