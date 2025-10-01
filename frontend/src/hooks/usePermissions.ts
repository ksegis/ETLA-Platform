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
  PROJECT_CHARTER: 'project-charter',
  RESOURCE_MANAGEMENT: 'resource-management',
  ANALYTICS: 'analytics',
  MIGRATION_WORKBENCH: 'migration-workbench',
  FILE_UPLOAD: 'file-upload',
  DATA_VALIDATION: 'data-validation',
  BENEFITS_MANAGEMENT: 'benefits-management',
  EMPLOYEE_RECORDS: 'employee-records',
  PAYROLL_PROCESSING: 'payroll-processing',
  SYSTEM_SETTINGS: 'system-settings',
  AUDIT_LOGS: 'audit-logs',
  // Add other features here as needed
};

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  WORK_REQUESTS_CREATE: 'work_requests:create',
  WORK_REQUESTS_UPDATE: 'work_requests:update',
  WORK_REQUESTS_DELETE: 'work_requests:delete',
  MANAGE: 'manage',
  EXPORT: 'export',
  UPDATE: 'update',
  // Add other permissions here as needed
};

export const usePermissions = () => {
  const { currentUserRole, loading: isLoading } = useAuth();

  const isAdmin = (): boolean => {
    return currentUserRole === 'host_admin' || currentUserRole === 'tenant_admin';
  };

  const isHostAdmin = (): boolean => {
    return currentUserRole === 'host_admin';
  };

  const canManage = (feature: string): boolean => {
    if (!currentUserRole) {
      return false;
    }

    // Define permission logic based on roles and features
    switch (feature) {
      case FEATURES.TENANT_MANAGEMENT:
        return currentUserRole === 'host_admin';
      case FEATURES.USER_MANAGEMENT:
        return isAdmin();
      case FEATURES.TIMECARD_CORRECTION:
        return isAdmin() || currentUserRole === 'payroll_manager';
      case FEATURES.ACCESS_CONTROL:
        return isAdmin();
      case FEATURES.WORK_REQUESTS:
      case FEATURES.PROJECT_MANAGEMENT:
      case FEATURES.RISK_MANAGEMENT:
      case FEATURES.REPORTING:
      case FEATURES.DASHBOARDS:
      case FEATURES.PROJECT_CHARTER:
      case FEATURES.RESOURCE_MANAGEMENT:
      case FEATURES.ANALYTICS:
      case FEATURES.MIGRATION_WORKBENCH:
      case FEATURES.FILE_UPLOAD:
      case FEATURES.DATA_VALIDATION:
      case FEATURES.BENEFITS_MANAGEMENT:
      case FEATURES.EMPLOYEE_RECORDS:
      case FEATURES.PAYROLL_PROCESSING:
        return isAdmin() || currentUserRole === 'program_manager';
      case FEATURES.SYSTEM_SETTINGS:
      case FEATURES.AUDIT_LOGS:
        return isHostAdmin();
      // Add more cases for other features as needed
      default:
        return false;
    }
  };

  const canView = (feature: string): boolean => {
    // For now, assume if a user can manage a feature, they can also view it.
    // Or, implement specific view logic if needed.
    return canManage(feature);
  };

  const hasPermission = (feature: string, permission: string): boolean => {
    if (!currentUserRole) {
      return false;
    }

    // Example: A user with 'manage' permission for a feature can perform all actions (view, create, edit, delete, approve)
    if (permission === PERMISSIONS.MANAGE) {
      return canManage(feature);
    }

    // For other specific permissions, you might have more granular checks
    // For now, if a user can manage a feature, they have all permissions for it.
    // This can be expanded with more detailed permission logic if needed.
    return canManage(feature);
  };

  const canAccessFeature = (feature: string): boolean => {
    // A user can access a feature if they can view or manage it.
    return canView(feature) || canManage(feature);
  };

  return {
    currentRole: currentUserRole,
    isLoading,
    isAdmin,
    isHostAdmin,
    canManage,
    canView,
    hasPermission,
    canAccessFeature,
  };
};

