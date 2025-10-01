import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { currentUserRole } = useAuth();

  const canManage = (feature: string): boolean => {
    if (!currentUserRole) {
      return false;
    }

    // Define permission logic based on roles and features
    switch (feature) {
      case 'tenant-management':
        return currentUserRole === 'host_admin';
      case 'user-management':
        return currentUserRole === 'host_admin' || currentUserRole === 'tenant_admin';
      case 'timecard-correction':
        return currentUserRole === 'host_admin' || currentUserRole === 'tenant_admin' || currentUserRole === 'payroll_manager';
      // Add more cases for other features as needed
      default:
        return false;
    }
  };

  return {
    canManage,
    currentUserRole,
  };
};
