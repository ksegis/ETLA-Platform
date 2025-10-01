import { useAuth } from '@/contexts/AuthContext';

export const FEATURES = {
  ACCESS_CONTROL: 'access_control',
  TENANT_MANAGEMENT: 'tenant-management',
  USER_MANAGEMENT: 'user-management',
  TIMECARD_CORRECTION: 'timecard-correction',
  WORK_REQUESTS: 'work-requests',
  PROJECT_MANAGEMENT: 'project-management',
  RISK_MANAGEMENT: 'risk-management',
  REPORTING: 'reporting',
  DASHBOARDS: 'dashboards',
  // Add other features here as needed
};

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  // Add other permissions here as needed
};

export const usePermissions = () => {
  const { currentUserRole, loading: isLoading } = useAuth();

  const canManage = (feature: string): boolean => {
    if (!currentUserRole) {
      return false;
    }

    // Define permission logic based on roles and features
    switch (feature) {
      case FEATURES.TENANT_MANAGEMENT:
        return currentUserRole === 'host_admin';
      case FEATURES.USER_MANAGEMENT:
        return currentUserRole === 'host_admin' || currentUserRole === 'tenant_admin';
      case FEATURES.TIMECARD_CORRECTION:
        return currentUserRole === 'host_admin' || currentUserRole === 'tenant_admin' || currentUserRole === 'payroll_manager';
      case FEATURES.ACCESS_CONTROL:
        return currentUserRole === 'host_admin' || currentUserRole === 'tenant_admin';
      case FEATURES.WORK_REQUESTS:
      case FEATURES.PROJECT_MANAGEMENT:
      case FEATURES.RISK_MANAGEMENT:
      case FEATURES.REPORTING:
      case FEATURES.DASHBOARDS:
        return currentUserRole === 'host_admin' || currentUserRole === 'tenant_admin' || currentUserRole === 'program_manager';
      // Add more cases for other features as needed
      default:
        return false;
    }
  };

  return {
    canManage,
    currentUserRole,
    isLoading,
  };
};

